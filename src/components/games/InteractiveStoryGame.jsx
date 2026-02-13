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
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [history, setHistory] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSceneLoading, setIsSceneLoading] = useState(false);
    const scrollRef = useRef(null);

    const scenes = data.scenes || {};
    const currentScene = scenes[currentSceneKey] || { 
        text: "Pilih aksi untuk memulai...", 
        options: [],
        character: null 
    };

    // Process narrative text for mixed fonts (Arabic/Latin)
    const processedText = useMemo(() => {
        return wrapArabicText(displayText);
    }, [displayText]);

    // Auto-scroll to bottom as text types
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayText]);

    // Helper to preload images
    const preloadImage = (url) => {
        return new Promise((resolve) => {
            if (!url) resolve();
            const img = new Image();
            img.src = url;
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resolve anyway to not block forever
        });
    };

    // Initial Load
    useEffect(() => {
        const initLoad = async () => {
            const startScene = scenes['start'];
            if (startScene) {
                await Promise.all([
                    preloadImage(startScene.background),
                    preloadImage(startScene.character?.image)
                ]);
            }
            // Artificial delay for premium feel
            setTimeout(() => setIsInitialLoading(false), 1000);
        };
        initLoad();
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (isInitialLoading || isSceneLoading || !currentScene.text) return;
        
        let index = 0;
        setDisplayText('');
        setIsTyping(true);
        
        const text = currentScene.text;
        const interval = setInterval(() => {
            if (index <= text.length) {
                setDisplayText(text.substring(0, index));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [currentScene.text, isInitialLoading, isSceneLoading]);

    const handleOptionClick = async (nextKey) => {
        if (isTyping || isSceneLoading) return;
        
        const nextScene = scenes[nextKey];
        if (nextScene) {
            setIsSceneLoading(true);
            await Promise.all([
                preloadImage(nextScene.background),
                preloadImage(nextScene.character?.image)
            ]);
            setHistory(prev => [...prev, currentSceneKey]);
            setCurrentSceneKey(nextKey);
            setIsSceneLoading(false);
        }
    };

    const resetStory = async () => {
        if (isSceneLoading) return;
        setIsSceneLoading(true);
        const startScene = scenes['start'];
        if (startScene) {
            await Promise.all([
                preloadImage(startScene.background),
                preloadImage(startScene.character?.image)
            ]);
        }
        setCurrentSceneKey('start');
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
                await Promise.all([
                    preloadImage(prevScene.background),
                    preloadImage(prevScene.character?.image)
                ]);
            }
            
            setHistory(newHistory);
            setCurrentSceneKey(prevKey);
            setIsSceneLoading(false);
        }
    };

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
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                            Menyiapkan Cerita
                        </h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-tighter">
                            Membuat dunia imajinasimu...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-0 md:py-8 h-full min-h-[500px] md:min-h-[750px] flex flex-col transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-none md:rounded-[3rem] shadow-2xl border-x-0 md:border-4 border-slate-200 dark:border-slate-800 overflow-hidden relative flex-1 flex flex-col transition-colors duration-500">
                
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
                
                {/* 1. Background Layer */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <AnimatePresence>
                        <motion.div 
                            key={currentSceneKey + "_bg"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
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

                {/* 2. Top UI Controls */}
                <div className="relative z-20 px-6 py-5 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                        <h2 className="text-slate-800 dark:text-white font-black uppercase tracking-tighter text-sm md:text-lg opacity-80 transition-colors">
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

                {/* 3. Character Sprite Layer */}
                <div className="flex-1 relative z-10 flex items-end justify-center pointer-events-none min-h-[200px] overflow-hidden">
                    <AnimatePresence>
                        {currentScene.character && (
                            <motion.div 
                                key={currentScene.character.image}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="w-full max-w-sm md:max-w-md h-full flex items-end justify-center px-4 absolute bottom-0"
                            >
                                <img 
                                    src={currentScene.character.image} 
                                    className="max-h-full md:max-h-[110%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all"
                                    alt={currentScene.character.name}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Bottom Dialogue & UI Overlay */}
                <div className="relative z-30 p-4 md:p-8 pt-0">
                    
                    {/* Scene Transition Text / Narration */}
                    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
                        
                        {/* Dialogue Box */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative group flex flex-col max-h-[30vh] md:max-h-[40vh] transition-colors duration-500"
                        >
                            {/* Accent Glow */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 blur-[50px] pointer-events-none" />
                            
                            {/* Character Name Badge */}
                            {currentScene.character && (
                                <div className="absolute top-0 left-6 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-teal-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-teal-500/30 z-20">
                                    <User className="w-3 h-3" />
                                    {currentScene.character.name}
                                </div>
                            )}

                            {/* Dialogue Text - Scrollable Container */}
                            <div 
                                ref={scrollRef}
                                className="relative z-10 overflow-y-auto pr-2 custom-scrollbar scroll-smooth"
                                style={{ fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' }}
                            >
                                <style>{`
                                    .custom-scrollbar::-webkit-scrollbar {
                                        width: 4px;
                                    }
                                    .custom-scrollbar::-webkit-scrollbar-track {
                                        background: rgba(0, 0, 0, 0.05);
                                        border-radius: 10px;
                                    }
                                    .dark .custom-scrollbar::-webkit-scrollbar-track {
                                        background: rgba(255, 255, 255, 0.05);
                                    }
                                    .custom-scrollbar::-webkit-scrollbar-thumb {
                                        background: rgba(20, 184, 166, 0.3);
                                        border-radius: 10px;
                                    }
                                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                        background: rgba(20, 184, 166, 0.5);
                                    }
                                `}</style>
                                <div className="min-h-[60px] md:min-h-[80px]">
                                    <div className={cn(
                                        "text-lg md:text-2xl leading-relaxed text-slate-800 dark:text-white/90 transition-colors",
                                        isArabic(currentScene.text) ? "text-right dir-rtl leading-[2] font-medium" : "text-left font-bold"
                                    )}>
                                        <span dangerouslySetInnerHTML={{ __html: processedText }} />
                                        {isTyping && <span className="inline-block w-2 h-5 md:w-3 md:h-6 bg-teal-400 ml-1 animate-pulse" />}
                                    </div>
                                </div>
                            </div>

                            {/* Indicator */}
                            {!isTyping && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="pt-4 flex items-center justify-end gap-2 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors"
                                >
                                    <MessageSquare className="w-3 h-3" />
                                    Pilih Jalurmu
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Options Layer */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pb-4">
                            <AnimatePresence mode="popLayout">
                                {!isTyping && currentScene.options && currentScene.options.map((option, idx) => (
                                    <motion.button
                                        key={currentSceneKey + "_opt_" + idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
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
