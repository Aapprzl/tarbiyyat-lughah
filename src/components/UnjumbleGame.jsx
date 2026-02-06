import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, ArrowRightLeft, Sparkles, Lightbulb, Puzzle, Info, ChefHat, Trophy, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../utils/cn';
import confetti from 'canvas-confetti';

const UnjumbleGame = ({ data }) => {
  const [gameState, setGameState] = useState('playing'); // playing, finished
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  
  const [poolWords, setPoolWords] = useState([]); // Array of { id, text }
  const [selectedWords, setSelectedWords] = useState([]); // Array of { id, text }
  
  const [isCorrect, setIsCorrect] = useState(null); // null, true, false
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Refs
  const successSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'));
  const errorSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'));
  const clickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

  useEffect(() => {
     const muted = window.localStorage.getItem('gameMuted') === 'true';
     setIsMuted(muted);
  }, []);

  const playSound = (soundRef) => {
     if (isMuted) return;
     soundRef.current.currentTime = 0;
     soundRef.current.play().catch(e => console.log('Audio Blocked'));
  }

  // Helper to detect Arabic
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

  useEffect(() => {
    if (data?.questions && data.questions.length > 0) {
      setQuestions(data.questions);
      loadQuestion(0, data.questions);
    }
  }, [data]);

  const loadQuestion = (index, qs = questions) => {
    if (index >= qs.length) {
      handleFinish();
      return;
    }

    const q = qs[index];
    const originalText = q.text || "";
    const words = originalText.split(/\s+/).filter(w => w.trim() !== '');
    
    const wordObjects = words.map((text, i) => ({
        id: `${index}-${i}-${Date.now()}`,
        text: text
    }));

    // Scramble
    let scrambled = [...wordObjects].sort(() => Math.random() - 0.5);
    // Ensure not already sorted (if len > 1)
    if (scrambled.map(w => w.text).join(' ') === originalText && words.length > 1) {
        scrambled = [...wordObjects].sort(() => Math.random() - 0.5);
    }

    setCurrentQuestionIndex(index);
    setPoolWords(scrambled);
    setSelectedWords([]);
    setIsCorrect(null);
    setGameState('playing');
  };

  const handleWordClick = (word, source) => {
    playSound(clickSound);
    if (isCorrect === true) return; // Prevent creating mess after correct

    setIsCorrect(null); // Reset validation state on interaction

    if (source === 'pool') {
        const newPool = poolWords.filter(w => w.id !== word.id);
        const newSelected = [...selectedWords, word];
        setPoolWords(newPool);
        setSelectedWords(newSelected);
    } else {
        const newSelected = selectedWords.filter(w => w.id !== word.id);
        const newPool = [...poolWords, word];
        setSelectedWords(newSelected);
        setPoolWords(newPool);
    }
  };

  const checkAnswer = () => {
      const currentQuestion = questions[currentQuestionIndex];
      const targetSentence = currentQuestion.text.trim().split(/\s+/).join(' ');
      const formedSentence = selectedWords.map(w => w.text).join(' ');

      if (formedSentence === targetSentence) {
          setIsCorrect(true);
          setScore(s => s + 10);
          playSound(successSound);
          
          setTimeout(() => {
             if (currentQuestionIndex + 1 < questions.length) {
                 loadQuestion(currentQuestionIndex + 1);
             } else {
                 handleFinish();
             }
          }, 1500);
      } else {
          setIsCorrect(false);
          playSound(errorSound);
      }
  };

  const handleFinish = () => {
    setGameState('finished');
    if (score > 0) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleReset = () => {
      loadQuestion(currentQuestionIndex);
  };

  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      if (newState) window.localStorage.setItem('gameMuted', 'true');
      else window.localStorage.removeItem('gameMuted');
  };

  if (!data || questions.length === 0) return null;

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans">
       <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col">
          
          {/* Decorative Top Border */}
          <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-indigo-500"></div>

          {/* Header Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
             <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <Puzzle className="w-5 h-5" />
                  </div>
                  <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">GAME GRAMATIKAL</span>
                      <h2 className="font-bold text-slate-900 dark:text-white leading-none">
                          {data.title || 'Susun Kalimat'}
                      </h2>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button 
                     onClick={toggleMute}
                     className={cn(
                        "p-2 rounded-full transition-all",
                        isMuted ? "text-slate-400 bg-slate-100 dark:bg-white/5 hover:text-red-500" : "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100" 
                     )}
                  >
                     {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold text-slate-500">
                      {currentQuestionIndex + 1} / {questions.length}
                  </div>
              </div>
          </div>

          <AnimatePresence mode="wait">
             {gameState === 'playing' && currentQ && (
                <motion.div 
                   key="playing"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="flex-1 flex flex-col p-4 md:p-8"
                >
                    {/* Title & Subtitle */}
                    <div className="text-center mb-6 md:mb-10">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 font-arabic leading-tight">
                           {data.subtitle || 'Susunlah Kalimat Arab'}
                        </h1>
                        
                        {currentQ.pattern && (
                            <div className="inline-block mt-2 md:mt-4 px-4 md:px-6 py-2 md:py-3 bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                                   Pola: {currentQ.pattern}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col-reverse md:grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
                        {/* Pool Area (Bottom on Mobile) */}
                        <div className="flex flex-col">
                            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                               Kata Acak (Pilih Kata)
                            </h3>
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-dashed border-emerald-100 dark:border-emerald-500/20 min-h-[120px] md:min-h-[160px] flex flex-wrap content-start gap-2 md:gap-3">
                                {poolWords.map((word) => (
                                    <motion.button
                                       layoutId={word.id}
                                       key={word.id}
                                       onClick={() => handleWordClick(word, 'pool')}
                                       className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-lg md:text-xl font-bold font-arabic shadow-sm border border-emerald-200 dark:border-emerald-500/30 hover:scale-105 active:scale-95 transition-transform"
                                    >
                                       {word.text}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Result Area (Top on Mobile) */}
                        <div className="flex flex-col">
                            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2 md:justify-end">
                               Susunan Kalimat (Kanan ke Kiri)
                            </h3>
                            <div className={cn(
                                "flex-1 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 min-h-[120px] md:min-h-[160px] flex flex-wrap content-start items-center justify-end gap-2 md:gap-3 transition-colors",
                                isCorrect === true ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" :
                                isCorrect === false ? "border-red-500 bg-red-50 dark:bg-red-900/20" :
                                "border-slate-200 dark:border-slate-700"
                            )}>
                                {selectedWords.length === 0 ? (
                                    <span className="w-full text-center text-slate-300 dark:text-slate-600 font-medium italic text-xs md:text-base">
                                        Ketuk kata untuk menyusun
                                    </span>
                                ) : (
                                    selectedWords.map((word) => (
                                        <motion.button
                                           layoutId={word.id}
                                           key={word.id}
                                           onClick={() => handleWordClick(word, 'selected')}
                                           className="bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-lg md:text-xl font-bold font-arabic shadow-sm border border-slate-200 dark:border-slate-600 hover:text-red-500 hover:border-red-200 transition-colors"
                                        >
                                           {word.text}
                                        </motion.button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hints & Actions */}
                    <div className="flex flex-col items-center gap-6">
                        {currentQ.clue && (
                            <div className="flex items-center gap-2 text-amber-500 text-sm font-medium bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-full">
                                <Lightbulb className="w-4 h-4" />
                                <span>Tips: {currentQ.clue}</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                               onClick={handleReset}
                               className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
                               title="Reset"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button 
                               onClick={checkAnswer}
                               disabled={selectedWords.length === 0}
                               className="px-10 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Cek Jawaban
                            </button>
                        </div>
                    </div>
                </motion.div>
             )}

             {gameState === 'finished' && (
                <motion.div 
                   key="finished"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                >
                    <Trophy className="w-24 h-24 text-amber-500 mb-6 animate-bounce" />
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Permainan Selesai!</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Kamu berhasil menyelesaikan semua tantangan.</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 min-w-[200px] mb-8 border border-slate-200 dark:border-slate-700">
                       <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">TOTAL SKOR</span>
                       <span className="text-6xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter">{score}</span>
                    </div>

                    <div className="flex gap-4">
                       <button 
                          onClick={() => window.location.reload()}
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

export default UnjumbleGame;
