import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for CompleteSentence game block (Kilat Bahasa - True/False)
 * Players determine if Arabic-Indonesian pairs are correct or incorrect
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const CompleteSentenceEditor = ({ block, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
         <input 
            type="text" 
            placeholder="Kilat Bahasa..."
            className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
         />
      </div>
      
      <div className="space-y-4">
         {(block.data.questions || []).map((q, idx) => (
            <div key={q.id || idx} className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-4 relative group">
                <button 
                  onClick={() => {
                      const newQs = block.data.questions.filter((_, i) => i !== idx);
                      onUpdate({ ...block.data, questions: newQs });
                  }}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-800 rounded-full shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teks Pokok (Arab)</label>
                        <input 
                          type="text" 
                          placeholder="Ketik kata Arab..."
                          className="w-full font-bold text-xl text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1 arabic-content"
                          style={{ direction: 'rtl' }}
                          value={q.text || ''}
                          onChange={(e) => {
                            const newQs = [...block.data.questions];
                            newQs[idx].text = e.target.value;
                            onUpdate({ ...block.data, questions: newQs });
                          }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Terjemahan (Indo)</label>
                        <input 
                          type="text" 
                          placeholder="Ketik terjemahan..."
                          className="w-full font-bold text-lg text-indigo-600 dark:text-indigo-400 bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
                          value={q.translation || ''}
                          onChange={(e) => {
                            const newQs = [...block.data.questions];
                            newQs[idx].translation = e.target.value;
                            onUpdate({ ...block.data, questions: newQs });
                          }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            q.isCorrect ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        )} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apakah pasangan ini benar?</span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                const newQs = [...block.data.questions];
                                newQs[idx].isCorrect = true;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                q.isCorrect 
                                    ? "bg-emerald-500 text-white shadow-lg" 
                                    : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                            )}
                        >
                            BENAR
                        </button>
                        <button
                            onClick={() => {
                                const newQs = [...block.data.questions];
                                newQs[idx].isCorrect = false;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                !q.isCorrect 
                                    ? "bg-red-500 text-white shadow-lg" 
                                    : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                            )}
                        >
                            SALAH
                        </button>
                    </div>
                </div>
            </div>
         ))}
      </div>

      <button 
        onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '', translation: '', isCorrect: true }] })}
        className="w-full py-5 bg-white dark:bg-white/5 border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 rounded-[2rem] text-xs font-black uppercase tracking-widest text-indigo-400 hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" /> Tambah Soal Kilat
      </button>
    </div>
  );
};

export default CompleteSentenceEditor;
