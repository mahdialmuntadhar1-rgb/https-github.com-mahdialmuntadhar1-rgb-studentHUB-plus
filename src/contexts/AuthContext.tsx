import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../lib/api';
import type { RafidUser } from '../lib/api';

interface SimpleUser {
  id: string;
  email: string;
}

interface AuthContextType {
  session: { access_token: string } | null;
  user: SimpleUser | null;
  profile: RafidUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAuthData: (token: string, user: RafidUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [profile, setProfile] = useState<RafidUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    const stored = api.getStoredUser();
    if (token && stored) {
      setUser({ id: stored.id, email: stored.email });
      setProfile(stored);
    }
    setIsLoading(false);
  }, []);

  const setAuthData = useCallback((token: string, userData: RafidUser) => {
    localStorage.setItem('rafid_token', token);
    localStorage.setItem('rafid_user', JSON.stringify(userData));
    setUser({ id: userData.id, email: userData.email });
    setProfile(userData);
  }, []);

  const signOut = async () => {
    api.clearAuth();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const fresh = await api.getMe();
      setProfile(fresh);
      setUser({ id: fresh.id, email: fresh.email });
      localStorage.setItem('rafid_user', JSON.stringify(fresh));
    } catch {
      await signOut();
    }
  };

  const token = api.getToken();
  const session = token ? { access_token: token } : null;

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut, refreshProfile, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
