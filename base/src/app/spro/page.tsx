'use client';

import { useState, useEffect } from 'react';
import { useGui } from '@/context/GuiContext';
import { useRouter } from 'next/navigation';

// Static Configuration Tree
const imgNodes = [
  {
    id: 'es',
    label: 'Enterprise Structure',
    type: 'folder',
    children: [
      {
        id: 'es_def',
        label: 'Definition',
        type: 'folder',
        children: [
          {
            id: 'es_def_fi',
            label: 'Financial Accounting',
            type: 'folder',
            children: [
              { id: 'T001', label: 'Define Company', type: 'activity', tabname: 'T001' },
              { id: 'T001B', label: 'Define Credit Control Area', type: 'activity', tabname: 'T001B' },
            ]
          },
          {
            id: 'es_def_log',
            label: 'Logistics - General',
            type: 'folder',
            children: [
              { id: 'T001W', label: 'Define Plant', type: 'activity', tabname: 'T001W' },
              { id: 'T001L', label: 'Define Location', type: 'activity', tabname: 'T001L' },
            ]
          },
          {
            id: 'es_def_sd',
            label: 'Sales and Distribution',
            type: 'folder',
            children: [
              { id: 'TVKO', label: 'Define Sales Organization', type: 'activity', tabname: 'TVKO' },
              { id: 'TVTW', label: 'Define Distribution Channel', type: 'activity', tabname: 'TVTW' },
            ]
          }
        ]
      },
      {
        id: 'es_ass',
        label: 'Assignment',
        type: 'folder',
        children: [
          { id: 'T001K', label: 'Assign Plant to Company Code', type: 'activity', tabname: 'T001K' },
          { id: 'TVKO_ASSI', label: 'Assign Sales Org to Company Code', type: 'activity', tabname: 'TVKOZ' }, // typically TVKO has bukrs map, simulating standard config
        ]
      }
    ]
  },
  {
    id: 'bc',
    label: 'Cross-Application Components',
    type: 'folder',
    children: [
      { id: 'T005', label: 'Define Countries', type: 'activity', tabname: 'T005' },
      { id: 'TCURC', label: 'Define Currency Codes', type: 'activity', tabname: 'TCURC' },
      { id: 'T006', label: 'Units of Measurement', type: 'activity', tabname: 'T006' }
    ]
  }
];

const TreeNode = ({ node, level = 0, onExecute }: any) => {
  const [expanded, setExpanded] = useState(level < 2); // Default open first two levels

  const isActivity = node.type === 'activity';

  return (
    <div className="font-sans text-[13px] text-gray-800">
      <div 
        className={`flex items-center py-1 hover:bg-[#F0F4F8] cursor-pointer group ${isActivity ? 'pl-2' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onDoubleClick={() => {
           if (isActivity) onExecute(node.tabname);
           else setExpanded(!expanded);
        }}
      >
        {!isActivity && (
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-black focus:outline-none"
          >
            {expanded ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7z"/></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7z"/></svg>
            )}
          </button>
        )}
        
        {/* Node Icon */}
        <div className="mr-2 opacity-70">
           {isActivity ? (
             <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
           ) : (
             <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>
           )}
        </div>
        
        <span className={`${isActivity ? 'font-medium' : ''} truncate flex-1 group-hover:text-blue-700 transition-colors`}>{node.label}</span>
        
        {/* Execute Button for Activities */}
        {isActivity && (
          <button 
            onClick={(e) => { e.stopPropagation(); onExecute(node.tabname); }}
            className="opacity-0 group-hover:opacity-100 mr-4 text-green-700 hover:bg-green-100 p-1 rounded"
            title="Execute Activity (F8)"
          >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        )}
      </div>
      
      {expanded && node.children && (
        <div className="border-l border-gray-300 ml-[10px]">
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} level={level + 1} onExecute={onExecute} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function SPRO() {
  const { setTitle, setTcode } = useGui();
  const router = useRouter();

  useEffect(() => {
    setTcode('SPRO');
    setTitle('Display IMG');
  }, [setTitle, setTcode]);

  const handleExecute = (tabname: string) => {
    router.push(`/sm30?tabname=${tabname}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* SPRO Toolbar */}
      <div className="bg-[#F3F6F9] border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 shadow-sm z-10">
         <span className="text-xs font-semibold text-gray-700">Structure</span>
      </div>
      
      {/* Target Tree Container */}
      <div className="flex-1 overflow-auto p-4 bg-white">
         <div className="border border-gray-200 inline-block min-w-full p-2 bg-[#FAFBFC] rounded shadow-sm">
            <div className="flex items-center py-1 font-bold text-[13px] text-gray-800 border-b border-gray-300 mb-2 pb-2 pl-1 cursor-default">
               <svg className="w-4 h-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
               SAP Customizing Implementation Guide
            </div>
            
            {imgNodes.map(node => (
              <TreeNode key={node.id} node={node} onExecute={handleExecute} />
            ))}
         </div>
      </div>
    </div>
  );
}
