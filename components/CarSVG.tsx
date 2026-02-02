'use client';

import { LightType } from '@/models/Report';

interface CarSVGProps {
  view: 'front' | 'rear';
  selectedLights: LightType[];
  onLightToggle: (light: LightType) => void;
}

export default function CarSVG({ view, selectedLights, onLightToggle }: CarSVGProps) {
  const isSelected = (light: LightType) => selectedLights.includes(light);

  const LightButton = ({ light, cx, cy, color, label }: { light: LightType; cx: number; cy: number; color: string; label: string }) => (
    <g onClick={() => onLightToggle(light)} className="cursor-pointer group">
      {/* Glow effect when selected */}
      <circle
        cx={cx}
        cy={cy}
        r="25"
        className={`transition-all duration-300 ${
          isSelected(light) ? 'opacity-50' : 'opacity-0 group-hover:opacity-20'
        }`}
        fill={color}
        filter="url(#glow)"
      />
      
      {/* Main light circle */}
      <circle
        cx={cx}
        cy={cy}
        r="12"
        className={`transition-all duration-300 stroke-2 ${
          isSelected(light) 
            ? 'stroke-white' 
            : 'stroke-muted-foreground/50 fill-transparent group-hover:stroke-foreground'
        }`}
        fill={isSelected(light) ? color : 'transparent'}
      />
      
      {/* Label */}
      <text
        x={cx}
        y={cy + 35}
        textAnchor="middle"
        className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isSelected(light) ? 'fill-foreground' : 'fill-muted-foreground group-hover:fill-foreground'
        }`}
      >
        {label}
      </text>
    </g>
  );

  if (view === 'front') {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-auto drop-shadow-2xl">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Car Body Outline - Abstract & Clean */}
        <path
          d="M100,220 L70,180 L80,140 L110,100 L290,100 L320,140 L330,180 L300,220 Z"
          className="fill-background stroke-foreground stroke-2"
        />
        <path
          d="M70,180 L330,180 M110,100 L110,220 M290,100 L290,220"
          className="stroke-border stroke-1 fill-none"
        />
        
        {/* Headlights */}
        <LightButton light="low_beam_left" cx={90} cy={160} color="#fbbf24" label="Low Beam" />
        <LightButton light="low_beam_right" cx={310} cy={160} color="#fbbf24" label="Low Beam" />
        
        <LightButton light="high_beam_left" cx={120} cy={160} color="#3b82f6" label="High Beam" />
        <LightButton light="high_beam_right" cx={280} cy={160} color="#3b82f6" label="High Beam" />
        
        {/* Fog Lights */}
        <LightButton light="fog_front_left" cx={100} cy={200} color="#ffffff" label="Fog" />
        <LightButton light="fog_front_right" cx={300} cy={200} color="#ffffff" label="Fog" />
        
        {/* Indicators */}
        <LightButton light="indicator_front_left" cx={60} cy={160} color="#f59e0b" label="Turn" />
        <LightButton light="indicator_front_right" cx={340} cy={160} color="#f59e0b" label="Turn" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto drop-shadow-2xl">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Car Body Outline */}
      <path
        d="M100,220 L70,180 L80,140 L110,100 L290,100 L320,140 L330,180 L300,220 Z"
        className="fill-background stroke-foreground stroke-2"
      />
      <path
        d="M70,180 L330,180 M110,100 L110,220 M290,100 L290,220"
        className="stroke-border stroke-1 fill-none"
      />

      {/* Brake Lights */}
      <LightButton light="brake_left" cx={90} cy={160} color="#ef4444" label="Brake" />
      <LightButton light="brake_right" cx={310} cy={160} color="#ef4444" label="Brake" />
      
      {/* Reverse Lights */}
      <LightButton light="reverse_left" cx={120} cy={160} color="#ffffff" label="Reverse" />
      <LightButton light="reverse_right" cx={280} cy={160} color="#ffffff" label="Reverse" />
      
      {/* Fog Rear */}
      <LightButton light="fog_rear" cx={100} cy={200} color="#ef4444" label="Fog" />
      <LightButton light="license_plate" cx={200} cy={190} color="#fbbf24" label="Plate" />
      
      {/* Indicators */}
      <LightButton light="indicator_rear_left" cx={60} cy={160} color="#f59e0b" label="Turn" />
      <LightButton light="indicator_rear_right" cx={340} cy={160} color="#f59e0b" label="Turn" />
      
      {/* Third Brake Light */}
      <LightButton light="brake_third" cx={200} cy={110} color="#ef4444" label="3rd Brake" />
    </svg>
  );
}
