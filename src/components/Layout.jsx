import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="lg:ml-72 pt-16 min-h-screen transition-all duration-300">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Outlet key={location.pathname} />
        </div>
        
        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)]/50">
          <p>© {new Date().getFullYear()} Maria Ulfah Syarif. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
