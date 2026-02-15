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
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Cerita</label>
            <input 
              type="text" 
              placeholder="Contoh: Kisah di Madinah..."
              className="w-full bg-transparent font-bold text-teal-600 border-b border-transparent focus:border-teal-500 outline-none text-sm py-1 transition-colors"
              value={block.data.title || ''}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">ID Scene Awal</label>
              <Settings className="w-3 h-3 text-slate-400" />
            </div>
            <input 
              type="text" 
              className="w-full bg-transparent font-bold text-slate-700 dark:text-white border-b border-transparent focus:border-teal-500 outline-none text-sm py-1 transition-colors"
              value={block.data.startScene || 'start'}
              onChange={(e) => onUpdate({ ...block.data, startScene: e.target.value })}
            />
          </div>
        </div>
      </div>
   
      <div className="pt-2">
        <InteractiveStoryBlock block={block} onUpdate={onUpdate} />
      </div>
    </div>
  );
};

export default InteractiveStoryEditor;
