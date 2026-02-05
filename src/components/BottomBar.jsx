import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Library, Trophy, CircleUser, Sparkles, ShieldHalf } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const BottomBar = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Ignore bounce interactions (negative scroll)
      if (currentScrollY < 0) return;

      // Hide on scroll down (> 100px), show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
      
      // Auto-show after scroll stops (for better UX)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    };

    const handleInteraction = (e) => {
      // Check if click is outside the BottomBar
      if (navRef.current && !navRef.current.contains(e.target)) {
        // Toggle visibility on click outside
        setIsVisible(prev => !prev);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      }
      // If click is inside the bar, do nothing (let navigation happen)
    };

    // Add listeners for all viewports (Desktop & Mobile)
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Beranda' },
    { to: '/materi', icon: Library, label: 'Materi' },
    { to: '/permainan', icon: Trophy, label: 'Permainan' },
    { to: '/profil', icon: CircleUser, label: 'Profil' },
    { to: '/admin/login', icon: ShieldHalf, label: 'Admin' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pb-4 md:pb-6 flex justify-center px-3 md:px-4 pointer-events-none">
      <motion.nav 
        ref={navRef}
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : 120, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 200,
          mass: 0.8
        }}
        className="flex items-center gap-0.5 md:gap-1 p-1.5 md:p-2 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
      >
        {navItems.map((item) => {
          // Special handling for Permainan vs Materi
          let isActive;
          if (item.to === '/permainan') {
            // Permainan is active for /permainan or /program/* paths
            isActive = location.pathname === '/permainan' || location.pathname.startsWith('/program/');
          } else if (item.to === '/materi') {
            // Materi is active only for /materi paths (not /program)
            isActive = location.pathname === '/materi' || (location.pathname.startsWith('/materi/') && !location.pathname.startsWith('/program/'));
          } else {
            // Default behavior for other items
            isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          }
          
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-col items-center justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 group",
                isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDock"
                  className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-[1.3rem] md:rounded-[1.8rem]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-0.5 md:gap-1">
                <Icon className={cn(
                  "w-5 h-5 md:w-6 md:h-6 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span 
                  className={cn(
                    "font-black uppercase tracking-widest leading-none transition-all",
                    isActive ? "opacity-100 mt-0.5 md:mt-1" : "opacity-0 h-0 overflow-hidden group-hover:opacity-100 group-hover:h-auto group-hover:mt-0.5 md:group-hover:mt-1"
                  )}
                  style={{ fontSize: 'var(--font-arabic-sidebar-content-size)' }}
                >
                  {item.label}
                </span>
              </div>

              {isActive && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -bottom-0.5 md:-bottom-1 w-1 h-1 bg-teal-500 rounded-full"
                />
              )}
            </NavLink>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default BottomBar;
