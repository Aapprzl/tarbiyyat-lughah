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

const colorStyles = {
    emerald: {
        ring: 'ring-emerald-500/10',
        border: 'border-emerald-400/50 dark:border-emerald-500/50',
        borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
        bg: 'bg-emerald-500',
        bgSubtle: 'bg-emerald-500/10',
        bgBadge: 'bg-emerald-500/10',
        bgTopic: 'bg-emerald-100',
        text: 'text-emerald-500',
        textDark: 'text-emerald-600',
        textMuted: 'dark:text-emerald-400',
        textHover: 'group-hover/item:text-emerald-800',
        shadow: 'shadow-emerald-500/10',
        shadowTopic: 'group-hover/item:shadow-emerald-500/20',
        shadowTopicArrow: 'group-hover/item:shadow-emerald-500/10',
        from: 'from-emerald-500/10',
        to: 'to-emerald-600/10'
    },
    sky: {
        ring: 'ring-sky-500/10',
        border: 'border-sky-400/50 dark:border-sky-500/50',
        borderHover: 'hover:border-sky-400 dark:hover:border-sky-500',
        bg: 'bg-sky-500',
        bgSubtle: 'bg-sky-500/10',
        bgBadge: 'bg-sky-500/10',
        bgTopic: 'bg-sky-100',
        text: 'text-sky-500',
        textDark: 'text-sky-600',
        textMuted: 'dark:text-sky-400',
        textHover: 'group-hover/item:text-sky-800',
        shadow: 'shadow-sky-500/10',
        shadowTopic: 'group-hover/item:shadow-sky-500/20',
        shadowTopicArrow: 'group-hover/item:shadow-sky-500/10',
        from: 'from-sky-500/10',
        to: 'to-sky-600/10'
    },
    teal: {
        ring: 'ring-teal-500/10',
        border: 'border-teal-400/50 dark:border-teal-500/50',
        borderHover: 'hover:border-teal-400 dark:hover:border-teal-500',
        bg: 'bg-teal-500',
        bgSubtle: 'bg-teal-500/10',
        bgBadge: 'bg-teal-500/10',
        bgTopic: 'bg-teal-100',
        text: 'text-teal-500',
        textDark: 'text-teal-600',
        textMuted: 'dark:text-teal-400',
        textHover: 'group-hover/item:text-teal-800',
        shadow: 'shadow-teal-500/10',
        shadowTopic: 'group-hover/item:shadow-teal-500/20',
        shadowTopicArrow: 'group-hover/item:shadow-teal-500/10',
        from: 'from-teal-500/10',
        to: 'to-teal-600/10'
    },
    cyan: {
        ring: 'ring-cyan-500/10',
        border: 'border-cyan-400/50 dark:border-cyan-500/50',
        borderHover: 'hover:border-cyan-400 dark:hover:border-cyan-500',
        bg: 'bg-cyan-500',
        bgSubtle: 'bg-cyan-500/10',
        bgBadge: 'bg-cyan-500/10',
        bgTopic: 'bg-cyan-100',
        text: 'text-cyan-500',
        textDark: 'text-cyan-600',
        textMuted: 'dark:text-cyan-400',
        textHover: 'group-hover/item:text-cyan-800',
        shadow: 'shadow-cyan-500/10',
        shadowTopic: 'group-hover/item:shadow-cyan-500/20',
        shadowTopicArrow: 'group-hover/item:shadow-cyan-500/10',
        from: 'from-cyan-500/10',
        to: 'to-cyan-600/10'
    },
    indigo: {
        ring: 'ring-indigo-500/10',
        border: 'border-indigo-400/50 dark:border-indigo-500/50',
        borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
        bg: 'bg-indigo-500',
        bgSubtle: 'bg-indigo-500/10',
        bgBadge: 'bg-indigo-500/10',
        bgTopic: 'bg-indigo-100',
        text: 'text-indigo-500',
        textDark: 'text-indigo-600',
        textMuted: 'dark:text-indigo-400',
        textHover: 'group-hover/item:text-indigo-800',
        shadow: 'shadow-indigo-500/10',
        shadowTopic: 'group-hover/item:shadow-indigo-500/20',
        shadowTopicArrow: 'group-hover/item:shadow-indigo-500/10',
        from: 'from-indigo-500/10',
        to: 'to-indigo-600/10'
    }
};

const MaterialIndex = () => {
    // ... initial states ...
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0 items-start">
          {sections.map((section, sIdx) => {
            const colors = ['emerald', 'sky', 'teal', 'cyan', 'indigo'];
            const colorName = colors[sIdx % colors.length];
            const s = colorStyles[colorName];
            const isExpanded = expandedSections[section.id];
            const Icon = iconMap[section.icon] || Library;

            return (
              <motion.div 
                key={section.id} 
                variants={itemVariants}
                className={cn(
                  "group relative rounded-[2rem] transition-all duration-300 transform-gpu",
                  isExpanded ? "shadow-2xl z-50" : "hover:shadow-2xl"
                )}
              >
                {/* Main Card Surface */}
                  <div className={cn(
                  "relative w-full overflow-hidden rounded-[1.8rem] transition-all duration-300 shadow-md flex flex-col min-h-[200px] md:min-h-[220px]",
                  section.isLocked 
                    ? "bg-slate-200 dark:bg-slate-900 grayscale opacity-60"
                    : cn(
                        "bg-slate-100 dark:bg-slate-800 active:translate-y-1 active:border-b-0 border border-slate-200/60 dark:border-slate-700",
                        isExpanded 
                          ? `ring-4 ${s.ring}` 
                          : `border-b-[6px] ${s.border} ${s.borderHover} hover:-translate-y-1`
                      )
                )}>
                  <div 
                    onClick={() => !section.isLocked && toggleSection(section)}
                    className={cn(
                        "w-full p-5 md:p-6 text-left relative overflow-hidden z-10 flex flex-col justify-between gap-4 md:gap-6 flex-1",
                        section.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                  >
                    {/* Content Area */}
                    <div className="relative z-20 flex flex-col space-y-3 min-h-full min-w-0">
                      <div className="flex flex-col items-start gap-2">
                         {/* Badge */}
                        <div className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-sm",
                          section.isLocked 
                            ? "bg-slate-300 dark:bg-white/5 text-slate-500" 
                            : `bg-white/80 dark:bg-black/20 ${s.textDark} ${s.textMuted}`
                        )}>
                            <Package className="w-2.5 h-2.5 md:w-3 md:h-3 inline-block mr-1.5 mt-[-1px]" />
                            {section.topics?.length || 0} Materi
                        </div>

                          <h3 className={cn(
                              "text-xl md:text-2xl font-black tracking-tighter transition-colors line-clamp-1",
                              section.isLocked ? "text-slate-500" : "text-slate-900 dark:text-white"
                          )}>
                            {section.title}
                          </h3>
                        </div>

                        {section.desc && (
                          <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 md:line-clamp-3 max-w-[75%]">
                            {section.desc}
                          </p>
                        )}

                        <div className="mt-auto pt-1 relative z-30">
                          <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               toggleSection(section);
                             }}
                             className={cn(
                               "px-4 py-1.5 md:px-5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                               section.isLocked
                                 ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                 : `${s.bg} text-white shadow-lg ${s.shadow} hover:scale-105 active:scale-95`
                           )}
                        >
                           {isExpanded ? "Tutup" : "Mulai Belajar"}
                           <ChevronDown className={cn("w-3 md:w-3.5 h-3 md:h-3.5 transition-transform duration-300", isExpanded && "rotate-180")} />
                        </button>
                      </div>
                    </div>

                    {/* Right side: Modern Decoration (Corner Anchored) */}
                    <div className="absolute -bottom-6 -right-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 z-0 pointer-events-none">
                       <div className={cn(
                          "w-24 h-24 md:w-36 md:h-36 rounded-full opacity-20 dark:opacity-30 group-hover:opacity-40 transition-opacity duration-500",
                          s.bg
                       )}></div>
                       <Icon className={cn(
                          "absolute inset-0 m-auto w-16 h-16 md:w-24 md:h-24 drop-shadow-md transition-all duration-500",
                          section.isLocked ? "text-slate-400 grayscale" : `${s.text} ${s.textMuted}`
                       )} />
                    </div>
                  </div>

                  {/* Decorative Watermark for Locked */}
                  {section.isLocked && (
                    <div className="absolute -right-4 -bottom-4 opacity-5 grayscale pointer-events-none rotate-12 z-0">
                      <ShieldCheck className="w-24 h-24 md:w-32 md:h-32" />
                    </div>
                  )}

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden bg-transparent z-[5]"
                      >
                        <div className="p-6 pt-0 space-y-4">
                          <div className={cn("h-1 w-full rounded-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent opacity-50 mb-6")}></div>
                          
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
                                      "group/item relative flex items-center justify-between p-4 md:p-5 rounded-2xl transition-all overflow-hidden",
                                      topic.isLocked 
                                        ? "bg-slate-200/50 dark:bg-white/[0.02] cursor-not-allowed grayscale" 
                                        : `bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 ${s.borderHover} hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]`
                                  )}
                                >
                                  {/* Hover Background Reveal (Minimalist version of Parent) */}
                                  {!topic.isLocked && (
                                    <div className={cn(
                                      "absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-gradient-to-r",
                                      s.from, 'to-transparent'
                                    )}></div>
                                  )}

                                  <div className="flex items-center gap-4 relative z-10">
                                      <div className={cn(
                                        "w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all",
                                        topic.isLocked 
                                          ? "bg-slate-300 text-slate-500" 
                                          : `${s.bgTopic} dark:bg-slate-500/10 ${s.textDark} ${s.textMuted} group-hover/item:bg-white dark:group-hover/item:${s.bg} ${s.textHover} dark:group-hover/item:text-white group-hover/item:shadow-lg ${s.shadowTopic}`
                                      )}>
                                        {topic.isLocked ? <ShieldCheck className="w-5 h-5" /> : <span className="text-xs font-black font-mono">{String(idx + 1).padStart(2, '0')}</span>}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                          <div className={cn(
                                              "font-black text-base md:text-lg transition-colors truncate",
                                              topic.isLocked ? "text-slate-400" : "text-slate-800 dark:text-slate-100"
                                          )}>
                                            {topic.title}
                                          </div>
                                          {topic.desc && (
                                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium italic opacity-70">{topic.desc}</p>
                                          )}
                                      </div>
                                  </div>

                                  <div className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center transition-all relative z-10",
                                    topic.isLocked ? "text-slate-300" : `${s.bgSubtle} dark:bg-slate-500/10 ${s.textDark} ${s.textMuted} group-hover/item:${s.bg} group-hover/item:text-white group-hover/item:rotate-[-45deg] group-hover/item:shadow-md ${s.shadowTopicArrow}`
                                  )}>
                                     {topic.isLocked ? <Lock className="w-4 h-4 invisible" /> : <MoveRight className="w-4 h-4" />}
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
