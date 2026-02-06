import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Crosshair, CheckSquare, Sliders, Orbit, MoveRight, ShieldCheck, Diamond, Medal, Gamepad, Play, Puzzle, Youtube, Music, ClipboardList, Layers, GripVertical, HelpCircle, MoveLeft, Image as ImageIcon, Keyboard, Type, Table, FileText, RefreshCcw, BrainCircuit, Shuffle, StretchHorizontal, Vibrate, Headphones, CaseSensitive, BookOpen, ALargeSmall } from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const iconMap = {
  BookOpen: Award,
  Box: Package, 
  Activity: LineChart, 
  Hash: Link2, 
  Star: Award, 
  Zap: Rocket, 
  Bookmark: Pocket, 
  Layout: LayoutGrid, 
  Flag: Milestone, 
  Smile: Heart, 
  Target: Crosshair, 
  ListChecks: CheckSquare, 
  Settings: Sliders, 
  Globe: Orbit, 
  PlayCircle: Gamepad, 
  Play: Gamepad, 
  Gamepad2: Trophy
};

const getTypeInfo = (type) => {
    switch (type) {
        case 'matchup': return { label: 'Cocokkan', color: 'pink', icon: Shuffle, gradientItems: 'from-pink-500/10 to-rose-500/10' };
        case 'quiz': return { label: 'Kuis', color: 'emerald', icon: BrainCircuit, gradientItems: 'from-emerald-500/10 to-teal-500/10' };
        case 'anagram': return { label: 'Anagram', color: 'orange', icon: GripVertical, gradientItems: 'from-orange-500/10 to-amber-500/10' }; // Keeping GripVertical as Tile metaphor
        case 'completesentence': return { label: 'Lengkapi', color: 'blue', icon: CaseSensitive, gradientItems: 'from-blue-500/10 to-indigo-500/10' };
        case 'unjumble': return { label: 'Susun', color: 'purple', icon: StretchHorizontal, gradientItems: 'from-purple-500/10 to-violet-500/10' };
        case 'spinwheel': return { label: 'Putar', color: 'indigo', icon: RefreshCcw, gradientItems: 'from-indigo-500/10 to-cyan-500/10' };
        case 'youtube': return { label: 'Video', color: 'red', icon: Youtube, gradientItems: 'from-red-500/10 to-rose-500/10' };
        case 'audio': return { label: 'Audio', color: 'violet', icon: Headphones, gradientItems: 'from-violet-500/10 to-fuchsia-500/10' };
        case 'pdf': return { label: 'Materi', color: 'cyan', icon: ClipboardList, gradientItems: 'from-cyan-500/10 to-teal-500/10' };
        case 'vocab': return { label: 'Kosakata', color: 'slate', icon: Table, gradientItems: 'from-slate-500/10 to-gray-500/10' }; 
        case 'text': return { label: 'Bacaan', color: 'teal', icon: BookOpen, gradientItems: 'from-teal-500/10 to-emerald-500/10' };
        case 'wordclassification': return { label: 'Pilahan', color: 'rose', icon: ALargeSmall, gradientItems: 'from-rose-500/10 to-pink-500/10' };
        case 'harakat': return { label: 'Harakat', color: 'orange', icon: Vibrate, gradientItems: 'from-orange-500/10 to-yellow-500/10' };
        default: return { label: 'Materi', color: 'slate', icon: FileText, gradientItems: 'from-slate-500/10 to-gray-500/10' };
    }
};

// Fallback Icons

const GameIndex = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const gamesData = await contentService.getSpecialPrograms();
        setCategories(gamesData);
      } catch (err) {
        console.error('Failed to load games:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <Trophy className="absolute inset-0 m-auto w-8 h-8 text-amber-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl pb-40">
        
        {/* Header */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-6">
                <Gamepad className="w-4 h-4" />
                Zona Permainan
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Asah Kemampuanmu
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Pilih kategori dan mulai tantangan interaktif untuk meningkatkan level bahasa Arabmu.
            </p>
        </div>

        <div className="space-y-24">
        {categories.map((category, idx) => {
            const IconComp = iconMap[category.icon] || Trophy;
            // Use items if available, or empty array
            const items = category.items || [];
            if (items.length === 0 && (!category.topics || category.topics.length === 0)) return null;

            return (
              <section key={category.id} className="relative">
                  {/* Category Header */}
                  <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 flex-shrink-0">
                          <IconComp className="w-8 h-8" />
                      </div>
                      <div>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                              {category.title}
                          </h2>
                          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                              {category.desc}
                          </p>
                      </div>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {items.map((item, itemIdx) => {
                          const typeInfo = getTypeInfo(item.type);
                          const TypeIcon = typeInfo.icon;
                          
                          return (
                              <Link 
                                  key={item.id} 
                                  to={category.isLocked ? '#' : `/program/${category.id}?item=${item.id}`}
                                  className={cn(
                                      "group relative flex flex-col justify-between h-40 md:h-48 rounded-[2rem] overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 border-b-4 active:border-b-0 active:translate-y-1",
                                      // Dynamic Backgrounds based on type
                                      category.isLocked 
                                        ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-not-allowed grayscale opacity-60"
                                        : `bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-${typeInfo.color}-400 dark:hover:border-${typeInfo.color}-500`
                                  )}
                              >
                                  {/* Background Decorations */}
                                  <div className={cn(
                                    "absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
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
                                        "font-black text-lg md:text-xl leading-tight line-clamp-2",
                                        "text-slate-800 dark:text-slate-100"
                                      )}>
                                          {item.title}
                                      </h3>
                                  </div>

                                  {/* Large Icon (Bottom Right) */}
                                  <div className="absolute -bottom-4 -right-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                      <div className={cn(
                                        "w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center opacity-20 dark:opacity-20 group-hover:opacity-100 transition-opacity",
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
                              </Link>
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
                  </div>
              </section>
            );
        })}
        </div>

        {categories.length === 0 && (
            <div className="text-center py-32 bg-white dark:bg-slate-800 rounded-[4rem] border border-dashed border-slate-300 dark:border-slate-700">
               <Trophy className="w-20 h-20 text-slate-200 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Belum ada Permainan</h3>
               <p className="text-slate-500 font-medium">Instruktur sedang menyiapkan tantangan baru untukmu.</p>
            </div>
        )}
    </div>
  );
};

export default GameIndex;
