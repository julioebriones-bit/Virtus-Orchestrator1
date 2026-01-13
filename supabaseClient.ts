
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BetTicket, ModuleType, GlobalIntelligence, GlobalSummary, BetStatus } from './types';

// --- INFRAESTRUCTURA KAIROS v3.1 (SCHEMA COMPATIBLE) ---

const SUPABASE_URL = 'https://leoenlegychbjxzmmfrk.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb2VubGVneWNoYmp4em1tZnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzExNzIsImV4cCI6MjA4MzI0NzE3Mn0.Qv4vmfDQ_A2DXGqUdT-KFDKlBcN6lhBUFMJwAXCexKs';

// Claves adicionales para diferentes roles
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_KEY;

// Definición explícita de columnas para evitar PGRST204 (metadata error)
const TICKET_FIELDS = 'id, game_id, module, home_team, away_team, prediction, edge, stake, summary, status, is_fire_signal, top_prop, neural_anchor, created_at';

// Tablas detectadas en el esquema actual
const schemaDiscovery = {
  tables: new Set<string>([
    'tickets', 'rules', 'ai_memory', 'system_health', 'system_logs',
    'matches', 'predictions', 'bet_recommendations', 'nba_recommendations',
    'nfl_recommendations', 'mlb_recommendations', 'soccer_recommendations',
    'service_api_keys', 'auto_analysis', 'games', 'tennis_matches',
    'lmb_analysis', 'ncaa_analysis', 'soccer_analysis', 'player_projections'
  ]),
  missingTables: new Set<string>()
};

const getActiveKey = () => localStorage.getItem('KAIROS_SUPABASE_OVERRIDE') || DEFAULT_KEY;

// Cliente principal (anon key)
export let supabase: SupabaseClient = createClient(SUPABASE_URL, getActiveKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente admin (service role key para GitHub Actions)
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const rotateSupabaseKey = (newKey: string) => {
  localStorage.setItem('KAIROS_SUPABASE_OVERRIDE', newKey);
  supabase = createClient(SUPABASE_URL, newKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  schemaDiscovery.missingTables.clear();
  console.log('⚡ KAIROS: Supabase Client re-initialized.');
};

export const resetSupabaseKey = () => {
  localStorage.removeItem('KAIROS_SUPABASE_OVERRIDE');
  window.location.reload();
};

/**
 * Formatea errores de Supabase para que sean legibles en consola.
 */
const logCloudError = (context: string, error: any, tableName?: string) => {
  if (!error) return;
  
  const message = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  const code = error.code || 'UNKNOWN_CODE';
  const details = error.details || '';

  // PGRST205 / 42P01 indica tabla inexistente
  if (code === '42P01' || code === 'PGRST205' || message.includes('does not exist') || message.includes('Could not find the table')) {
    if (tableName) {
      schemaDiscovery.missingTables.add(tableName);
      schemaDiscovery.tables.delete(tableName);
    }
    console.warn(`[KAIROS_DB] Tabla '${tableName}' omitida. No se encuentra en el esquema de Supabase.`);
    return;
  }

  // PGRST204 indica columna inexistente
  if (code === 'PGRST204') {
    console.warn(`[KAIROS_DB] Error de columna en '${tableName}': ${message}. Asegúrate de que el esquema de la tabla sea el correcto.`);
    return;
  }

  if (message.includes('apikey') || message.includes('JWT') || code === 'PGRST301') {
    console.error(`[KAIROS_AUTH] Error de Llave API: ${message}`);
    window.dispatchEvent(new CustomEvent('kairos-auth-error', { 
      detail: { type: 'AUTH_FAILURE', message: message } 
    }));
    return;
  }

  console.error(`❌ Cloud Error (${context}): Code ${code} - ${message} ${details ? `(${details})` : ''}`);
};

// ==================== TIPOS ADICIONALES ====================
export interface AIMemory {
  id?: number;
  pattern_description: string;
  impact_score?: number;
  times_verified?: number;
  last_updated?: string;
  success_count?: number;
  fail_count?: number;
  neural_weight?: number;
  category?: string;
  league?: string;
  sport?: string;
}

export interface Match {
  id?: number;
  match_uuid?: string;
  sport_type: 'NBA' | 'NFL' | 'MLB' | 'FÚTBOL' | 'TENNIS' | 'GENERAL';
  home_team: string;
  away_team: string;
  match_date: string | Date;
  league?: string;
  status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  home_score?: number;
  away_score?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Prediction {
  id?: number;
  prediction_uuid?: string;
  match_id: number;
  predictor_source: 'GEMINI_AI' | 'KAIROS_SYSTEM' | 'MANUAL' | 'GITHUB_ACTION';
  prediction_data: any;
  confidence?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  outcome?: 'WIN' | 'LOSS' | 'PUSH' | 'PENDING';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BetRecommendation {
  id?: string;
  match_id?: string;
  match_info: string;
  tournament: string;
  surface: string;
  recommended_player: string;
  bet_amount: number;
  odds: number;
  expected_value: number;
  confidence: number;
  value_rating: string;
  analysis_timestamp: string | Date;
  status?: 'pending' | 'won' | 'lost' | 'void';
}

export interface SystemLog {
  id?: number;
  log_uuid?: string;
  log_type: 'CRON_EXECUTION' | 'WEBHOOK' | 'ERROR' | 'INFO' | 'DEBUG';
  source: 'VERCEL' | 'GITHUB' | 'AI_STUDIO' | 'MANUAL';
  message: string;
  data?: any;
  created_at?: string;
}

export interface SystemHealth {
  id?: number;
  last_pulse?: string;
  status?: string;
}

export interface Rule {
  id?: number;
  content: string;
}

export interface ServiceApiKey {
  id?: number;
  key_uuid?: string;
  service_name: 'GITHUB_ACTIONS' | 'AI_STUDIO' | 'VERCEL_CRON' | 'INTERNAL_API';
  api_key_hash: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  last_used_at?: string;
}

// ==================== FUNCIONES EXISTENTES (ACTUALIZADAS) ====================

export async function fetchTickets(module?: ModuleType): Promise<BetTicket[]> {
  if (schemaDiscovery.missingTables.has('tickets')) return [];
  try {
    // Especificamos campos explícitamente para evitar PGRST204 si PostgREST intenta traer 'metadata'
    let query = supabase.from('tickets').select(TICKET_FIELDS);
    query = query.order('created_at', { ascending: false });

    if (module && module !== ModuleType.NONE && module !== ModuleType.GENERAL) {
      query = query.eq('module', module);
    }
    
    const { data, error } = await query.limit(100);
    if (error) { 
      logCloudError('fetchTickets', error, 'tickets'); 
      return []; 
    }
    
    return (data || []).map(t => ({
      id: t.game_id || t.id,
      module: t.module as ModuleType,
      homeTeam: t.home_team,
      awayTeam: t.away_team,
      prediction: t.prediction,
      edge: t.edge,
      stake: t.stake,
      summary: t.summary,
      timestamp: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
      status: t.status as BetStatus,
      isFireSignal: t.is_fire_signal,
      topProp: t.top_prop,
      neuralAnchor: t.neural_anchor,
      expectedMetrics: undefined,
      quantumMetrics: undefined
    }));
  } catch (e) { return []; }
}

export async function saveTicket(ticket: BetTicket): Promise<boolean> {
  if (schemaDiscovery.missingTables.has('tickets')) return false;
  try {
    // Se elimina la columna 'metadata' para cumplir con el esquema real de la tabla 'tickets'
    const payload = {
      game_id: ticket.id,
      module: ticket.module,
      home_team: ticket.homeTeam,
      away_team: ticket.awayTeam,
      prediction: ticket.prediction,
      edge: ticket.edge,
      stake: ticket.stake,
      summary: ticket.summary,
      status: ticket.status,
      is_fire_signal: ticket.isFireSignal,
      top_prop: ticket.topProp || '',
      neural_anchor: ticket.neuralAnchor || '',
      created_at: new Date(ticket.timestamp).toISOString()
    };

    // Forzamos el retorno de una sola columna conocida para evitar que PostgREST pida todas las columnas (incluyendo metadata)
    const { error } = await supabase
      .from('tickets')
      .upsert(payload, { onConflict: 'game_id' })
      .select('game_id');
    
    if (error) {
      logCloudError('saveTicket', error, 'tickets');
      return false;
    }
    
    console.info(`✅ [KAIROS_CLOUD] Persistencia exitosa: ${ticket.homeTeam} vs ${ticket.awayTeam}`);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Adaptación: Se usa la tabla 'rules' que sí existe en el esquema.
 */
export async function fetchRules(): Promise<string[]> {
  if (schemaDiscovery.missingTables.has('rules')) return [];
  try {
    const { data, error } = await supabase.from('rules').select('content').order('id', { ascending: true });
    if (error) { logCloudError('fetchRules', error, 'rules'); return []; }
    return (data || []).map(r => r.content || String(r));
  } catch (e) { return []; }
}

/**
 * Adaptación: Se usa la tabla 'ai_memory' para inteligencia global.
 */
export async function fetchGlobalIntelligence(): Promise<GlobalIntelligence[]> {
  if (schemaDiscovery.missingTables.has('ai_memory')) return [];
  try {
    const { data, error } = await supabase.from('ai_memory').select('category, sport, league, impact_score').order('impact_score', { ascending: false }).limit(20);
    if (error) { logCloudError('fetchGlobalIntelligence', error, 'ai_memory'); return []; }
    return (data || []).map(m => ({
      sport: m.category || m.sport || 'GENERAL',
      league: m.league || 'ALL',
      avg_efficiency: m.impact_score || 0,
      sample_size: 0
    }));
  } catch (e) { return []; }
}

/**
 * Adaptación: Se usa la tabla 'system_health' para el resumen global.
 */
export async function fetchGlobalSummary(): Promise<GlobalSummary | null> {
  if (schemaDiscovery.missingTables.has('system_health')) return null;
  try {
    const { data, error } = await supabase.from('system_health').select('status, last_pulse').order('last_pulse', { ascending: false }).limit(1).maybeSingle();
    if (error) { logCloudError('fetchGlobalSummary', error, 'system_health'); return null; }
    if (!data) return null;
    return { 
      total_analyses: 0, 
      success_rate: 0, 
      system_status: data.status || 'OPERATIONAL' 
    };
  } catch (e) { return null; }
}

// ==================== FUNCIONES NUEVAS CORREGIDAS ====================

/**
 * Función para "system_metrics" - USAR system_health y system_logs
 */
export async function fetchSystemMetrics(): Promise<any> {
  if (schemaDiscovery.missingTables.has('system_health') || schemaDiscovery.missingTables.has('system_logs')) {
    return {
      health_status: 'UNKNOWN',
      last_pulse: new Date().toISOString(),
      errors_last_24h: 0,
      total_logs_last_24h: 0,
      timestamp: new Date().toISOString(),
    };
  }
  
  try {
    // Obtener health status
    const { data: healthData, error: healthError } = await supabase
      .from('system_health')
      .select('status, last_pulse')
      .order('last_pulse', { ascending: false })
      .limit(1)
      .single();

    // Obtener conteos de logs recientes
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count: errorCount } = await supabase
      .from('system_logs')
      .select('id', { count: 'exact', head: true })
      .eq('log_type', 'ERROR')
      .gte('created_at', twentyFourHoursAgo);

    const { count: totalLogs } = await supabase
      .from('system_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo);

    if (healthError) {
      logCloudError('fetchSystemMetrics', healthError, 'system_health');
    }

    return {
      health_status: healthData?.status || 'UNKNOWN',
      last_pulse: healthData?.last_pulse || new Date().toISOString(),
      errors_last_24h: errorCount || 0,
      total_logs_last_24h: totalLogs || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logCloudError('fetchSystemMetrics', error);
    return {
      health_status: 'ERROR',
      last_pulse: new Date().toISOString(),
      errors_last_24h: 0,
      total_logs_last_24h: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Función para "system_config" - USAR service_api_keys
 */
export async function fetchSystemConfig(): Promise<ServiceApiKey[]> {
  if (schemaDiscovery.missingTables.has('service_api_keys')) return [];
  
  try {
    const { data, error } = await supabase
      .from('service_api_keys')
      .select('*')
      .eq('is_active', true)
      .order('service_name', { ascending: true });

    if (error) {
      logCloudError('fetchSystemConfig', error, 'service_api_keys');
      return [];
    }

    return data as ServiceApiKey[];
  } catch (error) {
    logCloudError('fetchSystemConfig', error);
    return [];
  }
}

// ==================== FUNCIONES ADICIONALES ====================

export async function fetchMatches(options?: {
  sportType?: string;
  status?: string;
  league?: string;
  limit?: number;
}): Promise<Match[]> {
  if (schemaDiscovery.missingTables.has('matches')) return [];
  
  const { sportType, status, league, limit = 100 } = options || {};

  try {
    let query = supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (sportType) {
      query = query.eq('sport_type', sportType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (league) {
      query = query.eq('league', league);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logCloudError('fetchMatches', error, 'matches');
      return [];
    }

    return data as Match[];
  } catch (error) {
    logCloudError('fetchMatches', error);
    return [];
  }
}

export async function fetchPredictions(options?: {
  matchId?: number;
  outcome?: string;
  limit?: number;
}): Promise<Prediction[]> {
  if (schemaDiscovery.missingTables.has('predictions')) return [];
  
  const { matchId, outcome, limit = 100 } = options || {};

  try {
    let query = supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (matchId) {
      query = query.eq('match_id', matchId);
    }

    if (outcome) {
      query = query.eq('outcome', outcome);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logCloudError('fetchPredictions', error, 'predictions');
      return [];
    }

    return data as Prediction[];
  } catch (error) {
    logCloudError('fetchPredictions', error);
    return [];
  }
}

export async function fetchBetRecommendations(status?: string): Promise<BetRecommendation[]> {
  if (schemaDiscovery.missingTables.has('bet_recommendations')) return [];
  
  try {
    let query = supabase
      .from('bet_recommendations')
      .select('*')
      .order('analysis_timestamp', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      logCloudError('fetchBetRecommendations', error, 'bet_recommendations');
      return [];
    }

    return data as BetRecommendation[];
  } catch (error) {
    logCloudError('fetchBetRecommendations', error);
    return [];
  }
}

export async function fetchSystemLogs(options?: {
  logType?: string;
  source?: string;
  limit?: number;
}): Promise<SystemLog[]> {
  if (schemaDiscovery.missingTables.has('system_logs')) return [];
  
  const { logType, source, limit = 100 } = options || {};

  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (logType) {
      query = query.eq('log_type', logType);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logCloudError('fetchSystemLogs', error, 'system_logs');
      return [];
    }

    return data as SystemLog[];
  } catch (error) {
    logCloudError('fetchSystemLogs', error);
    return [];
  }
}

export async function logSystemEvent(
  logType: SystemLog['log_type'],
  source: SystemLog['source'],
  message: string,
  data?: any
): Promise<SystemLog | null> {
  if (schemaDiscovery.missingTables.has('system_logs')) return null;
  
  try {
    const { data: logData, error } = await supabase
      .from('system_logs')
      .insert([{
        log_type: logType,
        source,
        message,
        data: data || {},
        created_at: new Date().toISOString(),
      }])
      .select('id, log_type, source, message, created_at')
      .single();

    if (error) {
      logCloudError('logSystemEvent', error, 'system_logs');
      return null;
    }

    return logData as SystemLog;
  } catch (error) {
    logCloudError('logSystemEvent', error);
    return null;
  }
}

// ==================== FUNCIONES PARA GITHUB ACTIONS ====================

export const githubActionsClient = {
  // Funciones básicas con admin client
  fetchTickets: async (options?: any) => {
    try {
      let query = supabaseAdmin.from('tickets').select(TICKET_FIELDS);
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }
      
      query = query.order('created_at', { ascending: false });
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      logCloudError('githubActionsClient.fetchTickets', error);
      return [];
    }
  },
  
  insertTicket: async (ticket: any) => {
    try {
      // Evitamos pasar campos que no existen extrayendo solo los necesarios
      const { metadata, ...validTicket } = ticket;
      const { data, error } = await supabaseAdmin
        .from('tickets')
        .insert([{
          ...validTicket,
          created_at: new Date().toISOString(),
        }])
        .select('game_id')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logCloudError('githubActionsClient.insertTicket', error);
      return null;
    }
  },
  
  insertPrediction: async (prediction: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('predictions')
        .insert([{
          ...prediction,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logCloudError('githubActionsClient.insertPrediction', error);
      return null;
    }
  },
  
  upsertAIMemory: async (memory: Partial<AIMemory>) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('ai_memory')
        .upsert([{
          ...memory,
          last_updated: new Date().toISOString(),
        }], { 
          onConflict: 'pattern_description' 
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logCloudError('githubActionsClient.upsertAIMemory', error);
      return null;
    }
  },

  logSystemEvent: async (
    logType: SystemLog['log_type'],
    source: SystemLog['source'],
    message: string,
    data?: any
  ) => {
    try {
      const { data: logData, error } = await supabaseAdmin
        .from('system_logs')
        .insert([{
          log_type: logType,
          source,
          message,
          data: data || {},
          created_at: new Date().toISOString(),
        }])
        .select('id')
        .single();

      if (error) throw error;
      return logData;
    } catch (error) {
      logCloudError('githubActionsClient.logSystemEvent', error);
      return null;
    }
  },

  verifyGitHubApiKey: async (apiKey: string) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('service_api_keys')
        .select('api_key_hash')
        .eq('service_name', 'GITHUB_ACTIONS')
        .eq('is_active', true)
        .single();

      if (error || !data) return false;
      
      return data.api_key_hash === apiKey;
    } catch (error) {
      logCloudError('githubActionsClient.verifyGitHubApiKey', error);
      return false;
    }
  },
  
  fetchActiveMatches: async (sportType?: string) => {
    try {
      let query = supabaseAdmin
        .from('matches')
        .select('*')
        .in('status', ['SCHEDULED', 'LIVE'])
        .order('match_date', { ascending: true });

      if (sportType) {
        query = query.eq('sport_type', sportType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      logCloudError('githubActionsClient.fetchActiveMatches', error);
      return [];
    }
  }
};

// ==================== EXPORT COMPLETO ====================

export default {
  // Clientes
  supabase,
  supabaseAdmin,
  
  // Funciones principales
  fetchTickets,
  saveTicket,
  fetchRules,
  fetchGlobalIntelligence,
  fetchGlobalSummary,
  
  // Funciones nuevas corregidas
  fetchSystemMetrics,
  fetchSystemConfig,
  
  // Funciones adicionales
  fetchMatches,
  fetchPredictions,
  fetchBetRecommendations,
  fetchSystemLogs,
  logSystemEvent,
  
  // Utilidades
  rotateSupabaseKey,
  resetSupabaseKey,
  
  // Cliente para GitHub Actions
  githubActionsClient,
  
  // Para debugging
  schemaDiscovery,
};
