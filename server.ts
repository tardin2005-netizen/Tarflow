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
const PORT = 3000;

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

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    const ai = getGemini();
    
    // Using gemini-3.5-flash as recommended for basic/informative tasks
    const model = "gemini-3.5-flash";

    const systemInstruction = `
      Você é o Tarflow IA, um consultor financeiro de elite e especialista em estratégia de produtividade.
      Sua comunicação é altamente profissional, técnica, direta e responsável.
      
      CONTEXTO DO USUÁRIO (Dados Reais):
      ${JSON.stringify(context, null, 2)}
      
      IMPORTANTE: Se o perfil do usuário (Income, Profession, Age) estiver disponível, use-os para personalizar radicalmente as recomendações financeiras. Por exemplo, adapte o tom para a profissão ou sugira investimentos baseados na renda informada.

      DIRETRIZES DE RESPOSTA:
      1. TONE: Fale com a autoridade de um consultor financeiro sênior. Seja sério mas empoderador.
      2. DIRECTNESS: Evite introduções longas ou conclusões genéricas. Vá direto aos fatos e ações recomendadas.
      3. RESPONSABILIDADE: Aborde cada assunto com o peso da responsabilidade financeira. Se houver desequilíbrio, aponte-o frontalmente.
      4. DATA-DRIVEN: Use os dados do contexto para justificar cada conselho. Cite valores e tarefas específicas.
      5. FORMATTING: Use Markdown (negrito, listas, tabelas) para que a leitura seja rápida e eficiente.
      6. IDIOMA: Português (pt-BR).
    `;

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
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
