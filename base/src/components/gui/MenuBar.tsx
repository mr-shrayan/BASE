'use client';

import { useAuth } from '@/context/AuthContext';

export default function MenuBar() {
  const { user, logout } = useAuth();
  
  // Do not render if not authenticated
  if (!user) return null;

  return (
    <div className="h-6 bg-[#E8EBEE] flex items-center px-1 border-b border-gray-300 text-[11px] font-medium text-gray-700 select-none z-50">
      <div className="flex space-x-0.5">
        
        <div className="relative group">
          <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm block">Menu</span>
          <div className="absolute hidden group-hover:block bg-[#F3F6F9] border border-gray-300 shadow-lg mt-0 py-1 w-36 left-0 text-gray-800">
            <div className="px-5 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">User menu</div>
            <div className="px-5 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">SAP menu</div>
          </div>
        </div>

        <div className="relative group">
          <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm block">Edit</span>
          <div className="absolute hidden group-hover:block bg-[#F3F6F9] border border-gray-300 shadow-lg mt-0 py-1 w-40 left-0 text-gray-800">
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer flex justify-between"><span>Execute</span> <span className="opacity-60">F8</span></div>
            <hr className="my-1 border-gray-300" />
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer flex justify-between"><span>Cancel</span> <span className="opacity-60">F12</span></div>
          </div>
        </div>

        <div className="relative group">
          <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm block">Favorites</span>
          <div className="absolute hidden group-hover:block bg-[#F3F6F9] border border-gray-300 shadow-lg mt-0 py-1 w-48 left-0 text-gray-800">
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">Add</div>
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">Change</div>
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">Delete</div>
            <hr className="my-1 border-gray-300" />
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">Insert folder</div>
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">Insert transaction</div>
          </div>
        </div>

        <div className="relative group">
          <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm block">Extras</span>
          <div className="absolute hidden group-hover:block bg-[#F3F6F9] border border-gray-300 shadow-lg mt-0 py-1 w-48 left-0 text-gray-800">
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400 text-xs">Settings</div>
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400 text-xs">Technical details</div>
          </div>
        </div>
        
        <div className="relative group">
          <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm block">System</span>
          <div className="absolute hidden group-hover:block bg-[#F3F6F9] border border-gray-300 shadow-lg mt-0 py-1 w-44 left-0 text-gray-800">
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400 flex justify-between"><span>New GUI window</span></div>
            <hr className="my-1 border-gray-300" />
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer flex justify-between" onClick={logout}><span>Log off</span><span className="opacity-60 text-[10px]">/NEX</span></div>
          </div>
        </div>

        <div className="relative group">
          <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm block">Help</span>
          <div className="absolute hidden group-hover:block bg-[#F3F6F9] border border-gray-300 shadow-lg mt-0 py-1 w-32 left-0 text-gray-800">
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">Application Help</div>
            <div className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-400">SAP Library</div>
          </div>
        </div>

      </div>
    </div>
  );
}
