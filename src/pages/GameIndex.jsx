import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Crosshair, CheckSquare, Sliders, Orbit, MoveRight, ShieldCheck, Diamond, Medal, Gamepad, Play, Puzzle, Youtube, Music, ClipboardList, Layers, GripVertical, HelpCircle, MoveLeft, Image as ImageIcon } from 'lucide-react';
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
        case 'matchup': return { label: 'Match Up', color: 'pink', icon: Puzzle };
        case 'quiz': return { label: 'Kuis', color: 'emerald', icon: HelpCircle };
        case 'flashcard': return { label: 'Kartu', color: 'sky', icon: Layers };
        case 'anagram': return { label: 'Anagram', color: 'orange', icon: GripVertical };
        case 'completesentence': return { label: 'Lengkapi', color: 'blue', icon: Type };
        case 'unjumble': return { label: 'Susun Kalimat', color: 'emerald', icon: Puzzle };
        case 'spinwheel': return { label: 'Roda Putar', color: 'indigo', icon: RefreshCcw };
        case 'youtube': return { label: 'Video', color: 'red', icon: Youtube };
        case 'audio': return { label: 'Audio', color: 'violet', icon: Music };
        case 'pdf': return { label: 'Dokumen', color: 'blue', icon: ClipboardList };
        case 'vocab': return { label: 'Kosakata', color: 'indigo', icon: Table }; 
        case 'text': return { label: 'Bacaan', color: 'teal', icon: Type };
        case 'wordclassification': return { label: 'Tebak Jenis Kata', color: 'rose', icon: Puzzle };
        default: return { label: 'Materi', color: 'slate', icon: FileText };
    }
};

// Fallback Icons
import { RefreshCcw, Type, Table, FileText } from 'lucide-react';

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
                                  <div className="aspect-square bg-slate-100 dark:bg-slate-900/50 relative overflow-hidden">
                                      {item.thumbnail ? (
                                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                      ) : (
                                          <div className={cn(
                                              "w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 transition-colors",
                                              `group-hover:text-${typeInfo.color}-500/20`
                                          )}>
                                              <TypeIcon className="w-12 h-12" />
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
