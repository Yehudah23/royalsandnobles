import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuthSafe, firebaseInitialized } from '../firebase.config';
import { ApiService } from '../services/api.service';
import { getUserRole } from '../services/auth.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'],
})
export class Courses implements OnInit {
  courses: any[] = [];
  isLoading = true;
  error: string | null = null;
  isTutor = false;

  upload: any = { title: '', description: '', file: null };
  uploading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCourses();
    // determine role from client storage
    if (firebaseInitialized) {
      try {
        const auth = getAuthSafe();
        const uid = auth.currentUser?.uid;
        const role = uid ? getUserRole(uid) : null;
        this.isTutor = role === 'tutor';
      } catch (e) {
        this.isTutor = false;
      }
    }
  }

  async loadCourses() {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await this.api.listCourses();
      this.courses = Array.isArray(data) ? data : (data.courses || []);
    } catch (e: any) {
      console.error('Failed to load courses', e);
      this.error = e?.message || 'Failed to load courses';
    } finally {
      this.isLoading = false;
    }
  }

  onFileChange(ev: any) {
    const f = ev.target.files && ev.target.files[0];
    this.upload.file = f;
  }

  async onUpload() {
    if (!this.upload.title || !this.upload.file) return;
    this.uploading = true;
    try {
      const fd = new FormData();
      fd.append('title', this.upload.title);
      fd.append('description', this.upload.description || '');
      fd.append('file', this.upload.file);
      const resp = await this.api.uploadCourse(fd);
      // refresh list
      await this.loadCourses();
      this.upload = { title: '', description: '', file: null };
    } catch (e: any) {
      console.error('Upload failed', e);
      this.error = e?.message || 'Upload failed';
    } finally {
      this.uploading = false;
    }
  }
}
