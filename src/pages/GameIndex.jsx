import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Crosshair, CheckSquare, Sliders, Orbit, MoveRight, ShieldCheck, Diamond, Medal, Gamepad } from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const iconMap = {
  BookOpen: Award, // Fallback
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
    <div className="container mx-auto px-6 py-12 max-w-6xl pb-40">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {categories.map((category, idx) => {
            const IconComp = iconMap[category.icon] || Trophy;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link 
                  to={category.isLocked ? '#' : `/materi/${category.id}`}
                  className={cn(
                    "group block relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[3rem] p-8 h-full transition-all duration-500 overflow-hidden",
                    category.isLocked 
                      ? "opacity-80 grayscale cursor-not-allowed" 
                      : "hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2 hover:border-amber-500/30"
                  )}
                >
                  {/* Decorative Glow */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                     <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg",
                        category.isLocked ? "bg-slate-200 dark:bg-slate-900 text-slate-400" : "bg-amber-500 text-white shadow-amber-500/20"
                     )}>
                        <IconComp className="w-8 h-8" />
                     </div>

                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-amber-500 transition-colors">
                        {category.title}
                     </h3>
                     
                     <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 line-clamp-2 leading-relaxed h-[3rem]">
                        {category.desc || 'Tingkatkan kemampuan bahasa Arabmu dengan permainan ini.'}
                     </p>

                     <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                           {category.isLocked ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800">
                                 <ShieldCheck className="w-2.5 h-2.5" /> Terkunci
                              </div>
                           ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[9px] font-black uppercase tracking-widest border border-teal-500/20">
                                 <Gamepad className="w-2.5 h-2.5" /> Main Sekarang
                              </div>
                           )}
                           <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              {category.topics?.length || 0} Level
                           </span>
                        </div>
                        
                        {!category.isLocked && (
                           <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                              <MoveRight className="w-5 h-5" />
                           </div>
                        )}
                     </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
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

const StatCard = ({ icon, label, value, color }) => {
    const iconName = typeof icon === 'string' ? icon : null;
    const IconComp = iconName ? (iconMap[iconName] || Trophy) : icon;
    
    return (
        <div className="flex items-center gap-5 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                color === 'amber' ? "bg-amber-500/10 text-amber-600 shadow-amber-500/5" :
                color === 'teal' ? "bg-teal-500/10 text-teal-600 shadow-teal-500/5" :
                "bg-indigo-500/10 text-indigo-600 shadow-indigo-500/5"
            )}>
                <IconComp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
            </div>
        </div>
    );
};

export default GameIndex;
