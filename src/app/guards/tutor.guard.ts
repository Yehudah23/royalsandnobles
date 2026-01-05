import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getAuthSafe, firebaseInitialized } from '../firebase.config';
import { getUserRole, isAdminEmail } from '../services/auth.service';

export const tutorGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (!firebaseInitialized) return router.parseUrl('/unauthorized');
  try {
    const auth = getAuthSafe();
    const user = auth.currentUser;
    if (!user) return router.parseUrl('/signin');
    // allow if admin email or stored role is tutor
    if (isAdminEmail(user.email || undefined)) return true;
    const role = getUserRole(user.uid);
    return role === 'tutor' ? true : router.parseUrl('/unauthorized');
  } catch (e) {
    return router.parseUrl('/unauthorized');
  }
};
