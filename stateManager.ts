
import { BetTicket, ModuleType, MatchDashboardData, PulseEvent, SystemState, BetStatus } from './types';
import { runNeuralDebate } from './services/geminiService';
import { saveTicket, fetchTickets } from '@/supabaseClient';

class GlobalStateManager {
    private storageKey = 'kairos_v8_persistent_vault';
    private listeners: Array<() => void> = [];
    private syncInterval: any = null;

    private state = {
        globalHistory: [] as BetTicket[],
        activityLog: [] as PulseEvent[],
        isProcessing: false,
        currentSport: ModuleType.NONE,
        systemState: SystemState.STANDBY,
        lastSynced: Date.now(),
        maxHistorySize: 300,
        maxActivityLogSize: 200
    };

    constructor() {
        this.init();
    }

    private async init() {
        this.loadFromStorage();
        this.setupAutoSync();
        this.logActivity('SYSTEM', '🔌 Sincronizando registros con Supabase...', 'medium');
        await this.syncWithCloud();
    }

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state.globalHistory = parsed.globalHistory || [];
                this.state.activityLog = parsed.activityLog || [];
                this.state.currentSport = parsed.currentSport || ModuleType.NONE;
                this.state.systemState = parsed.systemState || SystemState.STANDBY;
            }
        } catch (e) {}
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({ 
                globalHistory: this.state.globalHistory.slice(0, this.state.maxHistorySize),
                activityLog: this.state.activityLog.slice(0, this.state.maxActivityLogSize),
                currentSport: this.state.currentSport,
                systemState: this.state.systemState
            }));
        } catch (e) {}
    }

    private setupAutoSync() {
        this.syncInterval = setInterval(() => this.syncWithCloud(), 120000); // Cada 2 min
    }

    public async syncWithCloud(): Promise<void> {
        try {
            const cloudTickets = await fetchTickets();
            if (cloudTickets && cloudTickets.length > 0) {
                const localMap = new Map(this.state.globalHistory.map(t => [t.id, t]));
                cloudTickets.forEach(ct => localMap.set(ct.id, ct));
                
                this.state.globalHistory = Array.from(localMap.values())
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, this.state.maxHistorySize);
                
                this.state.lastSynced = Date.now();
                this.saveToStorage();
                this.notify();
            }
        } catch (error) {
            console.error("Sync Error", error);
        }
    }

    public getHistory(): BetTicket[] { return [...this.state.globalHistory]; }
    public getActivityLog(): PulseEvent[] { return [...this.state.activityLog]; }
    public getSystemState(): SystemState { return this.state.systemState; }
    public setCurrentSport(sport: ModuleType) { this.state.currentSport = sport; this.notify(); }
    public getCurrentSport(): ModuleType { return this.state.currentSport; }

    public logActivity(sport: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'low') {
        const event: PulseEvent = {
            id: `ev-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            sport, message, timestamp: Date.now(), severity
        };
        this.state.activityLog = [event, ...this.state.activityLog].slice(0, this.state.maxActivityLogSize);
        this.notify();
    }

    public async addSignals(signals: MatchDashboardData[], module: ModuleType) {
        let savedCount = 0;
        let failCount = 0;

        for (const data of signals) {
            const id = `${module}-${data.homeTeam}-${data.awayTeam}`.toLowerCase().replace(/\s+/g, '-');
            const existsLocally = this.state.globalHistory.some(t => t.id === id);
            
            const ticket: BetTicket = {
                id, module, homeTeam: data.homeTeam, awayTeam: data.awayTeam,
                prediction: data.prediction, edge: data.edge, stake: data.stake,
                summary: data.summary, timestamp: Date.now(), status: BetStatus.PENDING,
                isFireSignal: data.isFireSignal,
                topProp: data.recommendedProps?.[0] || '',
                neuralAnchor: data.neuralAnchor || `ui-${Math.random().toString(36).substring(7)}`
            };

            // Intentamos guardar en Supabase
            const success = await saveTicket(ticket);
            if (success) savedCount++;
            else failCount++;

            if (!existsLocally) {
                this.state.globalHistory.unshift(ticket);
            } else {
                const idx = this.state.globalHistory.findIndex(t => t.id === id);
                this.state.globalHistory[idx] = ticket;
            }
        }
        
        if (savedCount > 0) {
            this.logActivity('SYSTEM', `✅ ${savedCount} registros sincronizados con Supabase`, 'low');
        }
        
        if (failCount > 0) {
            this.logActivity('SYSTEM', `⚠️ ${failCount} registros fallaron al subir a la nube (Ver Consola)`, 'high');
        }

        this.notify();
        this.saveToStorage();
    }

    public updateTicket(ticket: BetTicket) {
        const idx = this.state.globalHistory.findIndex(t => t.id === ticket.id);
        if (idx !== -1) {
            this.state.globalHistory[idx] = ticket;
        } else {
            this.state.globalHistory.unshift(ticket);
        }
        this.notify();
        this.saveToStorage();
    }

    public async updateTicketStatus(id: string, status: BetStatus) {
        const ticket = this.state.globalHistory.find(t => t.id === id);
        if (ticket) {
            ticket.status = status;
            const success = await saveTicket(ticket);
            if (!success) {
                this.logActivity('SYSTEM', `Error de sincronización de estado para: ${id}`, 'medium');
            }
            this.notify();
            this.saveToStorage();
        }
    }

    public subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    private notify() {
        this.listeners.forEach(l => l());
        window.dispatchEvent(new CustomEvent('kairos-state-update'));
    }

    public getStats() {
        return {
            totalTickets: this.state.globalHistory.length,
            fireSignals: this.state.globalHistory.filter(t => t.isFireSignal).length,
            queueLength: 0,
            lastSynced: this.state.lastSynced
        };
    }
}

export const ksm = new GlobalStateManager();
