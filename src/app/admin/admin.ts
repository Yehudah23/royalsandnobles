import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSessionService } from '../services/admin-session.service';
import { Router } from '@angular/router';
import { approveCourse, listPendingCourses } from '../services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  pending: any[] = [];
  loading = true;
  error: string | null = null;
  adminEmail: string | null = null;

  constructor(private adminSession: AdminSessionService, private router: Router) {}

  ngOnInit(): void {
    this.checkStatusAndLoad();
  }

  async checkStatusAndLoad() {
    try {
      const res = await this.adminSession.getStatus();
      if (res && res.ok) {
        this.adminEmail = res.email || null;
        await this.loadPending();
        return;
      }
    } catch (e) {
      // not authenticated server-side; allow adminGuard to have handled routing
      this.router.navigate(['/admin-login']);
      return;
    }
  }

  async loadPending() {
    this.loading = true;
    this.error = null;
    try {
      const data = await listPendingCourses();
      this.pending = Array.isArray(data) ? data : (data.courses || []);
    } catch (e: any) {
      console.error('Failed to load pending', e);
      this.error = e?.message || 'Failed to load pending courses';
    } finally {
      this.loading = false;
    }
  }

  async approve(id: string) {
    try {
      await approveCourse(id);
      await this.loadPending();
    } catch (e: any) {
      console.error('Approve failed', e);
      this.error = e?.message || 'Approve failed';
    }
  }

  async logout() {
    try {
      await this.adminSession.logout();
    } catch (e) {
      console.warn('logout failed', e);
    }
    this.router.navigate(['/admin-login']);
  }
}
