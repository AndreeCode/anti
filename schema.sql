-- ========================================
-- RESET: Eliminar todo antes de recrear
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS stats CASCADE;

-- ========================================
-- Tabla: users (Sincronizada con Auth)
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'cliente', -- admin / mesero / cliente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas Users
CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ========================================
-- Trigger: Auto-crear perfil público usuario
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'cliente')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- Tabla: tables (mesas)
-- ========================================
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER NOT NULL UNIQUE,
    seats INTEGER DEFAULT 4,
    status TEXT DEFAULT 'libre', -- libre / ocupada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for all" ON tables FOR SELECT USING (true);
CREATE POLICY "Admin/Mesero update status" ON tables 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'mesero'))
    );

-- ========================================
-- Tabla: categories
-- ========================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for all" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin insert/update/delete" ON categories 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================================
-- Tabla: dishes
-- ========================================
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    available BOOLEAN DEFAULT TRUE,
    is_offer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for all" ON dishes FOR SELECT USING (true);
CREATE POLICY "Admin can modify dishes" ON dishes 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================================
-- Tabla: orders
-- ========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'para_llevar', 'recojer', 'transporte'
    status TEXT DEFAULT 'pendiente', -- pendiente / en_preparacion / listo / entregado / cancelado
    total_price NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Users can see their own orders
CREATE POLICY "Users view own orders" ON orders 
    FOR SELECT USING (auth.uid() = user_id);
-- Staff can see all orders
CREATE POLICY "Staff view all orders" ON orders 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'mesero'))
    );
-- Users can create orders
CREATE POLICY "Users create orders" ON orders 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Staff can update orders
CREATE POLICY "Staff update orders" ON orders 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'mesero'))
    );

-- ========================================
-- Tabla: order_items
-- ========================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for order owners and staff" ON order_items 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'mesero')))
        )
    );
CREATE POLICY "Users create items" ON order_items 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- ========================================
-- Datos de ejemplo (Seed)
-- ========================================

-- Permitir ejecución como bloque anónimo para usar variables
DO $$
DECLARE
    id_entradas UUID;
    id_fuertes UUID;
    id_bebidas UUID;
    id_postres UUID;
BEGIN
    -- 1. Limpiar e Insertar Categorías
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM dishes;
    DELETE FROM categories;
    DELETE FROM tables;

    INSERT INTO categories (name, description) VALUES ('Entradas', 'Para abrir el apetito') RETURNING id INTO id_entradas;
    INSERT INTO categories (name, description) VALUES ('Platos Fuertes', 'Nuestras especialidades') RETURNING id INTO id_fuertes;
    INSERT INTO categories (name, description) VALUES ('Bebidas', 'Refrescantes y naturales') RETURNING id INTO id_bebidas;
    INSERT INTO categories (name, description) VALUES ('Postres', 'El toque dulce final') RETURNING id INTO id_postres;

    -- 2. Insertar Platos
    INSERT INTO dishes (name, description, price, category_id, available) VALUES
    -- Entradas
    ('Guacamole Tradicional', 'Aguacate fresco, pico de gallo y totopos caseros', 8.50, id_entradas, true),
    ('Queso Fundido', 'Mezcla de quesos con chorizo o champiñones', 10.00, id_entradas, true),
    ('Empanadas de Carne', '3 piezas servidas con chimichurri', 9.00, id_entradas, true),
    
    -- Platos Fuertes
    ('Tacos al Pastor', 'Orden de 5 tacos con piña, cilantro y cebolla', 12.00, id_fuertes, true),
    ('Enchiladas Suizas', 'Rellenas de pollo, bañadas en salsa verde cremosa y gratinadas', 14.50, id_fuertes, true),
    ('Fajitas Mixtas', 'Pollo y res a la plancha con pimientos y cebolla', 18.00, id_fuertes, true),
    ('Hamburguesa Ejuem', 'Carne Angus 200g, queso gouda, tocino y aderezo especial', 15.50, id_fuertes, true),
    ('Salmón a la Parrilla', 'Acompañado de espárragos y puré de papá', 22.00, id_fuertes, true),

    -- Bebidas
    ('Horchata Artesanal', 'Bebida de arroz con canela', 3.50, id_bebidas, true),
    ('Limonada con Menta', 'Fresca y natural', 3.50, id_bebidas, true),
    ('Cerveza Nacional', 'Corona, Victoria o Modelo', 4.50, id_bebidas, true),
    ('Coca-Cola', 'Lata 355ml', 2.50, id_bebidas, true),

    -- Postres
    ('Flan Napolitano', 'Casero con caramelo', 5.00, id_postres, true),
    ('Churros con Chocolate', '4 piezas con dip de chocolate caliente', 6.00, id_postres, true),
    ('Pastel de Tres Leches', 'Tradicional, húmedo y dulce', 6.50, id_postres, true);

    -- 3. Insertar Mesas
    INSERT INTO tables (number, seats, status) VALUES
    (1, 2, 'libre'), (2, 2, 'libre'),
    (3, 4, 'libre'), (4, 4, 'libre'), (5, 4, 'libre'),
    (6, 6, 'libre'), (7, 8, 'libre');

END $$;
