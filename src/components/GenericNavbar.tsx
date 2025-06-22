import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlayCircle, Tv, Video, MessageCircle, Film, Monitor, Smartphone, Youtube, Gamepad2 } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  color: string;
  iconColor: string;
}

interface GenericNavbarProps {
  className?: string;
  containerClassName?: string;
  itemClassName?: string;
  homeButtonClassName?: string;
  iconSize?: number;
}

const GenericNavbar: React.FC<GenericNavbarProps> = ({
  className = "",
  containerClassName = "",
  itemClassName = "",
  homeButtonClassName = "",
  iconSize = 16,
}) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/netflix', label: 'Netflix', icon: PlayCircle, color: 'from-red-600 to-red-500', iconColor: 'text-red-100' },
    { path: '/prime', label: 'Prime Video', icon: Video, color: 'from-blue-600 to-blue-500', iconColor: 'text-blue-100' },
    { path: '/hulu', label: 'Hulu', icon: Tv, color: 'from-green-600 to-green-500', iconColor: 'text-green-100' },
    { path: '/disney', label: 'Disney+', icon: Film, color: 'from-purple-600 to-purple-500', iconColor: 'text-purple-100' },
    { path: '/youtube', label: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-400', iconColor: 'text-red-100' },
    { path: '/apple', label: 'Apple TV+', icon: Monitor, color: 'from-gray-600 to-gray-500', iconColor: 'text-gray-100' },
    { path: '/karoke', label: 'Karoke Studio', icon: MessageCircle, color: 'from-green-500 to-green-400', iconColor: 'text-green-100' },
    { path: '/twitch', label: 'Twitch', icon: Smartphone, color: 'from-purple-500 to-purple-400', iconColor: 'text-purple-100' },
    { path: '/FireTVWrapped', label: 'FireTVWrapped', icon: Gamepad2, color: 'from-orange-600 to-orange-500', iconColor: 'text-orange-100' },
  ];

  const currentPageItem = navItems.find(item => item.path === location.pathname);
  const showHomeButton = currentPageItem !== undefined;

  const displayItems = navItems.filter(item => item.path !== location.pathname);

  return (
    <nav className={`bg-gradient-to- backdrop-blur-lg border-b shadow-md ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        <div className="flex items-center justify-between py-4">
          
          {/* Home Button */}
          {showHomeButton && (
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium 
                bg-blue-800 text-white hover:bg-blue-700 
                transition-all duration-300 ${homeButtonClassName}`}
            >
              <Home size={iconSize} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}

          {/* App Buttons */}
          <div className={`flex gap-3 flex-wrap justify-center ${showHomeButton ? 'ml-auto' : 'mx-auto'}`}>
            {displayItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                    bg-gradient-to-br ${item.color} text-white 
                    hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl
                    border border-opacity-20 border-white
                    ${itemClassName}
                  `}
                >
                  <Icon size={iconSize} className={`${item.iconColor}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GenericNavbar;
