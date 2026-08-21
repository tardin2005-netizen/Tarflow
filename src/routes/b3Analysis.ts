import express, { Request, Response } from "express";
import { runB3Analysis, getCachedAnalysis, INITIAL_B3_ASSETS } from "../services/b3AnalysisRunner";

const router = express.Router();

// Define fallback responses if no analysis has been executed yet
const getFallbackOverview = () => {
  return {
    updatedAt: "Ainda não executado",
    overview: "Inicie o pipeline automático ou force uma nova análise para carregar os rankings e indicadores recomendados pelo Tarflow IA.",
    acoesRank: Object.values(INITIAL_B3_ASSETS)
      .filter(a => a.category === "Ações")
      .map(a => ({
        code: a.code,
        score: null,
        decision: "MANTER",
        justification: "Aguardando execução do pipeline...",
        price: a.price,
        pl: a.pl,
        pvp: a.pvp,
        dy: a.dy,
        sector: a.sector
      })),
    fiisRank: Object.values(INITIAL_B3_ASSETS)
      .filter(a => a.category === "FIIs")
      .map(a => ({
        code: a.code,
        score: null,
        decision: "MANTER",
        justification: "Aguardando execução do pipeline...",
        price: a.price,
        pl: a.pl,
        pvp: a.pvp,
        dy: a.dy,
        sector: a.sector
      }))
  };
};

// GET /api/b3/status
router.get("/status", (req: Request, res: Response) => {
  try {
    const cached = getCachedAnalysis();
    if (cached) {
      res.json({
        hasAnalysis: true,
        updatedAt: cached.updatedAt,
        overview: cached.overview,
        totalAcoes: cached.acoesRank?.length || 0,
        totalFiis: cached.fiisRank?.length || 0
      });
    } else {
      res.json({
        hasAnalysis: false,
        updatedAt: null,
        overview: "Nenhuma análise B3 automática encontrada em cache. Carregando dados base.",
        totalAcoes: 0,
        totalFiis: 0
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/b3/rankings/:categoria
router.get("/rankings/:categoria", (req: Request, res: Response) => {
  try {
    const categoria = req.params.categoria?.toLowerCase(); // "acoes" or "fiis"
    let cached = getCachedAnalysis() || getFallbackOverview();
    
    if (categoria === "acoes") {
      res.json(cached.acoesRank || []);
    } else if (categoria === "fiis") {
      res.json(cached.fiisRank || []);
    } else {
      res.json({
        overview: cached.overview,
        updatedAt: cached.updatedAt,
        acoesRank: cached.acoesRank || [],
        fiisRank: cached.fiisRank || []
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/b3/analyze
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    console.log("[B3 Route] Starting manually triggered Gemini B3 analysis process...");
    const results = await runB3Analysis();
    res.json({
      success: true,
      message: "Análise processada e persistida com sucesso!",
      results
    });
  } catch (error: any) {
    console.error("[B3 Route] Manual run crashed:", error);
    res.status(500).json({ 
      success: false,
      error: "Falha ao processar análise inteligente B3", 
      details: error.message 
    });
  }
});

export default router;
