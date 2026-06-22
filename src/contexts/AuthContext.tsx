import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  setAuthData: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('Talaba_token') || localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('Talaba_auth_user');
    const loggedIn = localStorage.getItem('Talaba_logged_in');

    if (storedToken && loggedIn === 'true') {
      setToken(storedToken);
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  const setAuthData = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);

    // Set all required localStorage items
    localStorage.setItem('Talaba_token', newToken);
    localStorage.setItem('jamiaati_token', newToken);
    localStorage.setItem('rafid_token', newToken);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('Talaba_logged_in', 'true');
    localStorage.setItem('Talaba_auth_user', JSON.stringify(newUser));
    localStorage.setItem('jamiaati_auth_user', JSON.stringify(newUser));
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('Talaba_user_email', newUser.email);
    localStorage.setItem('jamiaati_user_email', newUser.email);

    if (newUser.role === 'admin') {
      localStorage.setItem('admin_token', newToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Clear all auth-related localStorage items
    localStorage.removeItem('Talaba_token');
    localStorage.removeItem('jamiaati_token');
    localStorage.removeItem('rafid_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('Talaba_logged_in');
    localStorage.removeItem('Talaba_auth_user');
    localStorage.removeItem('jamiaati_auth_user');
    localStorage.removeItem('user');
    localStorage.removeItem('Talaba_user_email');
    localStorage.removeItem('jamiaati_user_email');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
