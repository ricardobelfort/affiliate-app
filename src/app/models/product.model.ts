export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string;
  store: string;
  badge?: 'offer' | 'bestseller' | 'new';
  affiliateLink: string;
  features?: string[];
  createdAt: Date;
  discount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  store?: string;
  priceRange?: PriceRange;
  sortBy?: 'recent' | 'price-asc' | 'price-desc' | 'discount';
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
