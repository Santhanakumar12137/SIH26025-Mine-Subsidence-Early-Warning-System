import React, { useState } from 'react';
import { SensorReading } from '../types/mine';
import { 
  Cpu, 
  Radio, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Flame, 
  Thermometer, 
  Gauge, 
  Layers, 
  Compass, 
  Activity, 
  Sparkles,
  Zap,
  Code2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface WokwiHardwarePanelProps {
  currentReading: SensorReading;
  rawSliders: {
    gas: number;
    temp: number;
    humid: number;
    pressure: number;
    strain: number;
    tilt: number;
    disp: number;
    vibration: number;
  };
  onSliderChange: (key: string, value: number) => void;
  isBuzzerActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onApplyPreset: (preset: 'normal' | 'creep' | 'critical' | 'gas' | 'vibration') => void;
  txPacketCount: number;
}

export const WokwiHardwarePanel: React.FC<WokwiHardwarePanelProps> = ({
  currentReading,
  rawSliders,
  onSliderChange,
  isBuzzerActive,
  isMuted,
  onToggleMute,
  onApplyPreset,
  txPacketCount,
}) => {
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'interactive' | 'breadboard'>('interactive');

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 overflow-y-auto">
      {/* Panel Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
                UNDERGROUND MINE - LIVE NODE
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                WOKWI V-SIM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ESP32 DevKit V1 • 6 Sensors • LoRa SX1278 SPI • Piezo Buzzer GPIO 25
            </p>
          </div>
        </div>

        {/* Audio Mute & Preset Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute Hardware Buzzer" : "Mute Hardware Buzzer"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all border ${
              isMuted 
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200' 
                : 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-bounce" />}
            <span>{isMuted ? "BUZZER MUTED" : "BUZZER AUDIO ON"}</span>
          </button>
        </div>
      </div>

      {/* Quick Scenario Injection Presets */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-3.5 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            JUDGES RAPID TEST SCENARIOS:
          </span>
          <span className="text-[10px] text-slate-300 font-mono">Click to test instant thresholds</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            onClick={() => onApplyPreset('normal')}
            className="px-2 py-1.5 text-[10px] font-mono font-medium rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 transition text-center"
          >
            Normal Mine
          </button>
          <button
            onClick={() => onApplyPreset('creep')}
            className="px-2 py-1.5 text-[10px] font-mono font-medium rounded bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 transition text-center"
          >
            Creep Phase
          </button>
          <button
            onClick={() => onApplyPreset('critical')}
            className="px-2 py-1.5 text-[10px] font-mono font-bold rounded bg-red-950/90 hover:bg-red-900/90 border border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition text-center"
          >
            🚨 CRITICAL (84mm)
          </button>
          <button
            onClick={() => onApplyPreset('gas')}
            className="px-2 py-1.5 text-[10px] font-mono font-medium rounded bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 transition text-center"
          >
            Methane Leak
          </button>
          <button
            onClick={() => onApplyPreset('vibration')}
            className="px-2 py-1.5 text-[10px] font-mono font-medium rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 transition text-center"
          >
            Seismic Tremor
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-4">
        {/* WOKWI VISUAL BREADBOARD & ESP32 SIMULATION */}
        <div className="relative rounded-xl border border-slate-700/80 bg-slate-950 p-4 shadow-xl overflow-hidden">
          {/* Background Breadboard Grid Dots Pattern */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          {/* Breadboard Header Rails */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> + 3.3V POWER RAIL
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> - GND GROUND RAIL
              </span>
            </div>
            <span className="text-slate-400">WOKWI VIRTUAL HARDWARE BUS</span>
          </div>

          {/* Hardware Layout: ESP32 in Center, Components on Left/Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            {/* LEFT SIDE: Buzzer + OLED Display */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {/* Buzzer Module on GPIO 25 */}
              <div className={`p-3 rounded-lg border transition-all duration-300 relative ${
                isBuzzerActive 
                  ? 'bg-red-950/80 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' 
                  : 'bg-slate-900/90 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      isBuzzerActive 
                        ? 'bg-red-600 text-white border-red-300 animate-spin' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200">ACTIVE BUZZER</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-300 border border-rose-500/30">
                    GPIO 25
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">State:</span>
                  <span className={`font-bold ${isBuzzerActive ? 'text-red-400 flex items-center gap-1' : 'text-emerald-400'}`}>
                    {isBuzzerActive ? '🚨 ALARM ON (HIGH)' : 'IDLE (LOW)'}
                  </span>
                </div>
                {isBuzzerActive && (
                  <div className="mt-1.5 text-[10px] text-red-300 font-mono bg-red-950/60 p-1 rounded border border-red-800">
                    Sounding 2.4kHz Warning Siren
                  </div>
                )}
              </div>

              {/* 0.96" SSD1306 OLED Display */}
              <div className="rounded-lg border border-slate-700 bg-black p-2.5 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 border-b border-cyan-950 pb-1 mb-1.5">
                  <span>SSD1306 OLED (128x64)</span>
                  <span className="text-emerald-400">I2C 0x3C</span>
                </div>
                {/* Screen pixel font emulation */}
                <div className="bg-slate-950 p-2 rounded border border-cyan-900/60 font-mono text-[10px] leading-relaxed text-cyan-300 shadow-inner h-24 overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between border-b border-cyan-900/40 pb-0.5 text-amber-300">
                    <span>* NODE-01 JHARIA *</span>
                    <span>TX #{txPacketCount}</span>
                  </div>
                  <div>
                    <div className="grid grid-cols-2 gap-x-1">
                      <span>CH4: {Math.round(currentReading.gas)}ppm</span>
                      <span>TMP: {currentReading.temp.toFixed(1)}°C</span>
                      <span>DISP: {currentReading.disp.toFixed(1)}mm</span>
                      <span>TILT: {currentReading.tilt.toFixed(1)}°</span>
                      <span>VIB: {currentReading.vibration.toFixed(2)}g</span>
                      <span>STR: {Math.round(currentReading.strain)}%</span>
                    </div>
                  </div>
                  <div className={`text-[9px] px-1 py-0.5 rounded text-center font-bold ${
                    currentReading.isAlarm ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {currentReading.isAlarm ? '! CRITICAL MINE ALERT !' : 'SYS HEALTH: OK [SAFE]'}
                  </div>
                </div>
              </div>

            </div>

            {/* CENTER: ESP32 DevKit V1 Realistic Microcontroller Rendering */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
              <div className="relative w-full max-w-[240px] bg-slate-900 border-2 border-slate-700 rounded-lg p-3 shadow-2xl shadow-cyan-950/40">
                {/* MicroUSB Port */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-3 bg-slate-600 rounded-t-sm border border-slate-500 flex items-center justify-center">
                  <div className="w-5 h-1 bg-slate-800 rounded-sm"></div>
                </div>

                {/* Left Pin Header Label Strip */}
                <div className="absolute left-1 top-6 bottom-6 flex flex-col justify-between text-[7px] font-mono text-slate-400">
                  <span>3V3</span>
                  <span className="text-emerald-400 font-bold">G4</span>
                  <span className="text-yellow-400 font-bold">G21</span>
                  <span className="text-yellow-400 font-bold">G22</span>
                  <span className="text-rose-400 font-bold">G25</span>
                  <span className="text-blue-400 font-bold">G32</span>
                  <span className="text-purple-400 font-bold">G34</span>
                  <span>GND</span>
                </div>

                {/* Right Pin Header Label Strip (LoRa SPI pins) */}
                <div className="absolute right-1 top-6 bottom-6 flex flex-col justify-between text-[7px] font-mono text-slate-400 text-right">
                  <span className="text-cyan-400 font-bold">G23</span>
                  <span className="text-cyan-400 font-bold">G19</span>
                  <span className="text-cyan-400 font-bold">G18</span>
                  <span className="text-cyan-400 font-bold">G5</span>
                  <span className="text-cyan-400 font-bold">G2</span>
                  <span>TX</span>
                  <span>RX</span>
                  <span>GND</span>
                </div>

                {/* ESP32 Metal RF Shield */}
                <div className="mx-auto w-32 h-28 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-400 rounded-md p-2 text-slate-900 shadow-md border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
                  {/* Espressif Emblem */}
                  <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase font-sans">
                    ESPRESSIF
                  </span>
                  <span className="text-xs font-black tracking-tight text-slate-950 font-mono">
                    ESP-WROOM-32
                  </span>
                  <span className="text-[7px] text-slate-700 font-mono mt-1">
                    FCC ID: 2AC7Z-ESPWROOM32
                  </span>
                  <div className="mt-2 w-16 h-4 bg-slate-800 rounded-sm flex items-center justify-center">
                    <span className="text-[7px] font-mono text-emerald-400 font-bold">Wi-Fi + BT + BLE</span>
                  </div>
                </div>

                {/* Status LEDs on board */}
                <div className="flex items-center justify-around mt-3 pt-2 border-t border-slate-800 text-[8px] font-mono">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)] animate-pulse"></div>
                    <span className="text-slate-400">PWR</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.9)] animate-ping"></div>
                    <span className="text-slate-400">TX</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></div>
                    <span className="text-slate-400">CORE</span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="text-center mt-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400">
                    ESP32 DEVKIT V1 (NODE 01)
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: LoRa SX1278 SPI Transceiver */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <div className="p-3 rounded-lg border border-cyan-800/60 bg-cyan-950/30 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-cyan-900/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                      <Radio className="w-4 h-4 animate-spin text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-200">LoRa SX1278 (Ra-02)</span>
                      <p className="text-[9px] text-cyan-400/70">868 MHz / 433 MHz SPI Transceiver</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    SPI BUS
                  </span>
                </div>

                {/* SPI Pins Mapping Badge */}
                <div className="grid grid-cols-5 gap-1 text-[8px] font-mono text-center mb-2">
                  <span className="bg-slate-900 p-1 rounded border border-slate-700 text-cyan-300">MOSI 23</span>
                  <span className="bg-slate-900 p-1 rounded border border-slate-700 text-cyan-300">MISO 19</span>
                  <span className="bg-slate-900 p-1 rounded border border-slate-700 text-cyan-300">SCK 18</span>
                  <span className="bg-slate-900 p-1 rounded border border-slate-700 text-cyan-300">CS 5</span>
                  <span className="bg-slate-900 p-1 rounded border border-slate-700 text-cyan-300">DIO0 2</span>
                </div>

                {/* LoRa Packet Sending Animation */}
                <div className="bg-slate-950 p-2 rounded border border-cyan-900/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 animate-pulse">
                      {currentReading.isAlarm ? "🚨 SENDING RED ALERT PACKET..." : "Sending Telemetry JSON..."}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    SF7 • BW 125kHz
                  </span>
                </div>
              </div>

              {/* Core Math Realtime Preview Box */}
              <div className="p-2.5 rounded-lg border border-purple-800/60 bg-purple-950/20 text-xs font-mono">
                <div className="flex items-center justify-between text-[10px] text-purple-300 border-b border-purple-900/50 pb-1 mb-1.5">
                  <span className="font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3 text-purple-400" />
                    ESP32 CORE MATH (dt = 2s)
                  </span>
                  <span>MOVING AVG (N=5)</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Velocity (v = ΔD/Δt):</span>
                    <span className="text-purple-300 font-bold">{currentReading.velocity.toFixed(3)} mm/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inverse Velocity (1/v):</span>
                    <span className={`font-bold ${currentReading.inv_velocity < 0.2 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                      {currentReading.inv_velocity > 99 ? '∞ (Stable)' : `${currentReading.inv_velocity.toFixed(3)} s/mm`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] pt-1 border-t border-purple-950">
                    <span className="text-slate-400">Rule Trigger:</span>
                    <span className={currentReading.isAlarm ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {currentReading.isAlarm ? `ALARM (${currentReading.alarmReasons[0] || 'CRITICAL'})` : 'ALL THRESHOLDS NOMINAL'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 6 CONNECTED HARDWARE SENSORS WITH INTERACTIVE LIVE SLIDERS */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              CONNECTED SENSORS & INPUT CONTROLS
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Adjust any slider to test real-time physics & ESP32 triggers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* 1. MQ-4 Gas Sensor (CH4, CO) on GPIO 34 */}
            <div className={`p-3 rounded-lg border transition-colors ${
              rawSliders.gas > 700 
                ? 'bg-red-950/40 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${rawSliders.gas > 700 ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">1. Gas (CH4, CO) MQ-4</span>
                    <span className="text-[9px] text-slate-400 block">Underground Methane/CO Detector</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                    GPIO 34 (ADC)
                  </span>
                  <div className={`text-xs font-mono font-bold mt-1 ${rawSliders.gas > 700 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Math.round(rawSliders.gas)} PPM
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="5"
                value={rawSliders.gas}
                onChange={(e) => onSliderChange('gas', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0 PPM (Safe)</span>
                <span className="text-amber-500">Warning: 500</span>
                <span className="text-red-400 font-bold">Alarm: &gt; 700 PPM</span>
              </div>
            </div>

            {/* 2. DHT11/DHT22 Temp & Humidity on GPIO 4 */}
            <div className="p-3 rounded-lg border bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">2. DHT11 / DHT22</span>
                    <span className="text-[9px] text-slate-400 block">Ambient Mine Ventilation Climate</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  GPIO 4 (1-Wire)
                </span>
              </div>
              
              <div className="space-y-2 mt-2">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                    <span>Temperature: <strong className="text-emerald-300">{rawSliders.temp.toFixed(1)}°C</strong></span>
                    <span>0 - 80°C</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="0.5"
                    value={rawSliders.temp}
                    onChange={(e) => onSliderChange('temp', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                    <span>Humidity: <strong className="text-sky-300">{Math.round(rawSliders.humid)}%</strong></span>
                    <span>0 - 100%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={rawSliders.humid}
                    onChange={(e) => onSliderChange('humid', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. BMP280 Barometric Pressure on I2C SDA 21 SCL 22 */}
            <div className="p-3 rounded-lg border bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">3. BMP280 Pressure</span>
                    <span className="text-[9px] text-slate-400 block">Mine Shaft Barometric Pressure</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-500/30">
                    I2C SDA:21 SCL:22
                  </span>
                  <div className="text-xs font-mono font-bold text-purple-300 mt-1">
                    {Math.round(rawSliders.pressure)} hPa
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="800"
                max="1100"
                step="1"
                value={rawSliders.pressure}
                onChange={(e) => onSliderChange('pressure', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>800 hPa (Depressurized)</span>
                <span>Standard: 1013</span>
                <span>1100 hPa (Deep Shaft)</span>
              </div>
            </div>

            {/* 4. Strain (MPU6050) on I2C 21, 22 */}
            <div className="p-3 rounded-lg border bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">4. Strain (MPU6050)</span>
                    <span className="text-[9px] text-slate-400 block">Strata Roof Stress Gauge</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-500/30">
                    I2C 21, 22
                  </span>
                  <div className="text-xs font-mono font-bold text-indigo-300 mt-1">
                    {Math.round(rawSliders.strain)} %
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={rawSliders.strain}
                onChange={(e) => onSliderChange('strain', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0% (Elastic)</span>
                <span>50% Yield</span>
                <span>100% (Fracture Plastic)</span>
              </div>
            </div>

            {/* 5. Tilt / Displacement (MPU6050) on same I2C */}
            <div className={`p-3 rounded-lg border transition-colors md:col-span-2 ${
              rawSliders.disp > 50 || rawSliders.tilt > 15 
                ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Compass className={`w-4 h-4 ${rawSliders.disp > 50 ? 'text-red-400 animate-spin' : 'text-cyan-400'}`} />
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      5. Tilt &amp; Subsidence Displacement (MPU6050)
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Primary Early Warning Indicator for Roof Delamination
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-500/30">
                  I2C 21, 22
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Displacement Slider */}
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-300 font-semibold">Displacement (mm):</span>
                    <span className={`font-bold text-sm ${rawSliders.disp > 50 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                      {rawSliders.disp.toFixed(1)} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={rawSliders.disp}
                    onChange={(e) => onSliderChange('disp', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                    <span>0 mm (Normal)</span>
                    <span className="text-amber-400">Creep: 30-50mm</span>
                    <span className="text-red-400 font-bold">ALARM: &gt; 50 mm</span>
                  </div>
                </div>

                {/* Tilt Slider */}
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-300 font-semibold">Tilt Angle (deg):</span>
                    <span className={`font-bold text-sm ${rawSliders.tilt > 15 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                      {rawSliders.tilt.toFixed(1)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.2"
                    value={rawSliders.tilt}
                    onChange={(e) => onSliderChange('tilt', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                    <span>0° Vertical</span>
                    <span className="text-amber-400">Warning: 10°</span>
                    <span className="text-red-400 font-bold">ALARM: &gt; 15°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Vibration (Accelerometer) on GPIO 32 */}
            <div className={`p-3 rounded-lg border transition-colors md:col-span-2 ${
              rawSliders.vibration > 6 
                ? 'bg-red-950/40 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${rawSliders.vibration > 6 ? 'text-red-400 animate-pulse' : 'text-pink-400'}`} />
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">6. Vibration (Accelerometer)</span>
                    <span className="text-[9px] text-slate-400 block">Dynamic Seismic &amp; Blasting Shock</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                    GPIO 32 (ADC)
                  </span>
                  <div className={`text-xs font-mono font-bold mt-1 ${rawSliders.vibration > 6 ? 'text-red-400' : 'text-pink-300'}`}>
                    {rawSliders.vibration.toFixed(2)} g
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={rawSliders.vibration}
                onChange={(e) => onSliderChange('vibration', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0.0 g (Quiescent)</span>
                <span className="text-amber-400">Moderate: 3.5 g</span>
                <span className="text-red-400 font-bold">ALARM: &gt; 6.0 g</span>
              </div>
            </div>

          </div>
        </div>

        {/* ESP32 GENERATED JSON PAYLOAD INSPECTOR */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowJsonInspector(!showJsonInspector)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-slate-100 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>LIVE ESP32 JSON PAYLOAD (TRANSMITTED TO LORA &amp; CLOUD)</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              FORMAT: VALID
            </span>
          </div>

          {showJsonInspector && (
            <pre className="p-2.5 rounded bg-black/90 border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    node_id: "ESP32_JHARIA_01",
    gas_ppm: Number(currentReading.gas.toFixed(1)),
    temp_c: Number(currentReading.temp.toFixed(1)),
    humid_pct: Number(currentReading.humid.toFixed(1)),
    pressure_hpa: Number(currentReading.pressure.toFixed(1)),
    strain_pct: Number(currentReading.strain.toFixed(1)),
    tilt_deg: Number(currentReading.tilt.toFixed(1)),
    disp_mm: Number(currentReading.disp.toFixed(2)),
    vibration_g: Number(currentReading.vibration.toFixed(2)),
    velocity_mms: Number(currentReading.velocity.toFixed(3)),
    inv_velocity_smm: Number(currentReading.inv_velocity.toFixed(3)),
    is_alarm: currentReading.isAlarm,
    alarm_reasons: currentReading.alarmReasons,
    timestamp: currentReading.timestamp
  },
  null,
  2
)}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
};
