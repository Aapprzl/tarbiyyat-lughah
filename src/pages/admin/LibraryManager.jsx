import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Plus, Trash2, FileText, Upload, X, Check, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Toast';
import { cn } from '../../utils/cn';
import * as pdfjs from 'pdfjs-dist';

// Use a more reliable worker source compatible with Vite and pdfjs-dist v5
// This uses the local worker file from the package via Vite's URL import
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

      // 4. Save to Firestore
      setProgress(95);
      const bookData = {
        titleAr: formData.titleAr,
        titleId: formData.titleId,
        category: formData.category,
        pdfUrl,
        coverUrl,
        createdAt: new Date().toISOString()
      };

      await contentService.addBook(bookData);
      success('Buku berhasil ditambahkan!');
      setIsAdding(false);
      setFormData({ 
        titleAr: '', 
        titleId: '', 
        category: categories[0] || '', 
        pdfFile: null 
      });
      loadData();
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
        await contentService.deleteBook(book.id);
        success('Buku berhasil dihapus');
        loadData();
      } catch (err) {
        error('Gagal menghapus buku');
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
      setCategories(updatedCategories);
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
        setCategories(updatedCategories);
        success('Kategori berhasil dihapus');
      } catch (err) {
        error('Gagal menghapus kategori');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
            <BookOpen className="w-3 h-3" /> Management Suite
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
            Perpustakaan Digital
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Kelola buku PDF, sampul otomatis, dan segmentasi kategori.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 relative z-10",
            isAdding 
              ? "bg-slate-100 dark:bg-slate-800 text-slate-500" 
              : "bg-teal-500 text-white shadow-teal-500/20 hover:bg-teal-600"
          )}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Batal Tambah' : 'Tambah Buku Baru'}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Sidebar: Category Management (Always Visible) */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 lg:h-fit">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Kategori</h2>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Nama kategori..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
                <button 
                  onClick={handleAddCategory}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-teal-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/10"
                >
                  Simpan
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map(cat => (
                  <div key={cat} className="group flex items-center justify-between bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-teal-500/30 transition-all shadow-sm">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{cat}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Belum ada kategori</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Section: Form & Book List */}
        <div className="lg:col-span-8 space-y-12">
          {/* Add Book Form (Toggled) */}
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border-2 border-teal-500/10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>
                
                <form onSubmit={handleSubmit} className="relative z-10 grid gap-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Judul Arab
                      </label>
                      <input 
                        type="text"
                        dir="rtl"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] px-6 py-5 text-2xl font-black font-arabic text-slate-900 dark:text-white focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner"
                        placeholder="...كتاب"
                        value={formData.titleAr}
                        onChange={e => setFormData({ ...formData, titleAr: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Judul Indonesia
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] px-6 py-5 text-lg font-bold text-slate-900 dark:text-white focus:border-teal-500 outline-none transition-all shadow-inner"
                        placeholder="Masukkan judul buku..."
                        value={formData.titleId}
                        onChange={e => setFormData({ ...formData, titleId: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Redesigned Category Selector (Harmonious Buttons) */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Pilih Segmentasi Kategori</label>
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={cn(
                              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                              formData.category === cat 
                                ? "bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20" 
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/20 text-center">
                        <p className="text-xs font-bold text-red-500">Mohon buat kategori di panel samping terlebih dahulu.</p>
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Book Grid */}
          <div className="grid sm:grid-cols-2 gap-8">
            {books.map((book) => (
              <motion.div 
                layout
                key={book.id}
                className="group bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-28 h-40 rounded-[2rem] overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                    <img src={book.coverUrl} alt={book.titleId} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {book.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black font-arabic text-slate-900 dark:text-white leading-[1.2] mb-2 truncate" dir="rtl">{book.titleAr}</h3>
                    <h4 className="text-sm font-semibold text-slate-400 dark:text-slate-500 line-clamp-2">{book.titleId}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <a 
                    href={book.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-slate-800 hover:bg-teal-500 hover:text-white text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all group/btn shadow-inner"
                  >
                    <FileText className="w-4 h-4 group-hover/btn:scale-110" /> Buka PDF
                  </a>
                  <button 
                    onClick={() => handleDelete(book)}
                    className="p-4 flex items-center justify-center bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-inner"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {books.length === 0 && !loading && (
            <div className="py-24 text-center bg-slate-50 dark:bg-slate-900 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <BookOpen className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Perpustakaan Kosong</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-3 font-medium">Klik tombol "Tambah Buku Baru" untuk memulai koleksi Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryManager;

