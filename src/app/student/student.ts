import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class Student {}
