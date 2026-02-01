import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService'; // Added
import { FileText, Upload, Save, AlertCircle, Eye, Trash2 } from 'lucide-react';
import PdfViewer from '../../components/PdfViewer'; // Fixed import to default if standard
import { useToast } from '../../components/Toast';

const CopyrightEditor = () => {
    const [pdfUrl, setPdfUrl] = useState('');
    const [initialPdfUrl, setInitialPdfUrl] = useState(''); // GC Tracking
    const [pendingFile, setPendingFile] = useState(null); // File to upload
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const config = await contentService.getCopyrightConfig();
        if (config && config.pdfUrl) {
            setPdfUrl(config.pdfUrl);
            setInitialPdfUrl(config.pdfUrl);
        }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Mohon unggah file dengan format PDF.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB Limit
            toast.error('Ukuran file terlalu besar (Maks 5MB).');
            return;
        }

        // Use Object URL for preview
        const objectUrl = URL.createObjectURL(file);
        setPdfUrl(objectUrl);
        setPendingFile(file); // Store for upload on Save
        toast.success('File siap disimpan.');
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let finalUrl = pdfUrl;

            // 1. Upload if new file
            if (pendingFile) {
                toast.info("Mengupload PDF ke Storage...");
                finalUrl = await storageService.uploadFile(pendingFile, 'copyright');
            }

            // 2. GC: Cleanup old file
            if (initialPdfUrl && initialPdfUrl !== finalUrl) {
                if (initialPdfUrl.includes('firebasestorage')) {
                    console.log('[GC] Deleting old copyright file:', initialPdfUrl);
                     // Non-blocking but good to know
                    storageService.deleteFile(initialPdfUrl).catch(e => console.warn(e));
                }
            }

            // 3. Save to Firestore
            await contentService.saveCopyrightConfig({ pdfUrl: finalUrl });
            
            // 4. Update State
            setPdfUrl(finalUrl);
            setInitialPdfUrl(finalUrl);
            setPendingFile(null);
            
            toast.success('File Hak Cipta berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error('Gagal menyimpan file.');
        }
        setLoading(false);
    };

    const handleClear = () => {
        if (window.confirm('Hapus file Hak Cipta saat ini?')) {
             setPdfUrl('');
             setPendingFile(null);
             toast.success('File dihapus dari editor (belum disimpan).');
        }
    };

    if (loading && !pdfUrl) return <div className="p-12 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
             <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-2 font-arabic">Manajemen Hak Cipta</h1>
                <p className="text-[var(--color-text-muted)]">Unggah dokumen Hak Cipta (PDF) untuk ditampilkan di halaman depan.</p>
            </div>

            <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] p-8">
                
                {/* Upload Area */}
                <div className="mb-8 p-8 border-2 border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors relative">
                    <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        {uploading ? <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"/> : <Upload className="w-8 h-8" />}
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-2">
                        {uploading ? 'Memproses File...' : 'Klik untuk Unggah PDF'}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Format PDF, Maksimal 3MB</p>
                </div>

                {/* File Status & Actions */}
                {pdfUrl ? (
                    <div className="bg-[var(--color-bg-main)] p-4 rounded-lg border border-[var(--color-border)] mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--color-text-main)]">Dokumen Hak Cipta Aktif</p>
                                <p className="text-xs text-[var(--color-text-muted)]">Siap untuk disimpan/ditampilkan</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setPreviewMode(!previewMode)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg flex items-center gap-2 text-sm font-medium"
                             >
                                <Eye className="w-4 h-4" />
                                {previewMode ? 'Tutup Preview' : 'Lihat Preview'}
                             </button>
                             <button 
                                onClick={handleClear}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                title="Hapus File"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-6 flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Belum ada dokumen yang diunggah.</span>
                    </div>
                )}

                {/* PREVIEW */}
                {previewMode && pdfUrl && (
                    <div className="mb-6 border border-[var(--color-border)] rounded-xl overflow-hidden shadow-lg h-[600px]">
                         <PdfViewer fileUrl={pdfUrl} />
                    </div>
                )}

                {/* SAVE BUTTON */}
                <div className="flex justify-end pt-6 border-t border-[var(--color-border)]">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg active:scale-95 transition-all"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CopyrightEditor;
