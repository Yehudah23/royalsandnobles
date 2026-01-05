import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Data } from '../data';
import { getCurrentUserUid } from '../services/auth.service';
import { getEnrolledCourseIds } from '../services/enroll.service';

@Component({
  selector: 'app-mycourses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mycourses.html',
  styleUrls: ['./mycourses.css']
})
export class Mycourses implements OnInit {
  enrolled: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private data: Data, private router: Router) {}

  async ngOnInit() {
    this.isLoading = true;
    const uid = getCurrentUserUid();
    if (!uid) {
      
      this.router.navigate(['/signin']);
      return;
    }

    try {
      const ids = getEnrolledCourseIds(uid);
    
      const obs = this.data.getFeaturedCourses();
      const all: any[] = await obs.toPromise?.() ?? [];
      this.enrolled = Array.isArray(all) ? all.filter((c: any) => ids.includes(String(c.id))) : [];
    } catch (e: any) {
      console.error('Failed to load enrolled courses', e);
      this.error = 'Failed to load your courses.';
    } finally {
      this.isLoading = false;
    }
  }
}
