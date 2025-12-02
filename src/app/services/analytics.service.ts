import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  /**
   * Track page views
   */
  trackPageView(url: string, title: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_path: url,
        page_title: title
      });
    }
  }

  /**
   * Track affiliate link clicks
   */
  trackAffiliateClick(productName: string, productId: string, affiliateUrl: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'affiliate_click', {
        event_category: 'Affiliate',
        event_label: productName,
        product_id: productId,
        affiliate_url: affiliateUrl
      });
    }
  }

  /**
   * Track product views
   */
  trackProductView(productName: string, productId: string, category: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        event_category: 'Product',
        event_label: productName,
        product_id: productId,
        product_category: category
      });
    }
  }

  /**
   * Track category views
   */
  trackCategoryView(categoryName: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_category', {
        event_category: 'Navigation',
        event_label: categoryName
      });
    }
  }

  /**
   * Track search queries
   */
  trackSearch(searchTerm: string, resultsCount: number): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: searchTerm,
        results_count: resultsCount
      });
    }
  }

  /**
   * Track custom events
   */
  trackEvent(eventName: string, eventParams?: any): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
    }
  }
}
