import React, { useState, useEffect, useRef } from "react";

const LYRICS = [
  { time: 5, text: "Line one lyric goes here" },
  { time: 10, text: "This is the second lyric line" },
  { time: 15, text: "Another line appears here" },
  { time: 20, text: "Final lyric of this demo" },
];

export default function LyricDisplay({ audioRef }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const idx = LYRICS.reduce(
        (acc, lyric, i) => (currentTime >= lyric.time ? i : acc),
        0
      );
      setCurrentIndex(idx);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [audioRef]);

  const displayLines = [
    LYRICS[currentIndex - 1] || null,
    LYRICS[currentIndex],
    LYRICS[currentIndex + 1] || null,
  ];

  return (
    <div className="flex flex-col items-center justify-center h-36 w-full overflow-hidden">
      {displayLines.map((line, i) =>
        line ? (
          <div
            key={line.time}
            className={`my-1 text-center transform transition-[color,font-size,transform,opacity] duration-400 ease-out will-change-transform ${
              i === 1
                ? "text-[#db0000] text-4xl font-bold scale-110 opacity-100"
                : "text-white/60 text-2xl opacity-60"
            }`}
            style={{
              fontFamily: '"Anton", sans-serif',
              letterSpacing: i === 1 ? "1px" : "0.5px",
            }}
          >
            {line.text}
          </div>
        ) : (
          <div className="h-8" key={i} />
        )
      )}
    </div>
  );
}

