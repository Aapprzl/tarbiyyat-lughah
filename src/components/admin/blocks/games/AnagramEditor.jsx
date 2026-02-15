import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for Anagram game block
 * Players unscramble letters to form words
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const AnagramEditor = ({ block, onUpdate }) => {
  return (
    <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/10 space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Permainan Anagram</label>
        <input 
          type="text" 
          placeholder="Judul..."
          className="w-full bg-white dark:bg-white/10 px-5 py-3 rounded-2xl text-sm outline-none border border-transparent focus:border-orange-500"
          value={block.data.title || ''}
          onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
        />
      </div>
      <div className="space-y-4">
         {block.data.questions?.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Anagram #{idx+1}</span>
                  <button 
                    onClick={() => {
                        const newQs = block.data.questions.filter((_, i) => i !== idx);
                        onUpdate({ ...block.data, questions: newQs });
                    }}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
               <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 px-1">Kata Target (Akan diacak)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl text-right outline-none focus:ring-2 focus:ring-orange-500/50 transition-all arabic-content"
                            style={{ 
                                direction: 'rtl'
                            }}
                            value={item.answer}
                            onChange={(e) => {
                                const newQs = [...block.data.questions];
                                newQs[idx].answer = e.target.value;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 px-1">Clue / Petunjuk</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-black/20 p-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-orange-500"
                            placeholder="Tulis clue..."
                            value={item.clue}
                            onChange={(e) => {
                                const newQs = [...block.data.questions];
                                newQs[idx].clue = e.target.value;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                        />
                    </div>
               </div>
            </div>
         ))}
      </div>
      <button 
        onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), answer: '', clue: '' }] })}
        className="w-full py-3 bg-white dark:bg-white/5 border-2 border-dashed border-orange-200 dark:border-orange-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-orange-400 hover:border-orange-500 hover:text-orange-500 transition-all"
      >
        + Tambah Kata
      </button>
    </div>
  );
};

export default AnagramEditor;
