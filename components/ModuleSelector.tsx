
import React, { useState, useEffect } from 'react';
import { ModuleType } from '../types';
import { 
  Trophy, Activity, Target, History, Satellite, 
  Globe, Flag, Hexagon, Radar, Radio, Flame, 
  GraduationCap, MapPin, Zap, Cpu, Shield, 
  TrendingUp, Brain, Eye, Rocket, BarChart3,
  LucideIcon
} from 'lucide-react';

interface ModuleSelectorProps {
  onSelect: (module: ModuleType) => void;
  disabled: boolean;
  currentModule?: ModuleType;
  compact?: boolean;
}

interface ModuleConfig {
  id: ModuleType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  status: 'active' | 'inactive' | 'beta' | 'maintenance';
  signalStrength?: number;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({ 
  onSelect, 
  disabled,
  currentModule,
  compact = false
}) => {
  const [hoveredModule, setHoveredModule] = useState<ModuleType | null>(null);
  const [loadingModules, setLoadingModules] = useState<Set<ModuleType>>(new Set());

  // Simulate module status
  const getModuleStatus = (module: ModuleType): ModuleConfig['status'] => {
    if (module === ModuleType.NONE) return 'inactive';
    if (module === ModuleType.BACKTEST) return 'beta';
    if (module === ModuleType.GENERAL) return 'active';
    if (module === currentModule) return 'active';
    return Math.random() > 0.7 ? 'maintenance' : 'active';
  };

  // Simulate signal strength for realism
  const getSignalStrength = (module: ModuleType): number => {
    if (module === ModuleType.NONE) return 0;
    return Math.floor(Math.random() * 100);
  };

  const modules: ModuleConfig[] = [
    { 
      id: ModuleType.GENERAL, 
      label: 'OMNI SCAN',
      description: 'Escaneo global multi-deporte',
      icon: Radar,
      color: 'from-white to-gray-300',
      bgGradient: 'from-gray-900/90 to-black',
      borderColor: 'border-white/30',
      textColor: 'text-white',
      glowColor: 'shadow-[0_0_30px_rgba(255,255,255,0.3)]',
      status: getModuleStatus(ModuleType.GENERAL),
      signalStrength: 100
    },
    { 
      id: ModuleType.NCAA, 
      label: 'NCAA CORE',
      description: 'Análisis colegial avanzado',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-950/80 to-black',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-300',
      glowColor: 'shadow-[0_0_25px_rgba(59,130,246,0.4)]',
      status: getModuleStatus(ModuleType.NCAA),
      signalStrength: getSignalStrength(ModuleType.NCAA)
    },
    { 
      id: ModuleType.LMB, 
      label: 'LMB MONEYBALL',
      description: 'Beisbol mexicano con AI',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      bgGradient: 'from-red-950/80 to-black',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-300',
      glowColor: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]',
      status: getModuleStatus(ModuleType.LMB),
      signalStrength: getSignalStrength(ModuleType.LMB)
    },
    { 
      id: ModuleType.SOCCER_EUROPE, 
      label: 'ATLAS EUROPA',
      description: 'Fútbol europeo premium',
      icon: Globe,
      color: 'from-emerald-500 to-green-400',
      bgGradient: 'from-emerald-950/80 to-black',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-300',
      glowColor: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]',
      status: getModuleStatus(ModuleType.SOCCER_EUROPE),
      signalStrength: getSignalStrength(ModuleType.SOCCER_EUROPE)
    },
    { 
      id: ModuleType.SOCCER_AMERICAS, 
      label: 'ATLAS AMÉRICAS',
      description: 'Fútbol americano latino',
      icon: MapPin,
      color: 'from-green-500 to-emerald-400',
      bgGradient: 'from-green-950/80 to-black',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-300',
      glowColor: 'shadow-[0_0_25px_rgba(34,197,94,0.4)]',
      status: getModuleStatus(ModuleType.SOCCER_AMERICAS),
      signalStrength: getSignalStrength(ModuleType.SOCCER_AMERICAS)
    },
    { 
      id: ModuleType.NBA, 
      label: 'NBA PACER',
      description: 'Análisis baloncesto NBA',
      icon: Target,
      color: 'from-orange-500 to-amber-400',
      bgGradient: 'from-orange-950/80 to-black',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-300',
      glowColor: 'shadow-[0_0_25px_rgba(249,115,22,0.4)]',
      status: getModuleStatus(ModuleType.NBA),
      signalStrength: getSignalStrength(ModuleType.NBA)
    },
    { 
      id: ModuleType.MLB, 
      label: 'MLB DATA',
      description: 'Beisbol MLB estadístico',
      icon: Hexagon,
      color: 'from-slate-400 to-gray-300',
      bgGradient: 'from-slate-900/80 to-black',
      borderColor: 'border-slate-500/40',
      textColor: 'text-slate-300',
      glowColor: 'shadow-[0_0_20px_rgba(100,116,139,0.3)]',
      status: getModuleStatus(ModuleType.MLB),
      signalStrength: getSignalStrength(ModuleType.MLB)
    },
    { 
      id: ModuleType.TENNIS, 
      label: 'TENNIS COURT',
      description: 'Análisis tenis profesional',
      icon: Activity,
      color: 'from-yellow-400 to-amber-300',
      bgGradient: 'from-yellow-950/80 to-black',
      borderColor: 'border-yellow-400/40',
      textColor: 'text-yellow-300',
      glowColor: 'shadow-[0_0_25px_rgba(250,204,21,0.4)]',
      status: getModuleStatus(ModuleType.TENNIS),
      signalStrength: getSignalStrength(ModuleType.TENNIS)
    },
    { 
      id: ModuleType.NFL, 
      label: 'NFL SYSTEM',
      description: 'Fútbol americano NFL',
      icon: Trophy,
      color: 'from-cyan-500 to-blue-400',
      bgGradient: 'from-cyan-950/80 to-black',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-300',
      glowColor: 'shadow-[0_0_25px_rgba(6,182,212,0.4)]',
      status: getModuleStatus(ModuleType.NFL),
      signalStrength: getSignalStrength(ModuleType.NFL)
    },
    { 
      id: ModuleType.BACKTEST, 
      label: 'BACKTEST LAB',
      description: 'Laboratorio de estrategias',
      icon: BarChart3,
      color: 'from-purple-500 to-violet-400',
      bgGradient: 'from-purple-950/80 to-black',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-300',
      glowColor: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]',
      status: getModuleStatus(ModuleType.BACKTEST),
      signalStrength: getSignalStrength(ModuleType.BACKTEST)
    },
  ];

  const handleModuleClick = async (module: ModuleType) => {
    if (disabled || loadingModules.has(module)) return;
    
    setLoadingModules(prev => new Set(prev).add(module));
    try {
      onSelect(module);
    } finally {
      setTimeout(() => {
        setLoadingModules(prev => {
          const newSet = new Set(prev);
          newSet.delete(module);
          return newSet;
        });
      }, 1000);
    }
  };

  const getStatusIndicator = (status: ModuleConfig['status']) => {
    switch (status) {
      case 'active':
        return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse"></div>;
      case 'beta':
        return <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7] animate-pulse"></div>;
      case 'maintenance':
        return <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b] animate-pulse"></div>;
      default:
        return <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>;
    }
  };

  const getStatusText = (status: ModuleConfig['status']) => {
    switch (status) {
      case 'active': return 'ACTIVO';
      case 'beta': return 'BETA';
      case 'maintenance': return 'MANTENIMIENTO';
      default: return 'INACTIVO';
    }
  };

  const renderCompactModule = (module: ModuleConfig) => (
    <button
      key={module.id}
      onClick={() => handleModuleClick(module.id)}
      disabled={disabled || module.status === 'inactive'}
      onMouseEnter={() => setHoveredModule(module.id)}
      onMouseLeave={() => setHoveredModule(null)}
      className={`
        relative group flex items-center justify-center px-3 py-2.5 rounded-lg border
        ${module.bgGradient} ${module.borderColor} ${module.textColor}
        transition-all duration-300 backdrop-blur-sm
        ${disabled || module.status === 'inactive' ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 hover:shadow-lg'}
        ${currentModule === module.id ? `${module.glowColor} scale-105` : ''}
        ${hoveredModule === module.id ? 'z-10' : ''}
      `}
    >
      {/* Loading overlay */}
      {loadingModules.has(module.id) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-1.5">
        <div className={`p-2 rounded-lg bg-black/30 border border-white/10 group-hover:border-white/20 transition-colors`}>
          <module.icon className="w-5 h-5" />
        </div>
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-wider truncate max-w-[80px]">
            {module.label.split(' ')[0]}
          </div>
          <div className="text-[7px] text-gray-400 mt-0.5">
            {getStatusText(module.status)}
          </div>
        </div>
      </div>
      
      {/* Active indicator */}
      {currentModule === module.id && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-virtus-aztecCyan rounded-full animate-ping"></div>
      )}
    </button>
  );

  const renderFullModule = (module: ModuleConfig) => (
    <button
      key={module.id}
      onClick={() => handleModuleClick(module.id)}
      disabled={disabled || module.status === 'inactive'}
      onMouseEnter={() => setHoveredModule(module.id)}
      onMouseLeave={() => setHoveredModule(null)}
      className={`
        relative group flex flex-col gap-3 p-4 rounded-xl border
        ${module.bgGradient} ${module.borderColor} ${module.textColor}
        transition-all duration-300 backdrop-blur-sm
        ${disabled || module.status === 'inactive' ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02] hover:shadow-xl'}
        ${currentModule === module.id ? `${module.glowColor} scale-[1.02] border-white/60` : ''}
        ${hoveredModule === module.id ? 'z-10' : ''}
        min-h-[120px]
      `}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
      
      {/* Loading overlay */}
      {loadingModules.has(module.id) && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-white">Iniciando...</span>
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/30 border border-white/10 group-hover:border-white/20 transition-colors`}>
            <module.icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold font-mono text-sm tracking-wide">{module.label}</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
              {getStatusText(module.status)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          {getStatusIndicator(module.status)}
          {module.signalStrength && module.signalStrength > 0 && (
            <div className="text-[8px] text-gray-500 font-mono flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              {module.signalStrength}%
            </div>
          )}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] text-gray-300 leading-tight">{module.description}</p>
      </div>
      
      {/* Signal strength bar */}
      {module.signalStrength && module.signalStrength > 0 && (
        <div className="relative z-10 mt-2">
          <div className="flex justify-between text-[8px] text-gray-500 mb-1">
            <span>SIGNAL</span>
            <span>{module.signalStrength}%</span>
          </div>
          <div className="h-1 bg-black/50 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
              style={{ width: `${module.signalStrength}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Hover effect lines */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      
      {/* Active indicator */}
      {currentModule === module.id && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-virtus-aztecCyan rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-virtus-aztecCyan rounded-full"></div>
        </>
      )}
    </button>
  );

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-6 text-center">
          <h2 className="text-lg font-mono font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Cpu className="w-5 h-5 text-virtus-aztecCyan animate-pulse" />
            SELECCIÓN DE MÓDULOS
            <Shield className="w-5 h-5 text-virtus-aztecCyan" />
          </h2>
          <p className="text-xs text-gray-500 font-mono max-w-2xl mx-auto">
            Seleccione un módulo para iniciar el análisis orbital profundo. 
            Cada módulo utiliza algoritmos especializados para detectar ineficiencias de mercado.
          </p>
        </div>
      )}
      
      <div className={`
        ${compact 
          ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2' 
          : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
        }
        w-full max-w-7xl mx-auto
      `}>
        {modules.map(module => 
          compact ? renderCompactModule(module) : renderFullModule(module)
        )}
      </div>
      
      {!compact && (
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-gray-400 uppercase">Activo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-[10px] text-gray-400 uppercase">Beta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[10px] text-gray-400 uppercase">Mantenimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <span className="text-[10px] text-gray-400 uppercase">Inactivo</span>
          </div>
        </div>
      )}
    </div>
  );
};