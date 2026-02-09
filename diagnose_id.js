import { supabase } from './src/supabaseClient.js';

const topicId = '66cff79f-7864-47a0-b347-e791a66f5d12';

async function diagnose() {
    console.log(`Diagnosing ID: ${topicId}`);
    
    // Check topics
    const { data: topic, error: topicErr } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .maybeSingle();
    
    if (topicErr) console.error('Topic Error:', topicErr);
    else console.log('Topic result:', topic ? 'Found' : 'Not Found');

    // Check game_categories
    const { data: gameCat, error: gameErr } = await supabase
        .from('game_categories')
        .select('*')
        .eq('id', topicId)
        .maybeSingle();
        
    if (gameErr) console.error('Game Category Error:', gameErr);
    else console.log('Game Category result:', gameCat ? 'Found' : 'Not Found');
    
    // Check topics by slug
    const { data: topicSlug, error: topicSlugErr } = await supabase
        .from('topics')
        .select('*')
        .eq('slug', topicId)
        .maybeSingle();
    if (topicSlug) console.log('Topic found by SLUG (as string match)');

    // Check game_categories by slug
    const { data: gameCatSlug, error: gameCatSlugErr } = await supabase
        .from('game_categories')
        .select('*')
        .eq('slug', topicId)
        .maybeSingle();
    if (gameCatSlug) console.log('Game Category found by SLUG (as string match)');
}

diagnose();
