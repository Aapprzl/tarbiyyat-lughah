import { Trash2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for WordRain game block
 * Players catch falling words matching a target category
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing correct/distractor words and time limit
 * @param {Function} props.onUpdate - Callback to update block data
 */
const WordRainEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Kategori Target</label>
            <input 
              type="text" 
              placeholder="Contoh: Isim..."
              className="w-full bg-transparent font-bold text-sky-500 border-b border-transparent focus:border-sky-500 outline-none text-sm py-1 transition-colors"
              value={block.data.targetCategory || ''}
              onChange={(e) => onUpdate({ ...block.data, targetCategory: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Durasi (Detik)</label>
            <input 
              type="number" 
              className="w-full bg-transparent font-bold text-slate-700 dark:text-white border-b border-transparent focus:border-sky-500 outline-none text-sm py-1 transition-colors"
              value={block.data.timeLimit || 60}
              onChange={(e) => onUpdate({ ...block.data, timeLimit: parseInt(e.target.value) || 60 })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Kata Benar */}
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md flex items-center gap-2 w-fit">
               <CheckCircle2 className="w-3 h-3" /> Kata Benar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
               {(block.data.correctWords || []).map((word, idx) => (
                 <div key={idx} className="group relative bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/10 flex items-center overflow-hidden">
                    <button 
                      onClick={() => {
                        const newWords = block.data.correctWords.filter((_, i) => i !== idx);
                        onUpdate({ ...block.data, correctWords: newWords });
                      }} 
                      className="absolute left-1 top-1 text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <input 
                      type="text"
                      dir={isArabic(word) ? 'rtl' : 'ltr'}
                      className={cn(
                         "flex-1 min-w-0 bg-transparent border-b border-dashed border-slate-200 dark:border-white/10 focus:border-emerald-500/50 focus:border-solid text-xs font-bold outline-none py-1 pl-6 pr-3 transition-all",
                         isArabic(word) && "arabic-content text-right"
                      )}
                      value={word}
                      onChange={(e) => {
                         const newWords = [...block.data.correctWords];
                         newWords[idx] = e.target.value;
                         onUpdate({ ...block.data, correctWords: newWords });
                      }}
                    />
                 </div>
               ))}
               <button 
                 onClick={() => onUpdate({ ...block.data, correctWords: [...(block.data.correctWords || []), ''] })}
                 className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-emerald-200 dark:border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
               >
                 <Plus className="w-3 h-3" /> Tambah
               </button>
            </div>
         </div>

         {/* Kata Pengecoh */}
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 rounded-md flex items-center gap-2 w-fit">
               <AlertCircle className="w-3 h-3" /> Kata Pengecoh
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
               {(block.data.distractorWords || []).map((word, idx) => (
                 <div key={idx} className="group relative bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/10 flex items-center overflow-hidden">
                    <button 
                      onClick={() => {
                        const newWords = block.data.distractorWords.filter((_, i) => i !== idx);
                        onUpdate({ ...block.data, distractorWords: newWords });
                      }} 
                      className="absolute left-1 top-1 text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <input 
                      type="text"
                      dir={isArabic(word) ? 'rtl' : 'ltr'}
                      className={cn(
                         "flex-1 min-w-0 bg-transparent border-b border-dashed border-slate-200 dark:border-white/10 focus:border-rose-500/50 focus:border-solid text-xs font-bold outline-none py-1 pl-6 pr-3 transition-all",
                         isArabic(word) && "arabic-content text-right"
                      )}
                      value={word}
                      onChange={(e) => {
                         const newWords = [...block.data.distractorWords];
                         newWords[idx] = e.target.value;
                         onUpdate({ ...block.data, distractorWords: newWords });
                      }}
                    />
                 </div>
               ))}
               <button 
                 onClick={() => onUpdate({ ...block.data, distractorWords: [...(block.data.distractorWords || []), ''] })}
                 className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-rose-200 dark:border-rose-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
               >
                 <Plus className="w-3 h-3" /> Tambah
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default WordRainEditor;
