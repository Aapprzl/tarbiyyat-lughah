import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Library, Trophy, CircleUser, ShieldHalf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const BottomBar = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches;
    }
    return true;
  });
  const navRef = useRef(null);

  useEffect(() => {
    // 1. Media Query Listener for Responsiveness
    const mql = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    mql.addEventListener('change', handleMediaChange);

    return () => {
      mql.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Beranda' },
    { to: '/materi', icon: Library, label: 'Materi' },
    { to: '/permainan', icon: Trophy, label: 'Permainan' },
    { to: '/perpustakaan', icon: Library, label: 'Perpustakaan' },

  ];

  // Configurable Scales based on User Feedback
  const config = isDesktop ? {
    padX: 1.2,
    padY: 0.8,
    gap: 0, 
    baseScale: '1' 
  } : {
    iconScale: 1.2, 
    textScale: 0,
    padX: 0.8,
    padY: 0.7,
    gap: 0, 
    baseScale: 'var(--mobile-nav-scale, 0.8)' 
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pb-4 md:pb-8 flex justify-center px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {isVisible ? (
          <motion.nav 
            key="full-bar"
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="flex items-center gap-0.5 md:gap-1 p-1.5 md:p-2 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto relative group"
          >
            {navItems.map((item) => {
              let isActive;
              if (item.to === '/permainan') {
                isActive = location.pathname === '/permainan' || location.pathname.startsWith('/program/');
              } else if (item.to === '/materi') {
                isActive = location.pathname === '/materi' || (location.pathname.startsWith('/materi/') && !location.pathname.startsWith('/program/'));
              } else {
                isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              }
              
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-[2rem] transition-all duration-500",
                    isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                  style={{
                    paddingLeft: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padX})`,
                    paddingRight: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padX})`,
                    paddingTop: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padY})`,
                    paddingBottom: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padY})`
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDock"
                      className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-[1.8rem]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div 
                    className="relative z-10 flex flex-col items-center transition-all"
                    style={{ gap: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.gap})` }}
                  >
                    <Icon 
                      className={cn(
                        "transition-transform duration-300",
                        isActive ? "scale-110" : "hover:scale-110"
                      )} 
                      style={{ 
                        width: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.iconScale})`, 
                        height: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.iconScale})` 
                      }}
                    />
                  </div>
                </NavLink>
              );
            })}

            {/* Manual Hide Button */}
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-1 hidden md:block" />
            <button 
              onClick={() => setIsVisible(false)}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-full transition-all ml-1"
              title="Sembunyikan Navigasi"
            >
              <motion.div whileHover={{ rotate: 90 }} transition={{ type: 'spring' }}>
                <LayoutGrid className="w-5 h-5" />
              </motion.div>
            </button>
          </motion.nav>
        ) : (
          <motion.div 
            key="pill-launcher"
            initial={{ x: 100, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVisible(true)}
            className={cn(
              "fixed bottom-6 right-6 z-[110] bg-teal-600 text-white shadow-2xl shadow-teal-500/30 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto",
              isDesktop ? "w-16 h-16" : "w-14 h-14"
            )}
          >
            <LayoutGrid className={isDesktop ? "w-7 h-7" : "w-6 h-6"} />
            <motion.div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BottomBar;
