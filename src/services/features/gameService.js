import { supabase } from '../../supabaseClient';
import contentServiceV2 from '../contentServiceV2';
import { storageService } from '../storageService';

export const gameService = {
    isValidUUID(uuid) {
        if (!uuid) return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    },

    async getGamesConfig() {
        try {
            // Fetch from game_categories and INCLUDE blocks
            // We need to fetch blocks content to show the "Games" in the public view
            const { data: categories, error } = await supabase
                .from('game_categories')
                .select(`
                    *,
                    blocks:blocks_game (*)
                `)
                .order('order_index');
            
            if (error) throw error;

            return categories.map(cat => ({
                id: cat.id, 
                title: cat.title,
                desc: cat.description,
                icon: cat.icon,
                isLocked: cat.is_locked,
                // Map BLOCKS to ITEMS so GameIndex.jsx can render them
                items: (cat.blocks || []).sort((a,b) => a.order_index - b.order_index).map(block => ({
                    id: block.id,
                    title: block.data?.title || block.type, // Fallback to type if no title
                    type: block.type, // 'quiz', 'matchup', etc.
                    data: block.data, // Include data for focus mode rendering
                    thumbnail: block.data?.thumbnail,
                    isLocked: false // Games usually don't have individual locks in this view
                })),
                blockCount: cat.blocks ? cat.blocks.length : 0
            }));
        } catch (error) {
            console.error('[gameService] Error fetching games config:', error);
            return [];
        }
    },

    async saveGamesConfig(gamesConfig) {
        console.warn('[gameService] saveGamesConfig is deprecated.');
        return { items: gamesConfig };
    },

    async updateGameCategory(id, metadata) {
        try {
            // Convert slug to UUID if needed
            const isUUID = this.isValidUUID(id);
            let categoryUuid = id;
            
            if (!isUUID) {
                // ID is a slug, need to find the UUID
                const { data } = await supabase
                    .from('game_categories')
                    .select('id')
                    .eq('slug', id)
                    .maybeSingle();
                
                if (!data) {
                    console.error('[gameService] Game category not found for slug:', id);
                    return false;
                }
                categoryUuid = data.id;
            }

            // Normalize field names for database
            const dbUpdates = {};
            if (metadata.title !== undefined) dbUpdates.title = metadata.title;
            if (metadata.icon !== undefined) dbUpdates.icon = metadata.icon;
            if (metadata.description !== undefined) dbUpdates.description = metadata.description;
            if (metadata.isLocked !== undefined) dbUpdates.is_locked = metadata.isLocked;
            if (metadata.hasOwnProperty('isLocked')) dbUpdates.is_locked = metadata.isLocked;

            await contentServiceV2.gameCategories.update(categoryUuid, dbUpdates);
            return true;
        } catch (error) {
            console.error('[gameService] Error updating game category:', error);
            return false;
        }
    },

    async addNewGameCategory(title, desc, iconName) {
        try {
            const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const uniqueSlug = `${baseSlug}-${Date.now()}`;
            
            // Get max order
            const cats = await contentServiceV2.gameCategories.getAll();
            const maxOrder = cats.length > 0 ? Math.max(...cats.map(c => c.order_index)) : 0;

            const newCat = await contentServiceV2.gameCategories.create({
                slug: uniqueSlug,
                title: title,
                description: desc,
                icon: iconName,
                order_index: maxOrder + 1
            });

            return {
                id: newCat.id,
                title: newCat.title,
                desc: newCat.description,
                icon: newCat.icon,
                items: []
            };
        } catch (error) {
            console.error('[gameService] Error adding new game category:', error);
            throw error;
        }
    },

    async addGameCategory(title, iconName, desc = '') {
        return await this.addNewGameCategory(title, desc, iconName);
    },

    async deleteGameCategory(categoryId) {
        try {
            // 1. Find the category to check for thumbnail and blocks
            const isUUID = this.isValidUUID(categoryId);
            let cat = null;

            if (isUUID) {
                const { data } = await supabase.from('game_categories').select('id').eq('id', categoryId).maybeSingle();
                cat = data;
            } else {
                const { data } = await supabase.from('game_categories').select('id').eq('slug', categoryId).maybeSingle();
                cat = data;
            }

            if (cat) {
                // 2. Cleanup files from all blocks in this category
                const { data: blocks } = await supabase
                    .from('blocks_game')
                    .select('data')
                    .eq('category_id', cat.id);
                
                if (blocks && blocks.length > 0) {
                    await storageService.deleteAllFilesFromContent(blocks);
                }

                // 4. Delete from database
                await contentServiceV2.gameCategories.delete(cat.id);
                return true;
            }
            return false;
        } catch (error) {
             console.error('[gameService] Error deleting game category:', error);
             return false;
        }
    },

    // Aliases
    async getSpecialPrograms() {
        return await this.getGamesConfig();
    },

    async updateSpecialCategory(id, metadata) {
        return await this.updateGameCategory(id, metadata);
    },

    async addSpecialCategory(title, iconName, desc = '') {
        return await this.addGameCategory(title, iconName, desc);
    },

    async deleteSpecialCategory(categoryId) {
        return await this.deleteGameCategory(categoryId);
    }
};
