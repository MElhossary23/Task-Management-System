import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/users/me');
        const currentUser = response.data.user;
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const setAuthData = (authToken, authUser) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    const { token: newToken, user: newUser } = response.data;
    setAuthData(newToken, newUser);
    return response.data;
  };

  const login = async (formData) => {
    const response = await api.post('/auth/login', formData);
    const { token: newToken, user: newUser } = response.data;
    setAuthData(newToken, newUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
