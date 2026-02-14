import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, BookOpen, Library, Trophy, CircleUser, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

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
    { to: '/', icon: Home, label: 'Beranda', color: 'indigo' },
    { to: '/materi', icon: BookOpen, label: 'Materi', color: 'teal' },
    { to: '/permainan', icon: Trophy, label: 'Permainan', color: 'rose' },
    { to: '/perpustakaan', icon: Library, label: 'Perpustakaan', color: 'sky' },
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

  const [pillPosition, setPillPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('bottom-bar-pill-pos');
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch (e) {
      return { x: 0, y: 0 };
    }
  });

  // Safety Reset & Clamping
  useEffect(() => {
    const clamp = () => {
        const topLimit = -window.innerHeight + 120;
        
        let needsUpdate = false;
        let newPos = { ...pillPosition };

        if (newPos.y < topLimit) { newPos.y = topLimit; needsUpdate = true; }
        if (newPos.y > 10) { newPos.y = 10; needsUpdate = true; }
        
        // Force Right Side Only
        if (newPos.x !== 0) { newPos.x = 0; needsUpdate = true; }

        if (needsUpdate) {
            setPillPosition(newPos);
            localStorage.setItem('bottom-bar-pill-pos', JSON.stringify(newPos));
        }
    };

    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [pillPosition.x, pillPosition.y]);

  const handleDragEnd = (_, info) => {
    const pillWidth = isDesktop ? 64 : 56;
    const margin = 4; // Super tight margin (4px)
    const initialRightOffset = 4; // Matches right-1
    const availableWidth = window.innerWidth;
    
    // Total offset from the initial position (right: 4px)
    // We force snappedX to 0 because the user wants it ONLY on the right side.
    const currentTotalY = pillPosition.y + info.offset.y;

    // Snap to the right edge always
    const snappedX = 0;
    
    const newPos = { 
      x: snappedX, 
      y: currentTotalY 
    };
    
    setPillPosition(newPos);
    localStorage.setItem('bottom-bar-pill-pos', JSON.stringify(newPos));
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
            className="flex items-center gap-0.5 md:gap-1 p-1.5 md:p-2 bg-white/40 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] pointer-events-auto relative group"
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
              const color = item.color;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive: innerActive }) => cn(
                    "relative flex flex-col items-center justify-center transition-all duration-500 rounded-[2rem]",
                    innerActive ? `text-${color}-600 dark:text-${color}-400` : `text-slate-400 hover:text-${color}-500`
                  )}
                  style={{
                    paddingLeft: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padX})`,
                    paddingRight: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padX})`,
                    paddingTop: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padY})`,
                    paddingBottom: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.padY})`
                  }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.15, y: -6 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className={cn(
                      "relative z-10 flex items-center justify-center rounded-2xl",
                      isActive 
                        ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/20 scale-110` 
                        : `bg-transparent hover:bg-${color}-500/10 dark:hover:bg-${color}-500/20 transition-colors duration-300`
                    )}
                    style={{
                      width: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * 2.2)`,
                      height: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * 2.2)`
                    }}
                  >
                    <Icon 
                      className="transition-transform duration-300"
                      style={{ 
                        width: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.iconScale || 1.1})`, 
                        height: `calc((var(--font-arabic-sidebar-content-size) * ${config.baseScale}) * ${config.iconScale || 1.1})` 
                      }}
                    />
                  </motion.div>
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
              <motion.div whileHover={{ y: 5 }} transition={{ type: 'spring' }}>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>
          </motion.nav>
        ) : (
          <motion.div 
            key="pill-launcher"
            drag
            dragMomentum={false}
            dragConstraints={{
                top: -window.innerHeight + 120, // 80px header + 40px safety margin
                bottom: 10,  // Keep 10px below starting point at most
                left: -(window.innerWidth - (isDesktop ? 64 : 56) - 8), // Symmetrical: innerWidth - width - (4 * 2)
                right: 0
            }}
            onDragEnd={handleDragEnd}
            initial={{ x: 100, opacity: 0, scale: 0.5 }}
            animate={{ 
                x: pillPosition.x, 
                y: pillPosition.y, 
                opacity: 1, 
                scale: 1 
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            exit={{ x: 100, opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVisible(true)}
            className={cn(
              "fixed bottom-6 right-1 z-[110] bg-teal-500/80 dark:bg-teal-600/60 backdrop-blur-xl text-white shadow-2xl shadow-teal-500/30 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto border border-white/20",
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
