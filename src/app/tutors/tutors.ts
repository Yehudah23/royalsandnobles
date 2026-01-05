import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tutors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tutors.html',
  styleUrls: ['./tutors.css']
})
export class Tutors {}
