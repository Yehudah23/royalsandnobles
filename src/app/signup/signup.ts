import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { getAuthSafe, firebaseInitialized } from '../firebase.config';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { setUserRole, getUserRole } from '../services/auth.service';
import { ApiHttpService } from '../services/api-http.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup implements OnInit {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = 'student';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private router: Router, private api: ApiHttpService) {}

  async ngOnInit() {
    if (!firebaseInitialized) return;
    try {
      const auth = getAuthSafe();
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        const uid = result.user.uid;
        // if a pending role was set before redirect, apply it
        try {
          const pending = localStorage.getItem('pendingRole');
          if (pending) {
            setUserRole(uid, pending);
            localStorage.removeItem('pendingRole');
          }
        } catch (e) {}
        const role = uid ? getUserRole(uid) : null;
        this.router.navigate([role === 'tutor' ? '/tutors' : '/student']);
      }
    } catch (err: any) {
      console.error('Redirect sign-up error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';
      this.errorMessage = code ? `${code} — ${msg}` : msg;
    }
  }

  async signUp() {
    this.errorMessage = '';
    if (!this.role) {
      this.errorMessage = 'Please select a role (student or tutor).';
      return;
    }
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter an email and password.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    try {
      if (!firebaseInitialized) throw new Error('Firebase not configured');
      const auth = getAuthSafe();
      const cred = await createUserWithEmailAndPassword(auth, this.email, this.password);
      const uid = cred.user?.uid;
      if (uid) setUserRole(uid, this.role);
      // persist to backend (best-effort) including role
      try {
        await this.api.saveUser(this.email, uid || undefined, this.role).toPromise();
      } catch (e) {
        // ignore backend errors — local role stored so app can proceed
      }
      // sign out after signup so user must explicitly sign in (no silent redirect)
      try {
        await auth.signOut();
      } catch (e) {
        /* ignore signOut errors */
      }
      // route to sign-in so user can authenticate explicitly
      this.router.navigate(['/signin']);
    } catch (err: any) {
      console.error('SignUp error:', err);
      const code = err?.code || '';
      const msg = err?.message || 'Failed to create account.';
      if (msg.includes('Firebase is not configured')) {
        this.errorMessage = 'Firebase not configured. Please add your Firebase config in src/app/firebase.config.ts';
      } else {
        this.errorMessage = code ? `${code} — ${msg}` : msg;
      }
    } finally {
      this.loading = false;
    }
  }

  async signUpWithGoogle() {
    this.errorMessage = '';
    this.loading = true;
    const provider = new GoogleAuthProvider();
    try {
      if (!firebaseInitialized) throw new Error('Firebase not configured');
      const auth = getAuthSafe();
      // use popup flow so signup doesn't redirect away
      const cred = await signInWithPopup(auth, provider);
      const uid = cred.user?.uid;
      const email = cred.user?.email || '';
      if (uid) setUserRole(uid, this.role || 'student');
      try {
        // persist user + role to backend (best-effort)
        await this.api.saveUser(email, uid || undefined, this.role || 'student').toPromise();
      } catch (e) {
        // ignore backend errors
      }
      // sign out after signup to force explicit sign-in (avoid unexpected redirects)
      try {
        await auth.signOut();
      } catch (e) { /* ignore */ }
      this.router.navigate(['/signin']);
    } catch (err: any) {
      if (err?.message && err.message.includes('Firebase is not configured')) {
        this.errorMessage = 'Firebase not configured. Please add your Firebase config in src/app/firebase.config.ts';
      } else {
        this.errorMessage = err?.message || 'Google sign-up failed.';
      }
    } finally {
      this.loading = false;
    }
  }
}
