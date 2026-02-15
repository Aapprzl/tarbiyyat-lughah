import React from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for Quiz game block
 * Multiple choice quiz with questions and options
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const QuizEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block mb-1">Judul Kuis</label>
        <input 
            type="text" 
            placeholder="Judul Kuis..."
            className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-teal-500 outline-none text-sm py-1 transition-colors"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        {block.data.questions?.map((q, qIdx) => (
          <div key={qIdx} className="bg-white dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3 relative group">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 space-y-1">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded">
                        Pertanyaan #{qIdx+1}
                    </span>
                 </div>
                 <textarea 
                    placeholder="Tulis pertanyaan..."
                    className={cn(
                        "w-full bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg text-sm font-medium outline-none border border-transparent focus:border-teal-500/50 resize-none min-h-[60px] transition-all",
                        isArabic(q.text) && "arabic-content text-right"
                    )}
                    style={{
                        direction: isArabic(q.text) ? 'rtl' : 'ltr'
                    }}
                    value={q.text}
                    onChange={(e) => {
                    const newQs = [...block.data.questions];
                    newQs[qIdx].text = e.target.value;
                    onUpdate({ ...block.data, questions: newQs });
                    }}
                />
              </div>
              <button 
                onClick={() => {
                  const newQs = block.data.questions.filter((_, i) => i !== qIdx);
                  onUpdate({ ...block.data, questions: newQs });
                }}
                className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Hapus Pertanyaan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="pl-1 space-y-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pilihan Jawaban (Centang yang benar)</label>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, oIdx) => (
                    <div key={opt.id || oIdx} className="flex items-center gap-2 group/opt">
                    <button 
                        onClick={() => {
                        const newQs = [...block.data.questions];
                        newQs[qIdx].options = q.options.map((o, idx) => ({ ...o, isCorrect: idx === oIdx }));
                        onUpdate({ ...block.data, questions: newQs });
                        }}
                        className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                        opt.isCorrect ? "bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-500/30" : "border-slate-300 dark:border-white/20 hover:border-teal-400"
                        )}
                        title={opt.isCorrect ? "Jawaban Benar" : "Tandai sebagai benar"}
                    >
                        {opt.isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </button>
                    <input 
                        type="text" 
                        placeholder={`Opsi ${oIdx + 1}...`}
                        className={cn(
                            "flex-1 bg-slate-50 dark:bg-black/20 px-3 py-1.5 rounded-md text-xs outline-none border border-transparent focus:border-teal-500/50 transition-all focus:bg-white dark:focus:bg-black/40",
                            isArabic(opt.text) && "arabic-content"
                        )}
                        style={{
                            direction: isArabic(opt.text) ? 'rtl' : 'ltr'
                        }}
                        value={opt.text}
                        onChange={(e) => {
                        const newQs = [...block.data.questions];
                        newQs[qIdx].options[oIdx].text = e.target.value;
                        onUpdate({ ...block.data, questions: newQs });
                        }}
                    />
                    {q.options.length > 2 && (
                        <button 
                        onClick={() => {
                            const newQs = [...block.data.questions];
                            newQs[qIdx].options = q.options.filter((_, i) => i !== oIdx);
                            // If we removed the correct answer, set the first one as correct
                            if (opt.isCorrect && newQs[qIdx].options.length > 0) {
                            newQs[qIdx].options[0].isCorrect = true;
                            }
                            onUpdate({ ...block.data, questions: newQs });
                        }}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/opt:opacity-100"
                        title="Hapus Opsi"
                        >
                        <X className="w-3 h-3" />
                        </button>
                    )}
                    </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  const newQs = [...block.data.questions];
                  newQs[qIdx].options = [...q.options, { id: Date.now(), text: '', isCorrect: false }];
                  onUpdate({ ...block.data, questions: newQs });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md transition-all uppercase tracking-widest mt-1 w-fit"
              >
                 <Plus className="w-3 h-3" /> Tambah Opsi
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '', options: [{ id: 1, text: '', isCorrect: true }, { id: 2, text: '', isCorrect: false }] }] })}
        className="w-full py-2 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-teal-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all flex items-center justify-center gap-2"
      >
        <span>+ Tambah Pertanyaan Baru</span>
      </button>
    </div>
  );
};

export default QuizEditor;
