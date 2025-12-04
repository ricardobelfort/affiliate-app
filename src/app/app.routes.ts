import { Routes } from '@angular/router';
import { ProductListPage } from './pages/product-list-page/product-list-page';
import { ProductDetailPage } from './pages/product-detail-page/product-detail-page';
import { ContactPage } from './pages/contact/contact';
import { FAQPage } from './pages/faq/faq';
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
    title: 'Central Bom Preço | Catálogo de Produtos'
  },
  {
    path: 'produto/:id',
    component: ProductDetailPage,
    title: 'Central Bom Preço | Produto'
  },
  {
    path: 'categorias',
    component: ProductListPage,
    title: 'Central Bom Preço | Categorias'
  },
  {
    path: 'ofertas',
    component: ProductListPage,
    title: 'Central Bom Preço | Ofertas'
  },
  {
    path: 'contato',
    component: ContactPage,
    title: 'Central Bom Preço | Contato'
  },
  {
    path: 'faq',
    component: FAQPage,
    title: 'Central Bom Preço | Perguntas Frequentes'
  },
  {
    path: 'admin/login',
    component: LoginPage,
    title: 'Central Bom Preço | Login'
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
