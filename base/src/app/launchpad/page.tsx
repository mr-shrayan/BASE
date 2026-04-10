'use client';

import { useAuth } from '@/context/AuthContext';
import { useGui } from '@/context/GuiContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Launchpad() {
  const { user } = useAuth();
  const { setTitle } = useGui();
  const router = useRouter();

  useEffect(() => {
    setTitle('SAP Easy Access');
  }, [setTitle]);

  const handleTileClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-transparent font-sans">
      <main className="max-w-[1200px] mx-auto p-4 sm:p-8">
        <h1 className="text-2xl font-light text-gray-800 mb-8">Hello, {user?.username}</h1>

        <div className="space-y-10">
          
          {/* Tile Group: System & Administration */}
          <section>
            <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4">System Administration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Tile: Data Dictionary */}
               <div 
                 onClick={() => handleTileClick('/se11')}
                 className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all flex flex-col h-36 group"
               >
                 <div className="flex justify-between items-start mb-auto">
                    <h3 className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">Data Dictionary</h3>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                    </div>
                 </div>
                 <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transaction SE11</span>
                 </div>
               </div>

               {/* Tile: User Maintenance */}
               <div 
                 onClick={() => handleTileClick('/su01')}
                 className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all flex flex-col h-36 group"
               >
                 <div className="flex justify-between items-start mb-auto">
                    <h3 className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">User Maintenance</h3>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                 </div>
                 <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transaction SU01</span>
                 </div>
               </div>
            </div>
          </section>

          {/* Tile Group: Master Data */}
          <section>
            <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4">Master Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Tile: Customer Master */}
               <div className="bg-white/60 rounded-xl p-5 shadow-sm border border-gray-100 opacity-70 cursor-not-allowed flex flex-col h-36">
                 <div className="flex justify-between items-start mb-auto">
                    <h3 className="font-semibold text-gray-800 text-sm">Customer Master</h3>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                 </div>
                 <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transaction XD01</span>
                 </div>
               </div>

               {/* Tile: Material Master */}
               <div className="bg-white/60 rounded-xl p-5 shadow-sm border border-gray-100 opacity-70 cursor-not-allowed flex flex-col h-36">
                 <div className="flex justify-between items-start mb-auto">
                    <h3 className="font-semibold text-gray-800 text-sm">Material Master</h3>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                 </div>
                 <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transaction MM01</span>
                 </div>
               </div>
            </div>
          </section>

          {/* Tile Group: Sales */}
          <section>
            <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4">Sales & Distribution</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Tile: Sales Order */}
               <div className="bg-white/60 rounded-xl p-5 shadow-sm border border-gray-100 opacity-70 cursor-not-allowed flex flex-col h-36">
                 <div className="flex justify-between items-start mb-auto">
                    <h3 className="font-semibold text-gray-800 text-sm">Create Sales Order</h3>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                 </div>
                 <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transaction VA01</span>
                 </div>
               </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
