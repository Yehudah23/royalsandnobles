import { getAuthSafe, firebaseInitialized } from '../firebase.config';

/**
 * Minimal auth helpers for role storage and admin checks.
 * Roles are stored in localStorage as `role:<uid>`.
 * For production, store roles in Firestore or use custom claims.
 */
export function setUserRole(uid: string, role: string) {
  try {
    localStorage.setItem(`role:${uid}`, role);
  } catch (e) {
    // ignore storage errors
  }
}

export function getUserRole(uid?: string) {
  if (!uid) return null;
  try {
    return localStorage.getItem(`role:${uid}`) || null;
  } catch (e) {
    return null;
  }
}

export function getCurrentUserUid() {
  if (!firebaseInitialized) return null;
  try {
    const auth = getAuthSafe();
    return auth.currentUser?.uid || null;
  } catch (e) {
    return null;
  }
}

import { adminEmails } from '../firebase.config';

export function isAdminEmail(email?: string) {
  if (!email) return false;
  return Array.isArray(adminEmails) && adminEmails.includes(email);
}

export function clearUserRole(uid: string) {
  try {
    localStorage.removeItem(`role:${uid}`);
  } catch (e) {}
}
