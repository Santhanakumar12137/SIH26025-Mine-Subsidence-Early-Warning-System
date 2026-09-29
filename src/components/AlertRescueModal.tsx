import React, { useEffect } from 'react';
import { SensorReading, SmsAlertRecord } from '../types/mine';
import { 
  ShieldAlert, 
  Send, 
  PhoneCall, 
  CheckCircle, 
  Ambulance, 
  Volume2, 
  X,
  Radio,
  AlertTriangle,
  Users
} from 'lucide-react';

interface AlertRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: SensorReading;
  isRescueActive: boolean;
  onTriggerRescue: () => void;
  smsRecords: SmsAlertRecord[];
}

export const AlertRescueModal: React.FC<AlertRescueModalProps> = ({
  isOpen,
  onClose,
  reading,
  isRescueActive,
  onTriggerRescue,
  smsRecords,
}) => {
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300, 100, 500]);
      } catch {
        // Haptic feedback if supported on mobile/tablet
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.7)] overflow-hidden">
        
        {/* Animated Warning Stripe Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse"></div>

        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-b from-red-950/80 to-slate-950 border-b border-red-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-900 text-red-200 border border-red-500">
                  RED ALERT
                </span>
                <span className="text-[10px] font-mono text-slate-400">SIH26025 • MINISTRY OF COAL</span>
              </div>
              <h2 className="text-lg font-black font-mono tracking-tight text-red-400 uppercase">
                🚨 SUBSIDENCE ALERT!
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Threshold Violations Card */}
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-red-300 mb-2">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                TRIGGERED SENSOR SAFETY THRESHOLDS:
              </span>
              <span>NODE: ESP32-01</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-black/50 border border-red-900/60">
                <span className="text-slate-400 text-[10px] block">Subsidence Displacement:</span>
                <span className="text-sm font-black text-red-400">
                  {reading.disp.toFixed(1)} mm
                </span>
                <span className="text-[9px] text-slate-500 block">Threshold: &gt; 50 mm</span>
              </div>

              <div className="p-2 rounded bg-black/50 border border-red-900/60">
                <span className="text-slate-400 text-[10px] block">Inverse Velocity (1/v):</span>
                <span className="text-sm font-black text-amber-300">
                  {reading.inv_velocity < 0.2 ? '0.04 s/mm' : `${reading.inv_velocity.toFixed(2)} s/mm`}
                </span>
                <span className="text-[9px] text-slate-500 block">Fukuzono Failure Criterion</span>
              </div>

              <div className="p-2 rounded bg-black/50 border border-red-900/60">
                <span className="text-slate-400 text-[10px] block">Methane / CO Gas:</span>
                <span className={`text-sm font-black ${reading.gas > 700 ? 'text-red-400' : 'text-slate-300'}`}>
                  {Math.round(reading.gas)} PPM
                </span>
                <span className="text-[9px] text-slate-500 block">Limit: &gt; 700 PPM</span>
              </div>

              <div className="p-2 rounded bg-black/50 border border-red-900/60">
                <span className="text-slate-400 text-[10px] block">Roof Strata Tilt &amp; Vib:</span>
                <span className="text-sm font-black text-cyan-300">
                  {reading.tilt.toFixed(1)}° / {reading.vibration.toFixed(2)}g
                </span>
                <span className="text-[9px] text-slate-500 block">Limit: &gt; 15° / &gt; 6g</span>
              </div>
            </div>
          </div>

          {/* SMS Broadcast to Mine Safety Officer */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Send className="w-3.5 h-3.5" />
                AUTOMATIC SMS &amp; TELEMETRY DISPATCH LOG
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                SENT VIA GSM/LoRa
              </span>
            </div>

            <div className="space-y-2">
              {smsRecords.map((sms) => (
                <div key={sms.id} className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-cyan-400" />
                      {sms.recipient} ({sms.role})
                    </span>
                    <span className="text-slate-400 text-[10px]">{sms.phone}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-900">
                    &ldquo;{sms.message}&rdquo;
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                    <span>Delivered at {sms.sentAt}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" />
                      DELIVERED TO NETWORK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rescue Evacuation Status */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Ambulance className="w-4 h-4 text-cyan-400" />
                EVACUATION &amp; RESCUE CONVOY
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {isRescueActive ? 'CONVOY EN ROUTE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
              Safe Evacuation Route mapped from <strong className="text-white">Seam 14 Incline Adit</strong> along the
              sub-surface haulage ramp to the <strong className="text-white">Primary Surface Muster Station</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 cursor-pointer transition"
          >
            Acknowledge &amp; Silence
          </button>

          <button
            onClick={() => {
              onTriggerRescue();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-mono font-black shadow-lg shadow-red-600/40 cursor-pointer transition"
          >
            <Ambulance className="w-4 h-4 animate-bounce" />
            <span>DISPATCH RESCUE &amp; VIEW EVAC ROUTE</span>
          </button>
        </div>

      </div>
    </div>
  );
};
