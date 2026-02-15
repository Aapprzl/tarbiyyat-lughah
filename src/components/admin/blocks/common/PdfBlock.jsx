import React from 'react';
import PdfViewer from '../../../media/PdfViewer';

/**
 * PdfBlock Component
 * PDF file upload and display
 * 
 * @param {Object} data - Block data containing title, url, fileName, rawFile, and allowDownload
 * @param {Function} onUpdate - Callback to update block data
 * @param {Object} toast - Toast notification object
 */
const PdfBlock = ({ data, onUpdate, toast }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) { 
                toast?.warning("Ukuran file maksimal 3MB untuk kinerja browser yang optimal.");
                return;
            }
            // Use Object URL for fast preview interaction without freezing
            const objectUrl = URL.createObjectURL(file);
            onUpdate({ 
                ...data, 
                url: objectUrl, 
                fileName: file.name,
                rawFile: file // Store raw file to convert later on Save
            });
        }
    };

    return (
        <div className="space-y-3">
            <input 
                type="text" 
                placeholder="Judul File..."
                className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 text-sm outline-none placeholder-[var(--color-text-muted)]/50"
                value={data.title || ''}
                onChange={(e) => onUpdate({ ...data, title: e.target.value })}
            />
            <div className="flex gap-2 items-center p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] border-dashed">
                <input 
                    type="file" 
                    accept="application/pdf"
                    className="block w-full text-xs text-[var(--color-text-muted)] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-teal-50 dark:file:bg-teal-900/30 file:text-teal-600 dark:file:text-teal-400 hover:file:bg-teal-100 dark:hover:file:bg-teal-900/50 cursor-pointer"
                    onChange={handleFileChange}
                />
            </div>
            
            {/* Download Permission Toggle */}
            <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    checked={data.allowDownload !== false}
                    onChange={(e) => onUpdate({ ...data, allowDownload: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-teal-600 focus:ring-teal-500 bg-[var(--color-bg-muted)]"
                />
                Izinkan pengunjung mengunduh file ini
            </label>

            {/* Preview */}
            {data.url && (
                <div className="mt-3">
                    <div className="bg-[var(--color-bg-muted)] px-3 py-2 text-xs text-[var(--color-text-muted)] flex items-center justify-between rounded-t-lg border border-b-0 border-[var(--color-border)]">
                        <span>📄 {data.fileName || 'File PDF'}</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">✓ Terlampir</span>
                    </div>
                    <PdfViewer src={data.url} height={200} />
                </div>
            )}
        </div>
    );
};

export default PdfBlock;
