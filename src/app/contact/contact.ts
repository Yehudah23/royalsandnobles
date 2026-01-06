import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submitted = false;
  loading = false;
  error: string | null = null;

  async submitForm() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.submitted = true;
      this.contactForm = { name: '', email: '', subject: '', message: '' };
    } catch (e: any) {
      this.error = 'Failed to send message. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
