import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreType, STORE_TYPES } from '../../models/product.model';

@Component({
  selector: 'app-store-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (storeInfo()) {
      <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-md border border-gray-200 p-2">
        @switch (storeInfo()!.type) {
          @case ('amazon') {
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
              alt="Amazon"
              class="w-full h-full object-contain"
            />
          }
          @case ('mercado_livre') {
            <img 
              src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years@2x.png" 
              alt="Mercado Livre"
              class="w-full h-full object-contain"
            />
          }
          @case ('aliexpress') {
            <img 
              src="https://ae01.alicdn.com/kf/HTB1yL16d8Cw3KVjSZFuq6AAOpXaw.png" 
              alt="AliExpress"
              class="w-full h-full object-contain"
            />
          }
          @case ('shopee') {
            <img 
              src="https://down-br.img.susercontent.com/file/br-50009109-1f3ea8f6236f8655d7a36c0337f47de3" 
              alt="Shopee"
              class="w-full h-full object-contain"
            />
          }
          @case ('magalu') {
            <img 
              src="https://logodownload.org/wp-content/uploads/2020/02/magazine-luiza-magalu-logo.png" 
              alt="Magalu"
              class="w-full h-full object-contain"
            />
          }
          @default {
            <svg class="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
          }
        }
      </div>
    }
  `
})
export class StoreBadgeComponent {
  storeType = input.required<StoreType>();
  
  storeInfo = () => STORE_TYPES[this.storeType()];
}
