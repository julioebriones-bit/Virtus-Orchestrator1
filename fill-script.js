import { createClient } from '@supabase/supabase-js';

/**
 * KAIROS V8 - DATABASE SEED SCRIPT (ESM VERSION)
 * Este script inicializa los datos maestros necesarios para el funcionamiento del orquestador.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://leoenlegychbjxzmmfrk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERROR: La variable de entorno SUPABASE_SERVICE_KEY no está definida.');
  console.error('Asegúrate de configurarla en tus Secrets de GitHub o en tu archivo .env local.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runSeed() {
  console.log('🚀 [KAIROS_DB] Iniciando proceso de siembra de datos...');

  // 1. Poblar Reglas del Sistema (Tabla: rules)
  const initialRules = [
    { content: "Priorizar mercados con volumen de apuestas superior al 70% en favoritos." },
    { content: "Ignorar partidos con condiciones climáticas extremas (>35°C o lluvia pesada) en ligas menores." },
    { content: "Validar lesiones de jugadores clave (Tier 1) antes de emitir FIRE signals." },
    { content: "El Edge mínimo para una recomendación estándar es 8.5%." },
    { content: "No operar en ligas con baja liquidez o reportes de integridad dudosa." }
  ];

  console.log('📝 Sincronizando reglas de análisis...');
  const { error: rulesError } = await supabase.from('rules').upsert(initialRules);
  if (rulesError) {
    console.error('⚠️ Error en tabla rules:', rulesError.message);
  } else {
    console.log('✅ Reglas insertadas/actualizadas.');
  }

  // 2. Poblar Memoria Neural Inicial (Tabla: ai_memory)
  const initialMemory = [
    { 
      category: 'NBA', 
      sport: 'BASKETBALL', 
      pattern_description: 'Alta eficiencia en Underdogs locales tras 2 derrotas consecutivas', 
      impact_score: 0.82 
    },
    { 
      category: 'SOCCER', 
      sport: 'FOOTBALL', 
      pattern_description: 'Tendencia de Over 2.5 en la Premier League con árbitros permisivos', 
      impact_score: 0.75 
    },
    { 
      category: 'MLB', 
      sport: 'BASEBALL', 
      pattern_description: 'Ventaja en pitchers abridores con ERA < 3.00 en juegos nocturnos', 
      impact_score: 0.88 
    }
  ];

  console.log('🧠 Inicializando memoria neural...');
  const { error: memoryError } = await supabase.from('ai_memory').upsert(initialMemory);
  if (memoryError) {
    console.error('⚠️ Error en tabla ai_memory:', memoryError.message);
  } else {
    console.log('✅ Memoria neural poblada.');
  }

  // 3. Establecer Salud Inicial del Sistema (Tabla: system_health)
  console.log('📊 Actualizando estado de salud global...');
  const { error: healthError } = await supabase.from('system_health').upsert({
    status: 'OPERATIONAL',
    last_pulse: new Date().toISOString()
  });

  if (healthError) {
    console.error('⚠️ Error en tabla system_health:', healthError.message);
  } else {
    console.log('✅ Pulso de sistema reportado como OPERATIVO.');
  }

  console.log('✨ [KAIROS_DB] Proceso de inicialización finalizado con éxito.');
}

runSeed().catch(err => {
  console.error('❌ ERROR CRÍTICO durante la ejecución:', err);
  process.exit(1);
});
