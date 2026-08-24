import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

import { PluggyClient } from 'pluggy-sdk';
import b3AnalysisRouter from "./src/routes/b3Analysis";
import { withGeminiRetry } from "./src/lib/geminiRetry";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use("/api/b3", b3AnalysisRouter);

// Lazy load Gemini
let genAI: GoogleGenAI | null = null;
function getGemini() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// Lazy load Pluggy
let pluggyClient: PluggyClient | null = null;
function getPluggy() {
  if (!pluggyClient) {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET are required");
    }
    pluggyClient = new PluggyClient({
      clientId,
      clientSecret,
    });
  }
  return pluggyClient;
}

// API Routes
app.get("/api/pluggy/connect-token", async (req, res) => {
  try {
    const pluggy = getPluggy();
    const token = await pluggy.createConnectToken();
    res.json({ accessToken: token.accessToken });
  } catch (error: any) {
    console.error("Pluggy Create Token Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pluggy/accounts", async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId is required" });
    const pluggy = getPluggy();
    const accounts = await pluggy.fetchAccounts(itemId);
    
    // Convert to our format
    res.json({ accounts: accounts.results });
  } catch (error: any) {
    console.error("Pluggy Fetch Accounts Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pluggy/sync", async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId is required" });
    const pluggy = getPluggy();
    
    // Fetch all accounts connected to this item/bank connection
    const accountsResponse = await pluggy.fetchAccounts(itemId);
    const accounts = accountsResponse.results || [];
    
    let allTransactions: any[] = [];
    
    // For each account, fetch recent transactions
    for (const account of accounts) {
      try {
        const transactionsResponse = await pluggy.fetchTransactions(account.id);
        const txs = (transactionsResponse.results || []).map((tx: any) => ({
          ...tx,
          accountName: account.name,
          accountType: account.type,
          bankName: account.marketingName || account.name || "Connected Bank"
        }));
        allTransactions.push(...txs);
      } catch (txErr) {
        console.error(`Error fetching transactions for account ${account.id}:`, txErr);
      }
    }
    
    res.json({
      accounts,
      transactions: allTransactions
    });
  } catch (error: any) {
    console.error("Pluggy Sync Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/tasks-suggestions", async (req, res) => {
  try {
    const { tasks, taskLists, expenses, profile } = req.body;
    const ai = getGemini();

    const systemInstruction = `
      Você é o Tarflow Inteligência Artificial, um consultor de produtividade extrema e especialista financeiro.
      Analise a lista de tarefas atual do usuário (algumas são pagamentos de contas, contêm valores em dinheiro 'amount', etc), as listas de tarefas, o histórico de despesas e as informações do perfil (renda, profissão) se disponíveis.
      
      Detecte proativamente:
      1. Conflitos de Agenda/Prazo: Várias tarefas críticas no mesmo dia ou tarefas vencidas.
      2. Conflitos Financeiros/Orçamentários: Tarefas que são contas com valores ('isPayment' = true e 'amount' de valor alto), alertando se acumularem próximo de datas de despesas recorrentes ou se ficarem acima do perfil financeiro.
      3. Inconsistência de Prioridade: Tarefas de pagamento críticos de contas próximas marcadas como prioridade baixa ou média, ou tarefas fáceis ocupando toda a prioridade alta.
      4. Recomendações de Distribuição: Sugira dias melhores para reagendamento se houver sobrecarga.
      
      IMPORTANTE: Você é direto, analítico e fala em Português do Brasil (pt-BR).
      Você DEVE responder ESTRITAMENTE em formato JSON que obedeça ao seguinte formato:
      {
        "overview": "Texto explicativo curto em Markdown (máximo 4 linhas ou bullets curtos) focando no diagnóstico das tarefas e finanças.",
        "suggestions": [
          {
            "id": "sug_id_unco",
            "taskId": "id_da_tarefa_opcional_se_relacionado_com_tarefa_existente",
            "type": "prioritize" | "schedule" | "conflict" | "general",
            "taskTitle": "Título da tarefa relacionada se houver",
            "title": "Recomendação (ex: Reajustar prioridade de conta)",
            "description": "Descrição perspicaz e acionável ensinando o motivo e o benefício de mudar isso.",
            "suggestedPriority": "baixa" | "media" | "alta" (opcional),
            "suggestedDate": "YYYY-MM-DD" (opcional)
          }
        ],
        "metrics": {
          "conflictsCount": 0, // número de conflitos identificados
          "overloadRisk": "baixo" | "medio" | "alto", // nível de sobrecarga
          "healthScore": 85 // pontuação de eficiência das tarefas atual (0-100)
        }
      }
      Garanta que o JSON seja perfeitamente válido. Não retorne markdown externo em volta do JSON (como blocos de código com \`\`\`json). Apenas o JSON puro.
    `;

    const userPrompt = `
      Dados do Tarflow de Entrada:
      - Tarefas Ativas: ${JSON.stringify(tasks?.filter((t: any) => !t.completed))}
      - Listas de Tarefas: ${JSON.stringify(taskLists)}
      - Despesas Cadastradas: ${JSON.stringify(expenses?.slice(0, 30))}
      - Perfil do Usuário: ${JSON.stringify(profile)}
    `;

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    }));

    const text = response.text || "{}";
    const cleanText = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON. Text was:", cleanText);
      // Fallback response structure
      data = {
        overview: "Análise processada. Algumas de suas tarefas foram revisadas pela IA, mas o formato de resposta precisou ser simplificado.",
        suggestions: [],
        metrics: { conflictsCount: 0, overloadRisk: "baixo", healthScore: 90 }
      };
    }
    
    res.json(data);
  } catch (error: any) {
    console.error("AI Tasks Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/market/live-tickers", async (req, res) => {
  try {
    // Live rates from public financial exchange endpoints with intelligent caching & fallback
    let dolar = { value: "R$ 5,68", variation: "+0,34%", raw: 5.68 };
    let bitcoin = { valueUsd: "US$ 84.500", valueBrl: "R$ 479.960", variation: "+2,85%", rawUsd: 84500 };
    let ibovespa = { points: "134.200 pts", variation: "+0,65%", raw: 134200 };
    let selic = { rate: "14,00% a.a.", note: "Taxa Básica Copom", raw: 14.0 };

    try {
      // Fetch Dollar USD-BRL from AwesomeAPI
      const usdRes = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL", { signal: AbortSignal.timeout(3000) });
      if (usdRes.ok) {
        const usdData = await usdRes.json();
        if (usdData?.USDBRL) {
          const ask = parseFloat(usdData.USDBRL.ask);
          const pct = parseFloat(usdData.USDBRL.pctChange);
          dolar = {
            value: `R$ ${ask.toFixed(2).replace('.', ',')}`,
            variation: `${pct >= 0 ? '+' : ''}${pct.toFixed(2).replace('.', ',')}%`,
            raw: ask
          };
        }
      }
    } catch (e) {
      // fallback preserved
    }

    try {
      // Fetch Bitcoin from Binance's public ticker (no key, generous rate limit, real-time trade price).
      // CoinGecko's free tier gets rate-limited (429) very easily, which was leaving this stuck on the fallback value.
      const btcRes = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", { signal: AbortSignal.timeout(3000) });
      if (btcRes.ok) {
        const btcData = await btcRes.json();
        const usdVal = parseFloat(btcData?.lastPrice);
        const change24h = parseFloat(btcData?.priceChangePercent);
        if (!isNaN(usdVal)) {
          const brlVal = usdVal * dolar.raw;
          bitcoin = {
            valueUsd: `US$ ${usdVal.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
            valueBrl: `R$ ${brlVal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            variation: `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2).replace('.', ',')}%`,
            rawUsd: usdVal
          };
        }
      } else {
        throw new Error("binance_unavailable");
      }
    } catch (e) {
      // Fallback: CoinGecko (may be rate-limited, kept as a second attempt only)
      try {
        const btcRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,brl&include_24hr_change=true", { signal: AbortSignal.timeout(3000) });
        if (btcRes.ok) {
          const btcData = await btcRes.json();
          if (btcData?.bitcoin) {
            const usdVal = btcData.bitcoin.usd;
            const brlVal = btcData.bitcoin.brl;
            const change24h = btcData.bitcoin.usd_24h_change || 0;
            bitcoin = {
              valueUsd: `US$ ${usdVal.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
              valueBrl: `R$ ${brlVal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
              variation: `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2).replace('.', ',')}%`,
              rawUsd: usdVal
            };
          }
        }
      } catch (e2) {
        // fallback preserved
      }
    }

    try {
      // Fetch Ibovespa (^BVSP) from Yahoo Finance public chart endpoint (no key required)
      const ibovRes = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP", { signal: AbortSignal.timeout(3000) });
      if (ibovRes.ok) {
        const ibovData = await ibovRes.json();
        const meta = ibovData?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          const price = meta.regularMarketPrice;
          const prevClose = meta.previousClose || meta.chartPreviousClose || price;
          const pct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          ibovespa = {
            points: `${price.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} pts`,
            variation: `${pct >= 0 ? '+' : ''}${pct.toFixed(2).replace('.', ',')}%`,
            raw: price
          };
        }
      }
    } catch (e) {
      // fallback preserved
    }

    try {
      // Fetch Selic (Meta Selic - série 432) from Banco Central do Brasil open data API (no key required)
      const selicRes = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json", { signal: AbortSignal.timeout(3000) });
      if (selicRes.ok) {
        const selicData = await selicRes.json();
        const latest = selicData?.[0];
        if (latest?.valor) {
          const rate = parseFloat(latest.valor);
          selic = {
            rate: `${rate.toFixed(2).replace('.', ',')}% a.a.`,
            note: `Taxa Básica Copom (ref. ${latest.data})`,
            raw: rate
          };
        }
      }
    } catch (e) {
      // fallback preserved
    }

    res.json({
      updatedAt: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dolar,
      bitcoin,
      ibovespa,
      selic
    });
  } catch (error: any) {
    console.error("Live Tickers Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/briefing/daily-news", async (req, res) => {
  try {
    const ai = getGemini();
    const today = new Date().toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    const prompt = `
      Você é o editor-chefe do Tarflow Briefing Financeiro.
      Gere um boletim de notícias e resumo de mercado financeiro atualizado para a data de hoje (${today}).
      Fontes de referência a emular: InfoMoney, Futuro Econômico, Valor Econômico, NeoFeed e B3.
      
      Retorne ESTRITAMENTE um JSON no seguinte formato:
      {
        "marketSummary": {
          "date": "${today}",
          "ibovespa": { "status": "EM ALTA", "variation": "+0,58%", "note": "Fechamento positivo com fluxo estrangeiro" },
          "dolar": { "value": "R$ 5,18", "variation": "-0,31%", "note": "S&P 500 avança em NY" },
          "selic": { "rate": "14,00%", "cuts": "4 CORTES", "note": "Copom em ciclo de flexibilização" },
          "fiis": { "status": "HOJE", "variation": "+0,15%", "tickers": "AFHF11, RZAT11, AJFI11, CPLG11, MXRF11" },
          "destaques": { "title": "VALE, PETROBRAS E TAESA", "badge": "DESTAQUES B3", "tag": "ALTA" },
          "crypto": { "title": "BITCOIN A US$ 77 MIL", "variation": "+6%", "note": "Rali semanal consistente" },
          "footerPhrase": "MERCADO DINÂMICO: Ativos de risco em alta, fluxo institucional e foco na política fiscal."
        },
        "news": [
          {
            "id": "1",
            "title": "Ibovespa supera marcas históricas com forte fluxo estrangeiro e alívio nos juros futuros",
            "source": "InfoMoney",
            "time": "Hoje",
            "category": "Mercado",
            "summary": "O principal índice da B3 fechou em alta com forte participação de investidores globais e avanço de mineradoras e petrolíferas.",
            "impact": "alta",
            "tags": ["Ibovespa", "B3", "Macroeconomia"]
          },
          {
            "id": "2",
            "title": "Petrobras (PETR4) e Vale (VALE3) lideram negociações com recuperação do minério e petróleo Brent",
            "source": "Futuro Econômico",
            "time": "Hoje",
            "category": "Ações",
            "summary": "As duas maiores companhias da bolsa puxaram o índice com o reaquecimento da demanda industrial e estabilidade de preços no exterior.",
            "impact": "alta",
            "tags": ["PETR4", "VALE3", "Commodities"]
          },
          {
            "id": "3",
            "title": "Fundos Imobiliários pagadores: Carteiras depositam rendimentos com yield anualizado acima de 13%",
            "source": "InfoMoney",
            "time": "Hoje",
            "category": "FIIs",
            "summary": "Fundos de papel e tijolo como MXRF11, CPLG11 e RZAT11 creditam dividendos isentos nas contas dos cotistas nesta sessão.",
            "impact": "alta",
            "tags": ["FIIs", "Proventos", "MXRF11"]
          },
          {
            "id": "4",
            "title": "Ata do Copom aponta continuidade gradual no afrouxamento monetário para os próximos meses",
            "source": "Valor Econômico",
            "time": "Hoje",
            "category": "Macroeconomia",
            "summary": "Diretoria do Banco Central sinalizou passos comedidos para manter a convergência da inflação à meta.",
            "impact": "neutro",
            "tags": ["Selic", "Copom", "Juros"]
          },
          {
            "id": "5",
            "title": "Bitcoin consolida patamar de US$ 77.000 após novas entradas bilionárias em ETFs à vista",
            "source": "NeoFeed",
            "time": "Hoje",
            "category": "Cripto",
            "summary": "Volume recorde de aportes por tesourarias institucionais mantém sentimento de alta em todo o ecossistema cripto.",
            "impact": "alta",
            "tags": ["Bitcoin", "ETFs", "Cripto"]
          },
          {
            "id": "6",
            "title": "Taesa (TAEE11) anuncia proventos e reforça caixa para novos leilões de transmissão elétrica",
            "source": "Futuro Econômico",
            "time": "Hoje",
            "category": "Ações",
            "summary": "Companhia do setor elétrico consolida liderança em distribuição e dividend yield atrativo para acionistas de longo prazo.",
            "impact": "alta",
            "tags": ["TAEE11", "Dividendos", "Energia"]
          }
        ]
      }
      Retorne apenas o JSON.
    `;

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    }));

    const text = response.text || "{}";
    const cleanText = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const data = JSON.parse(cleanText);
    res.json(data);
  } catch (error: any) {
    console.error("Daily News Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    const ai = getGemini();
    const model = "gemini-2.5-flash";

    const systemInstruction = `
      Você é o TARFLOW IA — o cérebro de inteligência artificial e consultor financeiro mestre da plataforma Tarflow (Sistema Operacional Financeiro Completo).
      Você conhece PROFUNDAMENTE toda a arquitetura da plataforma Tarflow, suas metodologias de custos, mercado financeiro B3, criptoativos e finanças pessoais.
      
      ARQUITETURA E MÓDULOS DO TARFLOW QUE VOCÊ DOMINA:
      1. 📈 MERCADO FINANCEIRO & INVESTIMENTOS:
         - 🚀 Lançamentos & Custódia B3: Suporte ao catálogo completo de ações brasileiras (PETR4, VALE3, BBAS3, ITUB4, WEGE3, etc.), Fundos Imobiliários (MXRF11, HGLG11, XPML11, KNCR11, etc.), BDRs globais (AAPL34, NVDC34, MSFT34), ETFs (BOVA11, IVVB11, HASH11) e Criptomoedas (Bitcoin, Ethereum, Solana).
         - ⚡ Cotações e Extensões em Tempo Real: Monitoramento contínuo de Bitcoin (BTC/USD e BTC/BRL), Dólar Comercial (USD/BRL), Pontos do Ibovespa e Taxa Selic (Copom).
         - 💼 Carteira & Ativos: Cálculo automático de patrimônio total, preço médio ponderado (PM), rentabilidade nominal vs percentual, e mapa de alocação por classe de ativos.
         - 💰 Proventos & Dividendos: Controle detalhado de dividendos, JSCP (Juros sobre Capital Próprio) e rendimentos de FIIs recebidos e provisionados a receber.
         - 🤖 Análise IA Fundamentalista B3: Triagem automatizada com fórmulas de Benjamin Graham (Preço Justo), P/L (Preço/Lucro), P/VP (Preço/Valor Patrimonial), Dividend Yield (DY) e score de recomendação (COMPRAR / MANTER / AGUARDAR).
         - 📰 Briefing & Notícias Diárias: Cobertura diária macroeconômica e corporativa integrada às principais fontes financeiras (InfoMoney, Futuro Econômico, Valor Econômico, NeoFeed) com exportação para Notion.
         - 🎯 Metas de Patrimônio: Planejamento financeiro com aportes mensais, prazos e percentual de progresso rumo à independência financeira.

      2. 💳 GESTÃO DE CUSTOS & DESPESAS (Expense Manager):
         - 🛒 Supermercado Inteligente: Registro de itens de compras, histórico de variação de preços e comparador inteligente de custos entre atacados e varejos (Assaí, Atacadão, Carrefour, Pão de Açúcar).
         - 📋 Extratos & Transações: Controle de fluxo de caixa, parcelamentos de cartão, categorização e importação de extratos (OFX/CSV).
         - 🎯 Limites de Orçamento & Metas de Gastos: Tetos orçamentários por categoria para evitar desperdícios.
         - 🏦 Open Finance: Sincronização bancária automática e segura via Open Finance (Pluggy) para conciliação em tempo real.
         - ✅ Contas a Pagar & Tarefas: Central de vencimento de contas, priorização e organização de rotinas financeiras.

      3. 🏠 PAINEL CONSOLIDADO & INSIGHTS:
         - Visão 360° do patrimônio líquido (Ativos de Investimento + Saldo em Conta - Despesas e Contas a Pagar).
         - Projeções de fluxo futuro e alertas preditivos de solvência.

      CONTEXTO EM TEMPO REAL DO USUÁRIO:
      ${JSON.stringify(context, null, 2)}

      DIRETRIZES DE ATENDIMENTO DO TARFLOW IA:
      - Seja analítico, estratégico, motivador e objetivo, agindo como um consultor financeiro de alto nível.
      - Quando o usuário perguntar sobre a plataforma ou onde realizar algo, guie-o com clareza pelos botões e abas do Tarflow.
      - Quando analisar a carteira ou custos do usuário, utilize os dados reais disponíveis no contexto.
      - Explique conceitos de investimentos (ex: Preço Médio, Dividend Yield, Selic vs Ações, Ibovespa, Halving do Bitcoin) de forma simples e precisa.
      - Responda sempre em Português do Brasil (pt-BR) com formatação Markdown elegante.
    `;

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.6,
        topP: 0.95,
      }
    }));

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/dashboard-insights", async (req, res) => {
  try {
    const { expenses, goals, tasks, taskLists, profile } = req.body;
    const ai = getGemini();

    const systemInstruction = `
      Você é o Tarflow IA, um consultor de finanças pessoais de elite e especialista em hábitos de produtividade.
      Analise minuciosamente os dados financeiros (despesas, limites/metas financeiras de gasto), a lista de tarefas (tarefas ativas, concluídas, prioridades, datas de vencimento), as listas de tarefas e o perfil profissional/financeiro do usuário se disponível.
      
      Gere um feedback estratégico e ultra-personalizado focado em duas áreas centrais:
      1. Economia Inteligente (Finanças): Como reduzir vazamentos de dinheiro, quais categorias estão acima ou próximas dos limites (metas), onde economizar.
      2. Produtividade & Gestão de Tarefas: Como organizar prazos, evitar sobrecarga de tarefas urgentes, priorizar corretamente pagamentos e rotinas.

      Você deve retornar uma resposta estritamente no formato JSON de acordo com o esquema fornecido.
      Sua comunicação deve ser séria, direta, motivadora, com insights acionáveis de alto valor agregado e sem clichês. Use o idioma Português do Brasil (pt-BR).
    `;

    const userPrompt = `
      Abaixo estão os dados reais do usuário coletados de forma segura:
      
      - Despesas Recentes: ${JSON.stringify(expenses?.slice(0, 50))}
      - Metas de Gasto (Budget/Goals): ${JSON.stringify(goals)}
      - Tarefas (Produtividade/Tasks): ${JSON.stringify(tasks?.slice(0, 50))}
      - Listas de Tarefas (TaskLists): ${JSON.stringify(taskLists)}
      - Perfil do Usuário (Profile): ${JSON.stringify(profile)}
      
      Gere insights avançados cruzando despesas com tarefas de pagamento e prazos.
    `;

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            savingsScore: {
              type: Type.INTEGER,
              description: "Pontuação de organização financeira do usuário (0-100)"
            },
            productivityScore: {
              type: Type.INTEGER,
              description: "Pontuação de produtividade e execução de tarefas do usuário (0-100)"
            },
            overallScore: {
              type: Type.INTEGER,
              description: "Pontuação integrada geral do usuário (0-100)"
            },
            financialSummary: {
              type: Type.STRING,
              description: "Visão geral focada de 2 a 3 frases da saúde financeira atual do usuário"
            },
            savingsOverview: {
              type: Type.STRING,
              description: "Feedback detalhado sobre economia e despesas em formato Markdown"
            },
            productivityOverview: {
              type: Type.STRING,
              description: "Feedback detalhado sobre gestão de tarefas em formato Markdown"
            },
            savingsTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Título curto da dica de economia" },
                  category: { type: Type.STRING, description: "Categoria de impacto da despesa" },
                  amountToSave: { type: Type.NUMBER, description: "Valor potencial estimado de economia se aplicável (opcional)" },
                  description: { type: Type.STRING, description: "Descrição prática explicando o 'porquê' e o método acionável" },
                  urgency: { type: Type.STRING, description: "Nível de urgência para agir: 'baixa', 'media', 'alta'" }
                },
                required: ["title", "category", "description", "urgency"]
              }
            },
            taskTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Título do conselho de produtividade" },
                  description: { type: Type.STRING, description: "Explicação do que reorganizar e como otimizar o fluxo" },
                  priority: { type: Type.STRING, description: "Prioridade sugerida da tarefa afetada: 'baixa', 'media', 'alta'" },
                  action: { type: Type.STRING, description: "Ação imediata que o usuário deve tomar (ex: 'Reagendar tarefa X')" }
                },
                required: ["title", "description", "priority", "action"]
              }
            }
          },
          required: [
            "savingsScore",
            "productivityScore",
            "overallScore",
            "financialSummary",
            "savingsOverview",
            "productivityOverview",
            "savingsTips",
            "taskTips"
          ]
        }
      }
    }));

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("AI Dashboard Insights Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
