import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Editor for Unjumble game block
 * Players arrange scrambled words to form correct sentences
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing questions array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const UnjumbleEditor = ({ block, onUpdate }) => {
  return (
    <div className="space-y-6">
       <div className="space-y-4">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
             <input 
                 type="text" 
                 placeholder="Judul Game..."
                 className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none"
                 value={block.data.title || ''}
                 onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sub-Judul (Opsional)</label>
             <input 
                 type="text" 
                 placeholder="Contoh: Kalimat Kerja + Objek"
                 className="w-full font-medium text-base text-slate-600 dark:text-slate-300 bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none"
                 value={block.data.subtitle || ''}
                 onChange={(e) => onUpdate({ ...block.data, subtitle: e.target.value })}
             />
          </div>
       </div>

       <div className="space-y-4">
          {block.data.questions?.map((item, idx) => (
             <div key={idx} className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Susun Kalimat #{idx+1}</span>
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
                
                <div className="space-y-4">
                    <textarea 
                       className="w-full bg-white dark:bg-black/20 p-6 rounded-2xl font-bold outline-none border border-transparent focus:border-purple-500 resize-none h-32 leading-relaxed text-right dir-rtl arabic-content transition-all"
                       style={{ 
                           lineHeight: '1.8'
                       }}
                       placeholder="Ketik kalimat Arab lengkap di sini..."
                       value={item.text}
                       onChange={(e) => {
                          const newQs = [...block.data.questions];
                          newQs[idx].text = e.target.value;
                          onUpdate({ ...block.data, questions: newQs });
                       }}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pola (Pattern)</label>
                            <input 
                               type="text"
                               className="w-full bg-white dark:bg-black/20 px-4 py-2 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-purple-500"
                               placeholder="Contoh: Kerja + Pelaku + Objek"
                               value={item.pattern || ''}
                               onChange={(e) => {
                                  const newQs = [...block.data.questions];
                                  newQs[idx].pattern = e.target.value;
                                  onUpdate({ ...block.data, questions: newQs });
                               }}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Petunjuk (Clue)</label>
                            <input 
                               type="text"
                               className="w-full bg-white dark:bg-black/20 px-4 py-2 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-purple-500"
                               placeholder="Petunjuk tambahan..."
                               value={item.clue || ''}
                               onChange={(e) => {
                                  const newQs = [...block.data.questions];
                                  newQs[idx].clue = e.target.value;
                                  onUpdate({ ...block.data, questions: newQs });
                               }}
                            />
                        </div>
                    </div>
                </div>
             </div>
          ))}
       </div>
       <button 
         onClick={() => onUpdate({ ...block.data, questions: [...(block.data.questions || []), { id: Date.now(), text: '', pattern: '', clue: '' }] })}
         className="w-full py-4 bg-white dark:bg-white/5 border-2 border-dashed border-purple-200 dark:border-purple-500/20 rounded-3xl text-xs font-black uppercase tracking-widest text-purple-400 hover:border-purple-500 hover:text-purple-500 transition-all"
       >
         + Tambah Kalimat Baru
       </button>
    </div>
  );
};

export default UnjumbleEditor;
