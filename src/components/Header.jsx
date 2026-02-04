import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, BookOpen, Star, Box, Activity, Hash, Zap, Bookmark, Layout, Flag, Smile, Sun, Moon, Award, Hexagon, Layers, ArrowRight, X } from 'lucide-react';
import { contentService } from '../services/contentService';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const iconMap = {
  BookOpen, Star, Box, Activity, Hash, Zap, Bookmark, Layout, Flag, Smile, Award, Hexagon, Layers
};

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allContent, setAllContent] = useState([]);
  
  const [siteConfig, setSiteConfig] = useState(() => {
      const syncConf = contentService.getHomeConfigSync();
      return syncConf || { siteTitle: 'Bahasa Arab Praktis', siteLogoType: 'icon', siteLogoIcon: 'BookOpen', headerTitleSize: 'text-lg' };
  });

  useEffect(() => {
     const load = async () => {
         try {
             const content = await contentService.getAllContent();
             setAllContent(content);
             const conf = await contentService.getHomeConfig();
             if (conf) setSiteConfig(conf);
         } catch (e) {
             console.error("Failed to load header data", e);
         }
     };
     load();
  }, []);

  useEffect(() => {
     if (!searchQuery.trim()) {
         setSearchResults([]);
         return;
     }
     const query = searchQuery.toLowerCase();
     const results = allContent.filter(item => 
         item.title.toLowerCase().includes(query)
     ).slice(0, 6);
     setSearchResults(results);
  }, [searchQuery, allContent]);

  const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      navigate(`/materi?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
  };
  
  const handleResultClick = (path) => {
      navigate(path);
      setShowSearch(false);
      setSearchQuery('');
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-40 px-6 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center">
          <Link to="/" className="group flex items-center gap-3">
             <div className="flex flex-col">
                <span className={cn("font-arabic font-black leading-tight tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors", siteConfig.headerTitleSize || 'text-xl')}>
                    {siteConfig.siteTitle || 'Bahasa Arab Praktis'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                    Platform Pembelajaran Modern
                </span>
             </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Trigger (Desktop) */}
          <div className="hidden md:block relative">
             <button 
               onClick={() => setShowSearch(true)}
               className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10 transition-all min-w-[240px]"
             >
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">Cari materi...</span>
                <span className="ml-auto text-[10px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500 dark:text-slate-400">Ctrl K</span>
             </button>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95 shadow-sm"
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div key="moon" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}>
                  <Moon className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }}>
                  <Sun className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <Link 
            to="/materi" 
            className="group relative hidden sm:flex items-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 px-6 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
          >
            <span className="relative z-10">Mulai Belajar</span>
            <ArrowRight className="ml-2 w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-teal-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>
          
          <button onClick={() => setShowSearch(true)} className="md:hidden p-3 rounded-2xl text-slate-400 hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
             <Search className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Immersive Search Overlay */}
      <AnimatePresence>
        {showSearch && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl p-4 md:p-20"
            >
               <div className="max-w-3xl mx-auto w-full">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                           <Search className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-white">Pencarian Imersif</h2>
                           <p className="text-sm text-slate-400 font-medium">Temukan apa saja yang ingin Anda pelajari</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setShowSearch(false)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                     >
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="relative">
                     <input 
                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-2xl text-white outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all font-medium placeholder-slate-600"
                        placeholder="Ketik topik materi..."
                        autoFocus
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hidden md:block">
                        Enter
                     </div>
                  </form>

                  {/* Search Results */}
                  <div className="mt-8 grid gap-3 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                     {searchResults.length > 0 ? (
                        searchResults.map((result, idx) => {
                           const Icon = iconMap[result.icon] || BookOpen;
                           return (
                              <motion.button 
                                 key={idx}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: idx * 0.05 }}
                                 onClick={() => handleResultClick(result.path)}
                                 className="w-full text-left p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-teal-500/30 hover:bg-white/10 transition-all flex items-center group gap-5"
                              >
                                 <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                                    result.type === 'special' ? 'bg-amber-500/20 text-amber-500' : 'bg-teal-500/20 text-teal-500'
                                 )}>
                                    <Icon className="w-7 h-7" />
                                 </div>
                                 <div className="flex-1">
                                    <div className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{result.title}</div>
                                    <div className="text-sm text-slate-400 line-clamp-1 mt-0.5">{result.desc || "Akses materi pembelajaran ini sekarang."}</div>
                                    {result.sectionTitle && <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{result.sectionTitle}</div>}
                                 </div>
                                 <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                              </motion.button>
                           );
                        })
                     ) : searchQuery ? (
                        <div className="text-center py-20">
                           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search className="w-10 h-10 text-slate-600" />
                           </div>
                           <h3 className="text-xl font-bold text-slate-400">Tidak ada hasil ditemukan</h3>
                           <p className="text-slate-600">Coba gunakan kata kunci lain</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                           <div className="p-6 rounded-3xl bg-teal-500/5 border border-teal-500/10">
                              <Zap className="w-6 h-6 text-teal-400 mb-4" />
                              <h3 className="text-white font-bold mb-2">Pencarian Cepat</h3>
                              <p className="text-sm text-slate-400 leading-relaxed">Gunakan kata kunci singkat untuk menemukan topik secara instan di seluruh kurikulum.</p>
                           </div>
                           <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                              <Star className="w-6 h-6 text-amber-400 mb-4" />
                              <h3 className="text-white font-bold mb-2">Program Unggulan</h3>
                              <p className="text-sm text-slate-400 leading-relaxed">Anda bisa mencari berdasarkan nama program khusus seperti "Kitabah" atau "Nahwu".</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Header;
