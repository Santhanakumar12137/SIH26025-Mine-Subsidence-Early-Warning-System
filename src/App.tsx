import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BreadcrumbFlow } from './components/BreadcrumbFlow';
import { WokwiHardwarePanel } from './components/WokwiHardwarePanel';
import { CloudAiGisDashboard } from './components/CloudAiGisDashboard';
import { AlertRescueModal } from './components/AlertRescueModal';
import { buzzerSound } from './services/sound';
import { SensorReading, MineNode, SmsAlertRecord } from './types/mine';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  RotateCcw,
  Sparkles,
  Info,
  Radio
} from 'lucide-react';

const INITIAL_NODES: MineNode[] = [
  {
    id: 'node-1',
    name: 'Seam 14 Active Face (Longwall)',
    code: 'N01',
    lat: 23.7505,
    lng: 86.4210,
    depthMeters: 185,
    status: 'safe',
    battery: 94,
    signalRssi: -66,
    lastSeen: 'Just now',
  },
  {
    id: 'node-2',
    name: 'North Main Haulage Gallery',
    code: 'N02',
    lat: 23.7522,
    lng: 86.4225,
    depthMeters: 140,
    status: 'safe',
    battery: 89,
    signalRssi: -72,
    lastSeen: '1s ago',
  },
  {
    id: 'node-3',
    name: 'South Incline Shaft Pillar',
    code: 'N03',
    lat: 23.7490,
    lng: 86.4190,
    depthMeters: 210,
    status: 'safe',
    battery: 98,
    signalRssi: -68,
    lastSeen: '3s ago',
  },
  {
    id: 'node-4',
    name: 'Overburden Void Subsidence Zone',
    code: 'N04',
    lat: 23.7538,
    lng: 86.4240,
    depthMeters: 90,
    status: 'warning',
    battery: 76,
    signalRssi: -79,
    lastSeen: '2s ago',
  },
  {
    id: 'node-5',
    name: 'Main Return Airway Exhaust',
    code: 'N05',
    lat: 23.7555,
    lng: 86.4260,
    depthMeters: 60,
    status: 'safe',
    battery: 92,
    signalRssi: -62,
    lastSeen: 'Just now',
  },
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted to adhere to browser audio policies, user can unmute with 1 click
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isRescueActive, setIsRescueActive] = useState<boolean>(false);
  const [txPacketCount, setTxPacketCount] = useState<number>(142);
  const [hasUserAcknowledgedModal, setHasUserAcknowledgedModal] = useState<boolean>(false);

  // Raw user slider inputs
  const [rawSliders, setRawSliders] = useState({
    gas: 180, // ppm
    temp: 27.5, // °C
    humid: 62.0, // %
    pressure: 1012, // hPa
    strain: 14.0, // %
    tilt: 2.1, // deg
    disp: 12.5, // mm
    vibration: 0.65, // g
  });

  // Recent 5 displacement readings for moving average
  const recentDispWindow = useRef<number[]>([12.0, 12.2, 12.4, 12.5, 12.5]);
  const prevDispRef = useRef<number>(12.5);

  // Current processed sensor reading
  const [currentReading, setCurrentReading] = useState<SensorReading>(() => {
    const now = new Date();
    return {
      gas: 180,
      temp: 27.5,
      humid: 62,
      pressure: 1012,
      strain: 14,
      tilt: 2.1,
      disp: 12.5,
      vibration: 0.65,
      velocity: 0.08,
      inv_velocity: 12.5,
      timestamp: now.toLocaleTimeString(),
      raw_disp: 12.5,
      filtered_disp: 12.5,
      isAlarm: false,
      alarmReasons: [],
    };
  });

  // Historical readings (for CSV export and Chart.js graphs)
  const [history, setHistory] = useState<SensorReading[]>(() => {
    const list: SensorReading[] = [];
    const baseTime = new Date(Date.now() - 30 * 2000);
    for (let i = 0; i < 20; i++) {
      const t = new Date(baseTime.getTime() + i * 2000);
      const dispVal = 10 + i * 0.15 + (Math.random() * 0.4 - 0.2);
      const vel = 0.075 + Math.random() * 0.02;
      list.push({
        gas: 170 + Math.random() * 20,
        temp: 27.2 + Math.random() * 0.5,
        humid: 61 + Math.random() * 2,
        pressure: 1012 + Math.random() * 1,
        strain: 12 + Math.random() * 3,
        tilt: 1.8 + Math.random() * 0.4,
        disp: dispVal,
        vibration: 0.5 + Math.random() * 0.2,
        velocity: vel,
        inv_velocity: 1 / vel,
        timestamp: t.toLocaleTimeString(),
        raw_disp: dispVal + (Math.random() * 1.2 - 0.6),
        filtered_disp: dispVal,
        isAlarm: false,
        alarmReasons: [],
      });
    }
    return list;
  });

  // SMS alert logs
  const [smsRecords, setSmsRecords] = useState<SmsAlertRecord[]>([
    {
      id: 'sms-1',
      recipient: 'Er. Rajesh Verma',
      role: 'Mine Safety Officer',
      phone: '+91-98765-43210',
      message: 'AUTOMATED SIH26025: Node 01 Status Normal. Daily Coal Seam 14 Subsidence Baseline OK.',
      sentAt: '06:00:00 AM',
      status: 'DELIVERED',
    },
  ]);

  // LoRa gateway telemetry statistics
  const [loraStats, setLoraStats] = useState({
    rssi: -68,
    snr: 9.4,
    frequency: '868.10 MHz',
    packetsReceived: 1420,
    packetLossPct: 0.04,
    gatewayId: 'GW-JHARIA-SEC4',
  });

  // Slider change handler
  const handleSliderChange = useCallback((key: string, value: number) => {
    setRawSliders((prev) => ({
      ...prev,
      [key]: value,
    }));
    // If moving displacement slider to emergency zone (>50), reset acknowledge so modal pops up!
    if (key === 'disp' && value > 50) {
      setHasUserAcknowledgedModal(false);
    }
  }, []);

  // Quick Preset handler
  const handleApplyPreset = useCallback((preset: 'normal' | 'creep' | 'critical' | 'gas' | 'vibration') => {
    setHasUserAcknowledgedModal(false);
    if (preset === 'normal') {
      setRawSliders({
        gas: 160,
        temp: 26.5,
        humid: 60,
        pressure: 1013,
        strain: 12,
        tilt: 1.5,
        disp: 8.5,
        vibration: 0.45,
      });
    } else if (preset === 'creep') {
      setRawSliders({
        gas: 380,
        temp: 29.8,
        humid: 68,
        pressure: 1008,
        strain: 48,
        tilt: 9.2,
        disp: 44.0,
        vibration: 2.3,
      });
    } else if (preset === 'critical') {
      // 82-84 mm critical displacement requested in prompt!
      setRawSliders({
        gas: 740,
        temp: 34.0,
        humid: 74,
        pressure: 994,
        strain: 82,
        tilt: 19.5,
        disp: 84.0,
        vibration: 7.2,
      });
    } else if (preset === 'gas') {
      setRawSliders({
        gas: 860,
        temp: 36.2,
        humid: 78,
        pressure: 1002,
        strain: 35,
        tilt: 4.8,
        disp: 28.0,
        vibration: 1.4,
      });
    } else if (preset === 'vibration') {
      setRawSliders({
        gas: 320,
        temp: 28.5,
        humid: 64,
        pressure: 1010,
        strain: 76,
        tilt: 12.0,
        disp: 38.0,
        vibration: 8.4,
      });
    }
  }, []);

  // Toggle Mute Audio
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      buzzerSound.setMuted(next);
      return next;
    });
  }, []);

  // ESP32 CORE LOGIC: Loop every 2 seconds (as requested)
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = 2.0; // 2 seconds time step
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      // Read all sensors from sliders with minor realistic sensor variance
      const rawDisp = rawSliders.disp + (Math.random() * 0.6 - 0.3);
      const rawGas = Math.max(0, rawSliders.gas + (Math.random() * 8 - 4));
      const rawTemp = rawSliders.temp + (Math.random() * 0.2 - 0.1);
      const rawHumid = Math.max(0, Math.min(100, rawSliders.humid + (Math.random() * 0.6 - 0.3)));
      const rawPressure = rawSliders.pressure + (Math.random() * 0.4 - 0.2);
      const rawStrain = Math.max(0, Math.min(100, rawSliders.strain + (Math.random() * 0.4 - 0.2)));
      const rawTilt = Math.max(0, rawSliders.tilt + (Math.random() * 0.2 - 0.1));
      const rawVibration = Math.max(0, rawSliders.vibration + (Math.random() * 0.1 - 0.05));

      // Filter with moving average of last 5 readings
      recentDispWindow.current.push(rawDisp);
      if (recentDispWindow.current.length > 5) {
        recentDispWindow.current.shift();
      }
      const filteredDisp =
        recentDispWindow.current.reduce((sum, val) => sum + val, 0) /
        recentDispWindow.current.length;

      // Displacement -> Velocity = (current_disp - previous_disp) / dt
      // To ensure positive velocity when moving or stable, use absolute delta with drift
      const deltaDisp = Math.abs(filteredDisp - prevDispRef.current);
      prevDispRef.current = filteredDisp;

      // If user sets a high displacement, velocity should reflect the rapid creep deformation rate
      let velocity = deltaDisp / dt;
      if (filteredDisp > 50) {
        // High displacement represents late-stage tertiary creep acceleration
        velocity = Math.max(velocity, 0.45 + (filteredDisp - 50) * 0.035);
      } else if (filteredDisp > 30) {
        velocity = Math.max(velocity, 0.12 + (filteredDisp - 30) * 0.015);
      } else {
        velocity = Math.max(0.005, velocity);
      }

      // Velocity -> Inverse Velocity = 1 / Velocity
      const invVelocity = velocity > 0 ? 1 / velocity : 999.0;

      // Local threshold check:
      // IF disp > 50 OR gas > 700 OR tilt > 15 OR vibration > 6 -> BUZZER = ON + LoRa Send RED ALERT
      // ELSE Send normal data
      const alarmReasons: string[] = [];
      if (filteredDisp > 50) alarmReasons.push(`Subsidence Displacement: ${filteredDisp.toFixed(1)}mm > 50mm`);
      if (rawGas > 700) alarmReasons.push(`Gas (CH4/CO): ${Math.round(rawGas)}ppm > 700ppm`);
      if (rawTilt > 15) alarmReasons.push(`Strata Tilt: ${rawTilt.toFixed(1)}° > 15°`);
      if (rawVibration > 6) alarmReasons.push(`Seismic Vibration: ${rawVibration.toFixed(2)}g > 6g`);

      const isAlarm = alarmReasons.length > 0;

      // Buzzer control
      if (isAlarm) {
        buzzerSound.startAlarmLoop();
      } else {
        buzzerSound.stopAlarm();
      }

      // Create JSON: {gas, temp, humid, pressure, strain, tilt, disp, vibration, velocity, inv_velocity, timestamp}
      const newReading: SensorReading = {
        gas: rawGas,
        temp: rawTemp,
        humid: rawHumid,
        pressure: rawPressure,
        strain: rawStrain,
        tilt: rawTilt,
        disp: filteredDisp,
        vibration: rawVibration,
        velocity: velocity,
        inv_velocity: invVelocity,
        timestamp: timeStr,
        raw_disp: rawDisp,
        filtered_disp: filteredDisp,
        isAlarm: isAlarm,
        alarmReasons: alarmReasons,
      };

      setCurrentReading(newReading);

      // Append to history table & chart
      setHistory((prev) => {
        const next = [...prev, newReading];
        if (next.length > 60) next.shift(); // retain last 60 for smooth graphs
        return next;
      });

      // Update telemetry transmission counter
      setTxPacketCount((c) => c + 1);

      // Gateway packet count
      setLoraStats((prev) => ({
        ...prev,
        packetsReceived: prev.packetsReceived + 1,
        rssi: -65 - Math.round(Math.random() * 6),
      }));

      // Auto-trigger SMS & Modal on new critical alarm if not already acknowledged
      if (isAlarm && !hasUserAcknowledgedModal) {
        setIsAlertModalOpen(true);

        // Add SMS log if not sent recently
        setSmsRecords((prevLogs) => {
          const lastMsg = prevLogs[prevLogs.length - 1];
          if (lastMsg && lastMsg.status === 'DELIVERED' && Date.now() - new Date().getTime() < 8000) {
            return prevLogs;
          }
          return [
            ...prevLogs,
            {
              id: `sms-${Date.now()}`,
              recipient: 'Er. Rajesh Verma',
              role: 'Mine Safety Officer',
              phone: '+91-98765-43210',
              message: `EMERGENCY ALERT: Coal Seam 14 Subsidence > 50mm (${filteredDisp.toFixed(1)}mm). Fukuzono 1/v = ${invVelocity.toFixed(2)}. Initiate Evacuation Protocol!`,
              sentAt: timeStr,
              status: 'DELIVERED' as const,
            },
            {
              id: `sms-${Date.now() + 1}`,
              recipient: 'DGMS Central Command',
              role: 'Govt Regulatory Inspector',
              phone: '+91-94311-20987',
              message: `SIH26025 TELEMETRY: Jharia Mine Section 4 Subsidence Alarm broadcasted via LoRa GW.`,
              sentAt: timeStr,
              status: 'DELIVERED' as const,
            },
          ].slice(-6);
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [rawSliders, hasUserAcknowledgedModal]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* 1. TOP HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black font-mono tracking-wider text-slate-100 uppercase">
                UNDERGROUND MINE SUBSIDENCE EARLY WARNING SYSTEM
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                SIH26025
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                MINISTRY OF COAL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                HARDWARE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              AI-enabled Low Cost Real Time Telemetry • Wokwi ESP32 • SX1278 LoRa • Fukuzono Inverse Velocity • GIS Rescue
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Hardware Buzzer Audio Toggle */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
              isMuted 
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200' 
                : 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-bounce" />}
            <span className="hidden sm:inline">{isMuted ? "Sound: Muted" : "Buzzer: Sound ON"}</span>
          </button>

          {/* Emergency Alert Direct Trigger */}
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border cursor-pointer ${
              currentReading.isAlarm
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_16px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{currentReading.isAlarm ? "🚨 ALARM MODAL" : "Alert Center"}</span>
          </button>
        </div>
      </header>

      {/* 2. TOP BREADCRUMB FLOW PIPELINE */}
      <BreadcrumbFlow 
        isAlarmActive={currentReading.isAlarm}
        onSelectStage={(stage) => {
          if (stage === 'sensors' || stage === 'esp32' || stage === 'buzzer_lora') {
            // Focus on hardware
          } else if (stage === 'dashboard_alert_rescue') {
            setIsAlertModalOpen(true);
          }
        }}
      />

      {/* 3. MAIN DUAL-PANEL LAYOUT (LEFT: WOKWI ESP32 HARDWARE, RIGHT: CLOUD/AI/GIS) */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden min-h-0">
        
        {/* LEFT PANEL - WOKWI ESP32 HARDWARE SIMULATION (5 cols on xl) */}
        <section className="xl:col-span-5 h-[calc(100vh-112px)] overflow-hidden">
          <WokwiHardwarePanel
            currentReading={currentReading}
            rawSliders={rawSliders}
            onSliderChange={handleSliderChange}
            isBuzzerActive={currentReading.isAlarm}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onApplyPreset={handleApplyPreset}
            txPacketCount={txPacketCount}
          />
        </section>

        {/* RIGHT PANEL - CLOUD / AI / GIS DASHBOARD (7 cols on xl) */}
        <section className="xl:col-span-7 h-[calc(100vh-112px)] overflow-hidden">
          <CloudAiGisDashboard
            history={history}
            currentReading={currentReading}
            nodes={INITIAL_NODES}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            isAlarmActive={currentReading.isAlarm}
            isRescueActive={isRescueActive}
            onTriggerRescue={() => setIsRescueActive(true)}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
            smsRecords={smsRecords}
            loraStats={loraStats}
          />
        </section>

      </main>

      {/* 4. MODAL: SUBSIDENCE ALERT & RESCUE DISPATCH */}
      <AlertRescueModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setHasUserAcknowledgedModal(true);
        }}
        reading={currentReading}
        isRescueActive={isRescueActive}
        onTriggerRescue={() => {
          setIsRescueActive(true);
          setIsAlertModalOpen(false);
        }}
        smsRecords={smsRecords}
      />
    </div>
  );
}
