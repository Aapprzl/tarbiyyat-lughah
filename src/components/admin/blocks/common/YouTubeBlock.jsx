import React from 'react';
import { Youtube } from 'lucide-react';

/**
 * YouTubeBlock Component
 * YouTube video embed with URL input
 * 
 * @param {Object} data - Block data containing title and url
 * @param {Function} onUpdate - Callback to update block data
 */
const YouTubeBlock = ({ data, onUpdate }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">
                <Youtube className="w-4 h-4 text-red-500" />
                <input 
                    type="text" 
                    placeholder="Paste Link YouTube..."
                    className="w-full bg-transparent text-red-800 dark:text-red-300 text-xs font-mono outline-none placeholder-red-300"
                    value={data.url || ''}
                    onChange={(e) => onUpdate({ ...data, url: e.target.value })}
                />
            </div>
            <input 
                type="text" 
                placeholder="Judul Video (Opsional)..."
                className="w-full bg-[var(--color-bg-muted)] text-[var(--color-text-main)] p-2 rounded-lg text-sm outline-none border border-transparent focus:border-teal-500/50"
                value={data.title || ''}
                onChange={(e) => onUpdate({ ...data, title: e.target.value })}
            />
        </div>
    );
};

export default YouTubeBlock;
