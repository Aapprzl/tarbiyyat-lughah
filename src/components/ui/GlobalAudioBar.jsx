import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Music4, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../providers/AudioProvider';
import { cn } from '../../utils/cn';

const GlobalAudioBar = () => {
    const { 
        currentTrack, 
        isPlaying, 
        progress, 
        togglePlay, 
        stopAudio, 
        volume, 
        setVolume, 
        isMuted, 
        setIsMuted,
        currentTime,
        duration,
        seek,
        speed,
        setSpeed
    } = useAudio();

    if (!currentTrack) return null;

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-20 md:top-24 left-4 right-4 z-[9999] pointer-events-none"
            >
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-3 md:p-4 flex flex-col gap-2 overflow-hidden relative">
                        {/* Progress Background */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-white/5 overflow-hidden">
                            <motion.div 
                                className="h-full bg-teal-500" 
                                style={{ width: `${progress}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
                            />
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={progress || 0}
                                onChange={(e) => seek(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Icon/Art */}
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-teal-500/20">
                                <Music4 className={cn("w-5 h-5 md:w-6 md:h-6", isPlaying && "animate-pulse")} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 pr-2">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                                    {currentTrack.title || 'Playing Audio...'}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>/</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                                {/* Speed Toggle */}
                                <button 
                                    onClick={() => {
                                        const speeds = [1, 1.25, 1.5, 2, 0.5, 0.75];
                                        const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
                                        setSpeed(nextSpeed);
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-500 transition-all bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5"
                                >
                                    {speed}x
                                </button>

                                {/* Volume Desktop */}
                                <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-teal-500 transition-all">
                                        {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                </div>

                                <button 
                                    onClick={togglePlay}
                                    className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </button>
                                
                                <button 
                                    onClick={stopAudio}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                                    title="Close player"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GlobalAudioBar;
