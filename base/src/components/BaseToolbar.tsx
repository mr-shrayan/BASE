'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function BaseToolbar() {
  const [tcode, setTcode] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  
  // Consuming unified global state (Instant rendering, 0 duplicate data-fetches)
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tcode.trim()) {
      const command = tcode.trim().toUpperCase();
      
      // Handle special BASE command /NEX (Terminate session completely)
      if (command === '/NEX') {
         logout();
         return;
      }
      
      if (command.startsWith('/N')) {
        router.push(`/${command.substring(2).toLowerCase()}`);
      } else {
        router.push(`/${command.toLowerCase()}`);
      }
      setTcode('');
    }
  };

  // If loading Auth context, do not render user aspects
  if (loading) return <div className="h-[48px] bg-white border-b border-gray-200"></div>;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm z-50 text-gray-800 relative">
      <div className="flex items-center">
        <div className="flex bg-gray-50 border border-gray-300 items-center rounded-md overflow-hidden w-64 h-8 transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <div className="px-3 text-blue-600 flex items-center justify-center border-r border-gray-200 bg-white">
             <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                 <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
             </svg>
          </div>
          <input 
            type="text" 
            value={tcode}
            onChange={(e) => setTcode(e.target.value.toUpperCase())}
            onKeyDown={handleCommand}
            className="w-full px-3 py-1 text-sm font-medium uppercase text-gray-900 bg-transparent placeholder-gray-400 focus:outline-none"
            placeholder="Enter Command (/NEX to logout)"
          />
        </div>
        <div className="ml-8 space-x-1 text-sm text-gray-600 font-medium cursor-pointer select-none flex items-center hidden md:flex">
          <span className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">Menu</span>
          <span className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">Edit</span>
          <span className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">Favorites</span>
          <span className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">System</span>
          <span className="hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors">Help</span>
        </div>
      </div>
      
      {/* Right Side: Profile & System Info */}
      {user && (
        <div className="flex items-center space-x-4 relative">
          <div className="hidden lg:flex items-center space-x-3 text-xs text-gray-500 font-medium border-r border-gray-200 pr-4">
            <span className="bg-gray-100 px-2.5 py-1 rounded-md">CLI: <strong className="text-gray-700">{user.mandt || '---'}</strong></span>
          </div>
          
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-inner">
              {user.username ? user.username.substring(0,2) : 'SY'}
            </div>
            <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">{user.username || 'System'}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfile && (
            <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-sm font-bold text-gray-800 break-all">{user.username}</p>
                <p className="text-xs text-gray-500 mt-1">Client: {user.mandt}</p>
                <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mt-2">Administrator</p>
              </div>
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => setShowProfile(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  User Profile
                </button>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors flex items-center"
                >
                   <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   System Settings
                </button>
              </div>
              <div className="p-2 border-t border-gray-100">
                 <button 
                   onClick={logout}
                   className="w-full text-left px-3 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors flex items-center"
                 >
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                   Log Off (/nex)
                 </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
