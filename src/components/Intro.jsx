import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Languages } from 'lucide-react';

const Intro = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center overflow-hidden"
        >
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3], 
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] bg-teal-500/10 rounded-full blur-[100px]"
            />
             <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, -45, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -right-1/2 w-[100vw] h-[100vw] bg-amber-500/10 rounded-full blur-[100px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            
            {/* Logo Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2rem] shadow-2xl flex items-center justify-center mb-10 border border-slate-100 dark:border-white/10"
            >
              <Languages className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </motion.div>

            {/* Arabic Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-4 arabic-title tracking-tight"
            >
              تربية اللغة
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-12 tracking-widest uppercase"
            >
              Tarbiyyat Lughah
            </motion.p>
            
            {/* Description */}
             <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-sm md:text-base text-slate-400 mb-12 max-w-md leading-relaxed"
            >
              Menghubungkan Hati dengan Bahasa Al-Qur'an melalui Teknologi Interaktif
            </motion.p>

            {/* Enter Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 1, type: "spring" }}
              onClick={handleEnter}
              className="group relative px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-bold overflow-hidden shadow-2xl shadow-teal-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-widest text-xs">Mulai Belajar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            
          </div>
          
          {/* Footer Text */}
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]"
           >
             © {new Date().getFullYear()} Tarbiyyat Lughah
           </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Intro;
