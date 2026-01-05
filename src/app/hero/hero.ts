import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getCurrentUserUid } from '../services/auth.service';
import { getEnrolledCourseIds } from '../services/enroll.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  constructor(private router: Router) {}

  startLearning() {
    const uid = getCurrentUserUid();
    if (!uid) {
      this.router.navigate(['/signin']);
      return;
    }
    const enrolled = getEnrolledCourseIds(uid || undefined);
    if (enrolled && enrolled.length) {
      // go to the first registered course
      this.router.navigate(['/course', enrolled[0]]);
    } else {
      // if no registered courses yet, send them to featured page to register
      this.router.navigate(['/featured-courses']);
    }
  }

  exploreCourses() {
    this.router.navigate(['/featured-courses']);
  }

}
