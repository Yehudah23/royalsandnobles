import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../hero/hero';
import { Trustedby } from '../trustedby/trustedby';
import { Featuredcourses } from '../featuredcourses/featuredcourses';
import { Categories } from '../categories/categories';
import { Topinstructors } from '../topinstructors/topinstructors';
import { Calltoaction } from '../calltoaction/calltoaction';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero, Trustedby, Featuredcourses, Categories, Topinstructors, Calltoaction],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
