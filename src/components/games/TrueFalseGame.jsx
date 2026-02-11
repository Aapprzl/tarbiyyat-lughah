import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  X, 
  Zap, 
  Sparkles, 
  Trophy, 
  RefreshCcw, 
  Clock,
  Volume2,
  VolumeX,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import confetti from 'canvas-confetti';

const TrueFalseGame = ({ questions = [], title = "Kilat Bahasa" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
  const [gameState, setGameState] = useState('playing'); // 'playing', 'feedback', 'finished'
  const [isCorrectFeedback, setIsCorrectFeedback] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);

  // Audio Refs
  const audioRefs = useRef({});

  useEffect(() => {
    const muted = window.localStorage.getItem('gameMuted') === 'true';
    setIsMuted(muted);

    const sounds = {
      success: 'https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3',
      error: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      timerTick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    };

    const initialisedSounds = {};
    Object.entries(sounds).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      initialisedSounds[key] = audio;
    });

    audioRefs.current = initialisedSounds;

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
        audio.load();
      });
    };
  }, []);

  const playSound = (soundKey) => {
    if (isMuted) return;
    const audio = audioRefs.current[soundKey];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    window.localStorage.setItem('gameMuted', newState ? 'true' : 'false');
  };

  const startTimer = () => {
    setTimeLeft(10);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null); // Timeout is wrong answer
          return 0;
        }
        if (prev <= 4) playSound('timerTick');
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (userAnswer) => {
    if (gameState !== 'playing') return;
    
    clearInterval(timerRef.current);
    const currentQ = questions[currentIndex];
    const isCorrect = userAnswer === currentQ.isCorrect;

    setIsCorrectFeedback(isCorrect);
    setGameState('feedback');

    if (isCorrect) {
      const addedScore = 10 + (streak * 2); // Bonus for streaks
      setScore(prev => prev + addedScore);
      setStreak(prev => prev + 1);
      playSound('success');
      if (streak > 2) {
          confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#6366f1', '#3b82f6']
          });
      }
    } else {
      setStreak(0);
      playSound('error');
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setGameState('playing');
        setIsCorrectFeedback(null);
      } else {
        setGameState('finished');
        if (score > questions.length * 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
      }
    }, 1200);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
    setIsCorrectFeedback(null);
    setTimeLeft(10);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-12 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Belum ada pertanyaan Kilat Bahasa.</p>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-bg-card)] rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border-4 border-indigo-500/20 max-w-md mx-auto flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-azure-600" />
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-azure-700 shadow-indigo-500/20 flex items-center justify-center mb-6 shadow-xl transform rotate-12">
           <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </div>
        
        <h2 className="text-3xl font-black text-[var(--color-text-main)] mb-2 uppercase tracking-tighter">Selesai! ⚡</h2>
        <p className="text-[var(--color-text-muted)] mb-6 font-medium text-base">
          Kecepatanmu luar biasa! Terus berlatih.
        </p>
        
        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-5 mb-6 border border-slate-100 dark:border-white/5 w-full">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Skor Akhir</div>
            <div className="text-5xl font-black text-indigo-500 tabular-nums">
              {score}
            </div>
        </div>

        <button 
          onClick={resetGame}
          className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          <span>Main Lagi</span>
        </button>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];
  // Determine text direction
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  const rtl = isArabic(currentQ?.text);

  return (
    <div className="w-full max-w-4xl mx-auto px-0 md:px-0 py-0 md:py-6">
      <div className="relative bg-[var(--color-bg-card)] backdrop-blur-xl rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl border-x-0 md:border-4 border-[var(--color-border)] overflow-hidden select-none">
        {/* Dynamic Background on Feedback */}
        <AnimatePresence>
            {isCorrectFeedback !== null && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                        "absolute inset-0 z-0 opacity-10",
                        isCorrectFeedback ? "bg-emerald-500" : "bg-red-500"
                    )}
                />
            )}
        </AnimatePresence>

        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-azure-500" />

        {/* Header */}
        <div className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/50 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-azure-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kilat Bahasa</span>
                 {streak > 1 && (
                     <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black"
                     >
                        <Sparkles className="w-2.5 h-2.5" /> STREAK x{streak}
                     </motion.div>
                 )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tighter">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className="p-2.5 bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] text-slate-500 hover:text-indigo-500"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="px-4 py-2.5 bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] font-black text-[10px] text-slate-500">
               {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden relative z-10">
           <motion.div 
             initial={{ width: "100%" }}
             animate={{ width: `${(timeLeft / 10) * 100}%` }}
             transition={{ duration: 1, ease: "linear" }}
             className={cn(
                 "h-full shadow-[0_0_10px_rgba(99,102,241,0.5)]",
                 timeLeft <= 3 ? "bg-red-500" : "bg-indigo-500"
             )}
           />
        </div>

        <div className="p-8 md:p-12 flex flex-col items-center relative z-10">
            {/* Question Card */}
            <motion.div 
               key={currentIndex}
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -50, opacity: 0 }}
               className="w-full max-w-2xl bg-white dark:bg-white/5 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-white/10 shadow-xl flex flex-col items-center text-center gap-8 min-h-[300px] justify-center relative"
            >
                {isCorrectFeedback !== null && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        className={cn(
                            "absolute top-8 right-8 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl",
                            isCorrectFeedback ? "bg-emerald-500" : "bg-red-500"
                        )}
                    >
                        {isCorrectFeedback ? <Check className="w-10 h-10" /> : <X className="w-10 h-10" />}
                    </motion.div>
                )}

                <div className="space-y-4">
                    <div 
                        className={cn(
                            "text-5xl md:text-7xl font-black text-[var(--color-text-main)]",
                            rtl ? "arabic-content leading-[1.4]" : "tracking-tight"
                        )}
                        dir={rtl ? 'rtl' : 'ltr'}
                    >
                        {currentQ.text}
                    </div>
                    <div className="h-px w-20 bg-slate-200 dark:bg-white/10 mx-auto" />
                    <div className="text-2xl md:text-3xl font-medium text-slate-500 dark:text-slate-400">
                        {currentQ.translation}
                    </div>
                </div>

                <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-4">
                    Apakah Pasangan Ini Benar?
                </div>
            </motion.div>

            {/* Controls */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl">
                <button 
                   onClick={() => handleAnswer(true)}
                   disabled={gameState !== 'playing'}
                   className={cn(
                       "group py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-lg transition-all flex flex-col items-center justify-center gap-2 border-4 active:scale-95 shadow-2xl",
                       gameState === 'playing' 
                        ? "bg-emerald-500 border-emerald-600 text-white hover:scale-[1.05] hover:shadow-emerald-500/30"
                        : "bg-slate-200 dark:bg-slate-800 border-transparent text-slate-400 opacity-50 grayscale"
                   )}
                >
                    <Check className="w-8 h-8 group-hover:scale-125 transition-transform" />
                    <span>BENAR</span>
                </button>

                <button 
                   onClick={() => handleAnswer(false)}
                   disabled={gameState !== 'playing'}
                   className={cn(
                       "group py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-lg transition-all flex flex-col items-center justify-center gap-2 border-4 active:scale-95 shadow-2xl",
                       gameState === 'playing' 
                        ? "bg-red-500 border-red-600 text-white hover:scale-[1.05] hover:shadow-red-500/30"
                        : "bg-slate-200 dark:bg-slate-800 border-transparent text-slate-400 opacity-50 grayscale"
                   )}
                >
                    <X className="w-8 h-8 group-hover:scale-125 transition-transform" />
                    <span>SALAH</span>
                </button>
            </div>
        </div>

        {/* Instructions Footer */}
        <div className="px-12 py-5 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/30 hidden md:flex items-center justify-center relative z-10">
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em] flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Waktu kamu terbatas! Putuskan dengan Kilat.
            </p>
        </div>
      </div>
    </div>
  );
};

export default TrueFalseGame;
