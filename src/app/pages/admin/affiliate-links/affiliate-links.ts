import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AffiliateService } from '../../../services/affiliate.service';
import { ProductService } from '../../../services/product.service';
import { UserAffiliateStats } from '../../../models/affiliate.model';
import { Product } from '../../../models/product.model';

interface ProductWithLink extends Product {
  userLink?: {
    id: string;
    affiliateLink: string;
    commissionRate: number;
    clickCount: number;
  };
}

@Component({
  selector: 'app-affiliate-links',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-links.html',
  styleUrl: './affiliate-links.css'
})
export class AffiliateLinksPage implements OnInit {
  private affiliateService = inject(AffiliateService);
  private productService = inject(ProductService);

  stats = signal<UserAffiliateStats>({
    totalClicks: 0,
    totalConversions: 0,
    totalCommission: 0,
    conversionRate: 0,
    activeLinks: 0
  });
  products = signal<ProductWithLink[]>([]);
  loading = signal(true);
  showAddLinkModal = signal(false);
  selectedProduct = signal<Product | null>(null);
  linkUrl = signal('');
  commissionRate = signal(5.0);
  saving = signal(false);
  showSuccessMessage = signal(false);
  successMessage = signal('');

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      // Carregar estatísticas
      const stats = await this.affiliateService.getUserStats();
      this.stats.set(stats);

      // Carregar produtos com links do usuário
      this.productService.getProducts({}, 1, 1000).subscribe({
        next: async (result) => {
          const productsWithLinks = await Promise.all(
            result.products.map(async (product) => {
              const link = await this.getUserLinkForProduct(product.id);
              return {
                ...product,
                userLink: link
              };
            })
          );
          this.products.set(productsWithLinks);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.loading.set(false);
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
      this.loading.set(false);
    }
  }

  async getUserLinkForProduct(productId: string) {
    try {
      const link = await this.affiliateService.getUserLinkForProduct(productId).toPromise();
      if (!link) return undefined;

      // Contar cliques
      const clicks = await this.getClickCountForLink(link.id);
      
      return {
        id: link.id,
        affiliateLink: link.affiliateLink,
        commissionRate: link.commissionRate,
        clickCount: clicks
      };
    } catch (error) {
      return undefined;
    }
  }

  async getClickCountForLink(linkId: string): Promise<number> {
    // Esta função seria implementada no service, mas por simplicidade:
    return 0;
  }

  getProductsWithoutLink(): ProductWithLink[] {
    return this.products().filter(p => !p.userLink);
  }

  getProductsWithLink(): ProductWithLink[] {
    return this.products().filter(p => p.userLink);
  }

  openAddLinkModal(product: Product) {
    this.selectedProduct.set(product);
    this.linkUrl.set('');
    this.commissionRate.set(5.0);
    this.showAddLinkModal.set(true);
  }

  closeAddLinkModal() {
    this.showAddLinkModal.set(false);
    this.selectedProduct.set(null);
  }

  async saveLink() {
    const product = this.selectedProduct();
    if (!product || !this.linkUrl()) return;

    this.saving.set(true);
    try {
      await this.affiliateService.upsertAffiliateLink(
        product.id,
        this.linkUrl(),
        this.commissionRate()
      );

      this.successMessage.set('Link afiliado adicionado com sucesso!');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);

      this.closeAddLinkModal();
      await this.loadData();
    } catch (error) {
      console.error('Error saving link:', error);
      this.successMessage.set('Erro ao salvar link. Tente novamente.');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteLink(linkId: string) {
    if (!confirm('Tem certeza que deseja remover este link afiliado?')) return;

    try {
      await this.affiliateService.deleteLink(linkId);
      this.successMessage.set('Link removido com sucesso!');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
      await this.loadData();
    } catch (error) {
      console.error('Error deleting link:', error);
      this.successMessage.set('Erro ao remover link. Tente novamente.');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
    }
  }
}
