import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCcw, 
  Trophy, 
  Sparkles, 
  Timer,
  Hash,
  Volume2,
  VolumeX,
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { cn } from '../../utils/cn';
import confetti from 'canvas-confetti';

const MemoryGame = ({ pairs = [], title = "Asah Memori" }) => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]); // indices
    const [matchedPairs, setMatchedPairs] = useState([]); // indices
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [gameState, setGameState] = useState('playing'); // playing, finished
    const [isMuted, setIsMuted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const timerRef = useRef(null);

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
        if (!newState) {
            playSound('click');
        }
    };

    useEffect(() => {
        initGame();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [pairs]);

    useEffect(() => {
        if (gameState === 'playing' && hasStarted) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, hasStarted]);

    const initGame = () => {
        const gameCards = [];
        pairs.forEach((pair, index) => {
            // Add Arabic side
            gameCards.push({
                id: `card-${index}-a`,
                pairId: index,
                content: pair.question,
                isArabic: true
            });
            // Add Meaning side
            gameCards.push({
                id: `card-${index}-b`,
                pairId: index,
                content: pair.answer,
                isArabic: false
            });
        });

        // Shuffle
        const shuffled = gameCards.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setTime(0);
        setHasStarted(false);
        setGameState('playing');
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleCardClick = (index) => {
        if (
            gameState === 'finished' || 
            flippedCards.length === 2 || 
            flippedCards.includes(index) || 
            matchedPairs.includes(index)
        ) return;

        if (!hasStarted) {
            setHasStarted(true);
        }

        playSound('click');
        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [firstIdx, secondIdx] = newFlipped;
            
            if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
                // Match!
                setTimeout(() => {
                    const newMatched = [...matchedPairs, firstIdx, secondIdx];
                    setMatchedPairs(newMatched);
                    setFlippedCards([]);
                    playSound('success');
                    
                    if (newMatched.length === cards.length) {
                        handleGameFinish();
                    }
                }, 600);
            } else {
                // No match
                setTimeout(() => {
                    setFlippedCards([]);
                    playSound('error');
                }, 1000);
            }
        }
    };

    const handleGameFinish = () => {
        setGameState('finished');
        if (timerRef.current) clearInterval(timerRef.current);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isArabicText = (text) => {
        if (!text) return false;
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        return arabicRegex.test(text);
    };

    if (gameState === 'finished') {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--color-bg-card)] rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border-4 border-violet-500/20 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <div className="w-28 h-28 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-violet-500/20 transform rotate-12 transition-transform hover:rotate-0 duration-500">
                    <Trophy className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-4xl font-black text-[var(--color-text-main)] mb-4 uppercase tracking-tighter">Memori Tajam! 🧠</h2>
                <p className="text-[var(--color-text-muted)] mb-10 font-medium text-lg leading-relaxed">
                    Luar biasa! Kamu berhasil mencocokkan semua kartu dengan sangat baik.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
                    <div className="bg-[var(--color-bg-muted)] p-6 rounded-3xl border border-[var(--color-border)] shadow-inner">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Langkah</div>
                        <div className="text-3xl font-black text-violet-600 dark:text-violet-400">{moves}</div>
                    </div>
                    <div className="bg-[var(--color-bg-muted)] p-6 rounded-3xl border border-[var(--color-border)] shadow-inner">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu</div>
                        <div className="text-3xl font-black text-fuchsia-600 dark:text-fuchsia-400">{formatTime(time)}</div>
                    </div>
                </div>
                <button 
                    onClick={initGame}
                    className="w-full max-w-sm py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
                >
                    <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    <span>Mulai Lagi</span>
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-0 md:px-0 py-0 md:py-8">
            <div className="relative bg-[var(--color-bg-card)] backdrop-blur-xl rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl border-x-0 md:border-4 border-[var(--color-border)] overflow-hidden select-none min-h-[600px] flex flex-col">
                {/* Decorative Top Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 animate-gradient-x" />

                {/* Header Section */}
                <div className="px-5 md:px-12 py-5 md:py-8 flex flex-row items-center justify-between border-b border-[var(--color-border)] gap-4 bg-[var(--color-bg-muted)]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                            <BrainCircuit className="w-5 h-5 md:w-8 md:h-8" />
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-1.5 mb-0.5 md:mb-1">
                                 <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Game Memori</span>
                                 <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-violet-500" />
                            </div>
                            <h2 className="text-lg md:text-3xl font-black text-[var(--color-text-main)] uppercase tracking-tighter leading-tight">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={toggleMute}
                            className="p-2 md:p-3 bg-[var(--color-bg-card)] rounded-xl md:rounded-2xl shadow-sm border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-violet-500 transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center px-4 py-2 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] shadow-sm">
                                <Timer className="w-3.5 h-3.5 text-violet-500 mr-2" />
                                <span className="text-xs font-black text-[var(--color-text-muted)] font-mono">{formatTime(time)}</span>
                            </div>
                            <div className="hidden sm:flex items-center px-4 py-2 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] shadow-sm">
                                <Hash className="w-3.5 h-3.5 text-fuchsia-500 mr-2" />
                                <span className="text-xs font-black text-[var(--color-text-muted)] font-mono">{moves}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Stats Bar */}
                <div className="sm:hidden flex items-center justify-around py-4 bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] px-6">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Waktu</span>
                        <div className="flex items-center gap-1.5">
                            <Timer className="w-3 h-3 text-violet-500" />
                            <span className="text-sm font-black text-[var(--color-text-main)] font-mono">{formatTime(time)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Langkah</span>
                        <div className="flex items-center gap-1.5">
                            <Hash className="w-3 h-3 text-fuchsia-500" />
                            <span className="text-sm font-black text-[var(--color-text-main)] font-mono">{moves}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Selesai</span>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-sm font-black text-[var(--color-text-main)] font-mono">{matchedPairs.length / 2} / {pairs.length}</span>
                        </div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
                    <div className={cn(
                        "grid gap-2 md:gap-4 w-full max-w-2xl mx-auto",
                        cards.length <= 8 ? "grid-cols-2 sm:grid-cols-4" : 
                        cards.length <= 12 ? "grid-cols-3 sm:grid-cols-4" :
                        "grid-cols-3 sm:grid-cols-5 md:grid-cols-6"
                    )}>
                        {cards.map((card, index) => {
                            const isFlipped = flippedCards.includes(index) || matchedPairs.includes(index);
                            const isMatch = matchedPairs.includes(index);

                            return (
                                <div 
                                    key={card.id}
                                    className="relative perspective-1000 aspect-square cursor-pointer active:scale-95 transition-transform"
                                    onClick={() => handleCardClick(index)}
                                >
                                    <motion.div
                                        initial={false}
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                                        className="w-full h-full relative preserve-3d"
                                    >
                                        {/* Card Front (Hidden) */}
                                        <div className="absolute inset-0 backface-hidden flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl md:rounded-2xl shadow-lg border-2 md:border-4 border-white/20 dark:border-white/10 overflow-hidden">
                                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                                <div className="absolute top-0 right-0 w-8 h-8 md:w-16 md:h-16 bg-white rotate-45 transform translate-x-4 md:translate-x-8 -translate-y-4 md:-translate-y-8" />
                                                <div className="absolute bottom-0 left-0 w-8 h-8 md:w-16 md:h-16 bg-white rotate-45 transform -translate-x-4 md:-translate-x-8 translate-y-4 md:translate-y-8" />
                                            </div>
                                            <BrainCircuit className="w-6 md:w-10 h-6 md:h-10 text-white/50" />
                                        </div>

                                        {/* Card Back (Content) */}
                                        <div 
                                            className={cn(
                                                "absolute inset-0 backface-hidden flex items-center justify-center p-2 md:p-3 text-center rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 rotate-y-180 bg-[var(--color-bg-card)]",
                                                isMatch ? "border-emerald-500/50" : "border-violet-500/10"
                                            )}
                                        >
                                            {isMatch && (
                                                <div className="absolute top-1 right-1 md:top-3 md:right-3">
                                                    <CheckCircle2 className="w-3 md:w-5 h-3 md:h-5 text-emerald-500" />
                                                </div>
                                            )}
                                            <span className={cn(
                                                "font-black text-[var(--color-text-main)] transition-all",
                                                card.isArabic ? "arabic-content text-xl md:text-3xl" : "text-[8px] md:text-xs uppercase tracking-tighter"
                                            )}>
                                                {card.content}
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Context */}
                <div className="px-12 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/30 hidden md:flex items-center justify-center">
                    <p className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                        Cocokkan kata bahasa Arab dengan artinya untuk menyelesaikan tantangan
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MemoryGame;
