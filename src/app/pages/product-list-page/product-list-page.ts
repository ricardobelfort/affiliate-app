import { Component, signal, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, Category, ProductFilters } from '../../models/product.model';
import { ProductList } from '../../components/product-list/product-list';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  standalone: true,
  selector: 'app-product-list-page',
  imports: [CommonModule, ProductList, ProductFiltersComponent, Pagination],
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  stores = signal<string[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  pageSize = 9;
  currentFilters = signal<ProductFilters>({});

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
