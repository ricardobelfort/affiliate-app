import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
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
export class AdminLayout implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  userName = signal<string>('');
  userEmail = signal<string>('');
  userMenuOpen = signal(false);

  async ngOnInit() {
    const { data } = await this.supabase.getSession();
    if (data.session?.user) {
      this.userEmail.set(data.session.user.email || '');
      // Extract name from email (before @)
      const name = data.session.user.email?.split('@')[0] || 'Admin';
      this.userName.set(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/admin/login']);
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  toggleUserMenu() {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userMenuButton = target.closest('.user-menu-trigger');
    
    if (!userMenuButton && this.userMenuOpen()) {
      this.userMenuOpen.set(false);
    }
  }
}
