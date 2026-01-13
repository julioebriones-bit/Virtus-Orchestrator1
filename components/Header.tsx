
import React from 'react';
import { Cpu, Zap, Activity, Heart, ShieldCheck, RefreshCw, Wifi, WifiOff, Cloud, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemState } from '../types';

interface HeaderProps {
  state: SystemState;
  onReset: () => void;
  isAutoPilot: boolean;
  onToggleAutoPilot: () => void;
  apiUsage: number; 
  systemStatus?: string;
  lastSync?: Date | null;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  state, 
  onReset, 
  apiUsage, 
  systemStatus,
  lastSync,
  isSyncing = false
}) => {
  
  const getSystemStateColor = () => {
    switch (state) {
      case SystemState.ANALYSIS_ACTIVE:
      case SystemState.SCANNING:
        return 'text-virtus-aztecCyan animate-pulse';
      case SystemState.STANDBY:
      case SystemState.ANALYSIS_READY:
        return 'text-emerald-400';
      case SystemState.HIBERNATION:
        return 'text-amber-500';
      case SystemState.QUANTUM_COLLAPSE:
        return 'text-purple-500 animate-pulse-fast';
      default:
        return 'text-virtus-aztecCyan';
    }
  };

  const getSystemStateText = () => {
    switch (state) {
      case SystemState.STANDBY: return 'STANDBY';
      case SystemState.SCANNING: return 'SCANNING';
      case SystemState.ANALYSIS_READY: return 'ANALYSIS_READY';
      case SystemState.ANALYSIS_ACTIVE: return 'ANALYSIS_ACTIVE';
      case SystemState.AUTO_PILOT: return 'AUTO_PILOT';
      case SystemState.HIBERNATION: return 'HIBERNATION';
      case SystemState.MIDNIGHT_SYNC: return 'SYNC_IN_PROGRESS';
      case SystemState.QUANTUM_COLLAPSE: return 'QUANTUM_COLLAPSE';
      case SystemState.BLACK_SWAN_SCAN: return 'BLACK_SWAN_SCAN';
      default: return 'UNKNOWN';
    }
  };

  const getSyncStatus = () => {
    if (isSyncing) return { text: 'SYNCING', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (lastSync) return { text: 'SYNCED', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    return { text: 'OFFLINE', color: 'text-virtus-aztecRed', bg: 'bg-virtus-aztecRed/10', border: 'border-virtus-aztecRed/30' };
  };

  const syncStatus = getSyncStatus();

  return (
    <header className="h-20 border-b border-virtus-aztecCyan/30 bg-black/90 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50 overflow-hidden">
      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-virtus-aztecCyan via-virtus-aztecRed to-virtus-aztecCyan opacity-50"></div>
      
      {/* Decorative Glow Effects */}
      <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-virtus-aztecCyan/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-virtus-aztecRed/5 to-transparent pointer-events-none"></div>

      {/* Left Section: Logo and Status */}
      <div className="flex items-center gap-5 cursor-pointer group" onClick={onReset}>
        <div className="relative">
          <div className="absolute inset-0 bg-virtus-aztecCyan/30 blur-xl rounded-full scale-110 animate-pulse"></div>
          <div className={`w-10 h-10 border-2 ${state === SystemState.ANALYSIS_ACTIVE ? 'border-virtus-aztecCyan animate-pulse' : 'border-virtus-aztecCyan/70'} rounded-xl flex items-center justify-center relative bg-black shadow-[0_0_15px_rgba(0,243,255,0.5)] hover:shadow-[0_0_25px_rgba(0,243,255,0.7)] transition-all duration-300`}>
            <Cpu className={`w-6 h-6 ${getSystemStateColor()}`} />
          </div>
        </div>
        <div>
          <h1 className="font-mono font-black text-xl tracking-[0.2em] text-white flex items-center gap-3 uppercase">
            KAIROS<span className="text-virtus-aztecRed text-glow-cyan">V8</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${state === SystemState.ANALYSIS_ACTIVE ? 'bg-virtus-aztecCyan shadow-[0_0_5px_#00f3ff]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'} animate-pulse`}></div>
            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-500 font-mono flex items-center gap-2">
              <span className={`font-bold ${getSystemStateColor().replace('animate-pulse', '')}`}>
                {getSystemStateText()}
              </span>
              • V8.3.0
            </p>
          </div>
        </div>
      </div>

      {/* Center Section: Status Indicators */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        {/* SYSTEM HEALTH */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">System Health</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${state === SystemState.HIBERNATION ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'} shadow-inner`}>
            <div className={`w-2 h-2 rounded-full ${state === SystemState.HIBERNATION ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className={`text-[10px] font-mono font-bold ${state === SystemState.HIBERNATION ? 'text-amber-400' : 'text-emerald-400'}`}>
              {state === SystemState.HIBERNATION ? 'DEGRADED' : 'OPTIMAL'}
            </span>
          </div>
        </div>

        {/* SYNC STATUS */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Cloud Sync</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${syncStatus.bg} border ${syncStatus.border} shadow-inner`}>
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
            ) : lastSync ? (
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-virtus-aztecRed" />
            )}
            <span className={`text-[10px] font-mono font-bold ${syncStatus.color}`}>
              {syncStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Metrics and Seal */}
      <div className="flex items-center gap-6">
        {/* API USAGE */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Signals Detected</span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-inner group hover:border-virtus-aztecCyan/50 transition-colors">
            <Activity className="w-3 h-3 text-virtus-aztecCyan group-hover:animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-white">#{apiUsage}</span>
            {apiUsage > 50 && (
              <div className="w-1 h-1 rounded-full bg-virtus-aztecRed animate-pulse"></div>
            )}
          </div>
        </div>

        {/* LAST SYNC TIME */}
        {lastSync && (
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Last Sync</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 shadow-inner">
              <Cloud className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-mono font-bold text-slate-300">
                {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )}

        {/* SYSTEM STATUS */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Core Status</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${state === SystemState.ANALYSIS_ACTIVE ? 'bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/30' : 'bg-violet-500/10 border border-violet-500/30'} shadow-inner`}>
            <Zap className={`w-3 h-3 ${state === SystemState.ANALYSIS_ACTIVE ? 'text-virtus-aztecCyan animate-pulse' : 'text-violet-400'}`} />
            <span className={`text-[10px] font-mono font-bold ${state === SystemState.ANALYSIS_ACTIVE ? 'text-virtus-aztecCyan' : 'text-violet-400'}`}>
              {state === SystemState.ANALYSIS_ACTIVE ? 'ANALYSIS_ACTIVE' : 'NEURAL_IDLE'}
            </span>
          </div>
        </div>

        {/* PRO SEAL */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-virtus-aztecCyan/30 shadow-2xl relative overflow-hidden group cursor-pointer hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-virtus-aztecCyan/5 via-transparent to-virtus-aztecRed/5 group-hover:from-virtus-aztecCyan/10 group-hover:to-virtus-aztecRed/10 transition-all duration-500"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,243,255,0.1),transparent_70%)]"></div>
          <ShieldCheck className="w-4 h-4 text-virtus-aztecCyan relative z-10 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-white tracking-[0.2em] relative z-10 group-hover:text-virtus-aztecCyan transition-colors">
            KAIROS_V8_PRO
          </span>
        </div>
      </div>
    </header>
  );
};