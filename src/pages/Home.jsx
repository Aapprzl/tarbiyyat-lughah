import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { BookOpen, Library, Award, MoveRight, ShieldCheck, X, Diamond, Orbit, Cpu, Rocket, Gamepad as GamepadIcon, Shield, Trophy } from 'lucide-react';
import { PdfViewer } from '../components/PdfViewer';
import { VisionSection } from '../components/VisionSection';
import { AuroraBackground } from '../components/animations/AuroraBackground';
import { SplitText } from '../components/animations/SplitText';
import { BentoGrid, BentoGridItem } from '../components/animations/BentoGrid';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

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

  useEffect(() => {
    const load = async () => {
      // Parallelize all API calls for faster loading
      const [progs, conf] = await Promise.all([
        contentService.getSpecialPrograms(),
        contentService.getHomeConfig()
      ]);
      
      setSpecialPrograms(progs);
      setConfig(conf);
    };
    load();

    // Handle scroll to programs if coming from BottomBar on another page
    const searchParams = new URLSearchParams(window.location.hash.split('?')[1]);
    if (searchParams.get('scroll') === 'programs') {
      setTimeout(() => {
        document.querySelector('#special-programs-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
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
      <AuroraBackground className="rounded-b-[3rem] shadow-2xl overflow-hidden mb-24 !justify-start pt-28 md:!justify-center md:pt-0">
        <motion.div
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
          <div className="bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2 md:mb-4 animate-fade-in backdrop-blur-md">
             Platform Belajar Bahasa Arab Modern
          </div>

          <div className="space-y-3 md:space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white arabic-title leading-tight drop-shadow-sm">
                {config.heroTitleArabic}
            </h1>
            <h2 className="text-3xl md:text-5xl font-extrabold font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 animate-gradient bg-300% pb-2">
                {config.heroTitleLatin}
            </h2>
          </div>

          <p className="font-medium text-slate-600 dark:text-slate-400 text-base md:text-xl max-w-2xl leading-relaxed mt-4 md:mt-4 drop-shadow-sm px-4 md:px-0">
            {config.heroDescription}
          </p>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mt-10 md:mt-12 w-full md:w-auto px-6 md:px-0">
            <Link 
              to="/materi" 
              className="group relative px-8 py-4 md:px-10 md:py-5 rounded-3xl font-bold transition-all shadow-xl hover:shadow-teal-500/40 hover:scale-105 active:scale-95 flex items-center justify-center w-full md:w-auto overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-transparent"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 opacity-5 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center mr-3 relative z-10 shadow-lg shadow-teal-500/20 group-hover:bg-white transition-colors">
                <BookOpen className="w-5 h-5 text-white group-hover:text-teal-500 transition-colors" />
              </div>
              
              <span className="relative z-10 text-lg text-slate-900 dark:text-white group-hover:text-white transition-colors">{config.heroButtonText}</span>
            </Link>
 
            <Link 
              to="/permainan" 
              className="group relative px-8 py-4 md:px-10 md:py-5 rounded-3xl font-bold transition-all shadow-xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95 flex items-center justify-center w-full md:w-auto overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-transparent"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 opacity-5 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center mr-3 relative z-10 shadow-lg shadow-rose-500/20 group-hover:bg-white transition-colors">
                <GamepadIcon className="w-5 h-5 text-white group-hover:text-rose-500 transition-colors" />
              </div>
              
              <span className="relative z-10 text-lg text-slate-900 dark:text-white group-hover:text-white transition-colors">Masuk Arena Game</span>
            </Link>
          </div>
        </motion.div>
      </AuroraBackground>

      {/* Vision Section */}
      <VisionSection config={config} />

    </div>
  );
};

export default Home;
