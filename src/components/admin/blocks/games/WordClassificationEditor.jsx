import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for WordClassification game block
 * Players sort words into categories within a time limit
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array and time limit
 * @param {Function} props.onUpdate - Callback to update block data
 */
const WordClassificationEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
                <input 
                    type="text" 
                    placeholder="Judul Game..."
                    className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-rose-500 outline-none text-sm py-1 transition-colors"
                    value={block.data.title || ''}
                    onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Durasi Waktu (Detik)</label>
                <div className="flex items-center gap-2 border-b border-transparent pb-1">
                    <input 
                        type="number" 
                        min="10"
                        max="300"
                        className="w-full bg-transparent font-bold text-slate-700 dark:text-white outline-none text-sm py-1 focus:text-rose-500 transition-colors"
                        value={block.data.timeLimit || 60}
                        onChange={(e) => onUpdate({ ...block.data, timeLimit: parseInt(e.target.value) || 60 })}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detik</span>
                </div>
            </div>
         </div>
      </div>

      <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded">Daftar Kata ({block.data.questions?.length || 0})</label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {block.data.questions?.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 relative group hover:border-rose-500/50 transition-all">
                    <div className="flex justify-between items-start">
                         <div className="w-5 h-5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                         </div>
                         <button 
                            onClick={() => {
                                const newQs = block.data.questions.filter((_, i) => i !== idx);
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                            className="text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Kata"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <input 
                            type="text"
                            className={cn(
                                "w-full bg-transparent text-xl font-bold outline-none border-b border-dashed border-slate-200 dark:border-white/10 focus:border-rose-500/50 focus:border-solid transition-all text-center py-1",
                                isArabic(item.text) && "arabic-content"
                            )}
                            value={item.text}
                            onChange={(e) => {
                                const newQs = [...(block.data.questions || [])];
                                newQs[idx].text = e.target.value;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Jenis</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-black/20 px-2 py-1.5 rounded-lg text-[10px] font-medium outline-none border border-transparent focus:border-rose-500/50 text-center"
                                    placeholder="Isim..."
                                    value={item.category}
                                    onChange={(e) => {
                                        const newQs = [...(block.data.questions || [])];
                                        newQs[idx].category = e.target.value;
                                        onUpdate({ ...block.data, questions: newQs });
                                    }}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Arti</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-black/20 px-2 py-1.5 rounded-lg text-[10px] font-medium outline-none border border-transparent focus:border-rose-500/50 text-center text-slate-500"
                                    placeholder="Buku..."
                                    value={item.translation}
                                    onChange={(e) => {
                                        const newQs = [...(block.data.questions || [])];
                                        newQs[idx].translation = e.target.value;
                                        onUpdate({ ...block.data, questions: newQs });
                                    }}
                                />
                            </div>
                    </div>
                </div>
            ))}
          </div>
          
          <button 
            onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '', category: '', translation: '' }] })}
            className="w-full py-2 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Tambah Kata Baru</span>
          </button>
      </div>
    </div>
  );
};

export default WordClassificationEditor;
