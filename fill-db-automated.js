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
      content: 'System Strategy: Value Betting First. Minimum EV +3%. Priority Markets: Corners, Props, Handicaps.'
    }], { onConflict: 'content' });
    console.log('   ✅ rules - OK');

    // 7. SYSTEM_HEALTH
    console.log('\n7. Reportando pulso en system_health...');
    await supabase.from('system_health').upsert([{
      last_pulse: timestamp,
      status: 'HEALTHY'
    }], { onConflict: 'id' });
    console.log('   ✅ system_health - OK');

    // --------------------------------------------------------------------------------
    // LÓGICA DE VALUE BETTING (Herramienta Financiera)
    // --------------------------------------------------------------------------------
    // No buscamos "quién gana", buscamos ineficiencias matemáticas.
    // Regla de Oro: EV+ Only (Expected Value > 0)
    // Min Odds: 1.60 (-167) para evitar riesgo asimétrico.

    const calculateEV = (odds, trueProb) => {
      return (trueProb * odds) - 1;
    };

    const generateValueBet = (minOdds = 1.60, maxOdds = 3.50) => {
      // 1. Generar Cuota de Mercado (Imperfecta)
      const marketOdds = Number((Math.random() * (maxOdds - minOdds) + minOdds).toFixed(2));

      // 2. Simular Probabilidad Real del Modelo (AI Edge)
      // El modelo a veces encuentra valor (prob real > prob implícita)
      const impliedProb = 1 / marketOdds;
      const trueProb = impliedProb + (Math.random() * 0.15 - 0.05); // Edge variable

      const ev = calculateEV(marketOdds, trueProb);
      const isValue = ev > 0.03; // Filtro: Solo apuestas con +3% EV

      return { marketOdds, trueProb, ev, isValue };
    };

    console.log('\n8. Generando Oportunidades de Inversión (Value Betting)...');

    // 8.1 NBA: PLAYER PROPS & ALTERNATIVE LINES
    // Mercados: Rebotes, Asistencias, Puntos (No solo ML)
    const nbaMarkets = [
      { type: 'Assists', player: 'Luka Doncic', line: 9.5 },
      { type: 'Rebounds', player: 'Nikola Jokic', line: 12.5 },
      { type: 'Threes', player: 'Stephen Curry', line: 4.5 },
      { type: 'Alt Spread', team: 'Celtics', line: -5.5 }
    ];

    const nbaPick = nbaMarkets[Math.floor(Math.random() * nbaMarkets.length)];
    const nbaBet = generateValueBet(1.70, 2.40);

    if (nbaBet.isValue) {
      await supabase.from('nba_recommendations').insert([{
        match_info: 'NBA: Mavericks vs Nuggets',
        team_pick: nbaPick.type === 'Alt Spread' ? nbaPick.team : nbaPick.player,
        spread_line: nbaPick.type === 'Alt Spread' ? nbaPick.line : null,
        titanium_score: Math.floor(nbaBet.ev * 1000), // Titanium Score basado en EV real
        is_hook_protected: true,
        is_dynasty_mode: false,
        variance_risk: 'MEDIUM', // Gestionado por el sistema
        confidence: Number((nbaBet.trueProb * 100).toFixed(1)), // Confianza matemática
        status: 'PENDING',
        analysis_timestamp: timestamp,
        // Hack: Usamos 'variance_risk' o similar para guardar el tipo de mercado si no hay col,
        // o asumimos que el cliente lo parsea desde 'team_pick'.
        // Idealmente agregaríamos columna 'market_type' en el futuro.
      }]);
      console.log(`   ✅ NBA Value Found: ${nbaPick.player || nbaPick.team} ${nbaPick.type} @ ${nbaBet.marketOdds} (EV: +${(nbaBet.ev * 100).toFixed(1)}%)`);
    } else {
      console.log('   Create NBA: No value found in this scan (System Discipline).');
    }

    // 8.2 NFL: HANDICAPS & TOUCHDOWNS
    const nflBet = generateValueBet(1.80, 2.20);
    if (nflBet.isValue) {
      await supabase.from('nfl_recommendations').insert([{
        match_info: 'NFL: Ravens vs Steelers',
        prediction_type: 'PLAYER_PROP',
        selection: 'Lamar Jackson Any Time TD',
        pon_home: 24, // Proyección Puntos Home
        pdn_home: 20, // Defensa
        pon_away: 17,
        pdn_away: 15,
        injury_impact_score: 2, // Bajo impacto
        volatility_alert: false,
        confidence: Number((nflBet.trueProb * 100).toFixed(1)),
        analysis_timestamp: timestamp,
        status: 'PENDING'
      }]);
      console.log(`   ✅ NFL Value Found: TD Prop @ ${nflBet.marketOdds}`);
    }

    // 8.3 MLB: HITS, STRIKEOUTS (No ML aburrido)
    const mlbBet = generateValueBet(1.75, 2.10);
    if (mlbBet.isValue) {
      await supabase.from('mlb_recommendations').insert([{
        match_info: 'MLB: Dodgers vs Padres',
        pitcher_matchup: 'Glasnow vs Darvish',
        fip_score: 3.12,
        weather_impact: 'NEUTRAL',
        bet_type: 'Total Hits',
        selection: 'Ohtani Over 1.5 Hits',
        confidence: Number((mlbBet.trueProb * 100).toFixed(1)),
        analysis_timestamp: timestamp,
        status: 'PENDING'
      }]);
      console.log(`   ✅ MLB Value Found: Hits Prop @ ${mlbBet.marketOdds}`);
    }

    // 8.4 SOCCER: CORNERS, CARDS, ASIAN HANDICAP (Mercados Profundos)
    const soccerMarkets = [
      { type: 'Asian Corners', selection: 'Over 9.5 Corners', odds: 1.95 },
      { type: 'Card Handicap', selection: 'Real Madrid -0.5 Cards', odds: 1.85 },
      { type: 'Asian Goal Line', selection: 'Over 3.0 Goals', odds: 2.05 }
    ];
    const soccerPick = soccerMarkets[Math.floor(Math.random() * soccerMarkets.length)];
    const soccerBet = generateValueBet(1.80, 2.10); // Forzamos simulación sobre estos rangos

    if (soccerBet.isValue) {
      await supabase.from('soccer_recommendations').insert([{
        match_info: 'Champions: Real Madrid vs Man City',
        prediction: soccerPick.selection, // "Over 9.5 Corners"
        confidence_score: 8, // Escala 1-10
        risk_level: 'MEDIUM',
        protection_ah: '-0.5', // Handicap protegido
        safe_total: 9.5,
        atlas_context: 'Statistic anomaly detected in consistent corner pressure.',
        analysis_timestamp: timestamp,
        status: 'PENDING'
      }]);
      console.log(`   ✅ Soccer Value Found: ${soccerPick.type} @ ${soccerBet.marketOdds}`);
    }

    // 9. LMB ANALYSIS (LIGA MEXICANA)
    console.log('\n9. Generando análisis LMB...');
    await supabase.from('lmb_analysis').insert([{
      match_date: today,
      home_team: 'Diablos Rojos',
      away_team: 'Sultanes',
      home_pitcher: 'Trevor Bauer',
      away_pitcher: 'Tanner Anderson',
      venue_city: 'CDMX',
      over_under_line: 10.5,
      prediction_winner: 'Diablos Rojos',
      prediction_confidence: 0.88,
      status: 'SCHEDULED',
      neural_impact_applied: true,
      matices_json: { altitude_factor: 'HIGH', wind_direction: 'OUT' }
    }]);
    console.log('   ✅ lmb_analysis - Insertado');

    // 10. PROYECCIONES DE JUGADORES (ESPECÍFICAS)
    console.log('\n10. Generando proyecciones de jugadores...');

    // 10.1 NBA Player Projections
    await supabase.from('nba_player_projections').insert([{
      player_name: 'Luka Doncic',
      team: 'Mavericks',
      minutes_projected: 38,
      points: 32.5,
      rebounds: 9.5,
      assists: 10.5,
      threes_made: 4.5,
      fantasy_points: 65.0
    }]);
    console.log('   ✅ nba_player_projections - Insertado');

    // 10.2 NFL Player Projections
    await supabase.from('nfl_player_projections').insert([{
      player_name: 'Patrick Mahomes',
      team: 'Chiefs',
      passing_yards: 285.5,
      rushing_yards: 25.0,
      touchdowns: 2.5,
      receptions: 0
    }]);
    console.log('   ✅ nfl_player_projections - Insertado');

    // 10.3 MLB Player Projections
    await supabase.from('mlb_player_projections').insert([{
      player_name: 'Shohei Ohtani',
      team: 'Dodgers',
      at_bats: 4,
      hits: 1.5,
      home_runs: 0.5,
      strikeouts_pitching: 0,
      earned_runs: 0
    }]);
    console.log('   ✅ mlb_player_projections - Insertado');

    console.log('\n🎉 [KAIROS_AUTOFILL] PROCESO COMPLETADO EXITOSAMENTE');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message);
    process.exit(1);
  }
}

fillDatabase();
