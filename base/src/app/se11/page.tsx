'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { useGui } from '@/context/GuiContext';

// Extracted and Memoized row component for extreme performance 
// Prevents all 100+ rows from re-rendering every time the user types in a single input box.
const FieldRow = memo(({ field, idx, updateField, removeField, disableDelete }: any) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="p-3 text-center">
        <input 
          type="checkbox" 
          checked={field.keyflag} 
          onChange={(e) => updateField(idx, 'keyflag', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="p-3">
        <input 
          type="text" 
          value={field.fieldname} 
          onChange={(e) => updateField(idx, 'fieldname', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
          className="w-full p-2 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded outline-none uppercase font-mono text-sm transition-all"
          placeholder="FIELD_NAME"
        />
      </td>
      <td className="p-3">
        <select 
          value={field.datatype} 
          onChange={(e) => updateField(idx, 'datatype', e.target.value)}
          className="w-full p-2 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded outline-none text-sm transition-all cursor-pointer"
        >
          <option value="CHAR">CHAR (String)</option>
          <option value="VARCHAR">VARCHAR (Long Text)</option>
          <option value="NUMC">NUMC (Numeric Text)</option>
          <option value="DATS">DATS (Date)</option>
          <option value="CURR">CURR (Currency)</option>
          <option value="QUAN">QUAN (Quantity)</option>
          <option value="INT">INT (Integer)</option>
        </select>
      </td>
      <td className="p-3">
        <input 
          type="number" 
          value={field.leng || ''} 
          onChange={(e) => updateField(idx, 'leng', parseInt(e.target.value))} 
          placeholder="Len"
          className="w-full p-2 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded outline-none text-sm transition-all"
          disabled={['DATS', 'INT'].includes(field.datatype)}
        />
      </td>
      <td className="p-3">
        <input 
          type="number" 
          value={field.decimals || ''} 
          onChange={(e) => updateField(idx, 'decimals', parseInt(e.target.value))}
          placeholder="Dec"
          className="w-full p-2 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded outline-none text-sm transition-all"
          disabled={!['CURR', 'QUAN'].includes(field.datatype)} 
        />
      </td>
      <td className="p-3">
        <input 
          type="text" 
          value={field.ddtext} 
          onChange={(e) => updateField(idx, 'ddtext', e.target.value)}
          placeholder="Short Description"
          className="w-full p-2 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded outline-none text-sm transition-all"
        />
      </td>
      <td className="p-3 text-center">
        <button 
          onClick={() => removeField(idx)} 
          disabled={disableDelete}
          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </td>
    </tr>
  );
});
FieldRow.displayName = 'FieldRow';

export default function SE11() {
  const [tabname, setTabname] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([
    { fieldname: 'MANDT', datatype: 'CHAR', leng: 3, decimals: 0, keyflag: true, ddtext: 'Client' },
  ]);
  const [loading, setLoading] = useState(false);
  const { setTitle, setSystemMessage, clearSystemMessage } = useGui();

  useEffect(() => {
    setTitle('Data Dictionary: Initial Screen');
    return () => clearSystemMessage();
  }, [setTitle, clearSystemMessage]);

  const addField = useCallback(() => {
    setFields(prev => [...prev, { fieldname: '', datatype: 'CHAR', leng: 10, decimals: 0, keyflag: false, ddtext: '' }]);
  }, []);

  const updateField = useCallback((index: number, key: string, value: any) => {
    setFields(prev => {
      const newFields = [...prev];
      (newFields[index] as any)[key] = value;
      return newFields;
    });
  }, []);

  const removeField = useCallback((index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleActivate = async () => {
    if (!tabname) {
      setSystemMessage('Table name is required.', 'E');
      return;
    }
    
    setLoading(true);
    setSystemMessage('Generating database objects...', 'I');

    try {
      const response = await fetch('/api/se11', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tabname, description, fields }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSystemMessage(data.error.substring(3), 'E');
      } else {
        setSystemMessage(`Database table ${tabname.toUpperCase()} activated successfully.`, 'S');
      }
    } catch (err: any) {
      setSystemMessage(err.message, 'E');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent text-gray-800 font-sans p-4 text-sm max-w-6xl mx-auto">
      
      <div className="space-y-4">
        
        <div className="flex justify-end mb-2">
            <button 
              onClick={handleActivate} 
              disabled={loading} 
              className="px-4 py-1.5 bg-[#0070F2] hover:bg-[#005CC6] text-white font-medium rounded flex items-center shadow-sm disabled:opacity-50 transition-colors"
            >
              <span>{loading ? 'Activating...' : 'Activate System Table'}</span>
            </button>
        </div>

        {/* Master Data Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-700 font-semibold uppercase tracking-wider text-xs">Table Attributes</h2>
          </div>
          <div className="p-6 grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 md:col-span-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Database Table Name</label>
              <input 
                type="text" 
                value={tabname}
                onChange={(e) => setTabname(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                maxLength={30}
                placeholder="e.g. T001"
                className="w-full p-2.5 border border-gray-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-mono text-gray-800"
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Short Description</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Company Codes"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Fields Card (ALV Style) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-gray-700 font-semibold uppercase tracking-wider text-xs">Fields Configuration</h2>
            <button onClick={addField} className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Append Row
            </button>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold w-16 text-center">Key</th>
                  <th className="p-4 font-semibold w-64 text-gray-800">Field Name</th>
                  <th className="p-4 font-semibold w-40 text-gray-800">Data Type</th>
                  <th className="p-4 font-semibold w-32 text-gray-800">Length</th>
                  <th className="p-4 font-semibold w-32 text-gray-800">Decimals</th>
                  <th className="p-4 font-semibold text-gray-800">Description</th>
                  <th className="p-4 font-semibold w-16 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field, idx) => (
                  <FieldRow 
                    key={idx} 
                    idx={idx} 
                    field={field} 
                    updateField={updateField} 
                    removeField={removeField} 
                    disableDelete={fields.length === 1} 
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-center">
             <button onClick={addField} className="text-gray-500 hover:text-gray-800 text-xs font-semibold uppercase tracking-wider transition-colors py-1 px-4 border border-transparent hover:border-gray-300 rounded-md">
               + Add Field
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
