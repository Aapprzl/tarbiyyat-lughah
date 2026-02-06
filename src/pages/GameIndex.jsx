import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Crosshair, CheckSquare, Sliders, Orbit, MoveRight, ShieldCheck, Diamond, Medal, Gamepad, Play, Puzzle, Youtube, Music, ClipboardList, Layers, GripVertical, HelpCircle, MoveLeft, Image as ImageIcon, Keyboard, Type, Table, FileText, RefreshCcw } from 'lucide-react';
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
        case 'matchup': return { label: 'Match Up', color: 'pink', icon: Puzzle, gradient: 'from-pink-500 to-rose-600' };
        case 'quiz': return { label: 'Kuis', color: 'emerald', icon: HelpCircle, gradient: 'from-emerald-400 to-teal-600' };
        case 'flashcard': return { label: 'Kartu', color: 'sky', icon: Layers, gradient: 'from-sky-400 to-indigo-600' };
        case 'anagram': return { label: 'Anagram', color: 'orange', icon: GripVertical, gradient: 'from-orange-400 to-amber-600' };
        case 'completesentence': return { label: 'Lengkapi', color: 'blue', icon: Type, gradient: 'from-blue-400 to-indigo-600' };
        case 'unjumble': return { label: 'Susun Kalimat', color: 'emerald', icon: Puzzle, gradient: 'from-emerald-400 to-indigo-600' };
        case 'spinwheel': return { label: 'Roda Putar', color: 'indigo', icon: RefreshCcw, gradient: 'from-indigo-500 to-purple-600' };
        case 'youtube': return { label: 'Video', color: 'red', icon: Youtube, gradient: 'from-red-500 to-rose-600' };
        case 'audio': return { label: 'Audio', color: 'violet', icon: Music, gradient: 'from-violet-500 to-purple-600' };
        case 'pdf': return { label: 'Dokumen', color: 'blue', icon: ClipboardList, gradient: 'from-blue-500 to-cyan-600' };
        case 'vocab': return { label: 'Kosakata', color: 'indigo', icon: Table, gradient: 'from-indigo-500 to-slate-800' }; 
        case 'text': return { label: 'Bacaan', color: 'teal', icon: Type, gradient: 'from-teal-400 to-emerald-600' };
        case 'wordclassification': return { label: 'Tebak Jenis Kata', color: 'rose', icon: Puzzle, gradient: 'from-rose-500 to-pink-600' };
        case 'harakat': return { label: 'Harakat', color: 'orange', icon: Keyboard, gradient: 'from-amber-400 to-orange-600' };
        default: return { label: 'Materi', color: 'slate', icon: FileText, gradient: 'from-slate-400 to-slate-600' };
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
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {items.map((item, itemIdx) => {
                          const typeInfo = getTypeInfo(item.type);
                          const TypeIcon = typeInfo.icon;
                          
                          return (
                              <Link 
                                  key={item.id} 
                                  to={category.isLocked ? '#' : `/program/${category.id}?item=${item.id}`}
                                  className={cn(
                                      "group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1",
                                      category.isLocked && "opacity-60 grayscale cursor-not-allowed"
                                  )}
                              >
                                  {/* Thumbnail Area */}
                                  <div className="aspect-square relative overflow-hidden">
                                      {item.thumbnail ? (
                                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                      ) : (
                                          <div className={cn(
                                              "w-full h-full flex items-center justify-center relative transition-transform duration-700 group-hover:scale-110 bg-gradient-to-br",
                                              typeInfo.gradient
                                          )}>
                                              {/* Decorative background shapes */}
                                              <div className="absolute inset-0 opacity-10">
                                                  <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                                                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-black rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                                              </div>
                                              
                                              {/* Main Stylized Icon */}
                                              <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl">
                                                  <TypeIcon className="w-14 h-14 text-white drop-shadow-lg" />
                                              </div>

                                              {/* Bottom Accent */}
                                              <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                                                  <div className="w-1/3 h-full bg-white/40 animate-shimmer" />
                                              </div>
                                          </div>
                                      )}
                                      
                                      {/* Play Overlay */}
                                      {!category.isLocked && (
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-amber-500 transform scale-50 group-hover:scale-100 transition-transform">
                                                <Play className="w-5 h-5 ml-1" />
                                            </div>
                                        </div>
                                      )}
                                  </div>

                                  {/* Content Info */}
                                  <div className="p-5">
                                      <div className={cn(
                                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border",
                                          `bg-${typeInfo.color}-50 dark:bg-${typeInfo.color}-900/10 text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400 border-${typeInfo.color}-100 dark:border-${typeInfo.color}-900/20`
                                      )}>
                                          <TypeIcon className="w-3 h-3" />
                                          {typeInfo.label}
                                      </div>
                                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5em] text-sm">
                                          {item.title}
                                      </h3>
                                  </div>
                              </Link>
                          );
                      })}

                      {/* Fallback for Empty Items but has Topics (Legacy Mode or purely empty) */}
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
