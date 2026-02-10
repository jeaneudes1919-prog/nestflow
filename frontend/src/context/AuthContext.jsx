import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); 

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (token && storedUser) {
        setUser(storedUser);
        fetchUnreadCount(); 
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Fonction pour récupérer le total des messages non lus
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/inbox');
      const total = res.data.reduce((acc, conv) => acc + parseInt(conv.unread_count || 0), 0);
      setUnreadCount(total);
    } catch (error) {
      console.error("Erreur calcul notifications");
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    fetchUnreadCount();
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data; // Ajout du return pour gérer la redirection après inscription
  };

  // --- NOUVEAUTÉ : La fonction magique pour Profile.jsx ---
  const updateUser = (updatedUserData) => {
    // 1. On met à jour le localStorage pour que les changements persistent au refresh
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    // 2. On met à jour le state pour que l'UI (Navbar, etc.) réagisse immédiatement
    setUser(updatedUserData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUnreadCount(0);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      updateUser, // <--- On expose cette fonction pour simplifier ton Profile.jsx
      login, 
      register, 
      logout, 
      loading, 
      unreadCount, 
      fetchUnreadCount 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};