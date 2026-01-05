import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Category {
  name: string;
  icon: string;
  description: string;
  courses: number;
  color: string;
}
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  constructor(private http: HttpClient) {}

  public categories: Category[] = []

  ngOnInit() {
    this.getCategories();
  }
   getCategories() {
    this.http.get<Category[]>('http://localhost/royalsandnobles/get_categories.php').subscribe((data: any) => {
      this.categories = data.categories;
      console.log(this.categories);
    });
   }
}
