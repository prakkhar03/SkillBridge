import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, clearTokens } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = getToken();
    console.log('AuthContext: Checking for existing token:', token ? 'Found' : 'Not found');
    
    if (token) {
      // You can validate the token here or fetch user data
      setIsAuthenticated(true);
      // For now, we'll just set a basic user object
      setUser({ isAuthenticated: true });
      console.log('AuthContext: User authenticated from existing token');
    } else {
      console.log('AuthContext: No token found, user not authenticated');
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
    console.log('AuthContext: Initial loading complete');
  }, []);

  const login = (userData) => {
    console.log('AuthContext: Login called with userData:', userData);
    
    // Update both states synchronously
    setUser(userData);
    setIsAuthenticated(true);
    
    console.log('AuthContext: Authentication state updated - isAuthenticated:', true, 'user:', userData);
    
    // Force a re-render and ensure state is properly set
    setTimeout(() => {
      console.log('AuthContext: Forcing re-render after login');
      setIsAuthenticated(true);
      setUser(userData);
    }, 100);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearTokens();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
