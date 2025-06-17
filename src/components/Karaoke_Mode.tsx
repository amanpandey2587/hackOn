import React, { useState, useEffect, useRef } from "react";
import LyricDisplay from "./LyricDisplay";

const NBR_OF_BARS = 50;

export default function Karaoke_Mode() {
  const barsRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const ctx = new AudioContext();
    const audio = audioRef.current;

    const handleFirstInteraction = () => {
      audio.play();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    const startAudio = () => {
      ctx.resume();
      const audioSource = ctx.createMediaElementSource(audio);
      const analyzer = ctx.createAnalyser();
      audioSource.connect(analyzer);
      audioSource.connect(ctx.destination);

      const frequencyData = new Uint8Array(analyzer.frequencyBinCount);

      function renderFrame() {
        analyzer.getByteFrequencyData(frequencyData);
        for (let i = 0; i < NBR_OF_BARS; i++) {
          const index = (i + 10) * 2;
          const fd = frequencyData[index];
          const barHeight = Math.max(4, fd || 0);
          if (barsRef.current[i]) {
            barsRef.current[i].style.height = `${barHeight}px`;
          }
        }
        window.requestAnimationFrame(renderFrame);
      }

      renderFrame();
      audio.volume = 0.1;
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    audio.addEventListener("play", startAudio, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      audio.removeEventListener("play", startAudio);
      ctx.close();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      {/* Blurred Netflix-style background */}
      <div
        className="absolute inset-0 bg-center bg-cover blur-[20px] brightness-[0.5] z-0"
        style={{
          backgroundImage: `url("https://i2-prod.manchestereveningnews.co.uk/article31842452.ece/ALTERNATES/s1200/0_Netflix-UI-1.jpg")`,
        }}
      />

      {/* Audio controls */}
      <audio
        src="/track.mp3"
        controls
        ref={audioRef}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-10 
          w-[320px] h-[42px] text-white
          bg-[#141414] border border-[#564d4d] shadow-lg
          rounded-md px-2 py-1 backdrop-blur-md
          accent-[#db0000]"
      />

      {/* Visualizer + Lyrics */}
      <div className="absolute bottom-[160px] left-0 right-0 flex flex-col items-center z-10 space-y-4">
        <div className="flex justify-between items-end h-[140px]">
          {Array(NBR_OF_BARS)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                ref={(el) => (barsRef.current[i] = el)}
                className="mx-[1px] w-[18px] rounded-md transition-[height] duration-75"
                style={{
                  height: 4,
                  background: "linear-gradient(to top, #db0000, #831010)",
                }}
              />
            ))}
        </div>
        <LyricDisplay audioRef={audioRef} />
      </div>
    </div>
  );
}