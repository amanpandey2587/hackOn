import React from 'react';

interface AppIconProps {
  platform: 'netflix' | 'prime' | 'hulu';
  onClick: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ platform, onClick }) => {
  const platformConfig = {
    netflix: {
      name: 'Netflix',
      colors: 'from-red-600 to-red-800',
      textColor: 'text-red-600',
      glowColor: 'bg-red-600'
    },
    prime: {
      name: 'Prime Video',
      colors: 'from-blue-600 to-blue-800',
      textColor: 'text-blue-400',
      glowColor: 'bg-blue-600'
    },
    hulu: {
      name: 'Hulu',
      colors: 'from-green-500 to-green-700',
      textColor: 'text-green-400',
      glowColor: 'bg-green-500'
    }
  };

  const config = platformConfig[platform];

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer transform hover:scale-105 transition-all duration-300 group"
    >
      <div className={`w-32 h-32 bg-gradient-to-br ${config.colors} rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden`}>
        <div className="text-white text-xl font-bold tracking-wider">
          {config.name.toUpperCase()}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
      </div>
      
      <div className="mt-6 text-center">
        <p className={`${config.textColor} text-lg font-semibold`}>{config.name}</p>
        <p className="text-gray-400 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Click to open
        </p>
      </div>
      
      <div className={`absolute inset-0 ${config.glowColor} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
    </div>
  );
};

export default AppIcon;