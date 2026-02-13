import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  RefreshCcw, 
  History, 
  Volume2, 
  VolumeX, 
  Info,
  Clock,
  Sparkles,
  User,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../utils/cn';

const InteractiveStoryGame = ({ 
  data = {
    title: "Kisah Interaktif",
    startScene: "start",
    scenes: {}
  }
}) => {
    const { title, startScene, scenes = {} } = data;
    const [currentSceneKey, setCurrentSceneKey] = useState(startScene || Object.keys(scenes)[0]);
    const [history, setHistory] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const scrollRef = useRef(null);

    const currentScene = scenes[currentSceneKey] || { text: "Error: Scene not found.", options: [] };
    
    // Auto-scroll to bottom as text types
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayText]);

    // Typewriter effect
    useEffect(() => {
        if (!currentScene.text) return;
        
        setIsTyping(true);
        setDisplayText('');
        
        let i = 0;
        const textToType = currentScene.text;
        const speed = 30; // ms per character

        const timer = setInterval(() => {
            if (i < textToType.length) {
                setDisplayText(prev => prev + textToType.charAt(i));
                i++;
            } else {
                setIsTyping(false);
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [currentSceneKey, currentScene.text]);

    const handleOptionClick = (nextScene) => {
        if (isTyping) {
            // Skip typing
            setDisplayText(currentScene.text);
            setIsTyping(false);
            return;
        }
        
        if (nextScene && scenes[nextScene]) {
            setHistory([...history, currentSceneKey]);
            setCurrentSceneKey(nextScene);
        }
    };

    const resetStory = () => {
        setCurrentSceneKey(startScene || Object.keys(scenes)[0]);
        setHistory([]);
    };

    const goBack = () => {
        if (history.length > 0) {
            const newHistory = [...history];
            const prev = newHistory.pop();
            setHistory(newHistory);
            setCurrentSceneKey(prev);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-0 md:py-8 h-full min-h-[500px] flex flex-col">
            <div className="bg-white dark:bg-slate-900 rounded-none md:rounded-[3rem] shadow-2xl border-x-0 md:border-4 border-slate-200 dark:border-slate-800 overflow-hidden relative flex-1 flex flex-col transition-colors duration-500">
                
                {/* 1. Background Layer */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentSceneKey + "_bg"}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="w-full h-full"
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
                            className="p-2.5 bg-slate-900/5 dark:bg-white/10 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-all disabled:opacity-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <History className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <button 
                            onClick={resetStory}
                            className="p-2.5 bg-slate-900/5 dark:bg-white/10 backdrop-blur-md rounded-xl text-slate-700 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    </div>
                </div>

                {/* 3. Character Sprite Layer */}
                <div className="flex-1 relative z-10 flex items-end justify-center pointer-events-none pb-48 md:pb-64">
                    <AnimatePresence mode="wait">
                        {currentScene.character && (
                            <motion.div 
                                key={currentScene.character.image}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="w-full max-w-sm md:max-w-md h-full flex items-end justify-center px-4"
                            >
                                <img 
                                    src={currentScene.character.image} 
                                    className="max-h-[80%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                    alt={currentScene.character.name}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Bottom Dialogue & UI Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-30 p-4 md:p-8 pt-0">
                    
                    {/* Scene Transition Text / Narration */}
                    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
                        
                        {/* Dialogue Box */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative group flex flex-col max-h-[40vh] md:max-h-[50vh] transition-colors duration-500"
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
                                <div className="min-h-[80px] md:min-h-[100px]">
                                    <p className={cn(
                                        "text-lg md:text-2xl font-bold leading-relaxed text-slate-800 dark:text-white/90 transition-colors",
                                        currentScene.arabic ? "font-arabic text-3xl md:text-4xl text-right dir-rtl leading-[1.8]" : "font-sans tracking-tight"
                                    )}>
                                        {displayText}
                                        {isTyping && <span className="inline-block w-2 h-5 md:w-3 md:h-6 bg-teal-400 ml-1 animate-pulse" />}
                                    </p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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
                                    >
                                        <span className={cn(
                                            "text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-tight transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400",
                                            option.arabic && "font-arabic text-lg md:text-xl text-right flex-1"
                                        )}>
                                            {option.text}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
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
