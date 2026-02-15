
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { BookOpen, Library, Award, MoveRight, ShieldCheck, X, Diamond, Orbit, Cpu, Rocket, Gamepad as GamepadIcon, Shield, Trophy, Home as HomeIcon, Star, Zap, Activity, Target, Gamepad2, Monitor, Hexagon, Smile, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { PdfViewer } from '../components/media/PdfViewer';
import { VisionSection } from '../components/features/VisionSection';
import { AuroraBackground } from '../components/animations/AuroraBackground';
// import { BentoGrid, BentoGridItem } from '../components/animations/BentoGrid';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useRealtimeCurriculum } from '../hooks/useRealtimeCurriculum';
import { useCallback } from 'react';

const iconMap = {
  BookOpen: Library, 
  Star: Award, 
  Sparkles: Diamond, 
  Globe: Orbit, 
  Brain: Cpu, 
  Zap: Rocket, 
  PlayCircle: GamepadIcon, 
  Play: GamepadIcon, 
  Gamepad2: Trophy
};

const Home = () => {
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [progs, conf] = await Promise.all([
        contentService.getSpecialPrograms(),
        contentService.getHomeConfig()
      ]);
      
      setSpecialPrograms(progs);
      setConfig(conf);
    } catch (err) {
      console.error("Home data load error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Handle scroll to programs if coming from BottomBar on another page
    const searchParams = new URLSearchParams(window.location.hash.split('?')[1]);
    if (searchParams.get('scroll') === 'programs') {
      setTimeout(() => {
        document.querySelector('#special-programs-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [loadData]);

  // Handle realtime updates with a stable callback
  const handleRealtimeUpdate = useCallback((_type, _payload) => {
    const reloadPrograms = async () => {
      try {
        const progs = await contentService.getSpecialPrograms();
        setSpecialPrograms(progs);
      } catch (err) {
        console.error("Home realtime reload error", err);
      }
    };
    reloadPrograms();
  }, []);

  useRealtimeCurriculum(handleRealtimeUpdate);

  if (loading || !config) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-[var(--color-bg-main)]">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <HomeIcon className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
      </div>
      <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse" style={{ fontFamily: 'var(--font-latin)' }}>
        Memuat Beranda
      </p>
    </div>
  );

  return (
    <div className="relative overflow-x-hidden">
      {/* Hero Section - Immersive Aurora */}
      <AuroraBackground className="rounded-b-[3rem] shadow-2xl overflow-hidden mb-24 !justify-start pt-12 md:!justify-center md:pt-0">
        <Motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: window.innerWidth < 768 ? 0 : 0.3,
            duration: window.innerWidth < 768 ? 0.4 : 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 md:gap-6 items-center justify-center px-4 md:px-0 text-center max-w-4xl z-20 md:py-20"
        >
          {/* Badge */}
          <div className="bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2 md:mb-4 animate-fade-in backdrop-blur-md" style={{ fontFamily: 'var(--font-latin)' }}>
             Platform Belajar Bahasa Arab Modern
          </div>

          <div className="space-y-4 md:space-y-6">
            <h1 className="text-5xl md:text-[7rem] font-black text-[var(--color-text-main)] leading-[1.1] drop-shadow-sm mb-2" style={{ fontFamily: 'var(--font-arabic)' }}>
                {config.heroTitleArabic}
            </h1>
            <h2 className="text-3xl md:text-6xl font-extrabold font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 animate-gradient bg-300% pb-2 leading-tight">
                {config.heroTitleLatin}
            </h2>
          </div>

          <div className="flex flex-col gap-3 mt-4 md:mt-6 px-4 md:px-0 max-w-3xl mx-auto opacity-80">
            {config.heroDescriptionArabic && (
              <p 
                className="text-xl md:text-2xl text-[var(--color-text-main)] font-light leading-relaxed" 
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                {config.heroDescriptionArabic}
              </p>
            )}
            {config.heroDescriptionLatin && (
              <p 
                className="text-sm md:text-base text-[var(--color-text-muted)] font-light leading-relaxed max-w-2xl mx-auto italic" 
                style={{ fontFamily: 'var(--font-latin)' }}
              >
                {config.heroDescriptionLatin}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mt-10 md:mt-12 w-full md:w-auto px-6 md:px-0">
            <Link 
              to="/materi" 
              className="group relative px-8 py-4 md:px-10 md:py-5 rounded-3xl font-bold transition-all shadow-xl hover:shadow-teal-500/40 hover:scale-105 active:scale-95 flex items-center justify-center w-full md:w-auto overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-white/20 dark:border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center mr-3 relative z-10 shadow-lg shadow-teal-500/20 group-hover:bg-white transition-colors text-white group-hover:text-teal-500">
                {React.createElement(
                    { BookOpen, Library, Star, Zap, Activity, Target, Trophy, Gamepad2, Orbit, Monitor, Hexagon, Smile }[config.heroButton1Icon] || BookOpen, 
                    { className: "w-5 h-5 transition-colors" }
                )}
              </div>
              
              <div className="flex flex-col items-start relative z-10">
                <span className="text-2xl text-slate-700 dark:text-slate-200 group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-arabic)' }}>
                  {config.heroButton1Text || 'ابدأ الآن'}
                </span>
                {config.heroButton1TextLatin && (
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-white/80 transition-colors -mt-1" style={{ fontFamily: 'var(--font-latin)' }}>
                    {config.heroButton1TextLatin}
                  </span>
                )}
              </div>
            </Link>
 
              <Link 
                to="/permainan" 
                className="group relative px-8 py-4 md:px-10 md:py-5 rounded-3xl font-bold transition-all shadow-xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95 flex items-center justify-center w-full md:w-auto overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-white/20 dark:border-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center mr-3 relative z-10 shadow-lg shadow-rose-500/20 group-hover:bg-white transition-colors text-white group-hover:text-rose-500">
                  {React.createElement(
                      { BookOpen, Library, Star, Zap, Activity, Target, Trophy, Gamepad2, Orbit, Monitor, Hexagon, Smile }[config.heroButton2Icon] || Trophy, 
                      { className: "w-5 h-5 transition-colors" }
                  )}
                </div>
                
                <div className="flex flex-col items-start relative z-10">
                  <span className="text-2xl text-slate-700 dark:text-slate-200 group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-arabic)' }}>
                    {config.heroButton2Text || 'ادخل ساحة الألعاب'}
                  </span>
                  {config.heroButton2TextLatin && (
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-white/80 transition-colors -mt-1" style={{ fontFamily: 'var(--font-latin)' }}>
                      {config.heroButton2TextLatin}
                    </span>
                  )}
                </div>
              </Link>
          </div>
        </Motion.div>
      </AuroraBackground>

      {/* Vision Section */}
      <VisionSection config={config} />

    </div>
  );
};

export default Home;
