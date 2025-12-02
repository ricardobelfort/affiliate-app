-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
    image TEXT NOT NULL,
    affiliate_link TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (read-only for public)
CREATE POLICY "Allow public read access to categories" 
ON public.categories FOR SELECT 
TO public 
USING (true);

-- Admin users can insert/update/delete categories
CREATE POLICY "Allow authenticated users to manage categories" 
ON public.categories FOR ALL 
TO authenticated 
USING (true);

-- Create policies for products (read-only for public)
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
TO public 
USING (true);

-- Admin users can insert/update/delete products
CREATE POLICY "Allow authenticated users to manage products" 
ON public.products FOR ALL 
TO authenticated 
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO public.categories (name, slug) VALUES
    ('Eletrônicos', 'eletronicos'),
    ('Informática', 'informatica'),
    ('Áudio', 'audio'),
    ('Fotografia', 'fotografia'),
    ('Casa e Decoração', 'casa-decoracao'),
    ('Esportes', 'esportes')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products (usando os mockados atuais)
INSERT INTO public.products (name, short_description, description, price, category, image, affiliate_link, rating) VALUES
    (
        'Smartphone Galaxy S23',
        'Smartphone top de linha com câmera de 200MP',
        'O Samsung Galaxy S23 oferece desempenho excepcional com processador Snapdragon, tela AMOLED de 6.1" e sistema de câmeras profissional.',
        3499.99,
        'eletronicos',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        'https://amzn.to/exemplo1',
        4.5
    ),
    (
        'Notebook Dell XPS 15',
        'Notebook profissional com Intel i7 e 16GB RAM',
        'Dell XPS 15 combina poder e portabilidade. Ideal para profissionais que precisam de desempenho em movimento.',
        7299.99,
        'informatica',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        'https://amzn.to/exemplo2',
        4.8
    ),
    (
        'Fone Sony WH-1000XM5',
        'Fone com cancelamento de ruído premium',
        'Os melhores fones com cancelamento de ruído do mercado. Qualidade de áudio excepcional e conforto para o dia todo.',
        1899.00,
        'audio',
        'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
        'https://amzn.to/exemplo3',
        5.0
    ),
    (
        'Câmera Canon EOS R6',
        'Câmera mirrorless full-frame profissional',
        'Canon EOS R6 oferece qualidade de imagem excepcional com 20MP, gravação em 4K60 e estabilização de 8 stops.',
        15999.00,
        'fotografia',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        'https://amzn.to/exemplo4',
        4.9
    ),
    (
        'Mouse Logitech MX Master 3',
        'Mouse ergonômico para produtividade',
        'O melhor mouse para profissionais. Ergonomia perfeita, bateria que dura 70 dias e controles customizáveis.',
        549.99,
        'informatica',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
        'https://amzn.to/exemplo5',
        4.7
    ),
    (
        'Tablet iPad Air',
        'Tablet poderoso com chip M1',
        'iPad Air com chip M1 oferece desempenho de notebook em um corpo fino e leve. Perfeito para trabalho e entretenimento.',
        4999.00,
        'eletronicos',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        'https://amzn.to/exemplo6',
        4.6
    ),
    (
        'Teclado Mecânico Keychron K2',
        'Teclado mecânico wireless com RGB',
        'Keychron K2 oferece switches mecânicos premium, conectividade Bluetooth/USB e iluminação RGB customizável.',
        799.00,
        'informatica',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
        'https://amzn.to/exemplo7',
        4.4
    ),
    (
        'Caixa de Som JBL Flip 6',
        'Caixa Bluetooth portátil à prova d\'água',
        'JBL Flip 6 entrega som potente em um corpo compacto e resistente. 12 horas de bateria e IPX7.',
        699.00,
        'audio',
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
        'https://amzn.to/exemplo8',
        4.3
    )
ON CONFLICT DO NOTHING;
