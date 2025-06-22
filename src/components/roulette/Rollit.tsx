import React, { useState } from 'react';
import InputForm from './InputForm';
import RouletteWheel from './RouletteWheel';
import ResultPanel from './ResultPanel';
import { useRoulette } from '../hooks/useRoulette';

interface Props {
  goBack: () => void;
}

export default function Rollit({ goBack }: Props) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inputData, setInputData] = useState({});
  const [mode, setMode] = useState<'user' | 'chaos'>('user'); // 🔄 added mode
  const userId = "user_2yh036LYXpjTfvFhJ2zLjWmmgXn";

  const {
    titles,
    selectedTitle,
    loading,
    error,
    spinning,
    spinWheel,
    selectTitle,
    resetSelection
  } = useRoulette();

  const handleFormSubmit = async (data: Record<string, any>) => {
    setInputData(data);
    setFormSubmitted(true);
    await spinWheel(data, mode, userId); // 🔄 mode passed to backend
  };

  const handleSpin = () => {
    selectTitle();
  };

  const handleLike = () => {
    alert(`Great choice! You liked: ${selectedTitle}`);
  };

  const handleRespin = () => {
    resetSelection();
    setTimeout(() => {
      selectTitle();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Smart Content Roulette
          </h1>
          <p className="text-gray-400 mt-1">Discover your next favorite movie or show</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* 🔄 Mode Toggle */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'user' | 'chaos')}
            className="text-sm bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none"
          >
            <option value="user">🎯 Personalized</option>
            <option value="chaos">🎲 Chaos Mode</option>
          </select>

          <button
            onClick={goBack}
            className="text-sm px-4 py-2 bg-gray-700/50 backdrop-blur-sm rounded-lg hover:bg-gray-600/50 transition-all duration-200 border border-gray-600"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        {formSubmitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Your Preferences</h2>
                <p className="text-gray-400">Modify and resubmit anytime for new recommendations</p>
              </div>
              <InputForm onSubmit={handleFormSubmit} mode={mode} />
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Your Personalized Roulette</h2>
                <p className="text-gray-400">
                  {titles.length > 0 ? 'Spin the wheel to discover your next watch!' : 'Getting your recommendations...'}
                </p>
              </div>

              <RouletteWheel
                titles={titles}
                spinning={spinning}
                selected={selectedTitle}
                loading={loading}
                onSpin={handleSpin}
              />

              <ResultPanel
                selectedTitle={selectedTitle}
                loading={loading}
                error={error}
                spinning={spinning}
                onLike={handleLike}
                onRespin={handleRespin}
              />

              {titles.length > 0 && !loading && (
                <div className="text-center text-sm text-gray-400 max-w-md">
                  <p>🎲 Each spin picks from your 8 {mode === 'chaos' ? 'random' : 'personalized'} recommendations</p>
                  <p className="mt-1">👍 Like what you see or spin again for another option!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">Tell us your preferences</h2>
                <p className="text-gray-400">We'll find 8 {mode === 'chaos' ? 'random' : 'perfect'} recommendations for you</p>
              </div>
              <InputForm onSubmit={handleFormSubmit} mode={mode} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
