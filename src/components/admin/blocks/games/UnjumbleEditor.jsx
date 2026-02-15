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
    <div className="space-y-4">
       <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
             <input 
                 type="text" 
                 placeholder="Judul Game..."
                 className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-purple-500 outline-none text-sm py-1 transition-colors"
                 value={block.data.title || ''}
                 onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
             />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sub-Judul (Opsional)</label>
             <input 
                 type="text" 
                 placeholder="Contoh: Kalimat Kerja + Objek"
                 className="w-full bg-transparent font-medium text-slate-600 dark:text-slate-400 border-b border-transparent focus:border-purple-500 outline-none text-xs py-1 transition-colors"
                 value={block.data.subtitle || ''}
                 onChange={(e) => onUpdate({ ...block.data, subtitle: e.target.value })}
             />
          </div>
       </div>

       <div className="space-y-3">
          {block.data.questions?.map((item, idx) => (
             <div key={idx} className="bg-white dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3 relative group">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">Susun Kalimat #{idx+1}</span>
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
                
                <div className="space-y-3">
                    <div className="space-y-1">
                         <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Kalimat Arab (Akan diacak)</label>
                         <textarea 
                            className="w-full bg-slate-50 dark:bg-black/20 p-3 rounded-lg font-medium outline-none border border-transparent focus:border-purple-500/50 resize-none h-20 leading-relaxed text-right dir-rtl arabic-content transition-all text-sm"
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Pola (Pattern)</label>
                            <input 
                               type="text"
                               className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-xs font-medium outline-none border border-transparent focus:border-purple-500/50"
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
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Petunjuk (Clue)</label>
                            <input 
                               type="text"
                               className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-xs font-medium outline-none border border-transparent focus:border-purple-500/50"
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
         className="w-full py-2 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex items-center justify-center gap-2"
       >
         <span>+ Tambah Kalimat Baru</span>
       </button>
    </div>
  );
};

export default UnjumbleEditor;
