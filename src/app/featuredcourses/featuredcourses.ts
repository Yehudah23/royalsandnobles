import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Course } from '../course-data-model/course-data-model';
import { Data } from '../data';
import { mergeSort, courseComparators } from '../utils/sort';
import { getCurrentUserUid, getUserRole } from '../services/auth.service';

@Component({
  selector: 'app-featuredcourses',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './featuredcourses.html',
  styleUrls: ['./featuredcourses.css'],
})
export class Featuredcourses implements OnInit {
  courses: Course[] = [];
  isLoading = true;
  error: string | null = null;
  sortBy: string = 'ratingDesc';

  constructor(private dataService: Data, private router: Router, private http: HttpClient) {}

  trackByCourse(index: number, c: any) {
    return c?.id || index;
  }

  ngOnInit(): void {
    // Try fetching from backend first (server/api/listCourses.php) then fallback to local Data
    this.http.get<Course[]>('/server/api/listCourses.php').subscribe({
      next: (data) => {
        this.courses = mergeSort(data || [], courseComparators.byRatingDesc);
        this.isLoading = false;
      },
      error: () => {
        // fallback to local Data
        this.dataService.getFeaturedCourses().subscribe({
          next: (data) => {
            this.courses = mergeSort(data, courseComparators.byRatingDesc);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to load courses', err);
            this.error = 'Could not load featured courses at this time.';
            this.isLoading = false;
          }
        });
      }
    });
  }

  onSortChange(): void {
    let comparator;
    switch (this.sortBy) {
      case 'ratingDesc':
        comparator = courseComparators.byRatingDesc;
        break;
      case 'ratingAsc':
        comparator = courseComparators.byRatingAsc;
        break;
      case 'priceDesc':
        comparator = courseComparators.byPriceDesc;
        break;
      case 'priceAsc':
        comparator = courseComparators.byPriceAsc;
        break;
      case 'studentsDesc':
        comparator = courseComparators.byStudentsDesc;
        break;
      case 'studentsAsc':
        comparator = courseComparators.byStudentsAsc;
        break;
      default:
        comparator = courseComparators.byRatingDesc;
    }
    this.courses = mergeSort(this.courses, comparator);
  }

  navigateToCourses() {
    this.router.navigate(['/featured-courses']);
  }

  async enroll(course: any) {
    const uid = getCurrentUserUid();
    if (!uid) {
      this.router.navigate(['/signin']);
      return;
    }
    const role = getUserRole(uid);
    if (!role) {
      // send user to choose role, then come back to this course
      this.router.navigate(['/choose-role'], { queryParams: { uid, redirect: `/course/${course.id}` } });
      return;
    }
    try {
      const enrollModule = await import('../services/enroll.service');
      // try remote enroll endpoint first
      try {
        await this.http.post('/server/api/enrollCourse.php', { courseId: course.id }).toPromise();
      } catch (e) {
        // ignore remote failure and fall back to local enroll
      }
      enrollModule.enrollCourseForCurrentUser(String(course.id));
      // navigate to the course detail directly after enrolling
      this.router.navigate(['/course', course.id]);
    } catch (e: any) {
      console.warn('Enroll failed — redirecting to signin', e);
      this.router.navigate(['/signin']);
    }
  }
}
