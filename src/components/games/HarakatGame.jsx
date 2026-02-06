import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Keyboard, ArrowLeft, RefreshCcw, CheckCircle2, AlertCircle, X, ChevronUp, Volume2, VolumeX, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const ARABIC_KEYBOARD = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ذ'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ئ'],
  ['ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'أ', 'إ', 'آ'],
];

const HARAKAT = [
  { char: '\u064E', name: 'Fathah' },
  { char: '\u064F', name: 'Dammah' },
  { char: '\u0650', name: 'Kasrah' },
  { char: '\u064B', name: 'Fathatain' },
  { char: '\u064C', name: 'Dammatain' },
  { char: '\u064D', name: 'Kasratain' },
  { char: '\u0651', name: 'Shaddah' },
  { char: '\u0652', name: 'Sukun' },
];

const HarakatGame = ({ data }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [gameState, setGameState] = useState('playing'); // playing, finished
  const [score, setScore] = useState(0);
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

  // Initialize and shuffle questions
  useEffect(() => {
    if (data.questions) {
      shuffleAndSetQuestions(data.questions);
    }
  }, [data.questions]);

  const shuffleAndSetQuestions = (qs) => {
    const shuffled = [...qs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setUserAnswer('');
    setIsCorrect(null);
    setGameState('playing');
  };

  const currentQ = questions[currentIdx];

  // Helper to remove harakat for display
  const removeHarakat = (text) => {
    return text.replace(/[\u064B-\u0652\u0651]/g, '');
  };

  const handleKeyClick = (char) => {
    playSound(clickSound);
    setUserAnswer(prev => prev + char);
    setIsCorrect(null);
  };

  const handleDelete = () => {
    playSound(clickSound);
    setUserAnswer(prev => prev.slice(0, -1));
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (!userAnswer || !currentQ) return;
    
    const normalizedTarget = currentQ.text.trim();
    const normalizedUser = userAnswer.trim();

    if (normalizedUser === normalizedTarget) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
      playSound(successSound);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#14b8a6', '#5eead4']
      });

      setTimeout(() => {
        if (currentIdx < questions.length - 1) {
          setCurrentIdx(prev => prev + 1);
          setUserAnswer('');
          setIsCorrect(null);
        } else {
          setGameState('finished');
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      playSound(errorSound);
      setTimeout(() => setIsCorrect(null), 1000);
    }
  };

  const handleReset = () => {
    playSound(clickSound);
    shuffleAndSetQuestions(data.questions);
    setScore(0);
  };

  const handleManualShuffle = () => {
    playSound(clickSound);
    shuffleAndSetQuestions(data.questions);
  };

  if (!currentQ && gameState !== 'finished') return null;

  if (gameState === 'finished') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center shadow-xl border border-slate-200 dark:border-white/10 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-teal-100 dark:bg-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Misi Selesai!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Luar biasa! Kamu telah melengkapi semua harakat dengan benar.</p>
        
        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-white/5">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Skor Akhir</div>
           <div className="text-5xl font-black text-teal-500">{score}/{questions.length}</div>
        </div>

        <button 
          onClick={handleReset}
          className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-3 active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" /> Main Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
        {/* Animated Top Bar */}
        <div className="h-2 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 animate-gradient-x" />

        <div className={cn(
          "flex-1 p-6 md:p-10 transition-all duration-500",
          showKeyboard ? "pb-4 md:pb-6" : "pb-10 md:pb-20"
        )}>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-white/5 p-4 md:p-8 gap-4 bg-slate-50/50 dark:bg-black/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                  <Keyboard className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Misi Harakat</span>
                    <Sparkles className="w-2 md:w-3 h-2 md:h-3 text-teal-400" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                    Lengkapi Harakat
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={toggleMute}
                  className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-500 hover:text-orange-500 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                <div className="px-4 md:px-6 py-2 md:py-3 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 font-black text-[10px] md:text-xs text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  Soal {currentIdx + 1} <span className="text-slate-300 mx-1">/</span> {questions.length}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-12">
              <div className="mb-8 md:mb-12 text-center max-w-xl mx-auto">
                <div className="inline-block px-3 md:px-4 py-1.5 bg-teal-500/10 dark:bg-teal-500/20 rounded-full mb-3 md:mb-4">
                  <span className="text-[8px] md:text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">{data.category || 'Misi Utama'}</span>
                </div>
                <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tighter">
                  Lengkapi <span className="text-teal-500 italic">Harakat</span>
                </h1>
              </div>
            {!showKeyboard && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-slate-500 dark:text-slate-400 text-xs md:text-base font-medium max-w-md mx-auto leading-relaxed"
              >
                {data.subtitle || 'Uji kemampuan bahasa Arabmu dengan mengisi harakat yang hilang pada kata di bawah ini.'}
              </motion.p>
            )}
          </div>

          {/* Game Area */}
          <div className={cn(
            "max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 transition-all duration-500",
            showKeyboard ? "mb-6" : "mb-12"
          )}>
            {/* Question Card */}
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2 flex items-center justify-between">
                <span>Soal</span>
                <button 
                  onClick={handleManualShuffle}
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2 py-0.5 rounded-full flex items-center gap-1 text-[8px] md:text-[10px] cursor-pointer"
                >
                   <RefreshCcw className="w-2.5 h-2.5" /> Acak
                </button>
              </label>
              <div className={cn(
                "bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-500",
                showKeyboard ? "p-4 md:p-6 min-h-[100px] md:min-h-[140px]" : "p-8 min-h-[160px] md:min-h-[200px]"
              )}>
                 <div className={cn(
                   "font-bold font-arabic text-slate-700 dark:text-slate-200 transition-all",
                   showKeyboard ? "text-4xl md:text-5xl" : "text-6xl md:text-7xl"
                 )}>
                    {removeHarakat(currentQ.text)}
                 </div>
              </div>
            </div>

            {/* Answer Card */}
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Jawabanmu</label>
              <div className={cn(
                "flex-1 bg-white dark:bg-slate-800 rounded-3xl border-2 flex items-center justify-center transition-all duration-500",
                showKeyboard ? "p-4 md:p-6 min-h-[100px] md:min-h-[140px]" : "p-8 min-h-[160px] md:min-h-[200px]",
                isCorrect === true ? "border-emerald-500 ring-4 ring-emerald-500/10" :
                isCorrect === false ? "border-red-500 animate-shake" :
                "border-slate-200 dark:border-slate-700 shadow-inner"
              )}>
                 {userAnswer ? (
                   <div className={cn(
                     "font-bold font-arabic text-slate-900 dark:text-white drop-shadow-sm transition-all",
                     showKeyboard ? "text-4xl md:text-5xl" : "text-6xl md:text-7xl"
                   )}>
                      {userAnswer}
                   </div>
                 ) : (
                   <div className="flex gap-2">
                       {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" style={{ animationDelay: `${i*150}ms` }} />)}
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => {
                playSound(clickSound);
                setShowKeyboard(!showKeyboard);
              }}
              className="group flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all"
            >
              <Keyboard className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                {showKeyboard ? 'Selesai Mengetik' : 'Tampilkan Keyboard'}
              </span>
              <ChevronUp className={cn("w-3 h-3 text-slate-400 transition-transform", !showKeyboard && "rotate-180")} />
            </button>

            {!showKeyboard && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                disabled={!userAnswer}
                onClick={checkAnswer}
                className={cn(
                  "w-full max-w-sm py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale",
                  isCorrect === true ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-orange-500/25"
                )}
              >
                Cek Jawaban <CheckCircle2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Custom Virtual Keyboard */}
        <AnimatePresence>
          {showKeyboard && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 shadow-inner overflow-hidden"
            >
              <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-3">
                <div className="flex items-center justify-between mb-1">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1 px-0.5 h-3 bg-teal-500 rounded-full" />
                      Arabic Keyboard
                   </div>
                   <button onClick={() => {
                      playSound(clickSound);
                      setShowKeyboard(false);
                    }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-slate-400" />
                   </button>
                </div>

                {/* Harakat Row */}
                <div className="grid grid-cols-8 gap-1 md:gap-2 mb-2">
                   {HARAKAT.map((h, i) => (
                      <button 
                        key={i}
                        onClick={() => handleKeyClick(h.char)}
                        className="h-9 md:h-12 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-lg md:rounded-xl text-lg md:text-2xl font-bold font-arabic hover:scale-105 active:scale-95 transition-all shadow-sm border border-orange-200 dark:border-orange-500/20"
                        title={h.name}
                      >
                        {h.char}
                      </button>
                   ))}
                </div>

                {/* Character Rows */}
                {ARABIC_KEYBOARD.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex justify-center gap-1 md:gap-2">
                    {row.map((char, charIdx) => (
                      <button 
                        key={charIdx}
                        onClick={() => handleKeyClick(char)}
                        className="flex-1 h-9 md:h-12 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg md:rounded-xl text-base md:text-xl font-bold font-arabic hover:scale-105 active:scale-90 transition-all shadow-sm border border-slate-200 dark:border-slate-700 min-w-[20px]"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Special Row */}
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleKeyClick(' ')}
                     className="flex-[4] h-10 md:h-12 bg-slate-400 dark:bg-slate-700 text-white rounded-lg md:rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-500 transition-all shadow-lg active:scale-95"
                   >
                     Spasi
                   </button>
                   <button 
                     onClick={handleDelete}
                     className="flex-1 h-10 md:h-12 bg-white dark:bg-slate-800 text-slate-500 rounded-lg md:rounded-xl flex items-center justify-center hover:text-red-500 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                   >
                     <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                   </button>
                   <button 
                     onClick={checkAnswer}
                     className="flex-1 h-10 md:h-12 bg-orange-500 text-white rounded-lg md:rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all border border-orange-400 shadow-sm active:scale-95"
                   >
                     <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress Footer */}
      <div className="mt-8 flex items-center justify-between px-6">
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div key={i} className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentIdx ? "w-8 bg-orange-500" : 
                i < currentIdx ? "w-4 bg-emerald-500" : "w-4 bg-slate-200 dark:bg-slate-800"
              )} />
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {currentIdx + 1} / {questions.length} Soal
          </span>
      </div>
    </div>
  );
};

export default HarakatGame;
