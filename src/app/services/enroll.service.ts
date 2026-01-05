import { getCurrentUserUid } from './auth.service';
import { HttpClient } from '@angular/common/http';

const KEY_PREFIX = 'enrollments:';

export function getEnrollKey(uid: string) {
  return `${KEY_PREFIX}${uid}`;
}

export function enrollCourseForCurrentUser(courseId: string) {
  const uid = getCurrentUserUid();
  if (!uid) throw new Error('Not authenticated');
  return enrollCourse(uid, courseId);
}

export function enrollCourse(uid: string, courseId: string) {
  try {
    const key = getEnrollKey(uid);
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(courseId)) arr.push(courseId);
    localStorage.setItem(key, JSON.stringify(arr));
    return arr;
  } catch (e) {
    console.error('enrollCourse failed', e);
    throw e;
  }
}

/**
 * Try to enroll using a remote HTTP endpoint if provided, else fall back to localStorage.
 * This helper accepts an HttpClient instance from a component so we don't make the module injectable.
 */
export async function enrollCourseRemote(http: HttpClient | null, courseId: string) {
  const uid = getCurrentUserUid();
  if (!uid) throw new Error('Not authenticated');
  if (http) {
    try {
      await http.post('/server/api/enrollCourse.php', { uid, courseId }).toPromise();
    } catch (e) {
      // remote failed, continue to local fallback
    }
  }
  return enrollCourse(uid, courseId);
}

export function getEnrolledCourseIds(uid?: string) {
  const user = uid || getCurrentUserUid();
  if (!user) return [];
  try {
    const raw = localStorage.getItem(getEnrollKey(user));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isEnrolled(uid: string, courseId: string) {
  const arr = getEnrolledCourseIds(uid);
  return arr.includes(courseId);
}
