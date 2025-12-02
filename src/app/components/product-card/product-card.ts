import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { AffiliateService } from '../../services/affiliate.service';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  private affiliateService = inject(AffiliateService);
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

  async onAddToCart() {
    try {
      // Buscar link usando Round-Robin (distribuição justa entre os 3 usuários)
      const affiliateLink = await this.affiliateService.getAffiliateLinkRoundRobin(this.product().id);
      
      if (affiliateLink) {
        // Registrar clique para estatísticas
        await this.affiliateService.trackClick(
          this.product().id,
          affiliateLink.id,
          undefined, // IP será capturado no backend se necessário
          navigator.userAgent
        );
        
        // Redirecionar para Amazon com link do usuário selecionado
        window.open(affiliateLink.affiliateLink, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback: usar link padrão do produto se nenhum usuário tiver link cadastrado
        console.warn('Nenhum link afiliado encontrado, usando link padrão');
        window.open(this.product().affiliateLink, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Erro ao buscar link afiliado:', error);
      // Fallback em caso de erro
      window.open(this.product().affiliateLink, '_blank', 'noopener,noreferrer');
    }
  }
}
