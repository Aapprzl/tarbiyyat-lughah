import { Trash2, Plus } from 'lucide-react';
import { cn } from '../../../../utils/cn';

/**
 * Editor for Memory game block
 * Card matching game with Arabic-Indonesian pairs
 * 
 * @param {Object} props
 * @param {Object} props.block - Block data containing pairs array
 * @param {Function} props.onUpdate - Callback to update block data
 */
const MemoryEditor = ({ block, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
          <input 
            type="text" 
            placeholder="Judul Game..."
            className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-violet-500 outline-none text-sm py-1 transition-colors"
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded">Pasangan Kata ({block.data.pairs?.length || 0})</label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {block.data.pairs?.map((pair, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 relative group hover:border-violet-500/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="w-5 h-5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-[10px]">
                  {idx + 1}
                </div>
                <button 
                  onClick={() => {
                    const newPairs = block.data.pairs.filter((_, i) => i !== idx);
                    onUpdate({ ...block.data, pairs: newPairs });
                  }}
                  className="text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus Pasangan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <input 
                    type="text" 
                    className={cn(
                      "w-full bg-transparent text-lg font-bold outline-none border-b border-dashed border-slate-200 dark:border-white/10 focus:border-violet-500/50 focus:border-solid transition-all text-center py-1 arabic-content",
                    )}
                    style={{ direction: 'rtl' }}
                    value={pair.question}
                    onChange={(e) => {
                      const newPairs = [...block.data.pairs];
                      newPairs[idx].question = e.target.value;
                      onUpdate({ ...block.data, pairs: newPairs });
                    }}
                  />
                </div>
                
                <div className="space-y-1">
                  <input 
                    type="text" 
                    className={cn(
                      "w-full bg-slate-50 dark:bg-black/20 px-2 py-1.5 rounded-lg text-[10px] font-medium outline-none border border-transparent focus:border-violet-500/50 text-center text-violet-600 dark:text-violet-400 font-bold",
                    )}
                    placeholder="Terjemah..."
                    value={pair.answer}
                    onChange={(e) => {
                      const newPairs = [...block.data.pairs];
                      newPairs[idx].answer = e.target.value;
                      onUpdate({ ...block.data, pairs: newPairs });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => onUpdate({ ...block.data, pairs: [...(block.data.pairs || []), { id: Date.now(), question: '', answer: '' }] })}
            className="w-full aspect-square md:aspect-auto md:h-auto py-4 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-violet-500 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> <span>Tambah Baris</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryEditor;
