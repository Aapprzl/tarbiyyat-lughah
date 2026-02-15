import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for MatchUp game block
 * Allows creating pairs of questions and answers for matching game
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing pairs array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const MatchUpEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
        <input 
          type="text" 
          placeholder="Judul Game..."
          className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-pink-500 outline-none text-sm py-1 transition-colors"
          value={block.data.title || ''}
          onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {block.data.pairs?.map((pair, idx) => (
          <div key={idx} className="group relative bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/10 flex items-center gap-2">
            <button 
              onClick={() => {
                const newPairs = block.data.pairs.filter((_, i) => i !== idx);
                onUpdate({ ...block.data, pairs: newPairs });
              }}
              className="absolute left-1 top-1 text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Hapus"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <div className="flex-1 flex items-center gap-2 pl-5">
              <input 
                type="text" 
                placeholder="Tanya"
                dir={isArabic(pair.question) ? "rtl" : "ltr"}
                className={cn(
                  "flex-1 bg-transparent text-xs font-bold outline-none border-b border-dashed border-slate-200 dark:border-white/10 focus:border-pink-500/50 focus:border-solid py-1 transition-all",
                  isArabic(pair.question) && "arabic-content"
                )}
                value={pair.question}
                onChange={(e) => {
                  const newPairs = [...block.data.pairs];
                  newPairs[idx].question = e.target.value;
                  onUpdate({ ...block.data, pairs: newPairs });
                }}
              />
              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0" />
              <input 
                type="text" 
                placeholder="Jawab"
                dir={isArabic(pair.answer) ? "rtl" : "ltr"}
                className={cn(
                  "flex-1 bg-transparent text-xs font-bold outline-none border-b border-dashed border-slate-200 dark:border-white/10 focus:border-pink-500/50 focus:border-solid py-1 text-pink-600 dark:text-pink-400 transition-all",
                  isArabic(pair.answer) && "arabic-content"
                )}
                value={pair.answer}
                onChange={(e) => {
                  const newPairs = [...block.data.pairs];
                  newPairs[idx].answer = e.target.value;
                  onUpdate({ ...block.data, pairs: newPairs });
                }}
              />
            </div>
          </div>
        ))}

        <button 
          onClick={() => onUpdate({ ...block.data, pairs: [...(block.data.pairs || []), { id: Date.now(), question: '', answer: '' }] })}
          className="p-2 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-pink-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all flex items-center justify-center gap-2 min-h-[42px]"
        >
          <span>+ Tambah</span>
        </button>
      </div>
    </div>
  );
};

export default MatchUpEditor;
