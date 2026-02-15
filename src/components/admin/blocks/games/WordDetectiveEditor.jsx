import React from 'react';
import { Trash2, Search } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for WordDetective game block
 * Players find specific words in a text passage based on clues
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing text and questions array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const WordDetectiveEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-6">
       <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
          <input 
            type="text" 
            placeholder="Detektif Kata..."
            className="w-full font-black text-xl text-emerald-500 bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
          />
       </div>

       <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teks Bacaan</label>
          <textarea 
            placeholder="Tulis atau tempel teks bacaan di sini..."
            className={cn(
                "w-full h-48 text-sm resize-y outline-none text-[var(--color-text-main)] bg-slate-50 dark:bg-black/20 placeholder-[var(--color-text-muted)]/50 p-4 rounded-3xl border border-slate-200 dark:border-white/10 transition-all",
                isArabic(block.data.text) && "arabic-content"
            )}
            style={{ 
                lineHeight: isArabic(block.data.text) ? '2' : '1.5',
                direction: isArabic(block.data.text) ? 'rtl' : 'ltr'
            }}
            value={block.data.text || ''}
            onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
          />
       </div>

       <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Daftar Misi (Clue & Jawaban)</label>
          {(block.data.questions || []).map((q, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 relative group/q">
               <button 
                 onClick={() => {
                     const newQs = block.data.questions.filter((_, i) => i !== idx);
                     onUpdate({ ...block.data, questions: newQs });
                 }}
                 className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/q:opacity-100"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
               
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 px-1 italic">Clue (Petunjuk)</label>
                     <input 
                       type="text" 
                       placeholder="Contoh: Kata benda bermakna Buku..."
                       className="w-full bg-white dark:bg-black/20 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                       value={q.clue || ''}
                       onChange={(e) => {
                          const newQs = [...block.data.questions];
                          newQs[idx].clue = e.target.value;
                          onUpdate({ ...block.data, questions: newQs });
                       }}
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 px-1 italic">Jawaban (Satu Kata dari Teks)</label>
                     <input 
                       type="text" 
                       placeholder="Kata yang harus dicari..."
                       className={cn(
                           "w-full bg-white dark:bg-black/20 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-emerald-600 font-bold",
                           isArabic(q.answer) && "arabic-content text-right font-black"
                       )}
                       style={{ direction: isArabic(q.answer) ? 'rtl' : 'ltr' }}
                       value={q.answer || ''}
                       onChange={(e) => {
                          const newQs = [...block.data.questions];
                          newQs[idx].answer = e.target.value;
                          onUpdate({ ...block.data, questions: newQs });
                       }}
                     />
                  </div>
               </div>
            </div>
          ))}
          <button 
            onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), clue: '', answer: '' }] })}
            className="w-full py-3 bg-white dark:bg-white/5 border-2 border-dashed border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-emerald-500 hover:border-emerald-500 hover:text-emerald-500 transition-all"
          >
             + Tambah Misi Baru
          </button>
       </div>
       
       <div className="p-4 bg-teal-500/5 rounded-3xl border border-teal-500/10 flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-white shrink-0">
             <Search className="w-5 h-5" />
          </div>
          <div>
             <p className="text-xs font-bold text-teal-800 dark:text-teal-400 mb-1 line-clamp-1">Tips Detektif Kata</p>
             <p className="text-[10px] text-teal-600/70 leading-relaxed font-medium">
                Pastikan jawaban <strong>sama persis</strong> dengan satu kata yang ada di dalam teks bacaan (termasuk harakatnya jika ada). Permainan ini akan membagi teks berdasarkan spasi.
             </p>
          </div>
       </div>
    </div>
  );
};

export default WordDetectiveEditor;
