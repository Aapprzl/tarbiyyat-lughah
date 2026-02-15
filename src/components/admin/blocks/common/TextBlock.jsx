import React from 'react';
import { cn } from '../../../../utils/cn';

/**
 * TextBlock Component
 * Basic text input block with title and content textarea
 * 
 * @param {Object} data - Block data containing title and content
 * @param {Function} onUpdate - Callback to update block data
 */
const TextBlock = ({ data, onUpdate }) => {
    const isArabic = (text) => {
        if (!text) return false;
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        return arabicRegex.test(text);
    };

    return (
        <div className="space-y-3">
            <input 
                type="text" 
                placeholder="Judul Bagian..."
                className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 outline-none text-sm placeholder-[var(--color-text-muted)]/50"
                value={data.title || ''}
                onChange={(e) => onUpdate({ ...data, title: e.target.value })}
            />
            <textarea 
                placeholder="Tulis materi di sini..."
                className={cn(
                    "w-full h-48 text-sm resize-y outline-none text-[var(--color-text-main)] bg-transparent placeholder-[var(--color-text-muted)]/50 p-4 rounded-xl border border-slate-200 dark:border-white/10 transition-all",
                    isArabic(data.content) && "arabic-content"
                )}
                style={{ 
                    lineHeight: isArabic(data.content) ? '2' : '1.5',
                    direction: isArabic(data.content) ? 'rtl' : 'ltr'
                }}
                value={data.content || ''}
                onChange={(e) => onUpdate({ ...data, content: e.target.value })}
            />
        </div>
    );
};

export default TextBlock;
