
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setState(prev => ({
            ...prev,
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error) {
          localStorage.removeItem('auth_token');
          setState(prev => ({
            ...prev,
            token: null,
            isLoading: false,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { token, user } = await authService.login(credentials);
      
      localStorage.setItem('auth_token', token);
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await authService.register(credentials);
      
      // After successful registration, log the user in
      const { token, user } = await authService.login(credentials);
      
      localStorage.setItem('auth_token', token);
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      toast({
        title: "Registration successful",
        description: "Welcome to Book Arbitrage Intelligence!",
      });

      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
