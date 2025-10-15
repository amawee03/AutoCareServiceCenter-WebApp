import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiClient.get('/api/auth/profile');
      
      if (response.status === 200 && response.data) {
        console.log('✅ User authenticated:', response.data.email);
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      // 401 is expected when not logged in - don't log as error
      if (error.response?.status === 401) {
        console.log('ℹ️ No active session - user not logged in');
      } else {
        console.error('❌ Auth check failed:', error.message);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    console.log('✅ User logged in:', userData.email);
    setUser(userData);
    setIsLoading(false);
    
    // Verify the session is valid by checking profile
    try {
      const profileResponse = await apiClient.get('/api/auth/profile');
      if (profileResponse.status === 200) {
        console.log('✅ Session verified successfully');
        setUser(profileResponse.data);
        return profileResponse.data;
      }
    } catch (error) {
      console.warn('⚠️ Session verification failed, using login data');
      // If profile check fails, still use the provided userData
    }
    
    return userData;
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuth // Expose checkAuth for manual refresh
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;