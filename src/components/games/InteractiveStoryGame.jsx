import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  RefreshCcw, 
  History, 
  User,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { wrapArabicText, isArabic } from '../../utils/textUtils';

const InteractiveStoryGame = ({ data = {}, title }) => {
    const [currentSceneKey, setCurrentSceneKey] = useState('start');
    const [currentBubbleIndex, setCurrentBubbleIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [history, setHistory] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSceneLoading, setIsSceneLoading] = useState(false);

    const scenes = data.scenes || {};
    const currentScene = scenes[currentSceneKey] || { 
        text: "Pilih aksi untuk memulai...", 
        options: [],
        character: null 
    };

    // Derived: Bubbles (Handle backward compatibility)
    const currentBubbles = useMemo(() => {
        if (currentScene.bubbles && Array.isArray(currentScene.bubbles) && currentScene.bubbles.length > 0) {
            return currentScene.bubbles;
        }
        // Fallback for legacy data or incomplete scenes
        if (currentScene.text || currentScene.character) {
            return [{ text: currentScene.text || '', character: currentScene.character }];
        }
        return [{ text: '...', character: null }];
    }, [currentScene]);

    // Ensure index is always valid
    const safeBubbleIndex = Math.min(currentBubbleIndex, currentBubbles.length - 1);
    const currentBubble = currentBubbles[safeBubbleIndex] || { text: '...', character: null };
    const isLastBubble = safeBubbleIndex === currentBubbles.length - 1;

    // Reset bubble index immediately when scene key changes to avoid stale index frames
    useEffect(() => {
        setCurrentBubbleIndex(0);
    }, [currentSceneKey]);

    // Helper to preload images
    const preloadImage = (url) => {
        return new Promise((resolve) => {
            if (!url) resolve();
            const img = new Image();
            img.src = url;
            img.onload = () => resolve();
            img.onerror = () => resolve();
        });
    };

    // Initial Load
    useEffect(() => {
        const initLoad = async () => {
            const startScene = scenes['start'];
            if (startScene) {
                const bubbles = startScene.bubbles || (startScene.text ? [{ text: startScene.text, character: startScene.character }] : []);
                const firstChar = bubbles[0]?.character?.image || startScene.character?.image;
                await Promise.all([
                    preloadImage(startScene.background),
                    preloadImage(firstChar)
                ]);
            }
            setTimeout(() => setIsInitialLoading(false), 800);
        };
        initLoad();
    }, []);

    // Split narrative text into segments for staggered fade-in
    const textSegments = useMemo(() => {
        if (!currentBubble.text) return [];
        return currentBubble.text
            .split(/(?<=[.!?؟])\s+|\n+/)
            .filter(segment => segment.trim().length > 0);
    }, [currentBubble.text]);

    // Handle typing state for UI feedback
    useEffect(() => {
        if (isInitialLoading || isSceneLoading || !currentBubble.text) return;
        setIsTyping(true);
        const duration = Math.min(textSegments.length * 800 + 400, 4000);
        const timer = setTimeout(() => setIsTyping(false), duration);
        return () => clearTimeout(timer);
    }, [currentSceneKey, currentBubbleIndex, isInitialLoading, isSceneLoading, textSegments.length]);

    const handleOptionClick = async (nextKey) => {
        if (isTyping || isSceneLoading || !isLastBubble) return;
        
        const nextScene = scenes[nextKey];
        if (nextScene) {
            setIsSceneLoading(true);
            const bubbles = nextScene.bubbles || (nextScene.text ? [{ text: nextScene.text, character: nextScene.character }] : []);
            const nextChar = bubbles[0]?.character?.image || nextScene.character?.image;
            
            await Promise.all([
                preloadImage(nextScene.background),
                preloadImage(nextChar)
            ]);

            setHistory(prev => [...prev, currentSceneKey]);
            setCurrentSceneKey(nextKey);
            setCurrentBubbleIndex(0);
            setIsSceneLoading(false);
        }
    };

    const handleNextBubble = () => {
        if (isTyping || isSceneLoading || isLastBubble) return;
        setCurrentBubbleIndex(prev => prev + 1);
    };

    const resetStory = async () => {
        if (isSceneLoading) return;
        setIsSceneLoading(true);
        const startScene = scenes['start'];
        if (startScene) {
            const bubbles = startScene.bubbles || (startScene.text ? [{ text: startScene.text, character: startScene.character }] : []);
            const firstChar = bubbles[0]?.character?.image || startScene.character?.image;
            await Promise.all([
                preloadImage(startScene.background),
                preloadImage(firstChar)
            ]);
        }
        setCurrentSceneKey('start');
        setCurrentBubbleIndex(0);
        setHistory([]);
        setIsSceneLoading(false);
    };

    const goBack = async () => {
        if (history.length > 0 && !isSceneLoading) {
            const newHistory = [...history];
            const prevKey = newHistory.pop();
            
            setIsSceneLoading(true);
            const prevScene = scenes[prevKey];
            if (prevScene) {
                const prevChar = prevScene.bubbles?.[0]?.character?.image || prevScene.character?.image;
                await Promise.all([
                    preloadImage(prevScene.background),
                    preloadImage(prevChar)
                ]);
            }
            
            setHistory(newHistory);
            setCurrentSceneKey(prevKey);
            setCurrentBubbleIndex(0);
            setIsSceneLoading(false);
        }
    };

    const backgroundLayer = useMemo(() => (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <AnimatePresence>
                <motion.div 
                    key={currentSceneKey + "_bg"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {currentScene.background ? (
                        <img 
                            src={currentScene.background} 
                            className="w-full h-full object-cover brightness-[0.8] dark:brightness-[0.4] contrast-[1.1]" 
                            alt="Background"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-b from-slate-100 to-white dark:from-slate-800 dark:to-slate-950" />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    ), [currentSceneKey, currentScene.background]);

    const characterLayer = useMemo(() => (
        <div className="flex-1 relative z-10 flex items-end justify-center pointer-events-none min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
                {currentBubble.character && (
                    <motion.div 
                        key={currentBubble.character.image}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: 10 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-sm md:max-w-md h-full flex items-end justify-center px-4 absolute bottom-0"
                    >
                        <img 
                            src={currentBubble.character.image} 
                            className="max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            alt={currentBubble.character.name}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    ), [currentBubble.character]);

    if (isInitialLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto py-0 md:py-8 h-full min-h-[500px] md:min-h-[750px] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-teal-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h3 
                            className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-widest"
                            style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                        >
                            Menyiapkan Cerita
                        </h3>
                        <p 
                            className="text-slate-400 text-xs font-medium uppercase tracking-tighter"
                            style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                        >
                            Membuat dunia imajinasimu...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-0 md:py-8 h-[600px] md:h-[800px] flex flex-col">
            <div className="bg-white dark:bg-slate-900 rounded-none md:rounded-[3rem] shadow-2xl border-x-0 md:border-4 border-slate-200 dark:border-slate-800 overflow-hidden relative flex-1 flex flex-col">
                
                {/* Scene Loading Overlay */}
                <AnimatePresence>
                    {isSceneLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center"
                        >
                            <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {backgroundLayer}

                {/* 2. Top UI Controls */}
                <div className="relative z-20 px-6 py-5 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                        <h2 
                            className="text-slate-800 dark:text-white font-black uppercase tracking-tighter text-sm md:text-lg opacity-80 transition-colors"
                            style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                        >
                            {title || "Pilih Jalur"}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button 
                            onClick={goBack}
                            disabled={history.length === 0}
                            className="p-2.5 bg-slate-100 dark:bg-white/10 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-all disabled:opacity-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm"
                        >
                            <History className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <button 
                            onClick={resetStory}
                            className="p-2.5 bg-slate-100 dark:bg-white/10 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    </div>
                </div>

                {characterLayer}

                {/* 4. Bottom Dialogue & UI Overlay */}
                <div className="relative z-30 p-4 md:p-8 pt-0">
                    
                    {/* Scene Transition Text / Narration */}
                    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
                        
                        {/* Dialogue Box */}
                        <motion.div 
                            key={currentSceneKey + "_bubble_" + safeBubbleIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative group flex flex-col transition-colors duration-500"
                        >
                            {/* Accent Glow */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 blur-[50px] pointer-events-none" />
                            
                            {/* Character Name Badge */}
                            <AnimatePresence mode="wait">
                                {currentBubble.character && (
                                    <motion.div 
                                        key={currentBubble.character.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="absolute top-0 left-6 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-teal-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-teal-500/30 z-20"
                                        style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                                    >
                                        <User className="w-3 h-3" />
                                        {currentBubble.character.name}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dialogue Text Container */}
                            <div 
                                className="relative z-10"
                                style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                            >
                                <div className="min-h-[60px] md:min-h-[80px]">
                                        <motion.div 
                                            key={currentSceneKey + "_bubble_" + safeBubbleIndex + "_segments"}
                                            initial="hidden"
                                            animate="visible"
                                            variants={{
                                                visible: {
                                                    transition: {
                                                        staggerChildren: 0.8
                                                    }
                                                }
                                            }}
                                            className="space-y-4"
                                        >
                                            {textSegments.map((segment, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    variants={{
                                                        hidden: { opacity: 0, y: 10, filter: 'blur(10px)' },
                                                        visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
                                                    }}
                                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                                    className={cn(
                                                        "text-lg md:text-2xl leading-relaxed text-slate-800 dark:text-white/90 transition-colors",
                                                        isArabic(segment) ? "text-right dir-rtl leading-[2] font-medium" : "text-left font-black"
                                                    )}
                                                    dangerouslySetInnerHTML={{ __html: wrapArabicText(segment) }}
                                                />
                                            ))}
                                        </motion.div>
                                </div>
                            </div>

                            {/* Indicator / Controls */}
                            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 dark:border-white/5 pt-4 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        <MessageSquare className="w-3 h-3" />
                                        {isLastBubble ? "Pilih Jalurmu" : `Dialog ${safeBubbleIndex + 1}/${currentBubbles.length}`}
                                    </div>

                                    {!isTyping && !isLastBubble && (!currentBubble.options || currentBubble.options.length === 0) && (
                                        <motion.button
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            whileHover={{ x: 5 }}
                                            onClick={handleNextBubble}
                                            className="flex items-center gap-2 px-5 py-2 bg-teal-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 active:scale-95 group"
                                            style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                                        >
                                            Lanjut
                                            <ChevronRight className="w-4 h-4" />
                                        </motion.button>
                                    )}
                                </div>

                                {/* Internal Bubble Options (Jump within same scene) */}
                                <AnimatePresence mode="wait">
                                    {!isTyping && currentBubble.options && currentBubble.options.length > 0 && (
                                        <motion.div 
                                            key={`internal_opts_${safeBubbleIndex}`}
                                            initial="hidden"
                                            animate="visible"
                                            variants={{
                                                hidden: { opacity: 0 },
                                                visible: {
                                                    opacity: 1,
                                                    transition: {
                                                        staggerChildren: 0.1,
                                                        delayChildren: 0.1
                                                    }
                                                }
                                            }}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                                        >
                                            {currentBubble.options.map((bOpt, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    variants={{
                                                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                                                        visible: { opacity: 1, y: 0, scale: 1 }
                                                    }}
                                                    transition={{ 
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 30
                                                    }}
                                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(20, 184, 166, 0.15)" }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setCurrentBubbleIndex(bOpt.nextBubbleIndex)}
                                                    className="flex items-center justify-between px-4 py-3 bg-teal-500/10 dark:bg-teal-500/5 border border-teal-500/20 rounded-xl text-left transition-colors group"
                                                    style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                                                >
                                                    <span 
                                                        className={cn(
                                                            "text-[10px] font-black uppercase tracking-tight text-teal-700 dark:text-teal-400 leading-none",
                                                            isArabic(bOpt.text) && "arabic-content text-right dir-rtl leading-[1.2] pb-0.5"
                                                        )}
                                                    >
                                                        {bOpt.text}
                                                    </span>
                                                    <ChevronRight className="w-3 h-3 text-teal-500 group-hover:translate-x-1 transition-transform" />
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Options Layer (Scene Navigation) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pb-4">
                            <AnimatePresence mode="popLayout">
                                {!isTyping && isLastBubble && (!currentBubble.options || currentBubble.options.length === 0) && currentScene.options && (
                                    <motion.div 
                                        key={currentSceneKey + "_opts_container"}
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: {
                                                opacity: 1,
                                                transition: {
                                                    staggerChildren: 0.12
                                                }
                                            }
                                        }}
                                        className="contents"
                                    >
                                        {currentScene.options.map((option, idx) => (
                                            <motion.button
                                                key={idx}
                                                variants={{
                                                    hidden: { opacity: 0, x: -15, scale: 0.98 },
                                                    visible: { opacity: 1, x: 0, scale: 1 }
                                                }}
                                                transition={{ 
                                                    type: "spring",
                                                    stiffness: 350,
                                                    damping: 25
                                                }}
                                                whileHover={{ scale: 1.02, backgroundColor: "rgba(20, 184, 166, 0.08)" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleOptionClick(option.nextScene)}
                                                className="flex items-center justify-between px-6 py-4 md:py-5 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-[1.5rem] text-left transition-all group shadow-sm hover:shadow-md hover:border-teal-500/30"
                                                style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                                            >
                                                <span 
                                                    className={cn(
                                                        "text-sm md:text-base uppercase tracking-tight transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400 w-full",
                                                        isArabic(option.text) ? "text-right dir-rtl leading-[1.8] font-medium" : "text-left font-black"
                                                    )}
                                                    dangerouslySetInnerHTML={{ __html: wrapArabicText(option.text) }}
                                                />
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all shrink-0" />
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* 5. Visual Flourish / Scanlines Overlay */}
                <div className="absolute inset-0 pointer-events-none z-40 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-[0.03] dark:opacity-[0.05]" />
            </div>

            {/* Hint / Instruction */}
            <div className="mt-6 flex flex-col items-center gap-2">
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-teal-500" /> Alur cerita bergantung pada pilihanmu. Temukan akhir yang bahagia!
                 </p>
            </div>
        </div>
    );
};

export default InteractiveStoryGame;
