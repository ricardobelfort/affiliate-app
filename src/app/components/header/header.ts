import { Component, signal, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private router = Router;
  
  mobileMenuOpen = signal(false);
  searchQuery = signal('');
  searchSubmit = output<string>();

  constructor(private routerService: Router) {}

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  onSearch() {
    const query = this.searchQuery();
    if (query.trim()) {
      this.routerService.navigate(['/'], {
        queryParams: { search: query },
        queryParamsHandling: 'merge'
      });
      this.searchSubmit.emit(query);
    } else {
      // Se a busca está vazia, remove o parâmetro de busca
      this.clearSearch();
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.routerService.navigate(['/'], {
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
  }
}
