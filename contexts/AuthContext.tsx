
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';


interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (name: string, email: string) => Promise<void>; // Simplified login
  logout: () => void;
  register: (name: string, email: string) => Promise<void>; // Simplified register
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (name: string, email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const user: User = { id: Date.now().toString(), name, email };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoading(false);
    // Redirect to dashboard or intended page
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  }, [navigate, location.state]);

  const register = useCallback(async (name: string, email: string) => {
    setIsLoading(true);
    // Simulate API call, check for existing user (mock)
    await new Promise(resolve => setTimeout(resolve, 500));
    // For MVP, we assume registration is always successful if email is not 'taken@example.com'
    if (email === 'taken@example.com') {
        setIsLoading(false);
        throw new Error("Email já cadastrado.");
    }
    const user: User = { id: Date.now().toString(), name, email };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoading(false);
    navigate('/dashboard', { replace: true });
  }, [navigate]);


  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
    