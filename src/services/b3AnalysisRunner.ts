import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { withGeminiRetry } from "../lib/geminiRetry";

// Base asset universe with reliable fundamentalist metrics
export interface B3Asset {
  code: string;
  name: string;
  category: "Ações" | "FIIs" | "Criptomoedas" | "ETFs" | "Outros";
  sector: string;
  price: number;
  pl: number;      // P/L ratio (for stocks)
  pvp: number;     // P/VP ratio (Price / Book Value)
  dy: number;      // Dividend Yield %
  vaga?: number;   // Vacancy % (for FIIs)
}

export const INITIAL_B3_ASSETS: Record<string, B3Asset> = {
  PETR4: { code: "PETR4", name: "Petrobras PN", category: "Ações", sector: "Petróleo e Gás", price: 40.91, pl: 4.90, pvp: 1.18, dy: 13.50 },
  BBAS3: { code: "BBAS3", name: "Banco do Brasil ON", category: "Ações", sector: "Financeiro", price: 19.53, pl: 8.84, pvp: 0.58, dy: 10.20 },
  BBSE3: { code: "BBSE3", name: "BB Seguridade ON", category: "Ações", sector: "Financeiro", price: 35.18, pl: 7.43, pvp: 5.40, dy: 12.77 },
  CMIG4: { code: "CMIG4", name: "Cemig PN", category: "Ações", sector: "Utilidade Pública", price: 10.83, pl: 6.41, pvp: 1.07, dy: 11.72 },
  KLBN4: { code: "KLBN4", name: "Klabin PN", category: "Ações", sector: "Bens Industriais", price: 3.42, pl: 31.01, pvp: 2.36, dy: 8.33 },
  VALE3: { code: "VALE3", name: "Vale S.A.", category: "Ações", sector: "Mineração", price: 68.40, pl: 6.20, pvp: 1.45, dy: 6.80 },
  WEGE3: { code: "WEGE3", name: "Weg S.A.", category: "Ações", sector: "Bens Industriais", price: 39.20, pl: 28.50, pvp: 5.20, dy: 2.10 },
  CPTS11: { code: "CPTS11", name: "Capitânia Securities FII", category: "FIIs", sector: "Títulos Públicos", price: 7.62, pl: 12.4, pvp: 0.86, dy: 13.99 },
  PSEC11: { code: "PSEC11", name: "Patria Log FII", category: "FIIs", sector: "Logística", price: 58.60, pl: 10.2, pvp: 0.78, dy: 13.65 },
  GARE11: { code: "GARE11", name: "Guardian Reit FII", category: "FIIs", sector: "Híbrido", price: 8.21, pl: 9.8, pvp: 0.87, dy: 12.13 },
  XPML11: { code: "XPML11", name: "XP Malls FII", category: "FIIs", sector: "Shopping Centers", price: 106.29, pl: 11.5, pvp: 0.96, dy: 10.39, vaga: 4.2 },
  MXRF11: { code: "MXRF11", name: "Maxi Renda FII", category: "FIIs", sector: "Títulos Públicos", price: 9.78, pl: 10.8, pvp: 1.04, dy: 12.22 }
};

const DATA_DIR = path.join(process.cwd(), "src/data");
const ANALYSIS_FILE = path.join(DATA_DIR, "b3_analysis_results.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function runB3Analysis(): Promise<any> {
  try {
    const assetsCopy = { ...INITIAL_B3_ASSETS };
    
    // 1. Optional live price update if BRAPI_TOKEN is available
    const brapiToken = process.env.BRAPI_TOKEN;
    const tickers = Object.keys(assetsCopy).join(",");
    
    if (brapiToken && tickers) {
      try {
        console.log(`[B3 Analysis] Requesting live quotes from Brapi for: ${tickers}`);
        const response = await fetch(`https://brapi.dev/api/quote/${tickers}?token=${brapiToken}`);
        if (response.ok) {
          const data: any = await response.json();
          if (data && data.results) {
            for (const result of data.results) {
              const symbol = result.symbol?.toUpperCase();
              if (assetsCopy[symbol] && result.regularMarketPrice) {
                assetsCopy[symbol].price = result.regularMarketPrice;
              }
            }
          }
        } else {
          console.warn("[B3 Analysis] Brapi fetch responded with error status: " + response.status);
        }
      } catch (brapiErr) {
        console.error("[B3 Analysis] Failed to fetch live prices from Brapi. Falling back to default fundamentalist prices.", brapiErr);
      }
    }

    // 2. Sanity Validation on Snapshot as requested
    const formattedSnapshot: any[] = [];
    for (const key of Object.keys(assetsCopy)) {
      const asset = assetsCopy[key];
      
      // Perform data integrity validations & sanitization
      let sanitizedPl = asset.pl;
      let sanitizedPvp = asset.pvp;
      let sanitizedDy = asset.dy;
      
      if (sanitizedPl < -500 || sanitizedPl > 500 || isNaN(sanitizedPl)) {
        sanitizedPl = 0; // Normalize bizzare multiple
      }
      if (sanitizedPvp < 0 || sanitizedPvp > 50 || isNaN(sanitizedPvp)) {
        sanitizedPvp = 1; // Normalize out of bounds
      }
      if (sanitizedDy < 0 || sanitizedDy > 100 || isNaN(sanitizedDy)) {
        sanitizedDy = 0; // Normalize unreal yield
      }

      formattedSnapshot.push({
        code: asset.code,
        name: asset.name,
        category: asset.category,
        sector: asset.sector,
        price: Number(asset.price.toFixed(2)),
        pl: Number(sanitizedPl.toFixed(2)),
        pvp: Number(sanitizedPvp.toFixed(2)),
        dy: Number(sanitizedDy.toFixed(2)),
        vaga: asset.vaga
      });
    }

    // 3. Load System Prompt
    const promptPath = path.join(process.cwd(), "src/prompts/system-prompt-b3.txt");
    let systemInstruction = "Você é um especialista em investimentos B3.";
    if (fs.existsSync(promptPath)) {
      systemInstruction = fs.readFileSync(promptPath, "utf-8");
    }

    // 4. Call Gemini using modern @google/genai SDK
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    console.log("[B3 Analysis] Sending snapshot to Gemini for ranking and analysis...");
    
    const userPrompt = `
      Aqui está o snapshot atual de fundamentos da B3 para análise:
      ${JSON.stringify(formattedSnapshot, null, 2)}
      
      Por favor, retorne uma análise aprofundada baseada nesses dados seguindo as regras e a estrutura exata de JSON instruída.
    `;

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash", // Basic Text Task default
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    }));

    const responseText = response.text || "";
    const cleanJsonText = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    
    // Parse to verify it matches our requirements
    const parsedResults = JSON.parse(cleanJsonText);
    
    // Enforce data consistency timestamp if empty
    if (!parsedResults.updatedAt) {
      parsedResults.updatedAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    }

    // Add current pricing information to rankings so UI has direct access
    if (parsedResults.acoesRank) {
      parsedResults.acoesRank = parsedResults.acoesRank.map((item: any) => {
        const metadata = assetsCopy[item.code?.toUpperCase()];
        return {
          ...item,
          price: metadata?.price || 0,
          dy: metadata?.dy || 0,
          pl: metadata?.pl || 0,
          pvp: metadata?.pvp || 0,
          sector: metadata?.sector || ""
        };
      });
    }

    if (parsedResults.fiisRank) {
      parsedResults.fiisRank = parsedResults.fiisRank.map((item: any) => {
        const metadata = assetsCopy[item.code?.toUpperCase()];
        return {
          ...item,
          price: metadata?.price || 0,
          dy: metadata?.dy || 0,
          pvp: metadata?.pvp || 0,
          sector: metadata?.sector || ""
        };
      });
    }

    // Save outputs persistently
    fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(parsedResults, null, 2), "utf-8");
    console.log("[B3 Analysis] Analysis successfully processed and saved!");
    
    return parsedResults;
  } catch (error: any) {
    console.error("[B3 Analysis] Core runner execution failed:", error);
    throw error;
  }
}

export function getCachedAnalysis(): any | null {
  try {
    if (fs.existsSync(ANALYSIS_FILE)) {
      const data = fs.readFileSync(ANALYSIS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("[B3 Analysis] Failed to read cached analysis results:", e);
  }
  return null;
}
