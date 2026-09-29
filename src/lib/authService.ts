import { 
  auth, 
  db, 
  googleProvider, 
  SUPER_ADMIN_EMAIL, 
  isSuperAdminEmail,
  syncUserProfile, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutFirebase, 
  incrementUserToolUsage,
  adminUpdateUser, 
  adminDeleteUser 
} from './firebase';
import { UserProfile, UserStatus, UserPlan, UserRole } from '../types';

export {
  auth,
  db,
  googleProvider,
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  syncUserProfile,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutFirebase,
  incrementUserToolUsage,
  adminUpdateUser,
  adminDeleteUser,
};

// Aliases for compatibility
export const logoutUser = logoutFirebase;
export const incrementUsageCount = incrementUserToolUsage;

export async function adminUpdateUserStatus(uid: string, status: UserStatus): Promise<void> {
  await adminUpdateUser(uid, { status });
}

export async function adminUpdateUserPlan(uid: string, plan: UserPlan): Promise<void> {
  await adminUpdateUser(uid, { plan });
}

export async function adminUpdateUserRole(uid: string, role: UserRole): Promise<void> {
  await adminUpdateUser(uid, { role });
}

export async function adminUpdateUserNotes(uid: string, notes: string): Promise<void> {
  await adminUpdateUser(uid, { notes });
}
