import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Check, 
  Trophy, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  RefreshCcw,
  Volume2,
  VolumeX,
  Lightbulb,
  MousePointer2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import confetti from 'canvas-confetti';

const WordDetectiveGame = ({ 
  data = {
    title: "Detektif Kata",
    text: "",
    questions: []
  },
  title: propTitle
}) => {
    // Robust data handling (handle both structured data or individual props)
    const gameData = data.questions ? data : { ...data, questions: [] };
    const title = propTitle || gameData.title || "Detektif Kata";
    const { text = "", questions = [] } = gameData;

    const [currentClueIndex, setCurrentClueIndex] = useState(0);
    const [foundItems, setFoundItems] = useState([]); // Array of IDs or indices
    const [gameState, setGameState] = useState('playing'); // playing, finished
    const [isMuted, setIsMuted] = useState(false);
    const [shake, setShake] = useState(false);

    // Audio Refs
    const audioRefs = useRef({});

    useEffect(() => {
        const muted = window.localStorage.getItem('gameMuted') === 'true';
        setIsMuted(muted);

        const sounds = {
            success: 'https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3',
            error: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
            click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
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

    const resetGame = () => {
        setCurrentClueIndex(0);
        setFoundItems([]);
        setGameState('playing');
        setShake(false);
    };

    const isArabic = (text) => {
        if (!text) return false;
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        return arabicRegex.test(text);
    };

    // Prepare text: Split by space but preserve order
    const words = useMemo(() => {
        return text.split(/\s+/).filter(w => w.length > 0).map((w, i) => ({
            id: i,
            text: w,
            cleanText: w.replace(/[.,!?;:]/g, '') // Remove punctuation for comparison
        }));
    }, [text]);

    const currentQuestion = questions[currentClueIndex];

    const handleWordClick = (word) => {
        if (gameState !== 'playing' || !currentQuestion) return;

        // Normalize for comparison
        const clicked = word.cleanText.trim();
        const answer = currentQuestion.answer.trim();

        if (clicked === answer) {
            playSound('success');
            setFoundItems([...foundItems, word.id]);
            
            if (currentClueIndex < questions.length - 1) {
                setCurrentClueIndex(currentClueIndex + 1);
            } else {
                setGameState('finished');
                confetti({ 
                    particleCount: 150, 
                    spread: 70, 
                    origin: { y: 0.6 },
                    colors: ['#0d9488', '#14b8a6', '#5eead4']
                });
            }
        } else {
            playSound('error');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    if (gameState === 'finished') {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--color-bg-card)] rounded-[2.5rem] p-6 md:p-10 text-center shadow-2xl border-4 border-teal-500/20 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500" />
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-teal-500/20 transform rotate-12 transition-transform hover:rotate-0 duration-500">
                    <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">Detektif Hebat! 🎉</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm md:text-base leading-relaxed max-w-md">
                    Analisis yang tajam! Kamu telah menemukan semua kata yang dicari. Terus asah ketelitianmu!
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-white/5 w-full max-w-xs shadow-inner">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Misi Selesai</div>
                    <div className="text-5xl font-black text-teal-600 dark:text-teal-400 tracking-tighter tabular-nums">{questions.length} <span className="text-xl text-slate-300 dark:text-slate-600">/</span> {questions.length}</div>
                </div>
                <button 
                    onClick={resetGame}
                    className="w-full max-w-xs py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 overflow-hidden group text-xs"
                >
                    <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    <span>Mulai Ulang Game</span>
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-0 md:py-8">
            <div className="bg-[var(--color-bg-card)] rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl border-x-0 md:border-4 border-[var(--color-border)] overflow-hidden select-none">
                {/* Decorative Top Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500" />

                {/* Header Section */}
                <div className="px-5 md:px-12 py-5 md:py-8 flex flex-row items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/50">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-lg">
                            <Search className="w-5 h-5 md:w-8 md:h-8" />
                        </div>
                        <div className="text-left">
                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Detektif Kata</span>
                            <h2 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={toggleMute}
                            className="p-2 md:p-3 bg-[var(--color-bg-card)] rounded-xl text-slate-500 hover:text-teal-500 transition-colors shadow-sm border border-[var(--color-border)]"
                        >
                            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                        <div className="hidden sm:flex items-center px-4 md:px-6 py-2 md:py-3 bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)]">
                             <div className="w-2 h-2 rounded-full bg-teal-500 mr-3 animate-pulse" />
                             <span className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest tabular-nums">
                                {currentClueIndex + 1} / {questions.length} Misi
                             </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-12">
                    {/* Clue Card */}
                    <AnimatePresence mode="wait">
                        {currentQuestion && (
                            <motion.div 
                                key={currentClueIndex}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className={cn(
                                    "mb-6 md:mb-10 p-5 md:p-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-xl relative overflow-hidden group",
                                    shake && "animate-shake"
                                )}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                     <Search className="w-24 h-24 md:w-32 md:h-32" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-3 md:gap-8 text-center md:text-left">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" />
                                    </div>
                                    <div className="w-full">
                                        <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-0.5 md:mb-1">Misi Detektif:</h4>
                                        <p className="text-sm md:text-2xl font-black leading-tight">
                                           {currentQuestion.clue}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reading Area */}
                    <div 
                        className={cn(
                            "bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-12 border-2 border-[var(--color-border)] shadow-inner min-h-[250px] md:min-h-[300px]",
                            isArabic(text) ? "dir-rtl" : "dir-ltr text-left"
                        )}
                    >
                        <div className={cn(
                            "flex flex-wrap gap-x-1 md:gap-x-2 gap-y-2 md:gap-y-4",
                            isArabic(text) ? "justify-start text-right" : "justify-start text-left"
                        )}>
                            {words.map((word) => {
                                const isFound = foundItems.includes(word.id);
                                
                                return (
                                    <motion.button
                                        key={word.id}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleWordClick(word)}
                                        className={cn(
                                            "relative px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-lg md:text-3xl font-black transition-all transform-gpu inline-flex items-center",
                                            isArabic(word.text) ? "arabic-content leading-relaxed" : "font-sans leading-none",
                                            isFound 
                                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105 z-10" 
                                              : "text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:text-teal-600"
                                        )}
                                    >
                                        {word.text}
                                        {isFound && (
                                            <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-emerald-500 shadow-md ring-2 ring-emerald-500"
                                            >
                                                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 stroke-[4]" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Progress */}
                    <div className="mt-10 flex items-center justify-between gap-4">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner hidden md:block">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${(foundItems.length / questions.length) * 100}%` }}
                            />
                        </div>
                        <div className="md:hidden flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <motion.div 
                                className="h-full bg-emerald-500"
                                animate={{ width: `${(foundItems.length / questions.length) * 100}%` }}
                             />
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">
                             <Target className="w-4 h-4 text-emerald-500" />
                             <span>{foundItems.length} Ditemukan</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Visual Instructions */}
            <div className="mt-6 flex flex-col items-center gap-2">
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <MousePointer2 className="w-3 h-3" /> Klik pada kata yang sesuai dengan petunjuk di atas
                 </p>
            </div>
        </div>
    );
};

export default WordDetectiveGame;
