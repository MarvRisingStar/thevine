import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  username: string | null;
  wallet_address: string | null;
  balance: number;
  total_earned: number;
  tasks_completed: number;
  referral_code: string;
  referred_by: string | null;
  email_verified: boolean;
  current_streak: number;
  last_check_in: string | null;
  last_ad_watch: string | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, referralCode?: string, walletAddress?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ADMIN_EMAIL = 'marvrisingstar@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            const adminStatus = await checkAdminRole(session.user.id);
            setIsAdmin(adminStatus || session.user.email === ADMIN_EMAIL);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          checkAdminRole(session.user.id).then((adminStatus) => {
            setIsAdmin(adminStatus || session.user.email === ADMIN_EMAIL);
            setLoading(false);
          });
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    referralCode?: string,
    walletAddress?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username,
          referred_by: referralCode || null,
          wallet_address: walletAddress || null,
        },
      },
    });

    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });

    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
