import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, FirebaseUser, signInWithGoogle, logout } from './firebase';
import { dataService } from './dataService';

interface UserProfile {
  role: 'admin' | 'professional' | 'administrative';
  status: 'pending' | 'active' | 'revoked';
  email: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleRole: () => void;
  isOverrideActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleOverride, setRoleOverride] = useState<'admin' | 'professional' | null>(null);

  const fetchProfile = async (uid: string, email: string | null) => {
    try {
      const data = await dataService.getUserProfile(uid);
      if (data) {
        let profileData = data as UserProfile;
        // If it's the master user, always elevate to admin in state by default
        if (email === 'romulochaves77@gmail.com' && !roleOverride) {
          profileData = { ...profileData, role: 'admin', status: 'active' };
        } else if (email === 'romulochaves77@gmail.com' && roleOverride) {
          profileData = { ...profileData, role: roleOverride, status: 'active' };
        }
        setProfile(profileData);
      } else if (email === 'romulochaves77@gmail.com') {
        // Provide immediate admin profile for master user if no DB record exists
        setProfile({
          role: roleOverride || 'admin',
          status: 'active',
          email: 'romulochaves77@gmail.com'
        });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (email === 'romulochaves77@gmail.com') {
        setProfile({
          role: roleOverride || 'admin',
          status: 'active',
          email: 'romulochaves77@gmail.com'
        });
      } else {
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile(user.uid, user.email);
    }
  }, [roleOverride]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid, user.email);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const signOut = async () => {
    try {
      await logout();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user.email);
    }
  };

  const toggleRole = () => {
    if (user?.email === 'romulochaves77@gmail.com') {
      const nextRole = profile?.role === 'admin' ? 'professional' : 'admin';
      setRoleOverride(nextRole);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signIn, 
      signOut, 
      refreshProfile, 
      toggleRole,
      isOverrideActive: !!roleOverride
    }}>
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
