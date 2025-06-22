import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music,
  List,
} from "lucide-react";

const LYRICS_DATA = {
  track1: [
    { time: 5, text: "Hum tere bin ab reh nahi sakte" },
    { time: 12, text: "Tere bina kya wajood mera" },
    { time: 19, text: "Tujhse juda gar ho jaayenge" },
    { time: 26, text: "Toh khud se hi ho jaayenge judaa" },
    { time: 33, text: "Kyunki tum hi ho" },
    { time: 40, text: "Ab tum hi ho" },
    { time: 47, text: "Zindagi ab tum hi ho" },
    { time: 54, text: "Chain bhi, mera dard bhi" },
    { time: 61, text: "Meri aashiqui ab tum hi ho" },
    { time: 68, text: "Tera mera rishta hai kaisa" },
    { time: 75, text: "Ik pal door gawara nahi" },
    { time: 82, text: "Tere liye har roz hai jeete" },
    { time: 89, text: "Tujh ko diya mera waqt sabhi" },
    { time: 96, text: "Koi lamha mera na ho tere bina" },
    { time: 103, text: "Har saans pe naam tera" },
    { time: 110, text: "Kyunki tum hi ho" },
    { time: 117, text: "Ab tum hi ho" },
    { time: 124, text: "Zindagi ab tum hi ho" },
    { time: 131, text: "Chain bhi, mera dard bhi" },
    { time: 138, text: "Meri aashiqui ab tum hi ho" },
  ],
  track2: [
    { time: 14, text: "Shayad kabhi na keh sakun main tumko" },
    { time: 21, text: "Kahe bina samajh lo tum shayad" },
    { time: 28, text: "Shayad mere khayal mein tum ik din" },
    { time: 35, text: "Milo mujhe kahin pe gum shayad" },
    { time: 42, text: "Jo tum na ho, rahenge hum nahi" },
    { time: 49, text: "Na chahiye kuch tumse zyada, tumse kam nahi" },
    { time: 56, text: "Jo tum na ho, toh hum bhi hum nahi" },
    { time: 63, text: "Na chahiye kuch tumse zyada, tumse kam nahi" },
    { time: 70, text: "Aankhon ko khwaab dena, khud hi sawaal karke" },
    { time: 77, text: "Khud hi jawaab dena teri taraf se" },
    { time: 84, text: "Bin kaam kaam karna, jaana kahin ho chahe" },
    { time: 91, text: "Har baar hi guzarna teri taraf se" },
    { time: 98, text: "Yeh koshishein toh hongi kam nahi" },
    { time: 105, text: "Na chahiye kuch tumse zyada, tumse kam nahi" },
    { time: 112, text: "Jo tum na ho... rahenge hum nahi" },
    { time: 119, text: "Jo tum na ho... toh hum bhi hum nahi" },
    { time: 126, text: "Na chahiye kuch tumse zyada, tumse kam nahi" },
  ],
  track3: [
    { time: 15, text: "Pehli nazar mein kaise jaadu kar diya" },
    { time: 22, text: "Tera ban baita hai mera jiya" },
    { time: 29, text: "Jaane kya hoga, kya pata" },
    { time: 36, text: "Is pal ko milke aa jee le zara" },
    { time: 43, text: "Main hoon yahan, tu hai yahan" },
    { time: 50, text: "Meri baahon mein aa, aa bhi ja" },
    { time: 57, text: "O jaan‑e‑jaan, dono jahan" },
    { time: 64, text: "Meri baahon mein aa, bhool ja aa" },
    { time: 71, text: "Baby I love you, baby I love you so" },
    { time: 78, text: "Oh I love you, I love you so" },
    { time: 85, text: "Har dua mein shamil tera pyaar hai" },
    { time: 92, text: "Bin tere lamha bhi dushwaar hai" },
    { time: 99, text: "Dhadkanon ko tujhe se hi darkaar hai" },
    { time: 106, text: "Tujhse hai rahatein, tujhse hai chahatein" },
    { time: 113, text: "Tu jo mili ek din mujhe, main ho gaya lapata" },
    { time: 120, text: "Kar diya deewana dard‑e‑khaas ne" },
    { time: 127, text: "Chain cheena ishq ke ehsaas ne" },
    { time: 134, text: "Bekhayali di hai teri pyaas ne" },
    { time: 141, text: "Chaya suroor hai, kuch toh zaroor hai" },
    { time: 148, text: "Yeh dooriyan jeene na de, haal mera tujhe na pata" },
    { time: 155, text: "O jaan‑e‑jaan, dono jahan" },
    { time: 162, text: "Meri baahon mein aa, bhool ja aa" },
    { time: 169, text: "Baby I love you, baby I love you so" },
  ],
  track4: [
    { time: 15, text: "Tu hi toh jannat meri, tu hi mera junoon" },
    { time: 22, text: "Tu hi toh mannat meri, tu hi rooh ka sukoon" },
    { time: 29, text: "Tu hi ankhiyon ki thandak, tu hi dil ki hai dastak" },
    { time: 36, text: "Aur kuch na jaanu main, bas itna hi jaanu" },
    { time: 43, text: "Tujh mein rab dikhta hai, yaara main kya karun" },
    { time: 50, text: "Tujh mein rab dikhta hai, yaara main kya karun" },
    { time: 57, text: "Sajde sar jhukta hai, yaara main kya karun" },
    { time: 64, text: "Tujh mein rab dikhta hai, yaara main kya karun" },

    { time: 71, text: "Kaisi hai ye doori, kaisi majboori" },
    { time: 78, text: "Maine nazaron se tujhe chhu liya" },
    { time: 85, text: "Kabhi teri khushboo, kabhi teri baatein" },
    { time: 92, text: "Bin maange ye jahaan paa liya" },
    { time: 99, text: "Tu hi dil ki raunak, tu hi janmon ki daulat" },
    { time: 106, text: "Aur kuch na jaanu, bas itna hi jaanu" },
    { time: 113, text: "Tujh mein rab dikhta hai, yaara main kya karun" },
    { time: 120, text: "Sajde sar jhukta hai, yaara main kya karun" },

    { time: 127, text: "Vaasdi vaasdi vaasdi, dil di dil vich vaasdi" },
    { time: 134, text: "Naasdi naasdi naasdi, dil ro ve te naasdi" },
    { time: 141, text: "Rab ne bana di jodi" },

    { time: 148, text: "Cham cham aaye, mujhe tarsaye" },
    { time: 155, text: "Tera saaya chhed ke chhoomta" },
    { time: 162, text: "Tu jo muskaaye, tu jo sharmaye" },
    { time: 169, text: "Jaise mera hai khuda jhoomta" },
    { time: 176, text: "Tu hi meri barkat, tu hi meri ibaadat" },
    { time: 183, text: "Aur kuch na jaanu, bas itna hi jaanu" },
    { time: 190, text: "Tujh mein rab dikhta hai, yaara main kya karun" },
    { time: 197, text: "Sajde sar jhukta hai, yaara main kya karun" },
  ],
  track5: [
    { time: 0, text: "Tujhe dekha toh yeh jaana sanam" },
    { time: 7, text: "Pyaar hota hai deewana sanam" },
    { time: 14, text: "Ab yahan se kahan jaayein hum" },
    { time: 21, text: "Teri baahon mein mar jaayein hum" },

    { time: 28, text: "Tujhe dekha toh yeh jaana sanam" },
    { time: 35, text: "Pyaar hota hai deewana sanam" },

    { time: 42, text: "Pal pal dil ke paas" },
    { time: 48, text: "Tum rehti ho" },
    { time: 52, text: "Jeevan meethi pyaas" },
    { time: 56, text: "Yeh kehti ho" },
    { time: 60, text: "Pal pal dil ke paas" },
    { time: 65, text: "Tum rehti ho" },

    { time: 70, text: "Har shaam aankhon par" },
    { time: 75, text: "Tera aanchal lehraye" },
    { time: 80, text: "Har raat yaadon ki" },
    { time: 85, text: "Baarat le aaye" },

    { time: 90, text: "Main saans leta hoon" },
    { time: 95, text: "Teri khushboo aati hai" },
    { time: 100, text: "Ek mehka mehka sa" },
    { time: 105, text: "Paighaam laati hai" },

    { time: 110, text: "Meri tanhaiyon ko" },
    { time: 115, text: "Tera ehsaas hai" },
    { time: 120, text: "Main jo bhi hoon" },
    { time: 124, text: "Bas tera pyaar hai" },

    { time: 130, text: "Tujhe dekha toh yeh jaana sanam" },
    { time: 137, text: "Pyaar hota hai deewana sanam" },
    { time: 144, text: "Ab yahan se kahan jaayein hum" },
    { time: 151, text: "Teri baahon mein mar jaayein hum" },
  ],
};

const SONG_INFO = [
  {
    id: "track1",
    title: "Tum Hi Ho",
    artist: "Aashiqui 2",
    color: "#00D4FF",
    format: "wav",
  },
  {
    id: "track2",
    title: "Shayad",
    artist: "Love Aaj Kal 2",
    color: "#1A73E8",
    format: "mp4",
  },
  {
    id: "track3",
    title: "Pehli Nazar Mein",
    artist: "Race",
    color: "#4285F4",
    format: "mp3",
  },
  {
    id: "track4",
    title: "Tujh Mein Rab Dikhta Hai",
    artist: "Rab Ne Bana Di Jodi",
    color: "#0F9D58",
    format: "mp3",
  },
  {
    id: "track5",
    title: "Tujhe Dekha To",
    artist: "DDLJ",
    color: "#FF6D01",
    format: "mp3",
  },
];

const NBR_OF_BARS = 50;

function LyricDisplay({ audioRef, currentTrack }) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const progressRef = useRef(null);
  const lyrics = LYRICS_DATA[currentTrack] || [];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setProgress(currentTime);

      // Find the correct index for the current time
      let idx = -1;
      for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].time) {
          idx = i;
        } else {
          break;
        }
      }

      setCurrentIndex(idx);
    };

    const handleLoadedMetadata = () => {
      setCurrentIndex(-1);
      setDuration(audio.duration);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [audioRef, lyrics]);

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
  };

  const handleProgressHover = (e) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(percentage * duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const displayLines = [
    currentIndex > 0 ? lyrics[currentIndex - 1] : null,
    currentIndex >= 0 ? lyrics[currentIndex] : null,
    currentIndex >= 0 && currentIndex < lyrics.length - 1
      ? lyrics[currentIndex + 1]
      : null,
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center h-48 w-full px-6 relative">
        {displayLines.map((line, i) => (
          <div
            key={`${line?.time || "empty"}-${i}`}
            className={`absolute w-full text-center transition-all duration-500 ease-out ${
              i === 0
                ? "-translate-y-16"
                : i === 1
                ? "translate-y-0"
                : "translate-y-16"
            }`}
            style={{
              opacity: line ? (i === 1 ? 1 : 0.4) : 0,
              transform: `${
                i === 0
                  ? "translateY(-4rem)"
                  : i === 1
                  ? "translateY(0)"
                  : "translateY(4rem)"
              } scale(${i === 1 ? 1 : 0.85})`,
              filter: i === 1 ? "none" : "blur(0.5px)",
            }}
          >
            {line && (
              <div
                className={`transform transition-all duration-500 ${
                  i === 1
                    ? "text-white text-4xl md:text-6xl font-extrabold"
                    : "text-slate-400 text-2xl md:text-3xl font-semibold"
                }`}
                style={{
                  fontFamily: '"Anton", sans-serif',
                  letterSpacing: i === 1 ? "2px" : "1px",
                  textShadow:
                    i === 1
                      ? `0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.4)`
                      : "0 2px 10px rgba(0, 0, 0, 0.5)",
                  animation: i === 1 ? "pulse 2s ease-in-out infinite" : "none",
                }}
              >
                {line.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function KaraokeApp() {
  const [currentTrack, setCurrentTrack] = useState("track1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const barsRef = useRef([]);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  const currentSong = SONG_INFO.find((song) => song.id === currentTrack);

  const getAudioSrc = (trackId) => {
    const song = SONG_INFO.find((s) => s.id === trackId);
    return `/${trackId}.${song?.format || "mp3"}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setupAudioContext = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      try {
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        const audioSource = ctx.createMediaElementSource(audio);
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 256;

        audioSource.connect(analyzer);
        audioSource.connect(ctx.destination);

        const frequencyData = new Uint8Array(analyzer.frequencyBinCount);

        function renderFrame() {
          analyzer.getByteFrequencyData(frequencyData);
          for (let i = 0; i < NBR_OF_BARS; i++) {
            const index = Math.floor((i / NBR_OF_BARS) * frequencyData.length);
            const fd = frequencyData[index];
            const barHeight = Math.max(6, (fd / 255) * 100);
            if (barsRef.current[i]) {
              barsRef.current[i].style.height = `${barHeight}px`;
            }
          }
          animationRef.current = requestAnimationFrame(renderFrame);
        }
        renderFrame();
      } catch (error) {
        console.log("Audio context setup failed:", error);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setAudioError(false);
      setupAudioContext();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleError = () => {
      setAudioError(true);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setAudioError(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTrack]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.log("Playback failed:", error);
      setAudioError(true);
    }
  };

  const changeTrack = (trackId) => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentTrack(trackId);
    setShowPlaylist(false);
    setAudioError(false);
    setIsPlaying(false);
  };

  const nextTrack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);

    const currentIndex = SONG_INFO.findIndex(
      (song) => song.id === currentTrack
    );
    const nextIndex = (currentIndex + 1) % SONG_INFO.length;
    changeTrack(SONG_INFO[nextIndex].id);
  };

  const prevTrack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);

    const currentIndex = SONG_INFO.findIndex(
      (song) => song.id === currentTrack
    );
    const prevIndex =
      currentIndex === 0 ? SONG_INFO.length - 1 : currentIndex - 1;
    changeTrack(SONG_INFO[prevIndex].id);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-slate-400 rotate-45 animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 border-2 border-blue-400 rotate-12 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-32 left-32 w-40 h-40 border-2 border-slate-300 -rotate-12 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 border-2 border-blue-300 rotate-45 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-20 flex justify-between items-center p-8 py-4 border-b border-slate-700/30 backdrop-blur-sm">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Music className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Karaoke Studio</h1>
          </div>
        </div>

        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <List className="w-5 h-5" />
          <span>Playlist</span>
        </button>
      </div>

      {/* Playlist Modal */}
      {showPlaylist && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center animate-fadeIn">
          <div className="bg-slate-900/95 backdrop-blur-md border-2 border-slate-600 rounded-2xl px-8 py-6 max-w-lg w-full mx-4 shadow-2xl animate-slideUp">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              Choose a Song
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {SONG_INFO.map((song) => (
                <button
                  key={song.id}
                  onClick={() => changeTrack(song.id)}
                  className={`w-full cursor-pointer p-5 rounded-xl text-left transition-all duration-300 border-2 group hover:scale-[1.02] ${
                    currentTrack === song.id
                      ? "bg-slate-700 border-cyan-400 shadow-lg shadow-cyan-400/20"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-5 h-5 rounded-full transition-all duration-300 group-hover:scale-125"
                      style={{
                        backgroundColor: song.color,
                        boxShadow:
                          currentTrack === song.id
                            ? `0 0 15px ${song.color}`
                            : "none",
                      }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-lg">
                        {song.title}
                      </div>
                      <div className="text-slate-300">{song.artist}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPlaylist(false)}
              className="w-full mt-4 py-3 cursor-pointer bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={getAudioSrc(currentTrack)}
        onLoadedData={() => {
          if (audioRef.current) {
            audioRef.current.volume = volume / 100;
          }
        }}
      />

      {/* Current Song Info */}
      <div className="relative z-10 text-center py-8">
        <div className="inline-block bg-slate-800/80 backdrop-blur-md border-2 border-slate-600 rounded-2xl px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h2 className="text-4xl font-bold text-white mb-3">
            {currentSong?.title}
          </h2>
          <p className="text-slate-300 text-xl font-medium">
            {currentSong?.artist}
          </p>
          {audioError && (
            <p className="text-red-400 text-sm mt-3 font-medium animate-pulse">
              Audio file not found ({currentSong?.format?.toUpperCase()})
            </p>
          )}
        </div>
      </div>

      {/* Visualizer */}
      <div className="relative z-10 flex justify-center items-end h-24 px-8 mb-8">
        <div className="flex justify-center items-end space-x-1 max-w-3xl w-full">
          {Array(NBR_OF_BARS)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                ref={(el) => (barsRef.current[i] = el)}
                className="rounded-t-md transition-all duration-100 ease-out"
                style={{
                  width: "10px",
                  height: "6px",
                  backgroundColor: currentSong?.color || "#00D4FF",
                  boxShadow: `0 0 10px ${currentSong?.color || "#00D4FF"}`,
                  opacity: isPlaying ? 1 : 0.5,
                }}
              />
            ))}
        </div>
      </div>

      {/* Lyrics Display with Progress Bar */}
      <div className="relative z-10 pt-20">
        <LyricDisplay audioRef={audioRef} currentTrack={currentTrack} />
      </div>

      {/* Playback Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 h-auto">
        <div className="bg-slate-800/90 backdrop-blur-md border-2 border-slate-600 rounded-2xl p-6 shadow-2xl max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button
              onClick={prevTrack}
              className="p-3 bg-slate-700 cursor-pointer hover:bg-slate-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={togglePlayPause}
              disabled={audioError}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-110 shadow-xl ${
                audioError
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-2xl"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-3 bg-slate-700 cursor-pointer hover:bg-slate-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center space-x-3">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div className="relative group">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${
                    currentSong?.color || "#00D4FF"
                  } 0%, ${
                    currentSong?.color || "#00D4FF"
                  } ${volume}%, #334155 ${volume}%, #334155 100%)`,
                }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {volume}%
              </div>
            </div>
            <span className="text-slate-400 text-xs font-medium w-8 text-center">
              {volume}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 12px rgba(0,0,0,0.5);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 12px rgba(0,0,0,0.5);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.8);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }
      `}</style>
    </div>
  );
}
