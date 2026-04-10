'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BaseLogin() {
  const [mandt, setMandt] = useState('800');
  const [bname, setBname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleLogon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');

    // Strict UI Validation
    if (!mandt) {
      setError('E: Client field is required.');
      setLoading(false);
      return;
    }
    if (!bname) {
      setError('E: User (Name) field is required.');
      setLoading(false);
      return;
    }

    const transformedEmail = `${bname.toUpperCase()}@${mandt}.sys`;

    try {
      // Phase 2: First-Time Passwordless Identity Flow
      if (!password) {
        setInfoMessage('I: Initiating Identity Check...');
        
        // Ask the backend if we need to auto-provision
        const provisionRes = await fetch('/api/auth/first-logon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bname, mandt }),
        });
        
        const provisionData = await provisionRes.json();
        
        if (!provisionRes.ok) {
          throw new Error(provisionData.error || 'Identity verification failed.');
        }

        setInfoMessage('I: First Logon detected. Provisioning and establishing secure session...');
        
        // Immediately authenticate with the dynamically assigned key to establish the cookie
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: transformedEmail,
          password: provisionData.temporaryKey,
        });

        if (authError) throw authError;

      } else {
        // Standard Login
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: transformedEmail,
          password: password,
        });

        if (authError) throw authError;
      }

      // Success
      localStorage.setItem('BASE_CLIENT_MANDT', mandt);
      window.location.href = '/se11';

    } catch (err: any) {
      // Explicitly catch custom backend strings (starting with E:) for native look
      setError(err.message.startsWith('E:') ? err.message : `E: Logon failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] p-4 font-sans text-gray-800">
      
      {/* Container echoing the Fiori Horizon UI approach */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden text-sm">
        
        {/* Subtle BASE Blue Ribbon */}
        <div className="h-1.5 w-full bg-[#0A6ED1]"></div>

        <div className="p-10">
          <div className="flex flex-col items-center mb-10 text-center">
            {/* BASE Logo interpretation */}
            <div className="w-14 h-8 bg-blue-600 rounded-sm mb-4 flex items-center justify-center transform -skew-x-[15deg]">
               <span className="text-white font-bold text-lg tracking-widest transform skew-x-[15deg]">BASE</span>
            </div>
            <h1 className="text-xl font-light text-gray-700">
              Enterprise Resource Planning
            </h1>
          </div>

          {/* BASE Standard Message Boxes */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-[3px] border-red-500 text-red-700 text-xs font-semibold rounded-r-md flex items-center whitespace-pre-line">
              <span className="mr-2 h-4 w-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">!</span>
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="mb-6 p-3 bg-blue-50 border-l-[3px] border-blue-500 text-blue-700 text-xs font-semibold rounded-r-md flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">i</span>
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleLogon} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Client</label>
              <input
                type="text"
                maxLength={3}
                value={mandt}
                onChange={(e) => setMandt(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
                placeholder="800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">User</label>
              <input
                type="text"
                maxLength={12}
                value={bname}
                onChange={(e) => setBname(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white uppercase text-sm font-mono transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                <span className="text-[10px] text-gray-400 font-medium">Leave blank for first logon</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#0A6ED1] hover:bg-[#0855A3] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-[0_4px_14px_0_rgba(10,110,209,0.39)] hover:shadow-[0_6px_20px_rgba(10,110,209,0.23)] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating
                </span>
              ) : 'Log On'}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">NetWeaver Core Systems</p>
        </div>
      </div>
    </div>
  );
}
