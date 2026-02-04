import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { BookOpen, Star, ArrowRight, Shield, X, Sparkles, Globe, Brain, Zap, PlayCircle, Lock } from 'lucide-react';
import { PdfViewer } from '../components/PdfViewer';
import { AuroraBackground } from '../components/animations/AuroraBackground';
import { SplitText } from '../components/animations/SplitText';
import { BentoGrid, BentoGridItem } from '../components/animations/BentoGrid';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const iconMap = {
  BookOpen, Star, Sparkles, Globe, Brain, Zap, PlayCircle
};

const Home = () => {
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [config, setConfig] = useState(null);
  const [copyrightConfig, setCopyrightConfig] = useState(null);
  const [showCopyright, setShowCopyright] = useState(false);

  useEffect(() => {
    const load = async () => {
      const progs = await contentService.getSpecialPrograms();
      setSpecialPrograms(progs);

      const conf = await contentService.getHomeConfig();
      setConfig(conf);
      
      const cp = await contentService.getCopyrightConfig();
      setCopyrightConfig(cp);
    };
    load();
  }, []);

  if (!config) return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
        <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 bg-teal-500 rounded-2xl shadow-xl shadow-teal-500/20"
        />
    </div>
  );

  return (
    <div className="relative overflow-x-hidden">
      {/* Hero Section - Immersive Aurora */}
      <AuroraBackground className="rounded-b-[3rem] shadow-2xl overflow-hidden mb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-6 items-center justify-center px-4 md:px-0 text-center max-w-4xl z-20"
        >
          {/* Badge */}
          <div className="bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 animate-fade-in backdrop-blur-md">
             Platform Belajar Bahasa Arab Modern
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white arabic-title leading-tight drop-shadow-sm">
                <SplitText text={config.heroTitleArabic} />
            </h1>
            <h2 className="text-2xl md:text-5xl font-extrabold text-[var(--color-primary-dark)] dark:text-teal-400 font-sans tracking-tight">
                {config.heroTitleLatin}
            </h2>
          </div>

          <p className="font-medium text-slate-600 dark:text-slate-400 md:text-xl max-w-2xl leading-relaxed mt-4 drop-shadow-sm px-4 md:px-0">
            {config.heroDescription}
          </p>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-10">
            <Link 
              to="/materi" 
              className="group relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-2xl font-bold transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center overflow-hidden"
            >
              <span className="relative z-10">{config.heroButtonText}</span>
              <ArrowRight className="ml-3 w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-teal-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>

            <Link 
              to="/about" 
              className="text-slate-600 dark:text-slate-300 font-bold hover:text-[var(--color-primary)] transition-colors flex items-center group px-4 py-2"
            >
              {config.heroButtonSecondaryText || 'Tentang Kami'}
              <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full ml-2 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"></div>
            </Link>

             {/* Copyright Button */}
             {copyrightConfig?.pdfUrl && (
                <button 
                    onClick={() => setShowCopyright(true)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-sm font-medium"
                >
                    <Shield className="w-4 h-4" />
                    Hak Cipta Terdaftar
                </button>
            )}
          </div>
        </motion.div>
      </AuroraBackground>

       {/* Copyright Modal */}
       {showCopyright && copyrightConfig?.pdfUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-[var(--color-bg-card)] w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-[var(--color-border)]"
             >
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
                   <h3 className="font-bold text-[var(--color-text-main)] flex items-center text-lg">
                      <Shield className="w-6 h-6 mr-3 text-teal-600" />
                      Dokumen Hak Cipta
                   </h3>
                   <button 
                      onClick={() => setShowCopyright(false)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                   >
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                   <PdfViewer fileUrl={copyrightConfig.pdfUrl} />
                </div>
             </motion.div>
          </div>
       )}

      {/* Bento Grid Header */}
      <div className="container mx-auto px-4 max-w-6xl mb-12">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div className="max-w-xl">
             <div className="h-1.5 w-20 bg-teal-500 rounded-full mb-6"></div>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
                 {config.programsSectionTitle || 'Program Unggulan Kami'}
             </h2>
             <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">
                 Pilih program yang sesuai dengan kebutuhan dan level kemampuan Anda. Mulai dari dasar hingga mahir.
             </p>
          </div>
          <Link to="/materi" className="hidden md:flex items-center gap-2 text-teal-600 font-bold hover:gap-4 transition-all pb-2 border-b-2 border-teal-500/20 hover:border-teal-500">
              Lihat Materi Lainnya <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
        
        {/* Bento Grid Layout */}
        <BentoGrid>
          {specialPrograms.map((prog, idx) => {
             const Icon = iconMap[prog.icon] || Star;
             return (
                <div key={prog.id} className="md:col-span-1">
                   {prog.isLocked ? (
                     <div className="opacity-75 cursor-not-allowed h-full">
                        <BentoGridItem
                          title={prog.title}
                          description="Program ini akan segera hadir. Saat ini akses masih terkunci."
                          header={
                            <div className="flex flex-1 w-full h-full min-h-[10rem] rounded-2xl bg-slate-300 dark:bg-slate-800 grayscale items-center justify-center relative overflow-hidden">
                               <div className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl border border-white/20">
                                   <Lock className="w-10 h-10" />
                               </div>
                               <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg border border-white/10">
                                  <Lock className="w-3 h-3" /> Terkunci
                               </div>
                            </div>
                          }
                        />
                     </div>
                   ) : (
                     <Link to={`/program/${prog.id}`}>
                        <BentoGridItem
                          title={prog.title}
                          description={prog.desc || 'Pelajari program ini untuk meningkatkan kemampuan bahasa Arab Anda secara intensif.'}
                          header={
                            <div className={cn(
                               "flex flex-1 w-full h-full min-h-[10rem] rounded-2xl bg-gradient-to-br transition-all group-hover/bento:scale-[1.02] items-center justify-center relative overflow-hidden",
                               idx % 3 === 0 ? "from-teal-500 to-indigo-600" : 
                               idx % 3 === 1 ? "from-indigo-600 to-purple-600" : 
                               "from-amber-400 to-orange-600"
                            )}>
                               <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl border border-white/30 transition-transform group-hover/bento:scale-110 duration-500">
                                   <Icon className="w-10 h-10" />
                               </div>
                               
                               {/* Decorative Background Element */}
                               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500"></div>
                            </div>
                          }
                        />
                     </Link>
                   )}
                </div>
             );
          })}
        </BentoGrid>

        {/* Mobile View More */}
        <div className="md:hidden mt-12 flex justify-center">
             <Link to="/materi" className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-8 py-4 rounded-2xl font-bold flex items-center">
                Lihat Materi Lainnya <ArrowRight className="ml-2 w-5 h-5" />
             </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;
