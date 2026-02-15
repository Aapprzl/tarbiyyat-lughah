import React from 'react';
import { Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for CamelRace game block
 * Quiz-based racing game where correct answers move the camel forward
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array and goal distance
 * @param {Function} props.onUpdate - Callback to update block data
 */
const CamelRaceEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Game Balap Unta</label>
            <input 
              type="text" 
              placeholder="Contoh: Balap Unta Sahara..."
              className="w-full bg-transparent font-bold text-amber-600 border-b border-transparent focus:border-amber-500 outline-none text-sm py-1 transition-colors"
              value={block.data.title || ''}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Jarak Finish (Meter)</label>
            <input 
              type="number" 
              className="w-full bg-transparent font-bold text-slate-700 dark:text-white border-b border-transparent focus:border-amber-500 outline-none text-sm py-1 transition-colors"
              value={block.data.goalDistance || 5000}
              onChange={(e) => onUpdate({ ...block.data, goalDistance: parseInt(e.target.value) || 5000 })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest px-1">Daftar Pertanyaan Kecepatan</label>
        <div className="space-y-3">
          {(block.data.questions || []).map((q, qIdx) => (
            <div key={qIdx} className="group relative bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 space-y-3 overflow-hidden">
               {/* Delete Button - Top Left */}
               <button 
                 onClick={() => {
                   const newQs = block.data.questions.filter((_, i) => i !== qIdx);
                   onUpdate({ ...block.data, questions: newQs });
                 }}
                 className="absolute left-1 top-1 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                 title="Hapus Pertanyaan"
               >
                 <Trash2 className="w-3.5 h-3.5" />
               </button>

               {/* Question Input */}
               <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-6">Pertanyaan #{qIdx + 1}</label>
                 <input 
                   type="text"
                   dir={isArabic(q.question) ? 'rtl' : 'ltr'}
                   className={cn(
                     "w-full bg-transparent text-sm font-bold border-b border-dashed border-slate-200 dark:border-white/10 focus:border-amber-500/50 focus:border-solid pb-1 outline-none transition-all pl-6 pr-2",
                     isArabic(q.question) && "arabic-content text-right"
                   )}
                   placeholder="Tulis pertanyaan di sini..."
                   value={q.question || ''}
                   onChange={(e) => {
                     const newQs = [...block.data.questions];
                     newQs[qIdx].question = e.target.value;
                     onUpdate({ ...block.data, questions: newQs });
                   }}
                 />
               </div>

               {/* Options Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 {(q.options || ["", "", "", ""]).map((opt, oIdx) => (
                   <div key={oIdx} className="relative group/opt flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/10 p-1 pr-2 transition-all">
                      <input 
                        type="text"
                        dir={isArabic(opt) ? 'rtl' : 'ltr'}
                        className={cn(
                          "flex-1 bg-transparent text-xs outline-none px-2 py-1",
                          isArabic(opt) && "arabic-content text-right"
                        )}
                        placeholder={`Opsi ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newQs = [...block.data.questions];
                          const newOpts = [...(newQs[qIdx].options || ["", "", "", ""])];
                          const oldVal = newOpts[oIdx];
                          newOpts[oIdx] = e.target.value;
                          newQs[qIdx].options = newOpts;
                          if (newQs[qIdx].correct === oldVal) newQs[qIdx].correct = e.target.value;
                          onUpdate({ ...block.data, questions: newQs });
                        }}
                      />
                      <button 
                        onClick={() => {
                          const newQs = [...block.data.questions];
                          newQs[qIdx].correct = opt;
                          onUpdate({ ...block.data, questions: newQs });
                        }}
                        className={cn(
                          "p-1 rounded transition-all",
                          q.correct === opt && opt !== "" 
                            ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20" 
                            : "text-slate-300 hover:text-amber-500"
                        )}
                        title="Tandai Jawaban Benar"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <button 
          onClick={() => onUpdate({ 
            ...block.data, 
            questions: [...(block.data.questions || []), { question: '', options: ['', '', '', ''], correct: '' }] 
          })}
          className="w-full py-2.5 border border-dashed border-amber-200 dark:border-amber-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:bg-amber-50 dark:hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Soal Balapan
        </button>
      </div>
    </div>
  );
};

export default CamelRaceEditor;
