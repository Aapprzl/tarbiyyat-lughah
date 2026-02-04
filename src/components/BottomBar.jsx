import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Gamepad2, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const BottomBar = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Beranda' },
    { to: '/materi', icon: BookOpen, label: 'Materi' },
    { to: '/permainan', icon: Gamepad2, label: 'Permainan' },
    { to: '/profil', icon: User, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pb-6 flex justify-center px-4 pointer-events-none">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', damping: 20, stiffness: 100 }}
        className="flex items-center gap-1 p-2 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-col items-center justify-center px-6 py-3 rounded-[2rem] transition-all duration-500 group",
                isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDock"
                  className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-[1.8rem]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest leading-none transition-all",
                  isActive ? "opacity-100 mt-1" : "opacity-0 h-0 overflow-hidden group-hover:opacity-100 group-hover:h-auto group-hover:mt-1"
                )}>
                  {item.label}
                </span>
              </div>

              {isActive && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -bottom-1 w-1 h-1 bg-teal-500 rounded-full"
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
