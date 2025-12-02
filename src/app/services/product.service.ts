import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, Category, ProductFilters, PaginatedProducts } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  // Mock data - substituir por chamadas HTTP reais no futuro
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Smartphone Premium XR Pro',
      description: 'Smartphone top de linha com câmera de 108MP, tela AMOLED de 6.7", processador octa-core e bateria de longa duração. Perfeito para fotos, jogos e produtividade.',
      shortDescription: 'Smartphone com câmera 108MP e tela AMOLED 6.7"',
      price: 2499.90,
      oldPrice: 3299.90,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&h=800&fit=crop',
      ],
      category: 'eletronicos',
      store: 'TechStore',
      badge: 'offer',
      affiliateLink: 'https://example.com/product/1',
      features: ['Câmera 108MP', 'Tela AMOLED 6.7"', 'Bateria 5000mAh', '256GB armazenamento'],
      createdAt: new Date('2024-11-15'),
      discount: 24
    },
    {
      id: '2',
      name: 'Fone de Ouvido Bluetooth Premium',
      description: 'Fone over-ear com cancelamento de ruído ativo, até 30h de bateria, som Hi-Fi e conforto excepcional para uso prolongado.',
      shortDescription: 'Fone over-ear com cancelamento de ruído',
      price: 499.90,
      oldPrice: 699.90,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      ],
      category: 'audio',
      store: 'AudioPro',
      badge: 'bestseller',
      affiliateLink: 'https://example.com/product/2',
      features: ['Cancelamento de ruído', '30h de bateria', 'Bluetooth 5.0', 'Dobrável'],
      createdAt: new Date('2024-11-20'),
      discount: 29
    },
    {
      id: '3',
      name: 'Notebook Ultrabook Performance',
      description: 'Notebook ultra fino com processador Intel i7, 16GB RAM, SSD 512GB, tela Full HD de 14" e design premium em alumínio.',
      shortDescription: 'Notebook i7, 16GB RAM, SSD 512GB',
      price: 4299.90,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop',
      ],
      category: 'informatica',
      store: 'CompuWorld',
      badge: 'new',
      affiliateLink: 'https://example.com/product/3',
      features: ['Intel i7 11ª geração', '16GB RAM', 'SSD 512GB', 'Tela 14" Full HD'],
      createdAt: new Date('2024-11-25'),
    },
    {
      id: '4',
      name: 'Smartwatch Fitness Pro',
      description: 'Smartwatch com monitoramento de saúde completo, GPS integrado, resistente à água e bateria de 7 dias.',
      shortDescription: 'Smartwatch com GPS e monitoramento de saúde',
      price: 899.90,
      oldPrice: 1199.90,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      category: 'eletronicos',
      store: 'TechStore',
      badge: 'offer',
      affiliateLink: 'https://example.com/product/4',
      features: ['Monitor cardíaco', 'GPS integrado', 'Resistente à água', 'Bateria 7 dias'],
      createdAt: new Date('2024-11-10'),
      discount: 25
    },
    {
      id: '5',
      name: 'Câmera Digital Profissional',
      description: 'Câmera DSLR 24MP com lente 18-55mm, gravação 4K, tela touchscreen e estabilização de imagem.',
      shortDescription: 'Câmera DSLR 24MP com gravação 4K',
      price: 3199.90,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop',
      category: 'fotografia',
      store: 'PhotoExpress',
      affiliateLink: 'https://example.com/product/5',
      features: ['Sensor 24MP', 'Gravação 4K', 'Tela touchscreen 3"', 'WiFi integrado'],
      createdAt: new Date('2024-11-18'),
    },
    {
      id: '6',
      name: 'Tablet Android 10" Premium',
      description: 'Tablet com tela 10", processador octa-core, 4GB RAM, 128GB armazenamento e bateria de longa duração.',
      shortDescription: 'Tablet 10" com 128GB de armazenamento',
      price: 1299.90,
      oldPrice: 1699.90,
      image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=500&fit=crop',
      category: 'informatica',
      store: 'CompuWorld',
      badge: 'bestseller',
      affiliateLink: 'https://example.com/product/6',
      features: ['Tela 10" Full HD', '4GB RAM', '128GB storage', 'Android 13'],
      createdAt: new Date('2024-11-12'),
      discount: 24
    },
    {
      id: '7',
      name: 'Caixa de Som Bluetooth Portátil',
      description: 'Caixa de som potente com som 360°, à prova d\'água, 20h de bateria e iluminação LED.',
      shortDescription: 'Caixa de som Bluetooth à prova d\'água',
      price: 299.90,
      oldPrice: 449.90,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
      category: 'audio',
      store: 'AudioPro',
      badge: 'offer',
      affiliateLink: 'https://example.com/product/7',
      features: ['Som 360°', 'À prova d\'água IPX7', '20h bateria', 'Iluminação LED'],
      createdAt: new Date('2024-11-22'),
      discount: 33
    },
    {
      id: '8',
      name: 'Mouse Gamer RGB Precision',
      description: 'Mouse gamer com sensor óptico 16000 DPI, 7 botões programáveis e iluminação RGB customizável.',
      shortDescription: 'Mouse gamer 16000 DPI com RGB',
      price: 199.90,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
      category: 'informatica',
      store: 'GamersZone',
      badge: 'new',
      affiliateLink: 'https://example.com/product/8',
      features: ['16000 DPI', '7 botões programáveis', 'RGB customizável', 'Cabo trançado'],
      createdAt: new Date('2024-11-28'),
    },
  ];

  private mockCategories: Category[] = [
    { id: '1', name: 'Eletrônicos', slug: 'eletronicos' },
    { id: '2', name: 'Informática', slug: 'informatica' },
    { id: '3', name: 'Áudio', slug: 'audio' },
    { id: '4', name: 'Fotografia', slug: 'fotografia' },
  ];

  getProducts(filters?: ProductFilters, page = 1, pageSize = 9): Observable<PaginatedProducts> {
    let filteredProducts = [...this.mockProducts];

    // Aplicar filtros
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    if (filters?.store) {
      filteredProducts = filteredProducts.filter(p => p.store === filters.store);
    }

    if (filters?.priceRange) {
      filteredProducts = filteredProducts.filter(p =>
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      );
    }

    // Aplicar ordenação
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'recent':
          filteredProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
        case 'price-asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'discount':
          filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
          break;
      }
    }

    // Paginação
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const products = filteredProducts.slice(start, end);

    // Simular delay de API
    return of({
      products,
      total,
      page,
      pageSize,
      totalPages
    }).pipe(delay(300));
  }

  getProductById(id: string): Observable<Product | undefined> {
    const product = this.mockProducts.find(p => p.id === id);
    return of(product).pipe(delay(200));
  }

  getCategories(): Observable<Category[]> {
    return of(this.mockCategories);
  }

  getStores(): Observable<string[]> {
    const stores = [...new Set(this.mockProducts.map(p => p.store))];
    return of(stores);
  }
}
