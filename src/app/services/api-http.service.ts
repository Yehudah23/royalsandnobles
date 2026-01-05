import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiHttpService {
  public base = '/server/api';
  // Set this to true to use MySQL-backed endpoints (requires DB and schema imported)
  public useMysql = true;
  private csrfToken: string | null = null;

  constructor(private http: HttpClient) {}

  setCsrf(token: string | null) {
    this.csrfToken = token;
  }

  private csrfHeaders(): { headers?: HttpHeaders; withCredentials: boolean } {
    if (this.csrfToken) {
      return { headers: new HttpHeaders({ 'X-CSRF-Token': this.csrfToken }), withCredentials: true };
    }
    return { withCredentials: true };
  }

  listCourses(): Observable<any> {
    return this.http.get(this.useMysql ? `${this.base}/mysql_listCourses.php` : `${this.base}/listCourses.php`);
  }

  listPendingCourses(): Observable<any> {
    return this.http.get(this.useMysql ? `${this.base}/mysql_listPendingCourses.php` : `${this.base}/listPendingCourses.php`, { withCredentials: true });
  }

  approveCourse(id: string): Observable<any> {
    const url = this.useMysql ? `${this.base}/mysql_approveCourse.php` : `${this.base}/approveCourse.php`;
    const opts = this.csrfHeaders();
    return this.http.post(url, { id }, opts as any);
  }

  uploadCourse(form: FormData): Observable<any> {
    const url = this.useMysql ? `${this.base}/mysql_uploadCourse.php` : `${this.base}/uploadCourse.php`;
    return this.http.post(url, form, { withCredentials: true });
  }

  enrollCourse(courseId: string): Observable<any> {
    const url = this.useMysql ? `${this.base}/mysql_enrollCourse.php` : `${this.base}/enrollCourse.php`;
    return this.http.post(url, { courseId }, { withCredentials: true });
  }

  /**
   * Save user info to backend. Optionally include role for server-side persistence.
   */
  saveUser(email: string, uid?: string, role?: string): Observable<any> {
    const url = this.useMysql ? `${this.base}/mysql_saveUser.php` : `${this.base}/saveUser.php`;
    return this.http.post(url, { email, uid, role }, { withCredentials: true });
  }

  /* Admin helper endpoints */
  adminLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/adminLogin.php`, { email, password }, { withCredentials: true });
  }

  adminLogout(): Observable<any> {
    return this.http.post(`${this.base}/adminLogout.php`, {}, { withCredentials: true });
  }

  adminChangePassword(email: string, currentPassword: string | null, newPassword: string): Observable<any> {
    const opts = this.csrfHeaders();
    return this.http.post(`${this.base}/adminChangePassword.php`, { email, currentPassword, newPassword }, opts as any);
  }

  adminStatus(): Observable<any> {
    return this.http.get(`${this.base}/adminStatus.php`, { withCredentials: true });
  }
}
