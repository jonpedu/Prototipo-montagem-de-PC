
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

  const handleAuthSuccessNavigation = () => {
    const navState = location.state as any;
    const fromLocation = navState?.from;
    const pendingActionFromLogin = fromLocation?.state?.pendingAction;
    const originalPath = fromLocation?.pathname || '/dashboard';

    if (pendingActionFromLogin && (originalPath === '/build' || originalPath.startsWith('/build/'))) {
        // If there was a pending action (save/export) and user was on BuildPage
        navigate(originalPath, { replace: true, state: { fromLogin: true, action: pendingActionFromLogin } });
    } else {
        // Default navigation
        navigate(originalPath, { replace: true });
    }
  };

  const login = useCallback(async (nameOrEmail: string, emailOrPassword?: string) => { // Adjusted for flexibility
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Determine actual name and email based on how it's called
    // In current AuthPage, name is not sent for login, email is in 'nameOrEmail', password in 'emailOrPassword'
    // For simplicity, we'll use nameOrEmail as the email if emailOrPassword is provided (login scenario)
    // If only nameOrEmail is provided (potentially registration scenario), it's the name.
    // This is a bit of a hack due to simplified login, ideally login would only take email/password.
    const email = emailOrPassword ? nameOrEmail : 'user@example.com'; // Mock email if not passed explicitly for login
    const name = emailOrPassword ? 'Usuário' : nameOrEmail; // Mock name if only email/pass passed

    const user: User = { id: Date.now().toString(), name, email };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoading(false);
    handleAuthSuccessNavigation();
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
    handleAuthSuccessNavigation();
  }, [navigate, location.state]);


  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('proceededAnonymously'); // Clear this on logout
    // also clear pending build info if any, though it should be cleared by BuildPage
    sessionStorage.removeItem('pendingBuild'); 
    sessionStorage.removeItem('pendingAiNotes');
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
