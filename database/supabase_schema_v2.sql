-- ============================================
-- Supabase Database Schema - Normalized Structure
-- Version: 2.0
-- Created: 2026-02-08
-- ============================================

-- ============================================
-- 1. CORE CONTENT TABLES
-- ============================================

-- Programs (Curriculum Programs)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics (Lessons/Materials)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  thumbnail TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, slug)
);

-- Stages (Lesson Stages)
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocks (Content Blocks)
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'vocab', 'alert', 'youtube', 'audio', 'pdf', 'matchup', 'quiz', 'anagram', 'completesentence', 'unjumble', 'spinwheel', 'wordclassification', 'harakat')),
  title TEXT,
  thumbnail TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. GAME TABLES
-- ============================================

-- Games (Game Definitions) - DEPRECATED in favor of blocks with game types
-- Keeping for reference, but games are now stored as blocks with type = game type

-- Game Questions (for blocks with game types)
CREATE TABLE IF NOT EXISTS game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
  question_data JSONB NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CONFIGURATION TABLES
-- ============================================

-- Site Configuration (Global Settings)
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MEDIA/ASSETS TABLES (Future Enhancement)
-- ============================================

-- Media Files
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'audio', 'pdf', 'video')),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. INDEXES
-- ============================================

-- Programs
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_order ON programs(order_index);

-- Topics
CREATE INDEX IF NOT EXISTS idx_topics_program_id ON topics(program_id);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(order_index);

-- Stages
CREATE INDEX IF NOT EXISTS idx_stages_topic_id ON stages(topic_id);
CREATE INDEX IF NOT EXISTS idx_stages_order ON stages(order_index);

-- Blocks
CREATE INDEX IF NOT EXISTS idx_blocks_stage_id ON blocks(stage_id);
CREATE INDEX IF NOT EXISTS idx_blocks_type ON blocks(type);
CREATE INDEX IF NOT EXISTS idx_blocks_order ON blocks(order_index);

-- Game Questions
CREATE INDEX IF NOT EXISTS idx_game_questions_block_id ON game_questions(block_id);
CREATE INDEX IF NOT EXISTS idx_game_questions_order ON game_questions(order_index);

-- Site Config
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(config_key);

-- Media Files
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(file_type);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES (Development - Open Access)
-- WARNING: In production, lock writes to authenticated admins only
-- ============================================

-- Programs Policies
CREATE POLICY "Enable read access for all users" ON programs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON programs FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON programs FOR DELETE USING (true);

-- Topics Policies
CREATE POLICY "Enable read access for all users" ON topics FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON topics FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON topics FOR DELETE USING (true);

-- Stages Policies
CREATE POLICY "Enable read access for all users" ON stages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON stages FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON stages FOR DELETE USING (true);

-- Blocks Policies
CREATE POLICY "Enable read access for all users" ON blocks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON blocks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON blocks FOR DELETE USING (true);

-- Game Questions Policies
CREATE POLICY "Enable read access for all users" ON game_questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON game_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON game_questions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON game_questions FOR DELETE USING (true);

-- Site Config Policies
CREATE POLICY "Enable read access for all users" ON site_config FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON site_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON site_config FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON site_config FOR DELETE USING (true);

-- Media Files Policies
CREATE POLICY "Enable read access for all users" ON media_files FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON media_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON media_files FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON media_files FOR DELETE USING (true);

-- ============================================
-- 8. TRIGGERS (Auto-update timestamps)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE programs IS 'Curriculum programs (e.g., Bahasa Arab, Nahwu, Sharaf)';
COMMENT ON TABLE topics IS 'Learning topics/lessons within a program';
COMMENT ON TABLE stages IS 'Stages within a lesson (e.g., Introduction, Practice, Quiz)';
COMMENT ON TABLE blocks IS 'Content blocks within a stage (text, media, games, etc.)';
COMMENT ON TABLE game_questions IS 'Questions/items for game blocks';
COMMENT ON TABLE site_config IS 'Global site configuration (fonts, theme, homepage, etc.)';
COMMENT ON TABLE media_files IS 'Uploaded media files (images, audio, PDFs, videos)';

-- ============================================
-- END OF SCHEMA
-- ============================================
