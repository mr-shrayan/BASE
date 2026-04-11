'use client';

import { useState, useEffect, Suspense } from 'react';
import { useGui } from '@/context/GuiContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function SE16Content() {
  const { setTitle, setSystemMessage, clearSystemMessage, setTcode } = useGui();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Three explicit SAP states: INITIAL -> SELECTION -> OUTPUT
  const [appState, setAppState] = useState<'INITIAL' | 'SELECTION' | 'OUTPUT'>('INITIAL');

  const [tabname, setTabname] = useState(searchParams.get('tabname')?.toUpperCase() || '');
  const [maxHits, setMaxHits] = useState('500');
  
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  
  // Selection Screen dictionary
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    setTcode('SE16');
    if (searchParams.get('tabname') && appState === 'INITIAL') {
       // Direct boot into selection screen if tabname passed via URL
       handleTransitionToSelection(searchParams.get('tabname')!.toUpperCase());
    } else {
       setTitle('Data Browser: Initial Screen');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTransitionToSelection = async (targetTab: string) => {
    if (!targetTab) {
       setSystemMessage('Enter a table name.', 'I');
       return;
    }
    clearSystemMessage();
    setLoading(true);
    setSystemMessage('Introspecting dictionary...', 'I');
    
    try {
      const res = await fetch(`/api/se11?tabname=${targetTab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFields(data.fields);
      setTabname(targetTab);
      setFilters({}); // Clear old filters
      setAppState('SELECTION');
      setTitle(`Data Browser: Selection Screen ${targetTab}`);
      setSystemMessage('Ready.', 'S');
    } catch (err: any) {
      setSystemMessage(err.message, 'E');
      setAppState('INITIAL');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTarget = () => {
    handleTransitionToSelection(tabname);
  };

  const handleExecuteFilters = async () => {
    clearSystemMessage();
    setLoading(true);
    setSystemMessage('Selected records being read...', 'I');

    try {
      const qs = new URLSearchParams({
         tabname: tabname,
         mandt: user?.mandt || '',
         maxHits: maxHits,
         filters: JSON.stringify(filters)
      });

      const res = await fetch(`/api/se16?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRecords(data.records);
      setAppState('OUTPUT');
      setTitle(`Data Browser: Table ${tabname}`);
      setSystemMessage(`${data.records.length} entries selected.`, 'S');
    } catch (err: any) {
      setSystemMessage(err.message, 'E');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
     if (appState === 'OUTPUT') {
        setAppState('SELECTION');
        setTitle(`Data Browser: Selection Screen ${tabname}`);
        setSystemMessage('', '');
     } else if (appState === 'SELECTION') {
        setAppState('INITIAL');
        setTitle('Data Browser: Initial Screen');
        setTabname('');
        setSystemMessage('', '');
     }
  };


  if (appState === 'OUTPUT') {
    // ALV Grid Output Layout
    return (
      <div className="flex flex-col h-full bg-[#F3F6F9] font-sans">
        <div className="bg-[#F3F6F9] border-b border-gray-300 px-3 py-1 flex items-center shadow-sm w-full -mt-2">
           <button onClick={handleBack} className="flex items-center space-x-1 hover:bg-gray-200 px-2 py-1 rounded text-gray-800 transition-colors">
              <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              <span className="font-semibold text-[12px]">Back</span>
           </button>
        </div>
        <div className="p-4 bg-white flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto border border-gray-300 shadow-sm flex-1">
             <table className="w-full text-sm text-left border-collapse">
               <thead className="bg-[#E4E9EC] text-gray-800 uppercase text-[11px] font-semibold border-b border-gray-300 sticky top-0 z-10">
                 <tr>
                   <th className="px-3 py-2 border-r border-gray-300 w-8 bg-[#E4E9EC] text-center"></th>
                   {fields.map((f, i) => (
                     <th key={i} className="px-3 py-2 border-r border-gray-300 whitespace-nowrap cursor-default" title={f.DDTEXT}>
                       {f.FIELDNAME}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {records.map((r, rowIndex) => (
                   <tr key={rowIndex} className="border-b border-gray-200 hover:bg-[#F0F4F8] transition-colors group cursor-default">
                     <td className="px-3 py-1.5 border-r border-gray-300 bg-[#F4F6F9] text-gray-400 text-[10px] text-center w-8">
                       {rowIndex + 1}
                     </td>
                     {fields.map((f, colIndex) => (
                       <td key={colIndex} className="px-3 py-1.5 border-r border-gray-200 whitespace-nowrap font-mono text-[13px] text-gray-700">
                         {r[f.FIELDNAME] === null ? '' : String(r[f.FIELDNAME])}
                       </td>
                     ))}
                   </tr>
                 ))}
                 {records.length === 0 && (
                    <tr><td colSpan={fields.length + 1} className="py-8 text-center text-gray-500">No table entries found for specified key.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'SELECTION') {
    // Dynamic Selection Screen Layout
    return (
      <div className="flex flex-col h-full bg-[#F3F6F9] font-sans overflow-auto">
         <div className="bg-[#F3F6F9] border-b border-gray-300 px-3 py-1 flex items-center shadow-sm w-full -mt-2 space-x-2 sticky top-0 z-20">
           <button onClick={handleBack} className="flex items-center space-x-1 hover:bg-gray-200 px-2 py-1 rounded text-gray-800 transition-colors">
              <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
           </button>
           <button onClick={handleExecuteFilters} disabled={loading} className="flex items-center space-x-1.5 hover:bg-gray-200 px-2 py-1 rounded text-gray-800 transition-colors border border-transparent hover:border-gray-300 focus:bg-gray-300 disabled:opacity-50">
             <svg className="w-3.5 h-3.5 text-green-700" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
             <span className="font-semibold text-[12px]">Execute</span>
           </button>
         </div>

         <div className="p-4 max-w-4xl mt-2 text-sm mx-auto w-full">
           <div className="bg-white border border-gray-300 border-t-2 border-t-[#0070F2] shadow-sm mb-4">
             <div className="px-4 py-1.5 border-b border-gray-200 bg-[#F8F9FA] text-[13px] font-semibold text-gray-700 flex justify-between">
                <span>Selection Criteria for {tabname}</span>
             </div>
             <div className="p-4 grid grid-cols-1 gap-2">
                {fields.map((f, i) => (
                  <div key={i} className="flex items-center border-b border-dotted border-gray-200 pb-1">
                     <label className="w-64 font-medium text-[12px] text-gray-700 truncate pr-4" title={f.DDTEXT}>
                       {f.DDTEXT || f.FIELDNAME}
                     </label>
                     <div className="flex-1">
                       <input 
                         type="text" 
                         value={filters[f.FIELDNAME] || ''}
                         onChange={(e) => setFilters({ ...filters, [f.FIELDNAME]: e.target.value })}
                         className="w-full sm:w-64 border border-gray-400 px-2 py-1 text-[12px] text-gray-900 uppercase focus:ring-1 focus:ring-blue-600 outline-none hover:bg-[#FFFCEB] focus:bg-white bg-white transition-colors placeholder-gray-300"
                         placeholder={f.FIELDNAME}
                       />
                     </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-white border border-gray-300 shadow-sm mt-3">
             <div className="px-4 py-1.5 border-b border-gray-200 bg-[#F8F9FA] text-[13px] font-semibold text-gray-700">
                Output Parameters
             </div>
             <div className="p-4">
                <div className="flex items-center">
                  <label className="w-64 font-medium text-[12px] text-gray-700">Maximum Number of Hits</label>
                  <input 
                     type="number" 
                     value={maxHits}
                     onChange={(e) => setMaxHits(e.target.value)}
                     className="w-24 border border-gray-400 px-2 py-1 text-[12px] text-gray-900 text-right focus:ring-1 focus:ring-blue-600 outline-none hover:bg-[#FFFCEB] focus:bg-white bg-white transition-colors"
                  />
                </div>
             </div>
           </div>
         </div>
      </div>
    );
  }

  // Initial Screen Layout (Default)
  return (
    <div className="flex flex-col h-full bg-[#F3F6F9] font-sans">
       <div className="bg-[#F3F6F9] border-b border-gray-300 px-3 py-1 flex items-center shadow-sm w-full -mt-2">
         <button 
           onClick={handleExecuteTarget}
           disabled={loading}
           className="flex items-center space-x-1.5 hover:bg-gray-200 px-2 py-1 rounded text-gray-800 transition-colors border border-transparent hover:border-gray-300 disabled:opacity-50"
         >
           <svg className="w-3.5 h-3.5 text-green-700" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
           <span className="font-semibold text-[12px]">Selection Screen</span>
         </button>
       </div>

       <div className="p-4 max-w-2xl mt-2 text-sm mx-auto w-full">
         <div className="bg-white border border-gray-300 border-t-2 border-t-[#0070F2] shadow-sm">
           <div className="px-4 py-1.5 border-b border-gray-200 bg-[#F8F9FA] text-[13px] font-semibold text-gray-700">
              Table Selection
           </div>
           <div className="p-5">
              <form onSubmit={(e) => { e.preventDefault(); handleExecuteTarget(); }} className="flex items-center">
                <label className="w-40 font-medium text-[13px] text-gray-700">Table Name</label>
                <input 
                   type="text" 
                   value={tabname}
                   onChange={(e) => setTabname(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                   autoFocus
                   className="w-56 border border-gray-400 px-2 py-1 text-[13px] text-gray-900 uppercase focus:ring-1 focus:ring-blue-600 outline-none hover:bg-[#FFFCEB] focus:bg-white bg-white transition-colors"
                />
              </form>
           </div>
         </div>
       </div>
    </div>
  );
}

export default function SE16() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-medium">Mounting SE16 Interface...</div>}>
      <SE16Content />
    </Suspense>
  )
}
