import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Telescope, Library, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone,
  CheckCircle2, Lock, ChevronRight, Search, Play, Trophy, Puzzle, Dices, Joystick, Swords, Crown,
  Ghost, Brain, Heart, Gem, Medal, Zap, Star, Gamepad as GamepadIcon, Crosshair, BookOpen, MoveRight
} from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-12 max-w-7xl space-y-20 pb-32"
    >
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
            <div className="text-center py-12 px-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 mx-4 md:mx-0">
              <p className="text-slate-400 font-bold text-sm" style={{ fontFamily: 'var(--font-latin)' }}>Belum ada materi pelajaran.</p>
            </div>
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
    </motion.div>
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
      className="group"
    >
      <Link 
        to={isLocked ? '#' : `/materi/${topic.id}`}
        className={cn(
          "block relative rounded-[2rem] overflow-hidden transition-all duration-300 shadow-lg",
          isLocked 
            ? "cursor-not-allowed grayscale opacity-60" 
            : "hover:shadow-2xl hover:-translate-y-2 active:scale-[0.98]"
        )}
      >
        {/* Banner/Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600">
          {topic.thumbnail ? (
            <>
              <img 
                src={topic.thumbnail} 
                alt={topic.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay Gradient for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </>
          ) : (
            <>
              {/* Fallback Gradient Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-black rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
              </div>
              
              {/* Fallback Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-2xl">
                  <BookOpen className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </div>
            </>
          )}

          {/* Lock Indicator */}
          {isLocked && (
            <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Title Overlay on Banner */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-3 pt-10 bg-gradient-to-t from-black/60 to-transparent">
            <h3 
              className={cn(
                "text-xl md:text-2xl font-black text-white drop-shadow-lg",
                hasArabic ? "arabic-text dir-rtl leading-[1.4] py-1" : "font-sans leading-tight"
              )}
              dir={hasArabic ? "rtl" : "ltr"}
            >
              {topic.title}
            </h3>
          </div>
        </div>

        {/* Card Content Below Banner */}
        <div className="bg-white dark:bg-slate-800 p-6">
          {/* Description */}
          {topic.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 font-medium" style={{ fontFamily: 'var(--font-latin)' }}>
              {topic.description}
            </p>
          )}

          {/* Read Button */}
          <button 
            disabled={isLocked}
            className={cn(
              "w-full px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              isLocked
                ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-teal-500 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-600 hover:scale-105 active:scale-95"
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span className={cn(isLocked ? "font-sans" : "font-arabic text-lg mt-0.5")}>{isLocked ? "Terkunci" : "اقرأ القصة"}</span>
            {!isLocked && <MoveRight className="w-4 h-4" />}
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default MaterialIndex;
