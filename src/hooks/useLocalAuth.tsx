import React, { useState, useEffect } from 'react';
import { localAuth, LocalSession, LocalUser } from '@/lib/localAuth';
import { toast } from 'sonner';

export const useLocalAuth = () => {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await localAuth.init();
        
        // Seed demo users if this is the first time
        await localAuth.seedDemoUsers();
        
        const currentSession = await localAuth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { unsubscribe } = localAuth.onAuthStateChange((newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role: LocalUser['role'] = 'citizen', profile = {}) => {
    try {
      const { user, error } = await localAuth.signUp(email, password, role, profile);
      if (error) throw error;
      
      toast.success('Account created successfully!');
      return { user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(errorMessage);
      return { user: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { session, error } = await localAuth.signIn(email, password);
      if (error) throw error;
      
      toast.success(`Welcome back, ${session?.user.profile.display_name}!`);
      return { session, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(errorMessage);
      return { session: null, error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await localAuth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      toast.error(errorMessage);
      return { error: error as Error };
    }
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!session
  };
};