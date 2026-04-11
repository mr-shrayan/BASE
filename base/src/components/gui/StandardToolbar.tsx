'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGui } from '@/context/GuiContext';

export default function StandardToolbar() {
  const [tcode, setTcode] = useState('');
  const { user, loading, logout } = useAuth();
  const { setSystemMessage } = useGui();
  const router = useRouter();

  const pathname = usePathname();

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tcode.trim()) {
      const command = tcode.trim().toUpperCase();
      
      if (command === '/NEX') {
         logout();
         return;
      }
      
      const strippedCommand = command.startsWith('/N') ? command.substring(2) : command;
      
      try {
         const res = await fetch(`/api/tstc?tcode=${strippedCommand}`);
         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         
         router.push(data.path);
      } catch (err: any) {
         setSystemMessage(err.message, 'E');
      }

      setTcode('');
    }
  };

  // Prevent flash on load, do not show tooling to unauthenticated users
  if (loading || !user) return null;

  return (
    <div className="h-10 bg-[#F3F6F9] border-b border-gray-300 flex items-center px-2 justify-between z-40 select-none shadow-sm">
      
      {/* Container Left: Command Field & Standard Icons */}
      <div className="flex items-center space-x-4">
        
        {/* Command OK Field */}
        <div className="flex items-center space-x-1">
           {/* Execute "Green Check" fake button */}
           <button 
             className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors tooltip"
             title="Enter"
             onClick={() => handleCommand({ key: 'Enter' } as React.KeyboardEvent)}
           >
             <svg className="w-4 h-4 text-green-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
           </button>
           
           <div className="flex bg-white border border-gray-400 items-center h-6 w-56 focus-within:border-blue-500 shadow-inner overflow-hidden">
             <input 
               type="text" 
               value={tcode}
               onChange={(e) => setTcode(e.target.value.toUpperCase())}
               onKeyDown={handleCommand}
               className="w-full px-2 py-0 text-xs font-semibold uppercase text-gray-800 focus:outline-none"
               title="Command Field (/n)"
             />
             <div className="px-1 text-gray-400 bg-gray-100 border-l border-gray-300 h-full flex items-center">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>
             </div>
           </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-gray-300"></div>

        {/* Global Toolbar Action Icons */}
        <div className="flex items-center space-x-1">
          {/* Save */}
          <button title="Save (Ctrl+S)" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 opacity-60 hover:opacity-100 transition-all">
            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
          </button>
          
          {/* Back (F3) */}
          <button 
            title="Back (F3)"
            onClick={() => { if (pathname !== '/launchpad') router.back(); }} 
            className={`w-7 h-7 flex items-center justify-center rounded transition-all ${pathname === '/launchpad' ? 'opacity-30 cursor-not-allowed text-gray-500' : 'hover:bg-gray-200 text-green-700'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z"/></svg>
          </button>
          
          {/* Exit (Shift+F3) */}
          <button title="Exit (Shift+F3)" onClick={() => router.push('/launchpad')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 opacity-80 hover:opacity-100 transition-all text-yellow-600">
             <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19h14"></path></svg>
          </button>

          {/* Cancel (F12) */}
          <button title="Cancel (F12)" onClick={() => router.push('/launchpad')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 opacity-80 hover:opacity-100 transition-all text-red-600">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          {/* Vertical Divider */}
          <div className="h-5 w-px bg-gray-300 ml-1 mr-1"></div>
          
          {/* Print */}
          <button title="Print" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 opacity-60 hover:opacity-100 transition-all">
             <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
          </button>
          
          {/* Find */}
          <button title="Find" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 opacity-60 hover:opacity-100 transition-all">
             <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </button>
        </div>
      </div>

    </div>
  );
}
