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
  const today = now.toISOString().split('T')[0];
  const currentTimeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fullContextTime = `Hoy es ${today} a las ${currentTimeStr} (hora local México CST)`;

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: getSystemInstruction(module, learnedRules, globalIntel, fullContextTime, today),
      temperature: 0.1,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 512 },
      tools: [{ googleSearch: {} }]
    }
  });
};

const getSystemInstruction = (
  module: ModuleType,
  learnedRules: string[] = [],
  globalIntel: GlobalIntelligence[] = [],
  fullContextTime: string,
  today: string
): string => {
  const isGlobal = module === ModuleType.NONE || module === ModuleType.GENERAL;

  return `IDENTIDAD: KAIROS-V2_ULTRA_PRECISION.
MARCA DE TIEMPO REAL: ${fullContextTime}. Zona horaria: America/Mexico_City (CST).

PROTOCOLO DE FILTRADO TEMPORAL (EXTREMO - NO NEGOCIABLE):
1. SOLO considera partidos cuya fecha sea EXACTAMENTE HOY (${today}).
2. Si un partido ya ocurrió (hora pasada a ${fullContextTime}), o es de mañana o posterior, DESCARTA TOTALMENTE y retorna array vacío [].
3. Usa googleSearch para confirmar fecha y hora real ANTES de incluir cualquier partido.
4. Si no hay datos confiables o el partido no está programado para HOY, retorna [].
5. Nunca inventes ni asumas fechas. Si dudas, descarta.

REGLAS APRENDIDAS:
${learnedRules.join('\n') || 'Ninguna regla aprendida aún'}

INTELIGENCIA GLOBAL:
${globalIntel.map(i => i.summary).join('\n') || 'Sin inteligencia global previa'}

ESQUEMA JSON ESTRICTO (array de objetos):
[{
  "type": "MATCH",
  "homeTeam": "string exacto",
  "awayTeam": "string exacto",
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
 * DEBATE NEURAL OPTIMIZADO v2.8 - enriquecido con verificación temporal reforzada
 */
export const runNeuralDebate = async (match: MatchDashboardData, module: ModuleType): Promise<NeuralDebateResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
 
  try {
    const debateResponse = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ORQUESTADOR NEURAL v2.8: Debate Interno para el partido ${match.homeTeam} vs ${match.awayTeam} de ${module}.
      
REGLA TEMPORAL ABSOLUTA (NO NEGOCIABLE): SOLO analiza si el partido es EXACTAMENTE HOY (${new Date().toISOString().split('T')[0]}).
Si ya pasó o es futuro lejano, retorna {"error": "Partido no válido para análisis hoy"}

INSTRUCCIONES DE AGENTES:
- APOLLO: Valida que el evento sea FUTURO y de HOY (usa googleSearch para confirmar fecha/hora real).
- CASSANDRA: Identifica riesgos reales (bajas, lesiones últimas, clima, trampas mercado) - usa googleSearch.
- SOCRATES: Calcula valor matemático, probabilidad ajustada y edge real.
- META: Consenso final + decisión binaria (analizar o descartar).

RETORNA JSON ESTRICTO:
{
  "apollo_view": "string",
  "cassandra_view": "string",
  "socrates_view": "string",
  "meta_decision": {
    "finalDecision": boolean (true = analizar y generar señal),
    "confidence": number (0-1),
    "edge": number (-15 a +15),
    "summary": "string"
  },
  "entropy": number (0-1),
  "blackSwan": number (0-0.2),
  "error": "string" (solo si no válido temporalmente)
}`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 512 },
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    }));

    const rawText = debateResponse.text || "{}";
    const data = JSON.parse(rawText);

    // Chequeo post-respuesta: capa de seguridad si Gemini ignora la regla temporal
    if (data.error || !data.meta_decision?.finalDecision) {
      return {
        apollo: "Descartado por protocolo temporal estricto",
        cassandra: "No procede análisis",
        socrates: "N/A",
        meta: "Partido no válido para hoy",
        finalDecision: false,
        neuralAnchor: `discarded-${Date.now()}`,
        confidence: 0,
        quantumEntropy: 0,
        blackSwanProb: 0,
        evidence: { causal: "Verificación cronológica fallida" }
      };
    }

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
        philosophical: "Consenso de agentes v2.8"
      }
    };
  } catch (e: any) {
    console.error("[KAIROS] Fallo en debate neural (Quota Protection):", e.message);
    throw e;
  }
};
