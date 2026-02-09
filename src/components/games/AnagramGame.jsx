import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Check, 
  HelpCircle, 
  Shuffle, 
  Sparkles, 
  MoveRight, 
  Trophy,
  RefreshCcw,
  Undo2,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '../../utils/cn';
import confetti from 'canvas-confetti';

const AnagramGame = ({ questions = [], title = "Anagram" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]); // Array of { id, char } or null
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

  // Helper to detect Arabic
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
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
          colors: ['#0d9488', '#14b8a6', '#5eead4']
        });
      }
      return;
    }
    const q = questions[index];
    
    // Normalisasi untuk kata Arab: hapus spasi dan karakter non-huruf
    let answer = q.answer.replace(/\s/g, '');
    
    // Untuk kata Arab, kita tidak perlu uppercase karena Arab tidak memiliki konsep uppercase/lowercase
    // Tapi kita tetap normalisasi untuk konsistensi
    if (!isArabic(answer)) {
      answer = answer.toUpperCase();
    }
    
    // Pecah kata menjadi array huruf individual
    // Filter hanya karakter yang valid (huruf Arab: \u0600-\u06FF atau huruf Latin: A-Z, a-z)
    const letters = answer.split('')
      .filter(char => {
        // Terima huruf Arab atau huruf Latin
        return /[\u0600-\u06FF]/.test(char) || /[A-Za-z]/.test(char);
      })
      .map((char, i) => ({ id: `${index}-${i}`, char }));
    
    // Scramble
    let scrambled = [...letters].sort(() => Math.random() - 0.5);
    // Ensure it's actually scrambled
    const originalWord = letters.map(l => l.char).join('');
    if (scrambled.map(l => l.char).join('') === originalWord && originalWord.length > 1) {
       scrambled = [...letters].sort(() => Math.random() - 0.5);
    }

    setCurrentQuestion(q);
    setCurrentIndex(index);
    setScrambledLetters(scrambled);
    setSelectedLetters(Array(letters.length).fill(null));
    setIsCorrect(false);
  };

  const handleLetterClick = (letter, source) => {
    if (isCorrect) return;
    playSound(clickSound);

    if (source === 'pool') {
      const firstEmptyIndex = selectedLetters.findIndex(l => l === null);
      if (firstEmptyIndex !== -1) {
        const newSelected = [...selectedLetters];
        newSelected[firstEmptyIndex] = letter;
        setSelectedLetters(newSelected);

        const newScrambled = scrambledLetters.filter(l => l.id !== letter.id);
        setScrambledLetters(newScrambled);
        checkAnswer(newSelected);
      }
    } else {
      const newSelected = [...selectedLetters];
      const index = newSelected.findIndex(l => l && l.id === letter.id);
      if (index !== -1) {
        newSelected[index] = null;
        setSelectedLetters(newSelected);
        setScrambledLetters(prev => [...prev, letter]);
      }
    }
  };

  const checkAnswer = (currentSelected) => {
    if (currentSelected.some(l => l === null)) return;

    const userAnswer = currentSelected.map(l => l.char).join('');
    
    let correctAnswer = currentQuestion.answer.replace(/\s/g, '');
    if (!isArabic(correctAnswer)) {
      correctAnswer = correctAnswer.toUpperCase();
    }
    
    // Filter hanya karakter yang valid untuk perbandingan
    correctAnswer = correctAnswer.split('')
      .filter(char => /[\u0600-\u06FF]/.test(char) || /[A-Za-z]/.test(char))
      .join('');

    if (userAnswer === correctAnswer) {
      setIsCorrect(true);
      playSound(successSound);
      
      // Auto-advance ke soal berikutnya setelah 1.5 detik
      setTimeout(() => {
        setScore(s => s + 10);
        loadQuestion(currentIndex + 1);
      }, 1500);
    } else {
      playSound(errorSound);
    }
  };

  const handleNext = () => {
    playSound(clickSound);
    setScore(s => s + 10);
    loadQuestion(currentIndex + 1);
  };

  const handleReset = () => {
     playSound(clickSound);
     if (!currentQuestion) return;
     
     let answer = currentQuestion.answer.replace(/\s/g, '');
     if (!isArabic(answer)) {
       answer = answer.toUpperCase();
     }
     
     // Filter hanya karakter yang valid
     const letters = answer.split('')
       .filter(char => /[\u0600-\u06FF]/.test(char) || /[A-Za-z]/.test(char))
       .map((char, i) => ({ id: `${currentIndex}-${i}`, char }));
       
     setScrambledLetters(letters.sort(() => Math.random() - 0.5));
     setSelectedLetters(Array(letters.length).fill(null));
     setIsCorrect(false);
  };

  if (!questions || questions.length === 0) {
     return (
        <div className="p-12 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Belum ada pertanyaan anagram.</p>
        </div>
     );
  }

  if (showCelebration) {
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
        
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Luar Biasa! 🎉</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-lg leading-relaxed">
          Kamu telah berhasil menyusun semua kata dengan sempurna!
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-10 mb-10 border border-slate-100 dark:border-white/5 w-full max-w-sm shadow-inner group">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-teal-500 transition-colors">Total Poin</div>
            <div className="text-7xl font-black text-teal-600 dark:text-teal-400 tracking-tighter tabular-nums">
              {score}
            </div>
        </div>

        <button 
          onClick={() => {
            setScore(0);
            setShowCelebration(false);
            loadQuestion(0);
          }}
          className="w-full max-w-sm py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 overflow-hidden group"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          <span>Main Lagi</span>
        </button>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 md:px-0 py-6">
      <div className="relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden select-none">
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600" />

        {/* Header Context */}
        <div className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-6 bg-slate-50/50 dark:bg-black/10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
              <Shuffle className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Misi Anagram</span>
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
            <div className="px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 font-black text-xs text-slate-500 uppercase tracking-widest">
               Kata {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {questions.length}
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

        <div className="p-8 md:p-14 flex flex-col items-center">
            
            {/* Clue Area */}
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-12 text-center max-w-xl"
            >
                <div className="inline-block px-4 py-1.5 bg-teal-500/10 dark:bg-teal-500/20 rounded-full mb-4">
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">Petunjuk</span>
                </div>
                <h3 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-white leading-relaxed">
                    {currentQuestion.clue || "Susun huruf menjadi kata yang benar"}
                </h3>
            </motion.div>

            {/* Answer Slots */}
            <div 
               className={cn(
                  "flex flex-wrap gap-2 md:gap-4 justify-center mb-10 md:mb-16 min-h-[60px] md:min-h-[80px] w-full",
                  isArabic(currentQuestion.answer) ? 'flex-row-reverse' : ''
               )}
            >
                {selectedLetters.map((letter, idx) => (
                    <div key={`slot-${idx}`} className="relative">
                        <motion.button
                            onClick={() => letter && handleLetterClick(letter, 'slot')}
                            disabled={!letter || isCorrect}
                            layoutId={letter ? letter.id : `empty-${idx}`}
                            className={cn(
                                "w-[clamp(3rem,11vw,4rem)] h-[clamp(3.5rem,14vw,5rem)] rounded-xl md:rounded-2xl text-xl md:text-3xl font-black flex items-center justify-center transition-all duration-300",
                                letter 
                                    ? isCorrect 
                                        ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-105' 
                                        : 'bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-lg'
                                    : 'bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-inner'
                            )}
                        >
                            <span className={cn(letter && isArabic(letter.char) ? 'arabic-content transition-all' : 'tracking-tighter')}>
                               {letter ? letter.char : ''}
                            </span>
                        </motion.button>
                        {isCorrect && idx === 0 && (
                           <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 md:border-4 border-white dark:border-slate-900 z-10"
                           >
                              <Check className="w-3 h-3 md:w-4 md:h-4" strokeWidth={4} />
                           </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pool (Scrambled Letters) */}
            <div className="w-full max-w-2xl bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm p-5 md:p-10 rounded-3xl md:rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block"> Pilihan Huruf </div>
                
                <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                    <AnimatePresence>
                        {scrambledLetters.map((letter) => (
                            <motion.button 
                                key={letter.id}
                                layoutId={letter.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                whileHover={{ y: -3, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleLetterClick(letter, 'pool')}
                                disabled={isCorrect}
                                className={cn(
                                   "w-11 h-11 md:w-14 md:h-14 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-md border-2 border-slate-100 dark:border-slate-700 text-lg md:text-xl font-black text-slate-700 dark:text-slate-100 flex items-center justify-center transition-colors hover:border-orange-400 group",
                                   isArabic(letter.char) ? 'arabic-content transition-all' : ''
                                )}
                            >
                                {letter.char}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                    {scrambledLetters.length === 0 && !isCorrect && (
                       <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] md:text-xs font-bold text-slate-400 italic py-2 md:py-4 flex items-center gap-2"
                       >
                          <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" /> Semua huruf telah terpasang
                       </motion.div>
                    )}
                </div>
            </div>

            {/* Actions Context */}
            <div className="mt-12 flex flex-col md:flex-row items-center gap-6 w-full justify-center">
                <AnimatePresence mode="wait">
                  {!isCorrect ? (
                     <motion.button 
                        key="reset-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
                     >
                        <Undo2 className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                        Reset Kata
                     </motion.button>
                  ) : (
                     <motion.button 
                        key="next-btn"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        onClick={handleNext}
                        className="w-full sm:w-80 py-5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 group px-12"
                     >
                        <span>{currentIndex + 1 < questions.length ? 'Kata Berikutnya' : 'Selesaikan Misi'}</span>
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

// Internal icons handled by Lucide React


export default AnagramGame;
