import React, { useState, useEffect } from 'react';
import { 
  Award, Waves, Hammer, Target, Activity, Anchor, 
  Info, Cpu, Zap, Shield, Clock, TrendingUp,
  AlertTriangle, CheckCircle, Brain, RadioTower,
  BarChart3, GitBranch, Layers, Globe, Server,
  RefreshCw, Settings, Eye, EyeOff, Volume2, VolumeX
} from 'lucide-react';
import { SystemState, GovernanceMetrics } from '../types';

interface ToolbarProps {
  metrics: GovernanceMetrics;
  state: SystemState;
  systemStats?: {
    totalTickets: number;
    fireSignals: number;
    pendingAnalysis: number;
    uptime?: number;
  };
  onManualSync?: () => void;
}

interface ToolbarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  info: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  metrics, 
  state,
  systemStats,
  onManualSync
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTooltips, setShowTooltips] = useState(true);
  const [muteAlerts, setMuteAlerts] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format uptime
  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0d 0h';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h`;
  };

  const handleSync = async () => {
    if (syncing || !onManualSync) return;
    
    setSyncing(true);
    try {
      await onManualSync();
    } finally {
      setTimeout(() => setSyncing(false), 1000);
    }
  };

  const items: ToolbarItem[] = [
    {
      id: 'reputation',
      icon: <Award className="w-4 h-4" />,
      label: "Reputation Rank",
      value: metrics.reputationScore,
      info: "Puntaje de precisión histórica basado en aciertos previos. A mayor rango, mayor prioridad en el consenso neural. Calculado mediante algoritmos de machine learning.",
      color: 'text-virtus-aztecCyan',
      trend: 'up',
      trendValue: 2.4,
      status: 'good'
    },
    {
      id: 'quantum',
      icon: <Waves className={`w-4 h-4 ${state === SystemState.QUANTUM_COLLAPSE ? 'animate-pulse' : ''}`} />,
      label: "Quantum Phase",
      value: getQuantumPhase(state),
      info: "Estado del motor probabilístico cuántico. 'Collapsing' significa que el sistema está decidiendo entre múltiples realidades paralelas para generar pronósticos con máxima precisión.",
      color: state === SystemState.QUANTUM_COLLAPSE ? 'text-purple-400' : 'text-cyan-400',
      trend: 'neutral',
      status: state === SystemState.QUANTUM_COLLAPSE ? 'warning' : 'good'
    },
    {
      id: 'governance',
      icon: <Hammer className="w-4 h-4" />,
      label: "DAO Authority",
      value: `v8.3 Phoenix`,
      info: "Nivel de soberanía del sistema sobre el mercado. Indica que el sistema opera bajo protocolos de gobernanza descentralizada de nivel 8.3 con consenso automático.",
      color: 'text-virtus-aztecRed',
      trend: 'up',
      trendValue: 0.3,
      status: 'good'
    },
    {
      id: 'consensus',
      icon: <Target className="w-4 h-4" />,
      label: "Consensus Edge",
      value: `${(metrics.consensusStrength * 100).toFixed(1)}%`,
      info: "La ventaja matemática detectada frente a las casas de apuestas. Representa el 'edge' estadístico que separa las predicciones de KAIROS del azar común del mercado.",
      color: metrics.consensusStrength > 0.9 ? 'text-emerald-400' : 'text-amber-400',
      trend: metrics.consensusStrength > 0.92 ? 'up' : 'down',
      trendValue: metrics.consensusStrength > 0.92 ? 1.2 : -0.8,
      status: metrics.consensusStrength > 0.9 ? 'good' : 'warning'
    },
    {
      id: 'network',
      icon: <Activity className="w-4 h-4" />,
      label: "Network Pulse",
      value: systemStats?.pendingAnalysis ? `${systemStats.pendingAnalysis} queued` : "99.9% Active",
      info: "Salud y actividad de la red de satélites y silos de datos. Monitorea latencia, throughput y disponibilidad de todas las fuentes de información en tiempo real.",
      color: systemStats?.pendingAnalysis && systemStats.pendingAnalysis > 10 ? 'text-amber-400' : 'text-cyan-400',
      trend: systemStats?.pendingAnalysis && systemStats.pendingAnalysis > 5 ? 'up' : 'neutral',
      trendValue: systemStats?.pendingAnalysis || 0,
      status: systemStats?.pendingAnalysis && systemStats.pendingAnalysis > 10 ? 'warning' : 'good'
    },
    {
      id: 'neural',
      icon: <Brain className="w-4 h-4" />,
      label: "Neural Anchors",
      value: systemStats?.fireSignals ? `${systemStats.fireSignals} FIRE` : "SHA-LOCKED",
      info: "Anclajes neuronales inmutables que garantizan la integridad de cada señal. Cada predicción se sella con criptografía cuántica para prevenir alteraciones.",
      color: systemStats?.fireSignals ? 'text-red-400' : 'text-gray-400',
      trend: systemStats?.fireSignals && systemStats.fireSignals > 0 ? 'up' : 'neutral',
      trendValue: systemStats?.fireSignals || 0,
      status: systemStats?.fireSignals && systemStats.fireSignals > 3 ? 'critical' : 'good'
    },
    {
      id: 'signals',
      icon: <BarChart3 className="w-4 h-4" />,
      label: "Total Signals",
      value: systemStats?.totalTickets || 0,
      info: "Número total de señales procesadas por el sistema. Incluye análisis completos, predicciones y backtesting desde el inicio de la sesión actual.",
      color: 'text-virtus-primary',
      trend: 'up',
      trendValue: 12.5,
      status: 'good'
    },
    {
      id: 'uptime',
      icon: <Server className="w-4 h-4" />,
      label: "System Uptime",
      value: formatUptime(systemStats?.uptime),
      info: "Tiempo de actividad continua del sistema KAIROS V8. Incluye análisis en tiempo real, procesamiento neural y sincronización con satélites de datos.",
      color: 'text-emerald-400',
      trend: 'up',
      status: 'good'
    }
  ];

  function getQuantumPhase(state: SystemState): string {
    switch(state) {
      case SystemState.QUANTUM_COLLAPSE: return "Collapsing";
      case SystemState.BLACK_SWAN_SCAN: return "Black Swan Scan";
      case SystemState.ANALYSIS_ACTIVE: return "Analysis Active";
      case SystemState.SCANNING: return "Scanning";
      case SystemState.MIDNIGHT_SYNC: return "Sync Active";
      default: return "Synchronized";
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral', value?: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    } else if (trend === 'down') {
      return <TrendingUp className="w-3 h-3 text-red-400 transform rotate-180" />;
    }
    return <Activity className="w-3 h-3 text-gray-400" />;
  };

  const getStatusIndicator = (status: 'good' | 'warning' | 'critical' | 'neutral') => {
    switch(status) {
      case 'good': return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>;
      case 'warning': return <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b] animate-pulse"></div>;
      case 'critical': return <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444] animate-pulse"></div>;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>;
    }
  };

  return (
    <div className="h-14 bg-gradient-to-r from-black/95 to-slate-950/95 border-t border-virtus-aztecCyan/30 flex items-center px-6 gap-8 overflow-x-auto no-scrollbar backdrop-blur-xl relative z-50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-virtus-aztecCyan to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-virtus-aztecRed to-transparent opacity-30"></div>
      
      {/* System Status Indicator */}
      <div className="flex items-center gap-3 shrink-0 border-r border-white/10 pr-6">
        <div className="relative">
          <Cpu className={`w-5 h-5 ${
            state === SystemState.ANALYSIS_ACTIVE || state === SystemState.QUANTUM_COLLAPSE
              ? 'text-virtus-aztecCyan animate-pulse'
              : 'text-emerald-400'
          }`} />
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
            state === SystemState.ANALYSIS_ACTIVE ? 'bg-virtus-aztecCyan animate-ping' :
            state === SystemState.QUANTUM_COLLAPSE ? 'bg-purple-500 animate-ping' :
            'bg-emerald-500'
          }`}></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 uppercase font-black leading-none tracking-widest">System State</span>
          <span className="text-[11px] text-white font-mono font-bold leading-none mt-1.5 tracking-tighter">
            {state.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Metrics Items */}
      <div className="flex items-center gap-8 flex-1 overflow-x-auto no-scrollbar">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 group relative cursor-help shrink-0 transition-all duration-200 hover:scale-105"
          >
            <div className={`p-2 rounded-lg bg-black/40 border ${item.status === 'critical' ? 'border-red-500/30' : item.status === 'warning' ? 'border-amber-500/30' : 'border-white/10'} group-hover:border-virtus-aztecCyan/50 transition-colors relative`}>
              {item.icon}
              {item.trend && item.trend !== 'neutral' && (
                <div className="absolute -top-1 -right-1">
                  {getTrendIcon(item.trend, item.trendValue)}
                </div>
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase font-black leading-none tracking-widest">{item.label}</span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[12px] font-mono font-bold leading-none tracking-tighter ${item.color}`}>
                  {item.value}
                </span>
                {item.trendValue && item.trend !== 'neutral' && (
                  <span className={`text-[9px] font-mono ${item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.trend === 'up' ? '+' : ''}{item.trendValue}%
                  </span>
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              {getStatusIndicator(item.status || 'neutral')}
            </div>
            
            {/* Enhanced Tooltip */}
            {showTooltips && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-72 bg-gradient-to-b from-slate-900 to-black border border-virtus-aztecCyan/40 p-4 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-[100] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-xs font-black text-white uppercase tracking-wider">{item.label}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-[8px] font-black ${item.color} bg-black/30 border ${item.status === 'critical' ? 'border-red-500/30' : item.status === 'warning' ? 'border-amber-500/30' : 'border-current/30'}`}>
                    {item.status?.toUpperCase()}
                  </div>
                </div>
                
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{item.info}</p>
                
                <div className="flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-1 text-virtus-aztecCyan/70 font-mono">
                    <Shield className="w-3 h-3" />
                    VERIFIED_PROTOCOL_v8.3
                  </div>
                  <div className="text-gray-500">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {/* Tooltip arrow */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-slate-900 border-r border-b border-virtus-aztecCyan/40"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right-side Controls */}
      <div className="flex items-center gap-4 border-l border-white/10 pl-6 shrink-0">
        {/* Time Display */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[8px] text-gray-600 font-black uppercase">Local Time</span>
          <span className="text-[11px] text-gray-300 font-mono font-bold">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTooltips(!showTooltips)}
            className={`p-1.5 rounded-lg border transition-all ${showTooltips ? 'bg-virtus-aztecCyan/10 border-virtus-aztecCyan/30 text-virtus-aztecCyan' : 'border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            title={showTooltips ? "Hide tooltips" : "Show tooltips"}
          >
            {showTooltips ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={() => setMuteAlerts(!muteAlerts)}
            className={`p-1.5 rounded-lg border transition-all ${muteAlerts ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            title={muteAlerts ? "Unmute alerts" : "Mute alerts"}
          >
            {muteAlerts ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          
          {onManualSync && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`p-1.5 rounded-lg border transition-all ${syncing ? 'animate-spin bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              title="Manual sync"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          
          <button
            className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
            title="System settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {/* Core Engine Status */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-gray-600 font-black uppercase">Core Engine</span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              KAIROS_v8.3
            </span>
          </div>
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  );
};