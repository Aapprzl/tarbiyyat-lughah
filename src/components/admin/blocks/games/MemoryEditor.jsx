import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for Memory game block
 * Card matching game with Arabic-Indonesian pairs
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing pairs array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const MemoryEditor = ({ block, onUpdate }) => {
  return (
    <div className="space-y-4">
      <input 
        type="text" 
        placeholder="Judul Permainan Memori..."
        className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 outline-none text-sm"
        value={block.data.title || ''}
        onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
      />
      <div className="space-y-2">
        {block.data.pairs?.map((pair, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-slate-100 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
            <input 
              type="text" 
              placeholder="Arab"
              className={cn(
                "w-1/2 bg-transparent text-sm outline-none font-medium transition-all text-right arabic-content",
              )}
              style={{ direction: 'rtl' }}
              value={pair.question}
              onChange={(e) => {
                const newPairs = [...block.data.pairs];
                newPairs[idx].question = e.target.value;
                onUpdate({ ...block.data, pairs: newPairs });
              }}
            />
            <div className="h-4 w-px bg-slate-300 dark:bg-white/10" />
            <input 
              type="text" 
              placeholder="Terjemah"
              className={cn(
                "w-1/2 bg-transparent text-sm outline-none font-medium text-violet-600 dark:text-violet-400 transition-all",
              )}
              value={pair.answer}
              onChange={(e) => {
                const newPairs = [...block.data.pairs];
                newPairs[idx].answer = e.target.value;
                onUpdate({ ...block.data, pairs: newPairs });
              }}
            />
            <button 
              onClick={() => {
                const newPairs = block.data.pairs.filter((_, i) => i !== idx);
                onUpdate({ ...block.data, pairs: newPairs });
              }}
              className="p-2 text-slate-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button 
        onClick={() => onUpdate({ ...block.data, pairs: [...(block.data.pairs || []), { id: Date.now(), question: '', answer: '' }] })}
        className="w-full py-3 bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:border-violet-500 hover:text-violet-500 transition-all"
      >
        + Tambah Pasangan
      </button>
    </div>
  );
};

export default MemoryEditor;
