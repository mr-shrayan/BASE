'use client';

import { useGui } from '@/context/GuiContext';
import { useAuth } from '@/context/AuthContext';

export default function StatusBar() {
  const { message } = useGui();
  const { user, loading } = useAuth();
  
  if (loading || !user) return null;

  const msgColor = message.type === 'E' ? 'text-red-600 bg-red-50' : 
                   message.type === 'S' ? 'text-green-700 bg-green-50' : 
                   message.type === 'W' ? 'text-yellow-700 bg-yellow-50' : 
                   message.text ? 'text-blue-700 bg-blue-50' : 'text-transparent';

  const hasMessage = message.text !== '';

  return (
    <div className="h-6 bg-[#E8EBEE] border-t border-gray-300 flex items-center justify-between z-50 text-[10px] select-none font-medium fixed bottom-0 w-full font-mono text-gray-600">
      
      {/* Target Message Area */}
      <div className={`h-full flex items-center px-2 flex-grow border-r border-gray-300 transition-colors ${hasMessage ? msgColor : ''}`}>
        {message.text && (
            <span className="truncate max-w-[80vw]">
              {message.type && <span className="font-bold mr-1">{message.type}:</span>}
              {message.text}
            </span>
        )}
      </div>

      {/* Structured Info Blocks */}
      <div className="flex h-full items-center shrink-0">
        <div className="px-3 border-r border-gray-300 h-full flex items-center hover:bg-gray-200 cursor-default">
           <span>BASE</span>
        </div>
        <div className="px-3 border-r border-gray-300 h-full flex items-center hover:bg-gray-200 cursor-default">
           <svg className="w-2.5 h-2.5 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
           <span>{user.mandt}</span>
        </div>
        <div className="px-3 border-r border-gray-300 h-full flex items-center hover:bg-gray-200 cursor-default min-w-[80px] max-w-[120px] truncate">
           <span>{user.username}</span>
        </div>
        <div className="px-3 border-r border-gray-300 h-full flex items-center hover:bg-gray-200 cursor-default">
           <span>OVR</span>
        </div>
        <div className="px-2 h-full flex items-center bg-gray-200 text-gray-400">
           {/* Resize grip handle simulation */}
           <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
      </div>

    </div>
  );
}
