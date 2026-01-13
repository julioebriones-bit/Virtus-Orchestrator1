
import React, { useEffect, useRef, useState } from 'react';
import { AnalysisMessage, AgentType } from '../types';
import { 
  Terminal, Rocket, ShieldAlert, Brain, Scale, Zap, Waves,
  Cpu, Users, AlertTriangle, CheckCircle, XCircle, Clock,
  Sparkles, GitBranch, Layers, Target, Eye, EyeOff,
  Copy, Trash2, Maximize2, Minimize2, Filter, Search,
  ChevronDown, ChevronUp, Volume2, VolumeX
} from 'lucide-react';

interface TerminalOutputProps {
  messages: AnalysisMessage[];
  isThinking: boolean;
  onClear?: () => void;
  onCopy?: (text: string) => void;
  compact?: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ 
  messages, 
  isThinking, 
  onClear,
  onCopy,
  compact = false
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState<AgentType | 'ALL'>('ALL');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, autoScroll]);

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (searchTerm && !msg.text.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterAgent !== 'ALL' && msg.agent !== filterAgent) {
      return false;
    }
    return true;
  });

  const getAgentConfig = (agent?: AgentType) => {
    const configs = {
      APOLLO: {
        icon: Rocket,
        color: 'text-emerald-400',
        bg: 'bg-gradient-to-r from-emerald-900/30 to-emerald-900/10',
        border: 'border-emerald-500/40',
        title: 'APOLLO • Strategic Analysis',
        gradient: 'from-emerald-900/30 via-emerald-800/20 to-transparent'
      },
      CASSANDRA: {
        icon: ShieldAlert,
        color: 'text-red-400',
        bg: 'bg-gradient-to-r from-red-900/30 to-red-900/10',
        border: 'border-red-500/40',
        title: 'CASSANDRA • Risk Assessment',
        gradient: 'from-red-900/30 via-red-800/20 to-transparent'
      },
      SOCRATES: {
        icon: Brain,
        color: 'text-amber-400',
        bg: 'bg-gradient-to-r from-amber-900/30 to-amber-900/10',
        border: 'border-amber-500/40',
        title: 'SOCRATES • Logic Analysis',
        gradient: 'from-amber-900/30 via-amber-800/20 to-transparent'
      },
      META: {
        icon: Scale,
        color: 'text-purple-400',
        bg: 'bg-gradient-to-r from-purple-900/30 to-purple-900/10',
        border: 'border-purple-500/40',
        title: 'META • Arbitration',
        gradient: 'from-purple-900/30 via-purple-800/20 to-transparent'
      },
      EXECUTOR: {
        icon: Target,
        color: 'text-cyan-400',
        bg: 'bg-gradient-to-r from-cyan-900/30 to-cyan-900/10',
        border: 'border-cyan-500/40',
        title: 'EXECUTOR • Action Module',
        gradient: 'from-cyan-900/30 via-cyan-800/20 to-transparent'
      },
      QUANTUM: {
        icon: GitBranch,
        color: 'text-violet-400',
        bg: 'bg-gradient-to-r from-violet-900/30 to-violet-900/10',
        border: 'border-violet-500/40',
        title: 'QUANTUM • Multi-Reality',
        gradient: 'from-violet-900/30 via-violet-800/20 to-transparent'
      },
      SYSTEM: {
        icon: Cpu,
        color: 'text-virtus-aztecCyan',
        bg: 'bg-gradient-to-r from-cyan-900/30 to-cyan-900/10',
        border: 'border-virtus-aztecCyan/40',
        title: 'SYSTEM • Core Process',
        gradient: 'from-cyan-900/30 via-cyan-800/20 to-transparent'
      }
    };

    return configs[agent || 'SYSTEM'] || configs.SYSTEM;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    
    if (onCopy) {
      onCopy(text);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isNearBottom);
    }
  };

  const renderMessage = (msg: AnalysisMessage) => {
    const isExpanded = expandedMessage === msg.id;
    const config = getAgentConfig(msg.agent);
    const Icon = config.icon;
    const isUser = msg.role === 'user';

    if (compact) {
      return (
        <div 
          key={msg.id} 
          className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          <div 
            className={`max-w-[90%] rounded-lg p-3 border relative overflow-hidden ${
              isUser 
                ? 'bg-slate-800/80 border-slate-700 text-white' 
                : config.bg + ' ' + config.border + ' ' + config.color
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase truncate">
                {isUser ? 'OPERATOR' : msg.agent}
              </span>
              <span className="text-[7px] text-gray-500 ml-auto">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-xs leading-tight line-clamp-2">
              {msg.text}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={msg.id} 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      >
        <div 
          className={`max-w-[90%] lg:max-w-[80%] rounded-xl p-4 border relative overflow-hidden group transition-all ${
            isUser 
              ? 'bg-slate-800/90 border-slate-700 text-white shadow-[0_0_20px_rgba(0,0,0,0.3)]' 
              : `${config.bg} ${config.border} ${config.color} shadow-[0_0_20px_rgba(0,0,0,0.4)]`
          } ${isExpanded ? 'col-span-2' : ''}`}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30`}></div>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isUser ? 'bg-slate-700' : 'bg-black/30'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${config.color}`}>
                  {isUser ? 'OPERATOR COMMAND' : config.title}
                </div>
                {showTimestamps && (
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit' 
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopy(msg.text, msg.id)}
                className={`p-1.5 rounded border ${
                  copiedId === msg.id 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
                title="Copy message"
              >
                {copiedId === msg.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              
              <button
                onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                className="p-1.5 rounded border border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Message content */}
          <div className="relative z-10">
            <div className={`whitespace-pre-wrap leading-relaxed text-sm font-mono tracking-tight ${
              isExpanded ? '' : 'max-h-48 overflow-y-auto'
            }`}>
              {msg.text}
            </div>
            
            {msg.metadata && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Metadata</div>
                <div className="text-xs text-gray-400">
                  {JSON.stringify(msg.metadata, null, 2)}
                </div>
              </div>
            )}
          </div>

          {/* Footer indicators */}
          <div className="relative z-10 mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {msg.isThinking && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-virtus-aztecCyan animate-pulse"></div>
                  <span className="text-[9px] text-virtus-aztecCyan">Thinking...</span>
                </div>
              )}
              
              {msg.agent === AgentType.META && (
                <div className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-purple-400" />
                  <span className="text-[9px] text-purple-400">Arbitration Active</span>
                </div>
              )}
            </div>
            
            <div className="text-[9px] text-gray-600 font-mono">
              ID: {msg.id.substring(0, 8)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls Bar */}
      {!compact && (
        <div className="px-4 py-2 border-b border-white/10 bg-black/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-virtus-aztecCyan" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                KAIROS TERMINAL
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-8 pr-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white w-48 focus:outline-none focus:border-virtus-aztecCyan"
                />
              </div>
              
              <select
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value as AgentType | 'ALL')}
                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-virtus-aztecCyan"
              >
                <option value="ALL">All Agents</option>
                <option value="APOLLO">Apollo</option>
                <option value="CASSANDRA">Cassandra</option>
                <option value="SOCRATES">Socrates</option>
                <option value="META">Meta</option>
                <option value="EXECUTOR">Executor</option>
                <option value="QUANTUM">Quantum</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              className={`p-1.5 rounded border ${
                showTimestamps 
                  ? 'bg-virtus-aztecCyan/10 border-virtus-aztecCyan/30 text-virtus-aztecCyan' 
                  : 'border-white/10 text-gray-500 hover:text-gray-300'
              }`}
              title={showTimestamps ? "Hide timestamps" : "Show timestamps"}
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-1.5 rounded border ${
                autoScroll 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'border-white/10 text-gray-500 hover:text-gray-300'
              }`}
              title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
            >
              {autoScroll ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            
            {onClear && (
              <button
                onClick={onClear}
                className="p-1.5 rounded border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                title="Clear terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto ${compact ? 'p-3' : 'p-6'} space-y-4 custom-scrollbar bg-gradient-to-b from-black/40 to-slate-950/30`}
      >
        {filteredMessages.length === 0 && !isThinking && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-40 select-none py-20">
            <Terminal className="w-16 h-16 mb-4 text-gray-700" />
            <span className="text-sm font-black uppercase tracking-widest mb-2">TERMINAL READY</span>
            <p className="text-xs text-gray-700 max-w-md text-center font-mono">
              {searchTerm || filterAgent !== 'ALL' 
                ? 'No messages match your filters' 
                : 'Awaiting neural analysis commands...'}
            </p>
            <div className="mt-6 flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-virtus-aztecCyan animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-virtus-aztecCyan animate-pulse delay-100"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-virtus-aztecCyan animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        {filteredMessages.map(renderMessage)}
        
        {isThinking && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="max-w-[80%] rounded-xl p-4 bg-gradient-to-r from-slate-900/60 to-black/60 border border-virtus-aztecCyan/40 shadow-[0_0_30px_rgba(0,243,255,0.15)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-virtus-aztecCyan/20">
                  <Brain className="w-5 h-5 text-virtus-aztecCyan animate-pulse" />
                </div>
                <div>
                  <div className="text-[11px] text-virtus-aztecCyan font-black uppercase tracking-wider">
                    QUANTUM_WAVE_FUNCTION_COLLAPSE
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Neural arbitration in progress...
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 bg-virtus-aztecCyan rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 200}ms` }}
                    ></div>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-mono text-white mb-1">
                    Collapsing parallel quantum realities...
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-virtus-aztecCyan to-cyan-400 animate-progress"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Status Bar */}
      {!compact && (
        <div className="px-4 py-2 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-gray-400 font-mono">
                {filteredMessages.length} messages
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-[9px] text-gray-600">
                Filter: {filterAgent} • Search: {searchTerm ? 'On' : 'Off'}
              </div>
            </div>
          </div>
          
          <div className="text-[9px] text-gray-600 font-mono">
            Last update: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}
    </div>
  );
};
