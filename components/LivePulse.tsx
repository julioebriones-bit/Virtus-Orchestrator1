
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ksm } from '../stateManager';
import { PulseEvent, ModuleType, SystemState } from '../types';
import { 
  Zap, Activity, Clock, RefreshCw, Filter, Bell, 
  Settings2, Trash2, AlertTriangle, AlertCircle, 
  CheckCircle, Info, RadioTower, Waves, Cpu,
  Sparkles, Eye, EyeOff, Volume2, VolumeX,
  ChevronDown, ChevronUp, Maximize2, Minimize2
} from 'lucide-react';

interface LivePulseProps {
  autoRefresh?: boolean;
  maxHeight?: number;
  onEventClick?: (event: PulseEvent) => void;
  showHeader?: boolean;
}

const getSeverityStyles = (severity: string) => {
  switch(severity) {
    case 'critical':
      return { 
        border: 'border-l-red-500', 
        icon: 'text-red-500', 
        bg: 'bg-gradient-to-r from-red-950/30 to-transparent',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        iconComp: <AlertTriangle className="w-3.5 h-3.5" />
      };
    case 'high': 
      return { 
        border: 'border-l-virtus-aztecRed', 
        icon: 'text-virtus-aztecRed', 
        bg: 'bg-gradient-to-r from-red-950/20 to-transparent',
        glow: 'shadow-[0_0_10px_rgba(255,0,60,0.2)]',
        iconComp: <AlertCircle className="w-3.5 h-3.5" />
      };
    case 'medium': 
      return { 
        border: 'border-l-virtus-accent', 
        icon: 'text-virtus-accent', 
        bg: 'bg-gradient-to-r from-amber-950/20 to-transparent',
        glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        iconComp: <AlertCircle className="w-3.5 h-3.5" />
      };
    default: 
      return { 
        border: 'border-l-virtus-aztecCyan', 
        icon: 'text-virtus-aztecCyan', 
        bg: 'bg-gradient-to-r from-cyan-950/10 to-transparent',
        glow: 'shadow-[0_0_5px_rgba(0,243,255,0.1)]',
        iconComp: <Info className="w-3.5 h-3.5" />
      };
  }
};

const getSportIcon = (sport: string) => {
  switch(sport.toUpperCase()) {
    case 'NBA': return '🏀';
    case 'NFL': return '🏈';
    case 'MLB': return '⚾';
    case 'LMB': return '⚾';
    case 'SOCCER': return '⚽';
    case 'NCAA': return '🎓';
    case 'TENNIS': return '🎾';
    case 'F1': return '🏎️';
    case 'SYSTEM': return '⚡';
    default: return '📊';
  }
};

const PulseItem: React.FC<{ 
  event: PulseEvent;
  onClick?: (event: PulseEvent) => void;
}> = ({ event, onClick }) => {
  const styles = getSeverityStyles(event.severity);
  const timeAgo = useMemo(() => {
    const diff = Date.now() - event.timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }, [event.timestamp]);

  return (
    <div 
      onClick={() => onClick && onClick(event)}
      className={`
        p-3 border-l-2 rounded-r-lg ${styles.border} ${styles.bg} ${styles.glow} 
        border-y border-r border-white/5 transition-all 
        hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]
        group relative overflow-hidden cursor-pointer
        animate-in slide-in-from-right duration-300
        ${onClick ? 'hover:border-white/10' : ''}
      `}
    >
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md ${styles.icon} bg-black/20`}>
            {styles.iconComp}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-gray-300 tracking-wider flex items-center gap-1">
              <span className="text-xs">{getSportIcon(event.sport)}</span>
              {event.sport}
            </span>
            <span className="text-[7px] text-gray-500 font-mono">{timeAgo}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {event.severity === 'critical' && (
            <div className="px-1.5 py-0.5 bg-red-500/20 rounded border border-red-500/30">
              <span className="text-[6px] font-black text-red-300 uppercase">CRITICAL</span>
            </div>
          )}
          <span className="text-[7px] font-mono text-gray-600 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      
      <p className="text-[11px] text-gray-200 font-medium leading-tight relative z-10 mt-1 pr-4">
        {event.message}
      </p>
      
      {/* Severity indicator dot */}
      <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${styles.icon} ${event.severity === 'critical' || event.severity === 'high' ? 'animate-pulse' : ''}`}></div>
      
      {/* Scanline decoration */}
      <div className="absolute inset-0 bg-scan-lines opacity-[0.02] pointer-events-none"></div>
    </div>
  );
};

export const LivePulse: React.FC<LivePulseProps> = ({ 
  autoRefresh = true, 
  maxHeight = 400,
  onEventClick,
  showHeader = true 
}) => {
  const [pulseData, setPulseData] = useState<PulseEvent[]>([]);
  const [filteredData, setFilteredData] = useState<PulseEvent[]>([]);
  const [currentSport, setCurrentSport] = useState<ModuleType>(ModuleType.NONE);
  const [systemState, setSystemState] = useState<SystemState>(SystemState.STANDBY);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(0);
  
  const [filters, setFilters] = useState({
    showAllSports: true,
    minSeverity: 'low' as 'low' | 'medium' | 'high' | 'critical',
    maxAge: 24, // hours
    onlyUnread: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    setPulseData(ksm.getActivityLog());
    setCurrentSport(ksm.getCurrentSport());
    setSystemState(ksm.getSystemState());
  }, []);

  // Subscribe to state updates
  useEffect(() => {
    const handleUpdate = () => {
      const newData = ksm.getActivityLog();
      setPulseData([...newData]);
      setCurrentSport(ksm.getCurrentSport());
      setSystemState(ksm.getSystemState());
      
      // Check for new high/critical events
      const newCriticalEvents = newData.filter(e => 
        (e.severity === 'critical' || e.severity === 'high') && 
        Date.now() - e.timestamp < 10000 // Last 10 seconds
      );
      
      if (newCriticalEvents.length > 0 && soundEnabled) {
        playAlertSound(newCriticalEvents[0].severity);
      }
      
      if (newCriticalEvents.length > 0) {
        setNotificationCount(prev => prev + newCriticalEvents.length);
      }
    };

    window.addEventListener('kairos-state-update', handleUpdate);

    if (autoRefresh) {
      refreshIntervalRef.current = window.setInterval(() => {
        setLastRefresh(new Date());
      }, 30000); // 30 seconds
    }

    return () => {
      window.removeEventListener('kairos-state-update', handleUpdate);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [autoRefresh, soundEnabled]);

  // Filter data
  useEffect(() => {
    let filtered = [...pulseData];
    
    // Filter by sport
    if (!filters.showAllSports && currentSport !== ModuleType.NONE) {
      filtered = filtered.filter(item => item.sport === currentSport || item.sport === 'SYSTEM');
    }
    
    // Filter by minimum severity
    const severityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
    const minLevel = severityLevels[filters.minSeverity];
    filtered = filtered.filter(item => severityLevels[item.severity] >= minLevel);
    
    // Filter by max age
    const maxAgeMs = filters.maxAge * 60 * 60 * 1000;
    filtered = filtered.filter(item => Date.now() - item.timestamp <= maxAgeMs);
    
    // Filter by read status
    if (filters.onlyUnread) {
      // In a real app, you'd track read/unread status
      filtered = filtered.slice(0, Math.min(filtered.length, 10));
    }
    
    setFilteredData(filtered.slice(0, 50)); // Limit to 50 events
  }, [filters, pulseData, currentSport]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: pulseData.length,
      critical: pulseData.filter(e => e.severity === 'critical').length,
      high: pulseData.filter(e => e.severity === 'high').length,
      medium: pulseData.filter(e => e.severity === 'medium').length,
      low: pulseData.filter(e => e.severity === 'low').length,
      lastHour: pulseData.filter(e => Date.now() - e.timestamp <= 3600000).length,
      systemEvents: pulseData.filter(e => e.sport === 'SYSTEM').length,
    };
  }, [pulseData]);

  // Play alert sound
  const playAlertSound = useCallback((severity: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Different frequencies for different severities
      oscillator.frequency.value = severity === 'critical' ? 880 : 440; // A5 or A4
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    ksm.logActivity('SYSTEM', '🔄 Protocolo de resincronización de telemetría activado', 'medium');
    setNotificationCount(0);
    
    // Simulate refresh delay
    setTimeout(() => {
      setPulseData([...ksm.getActivityLog()]);
      setIsLoading(false);
      setLastRefresh(new Date());
    }, 500);
  };

  // Clear all events
  const handleClearAll = () => {
    // In a real app, you'd want to archive or mark as read
    ksm.logActivity('SYSTEM', '🧹 Historial de telemetría limpiado manualmente', 'low');
    // Note: We can't clear the actual activity log as it's managed by stateManager
    // This is just for demonstration
  };

  // Handle event click
  const handleEventClick = (event: PulseEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  // Generate test data
  const generateTestData = () => {
    const testEvents: PulseEvent[] = [
      {
        id: `test-${Date.now()}-1`,
        sport: 'SYSTEM',
        message: '⚡ Sistema KAIROS V8 inicializado correctamente',
        timestamp: Date.now() - 5000,
        severity: 'low'
      },
      {
        id: `test-${Date.now()}-2`,
        sport: 'NBA',
        message: '🎯 Patrón neural detectado: Momentum reversión en Lakers vs Warriors',
        timestamp: Date.now() - 15000,
        severity: 'medium'
      },
      {
        id: `test-${Date.now()}-3`,
        sport: 'NFL',
        message: '🚨 Anomalía detectada: Line movement sospechoso en Chiefs vs Bills',
        timestamp: Date.now() - 30000,
        severity: 'high'
      },
      {
        id: `test-${Date.now()}-4`,
        sport: 'MLB',
        message: '✅ Señal FIRE confirmada: Yankees ML con edge del 8.5%',
        timestamp: Date.now() - 45000,
        severity: 'critical'
      }
    ];

    testEvents.forEach(event => {
      ksm.logActivity(event.sport, event.message, event.severity as any);
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`
        flex flex-col h-full overflow-hidden 
        bg-gradient-to-b from-black/40 to-slate-950/30
        border border-white/5 rounded-lg
        ${expanded ? 'fixed inset-4 z-50' : ''}
        transition-all duration-300
        shadow-[0_0_30px_rgba(0,0,0,0.5)]
      `}
      style={{ maxHeight: expanded ? 'none' : maxHeight }}
    >
      {/* Header */}
      {showHeader && (
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-900/90 to-black/90 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <RadioTower className="w-5 h-5 text-virtus-aztecCyan animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-virtus-aztecRed rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                LIVE PULSE v2
                <span className="text-[8px] text-virtus-aztecCyan bg-black/50 px-2 py-0.5 rounded-full">
                  REAL-TIME
                </span>
              </h3>
              <p className="text-[8px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">
                Telemetría Neural • {stats.total} eventos • {stats.lastHour}/h
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notification badge */}
            {notificationCount > 0 && (
              <div className="px-2 py-0.5 rounded-full bg-virtus-aztecRed animate-pulse">
                <span className="text-[8px] font-black text-white">{notificationCount}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded transition-all ${soundEnabled ? 'text-virtus-aztecCyan bg-virtus-aztecCyan/10' : 'text-gray-600 hover:text-gray-400'}`}
                title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded transition-all ${showFilters ? 'text-virtus-primary bg-virtus-primary/10' : 'text-gray-600 hover:text-gray-400'}`}
                title="Filtros"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={handleRefresh}
                className={`p-1.5 rounded text-gray-600 hover:text-gray-400 transition-transform ${isLoading ? 'animate-spin' : 'hover:rotate-180'}`}
                title="Actualizar"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded text-gray-600 hover:text-gray-400"
                title={expanded ? 'Minimizar' : 'Expandir'}
              >
                {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gradient-to-b from-slate-900/95 to-black/80 border-b border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            {/* Sport Filter */}
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase block mb-1.5">
                Deporte
              </label>
              <button 
                onClick={() => setFilters(f => ({ ...f, showAllSports: !f.showAllSports }))}
                className={`w-full px-3 py-2 rounded text-[10px] font-mono border transition-all flex items-center justify-between ${filters.showAllSports ? 'bg-virtus-aztecCyan/10 border-virtus-aztecCyan/30 text-virtus-aztecCyan' : 'bg-slate-800/50 border-slate-700 text-gray-300 hover:text-white'}`}
              >
                <span>{filters.showAllSports ? 'Todos los Deportes' : 'Módulo Actual'}</span>
                {filters.showAllSports ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase block mb-1.5">
                Severidad Mínima
              </label>
              <select
                value={filters.minSeverity}
                onChange={(e) => setFilters(f => ({ ...f, minSeverity: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white font-mono focus:outline-none focus:border-virtus-aztecCyan transition-colors cursor-pointer"
              >
                <option value="low" className="bg-slate-900">Baja</option>
                <option value="medium" className="bg-slate-900">Media</option>
                <option value="high" className="bg-slate-900">Alta</option>
                <option value="critical" className="bg-slate-900">Crítica</option>
              </select>
            </div>

            {/* Age Filter */}
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase block mb-1.5">
                Antigüedad Máxima
              </label>
              <select
                value={filters.maxAge}
                onChange={(e) => setFilters(f => ({ ...f, maxAge: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white font-mono focus:outline-none focus:border-virtus-aztecCyan transition-colors cursor-pointer"
              >
                <option value="1" className="bg-slate-900">1 hora</option>
                <option value="6" className="bg-slate-900">6 horas</option>
                <option value="24" className="bg-slate-900">24 horas</option>
                <option value="168" className="bg-slate-900">7 días</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end gap-2">
              <button
                onClick={handleClearAll}
                className="px-3 py-2 bg-red-900/20 hover:bg-red-900/30 border border-red-800/30 rounded text-[10px] text-red-300 font-mono transition-colors"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
            <div className="text-center">
              <div className="text-[8px] text-gray-500 uppercase">Críticas</div>
              <div className="text-sm font-bold text-red-500">{stats.critical}</div>
            </div>
            <div className="text-center">
              <div className="text-[8px] text-gray-500 uppercase">Altas</div>
              <div className="text-sm font-bold text-virtus-aztecRed">{stats.high}</div>
            </div>
            <div className="text-center">
              <div className="text-[8px] text-gray-500 uppercase">Medias</div>
              <div className="text-sm font-bold text-virtus-accent">{stats.medium}</div>
            </div>
            <div className="text-center">
              <div className="text-[8px] text-gray-500 uppercase">Bajas</div>
              <div className="text-sm font-bold text-virtus-aztecCyan">{stats.low}</div>
            </div>
          </div>
        </div>
      )}

      {/* Pulse Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar scroll-smooth relative">
        {/* System Status Indicator */}
        <div className="sticky top-0 z-10 mb-3">
          <div className="bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className={`w-4 h-4 ${systemState === SystemState.ANALYSIS_ACTIVE ? 'text-virtus-aztecCyan animate-pulse' : 'text-gray-400'}`} />
                <span className="text-[10px] font-mono text-gray-400">
                  Estado: <span className="text-white font-bold">{systemState}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-gray-600">
                  {filteredData.length} eventos
                </span>
                <button
                  onClick={generateTestData}
                  className="px-2 py-1 text-[8px] bg-virtus-primary/10 border border-virtus-primary/30 text-virtus-primary rounded hover:bg-virtus-primary/20 transition-colors"
                >
                  Test Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredData.length > 0 ? (
          filteredData.map(ev => (
            <PulseItem 
              key={ev.id} 
              event={ev} 
              onClick={handleEventClick}
            />
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center opacity-40 text-center px-8 py-10">
            <Waves className="w-12 h-12 mb-4 text-gray-700" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-600 mb-2">
              Canal de Telemetría Inactivo
            </span>
            <p className="text-[10px] font-mono text-gray-700 leading-tight max-w-md mb-4">
              El sistema no ha detectado actividad reciente. 
              Inicie un escaneo orbital para recibir telemetría en tiempo real.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={generateTestData}
                className="px-4 py-2 bg-virtus-primary/10 hover:bg-virtus-primary/20 border border-virtus-primary/30 rounded-lg text-xs font-mono text-virtus-primary hover:text-white transition-all"
              >
                Cargar Datos de Prueba
              </button>
              <button 
                onClick={() => ksm.logActivity('SYSTEM', '🔍 Iniciando escaneo orbital de calibración...', 'medium')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition-all"
              >
                Generar Evento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${systemState === SystemState.ANALYSIS_ACTIVE ? 'bg-virtus-aztecCyan animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-[9px] font-mono text-gray-500 uppercase">
            {systemState === SystemState.ANALYSIS_ACTIVE ? 'ANALYSIS_ACTIVE' : 'SYSTEM_STABLE'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-mono text-gray-600 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div className="flex items-center gap-2">
            {['critical', 'high', 'medium', 'low'].map(severity => (
              <div key={severity} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${getSeverityStyles(severity).icon}`}></div>
                <span className="text-[8px] text-gray-600">{stats[severity as keyof typeof stats]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};