import { GoogleGenerativeAI } from "@google/generative-ai"; // Corrige el import (era GoogleGenAI)
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const startTime = Date.now();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTimeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  console.log(`[KAIROS_V8_AUTONOMOUS] Ciclo iniciado: ${today} ${currentTimeStr} CST`);

  const log = { post_mortem: 0, scouting: 0, backtested: 0, errors: [] };

  try {
    // 1. POST-MORTEM + BACKTESTING: Cerrar tickets PENDING (ayer o antes)
    const { data: pendingTickets, error: pendingError } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'PENDING')
      .lt('created_at', `${today}T00:00:00`) // Solo anteriores a hoy
      .limit(30); // Límite razonable para serverless

    if (pendingError) throw pendingError;

    if (pendingTickets?.length > 0) {
      for (const ticket of pendingTickets) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent({
            contents: `Resultado final real del partido: ${ticket.home_team} vs ${ticket.away_team}.
                       Usa googleSearchRetrieval para confirmar score y ganador.
                       Retorna JSON estricto: {"finished": boolean, "score": "str", "winner": "HOME|AWAY|DRAW"}`,
            generationConfig: { responseMimeType: "application/json" },
            tools: [{ googleSearchRetrieval: {} }]
          });

          const raw = result.response.text();
          const res = JSON.parse(raw.replace(/```json

          if (res.finished) {
            const predictedWinner = ticket.prediction.includes(ticket.home_team) ? 'HOME' :
                                   ticket.prediction.includes(ticket.away_team) ? 'AWAY' : 'UNKNOWN';

            const won = res.winner === predictedWinner;
            const newStatus = won ? 'WON' : 'LOST';

            await supabase.from('tickets').update({
              status: newStatus,
              summary: `${ticket.summary} | FINAL: ${res.score} (${won ? 'VERDE' : 'ROJO'})`
            }).eq('game_id', ticket.game_id);

            log.post_mortem++;

            // Backtesting básico si LOST
            if (!won) {
              const falloAnalysis = await model.generateContent({
                contents: `Analiza por qué falló la predicción: ${ticket.prediction} para ${ticket.home_team} vs ${ticket.away_team}.
                           Real: ${res.score} (${res.winner}). Razón probable y regla para evitar en futuro.
                           JSON: {"fail_reason": "str", "rule_to_learn": "str"}`,
                generationConfig: { responseMimeType: "application/json" }
              });

              const fallo = JSON.parse(falloAnalysis.response.text().replace(/```json|```/g, '').trim());

              await supabase.from('backtesting_lab').insert([{
                match: `${ticket.home_team} vs ${ticket.away_team}`,
                predicted: ticket.prediction,
                actual: res.score,
                fail_reason: fallo.fail_reason,
                rule_to_learn: fallo.rule_to_learn,
                created_at: new Date().toISOString()
              }]);

              log.backtested++;
            }
          }
        } catch (e) {
          log.errors.push(`Post-mortem error en ${ticket.game_id}: ${e.message}`);
        }
      }
    }

    // 2. SCOUTING: Jornada de HOY (solo partidos futuros de hoy)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const scoutPrompt = `JORNADA REAL DE HOY (${today}): Lista 8-12 partidos TOP en Fútbol (Liga MX, Champions/Europa), NBA, MLB, NFL, Tennis.
                         SOLO partidos que aún NO HAN EMPEZADO (hora posterior a ${currentTimeStr}).
                         Usa googleSearchRetrieval para confirmar fechas/horas reales.
                         Retorna JSON array estricto: [{"h": "Equipo Local exacto", "a": "Equipo Visitante exacto", "l": "Liga exacta", "s": "Deporte (NBA/NFL/etc)", "t": "HH:MM"}]`;

    const scoutRes = await model.generateContent({
      contents: scoutPrompt,
      generationConfig: { responseMimeType: "application/json" },
      tools: [{ googleSearchRetrieval: {} }]
    });

    let matches = [];
    try {
      matches = JSON.parse(scoutRes.response.text().replace(/```json|```/g, '').trim());
    } catch (parseErr) {
      log.errors.push(`Parse scout falló: ${parseErr.message}`);
    }

    if (Array.isArray(matches) && matches.length > 0) {
      for (const m of matches) {
        try {
          // Análisis detallado
          const analysisRes = await model.generateContent({
            contents: `Analiza partido HOY (${today}): ${m.h} vs ${m.a} (${m.l}, ${m.s}).
                       Usa googleSearchRetrieval para lesiones, alineaciones probables, clima, forma reciente.
                       Pronostica y calcula valor.
                       JSON estricto: {"prediction": "str (ej. ${m.h} gana, over 2.5)", "confidence": number(0-100), "edge": number(-20 a +20), "stake": number(1-5), "rationale": "str detallado (máx 300 chars)"}`,
            generationConfig: { responseMimeType: "application/json" },
            tools: [{ googleSearchRetrieval: {} }]
          });

          const ana = JSON.parse(analysisRes.response.text().replace(/```json|```/g, '').trim());

          const gameId = `k-${today}-${m.h.toLowerCase().replace(/\s/g,'-')}-vs-${m.a.toLowerCase().replace(/\s/g,'-')}`;

          await supabase.from('tickets').upsert({
            game_id: gameId,
            module: m.s,
            home_team: m.h,
            away_team: m.a,
            prediction: ana.prediction,
            edge: ana.edge,
            stake: ana.stake,
            summary: ana.rationale,
            status: 'PENDING',
            is_fire_signal: ana.confidence > 85 && ana.edge > 8,
            created_at: new Date().toISOString()
          }, { onConflict: 'game_id' });

          log.scouting++;
        } catch (e) {
          log.errors.push(`Scouting error en ${m.h} vs ${m.a}: ${e.message}`);
        }
      }
    }

    // Log final en DB
    await supabase.from('cron_executions').insert([{
      cron_name: 'daily-automation-v8',
      status: log.errors.length === 0 ? 'success' : 'partial',
      duration: ((Date.now() - startTime) / 1000).toFixed(2),
      result: log,
      executed_at: new Date().toISOString()
    }]);

    return res.status(200).json({ status: 'completed', log });
  } catch (err) {
    console.error('[KAIROS_AUTONOMOUS] Error crítico:', err);
    await supabase.from('cron_executions').insert([{
      cron_name: 'daily-automation-v8',
      status: 'error',
      duration: ((Date.now() - startTime) / 1000).toFixed(2),
      result: { error: err.message, log },
      executed_at: new Date().toISOString()
    }]);
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
