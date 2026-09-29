import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MineNode } from '../types/mine';
import { MapPin, Navigation, ShieldAlert, Layers } from 'lucide-react';

interface GisMapProps {
  nodes: MineNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  isAlarmActive: boolean;
  displacement: number;
  isRescueActive: boolean;
}

// Evacuation Path coordinates in Jharia Mine area
const EVAC_ROUTE_COORDS: [number, number][] = [
  [23.7505, 86.4210], // Node 1: Underground Face Seam 14
  [23.7518, 86.4222], // Incline Haulage Junction
  [23.7535, 86.4230], // Main Adit Portal (Ground Level)
  [23.7552, 86.4245], // Mine Perimeter Road
  [23.7570, 86.4265], // Primary Safe Muster & Triage Station
];

export const GisMap: React.FC<GisMapProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  isAlarmActive,
  displacement,
  isRescueActive,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const alarmCircleRef = useRef<L.Circle | null>(null);
  const evacPolylineRef = useRef<L.Polyline | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map centered on Jharia Coal Mine (23.75°N, 86.42°E)
    const map = L.map(mapContainerRef.current, {
      center: [23.753, 86.423],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark styled basemap tiles for high-tech command center feel
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Hazard Risk Zones (Green, Yellow, Red concentric zones around the mine field)
    // 1. Safe Outer Perimeter (Green)
    L.circle([23.752, 86.422], {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.08,
      radius: 650,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    // 2. Creep Buffer Zone (Yellow)
    L.circle([23.751, 86.4215], {
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.12,
      radius: 380,
      weight: 2,
    }).addTo(map);

    // 3. High Hazard Seam Extraction Cavity (Red Zone)
    L.circle([23.7505, 86.4210], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.18,
      radius: 200,
      weight: 2,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update node markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    nodes.forEach((node) => {
      const isSelected = node.id === selectedNodeId;
      const isCritical = (isSelected && isAlarmActive) || node.status === 'critical';
      const isWarning = node.status === 'warning' || (isSelected && displacement > 30);

      const color = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
      const pulseClass = isCritical ? 'animate-ping' : '';

      const customIcon = L.divIcon({
        className: 'custom-mine-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            ${isCritical ? `<span style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: rgba(239,68,68,0.5);" class="${pulseClass}"></span>` : ''}
            <div style="
              width: 26px; 
              height: 26px; 
              border-radius: 9999px; 
              background-color: ${color}; 
              border: 2px solid white; 
              box-shadow: 0 0 10px ${color}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-size: 10px; 
              font-weight: 800; 
              font-family: monospace;
            ">
              ${node.code}
            </div>
            <div style="
              position: absolute; 
              bottom: -18px; 
              background: rgba(15, 23, 42, 0.9); 
              color: white; 
              padding: 1px 4px; 
              border-radius: 3px; 
              font-size: 8px; 
              white-space: nowrap; 
              border: 1px solid rgba(255,255,255,0.2);
              font-family: monospace;
            ">
              ${node.name}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      if (!markersRef.current[node.id]) {
        const marker = L.marker([node.lat, node.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => onSelectNode(node.id));
        markersRef.current[node.id] = marker;
      } else {
        markersRef.current[node.id].setIcon(customIcon);
        markersRef.current[node.id].setLatLng([node.lat, node.lng]);
      }
    });
  }, [nodes, selectedNodeId, isAlarmActive, displacement, onSelectNode]);

  // Pulsating red hazard subsidence circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isAlarmActive || displacement > 50) {
      if (!alarmCircleRef.current) {
        alarmCircleRef.current = L.circle([23.7505, 86.4210], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.35,
          radius: 120,
          weight: 3,
        }).addTo(map);
      } else {
        alarmCircleRef.current.setLatLng([23.7505, 86.4210]);
        alarmCircleRef.current.setRadius(120 + Math.min(displacement, 80));
      }
    } else {
      if (alarmCircleRef.current) {
        map.removeLayer(alarmCircleRef.current);
        alarmCircleRef.current = null;
      }
    }
  }, [isAlarmActive, displacement]);

  // Evacuation Route & Animated Moving Ambulance
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Draw Evacuation polyline
    if (!evacPolylineRef.current) {
      evacPolylineRef.current = L.polyline(EVAC_ROUTE_COORDS, {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // Ambulance icon
    const ambulanceIcon = L.divIcon({
      className: 'ambulance-icon',
      html: `
        <div style="
          width: 32px; 
          height: 32px; 
          background: #ef4444; 
          border: 2px solid white; 
          border-radius: 8px; 
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.9); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 16px;
        ">
          🚑
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (!ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current = L.marker(EVAC_ROUTE_COORDS[0], { icon: ambulanceIcon }).addTo(map);
    }

    let progress = 0;
    let direction = 1;

    const animateAmbulance = () => {
      if (!isRescueActive && !isAlarmActive) {
        if (ambulanceMarkerRef.current) {
          ambulanceMarkerRef.current.setLatLng(EVAC_ROUTE_COORDS[0]);
        }
        return;
      }

      progress += 0.003 * direction;
      if (progress >= 1) {
        progress = 1;
        direction = -1;
      } else if (progress <= 0) {
        progress = 0;
        direction = 1;
      }

      // Interpolate along waypoints
      const totalSegments = EVAC_ROUTE_COORDS.length - 1;
      const segmentIndex = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
      const segmentProgress = (progress * totalSegments) - segmentIndex;

      const p1 = EVAC_ROUTE_COORDS[segmentIndex];
      const p2 = EVAC_ROUTE_COORDS[segmentIndex + 1];

      const currentLat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
      const currentLng = p1[1] + (p2[1] - p1[1]) * segmentProgress;

      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.setLatLng([currentLat, currentLng]);
      }

      animFrameRef.current = requestAnimationFrame(animateAmbulance);
    };

    animFrameRef.current = requestAnimationFrame(animateAmbulance);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRescueActive, isAlarmActive]);

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-700 shadow-md">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Overlay Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="font-bold text-slate-100">GIS MINE SECTOR: JHARIA COALFIELD</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Lat: 23.7500°N • Lng: 86.4200°E • Dhanbad, Jharkhand
        </div>
      </div>

      {/* Legend & Evacuation route indicator */}
      <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/90 backdrop-blur p-2 rounded-lg border border-slate-700 text-[10px] font-mono shadow-lg space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>RISK STRATIFICATION</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Green: Safe &lt;30mm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">Yellow: Creep 30-50mm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-slate-300">Red: Subsidence &gt;50mm</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-cyan-300">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>Cyan Dash: Evacuation Path to Surface</span>
        </div>
      </div>

      {/* Active Alarm Banner */}
      {isAlarmActive && (
        <div className="absolute top-2.5 right-2.5 z-10 bg-red-600/90 backdrop-blur text-white px-3 py-1.5 rounded-lg border border-white/30 text-xs font-mono font-bold flex items-center gap-2 shadow-2xl animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          <span>SUBSIDENCE GROUND COLLAPSE DETECTED</span>
        </div>
      )}
    </div>
  );
};
