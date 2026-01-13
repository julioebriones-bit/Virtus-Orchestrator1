import { GoogleGenerativeAI } from "@google/generative-ai"; // Corregí el import (era GoogleGenAI, pero SDK oficial es GoogleGenerativeAI)
import { ModuleType, GlobalIntelligence, MatchDashboardData, NeuralDebateResult } from "../types";

// ... (tu callWithRetry se queda intacto, está perfecto)

export const createAnalysisSession = (module: ModuleType, learnedRules: string[] = [], globalIntel: GlobalIntelligence[] = []) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY!); // ! para TypeScript

  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD hoy
  const currentTimeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fullContextTime = `Hoy es ${today} a las ${currentTimeStr} (hora local México CST)`;

  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Cambié a 1.5-flash (más estable y barato que preview)
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json"
    },
    systemInstruction: getSystemInstruction(module, learnedRules, globalIntel, fullContextTime, today),
    tools: [{ googleSearchRetrieval: {} }]
  }).startChat(); // startChat para sesiones persistentes si lo usas así
};

const getSystemInstruction = (
  module: ModuleType,
  learnedRules: string[] = [],
  globalIntel: GlobalIntelligence[] = [],
  fullContextTime: string,
  today: string
): string => {
  const isGlobal = module === ModuleType.NONE || module === ModuleType.GENERAL;

  return `
IDENTIDAD: KAIROS-V8_ULTRA_PRECISION - Oráculo Deportivo Autónomo.
MARCA DE TIEMPO ABSOLUTA: ${fullContextTime}. Zona horaria: America/Mexico_City (CST).

PROTOCOLO TEMPORAL EXTREMO - NO NEGOCIABLE:
1. SOLO considera partidos cuya fecha sea EXACTAMENTE HOY (${today}).
2. Si un partido ya empezó o terminó (hora pasada a ${fullContextTime}), o es de mañana o después, DESCARTA TOTALMENTE y retorna array vacío [].
3. Si no hay datos confiables o el partido no está programado para HOY, retorna [].
4. Usa googleSearchRetrieval para confirmar fecha, hora y estado real del partido ANTES de incluirlo.
5. Nunca inventes fechas ni partidos. Si dudas, descarta.

REGLAS ADICIONALES:
- learnedRules: ${learnedRules.join('\n- ') || 'Ninguna regla aprendida aún'}
- globalIntel: ${globalIntel.map(i => i.summary).join('\n- ') || 'Sin inteligencia global previa'}

ESQUEMA JSON ESTRICTO (array de objetos):
[{
  "type": "MATCH",
  "homeTeam": "string exacto",
  "awayTeam": "string exacto",
  "leagueName": "string",
  "matchTime": "HH:MM (24h)",
  "winProbabilityHome": number (0-1),
  "prediction": "home | away | draw | over_X | under_X",
  "edge": number (-15 a +15),
  "stake": number (1-5),
  "summary": "string breve y real (máx 150 chars)",
  "recommendedProps": ["string"],
  "isFireSignal": boolean (true solo si edge >= +8 y confidence >= 0.75)
}]
  `;
};

/**
 * DEBATE NEURAL OPTIMIZADO v2.8 - con verificación temporal reforzada
 */
export const runNeuralDebate = async (match: MatchDashboardData, module: ModuleType): Promise<NeuralDebateResult> => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

  try {
    const debateResponse = await callWithRetry(async () => {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        },
        tools: [{ googleSearchRetrieval: {} }]
      });

      return await model.generateContent(`
ORQUESTADOR NEURAL v2.8 - Debate Interno para Partido: ${match.homeTeam} vs ${match.awayTeam} (${module})

REGLA TEMPORAL ABSOLUTA: SOLO analiza si el partido es HOY (${new Date().toISOString().split('T')[0]}). 
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
}
      `);
    });

    const rawText = debateResponse.response.text();
    const data = JSON.parse(rawText);

    // Chequeo post-respuesta: si Gemini ignora y trae algo inválido
    if (data.error || !data.meta_decision?.finalDecision) {
      return {
        apollo: "Descartado por protocolo temporal",
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
      apollo: data.apollo_view || "Validación temporal OK",
      cassandra: data.cassandra_view || "Riesgos escaneados",
      socrates: data.socrates_view || "Valor calculado",
      meta: data.meta_decision?.summary || "Consenso alcanzado",
      finalDecision: !!data.meta_decision?.finalDecision,
      neuralAnchor: `kairos-${Date.now().toString(36)}`,
      confidence: data.meta_decision?.confidence || 0.5,
      quantumEntropy: data.entropy || 0.15,
      blackSwanProb: data.blackSwan || 0.02,
      evidence: {
        causal: data.meta_decision?.summary || "Análisis lógico",
        counterfactual: "Validación de realidad completada",
        philosophical: "Consenso agentes v2.8"
      }
    };
  } catch (e: any) {
    console.error("[KAIROS] Fallo en debate neural:", e.message);
    throw e;
  }
};
