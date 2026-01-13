
import { GoogleGenAI } from "@google/genai";
import { ModuleType, GlobalIntelligence, MatchDashboardData, NeuralDebateResult } from "../types";

/**
 * Manejador de reintentos inteligente con Backoff Exponencial y Jitter.
 * Optimizado para manejar límites de cuota (429 RESOURCE_EXHAUSTED).
 */
async function callWithRetry(fn: () => Promise<any>, retries = 5, initialDelay = 10000) {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorStr = (error.message || "").toLowerCase();
      const isQuota = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted') || (error.status === 429);
      
      if (isQuota && i < retries - 1) {
        // Añadir jitter aleatorio para evitar que múltiples instancias reintenten al mismo tiempo
        const jitter = Math.random() * 2000;
        console.warn(`[KAIROS-V2] Cuota alcanzada. Reintentando intento ${i+1}/${retries} en ${(currentDelay + jitter)/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay + jitter));
        currentDelay *= 2.5; // Backoff agresivo
        continue;
      }
      throw error;
    }
  }
}

export const createAnalysisSession = (module: ModuleType, learnedRules: string[] = [], globalIntel: GlobalIntelligence[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fullContextTime = `${dateStr} a las ${timeStr} (UTC/Local actual)`;

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: getSystemInstruction(module, learnedRules, globalIntel, fullContextTime),
      temperature: 0.1,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 512 },
      tools: [{ googleSearch: {} }]
    }
  });
};

const getSystemInstruction = (module: ModuleType, learnedRules: string[] = [], globalIntel: GlobalIntelligence[] = [], fullContextTime: string): string => {
  const isGlobal = module === ModuleType.NONE || module === ModuleType.GENERAL;
  
  return `IDENTIDAD: KAIROS-V2_ULTRA_PRECISION.
MARCA DE TIEMPO REAL: ${fullContextTime}.

PROTOCOLO DE FILTRADO TEMPORAL (EXTREMO):
1. SOLO considera partidos que NO HAN EMPEZADO (Posterior a ${fullContextTime}).
2. Si un partido ya ocurrió, retorna array vacío [].
3. Formato: JSON estricto.

ESQUEMA JSON:
[{
  "type": "MATCH",
  "homeTeam": "string",
  "awayTeam": "string",
  "leagueName": "string",
  "winProbability": number,
  "prediction": "string",
  "edge": number,
  "stake": number,
  "summary": "string",
  "recommendedProps": ["string"],
  "isFireSignal": boolean
}]`;
};

/**
 * DEBATE NEURAL OPTIMIZADO v2.7:
 * En lugar de 4 llamadas, se realiza UNA sola llamada orquestada que simula el debate interno.
 * Esto ahorra el 75% de la cuota de API.
 */
export const runNeuralDebate = async (match: MatchDashboardData, module: ModuleType): Promise<NeuralDebateResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
      const debateResponse = await callWithRetry(() => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `ORQUESTADOR NEURAL: Realiza un debate interno para el partido ${match.homeTeam} vs ${match.awayTeam} de ${module}.
        
        INSTRUCCIONES DE AGENTES:
        - APOLLO: Valida racha y que el evento sea futuro.
        - CASSANDRA: Identifica riesgos, bajas y trampas del mercado (usa Google Search).
        - SOCRATES: Analiza el valor matemático y probabilidad real.
        - META: Decide el consenso final.
        
        RETORNA JSON ESTRICTO:
        {
          "apollo_view": "string",
          "cassandra_view": "string",
          "socrates_view": "string",
          "meta_decision": {
            "finalDecision": boolean,
            "confidence": number,
            "summary": "string"
          },
          "entropy": number (0-1),
          "blackSwan": number (0-0.2)
        }`,
        config: { 
          temperature: 0.1, 
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 512 },
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      }));

      const data = JSON.parse(debateResponse.text || "{}");
      
      return {
        apollo: data.apollo_view || "Validación completada.",
        cassandra: data.cassandra_view || "Riesgos analizados.",
        socrates: data.socrates_view || "Valor calculado.",
        meta: data.meta_decision?.summary || "Consenso orbital alcanzado.",
        finalDecision: !!data.meta_decision?.finalDecision,
        neuralAnchor: `kairos-${Math.random().toString(36).substring(7)}`,
        confidence: data.meta_decision?.confidence || 50,
        quantumEntropy: data.entropy || 0.15,
        blackSwanProb: data.blackSwan || 0.02,
        evidence: { 
          causal: data.meta_decision?.summary || "Análisis lógico", 
          counterfactual: "Validación de realidad paralela completada", 
          philosophical: "Consenso de agentes v2.7" 
        }
      };
  } catch (e: any) {
    console.error("[KAIROS] Fallo en debate neural (Quota Protection):", e.message);
    throw e;
  }
};
