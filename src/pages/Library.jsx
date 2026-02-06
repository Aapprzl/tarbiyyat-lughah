import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Library as LibraryIcon, BookOpen, Search, Filter, ChevronRight, FileText, LayoutGrid, List, Sparkles, Loader2 } from 'lucide-react';
import { contentService } from '../services/contentService';
import { cn } from '../utils/cn';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(['Semua']);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('shelf'); // 'shelf' or 'list'

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
      setCategories(['Semua', ...(config.categories || [])]);
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = activeCategory === 'Semua' || book.category === activeCategory;
    const matchesSearch = book.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.titleId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <LibraryIcon className="absolute inset-0 m-auto w-8 h-8 text-teal-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-6 overflow-hidden">
      {/* Hero Header Removed as per user request */}


      {/* Control Bar */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col lg:flex-row items-center gap-6">
        {/* Search */}
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text"
            placeholder="Cari judul buku..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex-1 w-full overflow-x-auto pb-2 flex items-center gap-3 custom-scrollbar no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-4 rounded-2xl whitespace-nowrap font-black uppercase tracking-widest text-[10px] transition-all",
                activeCategory === cat 
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
                  : "bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white border border-slate-200 dark:border-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setViewMode('shelf')}
            className={cn("p-2 rounded-xl transition-all", viewMode === 'shelf' ? "bg-white dark:bg-slate-800 shadow-sm text-teal-500" : "text-slate-400")}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-800 shadow-sm text-teal-500" : "text-slate-400")}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Bookshelf */}
      <div className="max-w-7xl mx-auto">
        {filteredBooks.length > 0 ? (
          <div className={cn(
            "grid gap-12",
            viewMode === 'shelf' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
          )}>
            {filteredBooks.map((book, idx) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "group relative",
                  viewMode === 'shelf' ? "flex flex-col items-center" : "flex items-center bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700"
                )}
              >
                {/* Book Representation */}
                <div className={cn(
                  "relative transition-all duration-500 perspective-1000",
                  viewMode === 'shelf' ? "w-full aspect-[3/4] mb-6 group-hover:scale-105 group-hover:-translate-y-2" : "w-32 aspect-[3/4] flex-shrink-0 mr-8"
                )}>
                  {/* Book Spine Shadow / 3D Effect */}
                  <div className="absolute inset-0 bg-slate-900 rounded-lg translate-y-2 translate-x-2 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  
                  {/* Cover */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-slate-800 shadow-2xl preserve-3d group-hover:rotate-y-[-20deg] transition-transform duration-700">
                    <img src={book.coverUrl} alt={book.titleId} className="w-full h-full object-cover" />
                    {/* Glass Overlay on Cover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Book Side (The Page Stack Thickness) */}
                  <div className="absolute top-0 right-0 h-full w-2 bg-slate-50 dark:bg-slate-700 origin-right rotate-y-[-90deg]"></div>
                </div>

                {/* Content */}
                <div className={cn(
                  "text-center w-full",
                  viewMode === 'list' && "text-left flex-1"
                )}>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                      {book.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-arabic text-slate-900 dark:text-white mb-1 leading-tight line-clamp-1" dir="rtl">{book.titleAr}</h3>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 truncate">{book.titleId}</h4>
                  
                  <a 
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-teal-500 dark:hover:bg-teal-500 hover:text-white transition-all shadow-xl shadow-slate-900/10 active:scale-95 group/btn"
                  >
                    <BookOpen className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                    Buka Buku <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <BookOpen className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Buku tidak ditemukan</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">Kami tidak dapat menemukan buku dengan kata kunci tersebut. Coba cari dengan istilah lain.</p>
          </div>
        )}
      </div>

      {/* Modern Bookshelf "Shelf" visual - purely decorative for shelf mode */}
      {viewMode === 'shelf' && filteredBooks.length > 0 && (
         <div className="max-w-7xl mx-auto mt-20 h-4 bg-gradient-to-b from-slate-200/50 to-slate-300/50 dark:from-white/5 dark:to-white/[0.02] rounded-full blur-sm"></div>
      )}
    </div>
  );
};

export default Library;
