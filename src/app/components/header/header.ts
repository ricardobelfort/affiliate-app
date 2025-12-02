import { Component, signal, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  mobileMenuOpen = signal(false);
  searchQuery = signal('');
  searchSubmit = output<string>();

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  onSearch() {
    const query = this.searchQuery();
    if (query.trim()) {
      this.searchSubmit.emit(query);
    }
  }
}
