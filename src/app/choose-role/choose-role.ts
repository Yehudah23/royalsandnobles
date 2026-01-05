import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { setUserRole } from '../services/auth.service';
import { ApiHttpService } from '../services/api-http.service';

@Component({
  selector: 'app-choose-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './choose-role.html',
  styleUrls: ['./choose-role.css']
})
export class ChooseRole {
  uid: string | null = null;
  role: 'student' | 'tutor' = 'student';
  loading = false;
  error: string | null = null;
  redirect: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiHttpService) {
    this.uid = this.route.snapshot.queryParamMap.get('uid');
    this.redirect = this.route.snapshot.queryParamMap.get('redirect');
  }

  async save() {
    if (!this.uid) {
      this.error = 'Missing user id';
      return;
    }
    this.loading = true;
    try {
      setUserRole(this.uid, this.role);
      // best-effort save to backend
      try { await this.api.saveUser('', this.uid).toPromise(); } catch (e) {}
      if (this.redirect) {
        try { this.router.navigateByUrl(this.redirect); return; } catch(e) {}
      }
      this.router.navigate([this.role === 'tutor' ? '/tutors' : '/student']);
    } catch (e: any) {
      this.error = e?.message || 'Failed to save role';
    } finally {
      this.loading = false;
    }
  }
}
