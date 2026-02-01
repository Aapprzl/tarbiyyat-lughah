import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { useTheme } from '../components/ThemeProvider';
import { LayoutDashboard, BookOpen, LogOut, Layout, Star, Info, Shield, Type, User, Home, Menu, Sun, Moon, Database } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Listen for auth state
    const unsubscribe = contentService.onAuthStateChange((user) => {
      if (!user) {
         navigate('/admin/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await contentService.logout();
    navigate('/admin/login');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false); // Close menu on route change
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-muted)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] flex" style={{ fontFamily: 'var(--font-latin)' }}>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex-col border-r border-slate-800 font-sans transition-transform duration-300 md:translate-x-0 md:static md:flex
        ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-xs text-slate-400">Bahasa Arab Praktis</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <LayoutDashboard className="w-5 h-5 rotate-45" /> {/* Close Icon alternative */}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/programs" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Star className="w-5 h-5 mr-3" />
            Program Khusus
          </NavLink>
          <NavLink 
            to="/admin/home-editor" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Layout className="w-5 h-5 mr-3" />
            Editor Beranda
          </NavLink>
          <NavLink 
            to="/admin/about-cms" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Info className="w-5 h-5 mr-3" />
            Editor Tentang Kami
          </NavLink>
          <NavLink
            to="/admin/profile-editor"
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <User className="w-5 h-5 mr-3" />
            Editor Profil
          </NavLink>
          <NavLink
            to="/admin/db-migration"
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Database className="w-5 h-5 mr-3" />
            Migrasi Database
          </NavLink>
          <NavLink 
            to="/admin/font-editor" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Type className="w-5 h-5 mr-3" />
            Font Arab
          </NavLink>
          <NavLink 
            to="/admin/copyright" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Shield className="w-5 h-5 mr-3" />
            Editor Hak Cipta
          </NavLink>
          <Link to="/" target="_blank" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Home className="w-5 h-5 mr-3" />
            Lihat Website
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <button 
             onClick={toggleTheme}
             className="flex items-center w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
           >
             {theme === 'dark' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
             Mode {theme === 'dark' ? 'Terang' : 'Gelap'}
           </button>
          
           <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
           >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen w-full">
        <header className="bg-[var(--color-bg-card)] shadow-sm h-16 flex items-center justify-between px-4 md:hidden border-b border-[var(--color-border)] sticky top-0 z-30">
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-[var(--color-text-main)]">
             <Menu className="w-6 h-6" />
           </button>
           <h2 className="font-bold text-[var(--color-text-main)] truncate mx-2">Admin Panel</h2>
           <button onClick={handleLogout} className="p-2 -mr-2"><LogOut className="w-5 h-5 text-[var(--color-text-muted)]" /></button>
        </header>
        
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
