// frontend/components/InputForm.tsx
import React, { useState, useEffect } from 'react';

interface Props {
  onChange: (data: Record<string, any>) => void;
}

const genreOptions = ['Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Sci-Fi'];
const streamingOptions = ['Netflix', 'Amazon Prime', 'Disney+', 'Hulu'];

export default function InputForm({ onChange }: Props) {
  const [mood, setMood] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [actor, setActor] = useState('');
  const [keywords, setKeywords] = useState('');
  const [streamingServices, setStreamingServices] = useState<string[]>([]);

  useEffect(() => {
    onChange({
      mood: mood || undefined,
      genre: genres.length ? genres : undefined,
      duration: duration || undefined,
      actor: actor || undefined,
      keywords: keywords || undefined,
      streamingService: streamingServices.length ? streamingServices : undefined,
    });
  }, [mood, genres, duration, actor, keywords, streamingServices, onChange]);

  const toggleSelection = (option: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(option)) setList(list.filter(g => g !== option));
    else setList([...list, option]);
  };

  return (
    <div className="w-full max-w-xl bg-gray-900 p-6 rounded shadow space-y-4">
      <div>
        <label className="block mb-1 font-semibold">Mood</label>
        <input
          type="text"
          className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700"
          value={mood}
          onChange={e => setMood(e.target.value)}
          placeholder="e.g., happy, sad, energetic"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Genres</label>
        <div className="flex flex-wrap gap-2">
          {genreOptions.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggleSelection(g, genres, setGenres)}
              className={`px-3 py-1 rounded-full border ${
                genres.includes(g) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Duration</label>
        <input
          type="text"
          className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="e.g., 90 mins, 2 hours"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Actor</label>
        <input
          type="text"
          className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700"
          value={actor}
          onChange={e => setActor(e.target.value)}
          placeholder="Favorite actor"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Keywords</label>
        <input
          type="text"
          className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="e.g., space, friendship"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Streaming Services</label>
        <div className="flex flex-wrap gap-2">
          {streamingOptions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSelection(s, streamingServices, setStreamingServices)}
              className={`px-3 py-1 rounded-full border ${
                streamingServices.includes(s) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
