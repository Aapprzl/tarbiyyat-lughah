import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomBar from './BottomBar';
import Header from './Header';
import { contentService } from '../../services/contentService';
import { Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

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

  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      {/* Global Background Blobs - Hidden for cleaner look as per request */}
      {/* <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none z-0 animate-blob"></div> */}
      {/* <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none z-0 animate-blob animation-delay-2000"></div> */}
      
      {!isAdmin && <Header />}
      
      <main className={cn(
        "min-h-screen transition-all duration-300 relative z-10",
        !isAdmin && "pt-20"
      )}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "flex flex-col gap-8",
              !isAdmin ? "min-h-[calc(100vh-5rem)]" : "min-h-screen"
            )}
          >
            <Outlet />
            
            {/* Footer Style - Synced with page fade to prevent blinking */}
            <footer className={cn(
                 "relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors z-10 w-full",
                 isAdmin ? "py-8" : isHome ? "mt-20 pt-16 pb-8" : "py-8",
                 "mt-auto" // Force sticky bottom
            )}>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 opacity-80"></div>

              <div className="max-w-7xl mx-auto px-6">
                {!isAdmin ? (
                   <>
                    {isHome && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        
                        {/* Brand & About */}
                        <div className="space-y-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white uppercase italic">
                              {config?.programsSectionTitle ? (
                                (() => {
                                  const text = config.programsSectionTitle;
                                  const firstSpaceIndex = text.indexOf(' ');
                                  if (firstSpaceIndex === -1) return text;
                                  return (
                                    <>
                                      {text.substring(0, firstSpaceIndex)} <span className="text-teal-600 dark:text-teal-400">{text.substring(firstSpaceIndex + 1)}</span>
                                    </>
                                  );
                                })()
                              ) : (
                                <>
                                  Tarbiyyat <span className="text-teal-600 dark:text-teal-400">al-Lughah</span>
                                </>
                              )}
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
                                {config?.footerBackendList || 'Supabase • PostgreSQL • Vercel • Node.js'}
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
                    )}

                    {/* Copyright Bottom */}
                    <div className={cn(
                      "flex flex-col md:flex-row items-center justify-between gap-4",
                      isHome && "pt-8 border-t border-slate-200 dark:border-slate-800"
                    )}>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        {config?.footerText || `© ${new Date().getFullYear()} Tarbiyyat al-Lughah. All rights reserved.`}
                      </p>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">{config?.footerRightText || 'PBA IAIN Bone'}</span>
                      </div>
                    </div>
                   </>
                ) : (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        {config?.footerText || `© ${new Date().getFullYear()} Tarbiyyat al-Lughah. All rights reserved.`}
                      </p>
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-tighter">Admin Control Center</span>
                    </div>
                )}
              </div>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>

      {(!location.pathname.startsWith('/admin') || location.pathname === '/admin/login') && <BottomBar />}
    </div>
  );
};

export default Layout;
