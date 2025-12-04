import { Routes } from '@angular/router';
import { ProductListPage } from './pages/product-list-page/product-list-page';
import { ProductDetailPage } from './pages/product-detail-page/product-detail-page';
import { LoginPage } from './pages/admin/login/login';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { AdminProductListPage } from './pages/admin/product-list/product-list';
import { AdminProductFormPage } from './pages/admin/product-form/product-form';
import { AffiliateLinksPage } from './pages/admin/affiliate-links/affiliate-links';
import { TeamStatsPage } from './pages/admin/team-stats/team-stats';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: ProductListPage,
    title: 'Catálogo de Produtos | Central Bom Preço'
  },
  {
    path: 'produto/:id',
    component: ProductDetailPage,
    title: 'Produto | Central Bom Preço'
  },
  {
    path: 'categorias',
    component: ProductListPage,
    title: 'Categorias | Central Bom Preço'
  },
  {
    path: 'ofertas',
    component: ProductListPage,
    title: 'Ofertas | Central Bom Preço'
  },
  {
    path: 'contato',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'admin/login',
    component: LoginPage,
    title: 'Login | Central Bom Preço'
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: 'products',
        component: AdminProductListPage,
        title: 'Produtos | Admin'
      },
      {
        path: 'products/new',
        component: AdminProductFormPage,
        title: 'Novo Produto | Admin'
      },
      {
        path: 'products/:id/edit',
        component: AdminProductFormPage,
        title: 'Editar Produto | Admin'
      },
      {
        path: 'affiliate-links',
        component: AffiliateLinksPage,
        title: 'Meus Links Afiliados | Admin'
      },
      {
        path: 'team-stats',
        component: TeamStatsPage,
        title: 'Indicadores de Esforço | Admin'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
