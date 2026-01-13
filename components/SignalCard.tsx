
import React, { useState } from 'react';
import { MatchDashboardData, ModuleType } from '../types';
import { 
  Target, Zap, ShieldCheck, Flame, TrendingUp, Info, 
  ArrowUpRight, Brain, Waves, AlertTriangle, Clock,
  BarChart3, Users, Activity, Trophy, Star, ChevronRight,
  Maximize2, Minimize2, Copy, Share2, Bookmark,
  TrendingDown, DollarSign, Percent, Eye, EyeOff, CheckCircle
} from 'lucide-react';

interface SignalCardProps {
  signal: MatchDashboardData;
  compact?: boolean;
  onExpand?: () => void;
  onBookmark?: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ 
  signal, 
  compact = false,
  onExpand,
  onBookmark
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isFire = signal.isFireSignal || signal.winProbability >= 85;
  const edgeColor = signal.edge >= 15 ? 'text-emerald-400' : 
                    signal.edge >= 10 ? 'text-virtus-aztecCyan' : 
                    'text-virtus-accent';
  
  const getSportIcon = () => {
    const league = signal.leagueName?.toLowerCase() || '';
    if (league.includes('nba')) return '🏀';
    if (league.includes('nfl')) return '🏈';
    if (league.includes('mlb') || league.includes('lmb')) return '⚾';
    if (league.includes('soccer') || league.includes('football')) return '⚽';
    if (league.includes('ncaa')) return '🎓';
    if (league.includes('tennis')) return '🎾';
    return '🎯';
  };

  const getSportColor = () => {
    const league = signal.leagueName?.toLowerCase() || '';
    if (league.includes('nba')) return 'border-orange-500';
    if (league.includes('nfl')) return 'border-cyan-500';
    if (league.includes('mlb') || league.includes('lmb')) return 'border-red-500';
    if (league.includes('soccer') || league.includes('football')) return 'border-emerald-500';
    if (league.includes('ncaa')) return 'border-blue-500';
    if (league.includes('tennis')) return 'border-yellow-500';
    return 'border-virtus-aztecCyan';
  };

  const handleCopy = () => {
    const text = `🔔 ${signal.homeTeam} vs ${signal.awayTeam}\n📊 Win Probability: ${signal.winProbability}%\n🎯 Prediction: ${signal.prediction}\n💰 Edge: +${signal.edge}%\n${isFire ? '🔥 FIRE SIGNAL' : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onExpand) onExpand();
  };

  const renderCompact = () => (
    <div className={`
      bg-gradient-to-br from-slate-900/80 to-black/80 border rounded-xl p-4 
      relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer group
      ${isFire ? 'border-red-500/40 hover:border-red-500/60' : getSportColor() + '/40 hover:' + getSportColor() + '/60'}
      ${isFire ? 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'shadow-[0_0_15px_rgba(0,0,0,0.3)]'}
    `}>
      {/* Background effects */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 blur-3xl rounded-full opacity-20 group-hover:opacity-30 ${
        isFire ? 'bg-red-500' : 'bg-virtus-aztecCyan'
      }`}></div>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            isFire ? 'bg-red-500/20' : 'bg-virtus-aztecCyan/20'
          }`}>
            <span className="text-lg">{getSportIcon()}</span>
          </div>
          <div>
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
              {signal.leagueName || 'PROFESSIONAL'}
            </div>
            <h3 className="text-sm font-black text-white leading-tight tracking-tight">
              {signal.homeTeam} <span className="text-gray-700 mx-1">vs</span> {signal.awayTeam}
            </h3>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className={`text-xl font-black font-mono leading-none ${
            isFire ? 'text-red-500' : 'text-virtus-aztecCyan'
          }`}>
            {signal.winProbability}%
          </div>
          {isFire && (
            <div className="px-1.5 py-0.5 bg-red-500/20 rounded border border-red-500/30">
              <span className="text-[6px] font-black text-red-300 uppercase">FIRE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="bg-white/5 border border-white/5 rounded-lg p-2">
          <div className="text-[8px] text-gray-500 uppercase tracking-tighter mb-1">Prediction</div>
          <div className="text-xs font-bold text-white truncate">{signal.prediction}</div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-lg p-2">
          <div className="text-[8px] text-gray-500 uppercase tracking-tighter mb-1">Edge</div>
          <div className={`text-xs font-bold ${edgeColor}`}>+{signal.edge}%</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between relative z-10 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isFire ? 'bg-red-500 animate-pulse' : 'bg-virtus-aztecCyan'}`}></div>
          <div className="text-[9px] text-gray-400 font-mono">
            Stake: {signal.stake}/5
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
      </div>
    </div>
  );

  const renderExpanded = () => (
    <div className={`
      bg-gradient-to-br from-black/90 to-slate-950/90 border rounded-2xl p-6 
      relative overflow-hidden transition-all group
      ${isFire ? 'neon-frame-red border-red-500/40' : 'neon-frame-cyan border-virtus-aztecCyan/40'}
      shadow-[0_0_40px_rgba(0,0,0,0.6)]
      ${isExpanded ? 'col-span-2 row-span-2' : ''}
    `}>
      {/* Background effects */}
      <div className={`absolute -top-32 -right-32 w-64 h-64 blur-3xl rounded-full transition-opacity opacity-30 group-hover:opacity-40 ${
        isFire ? 'bg-red-500' : 'bg-virtus-aztecCyan'
      }`}></div>
      
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"></div>

      {/* Header with controls */}
      <div className="flex justify-between items-start mb-6 relative z-20">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getSportIcon()}</span>
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {signal.leagueName || 'PROFESSIONAL LEAGUE'}
              </div>
              <h3 className="text-xl font-black text-white leading-tight tracking-tight uppercase">
                {signal.homeTeam} <span className="text-gray-700 mx-2">VS</span> {signal.awayTeam}
              </h3>
            </div>
          </div>
          
          {isFire && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg animate-pulse">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-black text-red-300 uppercase tracking-wider">FIRE SIGNAL ACTIVE</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Control buttons */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg border transition-all ${isBookmarked ? 'bg-virtus-accent/10 border-virtus-accent/30 text-virtus-accent' : 'border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark signal'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleCopy}
            className={`p-2 rounded-lg border transition-all ${copied ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            title={copied ? 'Copied!' : 'Copy signal details'}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleExpand}
            className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confidence and Edge */}
      <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center shadow-inner">
          <div className="text-[10px] text-gray-500 uppercase font-black mb-3 tracking-wider">Confidence Score</div>
          <div className={`text-5xl font-black font-mono leading-none ${isFire ? 'text-red-500' : 'text-virtus-aztecCyan'} text-glow-cyan mb-2`}>
            {signal.winProbability}%
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-2 h-6 rounded-full transition-all duration-300 ${
                i < Math.floor(signal.winProbability / 20) 
                  ? (isFire ? 'bg-red-500' : 'bg-virtus-aztecCyan')
                  : 'bg-slate-800'
              }`}></div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center shadow-inner">
          <div className="text-[10px] text-gray-500 uppercase font-black mb-3 tracking-wider">Alpha Edge</div>
          <div className={`text-5xl font-black font-mono leading-none ${edgeColor} mb-2`}>
            +{signal.edge}%
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${edgeColor}`} />
            <span className={`text-xs font-black ${edgeColor} uppercase`}>
              {signal.edge >= 15 ? 'HIGH EDGE' : signal.edge >= 10 ? 'MEDIUM EDGE' : 'LOW EDGE'}
            </span>
          </div>
        </div>
      </div>

      {/* Prediction and Stake */}
      <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-4">
            <div className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-wider">Deterministic Prediction</div>
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-5 h-5 ${isFire ? 'text-red-400' : 'text-virtus-aztecCyan'}`} />
              <span className="text-lg font-black text-white uppercase tracking-tight">{signal.prediction}</span>
            </div>
          </div>
          
          {signal.summary && (
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-wider">Neural Analysis</div>
              <p className="text-sm text-gray-300 leading-tight font-mono italic">"{signal.summary}"</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-4">
            <div className="text-[10px] text-gray-500 uppercase font-black mb-3 tracking-wider">Optimal Stake</div>
            <div className="flex items-end justify-between">
              <div className={`text-4xl font-black ${isFire ? 'text-red-500' : 'text-virtus-aztecCyan'}`}>
                {signal.stake}<span className="text-lg text-gray-600">/5</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-4 h-8 rounded-lg transition-all duration-500 ${
                    i < signal.stake 
                      ? (isFire ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-virtus-aztecCyan shadow-[0_0_10px_rgba(0,243,255,0.4)]')
                      : 'bg-slate-800'
                  }`}></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quantum Metrics */}
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-4">
            <div className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-wider">Quantum Metrics</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-[8px] text-gray-500">Entropy</div>
                  <div className="text-sm font-mono text-purple-400">{(signal.quantumEntropy || 0.12).toFixed(3)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[8px] text-gray-500">Black Swan</div>
                  <div className="text-sm font-mono text-amber-400">{(signal.blackSwanProb || 0.05).toFixed(3)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alpha Targets / Props */}
      <div className="relative z-10">
        <h4 className="text-[11px] text-gray-500 uppercase font-black mb-4 flex items-center gap-2 tracking-[0.2em]">
          <Target className="w-4 h-4 text-virtus-aztecCyan" /> Alpha Targets / Props
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signal.recommendedProps && signal.recommendedProps.length > 0 ? (
            signal.recommendedProps.slice(0, 6).map((prop, pIdx) => (
              <div 
                key={pIdx} 
                className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-white/5 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-virtus-aztecCyan/40 transition-all duration-300 group/prop cursor-default"
              >
                <div className={`p-1.5 rounded ${
                  isFire ? 'bg-red-500/20' : 'bg-virtus-aztecCyan/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isFire ? 'bg-red-500 animate-pulse' : 'bg-virtus-aztecCyan'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white tracking-tight uppercase">{prop}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">
                    {pIdx % 3 === 0 ? 'High Value' : pIdx % 3 === 1 ? 'Medium Value' : 'Low Risk'}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover/prop:text-virtus-aztecCyan transition-colors" />
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-slate-900/50 border border-white/5 rounded-lg p-6 text-center">
              <Target className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <span className="text-sm text-gray-500">No specific props detected for this match...</span>
              <p className="text-xs text-gray-600 mt-1">The neural network recommends focusing on the main prediction</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="relative z-10 mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-[10px] text-gray-500 font-mono">
                {signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : 'LIVE'}
              </span>
            </div>
            
            {signal.neuralAnchor && (
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] text-gray-500 font-mono truncate max-w-[100px]">
                  {signal.neuralAnchor.substring(0, 16)}...
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-black ${
              isFire 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-virtus-aztecCyan/10 border-virtus-aztecCyan/30 text-virtus-aztecCyan'
            }`}>
              {isFire ? 'FIRE SIGNAL' : 'STANDARD SIGNAL'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return compact ? renderCompact() : renderExpanded();
};
