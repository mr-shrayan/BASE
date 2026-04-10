'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type MessageType = 'S' | 'E' | 'W' | 'I' | '';

interface GuiContextType {
  title: string;
  setTitle: (title: string) => void;
  message: { text: string; type: MessageType };
  setSystemMessage: (text: string, type: MessageType) => void;
  clearSystemMessage: () => void;
}

const GuiContext = createContext<GuiContextType | undefined>(undefined);

export function GuiProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('SAP Easy Access');
  const [message, setMessage] = useState<{ text: string; type: MessageType }>({ text: '', type: '' });

  const setSystemMessage = (text: string, type: MessageType) => {
    setMessage({ text, type });
  };

  const clearSystemMessage = () => {
    setMessage({ text: '', type: '' });
  };

  return (
    <GuiContext.Provider value={{ title, setTitle, message, setSystemMessage, clearSystemMessage }}>
      {children}
    </GuiContext.Provider>
  );
}

export function useGui() {
  const context = useContext(GuiContext);
  if (context === undefined) throw new Error('useGui must be used within GuiProvider');
  return context;
}
