import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as fbSignOut, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  increment 
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { UserProfile, UserStatus, UserPlan, UserRole } from '../types';

export const SUPER_ADMIN_EMAIL = 'alexrodrigues43@gmail.com';

/**
 * Creates or synchronizes the Firestore user document upon login.
 * Automatically promotes alexrodrigues43@gmail.com to Super Admin with lifetime access.
 */
export async function syncUserProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userRef);

  const emailLower = (fbUser.email || '').toLowerCase().trim();
  const isSuperAdmin = emailLower === SUPER_ADMIN_EMAIL.toLowerCase();

  const now = new Date().toISOString();

  if (!userSnap.exists()) {
    const newUser: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário Semântico',
      role: isSuperAdmin ? 'admin' : 'client',
      status: isSuperAdmin ? 'active' : 'pending',
      plan: isSuperAdmin ? 'lifetime' : 'trial',
      usageCount: 0,
      notes: isSuperAdmin ? 'Super Administrador Semântico' : 'Novo cadastro aguardando liberação.',
      createdAt: now,
      lastLoginAt: now,
    };

    await setDoc(userRef, newUser);
    return newUser;
  }

  const existing = userSnap.data() as UserProfile;
  const updates: Partial<UserProfile> = {
    lastLoginAt: now,
    email: fbUser.email || existing.email,
  };

  // Guarantee super admin rights for alexrodrigues43@gmail.com
  if (isSuperAdmin) {
    if (existing.role !== 'admin') updates.role = 'admin';
    if (existing.status !== 'active') updates.status = 'active';
    if (existing.plan !== 'lifetime') updates.plan = 'lifetime';
  }

  await updateDoc(userRef, updates);
  return { ...existing, ...updates };
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return await syncUserProfile(credential.user);
}

export async function registerWithEmail(email: string, pass: string, name: string): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (name.trim() && credential.user) {
    await updateProfile(credential.user, { displayName: name.trim() });
  }
  return await syncUserProfile(credential.user);
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const credential = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(credential.user);
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

export async function incrementUsageCount(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      usageCount: increment(1),
    });
  } catch (err) {
    console.warn('Erro ao incrementar contagem de uso:', err);
  }
}

export async function adminUpdateUserStatus(uid: string, status: UserStatus): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { status });
}

export async function adminUpdateUserPlan(uid: string, plan: UserPlan): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { plan });
}

export async function adminUpdateUserRole(uid: string, role: UserRole): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
}

export async function adminUpdateUserNotes(uid: string, notes: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { notes });
}

export async function adminDeleteUser(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
}
