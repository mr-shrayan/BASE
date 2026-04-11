'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface UserContext {
  mandt: string;
  username: string;
}

interface AuthContextType {
  user: UserContext | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshContext: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchContext = async () => {
    try {
      const mandt = localStorage.getItem('BASE_CLIENT_MANDT') || '';
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (data.session?.user?.email) {
        const username = data.session.user.email.split('@')[0].toUpperCase();
        setUser({ mandt, username });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth Context Error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();

    // Listen for auth state changes globally (e.g. multi-tab)
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchContext();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Run ONLY once on mount for bootstrapping

  // Strictly isolated Route Guarding
  useEffect(() => {
    if (!loading) {
      if (user && (pathname === '/login' || pathname === '/')) {
        router.replace('/launchpad'); // Boot out of login
      } else if (!user && pathname !== '/login') {
        router.replace('/login'); // Boot back to login
      }
    }
  }, [pathname, user, loading, router]);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('BASE_CLIENT_MANDT');
    localStorage.removeItem('BASE_FIRST_LOGON');
    setUser(null);
    router.push('/login');
  };

  // Provide the context
  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshContext: fetchContext }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to dramatically improve performance across the app
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
