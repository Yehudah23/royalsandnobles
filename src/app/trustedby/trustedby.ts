import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trustedby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trustedby.html',
  styleUrl: './trustedby.css',
})
export class Trustedby {
  institutions = [
    "Royal Academy of Arts",
    "Windsor Institute",
    "Cambridge Society",
    "Oxford Heritage",
    "Buckingham Foundation",
    "Westminster College",
  ];

  constructor() { }
}
