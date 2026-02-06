import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, RotateCcw, CheckCircle, XCircle, Star, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { cn } from "../../utils/cn";
import confetti from 'canvas-confetti';

const WordClassificationGame = ({ data }) => {
  const [gameState, setGameState] = useState('start'); // start, playing, finished
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(data?.timeLimit || 60);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong', message: '' }
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
     const muted = window.localStorage.getItem('gameMuted') === 'true';
     setIsMuted(muted);
  }, []);
  
  // Audio Refs (Mocking actual audio for now)
  const successSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'));
  const errorSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'));
  
  const questions = data?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Types Configuration
  const types = [
    { id: 'isim', label: 'ISIM', subLabel: 'Kata Benda', color: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-500' },
    { id: 'fiil', label: "FI'IL", subLabel: 'Kata Kerja', color: 'pink', bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-500' },
    { id: 'harf', label: 'HARF', subLabel: 'Huruf', color: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-500' }
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
    setGameState('playing');
    setScore(0);
    setTimeLeft(data?.timeLimit || 60);
    setCombo(0);
    setCurrentQuestionIndex(0);
    // Shuffle logic could go here if needed
  };

  const handleFinish = () => {
    setGameState('finished');
    if (score > 0) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const playSound = (soundRef) => {
     if (isMuted) return;
     soundRef.current.currentTime = 0;
     soundRef.current.play().catch(e => console.log('Audio Blocked'));
  }

  const handleAnswer = (selectedType) => {
    if (!currentQuestion) return;

    if (currentQuestion.type === selectedType) {
      // CORRECT
      const comboMultiplier = 1 + (combo * 0.1);
      const points = Math.round(10 * comboMultiplier);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setFeedback({ type: 'correct' });
      
      playSound(successSound);

      // Next Question (Loop if end)
      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
      }, 500);

    } else {
      // WRONG
      setCombo(0);
      setFeedback({ type: 'wrong' });
      
      playSound(errorSound);

      setTimeout(() => {
        setFeedback(null);
      }, 500);
    }
  };

  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      if (newState) window.localStorage.setItem('gameMuted', 'true');
      else window.localStorage.removeItem('gameMuted');
  };

  if (!data) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans">
       <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Header Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <PuzzleIcon className="w-5 h-5" />
                  </div>
                  <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs">
                      {data.title || 'Tebak Jenis Kata'}
                  </span>
              </div>
              <div className="flex items-center gap-3">
                  <button 
                     onClick={toggleMute}
                     className={cn(
                        "p-2 rounded-full transition-all",
                        isMuted ? "text-slate-400 bg-slate-100 dark:bg-white/5 hover:text-red-500" : "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100" 
                     )}
                     title={isMuted ? "Nyalakan Suara" : "Matikan Suara"}
                  >
                     {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                     onClick={handleStart} 
                     className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                  >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
              </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* START SCREEN */}
            {gameState === 'start' && (
              <motion.div 
                 key="start"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                  <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 animate-bounce-slow">
                     <PuzzleIcon className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
                     Siap Bermain?
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                     Tentukan apakah kata yang muncul termasuk <strong>Isim</strong> (Kata Benda), <strong>Fi'il</strong> (Kata Kerja), atau <strong>Harf</strong> (Huruf). Kamu punya waktu <strong>{data?.timeLimit || 60} detik</strong>!
                  </p>
                  <button 
                    onClick={handleStart}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                     Mulai Game
                  </button>
              </motion.div>
            )}

            {/* PLAYING SCREEN */}
            {gameState === 'playing' && (
               <motion.div 
                  key="playing"
                  className="flex-1 flex flex-col p-6 md:p-10"
               >
                  {/* Stats Bar */}
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SKOR</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{score}</span>
                     </div>
                     
                     {/* Timer */}
                     <div className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-colors",
                         timeLeft < 10 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40 text-red-600" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                     )}>
                         <Timer className={cn("w-5 h-5", timeLeft < 10 && "animate-pulse")} />
                         <span className="text-xl font-black font-mono w-8 text-center">{timeLeft}s</span>
                     </div>

                     <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">COMBO</span>
                        <span className={cn(
                            "text-3xl font-black font-mono transition-colors",
                            combo > 2 ? "text-amber-500" : "text-slate-300 dark:text-slate-700"
                        )}>x{combo}</span>
                     </div>
                  </div>

                  {/* Question Area */}
                  <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px] mb-8">
                      {/* Feedback Layer */}
                      <AnimatePresence>
                         {feedback && (
                            <motion.div 
                               initial={{ scale: 0.5, opacity: 0 }}
                               animate={{ scale: 1.5, opacity: 1 }}
                               exit={{ scale: 2, opacity: 0 }}
                               className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                            >
                               {feedback.type === 'correct' ? (
                                   <CheckCircle className="w-32 h-32 text-emerald-500/20 dark:text-emerald-400/20" />
                               ) : (
                                   <XCircle className="w-32 h-32 text-red-500/20 dark:text-red-400/20" />
                               )}
                            </motion.div>
                         )}
                      </AnimatePresence>

                      <div className="w-full max-w-xl text-center py-12 px-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] relative">
                         <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Sparkles className="w-12 h-12" />
                         </div>
                         <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white arabic-question leading-tight">
                            {currentQuestion?.text}
                         </h1>
                      </div>
                  </div>

                  {/* Answer Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {types.map((type) => (
                        <button
                           key={type.id}
                           onClick={() => handleAnswer(type.id)}
                           className={cn(
                              "group relative overflow-hidden py-6 rounded-2xl border-2 transition-all active:scale-95",
                              type.id === 'isim' ? "bg-cyan-50 dark:bg-cyan-900/10 border-cyan-100 dark:border-cyan-900/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20" :
                              type.id === 'fiil' ? "bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/30 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20" :
                              "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
                           )}
                        >
                           <div className="flex flex-col items-center relative z-10">
                              <span className={cn("text-2xl font-black uppercase tracking-widest mb-1", type.text)}>
                                 {type.label}
                              </span>
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                 {type.subLabel}
                              </span>
                           </div>
                        </button>
                     ))}
                  </div>

               </motion.div>
            )}

            {/* FINISHED SCREEN */}
            {gameState === 'finished' && (
               <motion.div 
                  key="finished"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 text-center"
               >
                   <Trophy className="w-24 h-24 text-amber-500 mb-6 animate-bounce" />
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Permainan Selesai!</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Kamu berhasil mengumpulkan</p>
                   
                   <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 min-w-[200px] mb-8 border border-slate-200 dark:border-slate-700">
                      <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">TOTAL SKOR</span>
                      <span className="text-6xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter">{score}</span>
                   </div>

                   <div className="flex gap-4">
                      <button 
                         onClick={handleStart}
                         className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                         Main Lagi
                      </button>
                   </div>
               </motion.div>
            )}

          </AnimatePresence>
       </div>
    </div>
  );
};

// Simple Icon Component (since we need it inside)
const PuzzleIcon = (props) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19.439 15.424a1 1 0 0 1-1.026.06c-1.353-.666-3.085-.143-3.768 1.258-.696 1.431-.2 3.193 1.157 3.96a1 1 0 1 1-1.004 1.733c-2.396-1.355-3.235-4.402-1.928-6.84 1.253-2.336 4.14-3.328 6.56-2.174a1 1 0 0 1 .009 1.996Z"/>
      <path d="m14.28 10.74-.298.66a1 1 0 1 1-1.826-.826l.298-.66a1 1 0 1 1 1.827.825Z"/>
      <path d="M11 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
      <path d="M7 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
    </svg>
);

export default WordClassificationGame;
