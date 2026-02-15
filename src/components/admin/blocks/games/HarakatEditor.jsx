import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Editor for Harakat game block
 * Players add diacritics (harakat) to Arabic words
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const HarakatEditor = ({ block, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
        <input 
           type="text" 
           placeholder="Lengkapi Harakat..."
           className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
           value={block.data.title || ''}
           onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sub-judul / Instruksi</label>
        <input 
           type="text" 
           placeholder="Lengkapi harakat pada kata berikut..."
           className="w-full font-medium text-slate-500 dark:text-slate-400 bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
           value={block.data.subtitle || ''}
           onChange={(e) => onUpdate({ ...block.data, subtitle: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Kosakata (Dengan Harakat)</label>
           <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">Sistem akan menghapus harakat otomatis di soal</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
           {block.data.questions?.map((item, idx) => (
              <div key={idx} className="group relative bg-white dark:bg-black/20 p-2 pt-6 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col items-center transition-all hover:border-orange-200 dark:hover:border-orange-500/30">
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center justify-center font-black text-[8px]">
                     {idx + 1}
                  </div>
                  <button 
                    onClick={() => {
                        const newQs = block.data.questions.filter((_, i) => i !== idx);
                        onUpdate({ ...block.data, questions: newQs });
                    }}
                    className="absolute top-1 right-1 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input 
                     type="text"
                     className="w-full bg-transparent text-xl font-bold outline-none arabic-content transition-all dir-rtl text-center placeholder-slate-300 py-3 mt-1 leading-loose"
                     placeholder="يَأْكُلُ"
                     value={item.text}
                     onChange={(e) => {
                        const newQs = [...(block.data.questions || [])];
                        newQs[idx].text = e.target.value;
                        onUpdate({ ...block.data, questions: newQs });
                     }}
                  />
              </div>
           ))}

           <button 
              onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '' }] })}
              className="w-full py-4 bg-white dark:bg-white/5 border-2 border-dashed border-orange-200 dark:border-orange-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-orange-400 hover:border-orange-500 hover:text-orange-500 transition-all"
           >
              + Tambah Kata Ber-harakat
           </button>
        </div>
      </div>
    </div>
  );
};

export default HarakatEditor;
