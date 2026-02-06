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
import { cn } from '../utils/cn';
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

    const isArabic = (text) => text && /[\u0600-\u06FF]/.test(text);

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
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border-4 border-teal-500/20 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden"
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
        <div className="w-full max-w-5xl mx-auto px-2 md:px-0 py-6">
            <div className="relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden select-none">
                {/* Decorative Top Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500" />

                {/* Header Context */}
                <div className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-6 bg-slate-50/50 dark:bg-black/10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                            <Puzzle className="w-8 h-8" />
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Game Kosakata</span>
                                 <Sparkles className="w-3 h-3 text-teal-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-4">
                        <button 
                            onClick={toggleMute}
                            className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-500 hover:text-teal-500 transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group">
                             <div className="w-2 h-2 rounded-full bg-teal-500 mr-3 animate-pulse" />
                             <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {Object.keys(matches).length} <span className="text-slate-300 mx-1">/</span> {pairs.length} Terhubung
                             </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-12">
                    {/* Unified Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {shuffledPairs.map((pair, idx) => {
                            const filledAnswerId = matches[pair.id];
                            const filledAnswer = filledAnswerId ? shuffledPairs.find(p => p.id === parseInt(filledAnswerId))?.answer : null;
                            const isSelected = selectedItem?.type === 'question' && selectedItem.id === pair.id;
                            
                            let borderClass = "border-slate-100 dark:border-slate-800 shadow-sm";
                            if (isSubmitted) {
                                borderClass = filledAnswerId == pair.id ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5 shadow-lg shadow-emerald-500/10" : "border-red-500/50 bg-red-50/30 dark:bg-red-500/5 shadow-lg shadow-red-500/10";
                            } else if (isSelected) {
                                borderClass = "border-teal-500 ring-4 ring-teal-500/10 shadow-xl bg-teal-50/30 dark:bg-teal-500/5 scale-[1.02]";
                            }

                            return (
                                <motion.div 
                                    key={pair.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "group flex flex-col md:flex-row items-stretch rounded-[2.25rem] md:rounded-3xl overflow-hidden border-2 transition-all duration-500 relative bg-white dark:bg-slate-800/30",
                                        borderClass
                                    )}
                                    data-droppable={!isSubmitted}
                                    data-question-id={pair.id}
                                >
                                    {/* Question Card Piece */}
                                    <div 
                                        className="flex-1 p-5 md:p-6 flex items-center justify-center text-center font-bold text-slate-800 dark:text-slate-100 cursor-pointer relative z-10 transition-colors bg-slate-50/50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800"
                                        onClick={() => handleSlotClick(pair.id, filledAnswerId, filledAnswer)}
                                    >
                                        <div className="absolute top-0 left-0 text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest m-3">Mission {idx + 1}</div>
                                        <span className={isArabic(pair.question) ? 'font-arabic text-2xl md:text-3xl leading-relaxed py-2' : 'text-sm md:text-base font-black px-4'}>{pair.question}</span>
                                    </div>

                                    {/* Link Icon (Decorative on Desktop) */}
                                    <div className="hidden md:flex items-center justify-center px-1 bg-slate-100 dark:bg-slate-800/50">
                                         <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700/50 rounded-full" />
                                    </div>

                                    {/* Slot Side (Target Area) */}
                                    <div 
                                        className={cn(
                                            "flex-1 min-h-[90px] md:min-h-[100px] p-2 flex items-center justify-center relative transition-all duration-500",
                                            !isSubmitted && !filledAnswer && "bg-slate-50/30 dark:bg-black/10 cursor-pointer hover:bg-teal-50/40 dark:hover:bg-teal-500/5 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-200 dark:border-slate-700 m-2 rounded-[1.5rem] md:rounded-2xl"
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
                                                        "w-full h-full bg-white dark:bg-slate-700 rounded-2xl shadow-md border border-slate-200 dark:border-slate-600 p-3 md:p-4 flex flex-col items-center justify-center text-center font-black text-teal-600 dark:text-teal-400 relative group/ans",
                                                        isSubmitted ? "cursor-default border-teal-500/30" : "cursor-grab active:cursor-grabbing border-teal-500 shadow-teal-500/10"
                                                    )}
                                                    onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', sourceQuestionId: pair.id }); }}
                                                    onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', sourceQuestionId: pair.id }); }}
                                                    style={{ touchAction: 'none' }}
                                                >
                                                    <span className={isArabic(filledAnswer) ? 'font-arabic text-3xl' : 'text-base'}>{filledAnswer}</span>
                                                    {!isSubmitted && (
                                                        <div className="absolute inset-0 bg-teal-500 opacity-0 group-hover/ans:opacity-5 transition-opacity pointer-events-none" />
                                                    )}
                                                    {!isSubmitted && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleReturnToPool(pair.id); }}
                                                            className="absolute top-1.5 right-1.5 p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg bg-slate-50/50 dark:bg-black/20"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {!isSubmitted && <Grab className="w-3 h-3 absolute bottom-2 right-2 text-slate-200" />}
                                                </motion.div>
                                            ) : (
                                                <div className={cn(
                                                    "flex flex-col items-center gap-1.5 transition-all duration-300",
                                                    selectedItem?.type === 'pool' ? "text-teal-500 scale-110" : "text-slate-300 dark:text-slate-700"
                                                )}>
                                                    <HelpCircle className={cn("w-5 h-5 md:w-6 md:h-6", selectedItem?.type === 'pool' && "animate-bounce")} />
                                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{selectedItem?.type === 'pool' ? 'Hubungkan' : 'Kosong'}</span>
                                                </div>
                                            )}
                                        </AnimatePresence>

                                        {/* Status Evaluation Badge */}
                                        {isSubmitted && (
                                            <div className="absolute -right-3 -top-3 z-30">
                                                {filledAnswerId == pair.id ? 
                                                    <div className="w-9 h-9 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 animate-in zoom-in-0 duration-500"><CheckCircle2 className="w-5 h-5" /></div> : 
                                                    <div className="w-9 h-9 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 animate-shake"><AlertCircle className="w-5 h-5" /></div>
                                                }
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Proportional Answer Pool */}
                    <div className="mt-8 md:mt-12">
                        <div className={cn(
                            "bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-6 md:p-12 border-4 border-dashed border-slate-100 dark:border-slate-800 shadow-inner overflow-hidden relative transition-all",
                            isSubmitted && "opacity-40 grayscale pointer-events-none"
                        )}>
                            <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <ListRestart className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Pilihan Jawaban</h4>
                                </div>
                                <div className="px-5 py-2 bg-white dark:bg-slate-900 rounded-2xl text-[10px] font-black text-teal-600 border border-teal-500/20 shadow-sm">
                                    {availableAnswers.length} KATA TERSEDIA
                                </div>
                            </div>
                            
                            {availableAnswers.length === 0 && !isSubmitted && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-6 text-center">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Siap untuk dikoreksi?</p>
                                </motion.div>
                            )}

                            <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                                {availableAnswers.map(ans => {
                                    const isSelected = selectedItem?.id === ans.id && selectedItem?.type === 'pool';
                                    return (
                                        <motion.button
                                            layoutId={ans.id}
                                            key={ans.id}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "relative px-6 md:px-8 py-3 md:py-4 rounded-[1.25rem] shadow-lg border-2 font-black text-lg md:text-xl min-w-[100px] md:min-w-[120px] transition-all cursor-grab active:cursor-grabbing",
                                                isSelected 
                                                   ? "bg-teal-600 text-white border-teal-400 shadow-teal-500/40 z-20" 
                                                   : "bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-white dark:border-slate-700 hover:border-teal-500/50"
                                            )}
                                            onClick={() => handleItemClick({ id: ans.id, text: ans.text, type: 'pool' })}
                                            onMouseDown={(e) => handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' })}
                                            onTouchStart={(e) => handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' })}
                                            style={{ touchAction: 'none' }}
                                        >
                                            <span className={isArabic(ans.text) ? 'font-arabic text-xl md:text-3xl px-2' : 'text-base md:text-lg px-2'}>{ans.text}</span>
                                            {isSelected && (
                                                <motion.div layoutId="cursor" className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg ring-2 ring-teal-500">
                                                    <MousePointer2 className="w-3 h-3 text-teal-500" />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                                <Puzzle className="w-48 h-48 md:w-64 md:h-64 text-teal-500" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions Cluster */}
                    <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
                         {!isSubmitted ? (
                             <button 
                                onClick={() => {
                                    playSound(clickSound);
                                    handleSubmit();
                                }} 
                                disabled={Object.keys(matches).length === 0}
                                className="group relative w-full sm:w-80 px-12 py-5 md:py-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3"
                             >
                                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CheckCircle2 className="w-6 h-6 animate-pulse" />
                                <span>Koreksi Hasil</span>
                             </button>
                         ) : (
                             <button 
                                onClick={() => {
                                    playSound(clickSound);
                                    resetGame();
                                }} 
                                className="w-full sm:w-80 px-12 py-5 md:py-6 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 border border-slate-200 dark:border-white/5"
                             >
                                <RefreshCcw className="w-5 h-5" />
                                <span>Ulangi Misi</span>
                             </button>
                         )}
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
                        <span className={isArabic(dragItem.text) ? 'font-arabic px-2' : 'px-4'}>{dragItem.text}</span>
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
