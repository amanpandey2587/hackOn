import React from 'react';
import { useNavigate } from 'react-router-dom';

const RolMain: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchRoulette = () => {
    navigate('/roulette');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white flex items-center justify-center p-10">
      <button
        onClick={handleLaunchRoulette}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-lg hover:bg-indigo-700 transition"
      >
        Launch Smart Content Roulette
      </button>
    </div>
  );
};

export default RolMain;