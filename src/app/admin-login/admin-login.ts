import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiHttpService } from '../services/api-http.service';
import { AdminSessionService } from '../services/admin-session.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLogin {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private api: ApiHttpService, private router: Router, private adminSession: AdminSessionService) {}

  async login() {
    this.error = null;
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password';
      return;
    }
    this.loading = true;
    try {
      const res: any = await this.api.adminLogin(this.email, this.password).toPromise();
      if (res && res.ok) {
        // store csrf token if provided
        try { if (res.csrf) this.adminSession.setCsrf(res.csrf); } catch (e) {}
        // navigate to admin dashboard
        this.router.navigate(['/admin']);
      } else {
        this.error = res?.error || 'Login failed';
      }
    } catch (e: any) {
      console.error('admin login error', e);
      this.error = e?.error?.error || e?.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
