import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiHttpService } from '../services/api-http.service';
import { AdminSessionService } from '../services/admin-session.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css']
})
export class AdminSettings {
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private api: ApiHttpService, private session: AdminSessionService) {
    this.session.status$.subscribe(s => {
      this.email = s.email || '';
    });
  }

  async changePassword() {
    this.error = null;
    this.message = null;
    if (!this.email) {
      this.error = 'Not authenticated as admin';
      return;
    }
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }
    this.loading = true;
    try {
      // If session-authenticated, currentPassword may be empty; server allows that.
      const res: any = await this.api.adminChangePassword(this.email, this.currentPassword || null, this.newPassword).toPromise();
      if (res && res.ok) {
        this.message = 'Password changed successfully';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      } else {
        this.error = res?.error || 'Failed to change password';
      }
    } catch (e: any) {
      console.error('change password error', e);
      this.error = e?.error?.error || e?.message || 'Failed to change password';
    } finally {
      this.loading = false;
    }
  }
}
