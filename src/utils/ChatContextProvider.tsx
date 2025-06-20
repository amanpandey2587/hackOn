import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
interface ChatContextType {
  isChatPanelOpen: boolean;
  toggleChatPanel: () => void;
  closeChatPanel: () => void;
  openChatPanel: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  const toggleChatPanel = () => {
    setIsChatPanelOpen(!isChatPanelOpen);
  };

  const closeChatPanel = () => {
    setIsChatPanelOpen(false);
  };

  const openChatPanel = () => {
    setIsChatPanelOpen(true);
  };

  const value: ChatContextType = {
    isChatPanelOpen,
    toggleChatPanel,
    closeChatPanel,
    openChatPanel,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};