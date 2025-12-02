# 🎯 Sistema de Links Afiliados - Guia Completo

## 📋 Visão Geral

Sistema que permite múltiplos usuários (você, David e Lilian) gerenciarem seus próprios links afiliados para cada produto.

## 🏗️ Arquitetura Implementada

### Tabelas Criadas

#### 1. `user_affiliate_links`

Armazena os links afiliados de cada usuário por produto.

```sql
- id: UUID (chave primária)
- user_id: UUID (referência ao usuário)
- product_id: UUID (referência ao produto)
- affiliate_link: TEXT (link afiliado único do usuário)
- commission_rate: DECIMAL (taxa de comissão, ex: 5.00 = 5%)
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMP
- UNIQUE(user_id, product_id) ← Cada usuário tem 1 link por produto
```

#### 2. `affiliate_clicks`

Rastreia todos os cliques e conversões.

```sql
- id: UUID
- user_affiliate_link_id: UUID (qual link foi clicado)
- user_id: UUID (quem clicou - opcional)
- product_id: UUID
- clicked_at: TIMESTAMP
- ip_address, user_agent: TEXT
- converted: BOOLEAN
- conversion_value, commission_earned: DECIMAL
- converted_at: TIMESTAMP
```

## 🔄 Como Funciona

### Fluxo Básico

1. **Cadastro de Link**

   - Você, David ou Lilian acessam o produto
   - Adicionam seu link afiliado pessoal da Amazon
   - Sistema armazena: `user_affiliate_links`

2. **Visitante Acessa o Site**
   - Vê um produto
   - Clica no botão "Comprar"
3. **Sistema Decide Qual Link Usar**

   - Opção A: Link do usuário logado (se for vocês 3)
   - Opção B: Link rotativo (distribui entre vocês 3)
   - Opção C: Link baseado em quem cadastrou o produto

4. **Rastreamento**

   - Sistema registra o clique em `affiliate_clicks`
   - Armazena: qual link, quando, IP, etc.

5. **Comissões**
   - Quando há conversão, atualiza `converted = true`
   - Calcula comissão baseada em `commission_rate`

## 💡 Estratégias de Distribuição de Links

### Estratégia 1: Round-Robin (Recomendada)

Distribui cliques igualmente entre os 3 usuários.

```typescript
// Exemplo de implementação
async getAffiliateLinkForProduct(productId: string) {
  // Busca todos os links ativos para o produto
  const links = await getUserLinksForProduct(productId);

  // Seleciona o link com menos cliques
  const linkWithLeastClicks = links.sort((a, b) =>
    a.clickCount - b.clickCount
  )[0];

  return linkWithLeastClicks;
}
```

### Estratégia 2: Por Criador do Produto

Quem adiciona o produto fica com 100% dos cliques.

```typescript
// No produto, adicionar campo
product.created_by = user_id;

// Ao clicar, usar link do criador
const link = await getUserLinkForProduct(productId, product.created_by);
```

### Estratégia 3: Percentual Fixo

Você: 50%, David: 25%, Lilian: 25%

```typescript
const random = Math.random();
if (random < 0.5) return linkRicardo;
else if (random < 0.75) return linkDavid;
else return linkLilian;
```

## 🎨 Interface Admin - Funcionalidades

### Página: Meus Links Afiliados

```
┌─────────────────────────────────────────┐
│  Meus Links Afiliados                   │
├─────────────────────────────────────────┤
│                                          │
│  📊 Dashboard                            │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ 1,234│  │  45  │  │R$ 567│          │
│  │Cliques│ │Conver│  │Comiss│          │
│  └──────┘  └──────┘  └──────┘          │
│                                          │
│  📦 Produtos sem Link (3)               │
│  ┌────────────────────────────────┐    │
│  │ iPhone 15 Pro                   │    │
│  │ [+ Adicionar meu link afiliado] │    │
│  └────────────────────────────────┘    │
│                                          │
│  ✅ Meus Links Ativos (15)              │
│  ┌────────────────────────────────┐    │
│  │ Notebook Dell                   │    │
│  │ 📊 234 cliques | R$ 45,67       │    │
│  │ [✏️ Editar] [❌ Remover]        │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Componentes a Criar

1. **affiliate-links-manager.component.ts**

   - Lista produtos sem link
   - Lista links ativos do usuário
   - Dashboard de estatísticas

2. **affiliate-link-form.component.ts**
   - Modal para adicionar/editar link
   - Validação de URL Amazon
   - Campo de taxa de comissão

## 🚀 Próximos Passos de Implementação

### 1. Atualizar Product Card (Frontend)

```typescript
// src/app/components/product-card/product-card.ts
async handleBuyClick() {
  // Buscar link afiliado adequado
  const affiliateLink = await this.affiliateService
    .getAffiliateLinkForProduct(this.product.id);

  // Registrar clique
  await this.affiliateService.trackClick(
    this.product.id,
    affiliateLink.id
  );

  // Redirecionar para Amazon
  window.open(affiliateLink.affiliateLink, '_blank');
}
```

### 2. Criar Página de Gestão

```bash
# Criar componentes
ng generate component pages/admin/affiliate-links
ng generate component pages/admin/affiliate-link-form
```

### 3. Adicionar Rota

```typescript
// src/app/app.routes.ts
{
  path: 'admin/affiliate-links',
  component: AffiliateLinkListPage,
  canActivate: [authGuard]
}
```

## 📊 Dashboard de Comissões

### Métricas Importantes

1. **Por Usuário**

   - Total de cliques
   - Taxa de conversão
   - Comissão total (R$)
   - Produtos com link ativo

2. **Por Produto**

   - Qual produto gera mais cliques
   - Qual tem melhor conversão
   - Ranking de produtos

3. **Timeline**
   - Cliques por dia/semana/mês
   - Tendências de conversão
   - Sazonalidade

## 🔐 Segurança (RLS já implementado)

- ✅ Cada usuário vê apenas seus próprios links
- ✅ Não pode editar links de outros usuários
- ✅ Cliques são públicos (para analytics)
- ✅ Cascade delete: ao deletar produto, remove links

## 🎯 Casos de Uso

### Vocês 3 (Admin)

1. Login no sistema
2. Acessar "Meus Links Afiliados"
3. Ver produtos sem link
4. Adicionar link da Amazon
5. Acompanhar estatísticas

### Visitante do Site

1. Navega pelos produtos
2. Clica em "Comprar"
3. Sistema redireciona com link de um de vocês
4. Compra na Amazon
5. Vocês ganham comissão

## 📝 Exemplo de Dados

```json
// Ricardo - iPhone 15
{
  "user_id": "ricardo-uuid",
  "product_id": "iphone-15-uuid",
  "affiliate_link": "https://amazon.com/dp/ABC123?tag=ricardo-tag",
  "commission_rate": 5.00
}

// David - iPhone 15
{
  "user_id": "david-uuid",
  "product_id": "iphone-15-uuid",
  "affiliate_link": "https://amazon.com/dp/ABC123?tag=david-tag",
  "commission_rate": 5.00
}

// Lilian - iPhone 15
{
  "user_id": "lilian-uuid",
  "product_id": "iphone-15-uuid",
  "affiliate_link": "https://amazon.com/dp/ABC123?tag=lilian-tag",
  "commission_rate": 5.00
}
```

## 🤔 Decisões Pendentes

1. **Qual estratégia de distribuição usar?**

   - Round-robin (igual para todos)
   - Por criador do produto
   - Percentual fixo

2. **Produtos sem link de algum de vocês?**

   - Mostrar aviso no admin
   - Desabilitar botão "Comprar"
   - Usar link padrão

3. **Como rastrear conversões?**
   - Manualmente (vocês atualizam)
   - API da Amazon (se disponível)
   - Webhook

## 📞 Implementação Imediata

Quer que eu crie agora:

1. ✅ Banco de dados (JÁ FEITO)
2. ✅ Models e Services (JÁ FEITO)
3. ⏳ Página "Meus Links Afiliados"
4. ⏳ Formulário de adicionar link
5. ⏳ Atualizar Product Card para usar links
6. ⏳ Dashboard de estatísticas

Qual você quer que eu implemente primeiro?
