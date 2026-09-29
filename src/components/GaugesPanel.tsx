import React from 'react';
import { SensorReading } from '../types/mine';
import { Flame, Thermometer, Droplets, Gauge, Layers, Compass, Activity } from 'lucide-react';

interface GaugesPanelProps {
  reading: SensorReading;
}

interface GaugeCardProps {
  title: string;
  subtitle: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  icon: React.ReactNode;
  warningThreshold?: number;
  alarmThreshold?: number;
  color: string;
}

const ArcGauge: React.FC<GaugeCardProps> = ({
  title,
  subtitle,
  value,
  min,
  max,
  unit,
  icon,
  warningThreshold,
  alarmThreshold,
  color,
}) => {
  const clamped = Math.min(max, Math.max(min, value));
  const percent = (clamped - min) / (max - min);

  // SVG arc calculation (from 135deg to 405deg, total 270deg sweep)
  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (270 / 360);
  const strokeDashoffset = arcLength - arcLength * percent;

  const isAlarm = alarmThreshold !== undefined && value >= alarmThreshold;
  const isWarning = !isAlarm && warningThreshold !== undefined && value >= warningThreshold;

  const statusColor = isAlarm ? '#ef4444' : isWarning ? '#f59e0b' : color;

  return (
    <div className={`p-3 rounded-xl border flex flex-col items-center justify-between transition-all ${
      isAlarm 
        ? 'bg-red-950/40 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse' 
        : 'bg-slate-900/90 border-slate-800 shadow'
    }`}>
      {/* Gauge Title Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-slate-800 border border-slate-700">{icon}</span>
          <span className="font-bold tracking-tight">{title}</span>
        </div>
        <span className="text-[9px] text-slate-400 font-sans">{subtitle}</span>
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative w-28 h-28 flex items-center justify-center my-1">
        <svg className="w-full h-full transform -rotate-225" viewBox="0 0 100 100">
          {/* Background Arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={statusColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
              filter: isAlarm ? 'drop-shadow(0 0 6px rgba(239,68,68,0.8))' : 'none'
            }}
          />
        </svg>

        {/* Center Value Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
          <span className="text-base font-black font-mono tracking-tight text-slate-100">
            {typeof value === 'number' ? (max <= 10 ? value.toFixed(2) : value.toFixed(1)) : value}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400 -mt-0.5">
            {unit}
          </span>
        </div>
      </div>

      {/* Range Min / Max Markers & Status */}
      <div className="w-full flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
        <span>{min}</span>
        <span className={`font-bold ${isAlarm ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
          {isAlarm ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL'}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export const GaugesPanel: React.FC<GaugesPanelProps> = ({ reading }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-cyan-400" />
          LIVE 7-SENSOR RADIAL GAUGES
        </h3>
        <span className="text-[10px] font-mono text-slate-400">
          Refreshed via ESP32 LoRa Gateway
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
        {/* 1. Gas MQ-4 */}
        <ArcGauge
          title="GAS (CH4/CO)"
          subtitle="MQ-4"
          value={reading.gas}
          min={0}
          max={1000}
          unit="PPM"
          warningThreshold={500}
          alarmThreshold={700}
          color="#f59e0b"
          icon={<Flame className="w-3.5 h-3.5 text-amber-400" />}
        />

        {/* 2. Temperature */}
        <ArcGauge
          title="TEMPERATURE"
          subtitle="DHT22"
          value={reading.temp}
          min={0}
          max={80}
          unit="°C"
          warningThreshold={45}
          alarmThreshold={60}
          color="#10b981"
          icon={<Thermometer className="w-3.5 h-3.5 text-emerald-400" />}
        />

        {/* 3. Humidity */}
        <ArcGauge
          title="HUMIDITY"
          subtitle="DHT22"
          value={reading.humid}
          min={0}
          max={100}
          unit="%"
          warningThreshold={80}
          alarmThreshold={95}
          color="#06b6d4"
          icon={<Droplets className="w-3.5 h-3.5 text-sky-400" />}
        />

        {/* 4. Pressure */}
        <ArcGauge
          title="PRESSURE"
          subtitle="BMP280"
          value={reading.pressure}
          min={800}
          max={1100}
          unit="hPa"
          warningThreshold={1050}
          alarmThreshold={1080}
          color="#8b5cf6"
          icon={<Gauge className="w-3.5 h-3.5 text-purple-400" />}
        />

        {/* 5. Strain */}
        <ArcGauge
          title="STRATA STRAIN"
          subtitle="MPU6050"
          value={reading.strain}
          min={0}
          max={100}
          unit="%"
          warningThreshold={60}
          alarmThreshold={80}
          color="#6366f1"
          icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
        />

        {/* 6. Displacement */}
        <ArcGauge
          title="DISPLACEMENT"
          subtitle="Subsidence"
          value={reading.disp}
          min={0}
          max={100}
          unit="mm"
          warningThreshold={30}
          alarmThreshold={50}
          color="#ec4899"
          icon={<Compass className="w-3.5 h-3.5 text-pink-400" />}
        />

        {/* 7. Vibration */}
        <ArcGauge
          title="VIBRATION"
          subtitle="Accel"
          value={reading.vibration}
          min={0}
          max={10}
          unit="g"
          warningThreshold={4.0}
          alarmThreshold={6.0}
          color="#f43f5e"
          icon={<Activity className="w-3.5 h-3.5 text-rose-400" />}
        />
      </div>
    </div>
  );
};
