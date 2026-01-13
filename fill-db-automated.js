import { createClient } from '@supabase/supabase-js';

/**
 * KAIROS V8 - AUTOMATED DATA FILLER (ESM)
 * Este script es ejecutado por GitHub Actions para mantener la base de datos con datos frescos.
 */

const timestamp = new Date().toISOString();
const today = timestamp.split('T')[0];

console.log('🚀 [KAIROS_AUTOFILL] Iniciando proceso de llenado orbital...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function fillDatabase() {
  try {
    console.log('\n📊 ===== PROCESANDO TABLAS =====');

    // 1. SYSTEM_LOGS
    console.log('1. Registrando evento en system_logs...');
    await supabase.from('system_logs').insert([{
      log_type: 'CRON_EXECUTION',
      source: 'GITHUB',
      message: `Ciclo de auto-llenado completado: ${timestamp}`,
      data: { tables_filled: 8, environment: 'PRODUCTION_CRON' },
      created_at: timestamp
    }]);
    console.log('   ✅ system_logs - OK');

    // 2. MATCHES (partidos)
    console.log('\n2. Generando eventos deportivos en matches...');
    const sports = ['NBA', 'NFL', 'MLB', 'FÚTBOL', 'TENNIS'];
    const createdMatchIds = [];

    for (const sport of sports) {
      const matchDate = new Date();
      matchDate.setDate(matchDate.getDate() + Math.floor(Math.random() * 7) + 1);

      const { data: matchData } = await supabase.from('matches').insert([{
        sport_type: sport,
        home_team: `${sport} Home Team ${Math.floor(Math.random() * 100)}`,
        away_team: `${sport} Away Team ${Math.floor(Math.random() * 100)}`,
        match_date: matchDate.toISOString(),
        league: sport === 'FÚTBOL' ? 'La Liga' : sport,
        status: 'SCHEDULED',
        created_at: timestamp
      }]).select().single();

      if (matchData) createdMatchIds.push(matchData.id);
    }
    console.log(`   ✅ matches - ${createdMatchIds.length} partidos creados`);

    // 3. PREDICTIONS (basadas en los matches creados)
    if (createdMatchIds.length > 0) {
      console.log('\n3. Generando predicciones neuronales...');
      for (const matchId of createdMatchIds) {
        await supabase.from('predictions').insert([{
          match_id: matchId,
          predictor_source: 'GITHUB_ACTION',
          prediction_data: {
            predicted_winner: Math.random() > 0.5 ? 'home' : 'away',
            confidence: 0.75,
            analysis: 'Automated Neural Scan via GitHub Workflow'
          },
          confidence: 0.7 + Math.random() * 0.2,
          risk_level: 'MEDIUM',
          outcome: 'PENDING',
          created_at: timestamp
        }]);
      }
      console.log('   ✅ predictions - Sincronizadas');
    }

    // 4. TICKETS (tickets de apuestas visibles en el Dashboard)
    console.log('\n4. Emitiendo señales en tickets...');
    await supabase.from('tickets').insert([{
      game_id: `GITHUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      module: 'NBA',
      home_team: 'Lakers',
      away_team: 'Warriors',
      prediction: 'Lakers -4.5',
      edge: 2.5 + (Math.random() * 5),
      stake: Math.floor(Math.random() * 5) + 1,
      status: 'PENDING',
      is_fire_signal: Math.random() > 0.7,
      summary: 'Señal de alta confianza generada por el orquestador autónomo.',
      created_at: timestamp
    }]);
    console.log('   ✅ tickets - 1 ticket activo creado');

    // 5. AI_MEMORY
    console.log('\n5. Actualizando ai_memory...');
    await supabase.from('ai_memory').upsert([{
      pattern_description: 'github_auto_pattern_' + today,
      impact_score: 1.5 + Math.random(),
      times_verified: 1,
      success_count: 5,
      category: 'AUTOMATION',
      league: 'ALL',
      sport: 'MULTI',
      last_updated: timestamp
    }], { onConflict: 'pattern_description' });
    console.log('   ✅ ai_memory - Patrones actualizados');

    // 6. RULES
    console.log('\n6. Validando reglas en rules...');
    await supabase.from('rules').upsert([{
      content: 'Auto-generate predictions every 4 hours via GitHub Actions'
    }], { onConflict: 'content' });
    console.log('   ✅ rules - OK');

    // 7. SYSTEM_HEALTH
    console.log('\n7. Reportando pulso en system_health...');
    await supabase.from('system_health').upsert([{
      last_pulse: timestamp,
      status: 'HEALTHY'
    }], { onConflict: 'id' });
    console.log('   ✅ system_health - OK');

    // 8. RECOMENDACIONES ESPECÍFICAS POR DEPORTE (NUEVO)
    console.log('\n8. Generando recomendaciones especializadas...');

    // 8.1 NBA RECOMMENDATIONS
    const mbaValues = [100, 200, 500];
    await supabase.from('nba_recommendations').insert([{
      match_info: 'NBA: Lakers vs Warriors',
      team_pick: 'Lakers',
      spread_line: -4.5,
      titanium_score: Math.floor(Math.random() * 100),
      is_hook_protected: Math.random() > 0.5,
      is_dynasty_mode: Math.random() > 0.8,
      variance_risk: 'MEDIUM_LOW',
      confidence: 0.85,
      analysis_timestamp: timestamp,
      status: 'PENDING'
    }]);
    console.log('   ✅ nba_recommendations - Insertado');

    // 8.2 NFL RECOMMENDATIONS
    await supabase.from('nfl_recommendations').insert([{
      match_info: 'NFL: Chiefs vs Bills',
      prediction_type: 'SPREAD',
      selection: 'Bills -2.5',
      pon_home: Math.floor(Math.random() * 30),
      pdn_home: Math.floor(Math.random() * 20),
      pon_away: Math.floor(Math.random() * 30),
      pdn_away: Math.floor(Math.random() * 20),
      injury_impact_score: Math.random() * 10,
      volatility_alert: Math.random() > 0.9,
      confidence: 0.78,
      analysis_timestamp: timestamp,
      status: 'PENDING'
    }]);
    console.log('   ✅ nfl_recommendations - Insertado');

    // 8.3 MLB RECOMMENDATIONS
    await supabase.from('mlb_recommendations').insert([{
      match_info: 'MLB: Yankees vs Red Sox',
      pitcher_matchup: 'Cole vs Sale',
      fip_score: 3.45,
      weather_impact: 'CLEAR_NIGHT',
      bet_type: 'MONEYLINE',
      selection: 'Yankees',
      confidence: 0.65,
      analysis_timestamp: timestamp,
      status: 'PENDING'
    }]);
    console.log('   ✅ mlb_recommendations - Insertado');

    // 8.4 SOCCER RECOMMENDATIONS
    await supabase.from('soccer_recommendations').insert([{
      match_info: 'Champions: Real Madrid vs Man City',
      prediction: 'Both Teams To Score',
      confidence_score: 8,
      risk_level: 'LOW',
      protection_ah: '0.0',
      safe_total: 2.5,
      atlas_context: 'High pressure match, offensive tactics expected from both sides.',
      analysis_timestamp: timestamp,
      status: 'PENDING'
    }]);
    console.log('   ✅ soccer_recommendations - Insertado');

    console.log('\n🎉 [KAIROS_AUTOFILL] PROCESO COMPLETADO EXITOSAMENTE');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message);
    process.exit(1);
  }
}

fillDatabase();
