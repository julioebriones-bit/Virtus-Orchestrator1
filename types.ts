
// Enums mejor definidos
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AgentType {
  APOLLO = 'APOLLO',
  CASSANDRA = 'CASSANDRA',
  META = 'META',
  EXECUTOR = 'EXECUTOR',
  SYSTEM = 'SYSTEM',
  QUANTUM = 'QUANTUM',
  SOCRATES = 'SOCRATES'
}

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  QUEUED = 'QUEUED',
  CANCELLED = 'CANCELLED',
  VOID = 'VOID'
}

export enum SystemState {
  STANDBY = 'STANDBY',
  SCANNING = 'SCANNING',
  ANALYSIS_READY = 'ANALYSIS_READY',
  ANALYSIS_ACTIVE = 'ANALYSIS_ACTIVE',
  AUTO_PILOT = 'AUTO_PILOT',
  HIBERNATION = 'HIBERNATION',
  MIDNIGHT_SYNC = 'MIDNIGHT_SYNC',
  QUANTUM_COLLAPSE = 'QUANTUM_COLLAPSE',
  BLACK_SWAN_SCAN = 'BLACK_SWAN_SCAN'
}

export enum ModuleType {
  NONE = 'NONE',
  GENERAL = 'GENERAL',
  NBA = 'NBA',
  NFL = 'NFL',
  MLB = 'MLB',
  LMB = 'LMB',
  SOCCER_EUROPE = 'SOCCER_EUROPE',
  SOCCER_AMERICAS = 'SOCCER_AMERICAS',
  TENNIS = 'TENNIS',
  NCAA = 'NCAA',
  BACKTEST = 'BACKTEST'
}

// Tipos base reutilizables
export type Timestamp = number;
export type UUID = string;

// Interfaces base
export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface PulseEvent {
    id: string;
    sport: string;
    message: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BetTicket {
    id: string;
    module: ModuleType;
    homeTeam: string;
    awayTeam: string;
    prediction: string;
    edge: number;
    stake: number;
    summary: string;
    timestamp: number;
    status: BetStatus;
    isFireSignal?: boolean;
    topProp?: string;
    neuralAnchor?: string;
    expectedMetrics?: any;
    quantumMetrics?: {
        entropy: number;
        blackSwan: number;
        collapsedRealities: number;
    };
}

export interface GlobalIntelligence {
    sport: string;
    league: string;
    avg_efficiency: number;
    sample_size: number;
}

export interface GlobalSummary {
    total_analyses: number;
    success_rate: number;
    system_status: string;
}

export interface StatMetric {
  label: string;
  homeValue: number;
  awayValue: number;
}

export interface TrendPoint {
  time: string;
  value: number;
}

export interface ExplainableEvidence {
  causal: string;
  counterfactual: string;
  philosophical: string;
}

export interface NeuralDebateResult {
  apollo: string;
  cassandra: string;
  socrates: string;
  meta: string;
  finalDecision: boolean;
  neuralAnchor: string;
  confidence: number;
  quantumEntropy: number;
  blackSwanProb: number;
  evidence: ExplainableEvidence;
}

// MatchDashboardData optimizado
export interface MatchDashboardData {
  type: 'MATCH';
  homeTeam: string;
  awayTeam: string;
  leagueName?: string;
  winProbability: number;
  prediction: string;
  edge: number;
  stake: number;
  summary: string;
  stats?: StatMetric[];
  trend?: TrendPoint[];
  recommendedProps: string[];
  isFireSignal?: boolean;
  neuralAnchor?: string;
  quantumEntropy?: number;
  blackSwanProb?: number;
  evidence?: ExplainableEvidence;
  timestamp?: number;
}

export interface BacktestDashboardData {
  type: 'BACKTEST';
  period: string;
  winRate: number;
  totalBets: number;
  totalProfit: number;
  roi: number;
  breakdown: { label: string; value: number }[];
  curve: { time: string; value: number }[];
  strategyAdjustments: string[];
}

export type DashboardData = MatchDashboardData | BacktestDashboardData;

export interface AnalysisMessage extends BaseEntity {
  role: 'user' | 'model' | 'system' | 'agent';
  text: string;
  agent?: AgentType;
  isThinking?: boolean;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
    tokens?: number;
  };
}

export interface GovernanceMetrics {
  reputationScore: number;
  votingPower: number;
  totalProposals: number;
  consensusStrength: number;
}

export interface BetSignal {
  isFireSignal: boolean;
  neuralAnchor: string;
}
