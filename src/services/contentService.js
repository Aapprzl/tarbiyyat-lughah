import { supabase } from '../supabaseClient';
import { curriculum as initialCurriculum } from '../data/curriculum';
import contentServiceV2 from './contentServiceV2';

// In-memory cache to prevent blinking on navigation
const configCache = {};

// Helper to get from storage safely
const getFromStorage = (key) => {
    if (typeof window !== 'undefined') {
        try {
            const item = localStorage.getItem(`config_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return null;
        }
    }
    return null;
};

// Helper to save to storage safely
const saveToStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(`config_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }
};

// Transform programs from new schema to old curriculum format
const transformProgramsToOldFormat = (programs) => {
    return programs.map(program => ({
        id: program.slug,
        title: program.title,
        desc: program.description,
        icon: program.icon,
        color: program.color,
        topics: (program.topics || []).map(topic => ({
            id: topic.slug,
            title: topic.title,
            subtitle: topic.subtitle,
            desc: topic.description,
            thumbnail: topic.thumbnail,
            isLocked: topic.is_locked,
            type: 'grammar' // Default type
        }))
    }));
};

// Transform lesson content from new schema to old format
const transformLessonContentToOldFormat = (stages) => {
    return stages.map(stage => ({
        id: stage.id,
        title: stage.title,
        items: (stage.blocks || []).map(block => ({
            id: block.id,
            type: block.type,
            data: block.data
        }))
    }));
};

// Transform lesson content from old format to new schema
const transformLessonContentFromOldFormat = (oldStages) => {
    return oldStages.map((stage, idx) => ({
        title: stage.title,
        order_index: idx,
        items: (stage.items || []).map((item, itemIdx) => ({
            type: item.type,
            data: item.data,
            order_index: itemIdx
        }))
    }));
};

export const contentService = {
    // ============================================
    // CURRICULUM MANAGEMENT
    // ============================================
    
    async getCurriculum() {
        try {
            const programs = await contentServiceV2.programs.getAll();
            return transformProgramsToOldFormat(programs);
        } catch (error) {
            console.error('[contentService] Error fetching curriculum:', error);
            return initialCurriculum;
        }
    },

    async saveCurriculum(curriculum) {
        // TODO: Implement save to normalized schema
        console.warn('[contentService] saveCurriculum not yet implemented for new schema');
        throw new Error('saveCurriculum not yet implemented for new schema');
    },

    async updateTopicMetadata(topicId, metadata) {
        try {
            // 1. Try Curriculum Topic
            try {
                const programs = await contentServiceV2.programs.getAll();
                let topicUuid = null;
                for (const program of programs) {
                    const topic = program.topics?.find(t => t.slug === topicId || t.id === topicId);
                    if (topic) {
                        topicUuid = topic.id;
                        break;
                    }
                }
                
                if (topicUuid) {
                     const updates = {};
                    if (metadata.title !== undefined) updates.title = metadata.title;
                    if (metadata.desc !== undefined) updates.description = metadata.desc;
                    if (metadata.description !== undefined) updates.description = metadata.description;
                    if (metadata.thumbnail !== undefined) updates.thumbnail = metadata.thumbnail;
                    if (metadata.hasOwnProperty('isLocked')) updates.is_locked = metadata.isLocked;
                    await contentServiceV2.topics.update(topicUuid, updates);
                    return true;
                }
            } catch (e) { /* Ignore */ }

            // 2. Try Game Category
            try {
                 const gameCat = await contentServiceV2.gameCategories.getById(topicId);
                 if (gameCat) {
                    const updates = {};
                    if (metadata.title !== undefined) updates.title = metadata.title;
                    if (metadata.desc !== undefined) updates.description = metadata.desc;
                    if (metadata.description !== undefined) updates.description = metadata.description;
                    if (metadata.thumbnail !== undefined) updates.thumbnail = metadata.thumbnail;
                    // if (metadata.hasOwnProperty('isLocked')) updates.is_locked = metadata.isLocked;
                    await contentServiceV2.gameCategories.update(topicId, updates);
                    return true;
                 }
            } catch (e) { /* Ignore */ }
            
            console.error('[contentService] Topic/Category not found for metadata update:', topicId);
            return false;

        } catch (error) {
            console.error('[contentService] Error updating topic metadata:', error);
            return false;
        }
    },

    async updateTopicTitle(topicId, newTitle) {
        return await this.updateTopicMetadata(topicId, { title: newTitle });
    },

    async addNewTopic(sectionId, title) {
        try {
             // Find program by slug
            const { data: programs } = await supabase
                .from('programs')
                .select('id')
                .eq('slug', sectionId)
                .limit(1);
            
            if (!programs || programs.length === 0) return null;
            const programId = programs[0].id;
            
            const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const uniqueSlug = `${baseSlug}-${Date.now()}`;
            
            const { data: topics } = await supabase
                .from('topics')
                .select('order_index')
                .eq('program_id', programId)
                .order('order_index', { ascending: false })
                .limit(1);
            const nextOrder = topics && topics.length > 0 ? topics[0].order_index + 1 : 0;
            
            const newTopic = await contentServiceV2.topics.create({
                program_id: programId,
                slug: uniqueSlug,
                title: title,
                subtitle: '',
                description: '',
                thumbnail: '',
                order_index: nextOrder,
                is_locked: false
            });
            
            return {
                id: newTopic.slug,
                title: newTopic.title,
                subtitle: newTopic.subtitle,
                desc: newTopic.description,
                thumbnail: newTopic.thumbnail,
                isLocked: newTopic.is_locked
            };
        } catch (error) {
            console.error('[contentService] Error adding new topic:', error);
            throw error;
        }
    },

    async addNewSection(title, iconName = 'BookOpen', desc = '') {
        try {
            const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const uniqueSlug = `${baseSlug}-${Date.now()}`;
             const { data: programs } = await supabase
                .from('programs')
                .select('order_index')
                .order('order_index', { ascending: false })
                .limit(1);
            const nextOrder = programs && programs.length > 0 ? programs[0].order_index + 1 : 0;
            
            const newProgram = await contentServiceV2.programs.create({
                slug: uniqueSlug,
                title: title,
                description: desc,
                icon: iconName,
                color: '#14b8a6', 
                order_index: nextOrder
            });
            
            return {
                id: newProgram.slug,
                title: newProgram.title,
                desc: newProgram.description,
                icon: newProgram.icon,
                color: newProgram.color,
                topics: []
            };
        } catch (error) {
            console.error('[contentService] Error adding new section:', error);
            throw error;
        }
    },

    async deleteTopic(sectionId, topicId) {
        try {
            // Find by slug
             const { data: topics } = await supabase
                .from('topics')
                .select('id')
                .eq('slug', topicId)
                .limit(1);
            
            if (topics && topics.length > 0) {
                 await contentServiceV2.topics.delete(topics[0].id);
                 return true;
            }
            return false;
        } catch (error) {
            console.error('[contentService] Error deleting topic:', error);
            return false;
        }
    },

    async deleteSection(sectionId) {
        try {
            const { data: programs } = await supabase
                .from('programs')
                .select('id')
                .eq('slug', sectionId)
                .limit(1);
            
            if (programs && programs.length > 0) {
                await contentServiceV2.programs.delete(programs[0].id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[contentService] Error deleting section:', error);
            return false;
        }
    },

    // ============================================
    // LESSON CONTENT MANAGEMENT
    // ============================================

    // ============================================
    // LESSON CONTENT MANAGEMENT
    // ============================================

    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    },

    async getLessonContent(topicId) {
        try {
            const isUUID = this.isValidUUID(topicId);
            let topics = null;

             // 1. Try to find as a Curriculum Topic (by Slug or ID)
             if (isUUID) {
                const { data } = await supabase
                    .from('topics')
                    .select('id')
                    .eq('id', topicId)
                    .maybeSingle();
                topics = data;
             } else {
                const { data } = await supabase
                    .from('topics')
                    .select('id')
                    .eq('slug', topicId)
                    .maybeSingle();
                topics = data;
             }
            
            if (topics) {
                const stages = await contentServiceV2.lessonContent.get(topics.id);
                const transformed = transformLessonContentToOldFormat(stages);
                return JSON.stringify(transformed);
            }

            // 2. Try to find as a Game Category (SIMPLIFIED SCHEMA)
            // If topicId is a Game Category ID (usually UUID), we fetch blocks_game
            // But game_categories also have slugs, so might be accessed by slug?
            let gameCat = null;
            if (isUUID) {
                const { data } = await supabase
                    .from('game_categories')
                    .select('id')
                    .eq('id', topicId)
                    .maybeSingle();
                gameCat = data;
            } else {
                 // Try finding by slug just in case
                const { data } = await supabase
                    .from('game_categories')
                    .select('id')
                    .eq('slug', topicId)
                    .maybeSingle();
                gameCat = data;
            }

            if (gameCat) {
                 const blocks = await contentServiceV2.gameBlocks.getByCategory(gameCat.id);
                 // Wrap game blocks in a single virtual stage
                 const stageWrapper = [{
                     id: Date.now(),
                     title: 'Game Content',
                     items: blocks.map(b => ({
                         id: b.id,
                         type: b.type,
                         data: b.data
                     }))
                 }];
                 return JSON.stringify(stageWrapper);
            }

            console.error('[contentService] Topic or Category not found:', topicId);
            return '[]';
        } catch (error) {
            console.error('[contentService] Error fetching lesson content:', error);
            return '[]';
        }
    },

    async saveLessonContent(topicId, content) {
        try {
            let parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
            if (!Array.isArray(parsedContent)) parsedContent = [];

            const isUUID = this.isValidUUID(topicId);

             // 1. Check if it's a Game Category
            let gameCat = null;
            if (isUUID) {
                const { data } = await supabase.from('game_categories').select('id').eq('id', topicId).maybeSingle();
                gameCat = data;
            } else { // try by slug
                 const { data } = await supabase.from('game_categories').select('id').eq('slug', topicId).maybeSingle();
                 gameCat = data;
            }

            if (gameCat) {
                 // Flatten all stages to get blocks (Game Category contains direct blocks)
                 const allBlocks = [];
                 let order = 0;
                 parsedContent.forEach(stage => {
                     if (stage.items) {
                         stage.items.forEach(item => {
                             allBlocks.push({
                                 type: item.type,
                                 data: item.data,
                                 order_index: order++
                             });
                         });
                     }
                 });
                 // Use the ID found (gameCat.id) to ensure we use UUID for the service call
                 await contentServiceV2.gameBlocks.replaceForCategory(gameCat.id, allBlocks);
                 return true;
            }

            // 2. Assume Curriculum Topic
            let topics = null;
            if (isUUID) {
                const { data } = await supabase.from('topics').select('id').eq('id', topicId).maybeSingle();
                topics = data;
            } else {
                 const { data } = await supabase.from('topics').select('id').eq('slug', topicId).maybeSingle();
                 topics = data;
            }

             if (topics) {
                 const stages = transformLessonContentFromOldFormat(parsedContent);
                 await contentServiceV2.lessonContent.save(topics.id, stages);
                 return true;
             }

             console.error('[contentService] Topic or Category not found for saving:', topicId);
             return false;
        } catch (error) {
            console.error('[contentService] Error saving lesson content:', error);
            throw error;
        }
    },

    async initialiseLessonRow(topicId) { return true; },
    async deleteLessonRow(topicId) { return true; },

    // ============================================
    // CONFIGURATION MANAGEMENT
    // ============================================

    async getFontConfig() {
        try {
            const config = await contentServiceV2.siteConfig.getFontConfig();
            if (config) {
                configCache['font_config'] = config;
                saveToStorage('font_config', config);
            }
            return config || {};
        } catch (error) {
            return getFromStorage('font_config') || {};
        }
    },

    getFontConfigSync() {
        return configCache['font_config'] || getFromStorage('font_config') || null;
    },

    async saveFontConfig(config) {
        try {
            await contentServiceV2.siteConfig.saveFontConfig(config);
            configCache['font_config'] = config;
            saveToStorage('font_config', config);
            return config;
        } catch (error) { throw error; }
    },

    async getHomeConfig() {
        try {
            const config = await contentServiceV2.siteConfig.getHomeConfig();
            if (config) {
                configCache['home_config'] = config;
                saveToStorage('home_config', config);
            }
            return config || {};
        } catch (error) {
             return getFromStorage('home_config') || {};
        }
    },

    getHomeConfigSync() {
        return configCache['home_config'] || getFromStorage('home_config') || null;
    },

    async saveHomeConfig(config) {
        try {
            await contentServiceV2.siteConfig.saveHomeConfig(config);
            configCache['home_config'] = config;
            saveToStorage('home_config', config);
            return config;
        } catch (error) { throw error; }
    },

    async getIntroConfig() {
         try {
            const config = await contentServiceV2.siteConfig.getIntroConfig();
            return config || {};
        } catch (error) { return {}; }
    },

    async saveIntroConfig(config) {
         try {
            await contentServiceV2.siteConfig.saveIntroConfig(config);
            return config;
        } catch (error) { throw error; }
    },

    async getLibraryConfig() {
         try {
            const config = await contentServiceV2.siteConfig.getLibraryConfig();
            return config || { categories: [] };
        } catch (error) { return { categories: [] }; }
    },

    async saveLibraryConfig(config) {
         try {
            await contentServiceV2.siteConfig.saveLibraryConfig(config);
            return config;
        } catch (error) { throw error; }
    },

    async getBooks() {
        try {
            const books = await contentServiceV2.siteConfig.get('library_books');
            return Array.isArray(books) ? books : [];
        } catch (error) {
            console.error('[contentService] Error fetching books:', error);
            return [];
        }
    },

    async addBook(bookData) {
        try {
            const books = await this.getBooks();
            const newBook = { ...bookData, id: Date.now() };
            const updatedBooks = [newBook, ...books];
            await contentServiceV2.siteConfig.save('library_books', updatedBooks, 'Library books collection');
            return newBook;
        } catch (error) {
            console.error('[contentService] Error adding book:', error);
            throw error;
        }
    },

    async deleteBook(bookId) {
        try {
            const books = await this.getBooks();
            const updatedBooks = books.filter(b => b.id !== bookId);
            await contentServiceV2.siteConfig.save('library_books', updatedBooks, 'Library books collection');
            return true;
        } catch (error) {
            console.error('[contentService] Error deleting book:', error);
            return false;
        }
    },

     // ============================================
    // GAME MANAGEMENT (Updated to use new Tables)
    // ============================================

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
                    thumbnail: block.data?.thumbnail
                })),
                blockCount: cat.blocks ? cat.blocks.length : 0
            }));
        } catch (error) {
            console.error('[contentService] Error fetching games config:', error);
            return [];
        }
    },

    async saveGamesConfig(gamesConfig) {
        console.warn('[contentService] saveGamesConfig is deprecated.');
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
                    console.error('[contentService] Game category not found for slug:', id);
                    return false;
                }
                categoryUuid = data.id;
            }

            // Normalize field names for database
            const dbUpdates = {};
            if (metadata.title !== undefined) dbUpdates.title = metadata.title;
            if (metadata.icon !== undefined) dbUpdates.icon = metadata.icon;
            if (metadata.desc !== undefined) dbUpdates.description = metadata.desc;
            if (metadata.description !== undefined) dbUpdates.description = metadata.description;
            if (metadata.thumbnail !== undefined) dbUpdates.thumbnail = metadata.thumbnail;
            if (metadata.hasOwnProperty('isLocked')) dbUpdates.is_locked = metadata.isLocked;

            await contentServiceV2.gameCategories.update(categoryUuid, dbUpdates);
            return true;
        } catch (error) {
            console.error('[contentService] Error updating game category:', error);
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
            console.error('[contentService] Error adding new game category:', error);
            throw error;
        }
    },

    async addGameCategory(title, iconName, desc = '') {
        return await this.addNewGameCategory(title, desc, iconName);
    },

    async deleteGameCategory(categoryId) {
        try {
            await contentServiceV2.gameCategories.delete(categoryId);
            return true;
        } catch (error) {
             console.error('[contentService] Error deleting game category:', error);
             return false;
        }
    },

    // ============================================
    // BACKWARD COMPATIBILITY ALIASES
    // ============================================

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
    }, 

    // Backward compatibility alias for Dashboard.jsx - updates PROGRAMS, not game categories
    async updateSection(id, metadata) {
        try {
            // Convert slug to UUID if needed
            const isUUID = this.isValidUUID(id);
            let programUuid = id;
            
            if (!isUUID) {
                // ID is a slug, need to find the UUID
                const { data } = await supabase
                    .from('programs')
                    .select('id')
                    .eq('slug', id)
                    .maybeSingle();
                
                if (!data) {
                    console.error('[contentService] Program not found for slug:', id);
                    return false;
                }
                programUuid = data.id;
            }

            // Normalize field names for database
            const dbUpdates = {};
            if (metadata.title !== undefined) dbUpdates.title = metadata.title;
            if (metadata.icon !== undefined) dbUpdates.icon = metadata.icon;
            if (metadata.desc !== undefined) dbUpdates.description = metadata.desc;
            if (metadata.description !== undefined) dbUpdates.description = metadata.description;
            if (metadata.hasOwnProperty('isLocked')) dbUpdates.is_locked = metadata.isLocked;

            await contentServiceV2.programs.update(programUuid, dbUpdates);
            return true;
        } catch (error) {
            console.error('[contentService] Error updating program:', error);
            return false;
        }
    },

    // ============================================
    // THEME & AUTH & SEARCH (Keep as is)
    // ============================================

    getTheme() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    },

    saveTheme(newTheme) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme);
        }
        return newTheme;
    },

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    },

    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    },

    onAuthStateChange(callback) {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null);
        });
        return () => data.subscription.unsubscribe();
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    isAuthenticated() {
        return false; 
    },

    async getAllContent() {
        const content = [];
        try {
            const curriculum = await this.getCurriculum();
            const currArray = Array.isArray(curriculum) ? curriculum : (curriculum.items || []);
            currArray.forEach(section => {
                if (section.topics) {
                    section.topics.forEach(topic => {
                        content.push({
                            title: topic.title,
                            desc: topic.desc || 'Materi pembelajaran',
                            path: `/materi/${section.id}/${topic.id}`,
                            icon: section.icon || 'BookOpen',
                            sectionTitle: section.title
                        });
                    });
                }
            });
        } catch (error) {
            console.error('[contentService] Error getting all content:', error);
        }
        return content;
    }
};

export default contentService;
