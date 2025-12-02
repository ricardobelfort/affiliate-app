# Afiliados-Ofertas - Template de Catálogo E-commerce

Template frontend completo desenvolvido com **Angular 19** e **Tailwind CSS** para catálogo de produtos de afiliados.

## 🎨 Características

### Design

- ✨ **Tema claro, moderno e minimalista**
- 📱 **Totalmente responsivo** (mobile-first)
- 🎯 **UX otimizada** com hover effects e transições suaves
- ♿ **Acessível** seguindo padrões WCAG AA
- 🔍 **SEO-friendly** com metatags dinâmicas

### Funcionalidades

#### Página de Listagem (Catálogo)

- Grid responsivo (1-4 colunas conforme dispositivo)
- Sistema de filtros por categoria, loja, preço e ordenação
- Busca de produtos em tempo real
- Paginação completa
- Cards de produtos com:
  - Imagem responsiva
  - Nome e descrição curta
  - Preço atual e antigo (com desconto)
  - Badges (Oferta, Mais Vendido, Novo)
  - Botões de ação (Ver Detalhes, Ver Oferta)

#### Página de Detalhes do Produto

- Galeria de imagens com thumbnail selector
- Informações completas do produto
- Lista de características
- Descrição detalhada
- Metatags SEO (Open Graph, Twitter Card)
- Breadcrumb navigation
- Botão de CTA destacado para link de afiliado

#### Componentes de Layout

- **Header**: Logo, busca responsiva, menu hambúrguer mobile
- **Footer**: Links institucionais e copyright
- **Navegação**: Rotas configuradas para categorias, ofertas e contato

## 🏗️ Estrutura do Projeto

```
src/app/
├── models/              # Interfaces e tipos
│   └── product.model.ts
├── services/            # Serviços (com mock data)
│   └── product.service.ts
├── components/          # Componentes reutilizáveis
│   ├── header/
│   ├── footer/
│   ├── product-card/
│   ├── product-list/
│   ├── product-filters/
│   └── pagination/
└── pages/              # Páginas da aplicação
    ├── product-list-page/
    └── product-detail-page/
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação e Execução

```bash
# Instalar dependências (já instaladas)
npm install

# Executar em modo desenvolvimento
npm start

# Build para produção
npm run build
```

A aplicação estará disponível em `http://localhost:4200`

## 🎯 Tecnologias Utilizadas

- **Angular 19** (standalone components)
- **Tailwind CSS** com configuração customizada
- **TypeScript** com strict mode
- **RxJS** para programação reativa
- **Signals** para gerenciamento de estado
- **Angular Router** com lazy loading
- **Meta & Title Services** para SEO

## 📦 Próximos Passos

### Integração com Backend

O código está preparado para integração com API real:

```typescript
// src/app/services/product.service.ts
// Substituir os métodos mock por chamadas HTTP reais:

getProducts(filters?: ProductFilters, page = 1, pageSize = 9): Observable<PaginatedProducts> {
  return this.http.get<PaginatedProducts>(`${API_URL}/products`, {
    params: { ...filters, page, pageSize }
  });
}
```

### Sugestões de Melhorias

- [ ] Adicionar Server-Side Rendering (SSR) completo
- [ ] Implementar infinite scroll como alternativa à paginação
- [ ] Adicionar sistema de favoritos/wishlist
- [ ] Integrar com Supabase ou Firebase
- [ ] Adicionar analytics (Google Analytics, etc)
- [ ] Implementar filtros avançados salvos em localStorage
- [ ] Adicionar comparação de produtos
- [ ] Sistema de notificações de ofertas

## 🎨 Personalização

### Cores

Edite `tailwind.config.js` para alterar o tema de cores:

```javascript
colors: {
  primary: {
    // Cores personalizadas aqui
  }
}
```

### Fonte

Para trocar a fonte, atualize em `src/styles.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=SuaFonte:wght@300;400;500;600;700&display=swap');
```

## 📄 Licença

Este é um projeto template livre para uso comercial e pessoal.

## 🤝 Contribuições

Sinta-se à vontade para abrir issues ou pull requests com melhorias!

---

**Desenvolvido com ❤️ usando Angular e Tailwind CSS**
