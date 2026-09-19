import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { syncUserProfile, logoutUser } from '../lib/authService';
import { UserProfile } from '../types';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!fbUser) {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(fbUser);

      // Listen in real-time to the user document in Firestore
      const userRef = doc(db, 'users', fbUser.uid);
      unsubscribeSnapshot = onSnapshot(
        userRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUser(data);
            setLoading(false);
          } else {
            // Document hasn't been created yet, sync it now
            try {
              const created = await syncUserProfile(fbUser);
              setUser(created);
            } catch (e) {
              console.error('Erro ao sincronizar perfil:', e);
            } finally {
              setLoading(false);
            }
          }
        },
        (error) => {
          console.warn('Erro ao escutar Firestore user:', error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const isAdmin = user?.role === 'admin';
  const isActive = user?.status === 'active';
  const isPending = user?.status === 'pending';
  const isBlocked = user?.status === 'blocked';
  const isExpired = user?.status === 'expired';
  const isAuthenticated = !!firebaseUser && !!user;

  return {
    firebaseUser,
    user,
    loading,
    isAdmin,
    isActive,
    isPending,
    isBlocked,
    isExpired,
    isAuthenticated,
    logout: logoutUser,
  };
}
