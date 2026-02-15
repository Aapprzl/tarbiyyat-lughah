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
    <div className="space-y-4">
      {/* Game Info & Passage */}
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
          <input 
            type="text" 
            placeholder="Contoh: Detektif Kata..."
            className="w-full bg-transparent font-bold text-emerald-600 border-b border-transparent focus:border-emerald-500 outline-none text-sm py-1 transition-colors"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Teks Bacaan</label>
          <textarea 
            placeholder="Tulis atau tempel teks bacaan di sini..."
            className={cn(
                "w-full h-32 text-xs resize-y outline-none text-[var(--color-text-main)] bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/10 focus:border-emerald-500/50 transition-all",
                isArabic(block.data.text) && "arabic-content"
            )}
            style={{ 
                lineHeight: isArabic(block.data.text) ? '2' : '1.6',
                direction: isArabic(block.data.text) ? 'rtl' : 'ltr'
            }}
            value={block.data.text || ''}
            onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-1">Daftar Misi (Clue & Jawaban)</label>
        <div className="space-y-3">
          {(block.data.questions || []).map((q, idx) => (
            <div key={idx} className="group relative bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 space-y-3 overflow-hidden">
               {/* Delete Button - Top Left */}
               <button 
                 onClick={() => {
                   const newQs = block.data.questions.filter((_, i) => i !== idx);
                   onUpdate({ ...block.data, questions: newQs });
                 }}
                 className="absolute left-1 top-1 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                 title="Hapus Misi"
               >
                 <Trash2 className="w-3.5 h-3.5" />
               </button>
               
               <div className="grid md:grid-cols-2 gap-3 pl-6">
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clue (Petunjuk)</label>
                     <input 
                       type="text" 
                       placeholder="Contoh: Kata benda bermakna Buku..."
                       className="w-full bg-slate-50 dark:bg-white/5 p-2 rounded-lg text-[11px] outline-none border border-transparent focus:border-emerald-500/50 transition-all"
                       value={q.clue || ''}
                       onChange={(e) => {
                          const newQs = [...block.data.questions];
                          newQs[idx].clue = e.target.value;
                          onUpdate({ ...block.data, questions: newQs });
                       }}
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jawaban (Satu Kata)</label>
                     <input 
                       type="text" 
                       dir={isArabic(q.answer) ? 'rtl' : 'ltr'}
                       className={cn(
                           "w-full bg-slate-50 dark:bg-white/5 p-2 rounded-lg text-xs outline-none border border-transparent focus:border-emerald-500/50 transition-all text-emerald-600 font-bold pr-3",
                           isArabic(q.answer) && "arabic-content text-right font-black"
                       )}
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
        </div>

        <button 
          onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), clue: '', answer: '' }] })}
          className="w-full py-2.5 bg-white dark:bg-white/5 border border-dashed border-emerald-200 dark:border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-3.5 h-3.5" /> Tambah Misi Baru
        </button>
      </div>
      
      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
          <Search className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-emerald-800 dark:text-teal-400 mb-0.5 uppercase tracking-widest">Tips Detektif</p>
          <p className="text-[9px] text-emerald-600/70 leading-relaxed font-medium">
            Pastikan jawaban <strong>sama persis</strong> dengan satu kata yang ada di dalam teks bacaan (termasuk harakatnya).
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordDetectiveEditor;
