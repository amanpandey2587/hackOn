import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlayCircle, Tv, Video, MessageCircle, Film, Monitor, Smartphone, Youtube, Gamepad2 } from 'lucide-react';
import { UserButton, SignOutButton } from '@clerk/clerk-react';
import { useChatContext } from '@/utils/ChatContextProvider';
import SearchPage from './Search/SearchComponent';
import AudioRecorder from './Search/AudioStreamer';
import { useState, useEffect } from 'react';
import KaraokeApp from './Karaoke_Mode';
import RolMain from './roulette/rolMain';
interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const isOnStreamingApp = ['/netflix', '/prime', '/hulu', '/disney', '/youtube', '/apple', '/spotify', '/twitch', '/gaming'].includes(location.pathname);

  const navItems: NavItem[] = [
    { path: '/netflix', label: 'Netflix', icon: PlayCircle, color: 'from-red-600 to-red-500' },
    { path: '/prime', label: 'Prime Video', icon: Video, color: 'from-blue-600 to-blue-500' },
    { path: '/hulu', label: 'Hulu', icon: Tv, color: 'from-green-600 to-green-500' },
    { path: '/disney', label: 'Disney+', icon: Film, color: 'from-purple-600 to-purple-500' },
    { path: '/youtube', label: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-400' },
    { path: '/apple', label: 'Apple TV+', icon: Monitor, color: 'from-gray-600 to-gray-500' },
    { path: '/karoke', label: 'Karoke Studio', icon: MessageCircle, color: 'from-green-500 to-green-400' },
    { path: '/roulette', label: 'Roulette Wheel', icon: Smartphone, color: 'from-purple-500 to-purple-400' },
    { path: '/FireTVWrapped', label: 'FireTVWrapped', icon: Gamepad2, color: 'from-orange-600 to-orange-500' },
  ];
  
  const { isChatPanelOpen, toggleChatPanel } = useChatContext();
  const [voiceQuery, setVoiceQuery] = useState(''); 

  const handleTranscription = (transcription: string) => {
    setVoiceQuery(transcription);
  };



  return (
    <nav className="bg-gradient-to-b from-blue-950 to-blue-900 backdrop-blur-lg border-b border-blue-800 shadow-md relative z-50 min-h-[140px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full">
          
          <div className={`flex-1 flex flex-col justify-center py-4 ${!isChatPanelOpen ? 'pr-8' : ''}`}>
            <div className="space-y-4">
              <div className='flex flex-row'>
              <Link to="/" className="text-blue-300 text-3xl font-bold tracking-wide hover:text-white transition-all duration-300 block">
                FireTV
              </Link>

              <div className=" ml-9 flex items-center justify-end space-x-4 mb-4">
                {isOnStreamingApp && (
                  <Link
                    to="/"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-800 text-white hover:bg-blue-700 transition-all duration-300"
                  >
                    <Home size={18} />
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                )}

                {/* Open Chats Button */}
                <button
                  onClick={toggleChatPanel}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300
                    ${isChatPanelOpen 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-300 hover:text-white hover:bg-blue-800'
                    }
                  `}
                >
                  <MessageCircle size={18} />
                  <span className="hidden sm:inline">Chats</span>
                </button>

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 rounded-full border-2 border-blue-600 hover:border-blue-400 transition-colors',
                      userButtonPopoverCard: 'bg-blue-950 border border-blue-700',
                      userButtonPopoverActions: 'bg-blue-950',
                      userButtonPopoverActionButton: 'text-blue-300 hover:text-white hover:bg-blue-800',
                      userButtonPopoverActionButtonText: 'text-blue-300',
                      userButtonPopoverFooter: 'bg-blue-950 border-t border-blue-700',
                    },
                  }}
                  showName={false}
                  userProfileMode="navigation"
                  userProfileUrl="/profile"
                />
                
                <SignOutButton>
                  <button className="text-blue-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-800 transition-all duration-300">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>

              </div>
              
              <div className="flex items-center space-x-3">
                <AudioRecorder onTranscriptionReceived={handleTranscription} />
                <div className={`flex-1 ${!isChatPanelOpen ? 'w-[50vw]' : 'w-full'}`}>
                  <SearchPage voiceQuery={voiceQuery} key={voiceQuery || 'default'} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Portion - App Grid and Auth */}
          <div className={`flex-1 flex flex-col justify-center py-4 ${isChatPanelOpen ? 'mr-96' : ''}`}>
            <div className="flex flex-col h-full">
              
              {/* Auth Controls - Top Right */}
            

              {/* App Grid - 3x3 for laptop screens */}
              {!isOnStreamingApp && (
                <div className="flex-1 flex items-center justify-end">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 max-w-xs">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`
                            group relative flex flex-col items-center justify-center p-3 rounded-xl
                            bg-gradient-to-br ${item.color} hover:scale-105 
                            transform transition-all duration-300 shadow-lg hover:shadow-xl
                            border border-opacity-20 border-white aspect-square
                          `}
                        >
                          <Icon size={20} className="text-white mb-1 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-white text-xs font-medium text-center leading-tight">
                            {item.label}
                          </span>
                          
                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 rounded-xl bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;