import { Trash2 } from 'lucide-react';

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
    <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Permainan</label>
        <input 
          type="text" 
          placeholder="Judul..."
          className="w-full bg-white dark:bg-white/10 px-3 py-2 rounded-lg text-sm outline-none border border-transparent focus:border-orange-500 transition-all font-medium"
          value={block.data.title || ''}
          onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
        />
      </div>

      <div className="space-y-3">
         {block.data.questions?.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-3 relative group">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">Soal #{idx+1}</span>
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
               
               <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 px-1 uppercase">Kata Target (Arab)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-right outline-none focus:ring-1 focus:ring-orange-500 transition-all arabic-content text-sm"
                            style={{ direction: 'rtl' }}
                            placeholder="Kata Arab..."
                            value={item.answer}
                            onChange={(e) => {
                                const newQs = [...block.data.questions];
                                newQs[idx].answer = e.target.value;
                                onUpdate({ ...block.data, questions: newQs });
                            }}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 px-1 uppercase">Clue / Petunjuk</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-orange-500"
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
        className="w-full py-2 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex items-center justify-center gap-2"
      >
        <span>+ Tambah Kata Baru</span>
      </button>
    </div>
  );
};

export default AnagramEditor;
