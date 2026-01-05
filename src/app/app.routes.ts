import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { tutorGuard } from './guards/tutor.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.Home) },
  { path: 'signin', loadComponent: () => import('./signin/signin').then(m => m.Signin) },
  { path: 'signup', loadComponent: () => import('./signup/signup').then(m => m.Signup) },
  { path: 'contact', loadComponent: () => import('./contact/contact').then(m => m.Contact) },
  { path: 'student', loadComponent: () => import('./student/student').then(m => m.Student) },
  { path: 'my-courses', loadComponent: () => import('./mycourses/mycourses').then(m => m.Mycourses) },
  { path: 'tutors', loadComponent: () => import('./tutors/tutors').then(m => m.Tutors), canActivate: [tutorGuard] },
  { path: 'courses', loadComponent: () => import('./courses/courses').then(m => m.Courses) },
  { path: 'featured-courses', loadComponent: () => import('./featuredcourses/featuredcourses').then(m => m.Featuredcourses) },
  { path: 'course/:id', loadComponent: () => import('./course/course').then(m => m.CourseComponent) },
  { path: 'unauthorized', loadComponent: () => import('./unauthorized/unauthorized').then(m => m.Unauthorized) },
  { path: 'choose-role', loadComponent: () => import('./choose-role/choose-role').then(m => m.ChooseRole) },
  { path: 'admin-login', loadComponent: () => import('./admin-login/admin-login').then(m => m.AdminLogin) },
  { path: 'admin-settings', loadComponent: () => import('./admin-settings/admin-settings').then(m => m.AdminSettings), canActivate: [adminGuard] },
  { path: 'admin', loadComponent: () => import('./admin/admin').then(m => m.Admin), canActivate: [adminGuard] }
];
