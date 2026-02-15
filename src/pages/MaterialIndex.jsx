import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Telescope, Library, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone,
  CheckCircle2, Lock, ChevronRight, Search, Play, Trophy, Puzzle, Dices, Joystick, Swords, Crown,
  Ghost, Brain, Heart, Gem, Medal, Zap, Star, Gamepad as GamepadIcon, Crosshair, BookOpen, MoveRight,
  GraduationCap, Languages, Pencil, Globe, Compass, Sparkles, Music, School
} from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { useRealtimeCurriculum } from '../hooks/useRealtimeCurriculum';
import { useCallback } from 'react';

const iconMap = {
  Trophy: Trophy,
  Gamepad: GamepadIcon,
  Puzzle: Puzzle,
  Rocket: Rocket,
  Target: Crosshair,
  Zap: Zap,
  Award: Award,
  Star: Star,
  Dices: Dices,
  Joystick: Joystick,
  Swords: Swords,
  Shield: Milestone,
  Crown: Crown,
  Ghost: Ghost,
  Brain: Brain,
  Heart: Heart,
  Diamond: Gem,
  Medal: Medal,
  // Existing ones
  BookOpen: Library,
  Star_Old: Award,
  Box: Package,
  Activity: LineChart,
  Hash: Link2,
  Zap_Old: Rocket,
  Bookmark: Pocket,
  Layout: LayoutGrid,
  Flag: Milestone,
  Smile: Heart,
  PlayCircle: GamepadIcon,
  Play: GamepadIcon
};

const isArabic = (text) => /[\u0600-\u06FF]/.test(text || "");

const MaterialIndex = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
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
        } else {
          setSections(curr);
        }
      } catch (e) {
        console.error("Failed to load materi index", e);
      }
      setLoading(false);
    };
  loadData();
}, [searchQuery]);

// Handle realtime updates with a stable callback
const handleRealtimeUpdate = useCallback((type, payload) => {
  const reloadData = async () => {
    try {
      const curr = await contentService.getCurriculum();
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const filteredCurr = curr.map(section => ({
          ...section,
          topics: section.topics.filter(t => t.title.toLowerCase().includes(lowerQuery))
        })).filter(section => section.topics.length > 0);
        setSections(filteredCurr);
      } else {
        setSections(curr);
      }
    } catch (e) {
      console.error("Failed to reload materi index", e);
    }
  };
  reloadData();
}, [searchQuery]);

useRealtimeCurriculum(handleRealtimeUpdate);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-[var(--color-bg-main)]">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            <Library className="absolute inset-0 m-auto w-8 h-8 text-teal-500 animate-pulse" />
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse" style={{ fontFamily: 'var(--font-latin)' }}>
          Menyiapkan Kurikulum
        </p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
        <motion.div 
          key={(sections || []).map(s => s.id + '-' + (s.topics?.length || 0)).join('|')}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-12 max-w-7xl space-y-20 pb-32 relative z-10"
        >
          {/* Silent Background Icons - Now inside the relative container for better stacking */}
          <BackgroundIcons />
      {/* Search Results Empty State */}
      {searchQuery && sections.length === 0 && (
        <motion.div variants={itemVariants} className="p-20 text-center bg-slate-100 dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
          <Telescope className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-400" style={{ fontFamily: 'var(--font-latin)' }}>Tidak ada materi ditemukan</h3>
          <p className="text-slate-500 mt-2" style={{ fontFamily: 'var(--font-latin)' }}>Coba kata kunci lain atau telusuri kurikulum utama</p>
        </motion.div>
      )}

      {/* Curriculum Sections */}
      {sections.map((section, sIdx) => (
        <section key={section.id} className="space-y-10">
          {/* Category Header */}
          <div className="flex items-center gap-6 px-4 md:px-0">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-teal-500/30"></div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300",
                section.isLocked 
                    ? "bg-amber-500 shadow-amber-500/20 scale-105" 
                    : "bg-teal-500 shadow-teal-500/20"
              )}>
                {(() => {
                  if (section.isLocked) return <Lock className="w-6 h-6" />;
                  const IconComp = iconMap[section.icon] || Library;
                  return <IconComp className="w-6 h-6" />;
                })()}
              </div>
              <div>
                <h2 
                  className={cn(
                    "text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight",
                    isArabic(section.title) ? "arabic-text dir-rtl leading-relaxed py-2" : "font-sans"
                  )}
                  dir={isArabic(section.title) ? "rtl" : "ltr"}
                >
                  {section.title}
                </h2>
                {section.desc && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1" style={{ fontFamily: 'var(--font-latin)' }}>
                    {section.desc}
                  </p>
                )}
              </div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-teal-500/30"></div>
          </div>

          {/* Story Cards Grid */}
          {section.topics?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center py-12 px-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 mx-4 md:mx-0 bg-slate-50/50 dark:bg-slate-900/50"
            >
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-sm" style={{ fontFamily: 'var(--font-latin)' }}>Pelajaran belum tersedia di kategori ini.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
              {section.topics?.map((topic, idx) => (
                <StoryCard 
                  key={topic.id} 
                  topic={topic} 
                  index={idx}
                  isLocked={topic.isLocked || section.isLocked}
                />
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Global Empty State */}
      {sections.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 bg-white dark:bg-slate-800 rounded-[4rem] border border-dashed border-slate-300 dark:border-slate-700 mt-12 overflow-hidden relative group"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           <div className="relative z-10">
             <div className="w-24 h-24 bg-teal-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <BookOpen className="w-12 h-12 text-teal-500" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3" style={{ fontFamily: 'var(--font-latin)' }}>Belum ada Materi</h3>
             <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto" style={{ fontFamily: 'var(--font-latin)' }}>
               Instruktur sedang menyiapkan materi baru untukmu.
             </p>
           </div>
        </motion.div>
      )}
    </motion.div>
    </div>
  );
};

// Decorative Floating Icons for Background
const BackgroundIcons = () => {
    const icons = [
        { Icon: Library, size: 80, x: '5%', y: '10%', delay: 0 },
        { Icon: GraduationCap, size: 120, x: '85%', y: '15%', delay: 2 },
        { Icon: BookOpen, size: 70, x: '15%', y: '45%', delay: 1 },
        { Icon: Languages, size: 90, x: '75%', y: '40%', delay: 3 },
        { Icon: Pencil, size: 60, x: '10%', y: '80%', delay: 1.5 },
        { Icon: Brain, size: 100, x: '80%', y: '85%', delay: 2.5 },
        { Icon: Globe, size: 90, x: '40%', y: '5%', delay: 4 },
        { Icon: Compass, size: 80, x: '60%', y: '95%', delay: 0.5 },
        { Icon: Sparkles, size: 60, x: '90%', y: '60%', delay: 1.2 },
        { Icon: Music, size: 70, x: '5%', y: '60%', delay: 3.5 },
        { Icon: School, size: 110, x: '35%', y: '90%', delay: 2.2 },
        { Icon: Medal, size: 80, x: '95%', y: '35%', delay: 0.8 },
        { Icon: Zap, size: 60, x: '25%', y: '20%', delay: 5 },
        { Icon: Puzzle, size: 90, x: '55%', y: '25%', delay: 1.7 },
        { Icon: Trophy, size: 70, x: '45%', y: '70%', delay: 4.2 },
    ];

    return (
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden select-none z-[-1] opacity-50 dark:opacity-30">
            {icons.map(({ Icon, size, x, y, delay }, i) => (
                <motion.div
                    key={i}
                    className="absolute text-teal-600/20 dark:text-teal-400/10"
                    style={{ left: x, top: y }}
                    initial={{ y: 0, rotate: 0 }}
                    animate={{ 
                        y: [0, -40, 0],
                        rotate: [0, 20, -20, 0],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delay
                    }}
                >
                    <Icon size={size} strokeWidth={1.5} />
                </motion.div>
            ))}
        </div>
    );
};

// Story Card Component
const StoryCard = ({ topic, index, isLocked }) => {
  const hasArabic = isArabic(topic.title);
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: index * 0.05 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group h-full"
    >
      <div 
        className={cn(
          "relative block w-full h-[20rem] overflow-hidden rounded-[2.5rem] transition-all duration-500",
          "bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800",
          isLocked ? "grayscale opacity-80" : "shadow-lg hover:shadow-xl dark:shadow-slate-900/50"
        )}
      >
        {/* Layer 1: Background Image (Thumbnail) or Fallback Gradient */}
        <div className="absolute inset-0 z-0">
            {topic.thumbnail ? (
                <img 
                    src={topic.thumbnail} 
                    alt={topic.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:blur-sm"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
            )}
            
            {/* Dark Gradient Overlay for Text Readability - Updated for Title Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-900/30 opacity-60 transition-opacity duration-500 group-hover:opacity-80"/>
            
            {/* Top Gradient specifically for Title */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80" />
        </div>

        {/* Level 2: 3D Round Blob Frame (Original Layout, High Contrast) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {/* Blob 1 - Bottom Right Large - Teal/Emerald Gradient */}
            <div className={cn(
                "absolute -bottom-[34rem] -right-[24rem] w-[40rem] h-[40rem] rounded-full transition-all duration-700",
                "bg-gradient-to-br from-teal-400 to-emerald-600 shadow-2xl shadow-teal-900/50",
                "border-t border-white/20 backdrop-blur-sm",
                !isLocked && "group-hover:translate-x-4 group-hover:translate-y-4 group-hover:scale-105"
            )} />
            
            {/* Blob 2 - Bottom Right Small - Emerald/Cyan */}
            <div className={cn(
                "absolute -bottom-8 -right-8 w-24 h-24 rounded-full transition-all duration-700 delay-100",
                "bg-gradient-to-tl from-emerald-300 to-cyan-400 shadow-lg shadow-emerald-900/40",
                "border border-white/10 opacity-90",
                !isLocked && "group-hover:-translate-y-2 group-hover:scale-110"
            )} />
            
             {/* Blob 3 - Top Right - Teal Darker */}
            <div className={cn(
                "absolute -top-24 -right-24 w-56 h-56 rounded-full transition-all duration-700",
                "bg-gradient-to-bl from-teal-500 to-emerald-700 shadow-xl shadow-teal-900/40 opacity-90",
                "border-b border-white/10",
                 !isLocked && "group-hover:-translate-y-2 group-hover:translate-x-2"
            )} />
            
            {/* Blob 4 - Top Left - Cyan/Teal */}
            <div className={cn(
                "absolute -top-16 -left-16 w-40 h-40 rounded-full transition-all duration-700",
                "bg-gradient-to-tr from-cyan-500 to-teal-600 shadow-lg shadow-cyan-900/40 opacity-80",
                !isLocked && "group-hover:translate-x-2"
            )} />
        </div>

        {/* Content Container */}
        <div className="relative z-20 flex flex-col justify-between h-full px-6 pt-6 pb-2 pointer-events-none">
            <div className="flex flex-col gap-1 pointer-events-auto flex-grow">
                {/* Topic Title */}
                <h3 
                  className={cn(
                    "font-black tracking-tight text-white drop-shadow-lg filter",
                    hasArabic ? "text-3xl sm:text-4xl arabic-text dir-rtl leading-relaxed py-1" : "text-2xl sm:text-3xl font-sans leading-[1.1]"
                  )}
                  dir={hasArabic ? "rtl" : "ltr"}
                >
                  {topic.title}
                </h3>
                
                {/* Description - Dynamic Sizing & Full Visibility */}
                {(topic.desc || topic.description) && (
                  <p 
                    className={cn(
                        "font-medium text-slate-200 drop-shadow-sm opacity-90",
                        // Optimized Dynamic Font Sizing Logic - Even wider thresholds
                        (topic.desc || topic.description).length > 250 ? "text-xs leading-tight" :
                        (topic.desc || topic.description).length > 180 ? "text-sm leading-snug" :
                        "text-base leading-relaxed"
                    )}
                    style={{ fontFamily: 'var(--font-latin)' }}
                  >
                    {topic.desc || topic.description}
                  </p>
                )}
            </div>

            {/* Action Area */}
            <div className="pt-0 pointer-events-auto">
                {isLocked ? (
                  <button 
                      disabled
                      className={cn(
                      "w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3",
                      "bg-slate-800/50 text-slate-400 border border-slate-700/50 backdrop-blur-sm cursor-not-allowed"
                      )}
                  >
                      <Lock className="w-4 h-4" />
                      <span className="font-sans">Terkunci</span>
                  </button>
                ) : (
                  <Link 
                      to={`/materi/${topic.id}`}
                      className={cn(
                      "w-full py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-3",
                      "bg-teal-500/80 hover:bg-teal-500/90 backdrop-blur-md border border-white/20",
                      "text-white shadow-xl shadow-teal-900/30 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-95"
                      )}
                  >
                      <BookOpen className="w-4 h-4" />
                      <span className="font-arabic text-lg mt-0.5">اقرأ الدرس</span>
                      <MoveRight className="w-4 h-4" />
                  </Link>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MaterialIndex;
