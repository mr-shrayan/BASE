'use client';

import { useAuth } from '@/context/AuthContext';
import { useGui } from '@/context/GuiContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Launchpad() {
  const { user } = useAuth();
  const { setTitle, setTcode } = useGui();
  const router = useRouter();

  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    setTitle('SAP Easy Access');
    setTcode('SESSION');
    if (user?.username) fetchFavorites();
  }, [setTitle, setTcode, user]);

  const fetchFavorites = async () => {
    if (!user?.username) return;
    try {
      const res = await fetch(`/api/favorites?uname=${user.username}`);
      const data = await res.json();
      if (res.ok) setFavorites(data.favorites || []);
    } catch (e) {}
  };

  const handleTileClick = (path: string) => router.push(path);

  const toggleFavorite = async (e: React.MouseEvent, tcode: string, ttext: string) => {
    e.stopPropagation();
    const isFav = favorites.some((f) => f.TCODE === tcode);
    try {
      if (isFav) {
        await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uname: user?.username, tcode }) });
      } else {
        await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uname: user?.username, tcode, ttext, mandt: user?.mandt }) });
      }
      fetchFavorites();
    } catch (err) {}
  };

  const isPinned = (tcode: string) => favorites.some((f) => f.TCODE === tcode);

  const AppTile = ({ tcode, title, desc, path, icon, active = true }: any) => (
     <div 
       onClick={() => active && handleTileClick(path)}
       className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all flex flex-col h-36 group relative ${active ? 'cursor-pointer hover:shadow-md hover:border-blue-200' : 'opacity-70 cursor-not-allowed bg-white/60'}`}
     >
       {active && (
         <button onClick={(e) => toggleFavorite(e, tcode, title)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10" title={isPinned(tcode) ? "Unpin" : "Pin to Favorites"}>
           <svg className={`w-5 h-5 ${isPinned(tcode) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'} drop-shadow-sm`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
         </button>
       )}
       <div className="flex justify-between items-start mb-auto">
          <h3 className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 pr-5">{title}</h3>
          <div className="text-gray-400 absolute bottom-5 right-5 opacity-40">
            {icon}
          </div>
       </div>
       <div className="mt-4 z-10">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transaction {tcode}</span>
       </div>
     </div>
  );

  return (
    <div className="bg-transparent font-sans">
      <main className="max-w-[1200px] mx-auto p-4 sm:p-8">
        <h1 className="text-2xl font-light text-gray-800 mb-8">Hello, {user?.username}</h1>

        <div className="space-y-10">
          
          {/* Tile Group: Favorites */}
          {favorites.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                Favorites
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {favorites.map((fav, i) => (
                    <AppTile 
                      key={i}
                      tcode={fav.TCODE} 
                      title={fav.TTEXT || fav.TCODE} 
                      path={`/${fav.TCODE.toLowerCase()}`}
                      icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    />
                 ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4">Implementation & Customization</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <AppTile tcode="SPRO" title="Customizing: Execute Project" path="/spro" icon={<svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49-.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4">System Administration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <AppTile tcode="SE11" title="ABAP Dictionary" path="/se11" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4z"></path></svg>} />
               <AppTile tcode="SE16" title="Data Browser" path="/se16" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>} />
               <AppTile tcode="SU01" title="User Maintenance" path="/su01" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} />
               <AppTile tcode="SM30" title="Table Maintenance" path="/sm30" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4">Master Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <AppTile tcode="XD01" title="Customer Master" path="" active={false} icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} />
               <AppTile tcode="MM01" title="Material Master" path="" active={false} icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-normal text-gray-700 border-b border-gray-200 pb-2 mb-4">Sales & Distribution</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <AppTile tcode="VA01" title="Create Sales Order" path="" active={false} icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
