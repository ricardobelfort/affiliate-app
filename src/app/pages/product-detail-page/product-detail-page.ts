import { Component, signal, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ProductService } from '../../services/product.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);
  private analytics = inject(AnalyticsService);

  product = signal<Product | undefined>(undefined);
  selectedImage = signal<string>('');
  loading = signal(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe(product => {
      if (product) {
        this.product.set(product);
        this.selectedImage.set(product.image);
        this.setMetaTags(product);
        this.analytics.trackProductView(product.name, product.id, product.category);
      } else {
        this.router.navigate(['/']);
      }
      this.loading.set(false);
    });
  }

  selectImage(image: string) {
    this.selectedImage.set(image);
  }

  trackAffiliateClick() {
    const product = this.product();
    if (product) {
      this.analytics.trackAffiliateClick(product.name, product.id, product.affiliateLink);
    }
  }

  private setMetaTags(product: Product) {
    // Page title
    this.title.setTitle(`${product.name} | MinhaMarca`);

    // Meta description
    this.meta.updateTag({
      name: 'description',
      content: product.shortDescription
    });

    // Open Graph tags
    this.meta.updateTag({
      property: 'og:title',
      content: product.name
    });

    this.meta.updateTag({
      property: 'og:description',
      content: product.shortDescription
    });

    this.meta.updateTag({
      property: 'og:image',
      content: product.image
    });

    this.meta.updateTag({
      property: 'og:type',
      content: 'product'
    });

    // Twitter Card tags
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image'
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: product.name
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: product.shortDescription
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: product.image
    });
  }
}
