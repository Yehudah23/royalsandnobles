import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.html',
  styleUrls: ['./unauthorized.css']
})
export class Unauthorized {
  constructor(public router: Router) {}
  goHome() { this.router.navigate(['/']); }
}
