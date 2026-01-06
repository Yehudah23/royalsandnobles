import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api';

  async uploadCourse(formData: FormData): Promise<any> {
    return lastValueFrom(this.http.post(`${this.base}/uploadCourse.php`, formData, { withCredentials: true }));
  }

  async listCourses(): Promise<any> {
    return lastValueFrom(this.http.get(`${this.base}/listCourses.php`));
  }

  async listPendingCourses(): Promise<any> {
    return lastValueFrom(this.http.get(`${this.base}/listPendingCourses.php`, { withCredentials: true }));
  }

  async approveCourse(id: string): Promise<any> {
    return lastValueFrom(this.http.post(`${this.base}/approveCourse.php`, { id }, { withCredentials: true }));
  }
}
