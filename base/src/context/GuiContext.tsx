'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type MessageType = 'S' | 'E' | 'W' | 'I' | '';

interface GuiContextType {
  title: string;
  setTitle: (title: string) => void;
  message: { text: string; type: MessageType };
  setSystemMessage: (text: string, type: MessageType) => void;
  clearSystemMessage: () => void;
  tcode: string;
  setTcode: (tcode: string) => void;
}

const GuiContext = createContext<GuiContextType | undefined>(undefined);

export function GuiProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('SAP Easy Access');
  const [tcode, setTcodeState] = useState('');
  const [message, setMessage] = useState<{ text: string; type: MessageType }>({ text: '', type: '' });

  const setSystemMessage = useCallback((text: string, type: MessageType) => {
    setMessage({ text, type });
  }, []);

  const clearSystemMessage = useCallback(() => {
    setMessage({ text: '', type: '' });
  }, []);

  const setTcode = useCallback((code: string) => {
    setTcodeState(code);
  }, []);

  return (
    <GuiContext.Provider value={{ title, setTitle, message, setSystemMessage, clearSystemMessage, tcode, setTcode }}>
      {children}
    </GuiContext.Provider>
  );
}

export function useGui() {
  const context = useContext(GuiContext);
  if (context === undefined) throw new Error('useGui must be used within GuiProvider');
  return context;
}
