import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../utils/cn';

const FadeText = ({ texts, duration = 5000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, duration);
    return () => clearInterval(interval);
  }, [texts, duration]);

  return (
    <div className="flex items-center justify-center min-h-[3em]">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl text-center px-4"
        >
          {texts[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};


const Intro = ({ onEnter, config, homeConfig }) => {
  const { theme, toggleTheme } = useTheme();
  const [isExiting, setIsExiting] = useState(false);

  // Dynamic Icon Resolver
  const LogoIcon = useMemo(() => {
    const iconName = homeConfig?.siteLogoIcon || 'Languages';
    return LucideIcons[iconName] || LucideIcons.Languages;
  }, [homeConfig]);

  // Disable scroll when intro is visible
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 1000); // Increased duration for smoother exit
  };

  const introData = useMemo(() => ({
    titleAr: config?.intro_title_ar || 'تربية اللغة',
    titleEn: config?.intro_title_en || 'Tarbiyyat Lughah',
    typingTexts: config?.intro_typing_texts || [
      "Menghubungkan Hati dengan Bahasa Al-Qur'an",
      "Media Pembelajaran Interaktif & Terstruktur"
    ],
    buttonText: config?.intro_button_text || 'Mulai Belajar'
  }), [config]);

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05, 
            filter: "blur(40px)",
            transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
          }}
          className="fixed inset-0 z-[10000] bg-white dark:bg-[#020617] flex items-center justify-center overflow-hidden"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
               animate={{ 
                 x: [0, 50, 0],
                 y: [0, 30, 0],
                 scale: [1, 1.1, 1],
                 opacity: [0.15, 0.25, 0.15]
               }}
               transition={{ duration: 15, repeat: Infinity }}
               className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-500/30 rounded-full blur-[120px]"
            />
            <motion.div 
               animate={{ 
                 x: [0, -40, 0],
                 y: [0, -20, 0],
                 scale: [1, 1.2, 1],
                 opacity: [0.1, 0.2, 0.1]
               }}
               transition={{ duration: 18, repeat: Infinity }}
               className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-amber-500/20 rounded-full blur-[150px]"
            />
          </div>

          {/* Theme Toggle Button */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-8 right-8 z-50"
          >
            <button
              onClick={toggleTheme}
              className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full border border-slate-200 dark:border-white/10 transition-all group pointer-events-auto"
              title="Ganti Tema"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-600 group-hover:rotate-[15deg] transition-transform" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-[30deg] transition-transform" />
              )}
            </button>
          </motion.div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full">
            
            {/* Branding Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
              className="relative group mb-12"
            >
              <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(20,184,166,0.15)] flex items-center justify-center border border-slate-100 dark:border-white/10 overflow-hidden">
                 { homeConfig?.siteLogoType === 'image' && homeConfig?.siteLogoUrl ? (
                    <img 
                      src={homeConfig.siteLogoUrl} 
                      alt="Logo" 
                      className="w-14 h-14 object-contain"
                    />
                 ) : (
                    <LogoIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                 )}
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
              </div>
            </motion.div>

            {/* Arabic Title */}
            <motion.h1 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-4 arabic-title tracking-tight"
            >
              {introData.titleAr}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-400 dark:text-slate-500 font-bold mb-8 flex items-center gap-3"
            >
              <span className="w-8 h-px bg-slate-200 dark:bg-white/5" />
              <span className="tracking-[0.15em] uppercase">{introData.titleEn}</span>
              <span className="w-8 h-px bg-slate-200 dark:bg-white/5" />
            </motion.p>
            
            {/* Animated Description (Fade) */}
            <div className="h-20 mb-12 flex items-center justify-center">
              <FadeText texts={introData.typingTexts} />
            </div>

            {/* Enter Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <button
                onClick={handleEnter}
                className="group relative px-12 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2.5rem] font-black overflow-hidden shadow-2xl transition-all hover:shadow-teal-500/25 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-3 relative z-10 transition-colors group-hover:text-white dark:group-hover:text-slate-950">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="uppercase tracking-[0.2em] text-[10px] sm:text-xs">{introData.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-all duration-500" />
                </div>
              </button>
            </motion.div>
            
          </div>
          
          {/* Footer Copyright */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 flex flex-col items-center gap-2"
          >
             <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
             <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">
               © {new Date().getFullYear()} Tarbiyyat Lughah Platform
             </span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Intro;
