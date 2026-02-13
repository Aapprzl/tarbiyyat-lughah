import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Plus, Trash2, FileText, Upload, X, Check, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';
import * as pdfjs from 'pdfjs-dist';

// Use a more reliable worker source compatible with Vite and pdfjs-dist v5
// This uses the local worker file from the package via Vite's URL import
import { supabase } from '../../supabaseClient';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const LibraryManager = () => {
  const { success, error, warning } = useToast();
  const confirm = useConfirm();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newCategory, setNewCategory] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    titleAr: '',
    titleId: '',
    category: '',
    pdfFile: null
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const channelId = `library-changes-${Date.now()}`;
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'site_config'
        },
        (payload) => {
          const key = payload.new?.config_key || payload.old?.config_key;
          if (!['library_books', 'library'].includes(key)) return;

          if (!payload.new) return;

          let newVal = payload.new.config_value;
          if (typeof newVal === 'string') {
            try { newVal = JSON.parse(newVal); } catch (e) { /* ignore */ }
          }

          if (key === 'library_books') {
            const booksArr = Array.isArray(newVal) ? newVal : [];
            setBooks([...booksArr]); 
          } else if (key === 'library') {
            const newCategories = newVal?.categories || (Array.isArray(newVal) ? newVal : []); 
            setCategories([...newCategories]);
            
            setFormData(prev => {
              if (!prev.category || !newCategories.includes(prev.category)) {
                return { ...prev, category: newCategories[0] || '' };
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    try {
      const [booksData, config] = await Promise.all([
        contentService.getBooks(),
        contentService.getLibraryConfig()
      ]);
      setBooks(booksData);
      setCategories(config.categories || []);
      if (config.categories?.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: config.categories[0] }));
      }
    } catch (err) {
      error('Gagal memuat data perpustakaan');
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedarray = new Uint8Array(reader.result);
          const loadingTask = pdfjs.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.8);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, pdfFile: file });
    } else {
      warning('Mohon pilih file PDF yang valid');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titleAr || !formData.titleId || !formData.pdfFile) {
      warning('Mohon lengkapi semua data');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // 1. Generate Thumbnail
      setProgress(20);
      const thumbnailBlob = await generateThumbnail(formData.pdfFile);
      
      // 2. Upload PDF
      setProgress(40);
      const pdfUrl = await storageService.uploadFile(formData.pdfFile, 'materials/library', (p) => {
        setProgress(40 + (p * 0.4));
      });

      // 3. Upload Thumbnail
      setProgress(85);
      const thumbFile = new File([thumbnailBlob], `${formData.pdfFile.name}_thumb.jpg`, { type: 'image/jpeg' });
      const coverUrl = await storageService.uploadFile(thumbFile, 'materials/covers');

      // 4. Save
      setProgress(95);
      const bookData = {
        titleAr: formData.titleAr,
        titleId: formData.titleId,
        category: formData.category,
        pdfUrl,
        coverUrl,
        createdAt: new Date().toISOString()
      };

      const result = await contentService.addBook(bookData);
      setBooks(prev => [result, ...prev]); // Optimistic Update

      success('Buku berhasil ditambahkan!');
      setIsAdding(false);
      setFormData({ 
        titleAr: '', 
        titleId: '', 
        category: categories[0] || '', 
        pdfFile: null 
      });
    } catch (err) {
      console.error(err);
      error('Gagal mengunggah buku');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (book) => {
    const confirmed = await confirm(`Apakah Anda yakin ingin menghapus "${book.titleId}"?`, 'Hapus Buku');

    if (confirmed) {
      try {
        // Optimistic Update
        setBooks(prev => prev.filter(b => b.id !== book.id));
        
        await contentService.deleteBook(book.id);
        success('Buku berhasil dihapus');
      } catch (err) {
        error('Gagal menghapus buku');
        loadData(); // Rollback on error
      }
    }
  };


  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      warning('Kategori sudah ada');
      return;
    }

    const updatedCategories = [...categories, newCategory.trim()];
    try {
      await contentService.saveLibraryConfig({ categories: updatedCategories });
      setCategories(updatedCategories); // Optimistic update
      setNewCategory('');
      success('Kategori berhasil ditambahkan');
    } catch (err) {
      error('Gagal menambahkan kategori');
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    const hasBooks = books.some(b => b.category === catToDelete);
    if (hasBooks) {
      warning('Tidak bisa menghapus kategori yang masih memiliki buku');
      return;
    }

    const confirmed = await confirm(`Apakah Anda yakin ingin menghapus kategori "${catToDelete}"?`, 'Hapus Kategori');

    if (confirmed) {
      const updatedCategories = categories.filter(c => c !== catToDelete);
      try {
        await contentService.saveLibraryConfig({ categories: updatedCategories });
        setCategories(updatedCategories); // Optimistic update
        success('Kategori berhasil dihapus');
      } catch (err) {
        error('Gagal menghapus kategori');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Perpustakaan Digital</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola buku PDF dan kategori</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            isAdding 
              ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" 
              : "bg-teal-600 text-white hover:bg-teal-700"
          )}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Batal' : 'Tambah Buku'}
        </button>
      </div>

      {/* Category Management - Full Width */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Kategori</h2>

        <div className="space-y-4">
          <div className="relative max-w-md">
            <input 
              type="text"
              placeholder="Nama kategori..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 pr-20 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-colors"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
            <button 
              onClick={handleAddCategory}
              className="absolute right-2 top-2 bottom-2 px-3 bg-teal-500 text-white rounded-md text-xs font-medium hover:bg-teal-600 transition-colors"
            >
              Simpan
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {categories.map(cat => (
                <motion.div 
                  key={cat}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="group flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-500/30 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-md transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {categories.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full text-center py-8"
              >
                <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Belum ada kategori</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Section: Form & Book List */}
      <div className="space-y-12">
          {/* Add Book Form (Toggled) */}
          <AnimatePresence>
            {isAdding && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-teal-500/20 relative">
                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Judul Arab</label>
                      <input 
                        type="text"
                        dir="rtl"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xl font-semibold text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 arabic-title"
                        placeholder="...كتاب"
                        value={formData.titleAr}
                        onChange={e => setFormData({ ...formData, titleAr: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Judul Indonesia</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-lg font-semibold text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-colors"
                        placeholder="Masukkan judul buku..."
                        value={formData.titleId}
                        onChange={e => setFormData({ ...formData, titleId: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Pilih Kategori</label>
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={cn(
                              "px-4 py-2 rounded-lg text-xs font-medium border transition-colors",
                              formData.category === cat 
                                ? "bg-teal-500 border-teal-500 text-white" 
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500/50"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-lg border border-red-200 dark:border-red-500/20 text-center">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">Mohon buat kategori di panel samping terlebih dahulu.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Dokumen PDF</label>
                      <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
                      <label 
                        htmlFor="pdf-upload"
                        className={cn(
                          "w-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed rounded-[1.5rem] px-6 py-5 flex items-center gap-5 cursor-pointer transition-all shadow-inner",
                          formData.pdfFile ? "border-teal-500/50 bg-teal-500/5" : "border-slate-200 dark:border-slate-700 hover:border-teal-500/50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          formData.pdfFile ? "bg-teal-500 text-white rotate-6" : "bg-slate-200 dark:bg-white/10 text-slate-400"
                        )}>
                          {formData.pdfFile ? <Check className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-slate-700 dark:text-slate-300 truncate">
                            {formData.pdfFile ? formData.pdfFile.name : 'Pilih File PDF'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Max 20MB • PDF Format Only</div>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <button 
                        disabled={uploading}
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            UPLOADING {Math.round(progress)}%
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            PUBLIKASIKAN BUKU
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {uploading && (
                    <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </form>
              </div>
            )}
          </AnimatePresence>

          {/* Book Grid */}
          <div className="grid sm:grid-cols-2 gap-6 relative">
            <AnimatePresence mode="popLayout">
              {books.map((book) => (
                <motion.div 
                  key={book.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      <img src={book.coverUrl} alt={book.titleId} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-medium rounded-md">
                          {book.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight mb-1 truncate arabic-title transition-all" dir="rtl">{book.titleAr}</h3>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2">{book.titleId}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <a 
                      href={book.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-teal-500 hover:text-white text-slate-600 dark:text-slate-400 font-medium text-xs rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" /> Buka PDF
                    </a>
                    <button 
                      onClick={() => handleDelete(book)}
                      className="p-2 flex items-center justify-center bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {books.length === 0 && !loading && (
            <div className="py-16 text-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Perpustakaan Kosong</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 text-sm">Klik tombol "Tambah Buku" untuk memulai koleksi Anda.</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default LibraryManager;

