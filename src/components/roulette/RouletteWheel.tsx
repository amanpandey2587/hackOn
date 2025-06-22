// frontend/components/RouletteWheel.tsx
import React, { useEffect, useState } from 'react';

interface Props {
  titles: string[];
  spinning: boolean;
  selected: string | null;
  loading: boolean;
  onSpin: () => void;
}

export default function RouletteWheel({ titles, spinning, selected, loading, onSpin }: Props) {
  const [rotation, setRotation] = useState(0);
  const segmentCount = 8; // Always 8 segments
  const anglePerSegment = 360 / segmentCount;

  // Colors for the wheel segments
  const segmentColors = [
    '#4F46E5', '#7C3AED', '#EC4899', '#EF4444',
    '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'
  ];

  useEffect(() => {
    if (spinning && selected && titles.length) {
      const selectedIndex = titles.findIndex((t) => t === selected);
      if (selectedIndex !== -1) {
        // Calculate target angle to land on selected segment
        // We want the pointer (at top, 12 o'clock) to point to the selected segment
        const baseRotation = 1800 + Math.random() * 360; // 5+ full rotations + random
        
        // Calculate the angle where the segment center should be when stopped
        // Since pointer is at top (0 degrees), we want the selected segment center at 0 degrees
        const segmentCenterAngle = anglePerSegment * selectedIndex + anglePerSegment / 2;
        
        // The wheel needs to rotate so that the selected segment center ends up at the top
        // We subtract the segment center angle from our base rotation
        const finalAngle = baseRotation - segmentCenterAngle;
        
        setRotation(finalAngle);
      }
    }
  }, [spinning, selected, titles, anglePerSegment]);

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-72 h-72 rounded-full border-4 border-indigo-600 flex items-center justify-center bg-gray-800">
          <div className="text-indigo-400 font-semibold animate-pulse">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  if (titles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-72 h-72">
        {/* Wheel */}
        <div
          className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-4 border-white/20"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
          }}
        >
          {/* Wheel segments */}
          {Array.from({ length: segmentCount }).map((_, i) => {
            const startAngle = (anglePerSegment * i); // Start from 0 degrees (top)
            const endAngle = startAngle + anglePerSegment;
            
            // Calculate path for SVG segment
            const startRadians = (startAngle * Math.PI) / 180;
            const endRadians = (endAngle * Math.PI) / 180;
            
            const x1 = 144 + 130 * Math.cos(startRadians);
            const y1 = 144 + 130 * Math.sin(startRadians);
            const x2 = 144 + 130 * Math.cos(endRadians);
            const y2 = 144 + 130 * Math.sin(endRadians);
            
            const largeArcFlag = anglePerSegment > 180 ? 1 : 0;
            const pathData = [
              `M 144 144`,
              `L ${x1} ${y1}`,
              `A 130 130 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            return (
              <svg
                key={i}
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 288 288"
              >
                <path
                  d={pathData}
                  fill={segmentColors[i]}
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            );
          })}

          {/* Text labels */}
          {titles.slice(0, segmentCount).map((title, i) => {
            const angle = anglePerSegment * i; // Start from 0 degrees (top)
            const textAngle = angle + anglePerSegment / 2; // Center of segment
            const radius = 85; // Distance from center
            const radians = (textAngle * Math.PI) / 180;
            const x = Math.cos(radians) * radius;
            const y = Math.sin(radians) * radius;

            return (
              <div
                key={`text-${i}`}
                className="absolute text-white text-xs font-bold text-center pointer-events-none select-none"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${textAngle}deg)`,
                  width: '80px',
                  fontSize: '0.7rem',
                  lineHeight: '1.1',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                  fontWeight: '800',
                }}
              >
                {title.length > 15 ? title.slice(0, 15) + '…' : title}
              </div>
            );
          })}
        </div>

        {/* Pointer - positioned at the top */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10"
          style={{ marginTop: '-12px' }}
        >
          <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-xl"></div>
        </div>

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg z-10 flex items-center justify-center">
          <div className="w-6 h-6 bg-indigo-600 rounded-full shadow-inner"></div>
        </div>

        {/* Spinning overlay */}
        {spinning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full z-20">
            <div className="text-white font-bold text-lg animate-pulse drop-shadow-lg">
              🎰 Spinning...
            </div>
          </div>
        )}
      </div>

      {/* Spin Button */}
      {!spinning && (
        <button
          onClick={onSpin}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={titles.length === 0}
        >
          🎯 SPIN THE WHEEL
        </button>
      )}

      {/* Debug info - remove in production */}
      {selected && !spinning && (
        <div className="text-xs text-gray-400 text-center">
          Selected: {selected} (Index: {titles.findIndex(t => t === selected)})
        </div>
      )}
    </div>
  );
}