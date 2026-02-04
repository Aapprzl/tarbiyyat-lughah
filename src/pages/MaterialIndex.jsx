import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Library, Package, LineChart, Link2, MoveRight, Award, ChevronDown, Rocket, Pocket, LayoutGrid, Milestone, Heart, Telescope, Diamond, ShieldCheck } from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const iconMap = {
  BookOpen: Library, 
  Box: Package, 
  Activity: LineChart, 
  Hash: Link2, 
  Star: Award, 
  Zap: Rocket, 
  Bookmark: Pocket, 
  Layout: LayoutGrid, 
  Flag: Milestone, 
  Smile: Heart,
  PlayCircle: Gamepad,
  Play: Gamepad
};

const MaterialIndex = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            const curr = await contentService.getCurriculum();
            
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase();
                const filteredCurr = curr.map(section => ({
                    ...section,
                    topics: section.topics.filter(t => t.title.toLowerCase().includes(lowerQuery))
                })).filter(section => section.topics.length > 0);
                
                setSections(filteredCurr);

                const expanded = {};
                filteredCurr.forEach(s => expanded[s.id] = true);
                setExpandedSections(expanded);
            } else {
                setSections(curr);
                // Default: All closed for manual selection feel
                setExpandedSections({});
            }
        } catch (e) {
            console.error("Failed to load materi index", e);
        }
        setLoading(false);
    };
    loadData();
  }, [searchQuery]);

  const toggleSection = (category) => {
    if (category.isLocked) return;
    
    setExpandedSections(prev => {
        const isCurrentlyExpanded = !!prev[category.id];
        // Close everything, then only open requested if it was closed
        return isCurrentlyExpanded ? {} : { [category.id]: true };
    });
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


      {searchQuery && sections.length === 0 && (
          <motion.div variants={itemVariants} className="p-20 text-center bg-slate-100 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
              <Telescope className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-400">Tidak ada materi ditemukan</h3>
              <p className="text-slate-500 mt-2">Coba kata kunci lain atau telusuri kurikulum utama</p>
          </motion.div>
      )}



      {/* Curriculum Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-4 md:px-0">
           <div className="h-px flex-1 bg-gradient-to-r from-transparent to-teal-500/30"></div>
           <h2 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em] flex items-center gap-3">
             <Library className="w-4 h-4" />
             Kurikulum Utama
           </h2>
           <div className="h-px flex-1 bg-gradient-to-l from-transparent to-teal-500/30"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 px-4 md:px-0 items-start">
          {sections.map((section) => {
            const Icon = iconMap[section.icon] || Library;
            const isExpanded = expandedSections[section.id];
            
            return (
              <motion.div 
                key={section.id} 
                variants={itemVariants}
                className="group bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 transition-all border-b-4 border-b-teal-500/50"
              >
                <button 
                  onClick={() => toggleSection(section)}
                  className={cn(
                      "w-full flex items-center justify-between p-8 text-left transition-all relative overflow-hidden",
                      section.isLocked 
                        ? "bg-slate-100 dark:bg-slate-900/50 cursor-not-allowed" 
                        : "hover:bg-teal-500/5"
                  )}
                >
                  {/* Background Lock Icon Overlay */}
                  {section.isLocked && (
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rotate-12">
                      <ShieldCheck className="w-48 h-48" />
                    </div>
                  )}

                  <div className="flex items-center gap-5 relative z-10">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform",
                        section.isLocked ? "bg-slate-300 dark:bg-white/10 grayscale" : "bg-teal-500 shadow-teal-500/20 group-hover:scale-110"
                    )}>
                      {section.isLocked ? <ShieldCheck className="w-8 h-8 text-white" /> : <Icon className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <h3 className={cn("text-xl font-extrabold mb-1", section.isLocked ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white")}>
                          {section.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-widest uppercase">{section.topics?.length || 0} Materi Pelajaran</p>
                        {section.isLocked && <span className="text-[8px] font-black uppercase tracking-widest bg-teal-500/10 text-teal-600 px-2 py-0.5 rounded-full">Terkunci</span>}
                      </div>
                    </div>
                  </div>

                  {section.isLocked ? (
                    <div className="p-2 relative z-10">
                      <ShieldCheck className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                    </div>
                  ) : (
                    <div className={cn("p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 transition-all", isExpanded && "rotate-180")}>
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 space-y-3">
                      {section.topics?.length === 0 ? (
                        <p className="text-slate-400 text-sm italic py-8 text-center bg-slate-50 dark:bg-black/20 rounded-2xl">Belum ada materi pelajaran.</p>
                      ) : (
                        section.topics?.map(topic => (
                        <div 
                          key={topic.id}
                          className={cn(
                              "group/item flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-black/20 border transition-all",
                              topic.isLocked 
                                ? "border-slate-100 dark:border-white/5 cursor-not-allowed pointer-events-none" 
                                : "border-slate-100 dark:border-white/5 hover:border-teal-500/30 hover:bg-white dark:hover:bg-white/5"
                          )}
                        >
                          <div className="flex-1 flex items-center gap-4">
                              {topic.isLocked ? (
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                  <ShieldCheck className="w-4 h-4" />
                                </div>
                              ) : null}
                              <div>
                                  <div className={cn(
                                      "font-bold arabic-index-topic transition-colors",
                                      topic.isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-slate-200 group-hover/item:text-teal-600 dark:group-hover/item:text-teal-400"
                                  )}>
                                    {topic.title}
                                  </div>
                                  {topic.desc && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">{topic.desc}</p>
                                  )}
                                  {topic.isLocked && <p className="text-[8px] font-black text-teal-600 uppercase tracking-widest mt-1">Akses Terkunci</p>}
                              </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center transition-all">
                             {topic.isLocked ? (
                                 <ShieldCheck className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                             ) : (
                                 <Link to={`/materi/${topic.id}`} className="w-full h-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 translate-x-4 group-hover/item:translate-x-0 transition-all">
                                    <MoveRight className="w-4 h-4 text-teal-500" />
                                 </Link>
                             )}
                          </div>
                        </div>
                        ))
                      )}
                      </div>
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
