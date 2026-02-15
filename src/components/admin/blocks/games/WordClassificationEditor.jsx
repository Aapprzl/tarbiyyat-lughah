import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for WordClassification game block
 * Players sort words into categories within a time limit
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array and time limit
 * @param {Function} props.onUpdate - Callback to update block data
 */
const WordClassificationEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
           <input 
              type="text" 
              placeholder="Judul Game..."
              className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none"
              value={block.data.title || ''}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
           />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Durasi Waktu (Detik)</label>
           <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
              <input 
                 type="number" 
                 min="10"
                 max="300"
                 className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent outline-none"
                 value={block.data.timeLimit || 60}
                 onChange={(e) => onUpdate({ ...block.data, timeLimit: parseInt(e.target.value) || 60 })}
               />
               <span className="text-xs font-bold text-slate-400 uppercase">Detik</span>
            </div>
         </div>
      </div>
      <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-4">
         <div className="flex justify-between items-center mb-2">
             <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Daftar Kata</label>
             <span className="text-[10px] font-bold text-slate-400">{block.data.questions?.length || 0} Kata</span>
         </div>
         
         {block.data.questions?.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
               <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xs">
                      {idx + 1}
                   </div>
                   <input 
                      type="text"
                      className={cn(
                         "flex-1 bg-transparent text-lg font-bold outline-none dir-rtl text-right placeholder-slate-300 transition-all",
                         isArabic(item.text) && "arabic-content"
                      )}
                      placeholder="Kata Arab..."
                      value={item.text}
                      onChange={(e) => {
                         const newQs = [...(block.data.questions || [])];
                         newQs[idx].text = e.target.value;
                         onUpdate({ ...block.data, questions: newQs });
                      }}
                   />
                   <button 
                     onClick={() => {
                         const newQs = block.data.questions.filter((_, i) => i !== idx);
                         onUpdate({ ...block.data, questions: newQs });
                     }}
                     className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Kategori</label>
                      <input 
                         type="text"
                         className="w-full bg-slate-50 dark:bg-black/30 px-3 py-2 rounded-xl text-xs font-medium outline-none border border-transparent focus:border-rose-500"
                         placeholder="Isim / Fi'il / Huruf"
                         value={item.category}
                         onChange={(e) => {
                            const newQs = [...(block.data.questions || [])];
                            newQs[idx].category = e.target.value;
                            onUpdate({ ...block.data, questions: newQs });
                         }}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Terjemahan</label>
                      <input 
                         type="text"
                         className="w-full bg-slate-50 dark:bg-black/30 px-3 py-2 rounded-xl text-xs font-medium outline-none border border-transparent focus:border-rose-500"
                         placeholder="Arti kata..."
                         value={item.translation}
                         onChange={(e) => {
                            const newQs = [...(block.data.questions || [])];
                            newQs[idx].translation = e.target.value;
                            onUpdate({ ...block.data, questions: newQs });
                         }}
                      />
                   </div>
               </div>
            </div>
         ))}
         
         <button 
           onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '', category: '', translation: '' }] })}
           className="w-full py-3 bg-white dark:bg-white/5 border-2 border-dashed border-rose-200 dark:border-rose-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-400 hover:border-rose-500 hover:text-rose-500 transition-all"
         >
           + Tambah Kata Baru
         </button>
      </div>
    </div>
  );
};

export default WordClassificationEditor;
