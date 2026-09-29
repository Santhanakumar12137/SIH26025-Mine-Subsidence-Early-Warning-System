import React, { useState } from 'react';
import { SensorReading, MineNode, SmsAlertRecord } from '../types/mine';
import { CloudDataTable } from './CloudDataTable';
import { AiAnalysisSection } from './AiAnalysisSection';
import { GisMap } from './GisMap';
import { GaugesPanel } from './GaugesPanel';
import { 
  Activity, 
  MapPin, 
  BrainCircuit, 
  Gauge, 
  BellRing, 
  Ambulance, 
  ShieldAlert, 
  Database,
  Layers,
  Send,
  Radio,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface CloudAiGisDashboardProps {
  history: SensorReading[];
  currentReading: SensorReading;
  nodes: MineNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  isAlarmActive: boolean;
  isRescueActive: boolean;
  onTriggerRescue: () => void;
  onOpenAlertModal: () => void;
  smsRecords: SmsAlertRecord[];
  loraStats: {
    rssi: number;
    snr: number;
    frequency: string;
    packetsReceived: number;
    packetLossPct: number;
    gatewayId: string;
  };
}

export const CloudAiGisDashboard: React.FC<CloudAiGisDashboardProps> = ({
  history,
  currentReading,
  nodes,
  selectedNodeId,
  onSelectNode,
  isAlarmActive,
  isRescueActive,
  onTriggerRescue,
  onOpenAlertModal,
  smsRecords,
  loraStats,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'ai' | 'gis' | 'cloud' | 'gauges'>('overview');

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Top Bar with Navigation Tabs */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
                CLOUD / AI / GIS DASHBOARD
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                SIH26025
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              DGMS &amp; Ministry of Coal Central Telemetry Network
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
              activeSection === 'overview' 
                ? 'bg-cyan-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All-In-One Command
          </button>
          <button
            onClick={() => setActiveSection('ai')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition flex items-center gap-1 ${
              activeSection === 'ai' 
                ? 'bg-fuchsia-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            AI/ML Analysis
          </button>
          <button
            onClick={() => setActiveSection('gis')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition flex items-center gap-1 ${
              activeSection === 'gis' 
                ? 'bg-emerald-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            GIS &amp; Evacuation
          </button>
          <button
            onClick={() => setActiveSection('cloud')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition flex items-center gap-1 ${
              activeSection === 'cloud' 
                ? 'bg-yellow-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Cloud Telemetry
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="p-4 space-y-5">
        
        {/* TOP: GATEWAY STATUS & REPOSITORY (Always visible or in overview) */}
        <CloudDataTable
          history={history}
          currentReading={currentReading}
          loraStats={loraStats}
        />

        {/* SECTION: AI / ML ANALYSIS (Critical for judges!) */}
        {(activeSection === 'overview' || activeSection === 'ai') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
                  AI / ML REAL-TIME SUBSIDENCE FAILURE ENGINE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-fuchsia-300 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-500/40">
                FUKUZONO (1985) • KALMAN FILTER • Z-SCORE ANOMALY
              </span>
            </div>

            <AiAnalysisSection
              history={history}
              currentReading={currentReading}
            />
          </div>
        )}

        {/* SECTION: GIS JHARIA COAL MINE MAP */}
        {(activeSection === 'overview' || activeSection === 'gis') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
                  GIS MINE MAPPING &amp; SUBSIDENCE OVERBURDEN (JHARIA COALFIELD)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-slate-400">Selected:</span>
                <span className="text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {nodes.find(n => n.id === selectedNodeId)?.name || 'Node 1 (Seam 14)'}
                </span>
              </div>
            </div>

            <GisMap
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              isAlarmActive={isAlarmActive}
              displacement={currentReading.disp}
              isRescueActive={isRescueActive}
            />

            {/* 5 Mine Nodes Quick Switcher Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              {nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isCritical = (isSelected && isAlarmActive) || node.status === 'critical';
                const isWarning = node.status === 'warning' || (isSelected && currentReading.disp > 30);

                return (
                  <button
                    key={node.id}
                    onClick={() => onSelectNode(node.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{node.code}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        isCritical ? 'bg-red-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">{node.name}</div>
                    <div className="text-[9px] text-slate-500">Depth: {node.depthMeters}m</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM 3 ACTIONS BAR (Explicitly requested by user) */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-pink-400" />
              SYSTEM RESPONSE &amp; CONTINGENCY ACTIONS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Immediate Operator Controls
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* ACTION 1: DASHBOARD (Live + Graph) */}
            <button
              onClick={() => setActiveSection('overview')}
              className={`p-3.5 rounded-xl border flex flex-col justify-between text-left cursor-pointer transition-all duration-200 group ${
                activeSection === 'overview'
                  ? 'bg-sky-950/60 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-mono font-bold text-sky-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  1. DASHBOARD (LIVE + GRAPH)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                View 7-sensor radial gauges, real-time telemetry curves, and core parameters.
              </p>
              <div className="mt-2 text-[10px] font-mono text-sky-400 font-bold flex items-center gap-1">
                <span>Inspect Gauges &amp; Trends</span> →
              </div>
            </button>

            {/* ACTION 2: ALERT (SMS / App) */}
            <button
              onClick={onOpenAlertModal}
              className={`p-3.5 rounded-xl border flex flex-col justify-between text-left cursor-pointer transition-all duration-200 group ${
                isAlarmActive
                  ? 'bg-red-950/80 border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.6)] animate-pulse'
                  : 'bg-slate-900/80 border-slate-800 hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-xs font-mono font-bold flex items-center gap-2 ${
                  isAlarmActive ? 'text-red-300' : 'text-rose-400'
                }`}>
                  <BellRing className={`w-4 h-4 ${isAlarmActive ? 'text-red-400 animate-bounce' : 'text-rose-400'}`} />
                  2. ALERT (SMS / APP)
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isAlarmActive 
                    ? 'bg-red-900 text-white border-red-500 font-bold' 
                    : 'bg-rose-950 text-rose-300 border-rose-500/30'
                }`}>
                  {isAlarmActive ? '🚨 TRIGGERED' : 'STANDBY'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Trigger popup warning, activate siren buzzer, and dispatch SMS to Safety Officer.
              </p>
              <div className="mt-2 text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
                <span>View Alert Modal &amp; SMS Logs</span> →
              </div>
            </button>

            {/* ACTION 3: RESCUE (Evacuation) */}
            <button
              onClick={onTriggerRescue}
              className={`p-3.5 rounded-xl border flex flex-col justify-between text-left cursor-pointer transition-all duration-200 group ${
                isRescueActive
                  ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.5)]'
                  : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
                  <Ambulance className={`w-4 h-4 ${isRescueActive ? 'text-emerald-400 animate-pulse' : 'text-emerald-400'}`} />
                  3. RESCUE (EVACUATION)
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isRescueActive 
                    ? 'bg-emerald-900 text-white border-emerald-400 font-bold' 
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isRescueActive ? '🚑 AMBULANCE MOVING' : 'DISPATCH'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Plot dynamic evacuation route on GIS map &amp; animate moving rescue ambulance.
              </p>
              <div className="mt-2 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <span>{isRescueActive ? 'Evacuation Active on GIS' : 'Engage Emergency Evacuation'}</span> →
              </div>
            </button>
          </div>
        </div>

        {/* 7-SENSOR RADIAL GAUGES SECTION (Always displayed prominently) */}
        <div className="pt-2">
          <GaugesPanel reading={currentReading} />
        </div>

      </div>
    </div>
  );
};
