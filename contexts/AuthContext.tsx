
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Helper to safely save to localStorage
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        alert('Storage limit reached! Please use smaller images or clear your data.');
        console.error('LocalStorage quota exceeded');
      } else {
        console.error('Storage error:', error);
      }
    }
  };

  useEffect(() => {
    // Check local storage for active session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check for Admin Credentials
    if (email === 'bandarban62@gmail.com' && password === 'Admin12@#') {
      const adminUser: User = {
        id: 'admin-001',
        fullName: 'System Administrator',
        email: email,
        phone: '01000000000',
        age: '30',
        gender: 'other',
        religion: 'other',
        role: 'admin',
        plan: 'vip',
        isIdVerified: true,
        isPhoneVerified: true
      };
      setUser(adminUser);
      saveToStorage('currentUser', adminUser);
      return true;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: User) => u.email === email && u.password === password);
    
    if (foundUser) {
      // Ensure plan exists for legacy users
      const userData = { ...foundUser, role: 'user', plan: foundUser.plan || 'basic' };
      setUser(userData);
      saveToStorage('currentUser', userData);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.some((u: User) => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      role: 'user',
      plan: 'basic', // Default plan
      // Initialize verification states
      isPhoneVerified: false,
      isIdVerified: false,
      isVideoVerified: false,
      // Initialize default privacy settings
      privacy: {
        showEmail: false,
        showPhone: false,
        showPhoto: true,
        isProfilePublic: true
      },
      connectionRequests: [],
      sentRequests: [],
      connections: []
    };

    const updatedUsers = [...users, newUser];
    saveToStorage('users', updatedUsers);
    
    // Auto login after register
    setUser(newUser);
    saveToStorage('currentUser', newUser);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    saveToStorage('currentUser', updatedUser);

    // Update in users array as well
    if (user.role !== 'admin') {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: User) => u.id === user.id ? updatedUser : u);
      saveToStorage('users', updatedUsers);
    }
  };

  const upgradePlan = async (plan: 'basic' | 'premium' | 'vip'): Promise<boolean> => {
    if (!user) return false;
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateProfile({ plan });
    return true;
  };

  // --- Connection Management ---

  const sendConnectionRequest = (targetUserId: string) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Update target user
    const updatedUsers = users.map((u: User) => {
      if (u.id === targetUserId) {
        const requests = u.connectionRequests || [];
        if (!requests.includes(user.id)) {
          return { ...u, connectionRequests: [...requests, user.id] };
        }
      }
      // Update current user in the list
      if (u.id === user.id) {
        const sent = u.sentRequests || [];
        if (!sent.includes(targetUserId)) {
          return { ...u, sentRequests: [...sent, targetUserId] };
        }
      }
      return u;
    });

    saveToStorage('users', updatedUsers);
    
    // Update current user state
    const sent = user.sentRequests || [];
    if (!sent.includes(targetUserId)) {
      const updatedUser = { ...user, sentRequests: [...sent, targetUserId] };
      setUser(updatedUser);
      saveToStorage('currentUser', updatedUser);
    }
  };

  const acceptConnectionRequest = (requesterId: string) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const updatedUsers = users.map((u: User) => {
      // Update Requester: Remove from sentRequests, Add to connections
      if (u.id === requesterId) {
        const sent = u.sentRequests?.filter(id => id !== user.id) || [];
        const conns = u.connections || [];
        return { ...u, sentRequests: sent, connections: [...conns, user.id] };
      }
      // Update Current User (in the list): Remove from connectionRequests, Add to connections
      if (u.id === user.id) {
        const reqs = u.connectionRequests?.filter(id => id !== requesterId) || [];
        const conns = u.connections || [];
        return { ...u, connectionRequests: reqs, connections: [...conns, requesterId] };
      }
      return u;
    });

    saveToStorage('users', updatedUsers);

    // Update current user state
    const reqs = user.connectionRequests?.filter(id => id !== requesterId) || [];
    const conns = user.connections || [];
    const updatedUser = { ...user, connectionRequests: reqs, connections: [...conns, requesterId] };
    setUser(updatedUser);
    saveToStorage('currentUser', updatedUser);
  };

  const rejectConnectionRequest = (requesterId: string) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const updatedUsers = users.map((u: User) => {
      // Update Requester: Remove from sentRequests
      if (u.id === requesterId) {
        const sent = u.sentRequests?.filter(id => id !== user.id) || [];
        return { ...u, sentRequests: sent };
      }
      // Update Current User: Remove from connectionRequests
      if (u.id === user.id) {
        const reqs = u.connectionRequests?.filter(id => id !== requesterId) || [];
        return { ...u, connectionRequests: reqs };
      }
      return u;
    });

    saveToStorage('users', updatedUsers);

    // Update current user state
    const reqs = user.connectionRequests?.filter(id => id !== requesterId) || [];
    const updatedUser = { ...user, connectionRequests: reqs };
    setUser(updatedUser);
    saveToStorage('currentUser', updatedUser);
  };

  const removeConnection = (partnerId: string) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const updatedUsers = users.map((u: User) => {
      // Remove from partner
      if (u.id === partnerId) {
        const conns = u.connections?.filter(id => id !== user.id) || [];
        return { ...u, connections: conns };
      }
      // Remove from me
      if (u.id === user.id) {
        const conns = u.connections?.filter(id => id !== partnerId) || [];
        return { ...u, connections: conns };
      }
      return u;
    });

    saveToStorage('users', updatedUsers);

    // Update current user state
    const conns = user.connections?.filter(id => id !== partnerId) || [];
    const updatedUser = { ...user, connections: conns };
    setUser(updatedUser);
    saveToStorage('currentUser', updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateProfile,
      upgradePlan,
      sendConnectionRequest,
      acceptConnectionRequest,
      rejectConnectionRequest,
      removeConnection,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
