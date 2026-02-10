import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCcw, 
  Trophy, 
  Sparkles, 
  Heart,
  HelpCircle,
  Ghost,
  Volume2,
  VolumeX,
  CheckCircle2,
  X,
  XCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import confetti from 'canvas-confetti';

const ARABIC_KEYBOARD = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ذ'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ئ'],
  ['ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'أ', 'إ', 'آ'],
];

const HangmanGame = ({ data }) => {
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [gameState, setGameState] = useState('playing'); // playing, won_round, lost_round, finished
    const [score, setScore] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const maxMistakes = 6;

    // Audio Refs
    const successSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3'));
    const errorSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/958/958-preview.mp3'));
    const clickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

    useEffect(() => {
        const muted = window.localStorage.getItem('gameMuted') === 'true';
        setIsMuted(muted);
        if (data?.questions) {
            initGame(data.questions);
        }
    }, [data]);

    const playSound = (soundRef) => {
        if (isMuted) return;
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch(() => {});
    }

    const initGame = (qs) => {
        const shuffled = [...qs].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentIdx(0);
        setScore(0);
        resetRound();
        setGameState('playing');
    };

    const resetRound = () => {
        setGuessedLetters([]);
        setMistakes(0);
    };

    const currentQ = questions[currentIdx];
    const word = currentQ?.word || "";
    const meaning = currentQ?.meaning || "";
    const hint = currentQ?.hint || "";

    const cleanWord = word.replace(/[\u064B-\u0652\u0651]/g, "");
    const letters = cleanWord.split("").filter(l => l !== " ");

    const handleGuess = (letter) => {
        if (gameState !== 'playing' || !currentQ) return;

        const lettersToGuess = letter === 'لا' ? ['ل', 'ا'] : [letter];
        const newLetters = lettersToGuess.filter(l => !guessedLetters.includes(l));
        if (newLetters.length === 0) return;

        playSound(clickSound);
        const newGuessed = [...guessedLetters, ...newLetters];
        setGuessedLetters(newGuessed);

        const anyCorrect = newLetters.some(l => letters.includes(l));

        if (!anyCorrect) {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            playSound(errorSound);
            if (newMistakes >= maxMistakes) {
                setGameState('lost_round');
                setTimeout(() => nextQuestion(), 2500);
            }
        } else {
            const isWin = letters.every(l => newGuessed.includes(l));
            if (isWin) {
                setGameState('won_round');
                setScore(prev => prev + 1);
                playSound(successSound);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ef4444', '#f87171', '#dc2626']
                });
                setTimeout(() => nextQuestion(), 2000);
            }
        }
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            resetRound();
            setGameState('playing');
        } else {
            setGameState('finished');
        }
    };

    const isArabicText = (text) => /[\u0600-\u06FF]/.test(text);

    if (gameState === 'finished') {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--color-bg-card)] rounded-[2.5rem] p-6 md:p-10 text-center shadow-2xl border-4 border-emerald-500/20 max-w-md mx-auto flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 flex items-center justify-center mb-6 shadow-xl transform rotate-12 transition-transform hover:rotate-0 duration-500">
                    <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>

                <h2 className="text-3xl font-black text-[var(--color-text-main)] mb-2 uppercase tracking-tighter">
                    Misi Selesai! 🎉
                </h2>
                
                <p className="text-[var(--color-text-muted)] mb-6 font-medium text-base leading-relaxed">
                    Luar biasa! Kamu telah menyelesaikan semua kata Algojo.
                </p>

                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-5 mb-6 border border-slate-100 dark:border-white/5 w-full">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Skor Akhir</div>
                    <div className="text-4xl font-black text-emerald-500">{score} <span className="text-xl text-slate-300">/ {questions.length}</span></div>
                </div>

                <button 
                    onClick={() => initGame(data.questions)}
                    className="w-full max-w-sm py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
                >
                    <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    <span>Main Lagi</span>
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-0 md:px-0 py-0 md:py-8">
            <div className="relative bg-[var(--color-bg-card)] backdrop-blur-xl rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl border-x-0 md:border-4 border-[var(--color-border)] overflow-hidden select-none min-h-[650px] flex flex-col">
                <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />

                <div className="px-5 md:px-12 py-5 md:py-8 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-lg shadow-red-500/30 font-black text-xl">
                            <Ghost className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                 <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Algojo #{currentIdx + 1}</span>
                                 <Sparkles className="w-2.5 h-2.5 text-red-500" />
                            </div>
                            <h2 className="text-lg md:text-3xl font-black text-[var(--color-text-main)] uppercase tracking-tighter">Tebak Huruf</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex gap-1 md:gap-2 mr-4">
                            {[...Array(maxMistakes)].map((_, i) => (
                                <Heart 
                                    key={i} 
                                    className={cn(
                                        "w-5 h-5 md:w-7 md:h-7 transition-all duration-500",
                                        i < (maxMistakes - mistakes) ? "text-red-500 fill-red-500" : "text-slate-200 dark:text-slate-800 scale-90"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 font-black text-xs text-slate-500">
                             {currentIdx + 1} / {questions.length}
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center gap-8 md:gap-12 relative">
                    <AnimatePresence mode="wait">
                        {gameState === 'lost_round' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                            >
                                <div className="bg-red-500 text-white px-8 py-4 rounded-3xl shadow-2xl font-black text-2xl uppercase tracking-widest flex items-center gap-3">
                                    <XCircle className="w-8 h-8" /> Habis Waktu!
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Word Display */}
                    <div className="flex flex-wrap flex-row-reverse justify-center gap-3 md:gap-6">
                        {word.split("").map((letter, i) => {
                            const isSpace = letter === " ";
                            const isHarakat = /[\u064B-\u0652\u0651]/.test(letter);
                            const cleanLetter = letter.replace(/[\u064B-\u0652\u0651]/g, "");
                            const isReveal = guessedLetters.includes(cleanLetter) || isHarakat || isSpace || gameState === 'lost_round';
                            
                            if (isSpace) return <div key={i} className="w-4 md:w-8" />;

                            return (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <motion.div 
                                        initial={false}
                                        animate={{ 
                                            scale: isReveal ? 1 : 0.95,
                                            backgroundColor: isReveal ? "transparent" : "var(--color-bg-muted)",
                                            borderColor: gameState === 'lost_round' && !guessedLetters.includes(cleanLetter) ? "#ef4444" : ""
                                        }}
                                        className={cn(
                                            "w-10 h-14 md:w-16 md:h-20 rounded-xl md:rounded-2xl border-b-4 flex items-center justify-center relative overflow-hidden",
                                            isReveal 
                                                ? (gameState === 'lost_round' && !guessedLetters.includes(cleanLetter) ? "border-red-500" : "border-emerald-500 bg-emerald-50/10")
                                                : "border-slate-300 dark:border-slate-700 bg-[var(--color-bg-muted)]"
                                        )}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isReveal && (
                                                <motion.span 
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    className={cn(
                                                        "text-3xl md:text-5xl font-black arabic-content",
                                                        gameState === 'lost_round' && !guessedLetters.includes(cleanLetter) ? "text-red-500" : "text-[var(--color-text-main)]"
                                                    )}
                                                >
                                                    {letter}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        {!isReveal && (
                                            <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                                        )}
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{meaning || "Tebak katanya!"}</span>
                        </div>
                        {hint && (
                            <p className="mt-3 text-slate-400 text-xs font-medium max-w-md mx-auto italic">
                                "{hint}"
                            </p>
                        )}
                    </div>

                    <div className="w-full max-w-4xl mx-auto">
                        <div className="sm:hidden flex justify-center gap-1 mb-6">
                            {[...Array(maxMistakes)].map((_, i) => (
                                <Heart 
                                    key={i} 
                                    className={cn(
                                        "w-5 h-5 transition-all duration-500",
                                        i < (maxMistakes - mistakes) ? "text-red-500 fill-red-500" : "text-slate-200 dark:text-slate-800 scale-90"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 gap-1.5 md:gap-3 px-4">
                            {ARABIC_KEYBOARD.flat().map((letter) => {
                                const isGuessed = guessedLetters.includes(letter) || (letter === 'لا' && guessedLetters.includes('ل') && guessedLetters.includes('ا'));
                                const isCorrect = letter === 'لا' ? (letters.includes('ل') || letters.includes('ا')) : letters.includes(letter);
                                
                                return (
                                    <button
                                        key={letter}
                                        disabled={isGuessed || gameState !== 'playing'}
                                        onClick={() => handleGuess(letter)}
                                        className={cn(
                                            "aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all transform active:scale-90 font-black text-xl md:text-2xl shadow-sm border-2",
                                            !isGuessed 
                                                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-red-500 hover:text-red-500"
                                                : isCorrect
                                                    ? "bg-emerald-500 border-emerald-600 text-white cursor-default"
                                                    : "bg-slate-100 dark:bg-slate-900 border-transparent text-slate-300 dark:text-slate-700 cursor-default grayscale"
                                        )}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="px-12 py-6 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/30 hidden md:flex items-center justify-center">
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em] flex items-center gap-3">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Pilih huruf bahasa Arab yang tepat untuk menyusun kata
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HangmanGame;
