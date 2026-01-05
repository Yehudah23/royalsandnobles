import { initializeApp, getApps } from 'firebase/app';
import { getAuth as fbGetAuth } from 'firebase/auth';

// Replace the placeholder values below with your Firebase project's config.
// You can find these in the Firebase console (Project settings).
export const firebaseConfig = {
  apiKey: "AIzaSyDuBx5rER7jm9wWOaDdgc2q3DeVe8TqPL0",
  authDomain: "royalsandnobles-546e7.firebaseapp.com",
  projectId: "royalsandnobles-546e7",
  storageBucket: "royalsandnobles-546e7.firebasestorage.app",
  messagingSenderId: "754069665291",
  appId: "1:754069665291:web:8f5256b748ad99b491790e",
  measurementId: "G-FMZMKM22QG"
};

// List of admin emails — edit this to include real admin accounts for your project.
// In production, manage admin status server-side (custom claims) instead of client-side lists.
export const adminEmails: string[] = [
  'youremail@example.com'
];

function looksLikeValidApiKey(key: string | undefined) {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length < 20) return false;
  if (trimmed.includes('your-api-key') || trimmed.includes('project-id') || trimmed.includes('your-project')) return false;
  return true;
}

let _auth: ReturnType<typeof fbGetAuth> | null = null;
let _initialized = false;

if (looksLikeValidApiKey(firebaseConfig.apiKey)) {
  // initialize only if not already initialized by another module
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    _auth = fbGetAuth(app);
    _initialized = true;
    // initialize analytics asynchronously when available (optional)
    import('firebase/analytics')
      .then(({ getAnalytics }) => {
        try { getAnalytics(app); } catch (e) { /* ignore analytics init errors */ }
      })
      .catch(() => { /* analytics not available or running in non-browser env */ });
  }
} else {
  // Provide a helpful console message rather than letting a vague Firebase error bubble up.
  // Developers should replace the placeholders above with real Firebase config values.
  // We intentionally do not initialize Firebase so the app can still run without throwing
  // a confusing `auth/api-key-not-valid` error. Components must call `getAuthSafe()` which
  // will throw a clear error when the config is missing.
  // eslint-disable-next-line no-console
  console.error('Firebase config appears invalid or still uses placeholders. Set your real Firebase config in src/app/firebase.config.ts');
}

export function getAuthSafe() {
  if (!_initialized || !_auth) {
    throw new Error('Firebase is not configured. Update src/app/firebase.config.ts with your Firebase project values (apiKey, authDomain, projectId, etc.).');
  }
  return _auth;
}

export const firebaseInitialized = _initialized;
