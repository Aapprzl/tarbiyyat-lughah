import React from 'react';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="space-y-2">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori Target</label>
         <input 
           type="text" 
           placeholder="Contoh: Isim (Kata Benda)..."
           className="w-full font-black text-xl text-sky-500 bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
           value={block.data.targetCategory || ''}
           onChange={(e) => onUpdate({ ...block.data, targetCategory: e.target.value })}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-3">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1 flex items-center gap-2">
               <CheckCircle2 className="w-3 h-3" /> Kata Benar (Cetak Skor)
            </label>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-3xl space-y-2">
               {block.data.correctWords?.map((word, idx) => (
                 <div key={idx} className="flex gap-2">
                    <input 
                      type="text"
                      className={cn(
                         "flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-colors",
                         isArabic(word) && "arabic-content text-right"
                      )}
                      value={word}
                      onChange={(e) => {
                         const newWords = [...block.data.correctWords];
                         newWords[idx] = e.target.value;
                         onUpdate({ ...block.data, correctWords: newWords });
                      }}
                    />
                    <button onClick={() => {
                       const newWords = block.data.correctWords.filter((_, i) => i !== idx);
                       onUpdate({ ...block.data, correctWords: newWords });
                    }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
               <button 
                 onClick={() => onUpdate({ ...block.data, correctWords: [...(block.data.correctWords || []), ''] })}
                 className="w-full py-2 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-500/10 rounded-xl transition-all"
               >+ Tambah Kata Benar</button>
            </div>
         </div>

         <div className="space-y-3">
            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1 flex items-center gap-2">
               <AlertCircle className="w-3 h-3" /> Kata Pengecoh (Salah)
            </label>
            <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-3xl space-y-2">
               {block.data.distractorWords?.map((word, idx) => (
                 <div key={idx} className="flex gap-2">
                    <input 
                      type="text"
                      className={cn(
                         "flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500 transition-colors",
                         isArabic(word) && "arabic-content text-right"
                      )}
                      value={word}
                      onChange={(e) => {
                         const newWords = [...block.data.distractorWords];
                         newWords[idx] = e.target.value;
                         onUpdate({ ...block.data, distractorWords: newWords });
                      }}
                    />
                    <button onClick={() => {
                       const newWords = block.data.distractorWords.filter((_, i) => i !== idx);
                       onUpdate({ ...block.data, distractorWords: newWords });
                    }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
               <button 
                 onClick={() => onUpdate({ ...block.data, distractorWords: [...(block.data.distractorWords || []), ''] })}
                 className="w-full py-2 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
               >+ Tambah Kata Salah</button>
            </div>
         </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
         <label className="text-xs font-bold text-slate-500">Durasi Permainan (Detik)</label>
         <input 
           type="number" 
           className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-black text-center"
           value={block.data.timeLimit || 60}
           onChange={(e) => onUpdate({ ...block.data, timeLimit: parseInt(e.target.value) || 60 })}
         />
      </div>
    </div>
  );
};

export default WordRainEditor;
