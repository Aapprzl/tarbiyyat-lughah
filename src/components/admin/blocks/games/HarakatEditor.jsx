import React from 'react';
import { Trash2, Plus } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
            <input 
               type="text" 
               placeholder="Judul Game..."
               className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-orange-500 outline-none text-sm py-1 transition-colors"
               value={block.data.title || ''}
               onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sub-judul / Instruksi</label>
            <input 
               type="text" 
               placeholder="Instruksi permainan..."
               className="w-full bg-transparent font-medium text-slate-500 dark:text-slate-400 border-b border-transparent focus:border-orange-500 outline-none text-xs py-1 transition-colors"
               value={block.data.subtitle || ''}
               onChange={(e) => onUpdate({ ...block.data, subtitle: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
           <label className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">Daftar Kosakata ({block.data.questions?.length || 0})</label>
           <span className="text-[9px] font-bold text-slate-400 italic">Sistem akan menghapus harakat otomatis di soal</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
           {block.data.questions?.map((item, idx) => (
              <div key={idx} className="group relative bg-white dark:bg-white/5 p-3 pt-6 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col items-center transition-all hover:border-orange-500/50">
                  <div className="absolute top-2 left-2 w-5 h-5 rounded bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                     {idx + 1}
                  </div>
                  <button 
                    onClick={() => {
                        const newQs = block.data.questions.filter((_, i) => i !== idx);
                        onUpdate({ ...block.data, questions: newQs });
                    }}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus Kata"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input 
                     type="text"
                     className="w-full bg-transparent text-xl font-bold outline-none border-b border-dashed border-slate-200 dark:border-white/20 focus:border-orange-500/50 focus:border-solid transition-all arabic-content text-center py-2"
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
              className="w-full aspect-square md:aspect-auto md:h-auto py-4 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex flex-col items-center justify-center gap-2"
           >
              <Plus className="w-4 h-4" /> <span>Tambah Kata</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default HarakatEditor;
