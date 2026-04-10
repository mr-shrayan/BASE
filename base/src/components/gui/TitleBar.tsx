'use client';

import { useGui } from '@/context/GuiContext';
import { useAuth } from '@/context/AuthContext';

export default function TitleBar() {
  const { title } = useGui();
  const { user, loading } = useAuth();
  
  // Do not render title bar if not authenticated
  if (loading || !user) return null;

  return (
    <div className="h-7 bg-[#2B405B] text-white flex items-center px-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-30 select-none">
      <span className="text-xs font-medium tracking-wide">{title}</span>
    </div>
  );
}
