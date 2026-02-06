import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { useTheme } from '../components/ThemeProvider';
import { LayoutDashboard, Library, LogOut, LayoutGrid, Award, Info, ShieldCheck, Type, CircleUser, Home, Menu, Sun, Moon, Database, ChevronRight, Diamond, X, Trophy, Hash, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-admin-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-admin-sidebar', handleToggle);
  }, []);

  // Floating Toggle Button (Replaces Header)
  const FloatingToggle = () => (
    <AnimatePresence>
      {!isMobileMenuOpen && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-teal-600 text-white rounded-full shadow-2xl shadow-teal-500/30 flex items-center justify-center border-2 border-white/20 backdrop-blur-md md:hidden"
        >
          <Menu className="w-7 h-7" />
        </motion.button>
      )}
    </AnimatePresence>
  );

  useEffect(() => {
    const unsubscribe = contentService.onAuthStateChange((user) => {
      if (!user) {
         navigate('/admin/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    await contentService.logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            <LayoutDashboard className="absolute inset-0 m-auto w-6 h-6 text-teal-500 animate-pulse" />
        </div>
      </div>
    );
  }

  const NavItem = ({ to, icon: Icon, label, target }) => (
    <NavLink 
      to={to} 
      target={target}
      className={({ isActive }) => `
        group relative flex items-center px-4 py-4 rounded-2xl transition-all duration-500
        ${isActive 
          ? 'bg-teal-600 text-white shadow-xl shadow-teal-500/20 translate-x-1' 
          : 'text-slate-400 hover:text-teal-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:translate-x-1'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-colors duration-500",
              isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-teal-400 group-hover:bg-teal-500/10"
          )}>
            <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="font-bold text-sm tracking-tight flex-1">{label}</span>
          {isActive && (
            <motion.div 
              layoutId="activeTab"
              className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"
            />
          )}
          {!isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all text-teal-400" />}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <FloatingToggle />

      {/* Admin Sidebar - Integrated into Layout flow */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 flex flex-col shadow-2xl transition-transform duration-500 md:translate-x-0 md:sticky md:top-8 md:m-0 md:h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:border
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Profile Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-teal-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
               <Diamond className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">Admin Panel</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-500">Workspace V2.5</p>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-slate-200 dark:from-white/10 via-slate-100 dark:via-white/5 to-transparent"></div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Menu Utama</div>
          <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/games" icon={Trophy} label="Manajemen Game" />
          
          <div className="pt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Pengaturan Web</div>
          <NavItem to="/admin/home-editor" icon={LayoutGrid} label="Editor Beranda" />
          <NavItem to="/admin/library-manager" icon={Library} label="Manajemen Perpustakaan" />
          <NavItem to="/admin/intro-editor" icon={Monitor} label="Manajemen Intro" />
          
          <div className="pt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Sistem & Aset</div>
          <NavItem to="/admin/font-editor" icon={Type} label="Font Arab" />
          
          <div className="pt-8 px-4">
             <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-teal-600 dark:hover:text-white transition-colors py-2 group">
               <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-teal-500/10 transition-colors">
                  <Home className="w-4 h-4" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest">Lihat Beranda</span>
             </Link>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 mt-auto">
           <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                       <CircleUser className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Admin Utama</span>
                 </div>
                 <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-white/10 text-slate-400 hover:text-teal-600 dark:hover:text-white transition-all shadow-sm dark:shadow-none"
                 >
                   {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                 </button>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] border border-red-500/20"
              >
                <LogOut className="w-4 h-4" /> Keluar Sesi
              </button>
           </div>
        </div>
      </aside>

      {/* Admin Content Area - Now just a flex child */}
      <div className="flex-1 min-w-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
