-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;

-- 1. Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'Shirts',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Sales Table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Sale Items Table (maps products to a sale)
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Dummy Data for Demo (Matching Storefront UI)
INSERT INTO products (name, sku, price, stock, category, image_url) VALUES
('Premium Oxford Shirt', 'SHR-OXF-WHT', 4999.00, 45, 'Shirts', '/img/oxford.png'),
('Linen Summer Shirt', 'SHR-LIN-DBL', 3999.00, 20, 'Shirts', '/img/linen.png'),
('Casual Denim Shirt', 'SHR-DEN-BLU', 5499.00, 15, 'Shirts', '/img/denim.png'),
('Essential Graphic T-Shirt', 'TEE-GRA-BLK', 1499.00, 100, 'T-Shirts', '/img/graphic_tee.png'),
('Heavyweight Blank Tee', 'TEE-BLK-WHT', 999.00, 200, 'T-Shirts', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80'),
('Vintage Wash T-Shirt', 'TEE-VNT-GRY', 1999.00, 40, 'T-Shirts', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80');
