import React from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for SpinWheel game block
 * Random vocabulary wheel spinner
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing items array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const SpinWheelEditor = ({ block, onUpdate }) => {
  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  return (
    <div className="space-y-6">
       <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Roda Keberuntungan</label>
          <input 
             type="text" 
             placeholder="Spin the Wheel..."
             className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
             value={block.data.title || ''}
             onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
          />
       </div>
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {block.data.items?.map((item, idx) => (
             <div key={idx} className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10 group/item relative">
                 <input 
                    type="text" 
                    className={cn(
                        "w-full bg-transparent text-xs font-bold outline-none text-center transition-all",
                        isArabic(item.text) && "arabic-content"
                    )}
                    placeholder={`Item ${idx+1}`}
                    value={item.text}
                    onChange={(e) => {
                       const newItems = [...block.data.items];
                       newItems[idx].text = e.target.value;
                       onUpdate({ ...block.data, items: newItems });
                    }}
                 />
                <button 
                  onClick={() => {
                     const newItems = block.data.items.filter((_, i) => i !== idx);
                     onUpdate({ ...block.data, items: newItems });
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover/item:opacity-100 transition-all shadow-lg flex items-center justify-center scale-75 group-hover/item:scale-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
             </div>
          ))}
          <button 
             onClick={() => onUpdate({ ...block.data, items: [...(block.data.items || []), { id: Date.now(), text: '' }] })}
             className="aspect-video bg-white dark:bg-white/5 border-2 border-dashed border-pink-200 dark:border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400 hover:border-pink-500 hover:text-pink-500 transition-all p-2"
          >
             <Plus className="w-4 h-4" />
          </button>
       </div>
       <div className="p-4 bg-pink-500/5 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
          <p className="text-[10px] font-medium text-pink-600 dark:text-pink-400">Roda ini dapat digunakan untuk menentukan kuis atau aktivitas secara acak di kelas.</p>
       </div>
    </div>
  );
};

export default SpinWheelEditor;
