import React, { createContext, useContext, useEffect, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfile = (row: Record<string, unknown>): User => ({
  id: String(row.id),
  email: String(row.email),
  full_name: String(row.full_name),
  phone: String(row.phone || ''),
  role: row.role as User['role'],
  is_active: Boolean(row.is_active ?? true),
  department_id: row.department_id ? String(row.department_id) : undefined,
  specialization_id: row.specialization_id ? String(row.specialization_id) : undefined,
  profile_image_url: row.profile_image_url ? String(row.profile_image_url) : undefined,
  created_at: String(row.created_at || new Date().toISOString()),
});

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return mapProfile(data);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      const sid = data.session?.user?.id;
      if (sid && mounted) {
        const profile = await fetchProfile(sid);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    };

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!session?.user) {
          setUser(null);
          return;
        }
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!hasSupabaseConfig) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      throw new Error('Logged in, but no staff profile found. Open /setup and run Prepare Demo Accounts.');
    }
    setUser(profile);
  };

  const register = async (email: string, password: string, fullName: string, role: string) => {
    if (!hasSupabaseConfig) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed');

    const { error: profileError } = await supabase.from('users').upsert({
      id: data.user.id,
      email: email.toLowerCase(),
      full_name: fullName,
      role: role || 'patient',
      is_active: true,
    });
    if (profileError) throw new Error(profileError.message);

    await supabase.auth.signOut();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
