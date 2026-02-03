import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Box, Activity, Hash, ArrowRight, Star, ChevronDown, Zap, Bookmark, Layout, Flag, Smile, Search, Sparkles } from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const iconMap = {
  BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile
};

const MaterialIndex = () => {
  const [sections, setSections] = useState([]);
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            const curr = await contentService.getCurriculum();
            const special = await contentService.getSpecialPrograms();
            
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase();
                const filteredCurr = curr.map(section => ({
                    ...section,
                    topics: section.topics.filter(t => t.title.toLowerCase().includes(lowerQuery))
                })).filter(section => section.topics.length > 0);
                
                const filteredSpecial = special.map(cat => ({
                    ...cat,
                    topics: cat.topics ? cat.topics.filter(t => t.title.toLowerCase().includes(lowerQuery)) : []
                })).filter(cat => cat.topics.length > 0);

                setSections(filteredCurr);
                setSpecialPrograms(filteredSpecial);

                const expanded = {};
                filteredCurr.forEach(s => expanded[s.id] = true);
                filteredSpecial.forEach(s => expanded[s.id] = true);
                setExpandedSections(expanded);
            } else {
                setSections(curr);
                setSpecialPrograms(special);
                const expanded = {};
                curr.forEach(s => expanded[s.id] = true);
                special.forEach(s => expanded[s.id] = true);
                setExpandedSections(expanded);
            }
        } catch (e) {
            console.error("Failed to load materi index", e);
        }
        setLoading(false);
    };
    loadData();
  }, [searchQuery]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
              <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full"
              />
              <p className="text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">Menyiapkan Kurikulum...</p>
          </div>
      );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-12 max-w-5xl space-y-16 pb-32"
    >
      {/* Page Header */}
      {/* Page Header - Theme Adaptive */}
      <div className="relative p-8 md:p-16 rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl transition-colors duration-500">
         <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-indigo-50/50 dark:from-teal-500/20 dark:to-indigo-500/20 opacity-100 dark:opacity-50 transition-opacity"></div>
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/20 rounded-full blur-[100px] transition-colors"></div>
         <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/20 rounded-full blur-[100px] transition-colors"></div>
         
         <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-colors">
                <Sparkles className="w-3 h-3" />
                Explorasi Kurikulum
            </motion.div>
            
            {searchQuery ? (
                <>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 transition-colors">Hasil Pencarian</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed transition-colors">
                    Menampilkan hasil untuk <span className="text-teal-600 dark:text-teal-400 font-bold">"{searchQuery}"</span>
                  </p>
                </>
            ) : (
                <>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 arabic-title leading-tight transition-colors">Materi Pembelajaran</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed transition-colors">
                    Mulailah perjalanan bahasa Arab Anda melalui kurikulum terstruktur yang dirancang untuk kenyamanan belajar tingkat lanjut.
                  </p>
                </>
            )}
         </div>
      </div>

      {searchQuery && sections.length === 0 && specialPrograms.length === 0 && (
          <motion.div variants={itemVariants} className="p-20 text-center bg-slate-100 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
              <Search className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-400">Tidak ada materi ditemukan</h3>
              <p className="text-slate-500 mt-2">Coba kata kunci lain atau telusuri kurikulum utama</p>
          </motion.div>
      )}

      {/* Special Programs Section */}
      {specialPrograms.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-4 md:px-0">
             <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/30"></div>
             <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">
               <Star className="w-4 h-4" />
               Program Khusus
             </h2>
             <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/30"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 px-4 md:px-0">
            {specialPrograms.map((category) => {
              const Icon = iconMap[category.icon] || Star;
              const isExpanded = expandedSections[category.id];

              return (
                <motion.div 
                  key={category.id} 
                  variants={itemVariants}
                  className="group bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 transition-all border-b-4 border-b-amber-500/50"
                >
                  <button 
                    onClick={() => toggleSection(category.id)}
                    className="w-full flex items-center justify-between p-8 text-left transition-colors hover:bg-amber-500/5"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{category.title}</h3>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-widest uppercase">{category.topics?.length || 0} Topik Tersedia</p>
                      </div>
                    </div>
                    <div className={cn("p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-amber-500 transition-all", isExpanded && "rotate-180")}>
                        <ChevronDown className="w-6 h-6" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 space-y-3"
                      >
                        {category.topics?.length === 0 ? (
                          <p className="text-slate-400 text-sm italic py-8 text-center bg-slate-50 dark:bg-black/20 rounded-2xl">Belum ada topik materi.</p>
                        ) : (
                          category.topics?.map(topic => (
                            <Link 
                              key={topic.id}
                              to={`/program/${topic.id}`}
                              className="group/item flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 hover:border-amber-500/30 hover:bg-white dark:hover:bg-white/5 transition-all"
                            >
                              <div className="flex-1">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors arabic-index-topic">
                                    {topic.title}
                                  </div>
                                  {topic.desc && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">{topic.desc}</p>
                                  )}
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                                <ArrowRight className="w-4 h-4 text-amber-500" />
                              </div>
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Curriculum Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-4 md:px-0">
           <div className="h-px flex-1 bg-gradient-to-r from-transparent to-teal-500/30"></div>
           <h2 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em] flex items-center gap-3">
             <BookOpen className="w-4 h-4" />
             Kurikulum Utama
           </h2>
           <div className="h-px flex-1 bg-gradient-to-l from-transparent to-teal-500/30"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 px-4 md:px-0">
          {sections.map((section) => {
            const Icon = iconMap[section.icon] || BookOpen;
            const isExpanded = expandedSections[section.id];
            
            return (
              <motion.div 
                key={section.id} 
                variants={itemVariants}
                className="group bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 transition-all border-b-4 border-b-teal-500/50"
              >
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-8 text-left transition-colors hover:bg-teal-500/5"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{section.title}</h3>
                      <p className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-widest uppercase">{section.topics?.length || 0} Materi Pelajaran</p>
                    </div>
                  </div>
                  <div className={cn("p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-teal-500 transition-all", isExpanded && "rotate-180")}>
                      <ChevronDown className="w-6 h-6" />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8 space-y-3"
                    >
                      {section.topics?.length === 0 ? (
                        <p className="text-slate-400 text-sm italic py-8 text-center bg-slate-50 dark:bg-black/20 rounded-2xl">Belum ada materi pelajaran.</p>
                      ) : (
                        section.topics?.map(topic => (
                          <Link 
                            key={topic.id}
                            to={`/materi/${topic.id}`}
                            className="group/item flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 hover:border-teal-500/30 hover:bg-white dark:hover:bg-white/5 transition-all"
                          >
                            <div className="flex-1">
                                <div className="font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-teal-600 dark:group-hover/item:text-teal-400 transition-colors arabic-index-topic">
                                  {topic.title}
                                </div>
                                {topic.desc && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">{topic.desc}</p>
                                )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                              <ArrowRight className="w-4 h-4 text-teal-500" />
                            </div>
                          </Link>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
};

export default MaterialIndex;
