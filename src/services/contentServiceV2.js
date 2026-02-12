import { supabase } from '../supabaseClient';

/**
 * Content Service V2 - Using Normalized Database Schema
 * 
 * This service uses the new normalized schema:
 * - programs (curriculum programs)
 * - topics (lessons/materials)
 * - stages (lesson stages)
 * - blocks (content blocks)
 * - site_config (global configuration)
 * - game_categories (game specific categories)
 * - blocks_game (game specific blocks, linked to categories)
 */

// ============================================
// PROGRAMS SERVICE
// ============================================

export const programsService = {
  /**
   * Get all programs with their topics
   */
  async getAll() {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        topics (*)
      `)
      .or('type.eq.curriculum,type.is.null') // Include both explicit 'curriculum' and legacy/untyped records
      .order('order_index')
      .order('order_index', { foreignTable: 'topics' });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get all games (programs with type=game_category)
   * @deprecated Use gameCategoriesService instead
   */
  async getGames() {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        topics (*)
      `)
      .eq('type', 'game_category')
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get single program by ID
   */
  async getById(programId) {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        topics (*)
      `)
      .eq('id', programId)
      .order('order_index', { foreignTable: 'topics' })
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get program by slug
   */
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        topics (*)
      `)
      .eq('slug', slug)
      .order('order_index', { foreignTable: 'topics' })
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create new program
   */
  async create(programData) {
    const { data, error } = await supabase
      .from('programs')
      .insert([{
        slug: programData.slug,
        title: programData.title,
        description: programData.description,
        icon: programData.icon,
        color: programData.color,
        order_index: programData.order_index || 0,
        is_active: programData.is_active !== false,
        type: programData.type || 'curriculum'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update program
   */
  async update(programId, updates) {
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', programId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete program (cascades to topics, stages, blocks)
   */
  async delete(programId) {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId);
    
    if (error) throw error;
  }
};

// ============================================
// TOPICS SERVICE
// ============================================

export const topicsService = {
  /**
   * Get all topics for a program
   */
  async getByProgram(programId) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('program_id', programId)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get single topic by ID with stages and blocks
   */
  async getById(topicId) {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        program:programs (*),
        stages (
          *,
          blocks (*)
        )
      `)
      .eq('id', topicId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get topic by slug
   */
  async getBySlug(programId, slug) {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        program:programs (*),
        stages (
          *,
          blocks (*)
        )
      `)
      .eq('program_id', programId)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create new topic
   */
  async create(topicData) {
    const { data, error } = await supabase
      .from('topics')
      .insert([{
        program_id: topicData.program_id,
        slug: topicData.slug,
        title: topicData.title,
        subtitle: topicData.subtitle,
        description: topicData.description,
        thumbnail: topicData.thumbnail,
        order_index: topicData.order_index || 0,
        is_locked: topicData.is_locked || false,
        is_active: topicData.is_active !== false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update topic
   */
  async update(topicId, updates) {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', topicId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete topic (cascades to stages and blocks)
   */
  async delete(topicId) {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId);
    
    if (error) throw error;
  }
};

// ============================================
// STAGES & BLOCKS SERVICE
// ============================================

export const lessonContentService = {
  /**
   * Get lesson content (stages with blocks) for a topic
   */
  async get(topicId) {
    const { data, error } = await supabase
      .from('stages')
      .select(`
        *,
        blocks (*)
      `)
      .eq('topic_id', topicId)
      .order('order_index');
    
    if (error) throw error;
    
    // Sort blocks within each stage
    if (data) {
      data.forEach(stage => {
        if (stage.blocks) {
          stage.blocks.sort((a, b) => a.order_index - b.order_index);
        }
      });
    }
    
    return data || [];
  },

  /**
   * Save lesson content (replace all stages and blocks for a topic)
   */
  async save(topicId, stages) {
    // Delete existing stages and blocks (cascade delete will handle blocks)
    const { error: deleteError } = await supabase
      .from('stages')
      .delete()
      .eq('topic_id', topicId);
    
    if (deleteError) throw deleteError;
    
    // Insert new stages and blocks
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      
      // Insert stage
      const { data: stageData, error: stageError } = await supabase
        .from('stages')
        .insert([{
          topic_id: topicId,
          title: stage.title,
          order_index: i
        }])
        .select()
        .single();
      
      if (stageError) throw stageError;
      
      // Insert blocks for this stage
      if (stage.items && stage.items.length > 0) {
        const blocksToInsert = stage.items.map((item, idx) => ({
          stage_id: stageData.id,
          type: item.type,
          title: item.data?.title || null,
          thumbnail: item.data?.thumbnail || null,
          data: item.data || {},
          order_index: idx
        }));
        
        const { error: blocksError } = await supabase
          .from('blocks')
          .insert(blocksToInsert);
        
        if (blocksError) throw blocksError;
      }
    }
    
    return await this.get(topicId);
  },

  /**
   * Transform from new format to old format (for backward compatibility)
   */
  transformToOldFormat(stages) {
    return stages.map(stage => ({
      id: stage.id,
      title: stage.title,
      items: (stage.blocks || []).map(block => ({
        id: block.id,
        type: block.type,
        data: block.data
      }))
    }));
  },

  /**
   * Transform from old format to new format
   */
  transformFromOldFormat(oldStages) {
    return oldStages.map((stage, idx) => ({
      title: stage.title,
      order_index: idx,
      items: (stage.items || []).map((item, itemIdx) => ({
        type: item.type,
        data: item.data,
        order_index: itemIdx
      }))
    }));
  }
};

// ============================================
// GAME CATEGORIES SERVICE
// ============================================

export const gameCategoriesService = {
  async getAll() {
    // Only fetch categories, blocks will be fetched on demand (getById or lazy)
    // Or fetch count of blocks?
    const { data, error } = await supabase
      .from('game_categories')
      .select(`
        *,
        blocks:blocks_game (count)
      `)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('game_categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('game_categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: newCat, error } = await supabase
      .from('game_categories')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return newCat;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('game_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('game_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ============================================
// GAME BLOCKS SERVICE (blocks_game)
// ============================================

export const gameBlocksService = {
  async getByCategory(categoryId) {
    const { data, error } = await supabase
      .from('blocks_game')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index');
    if (error) throw error;
    return data || [];
  },

  async replaceForCategory(categoryId, blocks) {
    // Transaction-like approach: delete all, insert new
    // 1. Delete existing
    const { error: delError } = await supabase
      .from('blocks_game')
      .delete()
      .eq('category_id', categoryId);
    if (delError) throw delError;

    if (!blocks || blocks.length === 0) return [];

    // 2. Insert new
    const { data, error } = await supabase
      .from('blocks_game')
      .insert(blocks.map(b => ({
          category_id: categoryId,
          type: b.type,
          data: b.data,
          order_index: b.order_index,
          created_at: b.created_at || new Date()
      })))
      .select();
    
    if (error) throw error;
    return data;
  }
};


// ============================================
// SITE CONFIG SERVICE
// ============================================

export const siteConfigService = {
  /**
   * Get config by key
   */
  async get(configKey) {
    const { data, error } = await supabase
      .from('site_config')
      .select('config_value')
      .eq('config_key', configKey)
      .maybeSingle();
    
    if (error) throw error;
    return data?.config_value || null;
  },

  /**
   * Save config
   */
  async save(configKey, configValue, description = '') {
    const { data, error } = await supabase
      .from('site_config')
      .upsert({
        config_key: configKey,
        config_value: configValue,
        description: description
      }, {
        onConflict: 'config_key'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all configs
   */
  async getAll() {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .order('config_key');
    
    if (error) throw error;
    return data || [];
  },

  // Specific config getters/setters
  async getFontConfig() {
    return await this.get('font');
  },

  async saveFontConfig(fontConfig) {
    return await this.save('font', fontConfig, 'Font configuration for Arabic and Latin text');
  },

  async getHomeConfig() {
    return await this.get('home');
  },

  async saveHomeConfig(homeConfig) {
    return await this.save('home', homeConfig, 'Homepage configuration');
  },

  async getIntroConfig() {
    return await this.get('intro');
  },

  async saveIntroConfig(introConfig) {
    return await this.save('intro', introConfig, 'Intro screen configuration');
  },

  async getLibraryConfig() {
    return await this.get('library');
  },

  async saveLibraryConfig(libraryConfig) {
    return await this.save('library', libraryConfig, 'Library configuration');
  },

  async getLibraryBooks() {
    return await this.get('library_books');
  },

  async saveLibraryBooks(books) {
    return await this.save('library_books', books, 'Library books collection');
  }
};

// ============================================
// EXPORT ALL SERVICES
// ============================================

export const contentServiceV2 = {
  programs: programsService,
  topics: topicsService,
  lessonContent: lessonContentService,
  siteConfig: siteConfigService,
  gameCategories: gameCategoriesService,
  gameBlocks: gameBlocksService
};

export default contentServiceV2;
