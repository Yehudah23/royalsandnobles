import { Injectable } from '@angular/core';
import { ApiHttpService } from './api-http.service';
import { lastValueFrom } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface AdminStatus {
  ok: boolean;
  email?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private cache: AdminStatus | null = null;
  private fetchedAt = 0;
  private ttl = 60 * 1000; // 60s cache
  private subject = new BehaviorSubject<AdminStatus>({ ok: false });

  /** Observable stream of admin status; components can subscribe to react to changes */
  public status$ = this.subject.asObservable();

  constructor(private api: ApiHttpService) {}

  private push(status: AdminStatus) {
    this.cache = status;
    this.fetchedAt = Date.now();
    this.subject.next(status);
  }

  async getStatus(force = false): Promise<AdminStatus> {
    const now = Date.now();
    if (!force && this.cache && now - this.fetchedAt < this.ttl) {
      return this.cache;
    }
    try {
      const res: any = await lastValueFrom(this.api.adminStatus());
      const status: AdminStatus = { ok: !!res?.ok, email: res?.email || null };
      this.push(status);
      return status;
    } catch (e) {
      const status: AdminStatus = { ok: false, email: null };
      this.push(status);
      return status;
    }
  }

  clear() {
    this.cache = null;
    this.fetchedAt = 0;
    this.push({ ok: false, email: null });
    this.api.setCsrf(null);
  }

  async logout(): Promise<void> {
    try {
      await lastValueFrom(this.api.adminLogout());
    } catch (e) {
      // ignore errors
    }
    this.clear();
  }

  setCsrf(token: string | null) {
    this.api.setCsrf(token);
  }

  getCsrf(): string | null {
    // Delegate to ApiHttpService - no local storage needed
    return null;
  }
}
