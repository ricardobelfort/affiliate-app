import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, from, map as rxMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, Category, ProductFilters, PaginatedProducts } from '../models/product.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);

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
    return from(this.fetchProducts(filters, page, pageSize));
  }

  private async fetchProducts(filters?: ProductFilters, page = 1, pageSize = 9): Promise<PaginatedProducts> {
    let query = this.supabase.client
      .from('products')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.priceRange) {
      query = query
        .gte('price', filters.priceRange.min)
        .lte('price', filters.priceRange.max);
    }

    // Aplicar ordenação
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'discount':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Aplicar paginação
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    const products: Product[] = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      shortDescription: p.short_description,
      price: Number(p.price),
      oldPrice: p.old_price ? Number(p.old_price) : undefined,
      image: p.image,
      images: [p.image],
      category: p.category,
      storeType: p.store_type || 'outros',
      store: 'Loja Parceira',
      affiliateLink: p.affiliate_link,
      features: [],
      createdAt: new Date(p.created_at),
    }));

    return {
      products,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  getProductById(id: string): Observable<Product | undefined> {
    return from(this.fetchProductById(id));
  }

  private async fetchProductById(id: string): Promise<Product | undefined> {
    const { data, error } = await this.supabase.client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching product:', error);
      return undefined;
    }

    const p: any = data;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      shortDescription: p.short_description,
      price: Number(p.price),
      oldPrice: p.old_price ? Number(p.old_price) : undefined,
      image: p.image,
      images: [p.image],
      category: p.category,
      storeType: p.store_type || 'outros',
      store: 'Loja Parceira',
      affiliateLink: p.affiliate_link,
      features: [],
      createdAt: new Date(p.created_at),
    };
  }

  getCategories(): Observable<Category[]> {
    return from(this.fetchCategories());
  }

  private async fetchCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.client
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug
    }));
  }

  getStores(): Observable<string[]> {
    // Por enquanto retorna array fixo, pode ser expandido depois
    return of(['Loja Parceira']);
  }

  // Admin methods
  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const { data, error } = await (this.supabase.client as any)
      .from('products')
      .insert({
        name: product.name,
        short_description: product.shortDescription,
        description: product.description,
        price: product.price,
        old_price: product.oldPrice || null,
        category: product.category,
        store_type: product.storeType || 'outros',
        image: product.image,
        rating: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      shortDescription: data.short_description,
      price: Number(data.price),
      oldPrice: data.old_price ? Number(data.old_price) : undefined,
      image: data.image,
      images: [data.image],
      category: data.category,
      storeType: data.store_type,
      store: 'Loja Parceira',
      affiliateLink: '',
      features: [],
      createdAt: new Date(data.created_at),
    };
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const updateData: Record<string, any> = {};
    
    if (product.name) updateData['name'] = product.name;
    if (product.shortDescription) updateData['short_description'] = product.shortDescription;
    if (product.description) updateData['description'] = product.description;
    if (product.price) updateData['price'] = product.price;
    if (product.oldPrice !== undefined) updateData['old_price'] = product.oldPrice || null;
    if (product.category) updateData['category'] = product.category;
    if (product.storeType) updateData['store_type'] = product.storeType;
    if (product.image) updateData['image'] = product.image;
    
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await (this.supabase.client as any)
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    const p: any = data;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      shortDescription: p.short_description,
      price: Number(p.price),
      oldPrice: p.old_price ? Number(p.old_price) : undefined,
      image: p.image,
      images: [p.image],
      category: p.category,
      storeType: p.store_type || 'outros',
      store: 'Loja Parceira',
      affiliateLink: '',
      features: [],
      createdAt: new Date(p.created_at),
    };
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}
