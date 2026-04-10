'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('I: Please define your permanent password to complete the provisioning process.');
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!password || password.length < 8) {
      setError('E: Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('E: Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;
      
      // Successfully updated. Route to the Fiori Launchpad Dashboard
      router.push('/launchpad');

    } catch (err: any) {
      setError(err.message.startsWith('E:') ? err.message : `E: Password update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] p-4 font-sans text-gray-800">
      
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
              Initial Setup
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-[3px] border-red-500 text-red-700 text-xs font-semibold rounded-r-md flex items-center whitespace-pre-line">
              <span className="mr-2 h-4 w-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">!</span>
              {error}
            </div>
          )}
          {infoMessage && !error && (
            <div className="mb-6 p-3 bg-blue-50 border-l-[3px] border-blue-500 text-blue-700 text-xs font-semibold rounded-r-md flex items-start">
              <span className="mr-2 h-4 w-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">i</span>
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#0A6ED1] hover:bg-[#0855A3] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-[0_4px_14px_0_rgba(10,110,209,0.39)] hover:shadow-[0_6px_20px_rgba(10,110,209,0.23)] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Updating...' : 'Set Password and Continue'}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">NetWeaver Security Core</p>
        </div>
      </div>
    </div>
  );
}
