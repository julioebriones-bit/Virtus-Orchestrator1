// fill-db-automated.js (ESM) - KAIROS V8 - Versión Autónoma Real
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const timestamp = new Date().toISOString();
const today = timestamp.split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

console.log(`🚀 [KAIROS_AUTOFILL] Iniciando ciclo orbital - ${today} (ayer: ${yesterday})`);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const deportes = ['NBA', 'NFL', 'MLB', 'Liga MX', 'Champions League', 'Tennis']; // Ajusta a tus módulos activos

async function barridoJornadaHoy() {
  console.log('\n📅 1. Barrido de jornada HOY');
  for (const deporte of deportes) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Usa googleSearch para listar TODOS los partidos reales de ${deporte} programados EXACTAMENTE HOY (${today}). 
      Devuelve SOLO JSON array: [{match: "EquipoA vs EquipoB", league: "Liga", match_time: "HH:MM", venue: "Estadio", status: "pendiente"}] 
      Ignora partidos pasados o de otros días. Si no hay, array vacío.`;

      const result = await model.generateContent(prompt, { tools: [{ googleSearchRetrieval: {} }] });
      let matches;
      try {
        matches = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
      } catch (e) {
        console.warn(`JSON parse falló para ${deporte}, raw:`, result.response.text());
        continue;
      }

      if (!Array.isArray(matches) || matches.length === 0) {
        console.log(`   - ${deporte}: No hay partidos hoy`);
        continue;
      }

      for (const m of matches) {
        const { error } = await supabase.from('pendientes_analisis').upsert([{
          ...m,
          sport: deporte,
          match_date: `${today} ${m.match_time || '00:00'}`,
          status: 'pendiente',
          created_at: timestamp
        }], { onConflict: 'match,sport' });
        if (error) console.error(`Error insertando ${m.match}:`, error.message);
      }
      console.log(`   ✅ ${deporte}: ${matches.length} partidos pendientes agregados`);
    } catch (err) {
      console.error(`Error en barrido ${deporte}:`, err.message);
    }
  }
}

async function analizarPendientes() {
  console.log('\n🧠 2. Análisis secuencial de pendientes');
  const { data: pendientes, error } = await supabase
    .from('pendientes_analisis')
    .select('*')
    .eq('status', 'pendiente')
    .eq('match_date', today); // Solo hoy

  if (error || !pendientes?.length) {
    console.log('   No hay pendientes para analizar hoy');
    return;
  }

  for (const p of pendientes) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analiza partido HOY: ${p.match} (${p.sport}, ${p.league}). 
      Usa googleSearch para alineaciones probables, lesiones últimas, clima en venue, forma reciente. 
      Devuelve JSON: {valid: boolean, confidence: number (0-1), edge: number (-10 a +10), pick: "home"|"away"|"draw"|"over/under X", rationale: "string detallado real"} 
      Si no es hoy o datos insuficientes: valid:false`;

      const result = await model.generateContent(prompt, { tools: [{ googleSearchRetrieval: {} }] });
      const analysis = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

      if (!analysis.valid) {
        await supabase.from('pendientes_analisis').update({ status: 'descartado', rationale: analysis.rationale || 'No válido hoy' }).eq('id', p.id);
        continue;
      }

      // Guardar predicción real
      await supabase.from(`predicciones_${p.sport.toLowerCase()}`).insert([{
        match: p.match,
        league: p.league,
        pick: analysis.pick,
        confidence: analysis.confidence,
        edge: analysis.edge,
        rationale: analysis.rationale,
        status: analysis.edge > 5 ? 'fire' : 'normal',
        created_at: timestamp
      }]);

      // Si es FIRE, generar ticket visible
      if (analysis.edge > 5) {
        await supabase.from('tickets').insert([{
          game_id: `FIRE-${Date.now()}`,
          module: p.sport,
          home_team: p.match.split(' vs ')[0],
          away_team: p.match.split(' vs ')[1],
          prediction: analysis.pick,
          edge: analysis.edge,
          confidence: analysis.confidence,
          status: 'PENDING',
          is_fire_signal: true,
          summary: analysis.rationale.substring(0, 200),
          created_at: timestamp
        }]);
      }

      // Marcar como analizado
      await supabase.from('pendientes_analisis').update({ status: 'analizado' }).eq('id', p.id);
      console.log(`   ✅ Analizado: ${p.match} → ${analysis.pick} (${analysis.edge} edge)`);
    } catch (err) {
      console.error(`Error analizando ${p.match}:`, err.message);
    }
  }
}

async function barridoResultadosAyer() {
  console.log('\n📊 3. Chequeo de resultados AYER + backtesting');
  // Similar lógica: buscar resultados reales de ayer con Gemini, comparar con predicciones guardadas, calcular verde/rojo, analizar fallos
  // ... (puedes copiar y adaptar del snippet anterior si quieres expandirlo ahora)
}

async function fillDatabase() {
  try {
    // Tu log inicial
    await supabase.from('system_logs').insert([{ log_type: 'CRON_EXECUTION', source: 'GITHUB', message: `Ciclo real iniciado: ${timestamp}`, data: { deporte_count: deportes.length }, created_at: timestamp }]);

    await barridoJornadaHoy();
    await analizarPendientes();
    await barridoResultadosAyer(); // Implementa cuando estés listo

    // Mantén tus upserts de health, memory, rules
    await supabase.from('system_health').upsert([{ last_pulse: timestamp, status: 'HEALTHY' }], { onConflict: 'id' });
    await supabase.from('ai_memory').upsert([{ pattern_description: `ciclo_real_${today}`, impact_score: 2.0, category: 'AUTOMATION_REAL' }], { onConflict: 'pattern_description' });

    console.log('🎉 Ciclo completado - datos reales cargados');
  } catch (error) {
    console.error('❌ CRITICAL:', error.message);
    process.exit(1);
  }
}

fillDatabase();
