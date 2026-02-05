import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import Header from './Header';
import { contentService } from '../services/contentService';
import { Phone, Mail, MapPin } from 'lucide-react';

const Layout = () => {
  const [config, setConfig] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const conf = await contentService.getHomeConfig();
        setConfig(conf);
      } catch (err) {
        console.error('Error loading config:', err);
      }
    };
    loadConfig();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] relative overflow-hidden">
      {/* Global Background Blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none z-0 animate-blob"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none z-0 animate-blob animation-delay-2000"></div>
      
      <Header />
      
      <main className="pt-20 min-h-screen transition-all duration-300 relative z-10">
        <Outlet key={location.pathname} />
        
        {/* Footer Legacy Style */}
        <footer className="mt-20 relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors pt-16 pb-8 z-10 w-full">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 opacity-80"></div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              
              {/* Brand & About */}
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white uppercase italic">
                    Tarbiyyat <span className="text-teal-600 dark:text-teal-400">al-Lughah</span>
                  </span>
                  <div className="h-1.5 w-16 bg-teal-600 dark:bg-teal-400 rounded-full"></div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm">
                  Media Pembelajaran Interaktif berbasis website yang dirancang khusus untuk meningkatkan kemampuan membaca Bahasa Arab siswa MTs melalui metode yang terstruktur dan menyenangkan.
                </p>
              </div>

              {/* Tech Stack */}
              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{config?.footerStackTitle || 'Development Stack'}</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{config?.footerToolsTitle || 'Tools & Editors'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                      {config?.footerToolsList || 'VS Code • Google Antigravity • Sublime Text'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{config?.footerBackendTitle || 'Backend & Infrastructure'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                      {config?.footerBackendList || 'Firebase Backend • Google Cloud Console • Git • Node.js'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{config?.footerAiTitle || 'Powered by AI Technology'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                      {config?.footerAiList || 'ChatGPT • Gemini • GitHub Copilot'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Hubungi Kami</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-teal-600 transition-colors">{config?.contactPhone || '0822 6686 2306'}</span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-teal-600 transition-colors text-wrap break-all">{config?.contactEmail || 'icalafrizal550790@gmail.com'}</span>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Alamat</span>
                      <p className="text-xs text-slate-400 italic">{config?.contactAddress || '(Alamat akan segera diperbarui)'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Copyright Bottom */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                {config?.footerText || `© ${new Date().getFullYear()} Tarbiyyat al-Lughah. All rights reserved.`}
              </p>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">{config?.footerRightText || 'PBA IAIN Bone'}</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <BottomBar />
    </div>
  );
};

export default Layout;
