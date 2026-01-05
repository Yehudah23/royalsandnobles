import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Data } from '../data';

@Component({
  selector: 'app-topinstructors-fixed',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './topinstructors-fixed.html',
  styleUrls: ['./topinstructors.css'],
})
export class TopinstructorsFixed implements OnInit {
  instructors: any[] = [];
  isLoading = true;
  error: string | null = null;
  sortBy = 'ratingDesc';

  constructor(private data: Data) {}

  ngOnInit(): void {
    // load asynchronously so the page can render immediately
    setTimeout(() => this.load(), 0);
  }

  load() {
    this.data.getTopInstructors().subscribe({
      next: (items) => {
        this.instructors = items || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load instructors (fixed)', err);
        this.error = 'Could not load instructors.';
        this.isLoading = false;
      }
    });
  }
}
