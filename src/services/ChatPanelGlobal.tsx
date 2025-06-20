import React from 'react';
import { X } from 'lucide-react';
import ChatPanelImplement from '@/pages/ChatImplement';
import { useChatContext } from '@/utils/ChatContextProvider';

const GlobalChatPanel: React.FC = () => {
  const { isChatPanelOpen, toggleChatPanel } = useChatContext();

  return (
    <div 
      className={`
        fixed top-0 right-0 h-full w-120 bg-blue-950 shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isChatPanelOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Chat Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-950 to-blue-900">
        <h2 className="text-lg font-semibold text-white">Chat Panel</h2>
        <button
          onClick={toggleChatPanel}
          className="text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800 transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* Chat Panel Content */}
      <div className="h-full  overflow-hidden">
        <ChatPanelImplement />
      </div>
    </div>
  );
};

export default GlobalChatPanel;