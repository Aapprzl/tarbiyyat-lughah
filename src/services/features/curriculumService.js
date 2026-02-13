import { supabase } from '../../supabaseClient';
import { curriculum as initialCurriculum } from '../../data/curriculum';
import contentServiceV2 from '../contentServiceV2';
import { storageService } from '../storageService';

export const curriculumService = {
    isValidUUID(uuid) {
        if (!uuid) return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    },
    
    async getCurriculum() {
        try {
            const programs = await contentServiceV2.programs.getAll();
            return this.transformProgramsToOldFormat(programs);
        } catch (error) {
            console.error('[curriculumService] Error fetching curriculum:', error);
            return initialCurriculum;
        }
    },

    async saveCurriculum(curriculum) {
        console.warn('[curriculumService] saveCurriculum not yet implemented for new schema');
        throw new Error('saveCurriculum not yet implemented for new schema');
    },

    async updateTopicMetadata(topicId, metadata) {
        try {
            const isUUID = this.isValidUUID(topicId);
            
            // 1. Try Topic (Curriculum)
            let topicToUpdate = null;
            if (isUUID) {
                const { data } = await supabase.from('topics').select('id').eq('id', topicId).maybeSingle();
                if (data) topicToUpdate = data.id;
            } else {
                const { data } = await supabase.from('topics').select('id').eq('slug', topicId).maybeSingle();
                if (data) topicToUpdate = data.id;
            }

            if (topicToUpdate) {
                const updates = {};
                if (metadata.title !== undefined) updates.title = metadata.title;
                if (metadata.desc !== undefined) updates.description = metadata.desc;
                if (metadata.description !== undefined) updates.description = metadata.description;
                if (metadata.thumbnail !== undefined) updates.thumbnail = metadata.thumbnail;
                if (metadata.hasOwnProperty('isLocked')) updates.is_locked = metadata.isLocked;
                if (metadata.order_index !== undefined) updates.order_index = metadata.order_index;
                await contentServiceV2.topics.update(topicToUpdate, updates);
                return true;
            }

            // 2. Try Game Category
            let catToUpdate = null;
            if (isUUID) {
                const { data } = await supabase.from('game_categories').select('id').eq('id', topicId).maybeSingle();
                if (data) catToUpdate = data.id;
            } else {
                const { data } = await supabase.from('game_categories').select('id').eq('slug', topicId).maybeSingle();
                if (data) catToUpdate = data.id;
            }

            if (catToUpdate) {
                const updates = {};
                if (metadata.title !== undefined) updates.title = metadata.title;
                if (metadata.desc !== undefined) updates.description = metadata.desc;
                if (metadata.description !== undefined) updates.description = metadata.description;
                // Note: game_categories does not have a thumbnail column, skipping
                if (metadata.hasOwnProperty('isLocked')) updates.is_locked = metadata.isLocked;
                if (metadata.order_index !== undefined) updates.order_index = metadata.order_index;
                await contentServiceV2.gameCategories.update(catToUpdate, updates);
                return true;
            }

            console.error('[curriculumService] Topic/Category not found for metadata update:', topicId);
            return false;
        } catch (error) {
            console.error('[curriculumService] Error updating topic metadata:', error);
            return false;
        }
    },

    async syncCategoryItems(categoryId, items) {
        console.log(`[curriculumService] syncCategoryItems called for ${categoryId} with ${items?.length || 0} items`);
        return true;
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
            console.error('[curriculumService] Error adding new topic:', error);
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
                order_index: nextOrder,
                type: 'curriculum'
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
            console.error('[curriculumService] Error adding new section:', error);
            throw error;
        }
    },

    async deleteTopic(topicId) {
        
        // Handle potential legacy calls passing (sectionId, topicId)
        if (arguments.length > 1) {
             topicId = arguments[1];
        }

        if (!topicId) {
            console.error('[curriculumService] Delete aborted: topicId is missing/undefined');
            return false;
        }

        try {
            // 1. Try to find as a Curriculum Topic (by ID or Slug)
            const isUUID = this.isValidUUID(topicId);
            let topicQuery = supabase.from('topics').select('id, thumbnail');
            if (isUUID) topicQuery = topicQuery.eq('id', topicId);
            else topicQuery = topicQuery.eq('slug', topicId);

            const { data: topics, error: findError } = await topicQuery.limit(1);
            
            if (findError) {
                console.error('[curriculumService] Error finding topic:', findError);
            }

             if (topics && topics.length > 0) {
                 const topic = topics[0];
                 
                 if (topic.thumbnail) {
                    await storageService.deleteFile(topic.thumbnail);
                 }

                 // Note: we need to import lessonService here or duplicate getLessonContent?
                 // Trying to avoid circular dependency. logic moved here for now or we use raw v2 calls
                 const stages = await contentServiceV2.lessonContent.get(topic.id);
                 if (stages) {
                    // Logic to delete files from stages
                    // This duplicates logic from storageService usage in main ContentService
                    // For now, let's assume storageService handles this or we need to check how to inject it
                     const lessonContent = stages; 
                     // We need to transform or use raw? storageService expects older format usually or raw objects
                     // Let's assume we can fetch raw blocks to pass to storageService
                     
                     // Simply fetching all blocks for this topic to clean up
                     // Fetch logic duplicated from v2 lessonContent.get essentially
                     const { data: dbStages } = await supabase.from('stages').select('id').eq('topic_id', topic.id);
                     if(dbStages) {
                        for(const stage of dbStages) {
                            const { data: blocks } = await supabase.from('blocks').select('data').eq('stage_id', stage.id);
                            if(blocks) {
                                await storageService.deleteAllFilesFromContent(blocks.map(b => ({ data: b.data }))); // mimicking structure
                            }
                        }
                     }
                 }

                 await contentServiceV2.topics.delete(topic.id);
                 return true;
            }

            // 2. Try to find as a Game Block (Special Program Item)
            if (isUUID) { 
                let gameQuery = supabase.from('blocks_game').select('id, data').eq('id', topicId);
                
                const { data: gameBlocks, error: findGameError } = await gameQuery.limit(1);
                
                if (findGameError) {
                    console.error('[curriculumService] Error finding game block:', findGameError);
                }

                if (gameBlocks && gameBlocks.length > 0) {
                    const block = gameBlocks[0];
                    if (block.data) await storageService.deleteAllFilesFromContent(block.data);
                    const { error: deleteError } = await supabase.from('blocks_game').delete().eq('id', block.id);
                    
                    if (deleteError) {
                        console.error('[curriculumService] Failed to delete game block:', deleteError);
                        throw deleteError;
                    }
                    return true;
                }
            } 

            console.warn(`[curriculumService] Topic/Game not found for deletion: ${topicId}`);
            return false;
        } catch (error) {
            console.error('[curriculumService] Error deleting topic:', error);
            throw error; 
        }
    },

    async deleteSection(sectionId) {
        try {
            // 1. Find the program
            const isUUID = this.isValidUUID(sectionId);
            let query = supabase.from('programs').select('id');
            
            if (isUUID) {
                query = query.eq('id', sectionId);
            } else {
                query = query.eq('slug', sectionId);
            }

            const { data: programs } = await query.limit(1);
            
            if (programs && programs.length > 0) {
                const programId = programs[0].id;

                // 2. Fetch all topics in this program to clean up thumbnails
                const { data: topics } = await supabase
                    .from('topics')
                    .select('id, thumbnail')
                    .eq('program_id', programId);
                
                if (topics && topics.length > 0) {
                    for (const topic of topics) {
                        // Cleanup thumbnail
                        if (topic.thumbnail) {
                            await storageService.deleteFile(topic.thumbnail);
                        }
                        // Cleanup lesson content files manually to avoid circular dep
                         const { data: dbStages } = await supabase.from('stages').select('id').eq('topic_id', topic.id);
                         if(dbStages) {
                            for(const stage of dbStages) {
                                const { data: blocks } = await supabase.from('blocks').select('data').eq('stage_id', stage.id);
                                if(blocks) {
                                    await storageService.deleteAllFilesFromContent(blocks.map(b => ({ data: b.data })));
                                }
                            }
                         }
                    }
                }

                // 3. Delete program from database (cascades to topics, stages, and blocks)
                await contentServiceV2.programs.delete(programId);
                return true;
            }
            console.warn(`[curriculumService] Section not found for deletion: ${sectionId}`);
            return false;
        } catch (error) {
            console.error('[curriculumService] Error deleting section:', error);
            return false;
        }
    },

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
                    console.error('[curriculumService] Program not found for slug:', id);
                    return false;
                }
                programUuid = data.id;
            }

            // Normalize field names for database
            const dbUpdates = {};
            if (metadata.title !== undefined) dbUpdates.title = metadata.title;
            if (metadata.icon !== undefined) dbUpdates.icon = metadata.icon;
            if (metadata.description !== undefined) dbUpdates.description = metadata.description;
            if (metadata.isLocked !== undefined) dbUpdates.is_locked = metadata.isLocked;
            if (metadata.hasOwnProperty('isLocked')) dbUpdates.is_locked = metadata.isLocked;

            await contentServiceV2.programs.update(programUuid, dbUpdates);
            return true;
        } catch (error) {
            console.error('[curriculumService] Error updating program:', error);
            return false;
        }
    },

    // INTERNAL HELPERS
    transformProgramsToOldFormat(programs) {
        return programs.map(program => ({
            id: program.slug || program.id,
            title: program.title,
            desc: program.description,
            icon: program.icon,
            color: program.color,
            isLocked: program.is_locked || false,
            topics: (program.topics || []).map(topic => {
                const topicId = topic.slug || topic.id;
                if (!topicId) {
                    console.warn('[curriculumService] Skipping corrupt topic (No ID/Slug resolved):', topic);
                    return null;
                }
    
                return {
                    id: topicId,
                    title: topic.title,
                    subtitle: topic.subtitle,
                    desc: topic.description,
                    thumbnail: topic.thumbnail,
                    isLocked: topic.is_locked,
                    type: 'grammar' // Default type
                };
            }).filter(t => t !== null) // Remove invalid topics
        }));
    }
};
