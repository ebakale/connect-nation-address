// Local Authentication System for Offline Mode
import { offlineStorage } from './offlineStorage';

export interface LocalUser {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'police_officer' | 'emergency_operator' | 'citizen' | 'field_agent' | 'registrar' | 'verifier';
  profile: {
    display_name?: string;
    badge_number?: string;
    unit?: string;
    rank?: string;
    created_at: string;
  };
  created_at: string;
  last_login: string;
}

export interface LocalSession {
  user: LocalUser;
  expires_at: string;
  access_token: string;
}

class LocalAuthManager {
  private currentSession: LocalSession | null = null;
  private listeners: ((session: LocalSession | null) => void)[] = [];

  async init() {
    await offlineStorage.init();
    // Check for existing session
    const session = await this.getStoredSession();
    if (session && new Date(session.expires_at) > new Date()) {
      this.currentSession = session;
    }
  }

  // Sync a Supabase user to local storage
  async syncOnlineUser(
    supabaseUser: any, 
    userProfile?: any, 
    userRole?: string
  ): Promise<{ user: LocalUser | null; error: Error | null }> {
    try {
      // Check if user already exists
      const existingUser = await offlineStorage.getLocalUser(supabaseUser.email);

      const syncedUser: LocalUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        password_hash: existingUser?.password_hash || 'synced_from_online',
        role: this.mapSupabaseRoleToLocal(userRole),
        profile: {
          display_name: userProfile?.full_name || userProfile?.display_name || supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
          badge_number: userProfile?.badge_number,
          unit: userProfile?.unit,
          rank: userProfile?.rank,
          created_at: existingUser?.profile.created_at || new Date().toISOString(),
        },
        created_at: supabaseUser.created_at || new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      // Save or update the user
      await offlineStorage.saveLocalUser(syncedUser);
      console.log(`Synced user ${supabaseUser.email} to offline storage`);
      
      return { user: syncedUser, error: null };
    } catch (error) {
      console.error('Failed to sync online user:', error);
      return { user: null, error: error as Error };
    }
  }

  // Set an offline password for a synced user (must be called while online)
  async setOfflinePassword(email: string, offlinePassword: string): Promise<{ error: Error | null }> {
    try {
      await offlineStorage.init();
      const user = await offlineStorage.getLocalUser(email);
      if (!user) {
        throw new Error('User not found in offline storage');
      }
      user.password_hash = await this.hashPassword(offlinePassword);
      await offlineStorage.saveLocalUser(user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Map Supabase roles to local roles
  private mapSupabaseRoleToLocal(supabaseRole?: string): LocalUser['role'] {
    switch (supabaseRole) {
      case 'admin':
      case 'ndaa_admin':
      case 'police_admin':
        return 'admin';
      case 'police_officer':
      case 'police_operator':
      case 'police_supervisor':
      case 'police_dispatcher':
        return 'police_officer';
      case 'emergency_operator':
        return 'emergency_operator';
      case 'field_agent':
        return 'field_agent';
      case 'registrar':
        return 'registrar';
      case 'verifier':
        return 'verifier';
      case 'citizen':
      default:
        return 'citizen';
    }
  }

  // Check if a user can sign in (either local password or synced from online)
  async canSignIn(email: string, password: string): Promise<boolean> {
    const users = await offlineStorage.get('localUsers') || [];
    const user = users.find((u: LocalUser) => u.email === email);
    
    if (!user) return false;
    
    // Synced users MUST set an offline password before they can sign in offline
    if (user.password_hash === 'synced_from_online') {
      return false;
    }
    
    // Check the actual password hash
    const hashedPassword = await this.hashPassword(password);
    return user.password_hash === hashedPassword;
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateToken(): string {
    return 'local_' + crypto.randomUUID();
  }

  async signUp(email: string, password: string, role: LocalUser['role'] = 'citizen', profile: Partial<LocalUser['profile']> = {}) {
    try {
      await offlineStorage.init();
      
      // Check if user already exists
      const existingUser = await offlineStorage.getLocalUser(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const password_hash = await this.hashPassword(password);
      const user: LocalUser = {
        id: crypto.randomUUID(),
        email,
        password_hash,
        role,
        profile: {
          display_name: profile.display_name || email.split('@')[0],
          badge_number: profile.badge_number,
          unit: profile.unit,
          rank: profile.rank,
          created_at: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      await offlineStorage.saveLocalUser(user);
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      await offlineStorage.init();
      
      const user = await offlineStorage.getLocalUser(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Synced users must set an offline password first
      let validPassword = false;
      if (user.password_hash === 'synced_from_online') {
        throw new Error('Offline password not set. Please sign in online first and set an offline password.');
      } else {
        const password_hash = await this.hashPassword(password);
        validPassword = user.password_hash === password_hash;
      }

      if (!validPassword) {
        throw new Error('Invalid password');
      }

      // Update last login
      user.last_login = new Date().toISOString();
      await offlineStorage.saveLocalUser(user);

      // Create session
      const session: LocalSession = {
        user,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        access_token: this.generateToken()
      };

      await this.storeSession(session);
      this.currentSession = session;
      this.notifyListeners(session);

      return { session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  async signOut() {
    try {
      await offlineStorage.clearSession();
      this.currentSession = null;
      this.notifyListeners(null);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getSession(): Promise<LocalSession | null> {
    if (this.currentSession && new Date(this.currentSession.expires_at) > new Date()) {
      return this.currentSession;
    }
    
    const stored = await this.getStoredSession();
    if (stored && new Date(stored.expires_at) > new Date()) {
      this.currentSession = stored;
      return stored;
    }
    
    return null;
  }

  private async storeSession(session: LocalSession) {
    await offlineStorage.init();
    await offlineStorage.setSessionData(session);
  }

  private async getStoredSession(): Promise<LocalSession | null> {
    await offlineStorage.init();
    return await offlineStorage.getSessionData();
  }

  onAuthStateChange(callback: (session: LocalSession | null) => void) {
    this.listeners.push(callback);
    // Call immediately with current session
    callback(this.currentSession);
    
    return {
      unsubscribe: () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(session: LocalSession | null) {
    this.listeners.forEach(callback => callback(session));
  }

  // Demo users for testing
  async seedDemoUsers() {
    const demoUsers = [
      {
        email: 'admin@police.gq',
        password: 'admin123',
        role: 'admin' as const,
        profile: { display_name: 'System Admin', rank: 'Administrator' }
      },
      {
        email: 'officer@police.gq',
        password: 'officer123',
        role: 'police_officer' as const,
        profile: { display_name: 'Officer Smith', badge_number: 'PO-001', unit: 'Patrol Unit 1', rank: 'Officer' }
      },
      {
        email: 'operator@police.gq',
        password: 'operator123',
        role: 'emergency_operator' as const,
        profile: { display_name: 'Emergency Dispatch', rank: 'Operator' }
      },
      {
        email: 'citizen@demo.gq',
        password: 'citizen123',
        role: 'citizen' as const,
        profile: { display_name: 'John Citizen' }
      }
    ];

    for (const user of demoUsers) {
      try {
        await this.signUp(user.email, user.password, user.role, user.profile);
      } catch (error) {
        console.log(`Demo user ${user.email} already exists`);
      }
    }
  }
}

export const localAuth = new LocalAuthManager();