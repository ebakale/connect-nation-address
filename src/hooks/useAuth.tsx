import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

const AUTH_TOKEN_KEY = 'sb-calegudnfdbeznyiebbh-auth-token';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, phoneNumber: string, nationalIdType: string, nationalId: string, dateOfBirth: string, nationality: string, preferredLanguage: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ensure session is cleared when window is closed or page is hidden on dashboard
    const handleBeforeUnload = () => {
      if (window.location.pathname.includes('/dashboard')) {
        try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && window.location.pathname.includes('/dashboard')) {
        try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string,
    lastName: string,
    phoneNumber: string,
    nationalIdType: string,
    nationalId: string,
    dateOfBirth: string,
    nationality: string,
    preferredLanguage: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          phone: phoneNumber,
          national_id_type: nationalIdType,
          national_id: nationalId,
          date_of_birth: dateOfBirth,
          nationality: nationality,
          preferred_language: preferredLanguage
        }
      }
    });

    if (error) {
      toast.error("Sign Up Error: " + error.message);
    } else {
      toast.success("Please check your email to confirm your account.");
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please check your credentials and try again.");
      } else if (error.message.includes('Email not confirmed')) {
        toast.error("Please confirm your email address before signing in. Check your inbox for the confirmation link.");
      } else if (error.message.includes('User not found')) {
        toast.error("No account found with this email address. Please sign up first.");
      } else {
        toast.error("Sign In Error: " + error.message);
      }
    } else {
      toast.success("Successfully signed in!");
    }

    return { error };
  };

  const signOut = async () => {
    try {
      // Revoke refresh token and clear current session
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error: any) {
      if (!/auth session missing/i.test(error?.message) && !/session_not_found/i.test(error?.message)) {
        toast.error("Sign Out Error: " + (error?.message ?? 'Unknown error'));
      }
    } finally {
      // Hard clear local token to prevent auto re-login
      try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
      window.location.href = '/';
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`
      }
    });

    if (error) {
      toast.error("Google Sign In Error: " + error.message);
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`
    });

    if (error) {
      toast.error("Password Reset Error: " + error.message);
    } else {
      toast.success("Password reset instructions sent to your email.");
    }

    return { error };
  };
  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};