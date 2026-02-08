-- RESET SCHEMA (Clean start for simplified schema)
-- WARNING: This will delete data in these specific tables, but source data in 'programs' is preserved.
DROP TABLE IF EXISTS blocks_game CASCADE;
DROP TABLE IF EXISTS topic_game CASCADE; -- Cleanup from previous attempt
DROP TABLE IF EXISTS game_categories CASCADE;

-- 1. Create Game Categories Table
CREATE TABLE game_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_locked BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Game Blocks Table (blocks_game)
-- Directly linked to game_categories
CREATE TABLE blocks_game (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES game_categories(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks_game ENABLE ROW LEVEL SECURITY;

-- Policies (Re-created after DROP)
CREATE POLICY "Public read game_categories" ON game_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated insert game_categories" ON game_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update game_categories" ON game_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete game_categories" ON game_categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read blocks_game" ON blocks_game FOR SELECT USING (true);
CREATE POLICY "Authenticated insert blocks_game" ON blocks_game FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update blocks_game" ON blocks_game FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete blocks_game" ON blocks_game FOR DELETE USING (auth.role() = 'authenticated');

-- MIGRATION SCRIPT (Flatten Programs -> Topics -> Blocks into Categories -> Blocks)
DO $$
DECLARE
    prog_rec RECORD;
    topic_rec RECORD;
    stage_rec RECORD;
    block_rec RECORD;
    new_cat_id UUID;
    global_order INTEGER;
BEGIN
    -- Loop through existing 'game_category' programs
    FOR prog_rec IN SELECT * FROM programs WHERE type = 'game_category' LOOP
        
        -- Insert into game_categories
        INSERT INTO game_categories (id, slug, title, description, icon, is_locked, order_index, created_at)
        VALUES (prog_rec.id, prog_rec.slug, prog_rec.title, prog_rec.description, prog_rec.icon, coalesce(prog_rec.is_locked, false), prog_rec.order_index, prog_rec.created_at)
        RETURNING id INTO new_cat_id;

        global_order := 0;

        -- Loop through topics of this program
        FOR topic_rec IN SELECT * FROM topics WHERE program_id = prog_rec.id ORDER BY order_index LOOP
            
            -- Insert a separator block for the topic
            INSERT INTO blocks_game (category_id, type, data, order_index)
            VALUES (new_cat_id, 'alert', jsonb_build_object('title', topic_rec.title, 'variant', 'info', 'message', 'Topic: ' || topic_rec.title), global_order);
            global_order := global_order + 1;

            -- Migrate content (blocks)
            FOR stage_rec IN SELECT * FROM stages WHERE topic_id = topic_rec.id ORDER BY order_index LOOP
                FOR block_rec IN SELECT * FROM blocks WHERE stage_id = stage_rec.id ORDER BY order_index LOOP
                    
                    INSERT INTO blocks_game (category_id, type, data, order_index, created_at)
                    VALUES (new_cat_id, block_rec.type, block_rec.data, global_order, block_rec.created_at);
                    
                    global_order := global_order + 1;
                END LOOP;
            END LOOP;

        END LOOP;
        
    -- Cleanup legacy config
    DELETE FROM site_config WHERE config_key = 'games_config';
END $$;
