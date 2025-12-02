import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { SupabaseService } from '../../../services/supabase.service';

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

  products = signal<Product[]>([]);
  loading = signal(true);
  deleting = signal<string | null>(null);
  userName = signal<string>('');
  greeting = signal<string>('');

  async ngOnInit() {
    await this.loadUserInfo();
    this.setGreeting();
    await this.loadProducts();
  }

  async loadUserInfo() {
    const { data } = await this.supabase.getSession();
    if (data.session?.user) {
      const name = data.session.user.email?.split('@')[0] || 'Admin';
      this.userName.set(name.charAt(0).toUpperCase() + name.slice(1));
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
    const product = this.products().find(p => p.id === id);
    const productName = product?.name || 'este produto';
    
    if (!confirm(`⚠️ Tem certeza que deseja deletar "${productName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    this.deleting.set(id);
    try {
      await this.productService.deleteProduct(id);
      alert('✓ Produto deletado com sucesso!');
      await this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('✗ Erro ao deletar produto. Tente novamente.');
    } finally {
      this.deleting.set(null);
    }
  }

  editProduct(id: string) {
    this.router.navigate(['/admin/products', id, 'edit']);
  }
}
