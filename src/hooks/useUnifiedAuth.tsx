import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useLocalAuth } from './useLocalAuth';
import { useOffline } from './useOffline';
import { LocalUser } from '@/lib/localAuth';
import { User } from '@supabase/supabase-js';

interface UnifiedUser {
  id: string;
  email: string;
  profile: {
    display_name?: string;
    full_name?: string;
    badge_number?: string;
    unit?: string;
    rank?: string;
  };
  role?: string;
  isOffline: boolean;
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isOnlineMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | null>(null);

export const UnifiedAuthProvider = ({ children }: { children: ReactNode }) => {
  const { isOnline } = useOffline();
  const onlineAuth = useAuth();
  const offlineAuth = useLocalAuth();
  
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine which mode to use
  const isOnlineMode = isOnline;
  const currentAuth = isOnlineMode ? onlineAuth : offlineAuth;

  // Convert user to unified format
  const convertToUnifiedUser = (
    user: User | LocalUser | null, 
    isOffline: boolean
  ): UnifiedUser | null => {
    if (!user) return null;

    if (isOffline) {
      const localUser = user as LocalUser;
      return {
        id: localUser.id,
        email: localUser.email,
        profile: {
          display_name: localUser.profile?.display_name,
          badge_number: localUser.profile?.badge_number,
          unit: localUser.profile?.unit,
          rank: localUser.profile?.rank,
        },
        role: localUser.role,
        isOffline: true,
      };
    } else {
      const onlineUser = user as User;
      return {
        id: onlineUser.id,
        email: onlineUser.email || '',
        profile: {
          full_name: onlineUser.user_metadata?.full_name,
          display_name: onlineUser.user_metadata?.display_name,
        },
        isOffline: false,
      };
    }
  };

  // Update user when auth state changes
  useEffect(() => {
    const updateUser = () => {
      if (isOnlineMode) {
        const unifiedUser = convertToUnifiedUser(onlineAuth.user, false);
        setUser(unifiedUser);
        setLoading(onlineAuth.loading);
      } else {
        const unifiedUser = convertToUnifiedUser(offlineAuth.user, true);
        setUser(unifiedUser);
        setLoading(offlineAuth.loading);
      }
    };

    updateUser();
  }, [
    isOnlineMode, 
    onlineAuth.user, 
    onlineAuth.loading, 
    offlineAuth.user, 
    offlineAuth.loading
  ]);

  // Handle mode switching
  useEffect(() => {
    const handleModeSwitch = async () => {
      console.log(`Auth mode switched to: ${isOnlineMode ? 'Online' : 'Offline'}`);
      
      // If switching from offline to online and user is authenticated offline
      if (isOnlineMode && offlineAuth.user && !onlineAuth.user) {
        console.log('User authenticated offline, attempting online sync...');
        // Could implement sync logic here if needed
      }
      
      // If switching from online to offline and user is authenticated online
      if (!isOnlineMode && onlineAuth.user && !offlineAuth.user) {
        console.log('User authenticated online, switching to offline mode...');
        // Could cache user data locally here if needed
      }
    };

    handleModeSwitch();
  }, [isOnlineMode]);

  const signIn = async (email: string, password: string) => {
    try {
      if (isOnlineMode) {
        await onlineAuth.signIn(email, password);
        return { error: null };
      } else {
        const result = await offlineAuth.signIn(email, password);
        return { error: result.error };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, role?: string) => {
    try {
      if (isOnlineMode) {
        await onlineAuth.signUp(email, password, fullName);
        return { error: null };
      } else {
        const localRole = role || 'citizen';
        const profile = { display_name: fullName };
        const result = await offlineAuth.signUp(
          email, 
          password, 
          localRole as LocalUser['role'], 
          profile
        );
        return { error: result.error };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      if (isOnlineMode) {
        await onlineAuth.signOut();
        return { error: null };
      } else {
        const result = await offlineAuth.signOut();
        return { error: result.error };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value: UnifiedAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    isOnlineMode,
    signIn,
    signUp,
    signOut,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};