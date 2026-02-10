import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCcw, 
  Check, 
  Trophy, 
  Puzzle, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  MousePointer2,
  ListRestart,
  HelpCircle,
  Grab,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '../../utils/cn';
import confetti from 'canvas-confetti';

const MatchUpGame = ({ pairs = [], title = "Tantangan Pasangan" }) => {
    const [matches, setMatches] = useState({}); // questionId -> answerId
    const [availableAnswers, setAvailableAnswers] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [shuffledPairs, setShuffledPairs] = useState([]);
    const [gameState, setGameState] = useState('playing'); // playing, finished
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

    // Drag State
    const [dragItem, setDragItem] = useState(null); 
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const ghostRef = useRef(null);

    // Selection State
    const [selectedItem, setSelectedItem] = useState(null); 

    const gameStateRef = useRef({ matches: {}, availableAnswers: [], dragItem: null, shuffledPairs: [] });
    useEffect(() => {
        gameStateRef.current = { matches, availableAnswers, dragItem, shuffledPairs };
    }, [matches, availableAnswers, dragItem, shuffledPairs]);

    useEffect(() => {
        resetGame();
    }, [pairs]);

    const resetGame = () => {
        const shuffled = [...pairs].map(p => ({ ...p, answerId: p.id })); 
        const items = shuffled.map(p => ({ id: p.id, text: p.answer })).sort(() => Math.random() - 0.5);
        
        setShuffledPairs(shuffled);
        setAvailableAnswers(items);
        setMatches({});
        setIsSubmitted(false);
        setScore(0);
        setSelectedItem(null);
        setGameState('playing');
    };

    const isArabic = (text) => {
        if (!text) return false;
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        return arabicRegex.test(text);
    };

    const placeAnswer = (answerId, targetQuestionId, sourceQuestionId = null) => {
        let newMatches = { ...matches };
        let newPool = [...availableAnswers];
        
        // 1. If moving within slots, clear the source slot
        if (sourceQuestionId) {
            delete newMatches[sourceQuestionId];
        } else {
            // 2. If coming from pool, remove from pool
            newPool = newPool.filter(a => a.id !== answerId);
        }

        // 3. If target slot already occupied by a DIFFERENT item, return that item to pool
        const existingAtTarget = newMatches[targetQuestionId];
        if (existingAtTarget && existingAtTarget !== answerId) {
            const pair = shuffledPairs.find(p => p.id === parseInt(existingAtTarget));
            if (pair) newPool.push({ id: pair.id, text: pair.answer });
        }

        // 4. Update the target slot
        newMatches[targetQuestionId] = answerId;

        setMatches(newMatches);
        setAvailableAnswers(newPool);
        playSound(clickSound);
    };

    const handleItemClick = (item) => {
        if (isSubmitted || gameState === 'finished') return;
        playSound(clickSound);
        if (!selectedItem) {
            setSelectedItem(item);
            return;
        }
        if (selectedItem.id === item.id && selectedItem.type === item.type) {
            setSelectedItem(null);
            return;
        }

        if (selectedItem.type === 'pool' && item.type === 'question') {
            placeAnswer(selectedItem.id, item.questionId);
            setSelectedItem(null);
        } else if (selectedItem.type === 'question' && item.type === 'pool') {
            placeAnswer(item.id, selectedItem.questionId);
            setSelectedItem(null);
        } else if (selectedItem.type === 'answer' && item.type === 'question') {
            // Moving from one slot to another via click
            placeAnswer(selectedItem.id, item.questionId, selectedItem.questionId);
            setSelectedItem(null);
        } else {
            setSelectedItem(item);
        }
    };

    const handleSlotClick = (questionId, filledAnswerId, filledAnswerText) => {
        if (isSubmitted || gameState === 'finished') return;
        if (selectedItem && (selectedItem.type === 'pool' || selectedItem.type === 'answer')) {
            placeAnswer(selectedItem.id, questionId, selectedItem.type === 'answer' ? selectedItem.questionId : null);
            setSelectedItem(null);
        } else if (filledAnswerId) {
            handleItemClick({ id: filledAnswerId, text: filledAnswerText, type: 'answer', questionId });
        } else {
            handleItemClick({ id: questionId, type: 'question', questionId });
        }
    };

    const handleReturnToPool = (questionId) => {
        const answerId = matches[questionId];
        if (!answerId) return;
        const nextMatches = { ...matches };
        delete nextMatches[questionId];
        setMatches(nextMatches);
        const pair = shuffledPairs.find(p => p.id === parseInt(answerId));
        if (pair) setAvailableAnswers([...availableAnswers, { id: pair.id, text: pair.answer }]);
    };

    const handleDragStart = (e, item) => {
        if (isSubmitted || gameState === 'finished') return;
        const touch = e.touches ? e.touches[0] : e;
        setDragItem(item);
        setDragPosition({ x: touch.clientX, y: touch.clientY });

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    };

    const handleDragMove = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        setDragPosition({ x: touch.clientX, y: touch.clientY });
        e.preventDefault(); 
    };

    const handleDragEnd = (e) => {
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        let elemBelow = document.elementFromPoint(x, y);
        if (ghostRef.current) ghostRef.current.style.display = 'block';
        let slot = elemBelow?.closest('[data-droppable="true"]');
        if (!slot) {
            const allSlots = document.querySelectorAll('[data-droppable="true"]');
            for (const s of allSlots) {
                const rect = s.getBoundingClientRect();
                // Increased visual drop buffer for better mobile feel
                const bufferX = window.innerWidth < 768 ? 10 : 0;
                const bufferY = window.innerWidth < 768 ? 10 : 0;
                if (x >= rect.left - bufferX && x <= rect.right + bufferX && y >= rect.top - bufferY && y <= rect.bottom + bufferY) {
                    slot = s; break;
                }
            }
        }
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);

        const dragInfo = gameStateRef.current.dragItem;
        if (slot && dragInfo) {
            const targetQId = slot.getAttribute('data-question-id');
            placeAnswer(dragInfo.id, targetQId, dragInfo.origin === 'slot' ? dragInfo.sourceQuestionId : null);
        }
        setDragItem(null);
    };

    const handleSubmit = () => {
        let correctCount = 0;
        shuffledPairs.forEach(p => { if (matches[p.id] == p.id) correctCount++; });
        setScore(correctCount);
        setIsSubmitted(true);
        if (correctCount === pairs.length) {
            playSound(successSound);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0d9488', '#14b8a6', '#5eead4'] });
            setTimeout(() => setGameState('finished'), 2000);
        } else {
            playSound(errorSound);
        }
    };

    if (gameState === 'finished') {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--color-bg-card)] rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border-4 border-teal-500/20 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-500" />
                <div className="w-28 h-28 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-teal-500/20 transform rotate-12 transition-transform hover:rotate-0 duration-500 cursor-pointer">
                    <Trophy className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Misi Sempurna! 🎉</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-lg leading-relaxed">
                    Kamu hebat! Semua pasangan telah terhubung dengan tepat. Terus asah kemampuanmu!
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-10 mb-10 border border-slate-100 dark:border-white/5 w-full max-w-sm shadow-inner group">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-teal-500 transition-colors">Hasil Belajar</div>
                    <div className="text-7xl font-black text-teal-600 dark:text-teal-400 tracking-tighter tabular-nums">{score} <span className="text-2xl text-slate-300 dark:text-slate-600">/</span> {pairs.length}</div>
                </div>
                <button 
                    onClick={() => {
                        playSound(clickSound);
                        resetGame();
                    }}
                    className="w-full max-w-sm py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 overflow-hidden group"
                >
                    <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    <span>Mulai Ulang Game</span>
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-0 md:px-0 py-0 md:py-8">
            <div className="relative bg-[var(--color-bg-card)] backdrop-blur-xl rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl border-x-0 md:border-4 border-[var(--color-border)] overflow-hidden select-none">
                {/* Decorative Top Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500 animate-gradient-x" />

                {/* Header Context - More Compact on Mobile */}
                <div className="px-5 md:px-12 py-5 md:py-8 flex flex-row items-center justify-between border-b border-[var(--color-border)] gap-4 bg-[var(--color-bg-muted)]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                            <Puzzle className="w-5 h-5 md:w-8 md:h-8" />
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-1.5 mb-0.5 md:mb-1">
                                 <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Game Kosakata</span>
                                 <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-teal-500" />
                            </div>
                            <h2 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={toggleMute}
                            className="p-2 md:p-3 bg-[var(--color-bg-card)] rounded-xl md:rounded-2xl shadow-sm border border-[var(--color-border)] text-slate-500 hover:text-teal-500 transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                        <div className="hidden sm:flex items-center px-4 md:px-6 py-2 md:py-3 bg-[var(--color-bg-card)] rounded-xl md:rounded-2xl shadow-sm border border-[var(--color-border)]">
                             <div className="w-2 h-2 rounded-full bg-teal-500 mr-3 animate-pulse" />
                             <span className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                {Object.keys(matches).length} / {pairs.length} Terhubung
                             </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-12">
                    {/* Progress Indicator for Mobile */}
                    <div className="sm:hidden mb-6 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        </div>
                        <span className="text-xs font-black text-teal-600 dark:text-teal-400 font-mono tracking-tighter tabular-nums">
                            {Object.keys(matches).length} / {pairs.length}
                        </span>
                        <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-4 overflow-hidden shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(Object.keys(matches).length / pairs.length) * 100}%` }}
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                            />
                        </div>
                    </div>

                    {/* Unified Grid Layout - Optimized for Mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
                        {shuffledPairs.map((pair, idx) => {
                            const filledAnswerId = matches[pair.id];
                            const filledAnswer = filledAnswerId ? shuffledPairs.find(p => p.id === parseInt(filledAnswerId))?.answer : null;
                            const isSelected = selectedItem?.type === 'question' && selectedItem.id === pair.id;
                            
                            let borderClass = "border-slate-100 dark:border-slate-800/80 shadow-sm";
                            if (isSubmitted) {
                                borderClass = filledAnswerId == pair.id 
                                    ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/10" 
                                    : "border-red-500/50 bg-red-50/50 dark:bg-red-500/10 shadow-lg shadow-red-500/10";
                            } else if (isSelected) {
                                borderClass = "border-teal-500 ring-4 ring-teal-500/10 shadow-xl bg-teal-50/50 dark:bg-teal-500/10 scale-[1.02] md:scale-[1.03]";
                            }

                            return (
                                <motion.div 
                                    key={pair.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "group flex flex-row items-stretch rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden border-2 transition-all duration-300 relative bg-[var(--color-bg-surface)]",
                                        borderClass,
                                        !isSubmitted && !filledAnswer && selectedItem?.type === 'pool' && "ring-2 ring-teal-500/20"
                                    )}
                                    data-droppable={!isSubmitted}
                                    data-question-id={pair.id}
                                >
                                    {/* Question Card Piece */}
                                    <div 
                                        className={cn(
                                            "flex-1 p-4 md:p-6 flex items-center justify-center text-center relative z-10 transition-colors bg-slate-50/80 dark:bg-slate-800/60 group-hover:bg-slate-100/100 dark:group-hover:bg-slate-800 transition-all",
                                            isSelected ? "bg-teal-500/10" : "bg-slate-50/80 dark:bg-slate-800/60"
                                        )}
                                        onClick={() => handleSlotClick(pair.id, filledAnswerId, filledAnswer)}
                                    >
                                        <div className="absolute top-0 left-0 text-[7px] md:text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest m-2 md:m-3">Misi {idx + 1}</div>
                                        <span className={cn(
                                            "font-black text-slate-800 dark:text-slate-100 transition-all",
                                            isArabic(pair.question) ? 'arabic-content text-xl md:text-3xl leading-relaxed py-1' : 'text-xs md:text-base px-2'
                                        )}>
                                            {pair.question}
                                        </span>
                                    </div>

                                    {/* Slot Side (Target Area) - More space efficient on mobile */}
                                    <div 
                                        className={cn(
                                            "flex-1 min-h-[70px] md:min-h-[100px] p-2 md:p-3 flex items-center justify-center relative transition-all duration-300",
                                            !isSubmitted && !filledAnswer && "bg-slate-50/30 dark:bg-black/10 cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-500/10 border-l-2 border-dashed border-slate-200 dark:border-slate-700 m-1.5 md:m-2 rounded-[1.25rem] md:rounded-2xl"
                                        )}
                                        onClick={() => handleSlotClick(pair.id, filledAnswerId, filledAnswer)}
                                    >
                                        <AnimatePresence mode="wait">
                                            {filledAnswer ? (
                                                <motion.div 
                                                    key={filledAnswerId}
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className={cn(
                                                        "w-full h-full bg-white dark:bg-slate-700 rounded-xl md:rounded-2xl shadow-md border-2 p-2 md:p-4 flex flex-col items-center justify-center text-center font-black transition-all relative group/ans",
                                                        isSubmitted 
                                                          ? (filledAnswerId == pair.id ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : "text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30") 
                                                          : "text-teal-600 dark:text-teal-400 cursor-grab active:cursor-grabbing border-teal-500/50 hover:border-teal-500 shadow-teal-500/5"
                                                    )}
                                                    onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', sourceQuestionId: pair.id }); }}
                                                    onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', sourceQuestionId: pair.id }); }}
                                                    style={{ touchAction: 'none' }}
                                                >
                                                    <span className={cn(
                                                        "font-black transition-all",
                                                        isArabic(filledAnswer) ? 'arabic-content text-2xl md:text-3xl' : 'text-xs md:text-base'
                                                    )}>
                                                        {filledAnswer}
                                                    </span>
                                                    {!isSubmitted && (
                                                        <motion.button 
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => { e.stopPropagation(); handleReturnToPool(pair.id); }}
                                                            className="absolute -top-1.5 -right-1.5 md:top-1.5 md:right-1.5 p-1 text-slate-400 hover:text-red-500 transition-colors rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700"
                                                        >
                                                            <X className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                        </motion.button>
                                                    )}
                                                    {!isSubmitted && <Grab className="w-2.5 h-2.5 md:w-3 md:h-3 absolute bottom-1.5 md:bottom-2 right-1.5 md:right-2 text-slate-200 dark:text-slate-600 opacity-40" />}
                                                </motion.div>
                                            ) : (
                                                <div className={cn(
                                                    "flex flex-col items-center gap-1 transition-all duration-300",
                                                    selectedItem?.type === 'pool' ? "text-teal-500 scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" : "text-slate-300 dark:text-slate-700/50"
                                                )}>
                                                    <HelpCircle className={cn("w-4 h-4 md:w-6 md:h-6", selectedItem?.type === 'pool' && "animate-bounce")} />
                                                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em]">{selectedItem?.type === 'pool' ? 'Pasang' : 'Tunggu'}</span>
                                                </div>
                                            )}
                                        </AnimatePresence>

                                        {/* Status Evaluation Badge */}
                                        {isSubmitted && (
                                            <div className="absolute -right-2 -top-2 md:-right-3 md:-top-3 z-30">
                                                {filledAnswerId == pair.id ? 
                                                    <div className="w-7 h-7 md:w-9 md:h-9 bg-emerald-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border-2 md:border-4 border-white dark:border-slate-800 animate-in zoom-in-0 duration-500"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /></div> : 
                                                    <div className="w-7 h-7 md:w-9 md:h-9 bg-red-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border-2 md:border-4 border-white dark:border-slate-800 animate-shake"><AlertCircle className="w-4 h-4 md:w-5 md:h-5" /></div>
                                                }
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Proportional Answer Pool - More Keyboard-like on mobile */}
                    <div className="mt-8 md:mt-16 relative">
                        <div className={cn(
                            "bg-[var(--color-bg-muted)]/50 rounded-[2rem] md:rounded-[3rem] p-5 md:p-12 border-2 md:border-4 border-dashed border-[var(--color-border)] shadow-inner overflow-hidden relative transition-all",
                            isSubmitted && "opacity-40 grayscale pointer-events-none"
                        )}>
                            <div className="flex flex-row items-center justify-between mb-5 md:mb-8 gap-2">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-11 md:h-11 bg-teal-100 dark:bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm">
                                        <ListRestart className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <h4 className="text-[9px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.4em]">Pool Jawaban</h4>
                                </div>
                                <div className="px-3 md:px-5 py-1.5 md:py-2 bg-white dark:bg-slate-900 rounded-xl text-[7px] md:text-[9px] font-black text-teal-600 border border-teal-500/20 shadow-sm whitespace-nowrap">
                                    {availableAnswers.length} TERSEDIA
                                </div>
                            </div>
                            
                            {availableAnswers.length === 0 && !isSubmitted && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-4 md:py-6 text-center">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                        <Check className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-xs">Selesaikan Misi!</p>
                                </motion.div>
                            )}

                            <div className="flex flex-wrap gap-2 md:gap-4 justify-center relative z-10">
                                <AnimatePresence>
                                    {availableAnswers.map(ans => {
                                        const isSelected = selectedItem?.id === ans.id && selectedItem?.type === 'pool';
                                        return (
                                            <motion.button
                                                layout
                                                key={ans.id}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                whileHover={{ y: -3, scale: 1.02 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={cn(
                                                    "relative px-4 md:px-8 py-2.5 md:py-4 rounded-xl md:rounded-[1.5rem] shadow-md transition-all cursor-grab active:cursor-grabbing border-2",
                                                    isSelected 
                                                       ? "bg-teal-600 text-white border-teal-400 shadow-teal-500/40 z-20 scale-110" 
                                                       : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border)] hover:border-teal-500/50"
                                                )}
                                                onClick={() => handleItemClick({ id: ans.id, text: ans.text, type: 'pool' })}
                                                onMouseDown={(e) => handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' })}
                                                onTouchStart={(e) => handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' })}
                                                style={{ touchAction: 'none' }}
                                            >
                                                <span className={cn(
                                                    "font-black transition-all",
                                                    isArabic(ans.text) ? 'arabic-content text-xl md:text-3xl' : 'text-xs md:text-lg px-1'
                                                )}>
                                                    {ans.text}
                                                </span>
                                                {isSelected && (
                                                    <motion.div layoutId="cursor" className="absolute -top-1.5 -right-1.5 w-4 h-4 md:w-5 md:h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg ring-2 ring-teal-500">
                                                        <MousePointer2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-teal-500" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                                <Puzzle className="w-32 h-32 md:w-64 md:h-64 text-teal-500" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions - Fixed on Mobile? or just large buttons */}
                    <div className="mt-10 md:mt-16 flex flex-col items-center justify-center gap-4">
                         {!isSubmitted ? (
                             <button 
                                onClick={() => {
                                    playSound(clickSound);
                                    handleSubmit();
                                }} 
                                disabled={Object.keys(matches).length === 0}
                                className="group relative w-full sm:w-80 py-4 md:py-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3"
                             >
                                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                                <span>Koreksi Misi</span>
                             </button>
                         ) : (
                             <button 
                                onClick={() => {
                                    playSound(clickSound);
                                    resetGame();
                                }} 
                                className="w-full sm:w-80 py-4 md:py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                             >
                                <RefreshCcw className="w-4 h-4 md:w-5 md:h-5" />
                                <span>Ulangi Misi</span>
                             </button>
                         )}
                         <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest sm:hidden">Klik kartu lalu klik kotak untuk memasang</p>
                    </div>
                </div>
            </div>

            {/* Premium Drag Overlay */}
            <AnimatePresence>
                {dragItem && (
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: window.innerWidth < 768 ? 1.05 : 1.15, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        ref={ghostRef}
                        className="fixed z-[9999] pointer-events-none bg-teal-600 text-white px-5 md:px-8 py-3 md:py-5 rounded-2xl md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(13,148,136,0.6)] font-black text-xl md:text-3xl border-2 border-teal-300/50 backdrop-blur-md"
                        style={{ left: dragPosition.x, top: dragPosition.y, transform: 'translate(-50%, -50%)', width: 'max-content' }}
                    >
                        <span className={isArabic(dragItem.text) ? 'arabic-content px-2 transition-all' : 'px-4'}>{dragItem.text}</span>
                        <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-white" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MatchUpGame;
