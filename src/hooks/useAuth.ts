import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db, syncUserProfile, logoutFirebase, SUPER_ADMIN_EMAIL } from '../lib/firebase';
import { UserProfile } from '../types';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let unsubscribeUsersList: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      // Clear previous snapshot listeners
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }
      if (unsubscribeUsersList) {
        unsubscribeUsersList();
        unsubscribeUsersList = null;
      }

      if (!fbUser) {
        setFirebaseUser(null);
        setUser(null);
        setPendingCount(0);
        setLoading(false);
        return;
      }

      setFirebaseUser(fbUser);
      setLoading(true);

      try {
        // Sync or retrieve user profile
        const initialProfile = await syncUserProfile(fbUser);
        setUser(initialProfile);

        // Real-time listener on the user's specific document in users/{uid}
        const userDocRef = doc(db, 'users', fbUser.uid);
        unsubscribeDoc = onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              const updated = snap.data() as UserProfile;
              setUser((prev) => {
                // Real-time unlock alert if approved by admin
                if (prev?.status === 'pending' && updated.status === 'active') {
                  try {
                    // Friendly in-app alert or notification
                    console.log('🎉 Seu acesso foi liberado pelo Administrador!');
                  } catch (e) {
                    // Ignore
                  }
                }
                return updated;
              });

              // If admin, listen to the collection to track pending approval requests
              if (updated.role === 'admin' && !unsubscribeUsersList) {
                const usersCol = collection(db, 'users');
                unsubscribeUsersList = onSnapshot(
                  usersCol,
                  (usersSnap) => {
                    let count = 0;
                    usersSnap.forEach((uDoc) => {
                      const u = uDoc.data() as UserProfile;
                      if (u.status === 'pending') count++;
                    });
                    setPendingCount(count);
                  },
                  (err) => {
                    console.warn('Erro ao escutar contagem de pendências:', err);
                  }
                );
              }
            }
            setLoading(false);
          },
          (err) => {
            console.warn('Erro no listener do documento do usuário:', err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Erro ao sincronizar perfil do usuário:', err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeUsersList) unsubscribeUsersList();
    };
  }, []);

  const isAdmin = user?.role === 'admin' || (firebaseUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
  const isActive = user?.status === 'active';
  const isPending = user?.status === 'pending';
  const isBlocked = user?.status === 'blocked';
  const isExpired = user?.status === 'expired';
  const isAuthenticated = !!firebaseUser;

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
    pendingCount,
    logout: logoutFirebase,
  };
}
