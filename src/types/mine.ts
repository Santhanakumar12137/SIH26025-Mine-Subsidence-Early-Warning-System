export interface SensorReading {
  gas: number; // MQ-4 (CH4, CO) in ppm (0-1000)
  temp: number; // DHT11/22 in °C (0-80)
  humid: number; // DHT11/22 in % (0-100)
  pressure: number; // BMP280 in hPa (800-1100)
  strain: number; // MPU6050 in % (0-100)
  tilt: number; // MPU6050 in degrees (0-30)
  disp: number; // Displacement in mm (0-100)
  vibration: number; // Accelerometer in g (0-10)
  velocity: number; // mm/s
  inv_velocity: number; // s/mm (1 / velocity)
  timestamp: string; // ISO or formatted
  raw_disp?: number; // un-filtered displacement
  filtered_disp?: number; // 5-point moving average
  isAlarm: boolean;
  alarmReasons: string[];
}

export interface MineNode {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  depthMeters: number;
  status: 'safe' | 'warning' | 'critical';
  battery: number;
  signalRssi: number;
  lastSeen: string;
}

export interface AnomalyReport {
  isAnomaly: boolean;
  score: number; // 0 - 100
  type: string;
  confidence: number; // 0 - 100
  detectedAt?: string;
}

export interface EvacuationStep {
  id: number;
  title: string;
  sector: string;
  status: 'pending' | 'in-progress' | 'completed';
  time: string;
}

export interface SmsAlertRecord {
  id: string;
  recipient: string;
  role: string;
  phone: string;
  message: string;
  sentAt: string;
  status: 'DELIVERED' | 'DISPATCHING';
}
