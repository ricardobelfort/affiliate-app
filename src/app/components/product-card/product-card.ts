import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  product = input.required<Product>();

  getBadgeClass(badge?: string): string {
    switch (badge) {
      case 'offer':
        return 'bg-red-500 text-white';
      case 'bestseller':
        return 'bg-emerald-500 text-white';
      case 'new':
        return 'bg-blue-500 text-white';
      default:
        return '';
    }
  }

  getBadgeText(badge?: string): string {
    switch (badge) {
      case 'offer':
        return 'Oferta';
      case 'bestseller':
        return 'Mais Vendido';
      case 'new':
        return 'Novo';
      default:
        return '';
    }
  }
}
