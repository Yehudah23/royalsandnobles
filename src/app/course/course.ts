import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Data } from '../data';
import { getCurrentUserUid } from '../services/auth.service';
import { getEnrolledCourseIds, enrollCourseForCurrentUser } from '../services/enroll.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './course.html',
  styleUrls: ['./course.css']
})
export class CourseComponent implements OnInit {
  courseId: string | null = null;
  course: any = null;
  loading = true;
  error: string | null = null;
  enrolled = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private data: Data) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (!this.courseId) {
      this.error = 'No course specified';
      this.loading = false;
      return;
    }

    // Try to fetch from backend first
    this.http.get<any>(`/server/api/listCourses.php`).subscribe({
      next: (list: any) => {
        const arr = Array.isArray(list) ? list : (list?.courses || []);
        this.course = arr.find((c: any) => String(c.id) === String(this.courseId));
        this.afterLoad();
      },
      error: () => {
        // fallback to local Data
        this.data.getFeaturedCourses().subscribe({
          next: (d: any) => {
            this.course = d.find((c: any) => String(c.id) === String(this.courseId));
            this.afterLoad();
          },
          error: (err: any) => {
            console.error('Failed to load course', err);
            this.error = 'Could not load course details.';
            this.loading = false;
          }
        });
      }
    });
  }

  afterLoad() {
    this.loading = false;
    if (!this.course) {
      this.error = 'Course not found';
      return;
    }
    const uid = getCurrentUserUid();
    if (!uid) {
      this.enrolled = false;
      return;
    }
    const enrolledIds = getEnrolledCourseIds(uid);
    this.enrolled = enrolledIds.includes(String(this.courseId));
  }

  async register() {
    const uid = getCurrentUserUid();
    if (!uid) { this.router.navigate(['/signin']); return; }
    // require role
    try {
      const { getUserRole } = await import('../services/auth.service');
      const role = getUserRole(uid);
      if (!role) {
        this.router.navigate(['/choose-role'], { queryParams: { uid, redirect: `/course/${this.courseId}` } });
        return;
      }
    } catch (e) {}
    try {
      await enrollCourseForCurrentUser(String(this.courseId));
      this.enrolled = true;
      // Optionally notify backend
      try { await this.http.post('/server/api/enrollCourse.php', { courseId: this.courseId }).toPromise(); } catch(e) {}
      // go to course content area (placeholder)
    } catch (e: any) {
      this.router.navigate(['/signin']);
    }
  }
}
