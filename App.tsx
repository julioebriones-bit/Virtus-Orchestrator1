
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TerminalOutput } from './components/TerminalOutput';
import { ModuleSelector } from './components/ModuleSelector';
import { HistoryModal } from './components/HistoryModal';
import { Toolbar } from './components/Toolbar';
import { SignalCard } from './components/SignalCard';
import { Sidebar } from './components/Sidebar';
import { LivePulse } from './components/LivePulse';
import { createAnalysisSession } from './services/geminiService';
import { fetchTickets, fetchRules, fetchGlobalIntelligence, fetchGlobalSummary, rotateSupabaseKey, resetSupabaseKey } from '@/supabaseClient';
import { ksm } from './stateManager';
import { 
  SystemState, 
  AnalysisMessage, 
  ModuleType, 
  BetTicket, 
  GlobalIntelligence, 
  MatchDashboardData, 
  GlobalSummary, 
  GovernanceMetrics,
  AgentType
} from './types';
import { 
  Send, 
  BarChart3, 
  Terminal as TerminalIcon, 
  Cpu, 
  Radar,
  Zap,
  Key,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  History as HistoryIcon,
  Sparkles
} from 'lucide-react';
import { GenerateContentResponse } from "@google/genai";

const App: React.FC = () => {
  const [state, setState] = useState<SystemState>(SystemState.STANDBY);
  const [view, setView] = useState<'SIGNALS' | 'TERMINAL' | 'PULSE'>('SIGNALS');
  const [messages, setMessages] = useState<AnalysisMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.NONE);
  const [activeSignals, setActiveSignals] = useState<MatchDashboardData[]>([]);
  const [ticketHistory, setTicketHistory] = useState<BetTicket[]>([]);
  const [learnedRules, setLearnedRules] = useState<string[]>([]);
  const [globalIntel, setGlobalIntel] = useState<GlobalIntelligence[]>([]);
  const [globalSummary, setGlobalSummary] = useState<GlobalSummary | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [authError, setAuthError] = useState<{ type: string; message: string } | null>(null);
  const [newKeyInput, setNewKeyInput] = useState('');
  
  const [govMetrics, setGovMetrics] = useState<GovernanceMetrics>({
    reputationScore: 1240,
    votingPower: 35,
    totalProposals: 14,
    consensusStrength: 0.92
  });

  const [systemStats, setSystemStats] = useState({
    totalTickets: 0,
    fireSignals: 0,
    pendingAnalysis: 0,
    uptime: 0
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    initializeKairos();
    
    const handleAuthError = (e: any) => {
      setAuthError({ type: 'LEGACY_KEY', message: e.detail.message });
    };

    window.addEventListener('kairos-auth-error', handleAuthError);
    
    const unsubscribe = ksm.subscribe(() => {
      setTicketHistory(ksm.getHistory());
      const stats = ksm.getStats();
      setSystemStats({
        totalTickets: stats.totalTickets,
        fireSignals: stats.fireSignals,
        pendingAnalysis: stats.queueLength,
        uptime: stats.lastSynced ? Math.floor((Date.now() - stats.lastSynced) / 1000) : 0
      });
      setState(ksm.getSystemState());
    });
    
    return () => {
      unsubscribe();
      window.removeEventListener('kairos-auth-error', handleAuthError);
    };
  }, []);

  const initializeKairos = async () => {
    ksm.logActivity('SYSTEM', '🚀 Sincronizando Ciclo de Automatización 12:05...', 'medium');
    try {
        setIsSyncing(true);
        const [cloudTickets, intel, summary, rules] = await Promise.all([
            fetchTickets(ModuleType.NONE),
            fetchGlobalIntelligence(),
            fetchGlobalSummary(),
            fetchRules()
        ]);
        
        if (cloudTickets.length > 0) {
            cloudTickets.forEach(t => ksm.updateTicket(t));
        }
        
        setGlobalIntel(intel);
        setGlobalSummary(summary);
        setLearnedRules(rules);
        setLastSyncTime(new Date());
    } catch (e) { 
        console.error("Init Error", e); 
    } finally { 
        setIsSyncing(false); 
    }
  };

  const handlePatchKey = () => {
    if (newKeyInput.length < 50) return;
    rotateSupabaseKey(newKeyInput);
    setAuthError(null);
    setNewKeyInput('');
    initializeKairos();
  };

  const handleModuleSelect = async (module: ModuleType) => {
    if (state !== SystemState.STANDBY && state !== SystemState.ANALYSIS_READY) return;
    ksm.setCurrentSport(module);
    setState(SystemState.SCANNING);
    setActiveModule(module);
    setActiveSignals([]); 

    const session = createAnalysisSession(module, learnedRules, globalIntel);
    const streamId = `stream-${Date.now()}`;
    setMessages(prev => [...prev, { 
      id: streamId, role: 'model', text: `⚡ KAIROS_NEURAL_SCRAPER ::: ESCANEANDO [${module}]...`, createdAt: Date.now(), agent: AgentType.SYSTEM 
    }]);
    
    let fullText = "";
    try {
        const responseStream = await session.sendMessageStream({ message: `Analiza partidos importantes de ${module} para las próximas 24 horas. Usa Google Search para confirmar datos (lesiones, cuotas, clima). Retorna solo JSON.` });
        for await (const chunk of (responseStream as any)) {
            const chunkText = (chunk as GenerateContentResponse).text;
            if (chunkText) { 
                fullText += chunkText; 
                setMessages(prev => prev.map(m => m.id === streamId ? { ...m, text: `Extrayendo inteligencia de mercado semántica...` } : m));
            }
        }
        
        const jsonMatch = fullText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : fullText.replace(/```json|```/g, ''));
        const matches = (Array.isArray(parsed) ? parsed : [parsed]).map(m => ({ ...m, type: 'MATCH', timestamp: Date.now() }));
        
        if (matches.length > 0) {
            setActiveSignals(matches);
            await ksm.addSignals(matches, module);
            setMessages(prev => [...prev, { id: `res-${Date.now()}`, role: 'model', text: `Análisis orbital de ${module} finalizado. ${matches.length} señales detectadas.`, createdAt: Date.now(), agent: AgentType.EXECUTOR }]);
        }
    } catch(e) { 
        ksm.logActivity(module, 'Fallo de enlace neural: Superada cuota de búsqueda.', 'high');
    }
    setState(SystemState.STANDBY);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state !== SystemState.STANDBY) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: userText, createdAt: Date.now() }]);
    setState(SystemState.ANALYSIS_ACTIVE);
    
    const session = createAnalysisSession(activeModule, learnedRules, globalIntel);
    const streamId = `stream-${Date.now()}`;
    setMessages(prev => [...prev, { id: streamId, role: 'model', text: "Accediendo a la red neuronal...", createdAt: Date.now(), isThinking: true, agent: AgentType.META }]);
    
    let fullText = "";
    try {
        const responseStream = await session.sendMessageStream({ message: userText });
        for await (const chunk of (responseStream as any)) {
            const chunkText = (chunk as GenerateContentResponse).text;
            if (chunkText) { 
                fullText += chunkText; 
                setMessages(prev => prev.map(m => m.id === streamId ? { ...m, text: fullText, isThinking: false } : m));
            }
        }
    } catch (e: any) {
        setMessages(prev => prev.map(m => m.id === streamId ? { ...m, text: "Error de conexión con el núcleo Gemini.", isThinking: false } : m));
    }
    setState(SystemState.STANDBY);
  };

  const renderMainView = () => {
    switch(view) {
        case 'SIGNALS':
            return (
                <div className="p-6 space-y-8 max-w-7xl mx-auto w-full pb-24">
                    {/* Alerta de Ciclo de Automatización */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in duration-700">
                      <div className="flex items-center gap-3">
                        <HistoryIcon className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Estado del Ciclo Diario</span>
                          <p className="text-[10px] text-gray-400 font-mono">Última ejecución: 12:05 AM (Hoy). Post-Mortem completado.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase">SINCRONIZADO</span>
                      </div>
                    </div>

                    {authError && (
                        <div className="bg-virtus-aztecRed/10 border border-virtus-aztecRed/40 rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_50px_rgba(255,0,60,0.15)] animate-in fade-in slide-in-from-top-6 duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldAlert className="w-32 h-32 text-virtus-aztecRed" />
                            </div>
                            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                                <div className="p-5 bg-virtus-aztecRed/20 rounded-2xl border border-virtus-aztecRed/50 shadow-[0_0_20px_rgba(255,0,60,0.2)]">
                                    <Key className="w-10 h-10 text-virtus-aztecRed animate-pulse" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-widest mb-1 flex items-center gap-3">
                                            Autenticación Bloqueada (Supabase Fix)
                                            <div className="w-2 h-2 bg-virtus-aztecRed rounded-full animate-ping"></div>
                                        </h4>
                                        <p className="text-sm text-gray-400 font-mono leading-relaxed max-w-2xl">
                                            Se detectó una llave legacy. Actualiza tu <b>anon public key</b> para mantener la persistencia orbital.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <input 
                                              type="text" 
                                              value={newKeyInput}
                                              onChange={(e) => setNewKeyInput(e.target.value)}
                                              placeholder="Pega aquí la nueva SUPABASE_ANON_KEY..."
                                              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-3 text-xs font-mono text-virtus-aztecCyan outline-none focus:border-virtus-aztecRed transition-all"
                                            />
                                            <button 
                                              onClick={handlePatchKey}
                                              disabled={newKeyInput.length < 50}
                                              className="bg-virtus-aztecRed hover:bg-white text-black font-black px-6 rounded-xl text-xs uppercase transition-all flex items-center gap-2"
                                            >
                                                Parchear <ShieldCheck className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <ModuleSelector onSelect={handleModuleSelect} disabled={state !== SystemState.STANDBY} currentModule={activeModule} />
                    
                    {state === SystemState.SCANNING ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-virtus-aztecCyan border border-virtus-aztecCyan/20 bg-virtus-aztecCyan/5 rounded-3xl animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-scan-lines opacity-10"></div>
                            <Radar className="w-24 h-24 mb-6 animate-spin-slow opacity-50" />
                            <span className="text-sm font-mono font-black uppercase tracking-[1em] mb-2">Deep_Market_Pulse...</span>
                            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-virtus-aztecCyan animate-progress"></div>
                            </div>
                        </div>
                    ) : activeSignals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700">
                            {activeSignals.map((s, i) => <SignalCard key={i} signal={s} />)}
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-700 border border-white/5 bg-black/30 rounded-3xl border-dashed">
                            <Sparkles className="w-16 h-16 opacity-10 text-virtus-aztecCyan mb-6" />
                            <span className="text-[12px] font-mono uppercase tracking-[1em] font-black text-white/10">KAIROS_V8_READY</span>
                        </div>
                    )}
                </div>
            );
        case 'TERMINAL':
            return (
                <div className="h-full flex flex-col overflow-hidden bg-black/20">
                    <div className="flex-1 overflow-hidden">
                      <TerminalOutput messages={messages} isThinking={state === SystemState.ANALYSIS_ACTIVE} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-3 bg-black/90 backdrop-blur-3xl">
                        <input 
                          type="text" 
                          value={input} 
                          onChange={(e) => setInput(e.target.value)} 
                          placeholder="Ingresa comando neural..." 
                          className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-5 py-4 text-sm font-mono text-white outline-none focus:border-virtus-aztecCyan transition-all" 
                        />
                        <button 
                          type="submit" 
                          className="bg-virtus-aztecCyan text-black font-black px-12 py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            );
        case 'PULSE': return <LivePulse />;
        default: return null;
    }
  };

  return (
    <div className="h-screen bg-virtus-bg text-gray-200 flex flex-col font-sans overflow-hidden select-none">
      <Header 
        state={state} 
        onReset={() => window.location.reload()} 
        isAutoPilot={false} 
        onToggleAutoPilot={() => {}} 
        apiUsage={ticketHistory.length} 
        lastSync={lastSyncTime} 
        isSyncing={isSyncing} 
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onShowHistory={() => setShowHistoryModal(true)} onSync={initializeKairos} />
        <main className="flex-1 flex flex-col min-w-0 bg-virtus-bg relative">
            <div className="bg-black/80 border-b border-virtus-aztecCyan/10 flex px-6 backdrop-blur-xl z-10">
                <button onClick={() => setView('SIGNALS')} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'SIGNALS' ? 'text-white' : 'text-gray-500'}`}>
                    <BarChart3 className="w-4 h-4" /> Deep Monitor
                    {view === 'SIGNALS' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecCyan shadow-[0_0_10px_#00f3ff]"></div>}
                </button>
                <button onClick={() => setView('TERMINAL')} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'TERMINAL' ? 'text-white' : 'text-gray-500'}`}>
                    <TerminalIcon className="w-4 h-4" /> Neural Console
                    {view === 'TERMINAL' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecRed shadow-[0_0_10px_#ff003c]"></div>}
                </button>
                <button onClick={() => setView('PULSE')} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'PULSE' ? 'text-white' : 'text-gray-500'}`}>
                    <Zap className="w-4 h-4" /> Live Pulse
                    {view === 'PULSE' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 shadow-[0_0_10px_#ffd700]"></div>}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto z-10 custom-scrollbar">{renderMainView()}</div>
            <Toolbar metrics={govMetrics} state={state} systemStats={systemStats} onManualSync={initializeKairos} />
        </main>
      </div>
      {showHistoryModal && <HistoryModal tickets={ticketHistory} onClose={() => setShowHistoryModal(false)} onUpdateStatus={(id, s) => ksm.updateTicketStatus(id, s)} />}
    </div>
  );
};

export default App;
