-- ============================================
-- Data Migration Script
-- Migrate from old schema (settings + lessons) to new normalized schema
-- ============================================

-- ============================================
-- STEP 1: Migrate Site Configuration
-- ============================================

-- Migrate font config
INSERT INTO site_config (config_key, config_value, description)
SELECT 
    'font' as config_key,
    value as config_value,
    'Font configuration for Arabic and Latin text' as description
FROM settings
WHERE id = 'font_config'
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Migrate home config
INSERT INTO site_config (config_key, config_value, description)
SELECT 
    'home' as config_key,
    value as config_value,
    'Homepage configuration' as description
FROM settings
WHERE id = 'home_config'
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Migrate intro config
INSERT INTO site_config (config_key, config_value, description)
SELECT 
    'intro' as config_key,
    value as config_value,
    'Intro screen configuration' as description
FROM settings
WHERE id = 'intro_config'
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Migrate library config
INSERT INTO site_config (config_key, config_value, description)
SELECT 
    'library' as config_key,
    value as config_value,
    'Library configuration (categories, etc.)' as description
FROM settings
WHERE id = 'library_config'
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Migrate library books
INSERT INTO site_config (config_key, config_value, description)
SELECT 
    'library_books' as config_key,
    value as config_value,
    'Library books collection' as description
FROM settings
WHERE id = 'library_books'
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Migrate special programs
INSERT INTO site_config (config_key, config_value, description)
SELECT 
    'special_programs' as config_key,
    value as config_value,
    'Special programs and games configuration' as description
FROM settings
WHERE id = 'special_programs'
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- ============================================
-- STEP 2: Migrate Curriculum to Programs & Topics
-- ============================================

-- This requires a PL/pgSQL function because we need to parse JSONB curriculum structure
CREATE OR REPLACE FUNCTION migrate_curriculum_to_programs()
RETURNS void AS $$
DECLARE
    curriculum_data JSONB;
    program_record RECORD;
    topic_record RECORD;
    program_uuid UUID;
    program_order INT := 0;
    topic_order INT;
BEGIN
    -- Get curriculum from settings
    SELECT value INTO curriculum_data
    FROM settings
    WHERE id = 'curriculum';

    -- If no curriculum found, exit
    IF curriculum_data IS NULL THEN
        RAISE NOTICE 'No curriculum data found in settings table';
        RETURN;
    END IF;

    -- Loop through each program in curriculum
    FOR program_record IN 
        SELECT * FROM jsonb_array_elements(curriculum_data)
    LOOP
        -- Insert program
        INSERT INTO programs (slug, title, description, icon, color, order_index)
        VALUES (
            program_record.value->>'id',
            program_record.value->>'title',
            program_record.value->>'description',
            program_record.value->>'icon',
            program_record.value->>'color',
            program_order
        )
        ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            color = EXCLUDED.color,
            order_index = EXCLUDED.order_index
        RETURNING id INTO program_uuid;

        -- Reset topic order for each program
        topic_order := 0;

        -- Loop through topics in this program
        FOR topic_record IN
            SELECT * FROM jsonb_array_elements(program_record.value->'topics')
        LOOP
            -- Insert topic
            INSERT INTO topics (program_id, slug, title, subtitle, description, thumbnail, is_locked, order_index)
            VALUES (
                program_uuid,
                topic_record.value->>'id',
                topic_record.value->>'title',
                topic_record.value->>'subtitle',
                topic_record.value->>'description',
                topic_record.value->>'thumbnail',
                COALESCE((topic_record.value->>'isLocked')::boolean, false),
                topic_order
            )
            ON CONFLICT (program_id, slug) DO UPDATE
            SET title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                description = EXCLUDED.description,
                thumbnail = EXCLUDED.thumbnail,
                is_locked = EXCLUDED.is_locked,
                order_index = EXCLUDED.order_index;

            topic_order := topic_order + 1;
        END LOOP;

        program_order := program_order + 1;
    END LOOP;

    RAISE NOTICE 'Curriculum migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_curriculum_to_programs();

-- ============================================
-- STEP 3: Migrate Lessons to Stages & Blocks
-- ============================================

CREATE OR REPLACE FUNCTION migrate_lessons_to_stages_blocks()
RETURNS void AS $$
DECLARE
    lesson_record RECORD;
    topic_uuid UUID;
    stage_record RECORD;
    block_record RECORD;
    stage_uuid UUID;
    stage_order INT;
    block_order INT;
    content_jsonb JSONB;
BEGIN
    -- Loop through all lessons
    FOR lesson_record IN
        SELECT * FROM lessons
    LOOP
        -- Find corresponding topic by slug (id in lessons = slug in topics)
        SELECT id INTO topic_uuid
        FROM topics
        WHERE slug = lesson_record.id;

        -- If topic not found, skip this lesson
        IF topic_uuid IS NULL THEN
            RAISE NOTICE 'Topic not found for lesson: %', lesson_record.id;
            CONTINUE;
        END IF;

        -- Parse content from string to JSONB if needed
        BEGIN
            -- Check the type of content
            IF pg_typeof(lesson_record.content) = 'text'::regtype THEN
                -- Content is text, parse as JSON
                content_jsonb := lesson_record.content::jsonb;
            ELSIF jsonb_typeof(lesson_record.content) = 'string' THEN
                -- Content is JSONB string, extract and parse
                content_jsonb := (lesson_record.content #>> '{}')::jsonb;
            ELSE
                -- Content is already proper JSONB
                content_jsonb := lesson_record.content;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to parse content for lesson: %, error: %', lesson_record.id, SQLERRM;
            CONTINUE;
        END;

        -- Check if content is null or empty
        IF content_jsonb IS NULL OR jsonb_typeof(content_jsonb) = 'null' THEN
            RAISE NOTICE 'Empty content for lesson: %', lesson_record.id;
            CONTINUE;
        END IF;

        -- Check if content is array
        IF jsonb_typeof(content_jsonb) != 'array' THEN
            RAISE NOTICE 'Content is not an array for lesson: %, type: %', lesson_record.id, jsonb_typeof(content_jsonb);
            CONTINUE;
        END IF;

        -- Reset stage order
        stage_order := 0;

        -- Loop through stages (content is array of stages directly)
        FOR stage_record IN
            SELECT * FROM jsonb_array_elements(content_jsonb)
        LOOP
            -- Insert stage
            INSERT INTO stages (topic_id, title, order_index)
            VALUES (
                topic_uuid,
                COALESCE(stage_record.value->>'title', 'Untitled Stage'),
                stage_order
            )
            RETURNING id INTO stage_uuid;

            -- Reset block order for each stage
            block_order := 0;

            -- Check if items exists and is array
            IF stage_record.value ? 'items' AND jsonb_typeof(stage_record.value->'items') = 'array' THEN
                -- Loop through items (not blocks!) in this stage
                FOR block_record IN
                    SELECT * FROM jsonb_array_elements(stage_record.value->'items')
                LOOP
                    -- Insert block
                    INSERT INTO blocks (stage_id, type, title, thumbnail, data, order_index)
                    VALUES (
                        stage_uuid,
                        block_record.value->>'type',
                        block_record.value->'data'->>'title',
                        block_record.value->'data'->>'thumbnail',
                        block_record.value->'data',
                        block_order
                    );

                    block_order := block_order + 1;
                END LOOP;
            END IF;

            stage_order := stage_order + 1;
        END LOOP;

        RAISE NOTICE 'Migrated lesson: % with % stages and % total blocks', lesson_record.id, stage_order, (SELECT COUNT(*) FROM blocks b JOIN stages s ON b.stage_id = s.id WHERE s.topic_id = topic_uuid);
    END LOOP;

    RAISE NOTICE 'Lessons migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_lessons_to_stages_blocks();

-- ============================================
-- STEP 4: Cleanup (Optional - for reference)
-- ============================================

-- After verifying migration is successful, you can:
-- 1. Backup old tables
-- 2. Drop old tables (CAREFUL!)

-- CREATE TABLE settings_backup AS SELECT * FROM settings;
-- CREATE TABLE lessons_backup AS SELECT * FROM lessons;

-- DROP TABLE IF EXISTS settings;
-- DROP TABLE IF EXISTS lessons;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check programs count
SELECT COUNT(*) as programs_count FROM programs;

-- Check topics count
SELECT COUNT(*) as topics_count FROM topics;

-- Check stages count
SELECT COUNT(*) as stages_count FROM stages;

-- Check blocks count
SELECT COUNT(*) as blocks_count FROM blocks;

-- Check site_config count
SELECT COUNT(*) as site_config_count FROM site_config;

-- View sample data
SELECT p.title as program, t.title as topic, s.title as stage, b.type as block_type
FROM programs p
JOIN topics t ON t.program_id = p.id
JOIN stages s ON s.topic_id = t.id
JOIN blocks b ON b.stage_id = s.id
LIMIT 10;

-- ============================================
-- END OF MIGRATION SCRIPT
-- ============================================
