import React from 'react';
import { 
  Mountain, 
  Cpu, 
  Radio, 
  Server, 
  BrainCircuit, 
  MapPin, 
  Activity, 
  BellRing, 
  Ambulance, 
  ChevronRight,
  Flame,
  Gauge
} from 'lucide-react';

interface BreadcrumbFlowProps {
  currentStage?: string;
  isAlarmActive: boolean;
  onSelectStage?: (stageKey: string) => void;
}

interface StepItem {
  id: string;
  label: string;
  sub: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorGlow: string;
  icon: React.ReactNode;
}

export const BreadcrumbFlow: React.FC<BreadcrumbFlowProps> = ({ isAlarmActive, onSelectStage }) => {
  const steps: StepItem[] = [
    {
      id: 'mine',
      label: 'UNDERGROUND MINE',
      sub: 'Jharia Coal Mine (-180m)',
      colorBg: 'bg-sky-950/70',
      colorBorder: 'border-sky-400',
      colorText: 'text-sky-300',
      colorGlow: 'shadow-[0_0_12px_rgba(56,189,248,0.35)]',
      icon: <Mountain className="w-3.5 h-3.5 text-sky-400" />
    },
    {
      id: 'sensors',
      label: 'SENSORS',
      sub: 'MQ4, DHT, BMP, MPU6050',
      colorBg: 'bg-emerald-950/70',
      colorBorder: 'border-emerald-400',
      colorText: 'text-emerald-300',
      colorGlow: 'shadow-[0_0_12px_rgba(52,211,153,0.35)]',
      icon: <Gauge className="w-3.5 h-3.5 text-emerald-400" />
    },
    {
      id: 'esp32',
      label: 'ESP32 (CORE)',
      sub: 'DevKit V1 Moving Avg',
      colorBg: 'bg-purple-950/70',
      colorBorder: 'border-purple-400',
      colorText: 'text-purple-300',
      colorGlow: 'shadow-[0_0_12px_rgba(192,132,252,0.35)]',
      icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />
    },
    {
      id: 'buzzer_lora',
      label: 'BUZZER / LoRa',
      sub: 'GPIO 25 & SX1278 SPI',
      colorBg: isAlarmActive ? 'bg-red-950/90 animate-pulse' : 'bg-rose-950/70',
      colorBorder: isAlarmActive ? 'border-red-500' : 'border-rose-400',
      colorText: isAlarmActive ? 'text-red-400 font-bold' : 'text-rose-300',
      colorGlow: isAlarmActive ? 'shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'shadow-[0_0_12px_rgba(251,113,133,0.35)]',
      icon: <Radio className="w-3.5 h-3.5 text-rose-400" />
    },
    {
      id: 'gateway',
      label: 'GATEWAY',
      sub: 'LoRa Concentrator (868MHz)',
      colorBg: 'bg-cyan-950/70',
      colorBorder: 'border-cyan-400',
      colorText: 'text-cyan-300',
      colorGlow: 'shadow-[0_0_12px_rgba(34,211,238,0.35)]',
      icon: <Radio className="w-3.5 h-3.5 text-cyan-400" />
    },
    {
      id: 'cloud',
      label: 'CLOUD / SERVER',
      sub: 'Real-time JSON Logs',
      colorBg: 'bg-yellow-950/70',
      colorBorder: 'border-yellow-400',
      colorText: 'text-yellow-300',
      colorGlow: 'shadow-[0_0_12px_rgba(250,204,21,0.35)]',
      icon: <Server className="w-3.5 h-3.5 text-yellow-400" />
    },
    {
      id: 'ai_ml',
      label: 'AI / ML ANALYSIS',
      sub: 'Fukuzono Inverse Velocity',
      colorBg: 'bg-fuchsia-950/70',
      colorBorder: 'border-fuchsia-400',
      colorText: 'text-fuchsia-300',
      colorGlow: 'shadow-[0_0_14px_rgba(232,121,249,0.4)]',
      icon: <BrainCircuit className="w-3.5 h-3.5 text-fuchsia-400" />
    },
    {
      id: 'gis',
      label: 'GIS',
      sub: 'Jharia Coal Mine Map',
      colorBg: 'bg-teal-950/70',
      colorBorder: 'border-teal-400',
      colorText: 'text-teal-300',
      colorGlow: 'shadow-[0_0_12px_rgba(45,212,191,0.35)]',
      icon: <MapPin className="w-3.5 h-3.5 text-teal-400" />
    },
    {
      id: 'dashboard_alert_rescue',
      label: 'DASHBOARD / ALERT / RESCUE',
      sub: 'Gauges • SMS • Evacuation',
      colorBg: isAlarmActive ? 'bg-amber-950/80 border-amber-500' : 'bg-pink-950/70 border-pink-400',
      colorBorder: isAlarmActive ? 'border-amber-400' : 'border-pink-400',
      colorText: isAlarmActive ? 'text-amber-300' : 'text-pink-300',
      colorGlow: 'shadow-[0_0_14px_rgba(244,114,182,0.4)]',
      icon: <Ambulance className="w-3.5 h-3.5 text-pink-400" />
    }
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 px-3 py-2.5 overflow-x-auto shadow-inner">
      <div className="flex items-center min-w-max space-x-1.5 text-xs">
        <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 mr-1 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          SYSTEM PIPELINE:
        </span>
        
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onSelectStage?.(step.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border ${step.colorBg} ${step.colorBorder} ${step.colorGlow} transition-all duration-200 hover:scale-[1.02] text-left cursor-pointer group`}
            >
              <div className="p-1 rounded bg-black/40 border border-white/10 group-hover:border-white/30">
                {step.icon}
              </div>
              <div className="flex flex-col">
                <span className={`font-mono text-[11px] font-bold ${step.colorText} tracking-tight`}>
                  {step.label}
                </span>
                <span className="text-[9px] text-slate-300/80 font-sans leading-none">
                  {step.sub}
                </span>
              </div>
            </button>
            
            {idx < steps.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-0.5" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
