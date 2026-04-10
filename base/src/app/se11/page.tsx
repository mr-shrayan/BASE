'use client';

import { useState, useCallback, memo } from 'react';

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
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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
      setStatus('E: Table name is required.');
      return;
    }
    
    setLoading(true);
    setStatus('I: Generating database objects...');

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
        setStatus(`E: ${data.error}`);
      } else {
        setStatus(`S: Database table ${tabname.toUpperCase()} activated successfully.`);
        // Note: Could navigate automatically, but BASE usually stays on page after activation success.
      }
    } catch (err: any) {
      setStatus(`E: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-6 text-sm">
      
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Ribbon */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-light text-gray-800 tracking-tight">Data Dictionary</h1>
            <p className="text-gray-500 text-xs mt-1 font-medium">SE11 • Table Configuration & Activation</p>
          </div>
          <div>
            <button 
              onClick={handleActivate} 
              disabled={loading} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center space-x-2 shadow-sm transition-all disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Activating Object...' : 'Activate System Table'}</span>
              {!loading && (
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              )}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`p-4 rounded-lg border text-sm flex items-start space-x-3 
            ${status.startsWith('E:') ? 'bg-red-50 border-red-200 text-red-700' : 
              status.startsWith('S:') ? 'bg-green-50 border-green-200 text-green-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'} transition-all`}
          >
            {status.startsWith('E:') && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            {status.startsWith('S:') && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            <span className="font-medium">{status.substring(3)}</span>
          </div>
        )}

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
