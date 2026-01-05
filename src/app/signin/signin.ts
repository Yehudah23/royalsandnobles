import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { getAuthSafe, firebaseInitialized } from '../firebase.config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { ApiHttpService } from '../services/api-http.service';
import { getUserRole } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css'],
})
export class Signin implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  showRedirectFallback: boolean = false;

  constructor(private router: Router, private api: ApiHttpService) {}

  async ngOnInit() {
    // Handle redirect result in case the user used the redirect fallback.
    if (!firebaseInitialized) return;
    try {
      const auth = getAuthSafe();
      const result = await getRedirectResult(auth as any);
      if (result && result.user) {
        const uid = result.user.uid;
        const role = uid ? getUserRole(uid) : null;
        // Save user email + role to backend (best-effort)
        try {
          const email = result.user.email || '';
          const role = uid ? getUserRole(uid) : null;
          if (email) this.api.saveUser(email, uid || undefined, role || undefined).subscribe({});
        } catch (e) {}
          if (!role) {
            this.router.navigate(['/choose-role'], { queryParams: { uid } });
            return;
          }
          this.router.navigate([role === 'tutor' ? '/tutors' : '/student']);
      }
    } catch (err: any) {
      // Ignore redirect result errors here; user will see messages if needed
      console.warn('Redirect result handling:', err?.code || err?.message || err);
    }
  }

  async signIn() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter an email and password.';
      return;
    }
    this.loading = true;
    try {
  if (!firebaseInitialized) throw new Error('Firebase not configured');
  const auth = getAuthSafe();
  const cred = await signInWithEmailAndPassword(auth, this.email, this.password);
  const uid = cred.user?.uid;
  const role = uid ? getUserRole(uid) : null;
  // save to backend (best-effort)
  try {
    const email = cred.user?.email || this.email || '';
    const role = uid ? getUserRole(uid) : null;
    if (email) this.api.saveUser(email, uid || undefined, role || undefined).subscribe({});
  } catch (e) {}
  this.router.navigate([role === 'tutor' ? '/tutors' : '/student']);
    } catch (err: any) {
      // Log full error for debugging and show code + message in UI
      console.error('SignIn error:', err);
      const code = err?.code || '';
      const msg = err?.message || 'Failed to sign in. Please try again.';
      if (msg.includes('Firebase is not configured')) {
        this.errorMessage = 'Firebase not configured. Please add your Firebase config in src/app/firebase.config.ts';
      } else {
        this.errorMessage = code ? `${code} — ${msg}` : msg;
      }
    } finally {
      this.loading = false;
    }
  }

  async signInWithGoogle() {
    this.errorMessage = '';
    this.loading = true;
    const provider = new GoogleAuthProvider();
    try {
      if (!firebaseInitialized) throw new Error('Firebase not configured');
      const auth = getAuthSafe();
      // use popup flow so the app is not redirected away
      const cred = await signInWithPopup(auth, provider);
        const uid = cred.user?.uid;
        const role = uid ? getUserRole(uid) : null;
        this.showRedirectFallback = false;
        // save to backend (best-effort)
        try {
          const email = cred.user?.email || '';
          const role = uid ? getUserRole(uid) : null;
          if (email) this.api.saveUser(email, uid || undefined, role || undefined).subscribe({});
        } catch (e) {}
        // if the user has no role yet, send them to a role-selection page
        if (!role) {
          this.router.navigate(['/choose-role'], { queryParams: { uid } });
          return;
        }
        this.router.navigate([role === 'tutor' ? '/tutors' : '/student']);
    } catch (err: any) {
      // Provide friendly guidance and a redirect fallback when popups fail or are closed
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        this.errorMessage = 'Sign-in was cancelled. Please try again or use the full-page sign-in.';
        this.showRedirectFallback = true;
      } else if (code === 'auth/cancelled-popup-request') {
        // multiple popups opened quickly — suggest trying again
        this.errorMessage = 'Multiple sign-in attempts detected. Please try again.';
        this.showRedirectFallback = true;
      } else if (code === 'auth/popup-blocked' || (err?.message || '').toLowerCase().includes('popup')) {
        this.errorMessage = 'Popup blocked by browser. Please allow popups or use the full-page sign-in.';
        this.showRedirectFallback = true;
      } else if (err?.message && err.message.includes('Firebase is not configured')) {
        this.errorMessage = 'Firebase not configured. Please add your Firebase config in src/app/firebase.config.ts';
      } else {
        this.errorMessage = err?.message || 'Google sign-in failed.';
      }
    } finally {
      this.loading = false;
    }
  }

  async signInWithRedirectFallback() {
    this.errorMessage = '';
    this.loading = true;
    const provider = new GoogleAuthProvider();
    try {
      if (!firebaseInitialized) throw new Error('Firebase not configured');
      const auth = getAuthSafe();
      await signInWithRedirect(auth, provider);
      // No navigation here — getRedirectResult in ngOnInit will handle post-redirect
    } catch (err: any) {
      this.errorMessage = err?.message || 'Redirect sign-in failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
