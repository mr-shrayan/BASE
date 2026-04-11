'use client';

import { useState, useEffect, Suspense } from 'react';
import { useGui } from '@/context/GuiContext';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

function SM30Content() {
  const searchParams = useSearchParams();
  const tabname = searchParams.get('tabname')?.toUpperCase();

  const { setTitle, setSystemMessage, setTcode } = useGui();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [newRowTarget, setNewRowTarget] = useState<boolean>(false);
  const [activeRecord, setActiveRecord] = useState<any>({}); 

  useEffect(() => {
    setTcode('SM30');
    if (!tabname) {
       setTitle(`Maintain Table Views`);
       setLoading(false);
       return;
    }
    setTitle(`Maintain Table ${tabname}`);
    fetchTableContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabname]);

  const fetchTableContext = async () => {
    try {
      const res = await fetch(`/api/sm30?tabname=${tabname}&mandt=${user?.mandt || ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFields(data.fields);
      setRecords(data.records);
      setSystemMessage('Table maintenance ready.', 'S');
    } catch (err: any) {
      setSystemMessage(err.message, 'E');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntries = () => {
    setNewRowTarget(true);
    const blankRecord: any = {};
    fields.forEach(f => {
       if (f.FIELDNAME === 'MANDT') blankRecord[f.FIELDNAME] = user?.mandt;
       else blankRecord[f.FIELDNAME] = '';
    });
    setActiveRecord(blankRecord);
    setSystemMessage('Editing mode active. Supply new configuration data.', 'I');
  };

  const handleSave = async () => {
    if (!newRowTarget) {
      setSystemMessage('No outstanding changes to commit.', 'I');
      return;
    }

    setSystemMessage('Saving changes...', 'I');
    try {
      const res = await fetch('/api/sm30', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabname, record: activeRecord, username: user?.username })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSystemMessage('S: Data was saved', 'S');
      setNewRowTarget(false);
      fetchTableContext(); // Refresh strictly to pull native keys
    } catch (err: any) {
      setSystemMessage(err.message, 'E');
    }
  };

  const handleDelete = async (record: any) => {
    if (!confirm('Are you sure you want to delete this configuration block?')) return;
    
    setSystemMessage('Processing deletion...', 'I');
    try {
      // Build primary key map dynamically
      const keys = fields.filter(f => f.KEYFLAG === true);
      const pkMap: any = {};
      keys.forEach(k => {
        pkMap[k.FIELDNAME] = record[k.FIELDNAME];
      });

      const res = await fetch('/api/sm30', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabname, primaryKeys: pkMap, username: user?.username })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSystemMessage('Configurable data deleted.', 'S');
      fetchTableContext();
    } catch (err: any) {
      setSystemMessage(err.message, 'E');
    }
  };

  if (!tabname) return <div className="p-8 font-semibold text-gray-600">No Target Table Specified. Navigate via Customizing Menu.</div>;

  return (
    <div className="h-full flex flex-col bg-[#F3F6F9] font-sans text-[13px]">
      
      {/* Maintenance Application Toolbar */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center shadow-sm space-x-2 z-10">
        <button 
          onClick={handleNewEntries}
          className="flex items-center space-x-2 px-3 py-1 bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded text-gray-700 font-medium transition-all focus:bg-gray-200"
        >
           <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/></svg>
           <span>New Entries</span>
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        <button 
          onClick={handleSave}
          disabled={!newRowTarget}
          className="flex items-center space-x-2 px-3 py-1 bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded text-gray-700 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-transparent"
        >
           <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
           <span>Save Vector</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
         {loading ? (
             <div className="text-center text-gray-500 font-medium mt-10">Introspecting DB structure...</div>
         ) : (
           <div className="bg-white border border-gray-300 shadow-sm overflow-x-auto min-h-[300px]">
             <table className="w-full text-left border-collapse">
               <thead className="bg-[#E4E9EC] text-gray-800 text-[11px] font-bold border-b border-gray-300 sticky top-0 z-10 shadow-sm">
                 <tr>
                   <th className="px-2 py-1.5 border-r border-gray-300 bg-[#E4E9EC] w-10 text-center uppercase tracking-wider">Stat</th>
                   {fields.map((f, i) => (
                     <th key={i} className="px-3 py-1.5 border-r border-gray-300 whitespace-nowrap cursor-default uppercase" title={f.DDTEXT}>
                       {f.FIELDNAME} {f.KEYFLAG && <span className="text-red-500 ml-1" title="Primary Key">*</span>}
                     </th>
                   ))}
                   <th className="px-2 py-1.5 bg-[#E4E9EC] w-16 text-center uppercase tracking-wider">Act</th>
                 </tr>
               </thead>
               <tbody>
                 
                 {/* Native Database Records */}
                 {records.map((r, rowIndex) => (
                   <tr key={rowIndex} className="border-b border-gray-200 hover:bg-[#F0F4F8] group">
                     <td className="px-2 py-1 border-r border-gray-300 bg-[#F4F6F9] text-center w-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500 mx-auto shadow-sm" title="Active Object"></div>
                     </td>
                     
                     {fields.map((f, colIndex) => (
                       <td key={colIndex} className="px-3 py-1 border-r border-gray-200 font-mono text-[13px] text-gray-700 whitespace-nowrap cursor-default">
                         {r[f.FIELDNAME] === null ? '' : String(r[f.FIELDNAME])}
                       </td>
                     ))}

                     <td className="px-2 py-1 text-center w-16">
                        <button onClick={() => handleDelete(r)} className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100" title="Delete Block">
                          <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                     </td>
                   </tr>
                 ))}

                 {/* New Entries Overlay Form Row */}
                 {newRowTarget && (
                   <tr className="bg-[#FFFCEB] border-b-2 border-yellow-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                     <td className="px-2 py-1 border-r border-yellow-200 text-center w-10">
                       <svg className="w-3.5 h-3.5 text-yellow-600 mx-auto animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     </td>
                     
                     {fields.map((f, colIndex) => (
                       <td key={colIndex} className="px-1 py-1 border-r border-yellow-200">
                         {f.FIELDNAME === 'MANDT' ? (
                           <input type="text" value={activeRecord[f.FIELDNAME]} disabled className="w-full bg-gray-100 border border-gray-300 p-1 font-mono text-[13px] text-gray-500 cursor-not-allowed" />
                         ) : (
                           <input 
                             type={f.DATATYPE === 'INT' ? 'number' : 'text'} 
                             value={activeRecord[f.FIELDNAME] || ''}
                             onChange={(e) => setActiveRecord({ ...activeRecord, [f.FIELDNAME]: e.target.value })}
                             maxLength={f.LENG || undefined}
                             className="w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-1 font-mono text-[13px] uppercase shadow-inner"
                           />
                         )}
                       </td>
                     ))}

                     <td className="px-2 py-1 text-center w-16">
                        <button onClick={() => setNewRowTarget(false)} className="text-gray-400 hover:text-red-600 transition-colors" title="Cancel Input Frame">
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         )}
      </div>

    </div>
  );
}

export default function SM30() {
  return (
    <Suspense fallback={<div className="p-8 font-medium text-gray-500">Mounting Data View Framework...</div>}>
      <SM30Content />
    </Suspense>
  )
}
