import React from 'react';
import ImageViewer from '../../../media/ImageViewer';

/**
 * ImageBlock Component
 * Image file upload and display
 * 
 * @param {Object} data - Block data containing title, url, fileName, and rawFile
 * @param {Function} onUpdate - Callback to update block data
 * @param {Object} toast - Toast notification object
 */
const ImageBlock = ({ data, onUpdate, toast }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { 
                toast?.warning("Ukuran gambar maksimal 2MB.");
                return;
            }
            const objectUrl = URL.createObjectURL(file);
            onUpdate({ 
                ...data, 
                url: objectUrl, 
                fileName: file.name,
                rawFile: file 
            });
        }
    };

    return (
        <div className="space-y-3">
            <input 
                type="text" 
                placeholder="Judul Gambar (Opsional)..."
                className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 text-sm outline-none placeholder-[var(--color-text-muted)]/50"
                value={data.title || ''}
                onChange={(e) => onUpdate({ ...data, title: e.target.value })}
            />
            <div className="flex gap-2 items-center p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] border-dashed">
                <input 
                    type="file" 
                    accept="image/*"
                    className="block w-full text-xs text-[var(--color-text-muted)] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-pink-50 dark:file:bg-pink-900/30 file:text-pink-600 dark:file:text-pink-400 hover:file:bg-pink-100 dark:hover:file:bg-pink-900/50 cursor-pointer"
                    onChange={handleFileChange}
                />
            </div>
            
            {/* Preview */}
            {data.url && (
                <div className="mt-3">
                    <ImageViewer src={data.url} title={data.title} className="max-w-xs mx-auto" />
                </div>
            )}
        </div>
    );
};

export default ImageBlock;
