import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Library, Award, MoveRight, ShieldCheck, X, Diamond, Orbit, Cpu, Rocket, Gamepad, Shield, Trophy } from 'lucide-react';
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
  PlayCircle: Gamepad, 
  Play: Gamepad, 
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
      <AuroraBackground className="rounded-b-[3rem] shadow-2xl overflow-hidden mb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: window.innerWidth < 768 ? 0 : 0.3,
            duration: window.innerWidth < 768 ? 0.4 : 0.8,
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
                {config.heroTitleArabic}
            </h1>
            <h2 className="text-2xl md:text-5xl font-extrabold font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 animate-gradient bg-300% pb-2">
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
              <MoveRight className="ml-3 w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-teal-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>

            <Link 
              to="/permainan" 
              className="group relative px-10 py-5 rounded-2xl font-bold transition-all border-2 border-slate-200 dark:border-white/10 hover:border-teal-500 dark:hover:border-teal-400 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <Gamepad className="w-5 h-5" />
              <span>Masuk Arena Game</span>
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
