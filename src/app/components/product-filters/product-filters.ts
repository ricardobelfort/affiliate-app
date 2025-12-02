import { Component, input, output, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, ProductFilters } from '../../models/product.model';

@Component({
  selector: 'app-product-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent implements OnInit {
  categories = input<Category[]>([]);
  stores = input<string[]>([]);
  filtersChange = output<ProductFilters>();

  selectedCategory = signal<string>('');
  selectedStore = signal<string>('');
  selectedSort = signal<string>('recent');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(10000);

  ngOnInit() {
    this.emitFilters();
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.emitFilters();
  }

  onStoreChange(store: string) {
    this.selectedStore.set(store);
    this.emitFilters();
  }

  onSortChange(sort: string) {
    this.selectedSort.set(sort);
    this.emitFilters();
  }

  onPriceChange() {
    this.emitFilters();
  }

  clearFilters() {
    this.selectedCategory.set('');
    this.selectedStore.set('');
    this.selectedSort.set('recent');
    this.minPrice.set(0);
    this.maxPrice.set(10000);
    this.emitFilters();
  }

  private emitFilters() {
    const filters: ProductFilters = {
      category: this.selectedCategory() || undefined,
      store: this.selectedStore() || undefined,
      sortBy: this.selectedSort() as any,
      priceRange: {
        min: this.minPrice(),
        max: this.maxPrice()
      }
    };
    this.filtersChange.emit(filters);
  }
}
