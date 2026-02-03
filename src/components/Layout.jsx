import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { contentService } from '../services/contentService';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [footerText, setFooterText] = useState('');
  const location = useLocation();

  useEffect(() => {
    const loadFooter = async () => {
      try {
        const config = await contentService.getHomeConfig();
        setFooterText(config?.footerText || '');
      } catch (err) {
        console.error('Error loading footer:', err);
        setFooterText('');
      }
    };
    loadFooter();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="lg:ml-80 pt-20 min-h-screen transition-all duration-300 relative overflow-x-hidden">
        <Outlet key={location.pathname} />
        
        {/* Footer */}
        <footer className="mt-20 py-10 text-center text-xs font-bold tracking-widest text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-white/5 uppercase">
          <p>{footerText || '© 2026 Tarbiyyat Lughah. All Rights Reserved.'}</p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
