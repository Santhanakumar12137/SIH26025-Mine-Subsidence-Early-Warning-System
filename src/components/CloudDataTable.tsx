import React, { useState } from 'react';
import { SensorReading } from '../types/mine';
import { 
  Server, 
  Download, 
  Radio, 
  Activity, 
  Clock, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  ArrowDownUp,
  FileSpreadsheet
} from 'lucide-react';
import { Line } from 'react-chartjs-2';

interface CloudDataTableProps {
  history: SensorReading[];
  currentReading: SensorReading;
  loraStats: {
    rssi: number;
    snr: number;
    frequency: string;
    packetsReceived: number;
    packetLossPct: number;
    gatewayId: string;
  };
}

export const CloudDataTable: React.FC<CloudDataTableProps> = ({
  history,
  currentReading,
  loraStats,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'timeseries'>('table');

  // Export CSV Handler
  const handleExportCsv = () => {
    if (history.length === 0) return;

    const headers = [
      'Timestamp',
      'Gas_CH4_PPM',
      'Temp_C',
      'Humid_Pct',
      'Pressure_hPa',
      'Strain_Pct',
      'Tilt_Deg',
      'Displacement_mm',
      'Vibration_g',
      'Velocity_mm_s',
      'Inverse_Velocity_s_mm',
      'Alarm_Status',
      'Alarm_Reasons'
    ];

    const rows = history.map((r) => [
      r.timestamp,
      r.gas.toFixed(1),
      r.temp.toFixed(1),
      r.humid.toFixed(1),
      r.pressure.toFixed(1),
      r.strain.toFixed(1),
      r.tilt.toFixed(1),
      r.disp.toFixed(2),
      r.vibration.toFixed(2),
      r.velocity.toFixed(3),
      r.inv_velocity.toFixed(3),
      r.isAlarm ? 'ALARM' : 'NORMAL',
      `"${r.alarmReasons.join('; ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mine_subsidence_telemetry_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Last 20 records (reversed for table so latest is on top)
  const last20 = [...history].slice(-20).reverse();

  // Multi-sensor Time Series Chart Data
  const last30History = history.slice(-25);
  const timeLabels = last30History.map((_, i) => `${(last30History.length - 1 - i) * 2}s ago`);

  const timeSeriesData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Displacement (mm)',
        data: last30History.map(h => h.disp),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        yAxisID: 'y',
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: 'Gas (ppm / 10)',
        data: last30History.map(h => h.gas / 10),
        borderColor: '#f59e0b',
        yAxisID: 'y',
        tension: 0.3,
        borderWidth: 1.5,
        borderDash: [2, 2],
      },
      {
        label: 'Vibration (g x 10)',
        data: last30History.map(h => h.vibration * 10),
        borderColor: '#ec4899',
        yAxisID: 'y',
        tension: 0.2,
        borderWidth: 1.5,
      },
      {
        label: 'Strain (%)',
        data: last30History.map(h => h.strain),
        borderColor: '#a855f7',
        yAxisID: 'y',
        tension: 0.3,
        borderWidth: 1.5,
      }
    ]
  };

  const timeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 10, family: 'monospace' },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
      },
    },
  };

  return (
    <div className="space-y-3">
      {/* 1. GATEWAY Status Header Card */}
      <div className="p-3 rounded-xl border border-cyan-800/70 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-cyan-900/60 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-slate-100 uppercase">
                  GATEWAY: {loraStats.gatewayId}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                LoRaWAN Concentrator SX1302 • Freq: {loraStats.frequency} • Bandwidth: 125 kHz
              </p>
            </div>
          </div>

          {/* LoRa Signal Strength & Packet Telemetry */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Signal (RSSI / SNR)</span>
              <span className="font-bold text-cyan-300">
                {loraStats.rssi} dBm <span className="text-slate-400">|</span> +{loraStats.snr} dB
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Packets In</span>
              <span className="font-bold text-emerald-400">{loraStats.packetsReceived}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Delivery Rate</span>
              <span className="font-bold text-emerald-300">
                {(100 - loraStats.packetLossPct).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CLOUD DATA STORAGE TABLE & TIME-SERIES */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              CLOUD SERVER TELEMETRY REPOSITORY
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-500/30">
              {history.length} RECORDS STORED
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  activeTab === 'table' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Data Table (Last 20)
              </button>
              <button
                onClick={() => setActiveTab('timeseries')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  activeTab === 'timeseries' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Time-Series Graph
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-md hover:shadow-emerald-500/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Table with last 20 readings */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto max-h-64 border border-slate-800 rounded-lg">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Disp (mm)</th>
                  <th className="p-2">Vel (mm/s)</th>
                  <th className="p-2">1/v (s/mm)</th>
                  <th className="p-2">Gas (ppm)</th>
                  <th className="p-2">Tilt (°)</th>
                  <th className="p-2">Vib (g)</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 bg-black/40">
                {last20.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-slate-900/50 transition ${row.isAlarm ? 'bg-red-950/30 font-semibold' : ''}`}
                  >
                    <td className="p-2 text-slate-400 whitespace-nowrap">{row.timestamp}</td>
                    <td className={`p-2 font-bold ${row.disp > 50 ? 'text-red-400' : 'text-cyan-300'}`}>
                      {row.disp.toFixed(1)}
                    </td>
                    <td className="p-2 text-purple-300">{row.velocity.toFixed(3)}</td>
                    <td className="p-2 text-amber-300">
                      {row.inv_velocity > 99 ? '∞' : row.inv_velocity.toFixed(2)}
                    </td>
                    <td className={`p-2 ${row.gas > 700 ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                      {Math.round(row.gas)}
                    </td>
                    <td className="p-2 text-slate-300">{row.tilt.toFixed(1)}</td>
                    <td className="p-2 text-slate-300">{row.vibration.toFixed(2)}</td>
                    <td className="p-2 whitespace-nowrap">
                      {row.isAlarm ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-500/40">
                          🚨 ALARM
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Time Series Chart */}
        {activeTab === 'timeseries' && (
          <div className="h-60 w-full pt-1">
            <Line data={timeSeriesData} options={timeSeriesOptions} />
          </div>
        )}
      </div>
    </div>
  );
};
