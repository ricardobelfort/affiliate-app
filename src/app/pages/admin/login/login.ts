import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  async onLogin() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { error } = await this.supabase.signIn(this.email(), this.password());
      
      if (error) {
        this.error.set('Email ou senha inválidos');
        return;
      }

      this.router.navigate(['/admin/products']);
    } catch (err) {
      this.error.set('Erro ao fazer login. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
