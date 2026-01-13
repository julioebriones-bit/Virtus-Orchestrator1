
import React from 'react';
import { DashboardData, MatchDashboardData, BacktestDashboardData } from '../types';
import { 
  TrendingUp, Wallet, Zap, Target, History, LineChart, ListChecks, 
  Flame, Shield, DollarSign, Rocket, Scale, AlertTriangle, CheckCircle2, 
  Crown, Anchor, Trophy, Activity, Globe, Hexagon, CloudRain, Wind, 
  ThermometerSun, AlertOctagon, Mountain, GraduationCap, Users, Info, 
  ArrowUpRight, Calculator, Brain, Layers, Waves, GitBranch, Lightbulb,
  Sparkles,
  Gauge,
  BarChart,
  LineChart as LineChartIcon,
  Target as TargetIcon
} from 'lucide-react';

interface AnalyticsPanelProps {
  data: DashboardData;
  compact?: boolean;
  onExpand?: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data, compact = false, onExpand }) => {
  if (data.type === 'BACKTEST') {
    return <BacktestView data={data} compact={compact} onExpand={onExpand} />;
  }
  return <MatchView data={data} compact={compact} onExpand={onExpand} />;
};

const BacktestView: React.FC<{ 
  data: BacktestDashboardData; 
  compact?: boolean;
  onExpand?: () => void;
}> = ({ data, compact = false, onExpand }) => {
    const radius = compact ? 24 : 36;
    const stroke = compact ? 3 : 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (data.winRate / 100) * circumference;
    const gaugeColor = data.winRate > 55 ? '#a855f7' : data.winRate > 50 ? '#10b981' : '#f59e0b';
    const isPositive = data.totalProfit >= 0;

    const breakdown = Array.isArray(data.breakdown) ? data.breakdown : [];
    const curve = Array.isArray(data.curve) ? data.curve : [];
    const strategyAdjustments = Array.isArray(data.strategyAdjustments) ? data.strategyAdjustments : [];

    if (compact) {
      return (
        <div className="bg-virtus-panel border border-virtus-border rounded-lg p-4 relative shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group cursor-pointer" onClick={onExpand}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <History className="w-3 h-3 text-purple-400" />
              BACKTEST
            </h2>
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
              {data.period}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg height={radius * 3} width={radius * 3} className="rotate-[-90deg] transform">
                  <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                  <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-white">{data.winRate}%</span>
                  <span className="text-[8px] font-bold text-gray-400">{data.totalBets}B</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 ml-4 space-y-3">
              <div>
                <h3 className="text-[9px] text-gray-400 uppercase tracking-wider">Net Profit</h3>
                <div className={`text-lg font-mono font-bold ${isPositive ? 'text-virtus-success' : 'text-virtus-danger'}`}>
                  {isPositive ? '+' : ''}{data.totalProfit}u
                </div>
              </div>
              <div>
                <h3 className="text-[9px] text-gray-400 uppercase tracking-wider">ROI</h3>
                <div className={`text-sm font-mono font-bold ${data.roi > 5 ? 'text-purple-400' : 'text-gray-300'}`}>
                  {data.roi}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-[9px] text-gray-400 font-mono text-center italic border-t border-white/5 pt-3">
            Click para expandir análisis completo
          </div>
        </div>
      );
    }

    return (
      <div className="bg-virtus-panel border border-virtus-border rounded-lg p-5 overflow-hidden relative shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            FORENSIC AUDITOR v2.5
          </h2>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            DATA: {data.period}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-950/60 rounded-lg p-4 border border-virtus-border flex flex-col items-center justify-center relative backdrop-blur-sm">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">Win Rate %</h3>
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg height={radius * 3} width={radius * 3} className="rotate-[-90deg] transform">
                  <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                  <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }} strokeLinecap="round" r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-mono text-white tracking-tighter">{data.winRate}%</span>
                  <span className="text-[10px] font-bold text-gray-400 mt-1">{data.totalBets} BETS</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-950/60 rounded-lg p-4 border border-virtus-border backdrop-blur-sm flex justify-between items-center">
              <div>
                <h3 className="text-[10px] text-gray-400 uppercase tracking-widest">Net Profit</h3>
                <div className={`text-2xl font-mono font-bold ${isPositive ? 'text-virtus-success' : 'text-virtus-danger'}`}>
                  {isPositive ? '+' : ''}{data.totalProfit}u
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-[10px] text-gray-400 uppercase tracking-widest">ROI</h3>
                <div className={`text-lg font-mono font-bold ${data.roi > 5 ? 'text-purple-400' : 'text-gray-300'}`}>
                  {data.roi}%
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950/60 rounded-lg p-4 border border-virtus-border h-[140px] backdrop-blur-sm flex flex-col">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <LineChart className="w-3 h-3" /> Capital Trend
              </h3>
              <div className="flex-1 relative flex items-end">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <polyline 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="3"
                    points={curve.map((p, i, arr) => {
                      const min = Math.min(...arr.map(c => c.value)) * 0.9;
                      const max = Math.max(...arr.map(c => c.value)) * 1.1;
                      const range = max - min || 1;
                      const normalized = ((p.value - min) / range) * 100;
                      return `${(i / (arr.length - 1 || 1)) * 100} ${100 - normalized}`;
                    }).join(' ')}
                    vectorEffect="non-scaling-stroke"
                    className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-slate-950/60 rounded-lg p-4 border border-virtus-border flex-1 backdrop-blur-sm flex flex-col justify-center gap-3">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Target className="w-3 h-3" /> Win Rate by Segment
              </h3>
              {breakdown.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-[10px] mb-1 font-mono text-gray-400">
                    <span>{item.label}</span>
                    <span className={item.value > 50 ? "text-virtus-success" : "text-virtus-danger"}>{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out ${item.value > 50 ? 'bg-virtus-success' : 'bg-virtus-danger'}`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 flex flex-col">
            <div className="bg-slate-950/60 rounded-lg p-4 border border-virtus-border h-full backdrop-blur-sm flex flex-col">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Scale className="w-3 h-3 text-virtus-accent" /> Strategy Calibration
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {strategyAdjustments.length > 0 ? (
                  <ul className="space-y-3">
                    {strategyAdjustments.map((adj, idx) => {
                      let Icon = CheckCircle2;
                      let color = "text-gray-400";
                      let border = "border-gray-800";
                      if (adj.includes("STOP") || adj.includes("⚠")) { 
                        Icon = AlertTriangle; 
                        color = "text-virtus-danger"; 
                        border = "border-red-900/30 bg-red-950/10"; 
                      } else if (adj.includes("INCREASE") || adj.includes("✅")) { 
                        Icon = TrendingUp; 
                        color = "text-virtus-success"; 
                        border = "border-emerald-900/30 bg-emerald-950/10"; 
                      } else if (adj.includes("HEDGE") || adj.includes("🛡️")) { 
                        Icon = Shield; 
                        color = "text-virtus-primary"; 
                        border = "border-cyan-900/30 bg-cyan-950/10"; 
                      }
                      return (
                        <li key={idx} className={`p-3 rounded border ${border} flex items-start gap-2`}>
                          <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                          <span className="text-[10px] text-gray-300 font-mono leading-tight">{adj.replace(/⚠|✅|🛡️/g, '').trim()}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center text-xs text-gray-500 py-10 italic">Cargando métricas...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

const MatchView: React.FC<{ 
  data: MatchDashboardData; 
  compact?: boolean;
  onExpand?: () => void;
}> = ({ data, compact = false, onExpand }) => {
  if (compact) {
    const radius = 24;
    const stroke = 3;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (data.winProbability / 100) * circumference;
    const gaugeColor = data.winProbability > 75 ? '#10b981' : data.winProbability > 55 ? '#06b6d4' : '#f59e0b';
    
    return (
      <div className="bg-virtus-panel border border-virtus-border rounded-lg p-4 relative shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,0,0,0.7)] transition-all duration-300 group cursor-pointer" onClick={onExpand}>
        {data.isFireSignal && (
          <div className="absolute -top-2 -right-2 z-10 px-2 py-1 bg-red-600 text-white font-mono font-bold text-[8px] animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 fill-current" /> FIRE
          </div>
        )}
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-virtus-primary to-transparent opacity-60"></div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-3 h-3 text-virtus-accent" />
            {data.leagueName || 'MATCH'}
          </h2>
          <div className="text-[9px] font-mono text-virtus-primary bg-opacity-10 bg-current px-2 py-1 rounded border border-opacity-20 border-current">
            +{data.edge}%
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 text-center">
            <div className="text-sm font-bold text-cyan-400 truncate">{data.homeTeam}</div>
            <div className="text-[8px] text-gray-500 mt-1">HOME</div>
          </div>
          <div className="px-3">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg height={radius * 3} width={radius * 3} className="rotate-[-90deg] transform">
                <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-black font-mono ${data.isFireSignal ? 'text-red-400' : 'text-white'}`}>{data.winProbability}%</span>
              </div>
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm font-bold text-red-400 truncate">{data.awayTeam}</div>
            <div className="text-[8px] text-gray-500 mt-1">AWAY</div>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="bg-white/5 border border-white/10 rounded px-3 py-2 mb-2">
            <span className={`text-sm font-mono font-bold ${data.isFireSignal ? 'text-red-400' : 'text-virtus-primary'}`}>{data.prediction}</span>
          </div>
          <div className="text-[9px] text-gray-400 truncate">
            {data.summary.substring(0, 80)}...
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-[8px] text-gray-400">
            <Wallet className="w-3 h-3" />
            Stake: {data.stake}/5
          </div>
          <div className="text-[8px] text-gray-500 italic">
            Click para detalles
          </div>
        </div>
      </div>
    );
  }

  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (data.winProbability / 100) * circumference;

  let headerColor = 'via-virtus-primary';
  let headerIcon = <Zap className="w-4 h-4 text-virtus-accent" />;
  let headerTitle = "KAIROS NEURAL TERMINAL v7.5";
  let gaugeColor = data.winProbability > 75 ? '#10b981' : data.winProbability > 55 ? '#06b6d4' : '#f59e0b';
  let edgeColor = data.edge >= 15 ? 'text-virtus-success' : data.edge >= 10 ? 'text-virtus-primary' : 'text-virtus-accent';

  if (data.leagueName?.includes('NBA')) {
    headerColor = 'via-orange-500';
    headerIcon = <Target className="w-4 h-4 text-orange-500" />;
    headerTitle = "VIRTUS NBA PACER v7.5";
    gaugeColor = '#f97316';
  }

  const stats = Array.isArray(data.stats) ? data.stats : [];
  const recommendedProps = Array.isArray(data.recommendedProps) ? data.recommendedProps : [];

  return (
    <div className={`bg-virtus-panel border border-virtus-border rounded-lg p-5 overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.7)]`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${headerColor} to-transparent opacity-60`}></div>
      
      {data.isFireSignal && (
        <div className="absolute top-0 right-0 z-10 px-4 py-1.5 bg-red-600 text-white font-mono font-bold text-[10px] animate-pulse-fast shadow-[0_0_20px_rgba(220,38,38,0.6)] flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 fill-current" /> FIRE_SIGNAL_ACTIVE
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2 uppercase tracking-widest">
          {headerIcon}
          {headerTitle}
        </h2>
        <div className="flex items-center gap-3">
          <div className={`text-[10px] font-mono ${edgeColor} bg-opacity-10 bg-current px-2.5 py-1 rounded border border-opacity-20 border-current font-bold`}>
            ALPHA_EDGE: +{data.edge}%
          </div>
          {data.neuralAnchor && (
            <div className="text-[9px] font-mono text-gray-600 bg-slate-950 px-2 py-1 rounded border border-virtus-border">
              SHA: {data.neuralAnchor.substring(0, 12)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-950/60 rounded-lg p-5 border border-virtus-border flex flex-col items-center justify-center relative backdrop-blur-md">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 font-bold flex items-center gap-2">
              <Brain className="w-3 h-3 text-virtus-primary" /> Confidence Interval
            </h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg height={radius * 3.4} width={radius * 3.4} className="rotate-[-90deg] transform">
                <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke * 1.2} r={normalizedRadius * 1.1} cx={radius * 1.7} cy={radius * 1.7} />
                <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke * 1.2} strokeDasharray={circumference * 1.1 + ' ' + circumference * 1.1} style={{ strokeDashoffset: circumference * 1.1 - (data.winProbability/100)*circumference * 1.1, transition: 'stroke-dashoffset 2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} strokeLinecap="round" r={normalizedRadius * 1.1} cx={radius * 1.7} cy={radius * 1.7} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black font-mono text-white tracking-tighter ${data.isFireSignal ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''}`}>{data.winProbability}%</span>
                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-[0.2em]">Validated</span>
              </div>
            </div>
            <div className="mt-6 w-full text-center">
              <div className={`bg-white/5 border border-white/10 rounded-md px-3 py-2 mb-3 ${data.isFireSignal ? 'border-red-500/40 bg-red-950/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`}>
                <span className={`text-sm font-mono font-black ${data.isFireSignal ? 'text-red-400' : 'text-virtus-primary uppercase'}`}>{data.prediction}</span>
              </div>
              <div className="text-[10px] font-mono text-gray-400 bg-slate-900 p-2 rounded border border-white/5 italic">
                "{data.summary}"
              </div>
            </div>
          </div>
          
          <div className="bg-slate-950/60 rounded-lg p-4 border border-virtus-border backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2 font-bold">
                <Waves className="w-3 h-3 text-purple-400" /> Quantum Entropy
              </h3>
              <span className="text-[10px] font-mono text-purple-400">{(data.quantumEntropy || 0).toFixed(4)}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(data.quantumEntropy || 0) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="bg-slate-950/60 rounded-lg p-4 border border-virtus-border backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2 font-bold">
                <AlertOctagon className="w-3 h-3 text-red-500" /> Black Swan Risk
              </h3>
              <span className="text-[10px] font-mono text-red-500">{(data.blackSwanProb || 0).toFixed(4)}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${(data.blackSwanProb || 0) * 1000}%` }}></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-950/60 rounded-lg p-5 border border-virtus-border backdrop-blur-md flex flex-col">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-bold">
              <Scale className="w-3.5 h-3.5 text-virtus-primary" /> Multi-Reality Metrics
            </h3>
            <div className="flex justify-between text-[11px] font-black text-gray-300 mb-4 px-2 border-b border-white/5 pb-3">
              <span className="text-cyan-400">{data.homeTeam}</span>
              <span className="text-gray-700 italic">VS</span>
              <span className="text-red-400">{data.awayTeam}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-5">
              {stats.slice(0, 5).map((stat, idx) => {
                const total = (stat.homeValue || 0) + (stat.awayValue || 0);
                const homePct = total === 0 ? 50 : (stat.homeValue / total) * 100;
                return (
                  <div key={idx} className="relative group px-1">
                    <div className="flex justify-between text-[10px] mb-1.5 font-mono text-gray-400 font-bold">
                      <span className="text-cyan-400">{stat.homeValue}</span>
                      <span className="text-white tracking-widest uppercase text-[9px]">{stat.label}</span>
                      <span className="text-red-400">{stat.awayValue}</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full flex overflow-hidden border border-white/5">
                      <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${homePct}%` }}></div>
                      <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${100-homePct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {data.evidence && (
              <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <Lightbulb className="w-3 h-3 text-virtus-accent" /> Explainable Logic (Socrates)
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-slate-900/80 p-2.5 rounded border border-white/5">
                    <div className="text-[8px] text-virtus-primary uppercase font-bold mb-1">Causal Link</div>
                    <div className="text-[10px] text-gray-300 font-mono leading-tight">{data.evidence.causal}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-white/5">
                    <div className="text-[8px] text-virtus-accent uppercase font-bold mb-1">Counterfactual Reality</div>
                    <div className="text-[10px] text-gray-300 font-mono leading-tight">{data.evidence.counterfactual}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-950/60 rounded-lg p-5 border border-virtus-border h-full backdrop-blur-md flex flex-col">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 font-bold">
              <ListChecks className="w-3.5 h-3.5 text-virtus-success" /> Alpha Targets
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <ul className="space-y-3">
                {recommendedProps.map((prop, idx) => (
                  <li key={idx} className={`bg-slate-900 border border-white/5 rounded-md p-3 hover:border-virtus-success/30 transition-all group shadow-sm`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded bg-black text-virtus-success shadow-[0_0_10px_rgba(16,185,129,0.2)]`}>
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-200 font-mono font-bold leading-tight uppercase tracking-tighter">{prop}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2 font-bold">
                  <Wallet className="w-3 h-3 text-virtus-accent" /> Optimal Stake
                </h3>
                <span className="text-xl font-black text-white leading-none">{data.stake}<span className="text-xs text-gray-600 font-normal">/5</span></span>
              </div>
              <div className="flex gap-2 h-2.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className={`flex-1 rounded transition-all duration-700 ${s <= data.stake ? (data.isFireSignal ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-virtus-accent shadow-[0_0_8px_rgba(245,158,11,0.4)]') : 'bg-slate-800'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
