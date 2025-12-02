import { Routes } from '@angular/router';
import { ProductListPage } from './pages/product-list-page/product-list-page';
import { ProductDetailPage } from './pages/product-detail-page/product-detail-page';

export const routes: Routes = [
  {
    path: '',
    component: ProductListPage,
    title: 'Catálogo de Produtos | MinhaMarca'
  },
  {
    path: 'produto/:id',
    component: ProductDetailPage,
    title: 'Produto | MinhaMarca'
  },
  {
    path: 'categorias',
    component: ProductListPage,
    title: 'Categorias | MinhaMarca'
  },
  {
    path: 'ofertas',
    component: ProductListPage,
    title: 'Ofertas | MinhaMarca'
  },
  {
    path: 'contato',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
