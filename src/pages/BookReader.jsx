import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Library, Download, Share2, BookOpen } from 'lucide-react';
import PdfViewer from '../components/media/PdfViewer';
import { motion } from 'framer-motion';

const BookReader = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const url = searchParams.get('url');
    const titleAr = searchParams.get('titleAr') || 'Buku';
    const titleId = searchParams.get('titleId') || 'Pembaca Buku';

    if (!url) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-bg-main)]">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 text-red-500">
                    <Library className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Buku Tidak Ditemukan</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-xs">Tautan buku tidak valid atau telah kadaluarsa.</p>
                <button 
                    onClick={() => navigate('/perpustakaan')}
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                    Kembali ke Perpustakaan
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-main)]">
            {/* Minimalist Top Bar */}
            <div className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-2 md:px-8 py-2.5 md:py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/perpustakaan')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </button>
                        <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-800" />
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-black font-arabic text-slate-900 dark:text-white line-clamp-1 leading-tight" dir="rtl">
                                {titleAr}
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                {titleId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a 
                            href={url}
                            download
                            className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all text-slate-600 dark:text-slate-400 group"
                            title="Unduh Buku"
                        >
                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="pt-[2.6rem] md:pt-[4.5rem] pb-0 max-w-5xl mx-auto md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    <PdfViewer 
                        fileUrl={url} 
                        height="calc(100vh - 42px)" 
                        fileName={`${titleId}.pdf`} 
                        onBack={() => navigate('/perpustakaan')}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default BookReader;
