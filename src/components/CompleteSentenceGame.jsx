import React, { useState, useEffect } from 'react';
import { 
  Check, 
  RotateCcw, 
  MessageSquare, 
  Sparkles, 
  Trophy, 
  RefreshCcw, 
  MoveRight, 
  Undo2,
  HelpCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '../utils/cn';
import confetti from 'canvas-confetti';

const CompleteSentenceGame = ({ questions = [], title = "Lengkapi Kalimat" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSegments, setCurrentSegments] = useState([]); // Array of { text, isBlank, id, answer }
  const [wordBank, setWordBank] = useState([]); // Array of { id, text, status: 'pool' | 'placed' }
  const [userSlots, setUserSlots] = useState({}); // Map slotId -> word object
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const muted = window.localStorage.getItem('gameMuted') === 'true';
    setIsMuted(muted);
  }, []);

  // Audio Refs
  const successSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3'));
  const errorSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/958/958-preview.mp3'));
  const clickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

  useEffect(() => {
    if (questions && questions.length > 0) {
      loadQuestion(0);
    }
  }, [questions]);

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

  const loadQuestion = (index) => {
    if (index >= questions.length) {
      setShowCelebration(true);
      if (score >= (questions.length * 10) * 0.7) {
        playSound(successSound);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#38bdf8', '#7dd3fc']
        });
      }
      return;
    }

    const q = questions[index];
    const text = q.text || "";
    
    // Parse text: "Hello {world} pattern"
    const parts = text.split(/(\{.*?\})/g);
    
    const segments = [];
    const bank = [];
    let slotCounter = 0;

    parts.forEach((part, i) => {
        if (part.startsWith('{') && part.endsWith('}')) {
            const answer = part.slice(1, -1); 
            const slotId = `slot-${index}-${slotCounter++}`;
            segments.push({ type: 'blank', id: slotId, answer, index: i });
            bank.push({ id: `word-${slotId}`, text: answer, status: 'pool' });
        } else if (part.trim() !== '' || part === ' ') {
            segments.push({ type: 'text', text: part, index: i });
        }
    });

    // Scramble bank
    const scrambledBank = [...bank].sort(() => Math.random() - 0.5);

    setCurrentSegments(segments);
    setWordBank(scrambledBank);
    setUserSlots({});
    setIsCorrect(false);
    setCurrentIndex(index);
  };

  const handleWordClick = (word) => {
    if (isCorrect) return;
    playSound(clickSound);

    if (word.status === 'pool') {
        // Find first empty slot
        const firstEmptySlot = currentSegments.find(
            seg => seg.type === 'blank' && !userSlots[seg.id]
        );
        
        if (firstEmptySlot) {
            const newSlots = { ...userSlots, [firstEmptySlot.id]: word };
            const newBank = wordBank.map(w => w.id === word.id ? { ...w, status: 'placed' } : w);
            
            setUserSlots(newSlots);
            setWordBank(newBank);
            checkAnswer(newSlots);
        }
    }
  };

  const handleSlotClick = (segment) => {
      if (isCorrect) return;
      playSound(clickSound);
      const word = userSlots[segment.id];
      if (word) {
          const newSlots = { ...userSlots };
          delete newSlots[segment.id];
          
          const newBank = wordBank.map(w => w.id === word.id ? { ...w, status: 'pool' } : w);
          
          setUserSlots(newSlots);
          setWordBank(newBank);
      }
  };

  const checkAnswer = (currentSlots) => {
      const slots = currentSegments.filter(s => s.type === 'blank');
      const allFilled = slots.every(s => currentSlots[s.id]);

      if (!allFilled) {
        setIsCorrect(false); // Ensure isCorrect is false if not all filled
        return;
      }

      const allCorrect = slots.every(s => {
          const placedWord = currentSlots[s.id];
          return placedWord && placedWord.text === s.answer;
      });

      if (allFilled) {
        if (allCorrect) {
            setIsCorrect(true);
            setScore(prev => prev + 10);
            playSound(successSound);
        } else {
            setIsCorrect(false); // Explicitly set to false if all filled but incorrect
            playSound(errorSound);
        }
    }
  };

  const handleNext = () => {
    playSound(clickSound);
    loadQuestion(currentIndex + 1);
  };

  const handleReset = () => {
    playSound(clickSound);
    setUserSlots({});
    setWordBank(prev => prev.map(w => ({ ...w, status: 'pool' })));
    setIsCorrect(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-12 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Belum ada pertanyaan misi.</p>
      </div>
    );
  }

  if (showCelebration) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border-4 border-blue-500/20 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
        <motion.div 
          initial={{ rotate: -15, scale: 0.5 }}
          animate={{ rotate: 12, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 transform"
        >
           <Trophy className="w-14 h-14 text-white" />
        </motion.div>
        
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Misi Berhasil! 🎉</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-lg leading-relaxed">
          Kamu sangat hebat dalam melengkapi kalimat!
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-10 mb-10 border border-slate-100 dark:border-white/5 w-full max-w-sm shadow-inner group">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-blue-500 transition-colors">Total Poin</div>
            <div className="text-7xl font-black text-blue-600 dark:text-blue-400 tracking-tighter tabular-nums">
              {score}
            </div>
        </div>

        <button 
          onClick={() => {
            playSound(clickSound);
            setScore(0);
            setShowCelebration(false);
            loadQuestion(0);
          }}
          className="w-full max-w-sm py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 overflow-hidden group"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          <span>Mulai Lagi</span>
        </button>
      </motion.div>
    );
  }

  const isArabic = (text) => text && /[\u0600-\u06FF]/.test(text);
  const isRTL = questions[currentIndex]?.text && isArabic(questions[currentIndex].text);

  if (!currentSegments.length) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 md:px-0 py-6">
      <div className="relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden select-none">
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-sky-500 to-indigo-500" />

        {/* Header Context */}
        <div className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-6 bg-slate-50/50 dark:bg-black/10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Lengkapi Kalimat</span>
                 <Sparkles className="w-3 h-3 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-500 hover:text-sky-500 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 font-black text-xs text-slate-500 uppercase tracking-widest">
               Kalimat {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
             className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
           />
        </div>

        <div className="p-8 md:p-14 flex flex-col items-center">
            
            {/* Sentence Display Area */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={cn(
                  "text-2xl md:text-3xl lg:text-4xl leading-relaxed text-slate-800 dark:text-white text-center mb-16 w-full flex flex-wrap gap-x-2 md:gap-x-4 gap-y-6 items-center justify-center",
                  isRTL ? 'font-arabic' : 'tracking-tight font-bold'
               )}
               dir={isRTL ? 'rtl' : 'ltr'}
            >
                {currentSegments.map((seg, i) => {
                    if (seg.type === 'text') {
                        return <span key={i} className="py-2">{seg.text}</span>;
                    } else {
                        const filledWord = userSlots[seg.id];
                        return (
                            <motion.button 
                                key={seg.id}
                                layoutId={filledWord ? filledWord.id : `slot-${seg.id}`}
                                onClick={() => handleSlotClick(seg)}
                                className={cn(
                                    "relative inline-flex items-center justify-center px-4 md:px-6 h-12 md:h-16 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 min-w-[100px] md:min-w-[140px]",
                                    filledWord 
                                        ? isCorrect 
                                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-slate-800 border-blue-400 text-slate-900 dark:text-white shadow-xl ring-4 ring-blue-500/10'
                                        : 'bg-slate-100 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700 shadow-inner'
                                )}
                            >
                                <span className={cn(
                                   "text-xl md:text-2xl",
                                   isRTL ? 'font-arabic pt-2' : 'font-black'
                                )}>
                                   {filledWord ? filledWord.text : ''}
                                </span>
                                {!filledWord && !isCorrect && (
                                   <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                      <div className="w-1 h-1 rounded-full bg-slate-400 mx-1" />
                                      <div className="w-1 h-1 rounded-full bg-slate-400 mx-1" />
                                      <div className="w-1 h-1 rounded-full bg-slate-400 mx-1" />
                                   </div>
                                )}
                            </motion.button>
                        );
                    }
                })}
            </motion.div>

            {/* Word Bank Container */}
            <div className="w-full max-w-3xl bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pilihan Kata</div>
                
                <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                    <AnimatePresence>
                        {wordBank.map((word) => (
                            word.status === 'pool' && (
                                <motion.button
                                    key={word.id}
                                    layoutId={word.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleWordClick(word)}
                                    disabled={isCorrect}
                                    className={cn(
                                        "px-5 md:px-8 py-3 md:py-4 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-md border-2 border-slate-100 dark:border-slate-700 font-bold transition-all text-lg md:text-xl text-slate-700 dark:text-slate-100 hover:border-blue-400 group",
                                        isRTL ? 'font-arabic pt-4' : ''
                                    )}
                                >
                                    {word.text}
                                </motion.button>
                            )
                        ))}
                    </AnimatePresence>
                </div>
                
                {wordBank.every(w => w.status === 'placed') && !isCorrect && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] md:text-xs font-bold text-slate-400 italic text-center py-4 uppercase tracking-widest"
                     >
                        Semua kata telah diletakkan
                     </motion.div>
                )}
            </div>

            {/* Control Actions */}
            <div className="mt-12 flex flex-col md:flex-row items-center gap-6 w-full justify-center">
                <AnimatePresence mode="wait">
                  {isCorrect ? (
                     <motion.button 
                        key="next-btn"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        onClick={handleNext}
                        className="w-full sm:w-80 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 group px-12"
                     >
                        <span>{currentIndex + 1 < questions.length ? 'Kalimat Berikutnya' : 'Selesaikan Misi'}</span>
                        <MoveRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                     </motion.button>
                  ) : (
                     <motion.button 
                        key="reset-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
                     >
                        <Undo2 className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                        Mulai Ulang Kalimat
                     </motion.button>
                  )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteSentenceGame;
