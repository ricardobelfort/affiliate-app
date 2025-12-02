import { Component, signal, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Product, Category, ProductFilters } from '../../models/product.model';
import { ProductList } from '../../components/product-list/product-list';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  standalone: true,
  selector: 'app-product-list-page',
  imports: [CommonModule, ProductList, Pagination],
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  stores = signal<string[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  pageSize = 9;
  currentFilters = signal<ProductFilters>({});
  selectedSort = signal<string>('relevant');
  selectedCategory = signal<string>('');
  selectedPriceRange = signal<string>('');

  ngOnInit() {
    this.loadCategories();
    this.loadStores();
    
    // Carregar produtos com filtros da query string
    this.route.queryParams.subscribe(params => {
      const page = parseInt(params['page']) || 1;
      const search = params['search'] || '';
      
      this.currentPage.set(page);
      if (search) {
        this.currentFilters.update(f => ({ ...f, search }));
      } else {
        this.currentFilters.update(f => ({ ...f, search: undefined }));
      }
      
      this.loadProducts();
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  loadStores() {
    this.productService.getStores().subscribe(stores => {
      this.stores.set(stores);
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts(
      this.currentFilters(),
      this.currentPage(),
      this.pageSize
    ).subscribe(result => {
      this.products.set(result.products);
      this.totalPages.set(result.totalPages);
      this.total.set(result.total);
      this.loading.set(false);
    });
  }

  onFiltersChange(filters: ProductFilters) {
    this.currentFilters.set(filters);
    this.currentPage.set(1);
    this.updateQueryParams();
    this.loadProducts();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updateQueryParams();
    this.loadProducts();
  }

  onSearch(query: string) {
    this.currentFilters.update(f => ({ ...f, search: query }));
    this.currentPage.set(1);
    this.updateQueryParams();
    this.loadProducts();
    if (query) {
      this.analytics.trackSearch(query, this.total());
    }
  }

  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const sortValue = select.value;
    this.selectedSort.set(sortValue);
    
    let sortBy: 'recent' | 'price-asc' | 'price-desc' | 'discount' | undefined;
    
    switch(sortValue) {
      case 'price-asc':
        sortBy = 'price-asc';
        break;
      case 'price-desc':
        sortBy = 'price-desc';
        break;
      case 'bestseller':
        sortBy = 'recent';
        break;
      default:
        sortBy = undefined;
    }
    
    this.currentFilters.update(f => ({ ...f, sortBy }));
    this.currentPage.set(1);
    this.loadProducts();
  }

  onCategoryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const category = select.value;
    this.selectedCategory.set(category);
    this.currentFilters.update(f => ({ ...f, category: category || undefined }));
    this.currentPage.set(1);
    this.loadProducts();
    if (category) {
      this.analytics.trackCategoryView(category);
    }
  }

  onPriceRangeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const range = select.value;
    this.selectedPriceRange.set(range);
    
    let priceRange: { min: number, max: number } | undefined;
    
    switch(range) {
      case '0-200':
        priceRange = { min: 0, max: 200 };
        break;
      case '200-500':
        priceRange = { min: 200, max: 500 };
        break;
      case '500-1000':
        priceRange = { min: 500, max: 1000 };
        break;
      case '1000+':
        priceRange = { min: 1000, max: 99999 };
        break;
      default:
        priceRange = undefined;
    }
    
    this.currentFilters.update(f => ({ ...f, priceRange }));
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearAllFilters() {
    this.selectedCategory.set('');
    this.selectedPriceRange.set('');
    this.selectedSort.set('relevant');
    this.currentFilters.set({});
    this.currentPage.set(1);
    this.loadProducts();
  }

  private updateQueryParams() {
    const queryParams: any = {
      page: this.currentPage() > 1 ? this.currentPage() : null,
      search: this.currentFilters().search || null,
    };
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
