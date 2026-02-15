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
    <div className="space-y-4">
      <div className="space-y-3">
        {(block.data.questions || []).map((q, idx) => (
          <div 
            key={q.id || idx} 
            className="p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 space-y-3 relative group"
          >
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded">
                    Tebak Kata #{idx+1}
                </span>
                <button 
                  onClick={() => {
                    const newQs = block.data.questions.filter((_, i) => i !== idx);
                    onUpdate({ ...block.data, questions: newQs });
                  }}
                  className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus Kata"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Kata Target (Arab)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: كِتَاب"
                  className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-right outline-none focus:ring-1 focus:ring-rose-500 transition-all arabic-content text-sm font-medium"
                  style={{ direction: 'rtl' }}
                  value={q.word || ''}
                  onChange={(e) => {
                    const newQs = [...block.data.questions];
                    newQs[idx].word = e.target.value;
                    onUpdate({ ...block.data, questions: newQs });
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Arti / Jawaban (Indo)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Buku"
                  className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-rose-500 transition-all text-rose-600 dark:text-rose-400"
                  value={q.meaning || ''}
                  onChange={(e) => {
                    const newQs = [...block.data.questions];
                    newQs[idx].meaning = e.target.value;
                    onUpdate({ ...block.data, questions: newQs });
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Petunjuk / Hint (Opsional)</label>
              <input 
                type="text" 
                placeholder="Sesuatu yang dibaca..."
                className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-rose-500 transition-all"
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
        className="w-full py-2 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-3.5 h-3.5" /> <span>Tambah Kata Baru</span>
      </button>
    </div>
  );
};

export default HangmanEditor;
