import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminSessionService } from '../services/admin-session.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  isAdmin = false;
  adminEmail: string | null = null;

  constructor(private router: Router, private adminSession: AdminSessionService) {
    this.adminSession.status$.subscribe(s => {
      this.isAdmin = !!s?.ok;
      this.adminEmail = s?.email || null;
    });
  }

  navigateToSignin() {
    this.router.navigate(['/signin']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToCourses() {
    this.router.navigate(['/courses']);
  }

  navigateToStudents() {
    this.router.navigate(['/student']);
  }

  navigateToTutors() {
    this.router.navigate(['/tutors']);
  }

  navigateToAdmin() {
    this.router.navigate([this.isAdmin ? '/admin' : '/admin-login']);
  }
}
