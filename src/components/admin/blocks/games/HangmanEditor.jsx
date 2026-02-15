import React from 'react';
import { Trash2, Plus } from 'lucide-react';

/**
 * Editor for Hangman game block
 * Word guessing game with hints
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const HangmanEditor = ({ block, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {(block.data.questions || []).map((q, idx) => (
          <div 
            key={q.id || idx} 
            className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 space-y-4 relative group"
          >
            <button 
              onClick={() => {
                const newQs = block.data.questions.filter((_, i) => i !== idx);
                onUpdate({ ...block.data, questions: newQs });
              }}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kata Target (Arab)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: كِتَاب"
                  className="w-full font-bold text-xl text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-2 outline-none px-1 arabic-content"
                  style={{ direction: 'rtl' }}
                  value={q.word || ''}
                  onChange={(e) => {
                    const newQs = [...block.data.questions];
                    newQs[idx].word = e.target.value;
                    onUpdate({ ...block.data, questions: newQs });
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Arti / Jawaban (Indo)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Buku"
                  className="w-full font-bold text-lg text-red-600 dark:text-red-400 bg-transparent border-b border-[var(--color-border)] pb-2 outline-none px-1"
                  value={q.meaning || ''}
                  onChange={(e) => {
                    const newQs = [...block.data.questions];
                    newQs[idx].meaning = e.target.value;
                    onUpdate({ ...block.data, questions: newQs });
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Petunjuk / Hint (Opsional)</label>
              <input 
                type="text" 
                placeholder="Sesuatu yang dibaca..."
                className="w-full text-sm text-[var(--color-text-muted)] bg-transparent border-b border-[var(--color-border)] pb-2 outline-none px-1"
                value={q.hint || ''}
                onChange={(e) => {
                  const newQs = [...block.data.questions];
                  newQs[idx].hint = e.target.value;
                  onUpdate({ ...block.data, questions: newQs });
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => onUpdate({ 
          ...block.data, 
          questions: [...(block.data.questions || []), { id: Date.now(), word: '', meaning: '', hint: '' }] 
        })}
        className="w-full py-4 bg-white dark:bg-white/5 border-2 border-dashed border-rose-200 dark:border-rose-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-400 hover:border-rose-500 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Tambah Kata Algojo
      </button>
    </div>
  );
};

export default HangmanEditor;
