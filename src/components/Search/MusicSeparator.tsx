import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Download, Loader2, Music, Mic, Search, FileText, Key } from 'lucide-react';

interface SeparationResult {
  session_id: string;
  status: string;
  message?: string;
}

interface SongIdentificationResult {
  status: string;
  song_name: string;
  artist: string;
  confidence: string;
  message?: string;
}

interface LyricsLine {
  time: number;
  text: string;
}

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  icon: React.ReactNode;
  isLoading: boolean;
  showLyrics?: boolean;
  lyrics?: LyricsLine[];
  onTimeUpdate?: (time: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  title, 
  icon, 
  isLoading, 
  showLyrics = false, 
  lyrics = [],
  onTimeUpdate 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    };
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [audioUrl, onTimeUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = seekTime;
  };

  const downloadTrack = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.toLowerCase().replace(' ', '_')}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Find current lyric line
  const getCurrentLyricIndex = () => {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (lyrics[i].time <= currentTime) {
        return i;
      }
    }
    return -1;
  };

  const currentLyricIndex = getCurrentLyricIndex();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayPause}
            disabled={isLoading || !audioUrl}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-1" />
            )}
          </button>

          <button
            onClick={stopAudio}
            disabled={isLoading || !audioUrl}
            className="flex items-center justify-center w-10 h-10 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={downloadTrack}
            disabled={isLoading || !audioUrl}
            className="flex items-center justify-center w-10 h-10 bg-green-500 hover:green-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={handleSeek}
            disabled={isLoading || !audioUrl}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {showLyrics && lyrics.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Synchronized Lyrics
            </h4>
            <div className="space-y-1">
              {lyrics.map((line, index) => (
                <p
                  key={index}
                  className={`text-sm transition-colors ${
                    index === currentLyricIndex
                      ? 'text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded'
                      : index < currentLyricIndex
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="text-xs text-gray-400 mr-2">
                    {Math.floor(line.time / 60)}:{(line.time % 60).toString().padStart(2, '0')}
                  </span>
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MusicSeparator: React.FC = () => {
  const [inputLyrics, setInputLyrics] = useState('');
  const [songName, setSongName] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [identifiedSong, setIdentifiedSong] = useState<SongIdentificationResult | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instrumentalUrl, setInstrumentalUrl] = useState<string>('');
  const [syncedLyrics, setSyncedLyrics] = useState<LyricsLine[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'manual'>('lyrics');

  const identifySong = async () => {
    if (!inputLyrics.trim()) {
      setError('Please enter some lyrics');
      return;
    }

    setIsIdentifying(true);
    setError(null);
    setIdentifiedSong(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/identify-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lyrics: inputLyrics,
          language: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SongIdentificationResult = await response.json();
      
      if (result.status === 'success' && result.song_name) {
        setIdentifiedSong(result);
        setSongName(`${result.song_name} ${result.artist}`);
      } else {
        throw new Error(result.message || 'Failed to identify song');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while identifying the song');
    } finally {
      setIsIdentifying(false);
    }
  };

  const generateSynchronizedLyrics = async (songTitle: string, artist: string) => {
    if (!geminiApiKey.trim()) {
      setError('Please enter your Gemini API key');
      return [];
    }

    try {
      const prompt = `Generate synchronized lyrics with timestamps for the song "${songTitle}" by ${artist}. 
      Format the response as a JSON array where each object has "time" (in seconds) and "text" properties.
      Include instrumental sections, verse/chorus markers, and realistic timing.
      Example format: [{"time": 0, "text": "♪ Instrumental intro ♪"}, {"time": 15, "text": "First line of lyrics"}]
      Make sure the timestamps are realistic for a typical song structure.
      Do not include actual copyrighted lyrics - create a structure with placeholder text that shows the timing pattern.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Result of the generated lyrics in the frontend is ",result);
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const lyricsData = JSON.parse(jsonMatch[0]);
        return lyricsData;
      } else {
        // Fallback: create structure from text response
        return createFallbackLyrics(songTitle);
      }
    } catch (err) {
      console.warn('Failed to generate lyrics with Gemini:', err);
      return createFallbackLyrics(songTitle);
    }
  };

  const createFallbackLyrics = (songTitle: string): LyricsLine[] => {
    return [
      { time: 0, text: "♪ Instrumental intro ♪" },
      { time: 10, text: `${songTitle} - Verse 1 begins` },
      { time: 25, text: "[Verse lyrics would appear here]" },
      { time: 40, text: "[Continue verse lyrics]" },
      { time: 55, text: "♪ Pre-chorus ♪" },
      { time: 65, text: "[Chorus begins]" },
      { time: 80, text: "[Chorus lyrics]" },
      { time: 95, text: "[Chorus continues]" },
      { time: 110, text: "♪ Musical break ♪" },
      { time: 125, text: "[Verse 2 begins]" },
      { time: 140, text: "[Second verse lyrics]" },
      { time: 155, text: "[Bridge section]" },
      { time: 170, text: "[Final chorus]" },
      { time: 185, text: "♪ Outro ♪" }
    ];
  };

  const separateSong = async () => {
    if (!songName.trim()) {
      setError('Please enter a song name or identify a song first');
      return;
    }

    setIsProcessing(true);
    setIsLoadingLyrics(true);
    setError(null);
    setSessionId(null);
    setInstrumentalUrl('');
    setSyncedLyrics([]);

    try {
      // First, generate synchronized lyrics using Gemini
      const [songTitle, ...artistParts] = songName.split(' ');
      const artist = artistParts.join(' ') || identifiedSong?.artist || 'Unknown Artist';
      
      const lyricsPromise = generateSynchronizedLyrics(songTitle, artist);

      // Then, separate the audio
      const response = await fetch('http://127.0.0.1:8000/api/v1/separate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_name: songName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SeparationResult = await response.json();
      
      if (result.session_id) {
        setSessionId(result.session_id);
        const instrumentalUrl = `http://127.0.0.1:8000/api/v1/download/${result.session_id}/instrumental`;
        setInstrumentalUrl(instrumentalUrl);

        // Wait for lyrics generation to complete
        const generatedLyrics = await lyricsPromise;
        setSyncedLyrics(generatedLyrics);
      } else {
        throw new Error(result.message || 'Failed to separate song');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during separation');
    } finally {
      setIsProcessing(false);
      setIsLoadingLyrics(false);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI-Powered Karaoke Studio</h1>
          <p className="text-gray-600">Identify songs from lyrics and create perfect karaoke tracks with synchronized lyrics</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Gemini API Key Input */}
          <div className="mb-6">
            <label htmlFor="geminiKey" className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              Gemini API Key
            </label>
            <input
              type="password"
              id="geminiKey"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your Gemini API key for synchronized lyrics generation"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a>
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'lyrics'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Identify by Lyrics
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Music className="w-4 h-4 inline mr-2" />
              Manual Entry
            </button>
          </div>

          <div className="space-y-6">
            {activeTab === 'lyrics' ? (
              <>
                <div>
                  <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Song Lyrics
                  </label>
                  <textarea
                    id="lyrics"
                    value={inputLyrics}
                    onChange={(e) => setInputLyrics(e.target.value)}
                    placeholder="Enter a few lines of lyrics from the song (in any language)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    disabled={isIdentifying}
                  />
                </div>

                <button
                  onClick={identifySong}
                  disabled={isIdentifying || !inputLyrics.trim()}
                  className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isIdentifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Identifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Identify Song
                    </>
                  )}
                </button>

                {identifiedSong && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">Song Identified!</h3>
                    <p className="text-green-700">
                      <strong>{identifiedSong.song_name}</strong> by {identifiedSong.artist}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Confidence: {identifiedSong.confidence}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label htmlFor="songName" className="block text-sm font-medium text-gray-700 mb-2">
                  Song Name
                </label>
                <input
                  type="text"
                  id="songName"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="Enter song name and artist (e.g., Hotel California Eagles)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isProcessing}
                  onKeyPress={(e) => e.key === 'Enter' && separateSong()}
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={separateSong}
              disabled={isProcessing || !songName.trim() || !geminiApiKey.trim()}
              className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5" />
                  Create Karaoke Track
                </>
              )}
            </button>
          </div>
        </div>

        {sessionId && (
          <div className="space-y-6">
            {/* Instrumental Player with Synchronized Lyrics */}
            <AudioPlayer
              audioUrl={instrumentalUrl}
              title="Karaoke Track (Instrumental with Lyrics)"
              icon={<Music className="w-6 h-6 text-green-500" />}
              isLoading={isProcessing}
              showLyrics={true}
              lyrics={syncedLyrics}
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Session Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Session ID:</strong> {sessionId}
                  </p>
                  {identifiedSong && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Song:</strong> {identifiedSong.song_name} by {identifiedSong.artist}
                    </p>
                  )}
                  <p className="text-sm text-green-600 mt-1">
                    <strong>{syncedLyrics.length}</strong> synchronized lyric lines generated
                  </p>
                </div>
                {isLoadingLyrics && (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating synchronized lyrics...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicSeparator;