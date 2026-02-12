import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, X, Laptop } from 'lucide-react';
import { cn } from '../../utils/cn';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if on mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            
            // Show the prompt after a small delay to not annoy the user immediately
            const timer = setTimeout(() => {
                const isDismissed = localStorage.getItem('pwa_install_dismissed');
                if (!isDismissed) {
                    setShowPrompt(true);
                }
            }, 3000);

            return () => clearTimeout(timer);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setShowPrompt(false);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // User dismissed, maybe hide it for this session or 24 hours
        localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed z-[1000] p-4 md:p-6",
                    isMobile 
                        ? "bottom-20 left-4 right-4" 
                        : "bottom-8 right-8 max-w-sm"
                )}
            >
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-teal-100 dark:border-white/10 overflow-hidden relative group">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    
                    <div className="relative p-5 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                            {isMobile ? <Smartphone className="w-6 h-6 text-white" /> : <Laptop className="w-6 h-6 text-white" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">
                                Install Aplikasi
                            </h3>
                            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                                Akses Tarbiyyat Lughah lebih cepat dan hemat kuota langsung dari layar utama Anda.
                            </p>
                            
                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Install Sekarang
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-3 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 rounded-xl transition-all"
                                    title="Tutup"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tiny Indicator */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="h-full bg-teal-500"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;
