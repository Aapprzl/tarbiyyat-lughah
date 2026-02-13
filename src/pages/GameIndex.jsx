import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Trophy, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Crosshair, CheckSquare, Sliders, Orbit, MoveRight, ShieldCheck, Diamond, Medal, Gamepad as GamepadIcon, Play, Puzzle, Youtube, Music, ClipboardList, Layers, GripVertical, HelpCircle, MoveLeft, Image as ImageIcon, Keyboard, Type, Table, FileText, RefreshCcw, BrainCircuit, Shuffle, StretchHorizontal, Vibrate, Headphones, CaseSensitive, BookOpen, ALargeSmall, Library,
    Search, Telescope, ChevronRight, Dices, Joystick, Swords, Crown, Ghost, Brain, Gem, Zap, Star, CloudRain, Mountain
} from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useRealtimeCurriculum } from '../hooks/useRealtimeCurriculum';

const iconMap = {
  Trophy: Trophy,
  Gamepad: GamepadIcon,
  Puzzle: Puzzle,
  Rocket: Rocket,
  Target: Crosshair, // Or Crosshair if added to imports
  Zap: Zap,
  Award: Award,
  Star: Star,
  Dices: Dices,
  Joystick: Joystick,
  Swords: Swords,
  Shield: ShieldCheck, // Assuming ShieldCheck is the intended icon for 'Shield'
  Crown: Crown,
  Ghost: Ghost,
  Brain: Brain,
  Heart: Heart,
  Diamond: Gem,
  Medal: Medal,
  // Fallbacks
  BookOpen: Library,
  Box: Package,
  Activity: LineChart,
  Hash: Link2,
  Bookmark: Pocket,
  Layout: LayoutGrid,
  Flag: Milestone,
  Smile: Heart,
  PlayCircle: GamepadIcon,
  Play: GamepadIcon,
  Settings: Sliders, 
  Globe: Orbit,
  Gamepad2: Trophy
};

const isArabic = (text) => {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

const getTypeInfo = (type) => {
    switch (type) {
        case 'matchup': return { label: 'Cocokkan', color: 'pink', icon: Shuffle, gradientItems: 'from-pink-500/10 to-rose-500/10' };
        case 'quiz': return { label: 'Kuis', color: 'emerald', icon: BrainCircuit, gradientItems: 'from-emerald-500/10 to-teal-500/10' };
        case 'anagram': return { label: 'Anagram', color: 'teal', icon: GripVertical, gradientItems: 'from-teal-500/10 to-emerald-500/10' }; // Keeping GripVertical as Tile metaphor
        case 'completesentence': return { label: 'Kilat Bahasa', color: 'indigo', icon: Zap, gradientItems: 'from-indigo-500/10 to-blue-500/10' };
        case 'unjumble': return { label: 'Susun', color: 'purple', icon: StretchHorizontal, gradientItems: 'from-purple-500/10 to-violet-500/10' };
        case 'spinwheel': return { label: 'Putar', color: 'indigo', icon: RefreshCcw, gradientItems: 'from-indigo-500/10 to-cyan-500/10' };
        case 'youtube': return { label: 'Video', color: 'red', icon: Youtube, gradientItems: 'from-red-500/10 to-rose-500/10' };
        case 'audio': return { label: 'Audio', color: 'violet', icon: Headphones, gradientItems: 'from-violet-500/10 to-fuchsia-500/10' };
        case 'pdf': return { label: 'Materi', color: 'cyan', icon: ClipboardList, gradientItems: 'from-cyan-500/10 to-teal-500/10' };
        case 'vocab': return { label: 'Kosakata', color: 'slate', icon: Table, gradientItems: 'from-slate-500/10 to-gray-500/10' }; 
        case 'text': return { label: 'Bacaan', color: 'teal', icon: BookOpen, gradientItems: 'from-teal-500/10 to-emerald-500/10' };
        case 'wordclassification': return { label: 'Pilahan', color: 'rose', icon: ALargeSmall, gradientItems: 'from-rose-500/10 to-pink-500/10' };
        case 'harakat': return { label: 'Harakat', color: 'teal', icon: Vibrate, gradientItems: 'from-teal-500/10 to-emerald-500/10' };
        case 'memory': return { label: 'Memori', color: 'violet', icon: LayoutGrid, gradientItems: 'from-violet-500/10 to-fuchsia-500/10' };
        case 'hangman': return { label: 'Algojo', color: 'rose', icon: Ghost, gradientItems: 'from-rose-500/10 to-slate-500/10' };
        case 'wordrain': return { label: 'Hujan Kata', color: 'sky', icon: CloudRain, gradientItems: 'from-sky-500/10 to-indigo-500/10' };
        case 'camelrace': return { label: 'Balap Unta', color: 'amber', icon: Mountain, gradientItems: 'from-amber-500/10 to-orange-500/10' };
        case 'worddetective': return { label: 'Detektif Kata', color: 'emerald', icon: Search, gradientItems: 'from-emerald-500/10 to-teal-500/10' };
        default: return { label: 'Lainnya', color: 'slate', icon: Layers, gradientItems: 'from-slate-500/10 to-gray-500/10' };
    }
};

// Fallback Icons

const GameIndex = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoriesRef = useRef([]);
  
  const loadData = useCallback(async (retryCount = 0) => {
    try {
      const gamesData = await contentService.getSpecialPrograms();
      
      const totalNewItems = (gamesData || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
      const prevItems = (categoriesRef.current || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

      // PROTECTION: If we had items before, but the database says 0 now, 
      // we DON'T update the state. We wait and try again.
      if (totalNewItems === 0 && prevItems > 0 && retryCount < 3) {
        setTimeout(() => loadData(retryCount + 1), 2000); 
        return;
      }
      
      categoriesRef.current = gamesData;
      setCategories(gamesData);
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle realtime updates
  useRealtimeCurriculum(useCallback((type, payload) => {
    // Refresh for any change in games or lock status
    loadData();
  }, [loadData]));

  // Handle Hash Scroll
  useEffect(() => {
    if (!loading && categories.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const id = hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  }, [loading, categories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--color-bg-main)]">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            <Trophy className="absolute inset-0 m-auto w-8 h-8 text-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  // Calculate visible categories (those that actually have content)
  const visibleCategories = categories.filter(cat => (cat.items?.length > 0) || (cat.topics?.length > 0));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div 
      className="container mx-auto px-6 py-12 max-w-7xl pb-40"
    >
        

        <div className="space-y-24">
        {visibleCategories.map((category) => {
            const IconComp = iconMap[category.icon] || Trophy;
            // Use items if available, or empty array
            const items = category.items || [];

            return (
              <section key={category.id} id={category.id} className="relative">
                  {/* Category Header */}
                  <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20 flex-shrink-0">
                          <IconComp className="w-8 h-8" />
                      </div>
                      <div>
                          <h2 
                            className={cn(
                                "text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2",
                                isArabic(category.title) ? "arabic-text dir-rtl leading-relaxed py-2" : "font-sans"
                            )}
                            dir={isArabic(category.title) ? "rtl" : "ltr"}
                          >
                              {category.title}
                          </h2>
                          {category.desc && (
                            <p 
                                className={cn(
                                    "text-slate-500 dark:text-slate-400 font-medium max-w-2xl",
                                    isArabic(category.desc) ? "arabic-text dir-rtl" : "font-sans"
                                )}
                                dir={isArabic(category.desc) ? "rtl" : "ltr"}
                            >
                                {category.desc}
                            </p>
                          )}
                      </div>
                  </div>

                  {/* Items Grid */}
                  <motion.div 
                    key={(items || []).map(i => i.id).join('-')}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  >
                      {items.map((item) => {
                          const typeInfo = getTypeInfo(item.type);
                          const TypeIcon = typeInfo.icon;
                          
                          return (
                              <motion.div key={item.id} variants={itemVariants}>
                              <Link 
                                  to={category.isLocked ? '#' : `/program/${category.id}?item=${item.id}`}
                                  className={cn(
                                      "group relative block h-40 md:h-48 rounded-[2rem] transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 border-b-4 active:border-b-0 active:translate-y-1 transform-gpu",
                                      // Border colors only on the parent
                                      category.isLocked 
                                        ? "border-slate-300 dark:border-slate-700 cursor-not-allowed grayscale opacity-60"
                                        : `border-slate-200 dark:border-slate-700 hover:border-${typeInfo.color}-400 dark:hover:border-${typeInfo.color}-500`
                                  )}
                              >
                                  {/* Inner Surface Wrapper - Handles Background & Clipping */}
                                  <div className={cn(
                                      "w-full h-full rounded-[1.8rem] overflow-hidden flex flex-col justify-between relative",
                                      category.isLocked ? "bg-slate-200 dark:bg-slate-800" : "bg-white dark:bg-slate-800"
                                  )}>
                                      {/* Background Decorations */}
                                      <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                                        typeInfo.gradientItems || `from-${typeInfo.color}-500/10 to-${typeInfo.color}-600/10`
                                      )}></div>

                                      {/* Main Content (Top Left) */}
                                      <div className="relative z-10 p-5 flex flex-col items-start gap-2">
                                          <div className={cn(
                                              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/80 dark:bg-black/20 backdrop-blur-sm",
                                              `text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400`
                                          )}>
                                              {typeInfo.label}
                                          </div>
                                          <h3 className={cn(
                                            "font-black text-lg md:text-xl leading-tight line-clamp-2 transition-all",
                                            "text-slate-800 dark:text-slate-100",
                                            isArabic(item.title) && "arabic-index-topic"
                                          )}>
                                              {item.title}
                                          </h3>
                                      </div>

                                      {/* Large Icon (Bottom Right) */}
                                      <div className="absolute -bottom-4 -right-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                          <div className={cn(
                                            "w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center opacity-20 dark:opacity-20 group-hover:opacity-100 transition-opacity",
                                            `bg-${typeInfo.color}-500 dark:bg-${typeInfo.color}-600`
                                          )}></div>
                                          <TypeIcon className={cn(
                                            "absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 drop-shadow-lg transition-colors duration-300",
                                            `text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400 group-hover:text-white`
                                          )} />
                                      </div>

                                      {/* Play Overlay (Touch Feedback) */}
                                      {!category.isLocked && (
                                        <div className="absolute inset-0 z-20 bg-black/0 group-active:bg-black/5 transition-colors" />
                                      )}
                                  </div>
                              </Link>
                              </motion.div>
                          );
                      })}

                      {/* Fallback for Empty Items */}
                      {items.length === 0 && (
                          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                              <p className="text-slate-400 font-bold text-sm">Belum ada konten di kategori ini.</p>
                              {contentService.isAuthenticated() && (
                                  <Link to={`/admin/edit/${category.id}`} className="inline-block mt-4 text-teal-500 font-bold text-xs uppercase tracking-widest hover:underline">
                                      + Tambah Konten
                                  </Link>
                              )}
                          </div>
                      )}
                   </motion.div>
              </section>
            );
        })}
        </div>

        {visibleCategories.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-white dark:bg-slate-800 rounded-[4rem] border border-dashed border-slate-300 dark:border-slate-700 mt-12"
            >
               <Trophy className="w-20 h-20 text-slate-200 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Belum ada Permainan</h3>
               <p className="text-slate-500 font-medium">Instruktur sedang menyiapkan tantangan baru untukmu.</p>
            </motion.div>
        )}
    </div>
  );
};

export default GameIndex;
