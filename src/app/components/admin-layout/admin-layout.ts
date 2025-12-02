import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  sidebarOpen = signal(false);

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/admin/login']);
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}
