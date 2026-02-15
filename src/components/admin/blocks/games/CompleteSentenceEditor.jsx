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
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block mb-1">Judul Permainan</label>
         <input 
            type="text" 
            placeholder="Judul Kilat Bahasa..."
            className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-indigo-500 outline-none text-sm py-1 transition-colors"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
         />
      </div>
      
      <div className="space-y-3">
         {(block.data.questions || []).map((q, idx) => (
            <div key={q.id || idx} className="p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 space-y-3 relative group">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Teks Pokok (Arab)</label>
                            <input 
                              type="text" 
                              placeholder="Ketik kata Arab..."
                              className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-right outline-none focus:ring-1 focus:ring-indigo-500 transition-all arabic-content text-sm font-medium"
                              style={{ direction: 'rtl' }}
                              value={q.text || ''}
                              onChange={(e) => {
                                const newQs = [...block.data.questions];
                                newQs[idx].text = e.target.value;
                                onUpdate({ ...block.data, questions: newQs });
                              }}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Terjemahan (Indo)</label>
                            <input 
                              type="text" 
                              placeholder="Ketik terjemahan..."
                              className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-indigo-600 dark:text-indigo-400"
                              value={q.translation || ''}
                              onChange={(e) => {
                                const newQs = [...block.data.questions];
                                newQs[idx].translation = e.target.value;
                                onUpdate({ ...block.data, questions: newQs });
                              }}
                            />
                        </div>
                    </div>
                    <button 
                      onClick={() => {
                          const newQs = block.data.questions.filter((_, i) => i !== idx);
                          onUpdate({ ...block.data, questions: newQs });
                      }}
                      className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 pl-1">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kunci Jawaban:</span>
                         <span className={cn(
                             "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                             q.isCorrect ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                         )}>
                             {q.isCorrect ? "BENAR" : "SALAH"}
                         </span>
                    </div>
                    <div className="flex gap-1 bg-white dark:bg-white/5 p-1 rounded-md shadow-sm">
                        <button
                            onClick={() => {
                                const newQs = [...block.data.questions];
                                newQs[idx].isCorrect = true;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                            className={cn(
                                "px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all",
                                q.isCorrect 
                                    ? "bg-emerald-500 text-white shadow-sm" 
                                    : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            )}
                        >
                            Benar
                        </button>
                        <button
                            onClick={() => {
                                const newQs = [...block.data.questions];
                                newQs[idx].isCorrect = false;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                            className={cn(
                                "px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all",
                                !q.isCorrect 
                                    ? "bg-red-500 text-white shadow-sm" 
                                    : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            )}
                        >
                            Salah
                        </button>
                    </div>
                </div>
            </div>
         ))}
      </div>

      <button 
        onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '', translation: '', isCorrect: true }] })}
        className="w-full py-2 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-3.5 h-3.5" /> <span>Tambah Soal Kilat</span>
      </button>
    </div>
  );
};

export default CompleteSentenceEditor;
