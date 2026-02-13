import { supabase } from '../../supabaseClient';
import contentServiceV2 from '../contentServiceV2';

export const lessonService = {
    isValidUUID(uuid) {
        if (!uuid) return false;
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
                const transformed = this.transformLessonContentToOldFormat(stages);
                return JSON.stringify(transformed);
            }

            // 2. Try to find as a Game Category (SIMPLIFIED SCHEMA)
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

            console.error('[lessonService] Topic or Category not found:', topicId);
            return '[]';
        } catch (error) {
            console.error('[lessonService] Error fetching lesson content:', error);
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
                 const stages = this.transformLessonContentFromOldFormat(parsedContent);
                 await contentServiceV2.lessonContent.save(topics.id, stages);
                 return true;
             }

             console.error('[lessonService] Topic or Category not found for saving:', topicId);
             return false;
        } catch (error) {
            console.error('[lessonService] Error saving lesson content:', error);
            throw error;
        }
    },

    async initialiseLessonRow(topicId) { return true; },
    async deleteLessonRow(topicId) { return true; },

    // INTERNAL HELPERS
    transformLessonContentToOldFormat(stages) {
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

    transformLessonContentFromOldFormat(oldStages) {
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
