import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Course } from './course-data-model/course-data-model';
import { Instructor } from './instructor-data-model/instructor-data-model';

@Injectable({
  providedIn: 'root'
})
export class Data {
  // IMPORTANT: Update this URL to point to your PHP server's /api folder
  private baseUrl = 'http://localhost/api';

  constructor(private http: HttpClient) {}

  getFeaturedCourses(): Observable<Course[]> {
    // Mock data for now since no backend exists
    const mockCourses: Course[] = [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        description: 'Learn HTML, CSS, JavaScript, and modern frameworks',
        instructor: 'John Smith',
        price: 99.99,
        rating: 4.8,
        students: 15420,
        duration: '40 hours',
        image: 'https://via.placeholder.com/300x200',
        category: 'Web Development'
      },
      {
        id: 2,
        title: 'Data Science with Python',
        description: 'Master data analysis, visualization, and machine learning',
        instructor: 'Sarah Johnson',
        price: 129.99,
        rating: 4.9,
        students: 12350,
        duration: '35 hours',
        image: 'https://via.placeholder.com/300x200',
        category: 'Data Science'
      },
      {
        id: 3,
        title: 'Mobile App Development with React Native',
        description: 'Build cross-platform mobile apps',
        instructor: 'Mike Chen',
        price: 89.99,
        rating: 4.7,
        students: 9870,
        duration: '28 hours',
        image: 'https://via.placeholder.com/300x200',
        category: 'Mobile Development'
      }
    ];
    return of(mockCourses);
  }

  getTopInstructors(): Observable<Instructor[]> {
    // Mock data for now since no backend exists
    const mockInstructors: Instructor[] = [
      {
        id: 1,
        name: 'Dr. Emily Rodriguez',
        title: 'Senior Data Scientist',
        bio: 'PhD in Computer Science with 10+ years experience in AI and machine learning',
        image: 'https://via.placeholder.com/150x150',
        rating: 4.9,
        students: 45000,
        courses: 12,
        experience: '10+ years'
      },
      {
        id: 2,
        name: 'Alex Thompson',
        title: 'Full Stack Developer',
        bio: 'Expert in modern web technologies and cloud architecture',
        image: 'https://via.placeholder.com/150x150',
        rating: 4.8,
        students: 38000,
        courses: 8,
        experience: '8+ years'
      },
      {
        id: 3,
        name: 'Lisa Park',
        title: 'UX/UI Designer',
        bio: 'Award-winning designer with experience at top tech companies',
        image: 'https://via.placeholder.com/150x150',
        rating: 4.9,
        students: 32000,
        courses: 6,
        experience: '7+ years'
      }
    ];
    return of(mockInstructors);
  }
}
