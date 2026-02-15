import React from 'react';

/**
 * VocabBlock Component
 * Vocabulary list with Arabic-Latin word pairs
 * 
 * @param {Object} data - Block data containing title and items array
 * @param {Function} onUpdate - Callback to update block data
 */
const VocabBlock = ({ data, onUpdate }) => {
    const addItem = () => {
        const newItems = [...(data.items || []), { arab: '', indo: '' }];
        onUpdate({ ...data, items: newItems });
    };

    const updateItem = (idx, field, value) => {
        const newItems = [...data.items];
        newItems[idx][field] = value;
        onUpdate({ ...data, items: newItems });
    };

    const removeItem = (idx) => {
        const newItems = data.items.filter((_, i) => i !== idx);
        onUpdate({ ...data, items: newItems });
    };

    return (
        <div className="space-y-4">
            <input 
                type="text" 
                placeholder="Judul Daftar Kosakata (Opsional)..."
                className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 outline-none text-sm placeholder-[var(--color-text-muted)]/50 focus:border-indigo-500/50 transition-colors"
                value={data.title || ''}
                onChange={(e) => onUpdate({ ...data, title: e.target.value })}
            />
            <div>
                {data.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                        <input 
                            type="text"
                            className="w-1/2 p-2 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded border-none outline-none text-sm focus:ring-1 focus:ring-teal-200"
                            placeholder="Indo"
                            value={item.indo}
                            onChange={(e) => updateItem(idx, 'indo', e.target.value)}
                        />
                        <input 
                            type="text"
                            className="w-1/2 p-3 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-xl text-right arabic-content transition-all border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-teal-500/50"
                            style={{ direction: 'rtl' }}
                            placeholder="Arab"
                            value={item.arab}
                            onChange={(e) => updateItem(idx, 'arab', e.target.value)}
                        />
                        <button 
                            onClick={() => removeItem(idx)}
                            className="text-[var(--color-text-muted)] hover:text-red-400 px-1"
                        >×</button>
                    </div>
                ))}
                <button 
                    onClick={addItem}
                    className="text-xs text-teal-600 font-medium hover:underline mt-1"
                >
                    + Tambah Baris
                </button>
            </div>
        </div>
    );
};

export default VocabBlock;
