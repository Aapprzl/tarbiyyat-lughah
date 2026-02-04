import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { ClipboardList, Upload, Save, AlertCircle, Eye, Trash2, Shield, Info, FileCheck, XCircle, ChevronRight, CircleCheckBig, Sparkles, Diamond } from 'lucide-react';
import PdfViewer from '../../components/PdfViewer';
import { useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const CopyrightEditor = () => {
    const [pdfUrl, setPdfUrl] = useState('');
    const [initialPdfUrl, setInitialPdfUrl] = useState('');
    const [pendingFile, setPendingFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const config = await contentService.getCopyrightConfig();
            if (config && config.pdfUrl) {
                setPdfUrl(config.pdfUrl);
                setInitialPdfUrl(config.pdfUrl);
            }
        } catch (err) {
            toast.error("Gagal memuat dokumen hak cipta.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Gagal: Produk hanya mendukung format PDF.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file melebihi batas (Maks 5MB).');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPdfUrl(objectUrl);
        setPendingFile(file);
        toast.success('Pratinjau PDF siap. Tekan Simpan untuk mengupload.');
    };

    const handleSave = async () => {
        setUploading(true);
        try {
            let finalUrl = pdfUrl;

            if (pendingFile) {
                toast.info("Mengenkripsi dan Mengupload Dokumen...");
                finalUrl = await storageService.uploadFile(pendingFile, 'copyright');
            }

            if (initialPdfUrl && initialPdfUrl !== finalUrl) {
                if (initialPdfUrl.includes('firebasestorage')) {
                    storageService.deleteFile(initialPdfUrl).catch(e => console.warn(e));
                }
            }

            await contentService.saveCopyrightConfig({ pdfUrl: finalUrl });
            
            setPdfUrl(finalUrl);
            setInitialPdfUrl(finalUrl);
            setPendingFile(null);
            
            toast.success('Sertifikat Hak Cipta telah diperbarui! 🛡️');
        } catch (err) {
            toast.error('Gagal mengamankan dokumen.');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        if (window.confirm('Hapus dokumen Hak Cipta saat ini dari editor?')) {
             setPdfUrl('');
             setPendingFile(null);
             toast.success('Data dihapus dari memori.');
        }
    };

    if (loading) return (
        <div className="py-24 text-center">
            <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Menyiapkan Manajemen Dokumen...</p>
        </div>
    );

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                      <Shield className="w-3 h-3" /> Intellectual Property
                   </div>
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Manajemen Hak Cipta</h1>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Lindungi karya anda dengan sertifikat resmi.</p>
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={uploading || (!pendingFile && pdfUrl === initialPdfUrl)}
                  className="group flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  {uploading ? 'Menyimpan...' : 'Amankan Dokumen'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Controls */}
                <div className="lg:col-span-5 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-white/5 p-8 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-8"
                    >
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Upload className="w-6 h-6" />
                            </div>
                            Unggah PDF
                        </h2>

                        <div className="relative aspect-[4/3] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center p-8 group overflow-hidden">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={uploading}
                            />
                            
                            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10" />
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Drop Sertifikat Disini</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center">Format .PDF maksimal 5MB. Pilih file dari komputer anda.</p>
                            
                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                        </div>

                        <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10 flex items-start gap-4">
                            <div className="w-8 h-8 shrink-0 bg-amber-500 text-white rounded-xl flex items-center justify-center">
                                <Info className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 leading-relaxed">
                                Pastikan sertifikat yang diunggah valid dan up-to-date. Sistem akan menghapus file lama saat dokumen baru disimpan.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Status & Preview Area */}
                <div className="lg:col-span-7 space-y-8">
                    <AnimatePresence mode="wait">
                        {pdfUrl ? (
                            <motion.div 
                                key="pdf-active"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                {/* Active File Badge */}
                                <div className="bg-emerald-500 text-white p-8 rounded-[3rem] shadow-xl shadow-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32"></div>
                                     <div className="flex items-center gap-6 relative">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                            <FileCheck className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">Dokumen Terdeteksi</h3>
                                            <p className="text-emerald-100 font-medium">{pendingFile ? 'Siap Diupload (Temporary)' : 'Tersimpan di Cloud'}</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-3 relative">
                                        <button 
                                            onClick={() => setPreviewMode(!previewMode)}
                                            className="px-6 py-3 bg-white text-emerald-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {previewMode ? 'Tutup Preview' : 'Preview'}
                                        </button>
                                        <button 
                                            onClick={handleClear}
                                            className="w-12 h-12 bg-white/20 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                     </div>
                                </div>

                                {/* Immersive Preview Container */}
                                <AnimatePresence>
                                    {previewMode && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-white dark:bg-black/40 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
                                        >
                                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                                                <div className="flex items-center gap-3">
                                                    <Diamond className="w-5 h-5 text-indigo-500" />
                                                    <span className="text-sm font-black uppercase tracking-widest text-slate-500">Immersive PDF Reader</span>
                                                </div>
                                                <XCircle className="w-6 h-6 text-slate-400 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setPreviewMode(false)} />
                                            </div>
                                            <div className="h-[600px] relative">
                                                <PdfViewer fileUrl={pdfUrl} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="pdf-empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3.5rem] p-16 text-center"
                            >
                                <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 mb-2">Dokumen Kosong</h3>
                                <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Portal tidak menampilkan hak cipta di halaman publik jika file tidak diunggah.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CopyrightEditor;
