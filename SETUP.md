# Setup do Projeto

## Configuração das Variáveis de Ambiente

### 1. Ambiente Local (Development)

Copie os arquivos de exemplo:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.development.example.ts src/environments/environment.development.ts
```

Edite os arquivos criados e substitua:
- `YOUR_SUPABASE_URL` pela URL do seu projeto Supabase
- `YOUR_SUPABASE_ANON_KEY` pela chave anônima do Supabase

### 2. Deploy na Vercel

Configure as seguintes variáveis de ambiente no dashboard da Vercel:

**Environment Variables:**
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase

**Como adicionar na Vercel:**
1. Acesse seu projeto na Vercel
2. Vá em Settings → Environment Variables
3. Adicione cada variável com o valor correspondente
4. Marque em quais ambientes ela deve estar disponível (Production, Preview, Development)

### 3. Onde encontrar as credenciais do Supabase

1. Acesse seu projeto no Supabase Dashboard
2. Vá em Settings → API
3. Copie:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`

## Instalação

```bash
npm install
```

## Executar localmente

```bash
npm start
```

## Build para produção

```bash
npm run build
```

## Estrutura do Banco de Dados

Execute o SQL em `supabase-schema.sql` no SQL Editor do Supabase para criar:
- Tabelas `categories` e `products`
- Políticas RLS (Row Level Security)
- Dados iniciais de exemplo
