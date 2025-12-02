import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { SupabaseService } from '../../../services/supabase.service';
import { AffiliateService } from '../../../services/affiliate.service';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class AdminProductListPage implements OnInit {
  private productService = inject(ProductService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private affiliateService = inject(AffiliateService);

  products = signal<Product[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);
  userName = signal<string>('');
  greeting = signal<string>('');
  showDeleteDialog = signal(false);
  productToDelete = signal<{ id: string; name: string } | null>(null);
  showSuccessMessage = signal(false);
  successMessage = signal('');
  selectedProducts = signal<Set<string>>(new Set());
  showBulkDeleteDialog = signal(false);
  deletingBulk = signal(false);
  sortColumn = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(10);
  totalProducts = signal(0);
  
  // Stats dinâmicos
  totalClicks = signal(0);
  estimatedCommission = signal(0);
  conversionRate = signal(0);

  async ngOnInit() {
    await this.loadUserInfo();
    this.setGreeting();
    await this.loadProducts();
    await this.loadStats();
  }

  async loadUserInfo() {
    const { data } = await this.supabase.getSession();
    if (data.session?.user) {
      const displayName = data.session.user.user_metadata?.['display_name'];
      const name = displayName || data.session.user.email?.split('@')[0] || 'Admin';
      this.userName.set(name);
    }
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      this.greeting.set('Bom dia');
    } else if (hour >= 12 && hour < 18) {
      this.greeting.set('Boa tarde');
    } else {
      this.greeting.set('Boa noite');
    }
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      this.productService.getProducts({}, 1, 1000).subscribe({
        next: (result) => {
          this.totalProducts.set(result.products.length);
          const sorted = this.sortProducts(result.products);
          this.products.set(sorted);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.loading.set(false);
        }
      });
    } catch (error) {
      console.error('Error loading products:', error);
      this.loading.set(false);
    }
  }

  async loadStats() {
    try {
      const stats = await this.affiliateService.getUserStats();
      this.totalClicks.set(stats.totalClicks);
      this.estimatedCommission.set(stats.totalCommission);
      this.conversionRate.set(stats.conversionRate);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  sortProducts(products: Product[]): Product[] {
    const sorted = [...products].sort((a, b) => {
      const aValue = this.getProductValue(a, this.sortColumn());
      const bValue = this.getProductValue(b, this.sortColumn());
      
      if (aValue < bValue) return this.sortDirection() === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  getProductValue(product: Product, column: string): any {
    switch (column) {
      case 'name': return product.name.toLowerCase();
      case 'category': return product.category.toLowerCase();
      case 'price': return product.price;
      default: return '';
    }
  }

  toggleSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    const sorted = this.sortProducts(this.products());
    this.products.set(sorted);
  }

  getPaginatedProducts(): Product[] {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.products().slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.products().length / this.pageSize());
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.selectedProducts.set(new Set());
  }

  nextPage() {
    if (this.currentPage() < this.getTotalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.selectedProducts.set(new Set());
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.selectedProducts.set(new Set());
    }
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }
    
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.products().length);
  }

  openDeleteDialog(id: string) {
    const product = this.products().find(p => p.id === id);
    if (product) {
      this.productToDelete.set({ id, name: product.name });
      this.showDeleteDialog.set(true);
    }
  }

  closeDeleteDialog() {
    this.showDeleteDialog.set(false);
    this.productToDelete.set(null);
  }

  async confirmDelete() {
    const product = this.productToDelete();
    if (!product) return;

    this.deleting.set(product.id);
    this.showDeleteDialog.set(false);
    
    try {
      await this.productService.deleteProduct(product.id);
      this.successMessage.set('Produto deletado com sucesso!');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
      await this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      this.successMessage.set('Erro ao deletar produto. Tente novamente.');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
    } finally {
      this.deleting.set(null);
      this.productToDelete.set(null);
    }
  }

  editProduct(id: string) {
    this.router.navigate(['/admin/products', id, 'edit']);
  }

  toggleSelectAll() {
    const selected = this.selectedProducts();
    const paginatedProducts = this.getPaginatedProducts();
    const allSelected = paginatedProducts.every(p => selected.has(p.id));
    
    if (allSelected) {
      // Desselecionar todos da página atual
      const newSelected = new Set(selected);
      paginatedProducts.forEach(p => newSelected.delete(p.id));
      this.selectedProducts.set(newSelected);
    } else {
      // Selecionar todos da página atual
      const newSelected = new Set(selected);
      paginatedProducts.forEach(p => newSelected.add(p.id));
      this.selectedProducts.set(newSelected);
    }
  }

  toggleProduct(id: string) {
    const selected = new Set(this.selectedProducts());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedProducts.set(selected);
  }

  isSelected(id: string): boolean {
    return this.selectedProducts().has(id);
  }

  isAllSelected(): boolean {
    const paginatedProducts = this.getPaginatedProducts();
    return paginatedProducts.length > 0 && paginatedProducts.every(p => this.selectedProducts().has(p.id));
  }

  hasSelection(): boolean {
    return this.selectedProducts().size > 0;
  }

  openBulkDeleteDialog() {
    if (this.selectedProducts().size > 0) {
      this.showBulkDeleteDialog.set(true);
    }
  }

  closeBulkDeleteDialog() {
    this.showBulkDeleteDialog.set(false);
  }

  async confirmBulkDelete() {
    const selectedIds = Array.from(this.selectedProducts());
    if (selectedIds.length === 0) return;

    this.deletingBulk.set(true);
    this.showBulkDeleteDialog.set(false);

    try {
      await Promise.all(selectedIds.map(id => this.productService.deleteProduct(id)));
      this.successMessage.set(`${selectedIds.length} produto(s) deletado(s) com sucesso!`);
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
      this.selectedProducts.set(new Set());
      await this.loadProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      this.successMessage.set('Erro ao deletar produtos. Tente novamente.');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
    } finally {
      this.deletingBulk.set(false);
    }
  }
}
