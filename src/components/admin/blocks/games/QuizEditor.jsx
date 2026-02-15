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
    <div className="space-y-6">
      <input 
        type="text" 
        placeholder="Judul Kuis..."
        className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 outline-none text-sm"
        value={block.data.title || ''}
        onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
      />
      <div className="space-y-4">
        {block.data.questions?.map((q, qIdx) => (
          <div key={qIdx} className="bg-slate-100 dark:bg-white/5 p-5 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <textarea 
                placeholder="Tulis pertanyaan di sini..."
                className={cn(
                    "w-full bg-transparent text-sm font-bold outline-none resize-none h-12 transition-all",
                    isArabic(q.text) && "arabic-content"
                )}
                value={q.text}
                onChange={(e) => {
                  const newQs = [...block.data.questions];
                  newQs[qIdx].text = e.target.value;
                  onUpdate({ ...block.data, questions: newQs });
                }}
              />
              <button 
                onClick={() => {
                  const newQs = block.data.questions.filter((_, i) => i !== qIdx);
                  onUpdate({ ...block.data, questions: newQs });
                }}
                className="p-2 text-slate-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => (
                <div key={opt.id || oIdx} className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const newQs = [...block.data.questions];
                      newQs[qIdx].options = q.options.map((o, idx) => ({ ...o, isCorrect: idx === oIdx }));
                      onUpdate({ ...block.data, questions: newQs });
                    }}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                      opt.isCorrect ? "bg-teal-500 border-teal-500 text-white" : "border-slate-300 dark:border-white/10"
                    )}
                  >
                    {opt.isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </button>
                  <input 
                    type="text" 
                    placeholder="Pilihan jawaban..."
                    className={cn(
                        "flex-1 bg-white dark:bg-white/5 px-4 py-2.5 rounded-xl text-xs outline-none border border-transparent focus:border-teal-500/50 transition-all",
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
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      title="Hapus Opsi"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => {
                  const newQs = [...block.data.questions];
                  newQs[qIdx].options = [...q.options, { id: Date.now(), text: '', isCorrect: false }];
                  onUpdate({ ...block.data, questions: newQs });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all uppercase tracking-widest mt-2"
              >
                 <Plus className="w-3 h-3" /> Tambah Opsi
              </button>
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '', options: [{ id: 1, text: '', isCorrect: true }, { id: 2, text: '', isCorrect: false }] }] })}
        className="w-full py-3 bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:border-teal-500 hover:text-teal-500 transition-all"
      >
        + Tambah Pertanyaan
      </button>
    </div>
  );
};

export default QuizEditor;
