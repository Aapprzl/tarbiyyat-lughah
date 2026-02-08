import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Trophy, 
  RefreshCcw, 
  MoveRight, 
  HelpCircle, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import confetti from 'canvas-confetti';

const QuizGame = ({ questions = [], title = "Kuis Pilihan Ganda" }) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false); 
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const muted = window.localStorage.getItem('gameMuted') === 'true';
    setIsMuted(muted);
  }, []);

  // Audio Refs
  const successSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3'));
  const errorSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/958/958-preview.mp3'));
  const clickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

  const playSound = (soundRef) => {
    if (isMuted) return;
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch(() => {});
  }

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    window.localStorage.setItem('gameMuted', newState ? 'true' : 'false');
    if (!newState) {
       clickSound.current.currentTime = 0;
       clickSound.current.play().catch(() => {});
    }
  };

  const currentQuestion = questions[currentIndex];

  // Helper to detect Arabic
  const isArabic = (text) => text && /[\u0600-\u06FF]/.test(text);
  
  const handleOptionClick = (option) => {
    if (isAnswered) return;
    
    setSelectedOptionId(option.id);
    setIsAnswered(true);
    playSound(clickSound);

    if (option.isCorrect) {
      setScore(prev => prev + 1);
      playSound(successSound);
    } else {
      playSound(errorSound);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      playSound(clickSound);
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      playSound(clickSound);
      setShowResult(true);
      if (score >= questions.length * 0.7) {
        playSound(successSound);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#14b8a6', '#5eead4']
        });
      }
    }
  };

  const resetGame = () => {
    playSound(clickSound);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOptionId(null);
    setIsAnswered(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-12 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Belum ada pertanyaan quiz.</p>
      </div>
    );
  }

  // Final Result Screen
  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border-4 border-teal-500/20 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-500" />
        <motion.div 
          initial={{ rotate: -15, scale: 0.5 }}
          animate={{ rotate: 12, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-28 h-28 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-teal-500/20 transform"
        >
           <Trophy className="w-14 h-14 text-white" />
        </motion.div>
        
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Quiz Selesai! 🎉</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-lg leading-relaxed">
          {score === questions.length ? "Luar biasa! Skor sempurna!" : "Bagus sekali! Teruslah berlatih."}
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-10 mb-10 border border-slate-100 dark:border-white/5 w-full max-w-sm shadow-inner group">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-teal-500 transition-colors">Hasil Belajar</div>
            <div className="text-7xl font-black text-teal-600 dark:text-teal-400 tracking-tighter tabular-nums">
              {score} <span className="text-2xl text-slate-300 dark:text-slate-600">/</span> {questions.length}
            </div>
        </div>

        <button 
          onClick={resetGame}
          className="w-full max-w-sm py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 overflow-hidden group"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          <span>Ulangi Quiz</span>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 md:px-0 py-6">
      <div className="relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden select-none">
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500" />

        {/* Header Context */}
        <div className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-6 bg-slate-50/50 dark:bg-black/10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Game Kuis</span>
                 <Sparkles className="w-3 h-3 text-teal-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-500 hover:text-teal-500 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 font-black text-xs text-slate-500 uppercase tracking-widest group">
                 Misi {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
             className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"
           />
        </div>

        <div className="p-8 md:p-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
               {/* Question Label */}
               <div className="inline-block px-4 py-1.5 bg-teal-500/10 dark:bg-teal-500/20 rounded-full mb-6">
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">Mission {currentIndex + 1}</span>
               </div>

               {/* Question Text */}
               <h4 
                  className={`text-2xl md:text-4xl font-black text-slate-800 dark:text-white mb-10 leading-tight ${isArabic(currentQuestion.text) ? 'font-arabic text-right text-3xl md:text-5xl py-4' : 'tracking-tighter'}`}
                  dir={isArabic(currentQuestion.text) ? 'rtl' : 'ltr'}
               >
                  {currentQuestion.text}
               </h4>

               {/* Options Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {currentQuestion.options.map((option, idx) => {
                     const isSelected = selectedOptionId === option.id;
                     const isCorrect = option.isCorrect;
                     
                     let stateClass = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-teal-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm";
                     let icon = <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xs font-black text-slate-300 group-hover:bg-teal-500 group-hover:text-white transition-colors">{String.fromCharCode(65 + idx)}</div>;

                     if (isAnswered) {
                        if (isCorrect) {
                           stateClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]";
                           icon = <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg"><CheckCircle2 className="w-5 h-5" /></div>;
                        } else if (isSelected && !isCorrect) {
                           stateClass = "bg-red-50 dark:bg-red-500/10 border-red-500 scale-[0.98] opacity-90 animate-shake";
                           icon = <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg"><AlertCircle className="w-5 h-5" /></div>;
                        } else {
                           stateClass = "border-slate-100 dark:border-slate-800 opacity-40 grayscale-[0.5]";
                        }
                     } else if (isSelected) {
                        stateClass = "bg-teal-50 dark:bg-teal-500/10 border-teal-500 ring-4 ring-teal-500/10 shadow-xl scale-[1.02]";
                        icon = <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white"><Check className="w-5 h-5" /></div>;
                     }

                     return (
                       <motion.button
                         key={option.id}
                         whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                         whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                         onClick={() => handleOptionClick(option)}
                         disabled={isAnswered}
                         className={cn(
                           "relative p-5 md:p-6 rounded-[1.5rem] md:rounded-3xl border-2 text-left transition-all flex items-center gap-5 group",
                           stateClass
                         )}
                       >
                          {icon}
                          <span className={cn(
                             "flex-1 font-bold text-lg md:text-xl",
                             isAnswered && isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-100',
                             isArabic(option.text) ? 'font-arabic text-2xl md:text-3xl pt-1' : ''
                          )}>
                            {option.text}
                          </span>
                          {!isAnswered && (
                             <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-teal-500 group-hover:scale-150 transition-all" />
                          )}
                       </motion.button>
                     );
                  })}
               </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer / Next Button */}
          <div className="mt-12 md:mt-16 flex justify-center">
             <AnimatePresence>
               {isAnswered && (
                 <motion.button 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   onClick={nextQuestion}
                   className="w-full sm:w-80 py-5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 group px-12"
                 >
                   <span>{currentIndex < questions.length - 1 ? 'Pertanyaan Berikutnya' : 'Selesaikan Quiz'}</span>
                   <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                 </motion.button>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
