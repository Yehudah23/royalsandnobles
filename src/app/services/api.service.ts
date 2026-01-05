import { getAuthSafe, firebaseInitialized } from '../firebase.config';

// Minimal API client using fetch
export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = options.headers ? new Headers(options.headers as any) : new Headers();
  if (firebaseInitialized) {
    try {
      const auth = getAuthSafe();
      const token = await auth.currentUser?.getIdToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch (e) {
      // ignore
    }
  }
  options.headers = headers;
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function uploadCourse(formData: FormData) {
  const res = await fetch('/server/api/uploadCourse.php', {
    method: 'POST',
    body: formData,
    // Authorization header added by apiFetch is not used here because fetch with FormData cannot set headers easily in same way
    headers: {}
  });
  if (!res.ok) throw new Error(`Upload failed ${res.status}`);
  return res.json();
}

export async function listCourses() {
  return apiFetch('/server/api/listCourses.php');
}

export async function listPendingCourses() {
  return apiFetch('/server/api/listPendingCourses.php');
}

export async function approveCourse(id: string) {
  return apiFetch('/server/api/approveCourse.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
}
