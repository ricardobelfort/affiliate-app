export type StoreType = 'amazon' | 'mercado_livre' | 'aliexpress' | 'shopee' | 'magalu' | 'outros';

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
  storeType?: StoreType;
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

export interface StoreInfo {
  type: StoreType;
  name: string;
  color: string;
  bgColor: string;
  icon?: string;
}

export const STORE_TYPES: Record<StoreType, StoreInfo> = {
  amazon: {
    type: 'amazon',
    name: 'Amazon',
    color: '#FF9900',
    bgColor: '#FFF3E0',
    icon: 'amazon'
  },
  mercado_livre: {
    type: 'mercado_livre',
    name: 'Mercado Livre',
    color: '#FFE600',
    bgColor: '#FFFDE7',
    icon: 'mercado_livre'
  },
  aliexpress: {
    type: 'aliexpress',
    name: 'AliExpress',
    color: '#E62E04',
    bgColor: '#FFEBEE',
    icon: 'aliexpress'
  },
  shopee: {
    type: 'shopee',
    name: 'Shopee',
    color: '#EE4D2D',
    bgColor: '#FFE5E0',
    icon: 'shopee'
  },
  magalu: {
    type: 'magalu',
    name: 'Magalu',
    color: '#0086FF',
    bgColor: '#E3F2FD',
    icon: 'magalu'
  },
  outros: {
    type: 'outros',
    name: 'Outros',
    color: '#757575',
    bgColor: '#F5F5F5',
    icon: 'store'
  }
};
