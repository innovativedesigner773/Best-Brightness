-- ============================================
-- PROMOTIONS AND HOT DEALS SYSTEM SETUP
-- ============================================
-- Complete database schema for promotions system
-- Run this script in your Supabase SQL editor

-- 1. Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping')),
    value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_limit_per_customer INTEGER DEFAULT 1,
    current_usage_count INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_products', 'specific_categories')),
    conditions JSONB DEFAULT '{}',
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create promotion_products junction table
CREATE TABLE IF NOT EXISTS promotion_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promotion_id, product_id)
);

-- 3. Create promotion_categories junction table
CREATE TABLE IF NOT EXISTS promotion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promotion_id, category_id)
);

-- 4. Create inventory table for advanced stock management
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location TEXT NOT NULL DEFAULT 'main_warehouse',
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    reorder_quantity INTEGER DEFAULT 50,
    last_stock_check TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, location)
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(type);

CREATE INDEX IF NOT EXISTS idx_promotion_products_promotion ON promotion_products(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_product ON promotion_products(product_id);

CREATE INDEX IF NOT EXISTS idx_promotion_categories_promotion ON promotion_categories(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_categories_category ON promotion_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location);

-- 6. Inventory management functions
CREATE OR REPLACE FUNCTION check_product_availability(
    p_product_id UUID,
    p_quantity INTEGER DEFAULT 1,
    p_location TEXT DEFAULT 'main_warehouse'
)
RETURNS BOOLEAN AS $$
DECLARE
    available_qty INTEGER;
BEGIN
    SELECT quantity_available - quantity_reserved
    INTO available_qty
    FROM inventory
    WHERE product_id = p_product_id
    AND location = p_location;
    
    RETURN COALESCE(available_qty, 0) >= p_quantity;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reserve_inventory(
    p_product_id UUID,
    p_quantity INTEGER,
    p_location TEXT DEFAULT 'main_warehouse'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if enough inventory is available
    IF NOT check_product_availability(p_product_id, p_quantity, p_location) THEN
        RETURN FALSE;
    END IF;
    
    -- Reserve the inventory
    UPDATE inventory
    SET quantity_reserved = quantity_reserved + p_quantity,
        updated_at = NOW()
    WHERE product_id = p_product_id
    AND location = p_location;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_inventory(
    p_product_id UUID,
    p_quantity INTEGER,
    p_location TEXT DEFAULT 'main_warehouse'
)
RETURNS VOID AS $$
BEGIN
    UPDATE inventory
    SET quantity_reserved = GREATEST(0, quantity_reserved - p_quantity),
        updated_at = NOW()
    WHERE product_id = p_product_id
    AND location = p_location;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fulfill_inventory(
    p_product_id UUID,
    p_quantity INTEGER,
    p_location TEXT DEFAULT 'main_warehouse'
)
RETURNS VOID AS $$
BEGIN
    UPDATE inventory
    SET quantity_available = quantity_available - p_quantity,
        quantity_reserved = GREATEST(0, quantity_reserved - p_quantity),
        updated_at = NOW()
    WHERE product_id = p_product_id
    AND location = p_location;
END;
$$ LANGUAGE plpgsql;

-- 7. Promotion validation function
CREATE OR REPLACE FUNCTION is_promotion_valid(
    p_promotion_id UUID,
    p_product_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_order_amount DECIMAL DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    promotion_record RECORD;
    product_eligible BOOLEAN := FALSE;
    category_eligible BOOLEAN := FALSE;
BEGIN
    -- Get promotion details
    SELECT * INTO promotion_record
    FROM promotions
    WHERE id = p_promotion_id
    AND is_active = true
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date >= NOW())
    AND (usage_limit IS NULL OR current_usage_count < usage_limit);
    
    -- If promotion not found or not valid, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check minimum order amount
    IF p_order_amount < promotion_record.minimum_order_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Check applicability
    IF promotion_record.applies_to = 'all' THEN
        RETURN TRUE;
    ELSIF promotion_record.applies_to = 'specific_products' AND p_product_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM promotion_products 
            WHERE promotion_id = p_promotion_id 
            AND product_id = p_product_id
        ) INTO product_eligible;
        RETURN product_eligible;
    ELSIF promotion_record.applies_to = 'specific_categories' AND p_category_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM promotion_categories 
            WHERE promotion_id = p_promotion_id 
            AND category_id = p_category_id
        ) INTO category_eligible;
        RETURN category_eligible;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 8. Calculate promotion discount function
CREATE OR REPLACE FUNCTION calculate_promotion_discount(
    p_promotion_id UUID,
    p_order_amount DECIMAL,
    p_quantity INTEGER DEFAULT 1
)
RETURNS DECIMAL AS $$
DECLARE
    promotion_record RECORD;
    discount_amount DECIMAL := 0;
BEGIN
    -- Get promotion details
    SELECT * INTO promotion_record
    FROM promotions
    WHERE id = p_promotion_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate discount based on type
    CASE promotion_record.type
        WHEN 'percentage' THEN
            discount_amount := p_order_amount * (promotion_record.value / 100);
        WHEN 'fixed_amount' THEN
            discount_amount := promotion_record.value;
        WHEN 'buy_x_get_y' THEN
            -- This would require more complex logic based on specific products
            discount_amount := 0; -- Placeholder
        WHEN 'free_shipping' THEN
            discount_amount := 0; -- Handled separately in shipping logic
    END CASE;
    
    -- Apply maximum discount limit if set
    IF promotion_record.maximum_discount_amount IS NOT NULL THEN
        discount_amount := LEAST(discount_amount, promotion_record.maximum_discount_amount);
    END IF;
    
    RETURN discount_amount;
END;
$$ LANGUAGE plpgsql;

-- 9. Initialize inventory for existing products
INSERT INTO inventory (product_id, location, quantity_available)
SELECT 
    id,
    'main_warehouse',
    COALESCE(stock_quantity, 0)
FROM products
WHERE id NOT IN (SELECT product_id FROM inventory)
ON CONFLICT (product_id, location) DO NOTHING;

-- 10. Create RLS policies for promotions (adjust based on your auth setup)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage promotions (adjust role/user logic as needed)
CREATE POLICY "Admins can manage promotions" ON promotions
    FOR ALL USING (true); -- Adjust this based on your admin role logic

CREATE POLICY "Admins can manage promotion_products" ON promotion_products
    FOR ALL USING (true);

CREATE POLICY "Admins can manage promotion_categories" ON promotion_categories
    FOR ALL USING (true);

CREATE POLICY "Admins can manage inventory" ON inventory
    FOR ALL USING (true);

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Sample promotions
INSERT INTO promotions (name, code, description, type, value, minimum_order_amount, start_date, end_date, applies_to) VALUES
('Summer Sale 2025', 'SUMMER25', '25% off all cleaning supplies', 'percentage', 25.00, 50.00, NOW(), NOW() + INTERVAL '30 days', 'all'),
('Free Shipping Weekend', 'FREESHIP', 'Free shipping on orders over $100', 'free_shipping', 0.00, 100.00, NOW(), NOW() + INTERVAL '3 days', 'all'),
('Buy 2 Get 1 Free Equipment', 'B2G1FREE', 'Buy 2 equipment items, get 1 free', 'buy_x_get_y', 100.00, 0.00, NOW(), NOW() + INTERVAL '14 days', 'specific_categories'),
('Flash Sale Detergents', 'FLASH50', '$50 off detergent orders over $200', 'fixed_amount', 50.00, 200.00, NOW(), NOW() + INTERVAL '7 days', 'specific_categories');

COMMENT ON TABLE promotions IS 'Stores all promotional campaigns and discount codes';
COMMENT ON TABLE promotion_products IS 'Links promotions to specific products';
COMMENT ON TABLE promotion_categories IS 'Links promotions to specific categories';
COMMENT ON TABLE inventory IS 'Advanced inventory management with reservations';
