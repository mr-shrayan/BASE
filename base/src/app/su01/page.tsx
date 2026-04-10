'use client';

import { useState, useEffect } from 'react';
import { useGui } from '@/context/GuiContext';

export default function SU01() {
  const [bname, setBname] = useState('');
  const [mandt, setMandt] = useState('800');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { setTitle, setSystemMessage, clearSystemMessage } = useGui();

  useEffect(() => {
    setTitle('User Maintenance: Initial Screen');
    return () => clearSystemMessage();
  }, [setTitle, clearSystemMessage]);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bname) {
      setSystemMessage('User name is required.', 'E');
      return;
    }
    
    setLoading(true);
    setSystemMessage('Provisioning new user in identity core...', 'I');

    try {
      const response = await fetch('/api/su01', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bname, 
          mandt,
          role,
          tempPassword: 'InitialPassword123!' // This will act as the temporary key standard
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSystemMessage(data.error.substring(3), 'E'); // strip the 'E: ' prefix for classic status bar
      } else {
        setSystemMessage(data.message.substring(3), 'S');
        setBname(''); 
      }
    } catch (err: any) {
      setSystemMessage(`Network or provision failure: ${err.message}`, 'E');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent text-gray-800 font-sans p-4 text-sm max-w-4xl mx-auto">
      <div className="space-y-4">
        
        <div className="flex justify-end mb-2">
            <button 
              onClick={handleProvision} 
              disabled={loading} 
              className="px-4 py-1.5 bg-[#0070F2] hover:bg-[#005CC6] text-white font-medium rounded flex items-center shadow-sm disabled:opacity-50 transition-colors"
            >
              <span>{loading ? 'Processing...' : 'Create Master Record'}</span>
            </button>
        </div>

        {/* Administration Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-700 font-semibold uppercase tracking-wider text-xs">Address / Identity</h2>
          </div>
          <div className="p-6 grid grid-cols-12 gap-6 items-center">
            
            <div className="col-span-12 md:col-span-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">User (12 Char Max)</label>
              <input 
                type="text" 
                value={bname}
                onChange={(e) => setBname(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={12}
                placeholder="e.g. JBOND"
                className="w-full p-2.5 border border-gray-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-mono text-gray-800"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Client Assignment</label>
              <input 
                type="text" 
                value={mandt}
                onChange={(e) => setMandt(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={3}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-800"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Security Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-800 bg-white"
              >
                <option value="user">Standard User</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
            
            <div className="col-span-12 pt-4">
              <div className="bg-blue-50 rounded p-4 border border-blue-100">
                 <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                    * The system automatically generates a security envelope assigning the initial un-hashed temporary password <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 border border-blue-200">InitialPassword123!</code>. 
                    <br/><br/>
                    When the newly provisioned user triggers their first login (submitting a blank password field to the central router), the system will seamlessly verify the untouched master record and trap the user in the mandatory `/set-password` setup screen before permitting any transactional access.
                 </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
