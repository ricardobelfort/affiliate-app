import { Injectable } from '@angular/core';
import { AmazonProductData } from '../models/amazon.model';

@Injectable({
  providedIn: 'root'
})
export class AmazonService {
  constructor() {}

  /**
   * Extrai o ASIN de uma URL da Amazon
   * Suporta vários formatos:
   * - amazon.com/dp/B08N5WRWNW
   * - amazon.com/gp/product/B08N5WRWNW
   * - amazon.com/product-name/dp/B08N5WRWNW
   * - amzn.to/xxx (short links precisam ser expandidos primeiro)
   */
  extractASIN(url: string): string | null {
    // Padrões comuns de URL da Amazon
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i,
      /ASIN[=:]([A-Z0-9]{10})/i,
      /\/([A-Z0-9]{10})(?:[/?]|$)/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Busca informações do produto via API serverless
   * A API chama a Amazon PA-API 5.0 de forma segura (credenciais no servidor)
   */
  async getProductData(asin: string): Promise<AmazonProductData | null> {
    try {
      const response = await fetch(`/api/amazon/import?asin=${encodeURIComponent(asin)}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, error);
        return null;
      }

      const data: AmazonProductData = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching Amazon product data:', error);
      return null;
    }
  }
}
