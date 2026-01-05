import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { getAuthSafe, firebaseInitialized } from '../firebase.config';
import { isAdminEmail } from '../services/auth.service';
import { AdminSessionService } from '../services/admin-session.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const adminSession = inject(AdminSessionService);

  // Use cached server-side status first (AdminSessionService handles TTL)
  return adminSession.getStatus().then((res) => {
    if (res && res.ok) return true;
    // fallback to client-side check
    if (!firebaseInitialized) return router.parseUrl('/admin-login');
    try {
      const auth = getAuthSafe();
      const user = auth.currentUser;
      if (!user) return router.parseUrl('/signin');
      return isAdminEmail(user.email || undefined) ? true : router.parseUrl('/unauthorized');
    } catch (e) {
      return router.parseUrl('/unauthorized');
    }
  }).catch(() => router.parseUrl('/admin-login')) as unknown as boolean | UrlTree | Promise<boolean | UrlTree>;
};
