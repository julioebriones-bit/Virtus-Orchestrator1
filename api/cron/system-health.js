import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  console.log('🔧 KAIROS_V8_SYSTEM_HEALTH: Verificando estado...');
  
  const startTime = Date.now();
  const healthCheck = {
    timestamp: new Date().toISOString(),
    services: {},
    metrics: {}
  };

  try {
    // 1. Verificar conexión a Supabase
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      healthCheck.services.supabase = {
        status: error ? 'error' : 'healthy',
        latency: Date.now() - startTime,
        error: error?.message
      };
    } catch (dbError) {
      healthCheck.services.supabase = {
        status: 'error',
        error: dbError.message
      };
    }

    // 2. Verificar estado general del sistema
    const { count: totalTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    const { count: pendingTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    healthCheck.metrics = {
      total_tickets: totalTickets || 0,
      pending_tickets: pendingTickets || 0,
      uptime: process.uptime()
    };

    // 3. Log del health check
    await supabase.from('system_health').insert([{
      check_type: 'scheduled',
      data: healthCheck,
      is_healthy: healthCheck.services.supabase?.status === 'healthy',
      created_at: new Date().toISOString()
    }]).catch(e => console.warn('No se pudo loggear health check:', e));

    const duration = Date.now() - startTime;
    console.log(`✅ Health check completado en ${duration}ms`);
    
    return res.json({
      success: true,
      status: 'operational',
      ...healthCheck,
      duration: `${duration}ms`
    });

  } catch (error) {
    console.error('❌ Health check error:', error);
    return res.status(500).json({
      success: false,
      status: 'degraded',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}