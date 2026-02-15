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
    <div className="space-y-6">
       <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Game Balap Unta</label>
          <input 
            type="text" 
            placeholder="Balap Unta Sahara..."
            className="w-full font-black text-xl text-amber-600 bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
          />
       </div>

       <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500">Jarak Finish (Meter)</label>
          <input 
            type="number" 
            className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-black text-center"
            value={block.data.goalDistance || 5000}
            onChange={(e) => onUpdate({ ...block.data, goalDistance: parseInt(e.target.value) || 5000 })}
          />
       </div>

       <div className="space-y-4">
          <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">Daftar Pertanyaan Kecepatan</label>
          <div className="space-y-4">
             {(block.data.questions || []).map((q, qIdx) => (
                <div key={qIdx} className="p-4 md:p-6 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-4 relative group">
                   <button 
                     onClick={() => {
                        const newQs = block.data.questions.filter((_, i) => i !== qIdx);
                        onUpdate({ ...block.data, questions: newQs });
                     }}
                     className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan</label>
                      <input 
                        type="text"
                        className={cn(
                          "w-full bg-transparent text-lg font-bold border-b border-slate-200 dark:border-white/10 pb-1 outline-none",
                          isArabic(q.question) && "arabic-content text-right transition-all"
                         )}
                         style={{ direction: isArabic(q.question) ? "rtl" : "ltr" }}
                        placeholder="Apa arti dari..."
                        value={q.question || ''}
                        onChange={(e) => {
                           const newQs = [...block.data.questions];
                           newQs[qIdx].question = e.target.value;
                           onUpdate({ ...block.data, questions: newQs });
                        }}
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(q.options || ["", "", "", ""]).map((opt, oIdx) => (
                         <div key={oIdx} className="relative group/opt">
                            <input 
                              type="text"
                              className={cn(
                                "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm pr-10 transition-all",
                                 isArabic(opt) && "arabic-content",
                                 q.correct === opt && opt !== "" ? "border-amber-500 ring-2 ring-amber-500/20" : ""
                               )}
                               style={{ direction: isArabic(opt) ? "rtl" : "ltr" }}
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
                                "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all z-10",
                                q.correct === opt && opt !== "" ? "bg-amber-500 text-white" : "text-slate-300 hover:text-amber-500"
                              )}
                            >
                               <CheckCircle2 className="w-4 h-4" />
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
             ))}
          </div>
          <button 
            onClick={() => onUpdate({ 
              ...block.data, 
              questions: [...(block.data.questions || []), { question: '', options: ['', '', '', ''], correct: '' }] 
            })}
            className="w-full py-4 bg-white dark:bg-white/5 border-2 border-dashed border-amber-200 dark:border-amber-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-amber-500 hover:border-amber-500 hover:text-amber-500 transition-all flex items-center justify-center gap-2"
          >
             <Plus className="w-4 h-4" /> Tambah Soal Balapan
          </button>
       </div>
    </div>
  );
};

export default CamelRaceEditor;
