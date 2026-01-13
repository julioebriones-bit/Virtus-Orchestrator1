
import React, { useState, useEffect, useMemo } from 'react';
import { ksm } from '../stateManager';
import { BetTicket, ModuleType, BetStatus, SystemState } from '../types';
import { 
  TrendingUp, History, RefreshCw, Flame, Globe, Target, 
  BarChart, Zap, Trophy, Cpu, Activity, AlertTriangle,
  CheckCircle, XCircle, Clock, Sparkles, ChevronRight,
  Filter, Settings, Brain, Shield, RadioTower, Eye,
  EyeOff, TrendingDown, DollarSign, Percent, BarChart3,
  Calendar, Layers, CheckSquare
} from 'lucide-react';

interface SidebarProps {
  onShowHistory: () => void;
  onSync?: () => Promise<void>;
  syncStatus?: 'syncing' | 'synced' | 'pending';
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onShowHistory, 
  onSync,
  syncStatus = 'synced'
}) => {
  const [tickets, setTickets] = useState<BetTicket[]>([]);
  const [currentSport, setCurrentSport] = useState<ModuleType>(ModuleType.NONE);
  const [systemState, setSystemState] = useState<SystemState>(SystemState.STANDBY);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [collapsed, setCollapsed] = useState(false);
  const [showOnlyFireSignals, setShowOnlyFireSignals] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  useEffect(() => {
    setTickets(ksm.getHistory());
    setCurrentSport(ksm.getCurrentSport());
    setSystemState(ksm.getSystemState());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setTickets([...ksm.getHistory()]);
      setCurrentSport(ksm.getCurrentSport());
      setSystemState(ksm.getSystemState());
      setLastUpdate(new Date());
    };
    window.addEventListener('kairos-state-update', handleUpdate);
    return () => window.removeEventListener('kairos-state-update', handleUpdate);
  }, []);

  const { stats } = useMemo(() => {
    let filtered = [...tickets];
    if (currentSport !== ModuleType.NONE) filtered = filtered.filter(t => t.module === currentSport);
    if (showOnlyFireSignals) filtered = filtered.filter(t => t.isFireSignal);
    if (showOnlyPending) filtered = filtered.filter(t => t.status === 'PENDING');
    
    return {
      filteredTickets: filtered,
      stats: {
        total: filtered.length,
        pending: filtered.filter(t => t.status === 'PENDING').length,
        won: filtered.filter(t => t.status === 'WON').length,
        lost: filtered.filter(t => t.status === 'LOST').length,
        fireSignals: filtered.filter(t => t.isFireSignal).length,
        avgEdge: filtered.length > 0 ? filtered.reduce((sum, t) => sum + t.edge, 0) / filtered.length : 0,
      }
    };
  }, [tickets, currentSport, showOnlyFireSignals, showOnlyPending]);

  if (collapsed) {
    return (
      <div className="w-16 bg-virtus-panel/95 border-r border-virtus-aztecCyan/20 flex flex-col shadow-2xl backdrop-blur-3xl">
        <button onClick={() => setCollapsed(false)} className="p-4 hover:bg-white/5 border-b border-white/10 flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-virtus-aztecCyan transform rotate-180" />
        </button>
        <div className="flex-1 flex flex-col items-center p-4 gap-6">
          <Calendar className="w-5 h-5 text-gray-500" />
          <RadioTower className="w-5 h-5 text-virtus-aztecCyan animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 bg-virtus-panel/95 border-r border-virtus-aztecCyan/20 flex flex-col shadow-2xl backdrop-blur-3xl relative overflow-hidden transition-all duration-300">
      <button onClick={() => setCollapsed(true)} className="absolute top-4 right-4 z-20 p-1.5 hover:bg-white/10 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-500" /></button>

      {/* MONITOR DE AUTOMATIZACIÓN 12:05 */}
      <div className="p-4 bg-black/40 border-b border-virtus-aztecCyan/10">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-virtus-aztecCyan" />
          <span className="text-[10px] font-black uppercase text-white tracking-widest">Cron Cycle: 12:05 AM</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
            <div className="flex items-center gap-2">
              <History className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] text-gray-400 font-mono">Post-Mortem Cycle</span>
            </div>
            <span className="text-[9px] font-black text-emerald-400">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-virtus-aztecCyan" />
              <span className="text-[9px] text-gray-400 font-mono">Daily Scouting</span>
            </div>
            <span className="text-[9px] font-black text-virtus-aztecCyan">READY</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-virtus-aztecCyan" />
            <div>
              <h2 className="text-xs font-mono font-black text-white tracking-[0.2em] uppercase">KAIROS_V8_CORE</h2>
              <p className="text-[8px] text-gray-500 font-mono">{systemState}</p>
            </div>
          </div>
          <div className="text-[9px] font-mono text-emerald-400">ONLINE</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setShowOnlyFireSignals(!showOnlyFireSignals)} className={`px-2 py-2 rounded border text-[8px] font-mono flex items-center gap-2 ${showOnlyFireSignals ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/5 text-gray-500'}`}>
            <Flame className="w-3 h-3" /> FIRE Signals
          </button>
          <button onClick={() => setShowOnlyPending(!showOnlyPending)} className={`px-2 py-2 rounded border text-[8px] font-mono flex items-center gap-2 ${showOnlyPending ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-white/5 text-gray-500'}`}>
            <Clock className="w-3 h-3" /> Pendientes
          </button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="px-4 py-3 border-b border-white/5 bg-black/20 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[7px] text-gray-500 uppercase">Signals</div>
          <div className="text-xs font-bold text-white font-mono">{stats.total}</div>
        </div>
        <div>
          <div className="text-[7px] text-gray-500 uppercase">Won</div>
          <div className="text-xs font-bold text-emerald-400 font-mono">{stats.won}</div>
        </div>
        <div>
          <div className="text-[7px] text-gray-500 uppercase">Lost</div>
          <div className="text-xs font-bold text-red-400 font-mono">{stats.lost}</div>
        </div>
      </div>

      {/* Lista de Señales del Ciclo Actual */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
          <RadioTower className="w-3 h-3" /> Últimos Pronósticos
        </div>
        {tickets.slice(0, 10).map(ticket => (
          <div key={ticket.id} className={`p-3 border rounded-lg bg-black/40 transition-all cursor-pointer border-white/5 hover:border-virtus-aztecCyan/30`}>
             <div className="flex justify-between items-start mb-1">
                <span className="text-[8px] font-black text-virtus-aztecCyan uppercase">{ticket.module}</span>
                <span className={`text-[7px] font-mono ${ticket.status === 'WON' ? 'text-emerald-400' : ticket.status === 'LOST' ? 'text-red-400' : 'text-amber-400'}`}>
                  {ticket.status}
                </span>
             </div>
             <div className="text-[10px] font-bold text-white truncate">{ticket.homeTeam} vs {ticket.awayTeam}</div>
             <div className="flex justify-between mt-2">
                <span className="text-[9px] font-mono text-gray-400">{ticket.prediction}</span>
                <span className="text-[9px] font-mono text-emerald-400">+{ticket.edge}%</span>
             </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/60">
        <button onClick={onShowHistory} className="w-full py-3 bg-white/5 hover:bg-virtus-aztecCyan/10 border border-white/10 rounded-xl text-[10px] font-black text-gray-300 hover:text-virtus-aztecCyan flex items-center justify-center gap-3 transition-all uppercase">
          <History className="w-4 h-4" /> Historial de Ciclos
        </button>
      </div>
    </aside>
  );
};
