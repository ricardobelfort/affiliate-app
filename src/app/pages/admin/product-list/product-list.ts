import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class AdminProductListPage implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      this.productService.getProducts({}, 1, 100).subscribe({
        next: (result) => {
          this.products.set(result.products);
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

  async deleteProduct(id: string) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }

    this.deleting.set(id);
    try {
      await this.productService.deleteProduct(id);
      await this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao deletar produto');
    } finally {
      this.deleting.set(null);
    }
  }

  editProduct(id: string) {
    this.router.navigate(['/admin/products', id, 'edit']);
  }
}
