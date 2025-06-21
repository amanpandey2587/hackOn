import React, { useState } from 'react';
import InputForm from './components/InputForm';
import RouletteWheel from './components/RouletteWheel';
import ResultPanel from './components/ResultPanel';
import { useRoulette } from './hooks/useRoulette';

export default function App() {
  const [mode, setMode] = useState<'chaos' | 'user'>('user');
  const [inputData, setInputData] = useState({});
  const {
    titles,
    selectedTitle,
    loading,
    error,
    spinWheel
  } = useRoulette();

  const handleSpin = () => {
    spinWheel(inputData, mode);
  };

  const handleLike = () => {
    // Implement logic to save liked movie
    alert(`Liked: ${selectedTitle}`);
  };

  const handleRespin = () => {
    spinWheel(inputData, mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">Smart Interactive Content Roulette</h1>

      <div className="mb-6 flex space-x-6">
        <button
          onClick={() => setMode('user')}
          className={`px-4 py-2 rounded ${mode === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        >
          User Mode
        </button>
        <button
          onClick={() => setMode('chaos')}
          className={`px-4 py-2 rounded ${mode === 'chaos' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        >
          Chaos Mode
        </button>
      </div>

      {mode === 'user' && (
        <InputForm onChange={setInputData} />
      )}

      <RouletteWheel
        titles={titles}
        spinning={loading}
        onSpin={handleSpin}
        selected={selectedTitle}
        loading={loading}
      />

      <ResultPanel
        selectedTitle={selectedTitle}
        onLike={handleLike}
        onRespin={handleRespin}
        loading={loading}
        error={error}
      />
    </div>
  );
}
