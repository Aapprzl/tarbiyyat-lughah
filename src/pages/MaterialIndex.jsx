import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Library, Package, LineChart, Link2, MoveRight, Award, ChevronDown, Rocket, Pocket, LayoutGrid, Milestone, Heart, Telescope, Diamond, ShieldCheck, Gamepad as GamepadIcon, Lock } from 'lucide-react';
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
  PlayCircle: GamepadIcon,
  Play: GamepadIcon
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
          <motion.div variants={itemVariants} className="p-20 text-center bg-slate-100 dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
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
             Materi Utama
           </h2>
           <div className="h-px flex-1 bg-gradient-to-l from-transparent to-teal-500/30"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0">
          {sections.map((section) => {
            const Icon = iconMap[section.icon] || Library;
            const isExpanded = expandedSections[section.id];
            
            return (
              <motion.div 
                key={section.id} 
                variants={itemVariants}
                className={cn(
                  "group relative rounded-[3rem] transition-all duration-300 transform-gpu",
                  isExpanded ? "shadow-xl" : "hover:scale-[1.02] hover:shadow-2xl"
                )}
              >
                {/* Main Card Surface */}
                <div className={cn(
                  "relative w-full overflow-hidden border-2 rounded-[3.1rem] transition-all",
                  section.isLocked 
                    ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    : cn(
                        "bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b-8 active:border-b-0 active:translate-y-2",
                        isExpanded ? "border-teal-500/20" : "border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500"
                      )
                )}>
                  <button 
                    onClick={() => toggleSection(section)}
                    className={cn(
                        "w-full p-8 text-left transition-all relative z-10",
                        section.isLocked ? "cursor-not-allowed" : ""
                    )}
                  >
                    {/* Top Section with Icon and Arrow */}
                    <div className="flex items-start justify-between mb-8">
                      {/* Icon Container (Top Left) */}
                      <div className={cn(
                          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all transform group-hover:rotate-6",
                          section.isLocked 
                            ? "bg-slate-200 dark:bg-white/5 text-slate-400 grayscale" 
                            : "bg-teal-500 shadow-teal-500/20 text-white"
                      )}>
                        {section.isLocked ? <ShieldCheck className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                      </div>

                      {/* Expand Arrow */}
                      {!section.isLocked && (
                        <div className={cn(
                          "p-4 rounded-3xl transition-all bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-teal-500",
                          isExpanded && "rotate-180 bg-teal-500/10 text-teal-600"
                        )}>
                          <ChevronDown className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Text Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <h3 className={cn(
                           "text-2xl md:text-3xl font-black tracking-tight",
                           section.isLocked ? "text-slate-400" : "text-slate-900 dark:text-white"
                         )}>
                             {section.title}
                         </h3>
                         {section.isLocked && (
                           <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-white/10 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                             <ShieldCheck className="w-3 h-3" /> Locked
                           </span>
                         )}
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-black uppercase tracking-widest">
                          <Package className="w-4 h-4" />
                          {section.topics?.length || 0} Materi Pelajaran
                      </div>
                    </div>

                    {/* Decorative Watermark for Locked */}
                    {section.isLocked && (
                      <div className="absolute -right-8 -bottom-8 opacity-5 grayscale pointer-events-none rotate-12">
                        <ShieldCheck className="w-48 h-48" />
                      </div>
                    )}
                  </button>

                  {/* Topics Section (Expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-black/20"
                      >
                        <div className="p-8 pt-0 space-y-4">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-8"></div>
                          
                          {section.topics?.length === 0 ? (
                            <div className="text-center py-10 px-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-slate-400 font-bold text-sm">Belum ada materi pelajaran.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {section.topics?.map((topic, idx) => (
                                <Link 
                                  key={topic.id}
                                  to={topic.isLocked ? '#' : `/materi/${topic.id}`}
                                  className={cn(
                                      "group/item flex items-center justify-between p-6 rounded-[2rem] transition-all",
                                      topic.isLocked 
                                        ? "bg-slate-100/50 dark:bg-white/[0.02] cursor-not-allowed grayscale" 
                                        : "bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1"
                                  )}
                                >
                                  <div className="flex items-center gap-5">
                                      <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        topic.isLocked 
                                          ? "bg-slate-200 text-slate-400" 
                                          : "bg-teal-50 dark:bg-teal-500/10 text-teal-600 group-hover/item:bg-teal-500 group-hover/item:text-white"
                                      )}>
                                        {topic.isLocked ? <ShieldCheck className="w-5 h-5" /> : <span className="text-sm font-black font-mono">{String(idx + 1).padStart(2, '0')}</span>}
                                      </div>
                                      <div>
                                          <div className={cn(
                                              "font-black text-lg transition-colors",
                                              topic.isLocked ? "text-slate-400" : "text-slate-800 dark:text-slate-100"
                                          )}>
                                            {topic.title}
                                          </div>
                                          {topic.desc && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">{topic.desc}</p>
                                          )}
                                      </div>
                                  </div>
                                  <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                    topic.isLocked ? "text-slate-300" : "bg-teal-500/5 text-teal-500 group-hover/item:bg-teal-500 group-hover/item:text-white group-hover/item:rotate-[-45deg]"
                                  )}>
                                     {topic.isLocked ? <Lock className="w-4 h-4 invisible" /> : <MoveRight className="w-5 h-5" />}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
};

export default MaterialIndex;
