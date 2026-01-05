import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Data } from '../data';

interface Instructor {
  id: number;
  name: string;
  title: string;
  bio: string;
  rating: number;
  students: number;
  courses: number;
  experience: string;
  image: string;
}

interface SortOption {
  id: number;
  sort_key: string;
  label: string;
}

@Component({
  selector: 'app-topinstructors',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './topinstructors.html',
  styleUrls: ['./topinstructors.css'],
})
export class Topinstructors implements OnInit {
  instructors: Instructor[] = [];
  sortOptions: SortOption[] = [];
  isLoading = true;
  error: string | null = null;
  sortBy: string = '';

  constructor(private http: HttpClient, private data: Data) {}

  trackByInstructor(index: number, instructor: Instructor) {
    return instructor.id;
  }

  ngOnInit(): void {
    this.getSortOptions();
    // Load instructors asynchronously so the rest of the page can render
    setTimeout(() => this.getInstructors(), 0);
  }

  getSortOptions(): void {
    // fallback default sort options
    this.sortOptions = [
      { id: 1, sort_key: 'ratingDesc', label: 'Rating (High to Low)' },
      { id: 2, sort_key: 'ratingAsc', label: 'Rating (Low to High)' },
      { id: 3, sort_key: 'studentsDesc', label: 'Students (High to Low)' },
      { id: 4, sort_key: 'studentsAsc', label: 'Students (Low to High)' },
      { id: 5, sort_key: 'coursesDesc', label: 'Courses (High to Low)' },
      { id: 6, sort_key: 'coursesAsc', label: 'Courses (Low to High)' }
    ];
    this.sortBy = this.sortOptions[0].sort_key;
    // optionally try to load from backend if present
    this.http.get<any>('http://localhost/royalsandnobles/sort_options.php').subscribe({
      next: (response) => {
        if (response && response.status && Array.isArray(response.sort_options)) {
          this.sortOptions = response.sort_options;
          this.sortBy = this.sortOptions[0]?.sort_key || this.sortBy;
        }
      },
      error: () => {
        // ignore backend error, use defaults
      }
    });
  }

  getInstructors(): void {
    // Use local Data service as primary source so the page shows immediately
    this.data.getTopInstructors().subscribe({
      next: (instructors) => {
        if (Array.isArray(instructors) && instructors.length) {
          this.instructors = this.mergeSort(instructors, this.getComparator());
        } else {
          this.error = 'No instructors found.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load instructors from local data', err);
        this.error = 'Could not load instructors.';
        this.isLoading = false;
      }
    });

    // Also attempt backend fetch if you later add server endpoints
    this.http.get<any>('http://localhost/royalsandnobles/get_instructors.php').subscribe({
      next: (response) => {
        if (response && response.status && Array.isArray(response.instructors) && response.instructors.length) {
          this.instructors = this.mergeSort(response.instructors, this.getComparator());
          this.error = null;
        }
      },
      error: () => {
        // don't overwrite local data error state
      }
    });
  }

  onSortChange(): void {
    this.instructors = this.mergeSort(this.instructors, this.getComparator());
  }

  public getComparator() {
    switch (this.sortBy) {
      case 'ratingAsc': return (a: Instructor, b: Instructor) => a.rating - b.rating;
      case 'ratingDesc': return (a: Instructor, b: Instructor) => b.rating - a.rating;
      case 'studentsAsc': return (a: Instructor, b: Instructor) => a.students - b.students;
      case 'studentsDesc': return (a: Instructor, b: Instructor) => b.students - a.students;
      case 'coursesAsc': return (a: Instructor, b: Instructor) => a.courses - b.courses;
      case 'coursesDesc': return (a: Instructor, b: Instructor) => b.courses - a.courses;
      default: return (a: Instructor, b: Instructor) => b.rating - a.rating;
    }
  }

  public mergeSort(arr: Instructor[], compareFn: (a: Instructor, b: Instructor) => number): Instructor[] {
    return arr.sort(compareFn);
  }
}
