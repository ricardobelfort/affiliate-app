import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = '/api/ai/generate';

  async generateShortDescription(productName: string): Promise<string> {
    return this.callAPI(productName, 'short');
  }

  async generateFullDescription(productName: string, shortDescription?: string): Promise<string> {
    return this.callAPI(productName, 'full', shortDescription);
  }

  private async callAPI(productName: string, type: 'short' | 'full', shortDescription?: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          type,
          shortDescription
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, error);
        throw new Error(error.error || 'Failed to generate description');
      }

      const data = await response.json();
      return data.description;

    } catch (error) {
      console.error('Error calling AI API:', error);
      throw error;
    }
  }
}
