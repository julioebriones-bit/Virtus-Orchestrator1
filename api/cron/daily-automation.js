
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

/**
 * KAIROS_V8_AUTONOMOUS_ENGINE
 * Este script corre en los servidores de Vercel. 
 * FUNCIONA INDEPENDIENTEMENTE DE SI EL NAVEGADOR ESTÁ ABIERTO O CERRADO.
 */

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  // Verificación de seguridad opcional (ej: header secreto de vercel cron)
  const startTime = Date.now();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`[AUTONOMOUS_KAIROS] Ciclo iniciado: ${new Date().toLocaleString()}`);

  const log = { post_mortem: 0, scouting: 0, errors: [] };

  try {
    // 1. POST-MORTEM: Cerrar ciclo anterior
    const { data: pending } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .limit(20);

    if (pending && pending.length > 0) {
      for (const t of pending) {
        try {
          const check = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `RESULTADO FINAL: ${t.home_team} vs ${t.away_team}. Fecha: ${t.created_at}. 
                       Retorna JSON: {"finished": bool, "score": "str", "winner": "HOME|AWAY|DRAW"}`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
          });
          const res = JSON.parse(check.text);
          if (res.finished) {
            const win = (res.winner === 'HOME' && t.prediction.includes(t.home_team)) || 
                        (res.winner === 'AWAY' && t.prediction.includes(t.away_team));
            await supabase.from('tickets').update({ 
              status: win ? 'WON' : 'LOST',
              summary: `${t.summary} | FINAL: ${res.score}`
            }).eq('game_id', t.game_id);
            log.post_mortem++;
          }
        } catch (e) { log.errors.push(`Error PM ${t.game_id}: ${e.message}`); }
      }
    }

    // 2. SCOUTING: Abrir nueva jornada
    const scout = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `JORNADA DE HOY (${today}): Identifica 10 partidos TOP de Fútbol (Europa), NBA y MLB. 
                 Retorna JSON: [{"h": "str", "a": "str", "s": "str", "l": "str"}]`,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    
    const matches = JSON.parse(scout.text) || [];
    for (const m of matches) {
      try {
        const analysis = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analiza: ${m.h} vs ${m.a}. Pronostica ganador y cuota de valor. JSON: {"p": "str", "c": 0-100, "e": 0-20, "s": 1-5, "r": "str"}`,
          config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const ana = JSON.parse(analysis.text);
        const gid = `k-${today}-${m.h}-${m.a}`.toLowerCase().replace(/\s/g, '-');
        
        await supabase.from('tickets').upsert({
          game_id: gid, module: m.s, home_team: m.h, away_team: m.a,
          prediction: ana.p, edge: ana.e, stake: ana.s, summary: ana.r,
          status: 'PENDING', is_fire_signal: ana.c > 85, created_at: new Date().toISOString()
        }, { onConflict: 'game_id' });
        log.scouting++;
      } catch (e) { log.errors.push(`Error Scouting: ${e.message}`); }
    }

    // Guardar log de éxito en DB para que la UI sepa que el cron corrió
    await supabase.from('cron_executions').insert([{
      cron_name: 'daily-automation-autonomous',
      status: 'success',
      duration: ((Date.now() - startTime)/1000).toString(),
      result: log
    }]);

    return res.status(200).json({ status: 'completed', log });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
