import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactPage implements OnInit {
  // State signals
  contactForm = signal<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal('');

  // Computed properties
  isFormValid = computed(() => {
    const form = this.contactForm();
    return (
      form.name.trim() !== '' &&
      form.email.trim() !== '' &&
      this.isValidEmail(form.email) &&
      form.subject.trim() !== '' &&
      form.message.trim() !== ''
    );
  });

  messageLength = computed(() => this.contactForm().message.length);

  ngOnInit() {
    // Initialize component if needed
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.submitError.set('Por favor, preencha todos os campos corretamente.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);
      this.resetForm();

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess.set(false);
      }, 5000);
    }, 1000);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetForm() {
    this.contactForm.set({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  }

  updateFormField(field: keyof ContactForm, value: string) {
    this.contactForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  clearError() {
    this.submitError.set('');
  }
}
