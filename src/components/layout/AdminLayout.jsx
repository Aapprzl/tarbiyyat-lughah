import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { useTheme } from '../providers/ThemeProvider';
import { LayoutDashboard, Library, LogOut, LayoutGrid, Award, Info, ShieldCheck, Type, CircleUser, Home, Menu, Sun, Moon, Database, ChevronRight, Diamond, X, Trophy, Hash, Monitor, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [siteConfig, setSiteConfig] = useState(() => {
      const syncConf = contentService.getHomeConfigSync();
      return syncConf || { siteTitle: 'Tarbiyyat Al-Lughah', siteLogoType: 'icon' };
  });

  useEffect(() => {
     const loadConfig = async () => {
         const conf = await contentService.getHomeConfig();
         if (conf) setSiteConfig(conf);
     };
     loadConfig();
  }, []);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-admin-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-admin-sidebar', handleToggle);
  }, []);

  // Floating Toggle Button (Mobile only)
  const FloatingToggle = () => (
    <AnimatePresence>
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center md:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
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
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isActive 
          ? "bg-teal-600 text-white" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium arabic-sidebar-content">{label}</span>
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

      {/* Admin Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[100] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:rounded-lg",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
             {/* Dynamic Logo */}
             {siteConfig.siteLogoType === 'image' && siteConfig.siteLogoUrl ? (
                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5">
                     <img src={siteConfig.siteLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                 </div>
             ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-indigo-600 rounded-lg flex items-center justify-center">
                   <Diamond className="w-5 h-5 text-white" />
                </div>
             )}
            <div className="arabic-sidebar">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Admin Panel</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Tarbiyyat Al-Lughah</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 px-3">Menu Utama</div>
          <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/games" icon={Trophy} label="Manajemen Game" />
          
          <div className="pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 px-3">Pengaturan Web</div>
          <NavItem to="/admin/home-editor" icon={LayoutGrid} label="Editor Beranda" />
          <NavItem to="/admin/library-manager" icon={Library} label="Manajemen Perpustakaan" />
          <NavItem to="/admin/intro-editor" icon={Monitor} label="Manajemen Intro" />
          
          <div className="pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 px-3">Sistem & Aset</div>
          <NavItem to="/admin/assets" icon={Layers} label="Pustaka Aset" />
          <NavItem to="/admin/font-editor" icon={Type} label="Font Arab" />
          
          <div className="pt-6 px-3">
             <Link to="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-2">
               <Home className="w-5 h-5" />
               <span className="text-sm font-medium">Lihat Beranda</span>
             </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto border-t border-slate-200 dark:border-slate-800">
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                       <CircleUser className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Admin Utama</span>
                 </div>
                 <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                 >
                   {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                 </button>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-medium border border-red-200 dark:border-red-900/50"
              >
                <LogOut className="w-4 h-4" /> Keluar
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
