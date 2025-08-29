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

      const password_hash = await this.hashPassword(password);
      if (user.password_hash !== password_hash) {
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