// frontend/components/RouletteWheel.tsx
import React from 'react';

interface Props {
  titles: string[];
  spinning: boolean;
  selected: string | null;
  loading: boolean;
  onSpin: () => void;
}

export default function RouletteWheel({ titles, spinning, selected, loading, onSpin }: Props) {
  const segmentCount = titles.length || 8;
  const angle = 360 / segmentCount;

  return (
    <div className="relative w-72 h-72 mb-6">
      <div
        className={`w-full h-full rounded-full border-4 border-indigo-600 relative transition-transform duration-3000 ease-out`}
        style={{
          transform: spinning
            ? `rotate(${360 * 5 + Math.floor(Math.random() * 360)}deg)`
            : `rotate(0deg)`
        }}
        onClick={() => !spinning && !loading && onSpin()}
      >
        {titles.map((title, i) => (
          <div
            key={title}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 origin-center"
            style={{
              transform: `rotate(${angle * i}deg) translate(110px) rotate(-${angle * i}deg)`,
              width: '120px',
              textAlign: 'center',
              color: '#eee',
              fontWeight: '600',
              fontSize: '0.8rem',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {title.length > 12 ? title.slice(0, 12) + '…' : title}
          </div>
        ))}
      </div>
      {!spinning && !loading && (
        <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-indigo-600 rounded-full -translate-x-1/2 -translate-y-full"></div>
      )}
      {(spinning || loading) && (
        <div className="absolute inset-0 flex items-center justify-center text-indigo-400 font-semibold">
          {loading ? 'Loading...' : 'Spinning...'}
        </div>
      )}
    </div>
  );
}
