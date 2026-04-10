'use client';

import { useAuth } from '@/context/AuthContext';

export default function MenuBar() {
  const { user } = useAuth();
  
  // Do not render if not authenticated
  if (!user) return null;

  return (
    <div className="h-6 bg-[#E8EBEE] flex items-center px-1 border-b border-gray-300 text-[11px] font-medium text-gray-700 select-none z-50">
      <div className="flex space-x-0.5">
        <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm">Menu</span>
        <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm">Edit</span>
        <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm">Favorites</span>
        <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm">Extras</span>
        <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm">System</span>
        <span className="px-2 py-0.5 hover:bg-gray-300 hover:text-black cursor-pointer rounded-sm">Help</span>
      </div>
    </div>
  );
}
