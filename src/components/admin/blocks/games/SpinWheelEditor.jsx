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
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Roda Keberuntungan</label>
        <input 
          type="text" 
          placeholder="Spin the Wheel..."
          className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-pink-500 outline-none text-sm py-1 transition-colors"
          value={block.data.title || ''}
          onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {block.data.items?.map((item, idx) => (
          <div key={idx} className="group relative bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/10">
            <button 
              onClick={() => {
                const newItems = block.data.items.filter((_, i) => i !== idx);
                onUpdate({ ...block.data, items: newItems });
              }}
              className="absolute left-1 top-1 text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Hapus"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <input 
              type="text" 
              dir={isArabic(item.text) ? "rtl" : "ltr"}
              className={cn(
                "w-full bg-transparent text-xs font-bold outline-none text-center border-b border-dashed border-slate-200 dark:border-white/10 focus:border-pink-500/50 focus:border-solid py-1 transition-all",
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
          </div>
        ))}

        <button 
          onClick={() => onUpdate({ ...block.data, items: [...(block.data.items || []), { id: Date.now(), text: '' }] })}
          className="bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-pink-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all flex items-center justify-center gap-2 min-h-[38px]"
        >
          <Plus className="w-3 h-3" />
          <span>Tambah</span>
        </button>
      </div>

      <div className="p-2.5 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-100 dark:border-pink-900/30 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-pink-500 shrink-0" />
        <p className="text-[10px] font-medium text-pink-700 dark:text-pink-400">Roda ini untuk menentukan kuis atau aktivitas secara acak di kelas.</p>
      </div>
    </div>
  );
};

export default SpinWheelEditor;
