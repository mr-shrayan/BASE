'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { useGui } from '@/context/GuiContext';

const FieldRow = memo(({ field, idx, updateField, removeField, disableDelete }: any) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="p-2 text-center border-r border-gray-300">
        <input 
          type="checkbox" 
          checked={field.keyflag} 
          onChange={(e) => updateField(idx, 'keyflag', e.target.checked)}
          className="w-3.5 h-3.5 text-blue-600 rounded border border-gray-400 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="p-1 border-r border-gray-300">
        <input 
          type="text" 
          value={field.fieldname} 
          onChange={(e) => updateField(idx, 'fieldname', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
          className="w-full p-1 bg-white border border-transparent focus:border-blue-500 rounded-sm hover-bg-[#FFFCEB] outline-none uppercase font-mono text-sm text-gray-900 font-semibold"
        />
      </td>
      <td className="p-1 border-r border-gray-300">
        <select 
          value={field.datatype} 
          onChange={(e) => updateField(idx, 'datatype', e.target.value)}
          className="w-full p-1 bg-white border border-transparent focus:border-blue-500 rounded-sm outline-none text-sm cursor-pointer text-gray-900"
        >
          <option value="CHAR">CHAR</option>
          <option value="VARCHAR">VARCHAR</option>
          <option value="NUMC">NUMC</option>
          <option value="DATS">DATS</option>
          <option value="CURR">CURR</option>
          <option value="QUAN">QUAN</option>
          <option value="INT">INT</option>
        </select>
      </td>
      <td className="p-1 border-r border-gray-300">
        <input 
          type="number" 
          value={field.leng || ''} 
          onChange={(e) => updateField(idx, 'leng', parseInt(e.target.value))} 
          className="w-full p-1 bg-white border border-transparent focus:border-blue-500 rounded-sm outline-none text-sm text-right text-gray-900"
          disabled={['DATS', 'INT'].includes(field.datatype)}
        />
      </td>
      <td className="p-1 border-r border-gray-300">
        <input 
          type="number" 
          value={field.decimals || ''} 
          onChange={(e) => updateField(idx, 'decimals', parseInt(e.target.value))}
          className="w-full p-1 bg-white border border-transparent focus:border-blue-500 rounded-sm outline-none text-sm text-right text-gray-900"
          disabled={!['CURR', 'QUAN'].includes(field.datatype)} 
        />
      </td>
      <td className="p-1 border-r border-gray-300">
        <input 
          type="text" 
          value={field.ddtext} 
          onChange={(e) => updateField(idx, 'ddtext', e.target.value)}
          className="w-full p-1 bg-white border border-transparent focus:border-blue-500 rounded-sm outline-none text-sm text-gray-900"
        />
      </td>
      <td className="p-1 text-center">
        <button 
          onClick={() => removeField(idx)} 
          disabled={disableDelete}
          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Delete row"
        >
          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </td>
    </tr>
  );
});
FieldRow.displayName = 'FieldRow';

export default function SE11() {
  // Global mapping
  const { setTitle, setSystemMessage, clearSystemMessage, setTcode } = useGui();

  // Mode: initial | display | edit
  const [screenMode, setScreenMode] = useState<'initial' | 'display' | 'edit'>('initial');

  // Input states
  const [targetTable, setTargetTable] = useState('');
  const [selectedRadio, setSelectedRadio] = useState('database');

  // Builder States
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    setTcode('SE11');
    setTitle('ABAP Dictionary: Initial Screen');
    return () => clearSystemMessage();
  }, [setTitle, clearSystemMessage, setTcode]);

  // Initial Screen Actions
  const handleAction = async (action: 'display' | 'change' | 'create') => {
    if (selectedRadio !== 'database') {
      setSystemMessage(`E: Maintenance for object type '${selectedRadio}' not yet strictly integrated.`, 'E');
      return;
    }
    if (!targetTable) {
      setSystemMessage('E: Specify an object name.', 'E');
      return;
    }
    clearSystemMessage();

    if (action === 'create') {
       setTitle(`Dictionary: Maintain Table ${targetTable}`);
       setFields([{ fieldname: 'MANDT', datatype: 'CHAR', leng: 3, decimals: 0, keyflag: true, ddtext: 'Client' }]);
       setDescription('');
       setScreenMode('edit');
       return;
    }

    setSystemMessage('I: Loading metadata...', 'I');
    try {
      const res = await fetch(`/api/se11?tabname=${targetTable}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFields(data.fields.map((f: any) => ({
         fieldname: f.FIELDNAME,
         datatype: f.DATATYPE,
         leng: f.LENG,
         decimals: f.DECIMALS,
         keyflag: f.KEYFLAG,
         ddtext: f.DDTEXT
      })));
      setDescription(`Configuration view for ${targetTable}`);
      setScreenMode(action === 'display' ? 'display' : 'edit');
      setTitle(`Dictionary: ${action === 'display' ? 'Display' : 'Maintain'} Table ${targetTable}`);
      setSystemMessage('S: Metadata parsed successfully.', 'S');
    } catch (err: any) {
      setSystemMessage(err.message, 'E');
    }
  };

  // Builder Actions
  const handleActivate = async () => {
    if (!targetTable) return;
    setBuilding(true);
    setSystemMessage('I: Activating definitions in persistent map...', 'I');
    try {
      const response = await fetch('/api/se11', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabname: targetTable, description, fields }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSystemMessage(`S: Object ${targetTable} activated.`, 'S');
      setScreenMode('display'); // Lock back into display mode post-activation
      setTitle(`Dictionary: Display Table ${targetTable}`);
    } catch (err: any) {
      setSystemMessage(err.message.startsWith('E:') ? err.message : `E: ${err.message}`, 'E');
    } finally {
      setBuilding(false);
    }
  };

  const addField = useCallback(() => setFields(prev => [...prev, { fieldname: '', datatype: 'CHAR', leng: 10, decimals: 0, keyflag: false, ddtext: '' }]), []);
  const updateField = useCallback((index: number, key: string, value: any) => setFields(prev => { const arr = [...prev]; arr[index][key] = value; return arr; }), []);
  const removeField = useCallback((index: number) => setFields(prev => prev.filter((_, i) => i !== index)), []);

  if (screenMode !== 'initial') {
    const isDisplay = screenMode === 'display';
    return (
      <div className="flex flex-col h-full bg-[#F3F6F9] font-sans">
        <div className="bg-[#F3F6F9] border-b border-gray-300 px-3 py-1 flex items-center shadow-sm w-full -mt-2 space-x-2">
           {!isDisplay && (
             <button onClick={handleActivate} disabled={building} className="flex items-center space-x-1.5 hover:bg-gray-200 px-2 py-1 rounded text-gray-800 transition-colors focus:bg-gray-300 disabled:opacity-50">
               <svg className="w-4 h-4 text-[#C16200]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
               <span className="font-semibold text-[12px]">{building ? 'Activating...' : 'Activate'}</span>
             </button>
           )}
           <button onClick={() => { setScreenMode('initial'); setTitle('ABAP Dictionary: Initial Screen'); }} className="flex items-center space-x-1.5 hover:bg-gray-200 px-2 py-1 rounded text-gray-800 transition-colors focus:bg-gray-300">
             <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21v-2z"/></svg>
             <span className="font-semibold text-[12px]">Back</span>
           </button>
        </div>
        <div className="p-4 w-full h-full overflow-auto text-sm">
           <div className="bg-white border border-gray-300 shadow-sm mb-4">
             <div className="px-3 py-1 border-b border-gray-200 bg-[#E8EBEE] text-gray-800 text-[11px] font-bold tracking-wide uppercase">Table Attributes</div>
             <div className="p-4 grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[12px] font-medium text-gray-600 mb-1 block">Short Description</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} disabled={isDisplay} className="w-full border border-gray-400 px-2 py-1 outline-none text-[13px] focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
               </div>
             </div>
           </div>

           <div className="bg-white border border-gray-300 shadow-sm">
             <div className="px-3 py-1 border-b border-gray-200 bg-[#E8EBEE] flex justify-between items-center text-gray-800 text-[11px] font-bold tracking-wide uppercase">
               <span>Fields</span>
               {!isDisplay && <button onClick={addField} className="text-blue-700 hover:text-blue-900">+ Append</button>}
             </div>
             <table className="w-full text-left border-collapse">
               <thead className="bg-[#F8F9FA] border-b border-gray-300">
                  <tr>
                    <th className="p-2 text-[11px] w-12 text-center text-gray-700 border-r border-gray-300">Key</th>
                    <th className="p-2 text-[11px] w-64 text-gray-700 border-r border-gray-300">Field</th>
                    <th className="p-2 text-[11px] w-32 text-gray-700 border-r border-gray-300">Type</th>
                    <th className="p-2 text-[11px] w-20 text-gray-700 border-r border-gray-300">Length</th>
                    <th className="p-2 text-[11px] w-20 text-gray-700 border-r border-gray-300">Dec</th>
                    <th className="p-2 text-[11px] text-gray-700 border-r border-gray-300">Short Description</th>
                    {!isDisplay && <th className="p-2 text-[11px] w-12">Del</th>}
                  </tr>
               </thead>
               <tbody className={`divide-y divide-gray-200 ${isDisplay ? 'opacity-80 pointer-events-none' : ''}`}>
                 {fields.map((field, idx) => (
                   <FieldRow key={idx} idx={idx} field={field} updateField={updateField} removeField={removeField} disableDelete={fields.length === 1} />
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  }

  // Initial Screen (Matches the Graphic)
  return (
    <div className="bg-[#F3F6F9] h-full flex flex-col font-sans">
      
      {/* Main Form Block */}
      <div className="flex-1 px-4 py-6 text-sm text-gray-800">
         
         {/* Container mimicking SAP flat window lines */}
         <div className="max-w-[700px]">
            
            {/* Form list mapping precisely to the supplied image */}
            <div className="flex flex-col space-y-2 mb-8 border-b border-gray-300 pb-6">
              
              {/* Database Table Row (Currently Supported) */}
              <div className="flex items-center">
                 <div className="w-[180px] flex items-center space-x-2">
                   <input 
                     type="radio" 
                     id="database" 
                     checked={selectedRadio === 'database'} 
                     onChange={() => setSelectedRadio('database')}
                     className="w-3.5 h-3.5 text-blue-600 disabled:opacity-50"
                   />
                   <label htmlFor="database" className="text-[13px] cursor-pointer hover:underline text-gray-900">Database table</label>
                 </div>
                 <div className="flex-1 flex items-center">
                   <input 
                      type="text" 
                      value={selectedRadio === 'database' ? targetTable : ''}
                      onChange={(e) => setTargetTable(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                      disabled={selectedRadio !== 'database'}
                      autoFocus
                      className={`w-[220px] border border-gray-400 px-2 py-0.5 text-[13px] font-mono uppercase bg-[#FFFCEB] outline-none shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-blue-600 disabled:bg-gray-100 disabled:shadow-none`}
                   />
                 </div>
              </div>

              {/* View Row */}
              <div className="flex items-center">
                 <div className="w-[180px] flex items-center space-x-2">
                   <input 
                     type="radio" 
                     id="view" 
                     checked={selectedRadio === 'view'} 
                     onChange={() => setSelectedRadio('view')}
                     className="w-3.5 h-3.5 text-gray-500"
                   />
                   <label htmlFor="view" className="text-[13px] cursor-pointer hover:underline text-gray-900">View</label>
                 </div>
                 <div className="flex-1 flex items-center">
                   <input 
                      type="text" 
                      disabled={selectedRadio !== 'view'}
                      className="w-[220px] bg-white border border-gray-300 px-2 py-0.5 disabled:bg-transparent disabled:border-gray-200"
                   />
                 </div>
              </div>

              {/* Gap native to the spacing structure in the image */}
              <div className="mt-4 mb-2 flex items-center">
                 <div className="w-[180px] flex items-center space-x-2">
                   <input 
                     type="radio" 
                     id="datatype" 
                     checked={selectedRadio === 'datatype'} 
                     onChange={() => setSelectedRadio('datatype')}
                     className="w-3.5 h-3.5 text-gray-500"
                   />
                   <label htmlFor="datatype" className="text-[13px] cursor-pointer hover:underline text-gray-900">Data type</label>
                 </div>
                 <div className="flex-1 flex items-center">
                   <input 
                      type="text" 
                      disabled={selectedRadio !== 'datatype'}
                      className="w-[400px] bg-white border border-gray-300 px-2 py-0.5 disabled:bg-transparent disabled:border-gray-200"
                   />
                 </div>
              </div>
              <div className="flex items-center">
                 <div className="w-[180px] flex items-center space-x-2">
                   <input 
                     type="radio" 
                     id="typegroup" 
                     checked={selectedRadio === 'typegroup'} 
                     onChange={() => setSelectedRadio('typegroup')}
                     className="w-3.5 h-3.5 text-gray-500"
                   />
                   <label htmlFor="typegroup" className="text-[13px] cursor-pointer hover:underline text-gray-900">Type Group</label>
                 </div>
                 <div className="flex-1 flex items-center">
                   <input 
                      type="text" 
                      disabled={selectedRadio !== 'typegroup'}
                      className="w-[80px] bg-white border border-gray-300 px-2 py-0.5 disabled:bg-transparent disabled:border-gray-200"
                   />
                 </div>
              </div>

              {/* Final Block Gap */}
              <div className="mt-4 mb-2 flex items-center">
                 <div className="w-[180px] flex items-center space-x-2">
                   <input 
                     type="radio" 
                     id="domain" 
                     checked={selectedRadio === 'domain'} 
                     onChange={() => setSelectedRadio('domain')}
                     className="w-3.5 h-3.5 text-gray-500"
                   />
                   <label htmlFor="domain" className="text-[13px] cursor-pointer hover:underline text-gray-900">Domain</label>
                 </div>
                 <div className="flex-1 flex items-center">
                   <input 
                      type="text" 
                      disabled={selectedRadio !== 'domain'}
                      className="w-[400px] bg-white border border-gray-300 px-2 py-0.5 disabled:bg-transparent disabled:border-gray-200"
                   />
                 </div>
              </div>
              <div className="flex items-center">
                 <div className="w-[180px] flex items-center space-x-2">
                   <input 
                     type="radio" 
                     id="searchhelp" 
                     checked={selectedRadio === 'searchhelp'} 
                     onChange={() => setSelectedRadio('searchhelp')}
                     className="w-3.5 h-3.5 text-gray-500"
                   />
                   <label htmlFor="searchhelp" className="text-[13px] cursor-pointer hover:underline text-gray-900">Search help</label>
                 </div>
                 <div className="flex-1 flex items-center">
                   <input 
                      type="text" 
                      disabled={selectedRadio !== 'searchhelp'}
                      className="w-[400px] bg-white border border-gray-300 px-2 py-0.5 disabled:bg-transparent disabled:border-gray-200"
                   />
                 </div>
              </div>
              <div className="flex items-center">
                 <div className="w-[180px] flex items-center space-x-2">
                   <input 
                     type="radio" 
                     id="lockobject" 
                     checked={selectedRadio === 'lockobject'} 
                     onChange={() => setSelectedRadio('lockobject')}
                     className="w-3.5 h-3.5 text-gray-500"
                   />
                   <label htmlFor="lockobject" className="text-[13px] cursor-pointer hover:underline text-gray-900">Lock object</label>
                 </div>
                 <div className="flex-1 flex items-center">
                   <input 
                      type="text" 
                      disabled={selectedRadio !== 'lockobject'}
                      className="w-[220px] bg-white border border-gray-300 px-2 py-0.5 disabled:bg-transparent disabled:border-gray-200"
                   />
                 </div>
              </div>

            </div>

            {/* Bottom Action Ribbon */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleAction('display')}
                className="w-[140px] h-[26px] bg-gradient-to-b from-[#F2EDBE] to-[#DECCA1] border border-gray-400 shadow-sm rounded-sm text-[12px] text-black font-semibold hover:border-blue-600 transition-colors flex items-center px-2"
              >
                 <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                 <span className="flex-1 text-center pr-4">Display</span>
              </button>

              <button 
                onClick={() => handleAction('change')}
                className="w-[140px] h-[26px] bg-gradient-to-b from-[#F2EDBE] to-[#DECCA1] border border-gray-400 shadow-sm rounded-sm text-[12px] text-black font-semibold hover:border-blue-600 transition-colors flex items-center px-2"
              >
                 <svg className="w-3.5 h-3.5 mr-2 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                 <span className="flex-1 text-center pr-4">Change</span>
              </button>

              <button 
                onClick={() => handleAction('create')}
                className="w-[140px] h-[26px] bg-gradient-to-b from-[#F2EDBE] to-[#DECCA1] border border-gray-400 shadow-sm rounded-sm text-[12px] text-black font-semibold hover:border-blue-600 transition-colors flex items-center px-2"
              >
                 <svg className="w-3.5 h-3.5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                 <span className="flex-1 text-center pr-4">Create</span>
              </button>
            </div>

         </div>
      </div>

    </div>
  );
}
