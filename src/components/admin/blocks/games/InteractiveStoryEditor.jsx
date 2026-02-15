import React from 'react';
import { Settings } from 'lucide-react';
import { InteractiveStoryBlock } from '../InteractiveStoryBlock';

/**
 * Editor for InteractiveStory game block
 * Branching narrative with choices and scenes
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing story scenes and start scene
 * @param {Function} props.onUpdate - Callback to update block data
 */
const InteractiveStoryEditor = ({ block, onUpdate }) => {
  return (
    <div className="space-y-8">
       <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Cerita</label>
          <input 
            type="text" 
            placeholder="Kisah di Madinah..."
            className="w-full font-black text-xl text-teal-500 bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
          />
       </div>

       <div className="p-4 bg-teal-50 dark:bg-teal-500/5 rounded-3xl border border-teal-200 dark:border-teal-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Settings className="w-4 h-4 text-teal-500" />
             <label className="text-xs font-bold text-slate-600 dark:text-slate-300">ID Scene Awal</label>
          </div>
          <input 
            type="text" 
            className="w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-black text-center"
            value={block.data.startScene || 'start'}
            onChange={(e) => onUpdate({ ...block.data, startScene: e.target.value })}
          />
       </div>
   
       <div className="mt-6">
           <InteractiveStoryBlock block={block} onUpdate={onUpdate} />
       </div>
    </div>
  );
};

export default InteractiveStoryEditor;
