
import React, { useState, useMemo } from 'react';
import { BetTicket, ModuleType, BetStatus } from '../types';
import { 
  X, Trophy, AlertTriangle, Clock, CheckCircle, XCircle, 
  PauseCircle, Search, Filter, BarChart3, TrendingUp, 
  Download, FilterX, Sparkles, ChevronDown, ChevronUp,
  Hash, Calendar, ExternalLink, Brain, History
} from 'lucide-react';

interface HistoryModalProps {
  tickets: BetTicket[];
  onClose: () => void;
  onUpdateStatus?: (ticketId: string, status: BetStatus) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  tickets, 
  onClose, 
  onUpdateStatus 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BetStatus | 'ALL'>('ALL');
  const [selectedModule, setSelectedModule] = useState<ModuleType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'edge' | 'stake'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showOnlyFireSignals, setShowOnlyFireSignals] = useState(false);

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.homeTeam.toLowerCase().includes(term) ||
        t.awayTeam.toLowerCase().includes(term) ||
        t.prediction.toLowerCase().includes(term)
      );
    }
    if (selectedStatus !== 'ALL') filtered = filtered.filter(t => t.status === selectedStatus);
    if (selectedModule !== 'ALL') filtered = filtered.filter(t => t.module === selectedModule);
    if (showOnlyFireSignals) filtered = filtered.filter(t => t.isFireSignal);

    filtered.sort((a, b) => {
      const aVal = sortBy === 'date' ? a.timestamp : (a as any)[sortBy];
      const bVal = sortBy === 'date' ? b.timestamp : (b as any)[sortBy];
      return sortDirection === 'desc' ? Number(bVal) - Number(aVal) : Number(aVal) - Number(bVal);
    });
    return filtered;
  }, [tickets, searchTerm, selectedStatus, selectedModule, showOnlyFireSignals, sortBy, sortDirection]);

  const stats = useMemo(() => {
    const won = filteredTickets.filter(t => t.status === BetStatus.WON).length;
    const lost = filteredTickets.filter(t => t.status === BetStatus.LOST).length;
    const total = won + lost;
    return {
      winRate: total > 0 ? ((won / total) * 100).toFixed(1) : '0.0',
      total,
      fireSignals: filteredTickets.filter(t => t.isFireSignal).length
    };
  }, [filteredTickets]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-virtus-bg border border-virtus-aztecCyan/30 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter">
              {/* Added History from lucide-react to avoid global interface conflict */}
              <History className="w-6 h-6 text-virtus-aztecCyan" />
              REGISTROS NEURALES <span className="text-virtus-aztecRed">V8.3</span>
            </h2>
            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">
              Auditoría de Ineficiencias de Mercado detectadas
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Panel */}
        <div className="p-4 bg-slate-900/50 border-b border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Buscar equipo o predicción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-virtus-aztecCyan"
          />
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="ALL">Todos los Estados</option>
            <option value={BetStatus.PENDING}>Pendientes</option>
            <option value={BetStatus.WON}>Ganadas</option>
            <option value={BetStatus.LOST}>Perdidas</option>
          </select>
          <div className="flex gap-2 items-center px-4 bg-black/30 rounded-lg border border-white/5">
            <span className="text-[10px] font-black text-gray-500 uppercase">Win Rate:</span>
            <span className="text-sm font-mono font-black text-emerald-400">{stats.winRate}%</span>
            <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase">FIRE:</span>
            <span className="text-sm font-mono font-black text-red-500">{stats.fireSignals}</span>
          </div>
          <button 
            onClick={() => setShowOnlyFireSignals(!showOnlyFireSignals)}
            className={`rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${showOnlyFireSignals ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/5 text-gray-400 border border-white/10'}`}
          >
            Filtrar FIRE Signals
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-950 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/10 z-20">
              <tr>
                <th className="p-4">Evento / Deporte</th>
                <th className="p-4">Predicción</th>
                <th className="p-4">Alpha Edge</th>
                <th className="p-4">Stake</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${t.isFireSignal ? 'bg-red-500' : 'bg-virtus-aztecCyan'}`}></div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {t.homeTeam} <span className="text-gray-600 text-[10px]">VS</span> {t.awayTeam}
                          {t.isFireSignal && <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />}
                        </div>
                        <div className="text-[9px] font-mono text-gray-500 flex items-center gap-2 mt-1">
                          <span className="text-virtus-aztecCyan">{t.module}</span>
                          <span>•</span>
                          <span>{new Date(t.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono font-black text-gray-300 bg-white/5 px-2 py-1 rounded">{t.prediction}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">+{t.edge}%</td>
                  <td className="p-4 font-mono font-bold text-virtus-accent">{t.stake}/5</td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                      t.status === BetStatus.WON ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      t.status === BetStatus.LOST ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {t.status === BetStatus.WON ? <CheckCircle className="w-3 h-3" /> : 
                       t.status === BetStatus.LOST ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {t.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onUpdateStatus?.(t.id, BetStatus.WON)}
                        className="p-1.5 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-all"
                        title="Marcar como GANADA"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onUpdateStatus?.(t.id, BetStatus.LOST)}
                        className="p-1.5 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                        title="Marcar como PERDIDA"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="p-20 text-center text-gray-600 font-mono italic">
              No se han encontrado registros en la base de datos orbital.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> KAIROS_V8_AUDIT</span>
            <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> TOTAL_OPS: {tickets.length}</span>
          </div>
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-virtus-aztecCyan"></div>
            ENLACE_DE_DATOS_ESTABLE
          </div>
        </div>
      </div>
    </div>
  );
};
