import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * AlertBlock Component
 * Info/Warning/Success alert boxes
 * 
 * @param {Object} data - Block data containing content
 * @param {Function} onUpdate - Callback to update block data
 */
const AlertBlock = ({ data, onUpdate }) => {
    return (
        <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg items-start border border-amber-100 dark:border-amber-900/30">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <textarea 
                className="bg-transparent w-full outline-none text-amber-900 dark:text-amber-200 resize-none text-sm h-16 placeholder-amber-400"
                placeholder="Tulis info penting..."
                value={data.content || ''}
                onChange={(e) => onUpdate({ ...data, content: e.target.value })}
            />
        </div>
    );
};

export default AlertBlock;
