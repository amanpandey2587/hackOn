import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlayCircle, Tv, Video, MessageCircle } from 'lucide-react';
import { UserButton, SignOutButton } from '@clerk/clerk-react';
import { useChatContext } from '@/utils/ChatContextProvider';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const isOnStreamingApp = ['/netflix', '/prime', '/hulu'].includes(location.pathname);

  const navItems: NavItem[] = [
    { path: '/netflix', label: 'Netflix', icon: PlayCircle },
    { path: '/prime', label: 'Prime Video', icon: Video },
    { path: '/hulu', label: 'Hulu', icon: Tv },
  ];
  
  const { isChatPanelOpen, toggleChatPanel } = useChatContext();

  return (
    <nav className="bg-gradient-to-b from-blue-950 to-blue-900 backdrop-blur-lg border-b border-blue-800 shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-blue-300 text-2xl font-bold tracking-wide hover:text-white transition-all duration-300">
              FireTV
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {isOnStreamingApp ? (
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-800 text-white hover:bg-blue-700 transition-all duration-300"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </Link>
            ) : (
              navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                      text-blue-300 hover:text-white hover:bg-blue-800 transition-all duration-300
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })
            )}

            {/* Open Chats Button */}
            <button
              onClick={toggleChatPanel}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-300
                ${isChatPanelOpen 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-300 hover:text-white hover:bg-blue-800'
                }
              `}
            >
              <MessageCircle size={20} />
              <span className="hidden sm:inline">Open Chats</span>
            </button>

            {/* Auth Controls */}
            <div className="flex items-center space-x-4 border-l border-blue-700 pl-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;