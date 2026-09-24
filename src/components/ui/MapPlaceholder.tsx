import { MapPin, Navigation } from 'lucide-react';

interface MapPlaceholderProps {
  latitude?: number;
  longitude?: number;
  markers?: {
    lat: number;
    lon: number;
    label: string;
    type: 'patient' | 'hospital' | 'ambulance';
  }[];
  height?: string;
  className?: string;
}

export function MapPlaceholder({
  latitude,
  longitude,
  markers = [],
  height = 'h-64',
  className = '',
}: MapPlaceholderProps) {
  return (
    <div className={`relative ${height} rounded-xl border border-navy-100 bg-navy-50/30 overflow-hidden ${className}`}>
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D5D9F4 1px, transparent 1px),
            linear-gradient(to bottom, #D5D9F4 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative roads */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <line x1="0%" y1="30%" x2="100%" y2="40%" stroke="#ABB2E9" strokeWidth="2" opacity="0.4" />
        <line x1="20%" y1="0%" x2="40%" y2="100%" stroke="#ABB2E9" strokeWidth="2" opacity="0.4" />
        <line x1="0%" y1="70%" x2="100%" y2="60%" stroke="#ABB2E9" strokeWidth="2" opacity="0.3" />
        <line x1="60%" y1="0%" x2="80%" y2="100%" stroke="#ABB2E9" strokeWidth="2" opacity="0.3" />
      </svg>

      {/* Mock label */}
      <div className="absolute top-3 left-3 z-10">
        <div className="badge bg-white/90 text-navy-500 shadow-sm">
          <Navigation size={12} />
          Mock Map Preview
        </div>
      </div>

      {/* Markers */}
      {markers.map((m, i) => {
        const x = ((m.lon + 180) % 360) / 360 * 100;
        const y = ((90 - m.lat) % 180) / 180 * 100;
        const colors = {
          patient: 'bg-triage-red border-red-600',
          hospital: 'bg-navy-500 border-navy-700',
          ambulance: 'bg-accent border-accent',
        };
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full border-2 ${colors[m.type]} flex items-center justify-center shadow-md`}>
                <MapPin size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-medium text-navy-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                {m.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* Center coordinate display */}
      {latitude && longitude && (
        <div className="absolute bottom-3 left-3 z-10">
          <div className="bg-white/90 rounded-lg px-3 py-1.5 shadow-sm">
            <p className="text-xs font-mono text-navy-600">
              {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
