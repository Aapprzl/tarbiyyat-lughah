import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  Trophy, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Play,
  RefreshCcw,
  Star
} from 'lucide-react';
import { cn } from "../../utils/cn";
import confetti from 'canvas-confetti';

const WordClassificationGame = ({ data }) => {
  const [gameState, setGameState] = useState('start'); // start, playing, finished
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(data?.timeLimit || 60);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong' }
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
     const muted = window.localStorage.getItem('gameMuted') === 'true';
     setIsMuted(muted);
  }, []);
  
  // Audio Refs
  const successSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3'));
  const errorSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/958/958-mask.mp3').replace('mask', 'preview')); // Fixing potential accidental mask
  const clickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

  const playSound = (soundRef) => {
    if (isMuted) return;
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch(() => {});
  }
  
  const questions = data?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Types Configuration with premium color schemes
  const types = [
    { 
      id: 'isim', 
      label: 'ISIM', 
      subLabel: 'Kata Benda', 
      theme: 'cyan', 
      classes: 'bg-cyan-50/80 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-cyan-500/20'
    },
    { 
      id: 'fiil', 
      label: "FI'IL", 
      subLabel: 'Kata Kerja', 
      theme: 'pink', 
      classes: 'bg-pink-50/80 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/30 text-pink-600 dark:text-pink-400 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] ring-pink-500/20'
    },
    { 
      id: 'harf', 
      label: 'HARF', 
      subLabel: 'Huruf', 
      theme: 'emerald', 
      classes: 'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-emerald-500/20'
    }
  ];

  // Timer Logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             handleFinish();
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);


  const handleStart = () => {
    playSound(clickSound);
    setGameState('playing');
    setScore(0);
    setTimeLeft(data?.timeLimit || 60);
    setCombo(0);
    setCurrentQuestionIndex(0);
  };

  const handleFinish = () => {
    setGameState('finished');
    if (score > 0) {
       confetti({ 
         particleCount: 150, 
         spread: 80, 
         origin: { y: 0.6 },
         colors: ['#6366f1', '#a855f7', '#ec4899']
       });
    }
  };


  const handleAnswer = (selectedType) => {
    if (!currentQuestion || feedback) return;
    playSound(clickSound);

    if (currentQuestion.type === selectedType) {
      // CORRECT
      const comboMultiplier = 1 + (combo * 0.1);
      const points = Math.round(10 * comboMultiplier);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setFeedback({ type: 'correct' });
      playSound(successSound);

      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
      }, 400);

    } else {
      // WRONG
      setCombo(0);
      setFeedback({ type: 'wrong' });
      playSound(errorSound);

      setTimeout(() => {
        setFeedback(null);
      }, 400);
    }
  };

  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      if (newState) {
          window.localStorage.setItem('gameMuted', 'true');
      } else {
          window.localStorage.removeItem('gameMuted');
          clickSound.current.currentTime = 0;
          clickSound.current.play().catch(() => {});
      }
  };

  if (!data) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-4 md:my-8 px-2 md:px-0">
       <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden min-h-[clamp(400px,65vh,550px)] flex flex-col select-none">
          
          {/* Animated Gradient Top Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 animate-gradient-x" />

          {/* Premium Header - More Compact */}
          <div className="px-5 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-black/10">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-11 md:h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  </div>
                  <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                         <span className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Misi Klasifikasi</span>
                         <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                      </div>
                      <h2 className="text-base md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">
                          {data.title || 'Tebak Jenis Kata'}
                      </h2>
                  </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                  <motion.button 
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={toggleMute}
                     className={cn(
                        "p-1.5 md:p-2 rounded-lg transition-all border",
                        isMuted 
                          ? "text-slate-400 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5" 
                          : "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm"
                     )}
                  >
                     {isMuted ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  </motion.button>
                  <motion.button 
                     whileHover={{ rotate: 180 }}
                     transition={{ duration: 0.5 }}
                     onClick={() => {
                        playSound(clickSound);
                        setGameState('playing');
                     }} 
                     className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg transition-all shadow-sm"
                  >
                      <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </motion.button>
              </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* START SCREEN */}
            {gameState === 'start' && (
              <motion.div 
                 key="start"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.1 }}
                 className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center bg-gradient-to-b from-transparent to-indigo-50/30 dark:to-indigo-900/10"
              >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="w-20 h-20 md:w-28 md:h-28 bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex items-center justify-center mb-6 relative border-2 border-slate-100 dark:border-slate-700"
                  >
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-[1.5rem] md:rounded-[2rem] blur-xl" />
                      <Star className="w-10 h-10 md:w-14 md:h-14 text-indigo-500 fill-indigo-500/20" />
                  </motion.div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">
                     Siap Beraksi?
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium text-sm md:text-base leading-relaxed px-4">
                     Uji kemampuanmu mengklasifikasikan kata <strong>Isim</strong>, <strong>Fi'il</strong>, dan <strong>Harf</strong> sebelum waktu habis!
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="px-8 md:px-10 py-3.5 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                     <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                     <span>Mulai Misi</span>
                  </motion.button>
              </motion.div>
            )}

            {/* PLAYING SCREEN */}
            {gameState === 'playing' && (
               <motion.div 
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col p-5 md:p-10 relative overflow-hidden"
               >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />

                  {/* Stats Container - Compact */}
                  <div className="flex items-center justify-between mb-6 md:mb-10 relative z-10 gap-2">
                     <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-3 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm min-w-[60px] md:min-w-[100px]">
                        <span className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Skor</span>
                        <motion.span 
                          key={score}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-lg md:text-2xl font-black text-slate-900 dark:text-white font-mono block tracking-tighter tabular-nums"
                        >
                          {score}
                        </motion.span>
                     </div>
                     
                     {/* Timer Badge - Compact */}
                     <div className={cn(
                        "relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3.5 rounded-xl md:rounded-[2rem] border-2 transition-all shadow-lg",
                         timeLeft < 10 
                           ? "bg-red-50 dark:bg-red-900/20 border-red-500/50 text-red-600 shadow-red-500/20" 
                           : "bg-white/80 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-slate-200/50 dark:shadow-none"
                     )}>
                         <Timer className={cn("w-4 h-4 md:w-5 md:h-5", timeLeft < 10 && "animate-pulse")} />
                         <span className="text-xl md:text-2xl font-black font-mono w-6 md:w-10 text-center tracking-tighter tabular-nums">{timeLeft}</span>
                     </div>

                     <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-3 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-right min-w-[60px] md:min-w-[100px]">
                        <span className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Combo</span>
                        <span className={cn(
                            "text-lg md:text-2xl font-black font-mono transition-colors tracking-tighter tabular-nums",
                            combo > 2 ? "text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]" : "text-slate-300 dark:text-slate-700"
                        )}>x{combo}</span>
                     </div>
                  </div>

                  {/* Question Display Area - More Compact */}
                  <div className="flex-1 flex flex-col items-center justify-center relative min-h-[140px] md:min-h-[200px] mb-6 md:mb-10">
                      <AnimatePresence mode="wait">
                         {feedback && (
                            <motion.div 
                               key={feedback.type}
                               initial={{ scale: 0, opacity: 0, rotate: -20 }}
                               animate={{ scale: 1, opacity: 1, rotate: 0 }}
                               exit={{ scale: 1.2, opacity: 0, rotate: 20 }}
                               className="absolute inset-x-0 -top-6 md:-top-10 z-20 flex items-center justify-center pointer-events-none"
                            >
                               <div className={cn(
                                 "p-3 md:p-5 rounded-full shadow-xl",
                                 feedback.type === 'correct' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                               )}>
                                 {feedback.type === 'correct' ? <CheckCircle className="w-7 h-7 md:w-12 md:h-12" /> : <XCircle className="w-7 h-7 md:w-12 md:h-12" />}
                               </div>
                            </motion.div>
                         )}
                      </AnimatePresence>

                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-xl text-center py-8 md:py-12 px-6 md:px-8 bg-slate-50/50 dark:bg-white/5 border-2 md:border-4 border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-3xl md:rounded-[3rem] relative shadow-inner overflow-hidden"
                      >
                         <motion.h1 
                           key={currentQuestion?.text}
                           initial={{ y: 15, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           className="text-[clamp(2.5rem,10vw,4.5rem)] font-black text-slate-900 dark:text-white font-arabic leading-tight drop-shadow-sm select-all pt-2"
                         >
                            {currentQuestion?.text}
                         </motion.h1>
                      </motion.div>
                  </div>

                  {/* Answer Grid - Tightened */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4 relative z-10 px-2 md:px-0">
                     {types.map((type) => (
                        <motion.button
                           key={type.id}
                           whileHover={{ y: -3, scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => handleAnswer(type.id)}
                           className={cn(
                              "relative group overflow-hidden py-4 md:py-7 rounded-[1.25rem] md:rounded-[1.75rem] border-2 transition-all ring-offset-4 ring-offset-white dark:ring-offset-slate-900 focus:ring-2",
                              type.classes
                           )}
                        >
                           <div className="flex flex-col items-center relative z-10">
                              <span className="text-lg md:text-xl font-black uppercase tracking-[0.15em] mb-0.5 md:mb-1">
                                 {type.label}
                              </span>
                              <div className="h-0.5 w-5 md:w-8 bg-current opacity-20 mb-1 md:mb-2 rounded-full" />
                              <span className="text-[7px] md:text-[9px] font-bold opacity-60 uppercase tracking-widest">
                                 {type.subLabel}
                              </span>
                           </div>
                        </motion.button>
                     ))}
                  </div>

               </motion.div>
            )}

            {/* FINISHED SCREEN - Compact */}
            {gameState === 'finished' && (
               <motion.div 
                  key="finished"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-gradient-to-t from-indigo-50/50 dark:from-indigo-900/10 to-transparent"
               >
                   <motion.div 
                     initial={{ rotate: -15, scale: 0.5 }}
                     animate={{ rotate: 12, scale: 1 }}
                     transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                     className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 transform"
                   >
                       <Trophy className="w-10 h-10 md:w-14 md:h-14 text-white" />
                   </motion.div>
                   
                   <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Bento Berhasil! 🏆</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm md:text-lg">Misi klasifikasi selesai!</p>
                   
                   <div className="bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 min-w-[240px] md:min-w-[350px] mb-8 border-2 border-slate-100 dark:border-slate-700 shadow-xl relative group">
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 rounded-full text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">Skor Akhir</div>
                      <motion.span 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.5 }}
                         className="text-6xl md:text-8xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter tabular-nums block leading-none"
                      >
                         {score}
                      </motion.span>
                   </div>

                   <button 
                      onClick={() => {
                         playSound(clickSound);
                         handleStart();
                      }}
                      className="w-full max-w-[280px] md:max-w-sm py-4 md:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 overflow-hidden group"
                   >
                      <RefreshCcw className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-700" />
                      <span>Masuk Lagi</span>
                   </button>
               </motion.div>
            )}

          </AnimatePresence>
       </div>
    </div>
  );
};

export default WordClassificationGame;
