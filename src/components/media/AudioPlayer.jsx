import React from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music4
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

import { useAudio } from '../providers/AudioProvider';

const AudioPlayer = ({ src, title = 'Audio Clip' }) => {
  const { 
    currentTrack, 
    isPlaying: globalIsPlaying, 
    progress: globalProgress, 
    currentTime: globalCurrentTime,
    duration: globalDuration,
    playTrack, 
    togglePlay: globalTogglePlay,
    seek: globalSeek,
    volume,
    setVolume,
    isMuted,
    setIsMuted
  } = useAudio();

  // Determine if THIS instance is the one playing globally
  const isSelected = currentTrack?.src === src;
  
  // Use global state if selected, otherwise local/default
  const isPlaying = isSelected ? globalIsPlaying : false;
  const progress = isSelected ? globalProgress : 0;
  const currentTime = isSelected ? globalCurrentTime : 0;
  const duration = isSelected ? globalDuration : 0;

  const handleTogglePlay = () => {
    if (isSelected) {
      globalTogglePlay();
    } else {
      playTrack({ src, title });
    }
  };

  const handleSeek = (e) => {
    if (isSelected) {
      globalSeek(e.target.value);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  return (
    <div className="group relative md:bg-white/40 md:dark:bg-slate-900/40 md:backdrop-blur-xl md:rounded-[2.5rem] py-6 md:p-8 md:border md:border-slate-200 md:dark:border-white/10 w-full mx-auto md:mx-0 md:shadow-xl md:hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            
            {/* Left: Playback & Visualizer */}
            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                        <Music4 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">
                            {title}
                        </h4>
                        <div className="flex items-center gap-2">
                             <div className={cn("w-1.5 h-1.5 rounded-full bg-teal-500", isPlaying && "animate-pulse")}></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {isPlaying ? "Sedang Diputar" : "Audio Lesson"}
                             </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Controls Area */}
            <div className="w-full md:w-64 space-y-6">
                <div className="flex items-center justify-center gap-4">
                    <button 
                        onClick={handleTogglePlay}
                        className="w-16 h-16 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-white/10"
                    >
                        {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                    </button>
                </div>
            </div>
        </div>

        {/* Bottom: Progress & Volume */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Progress Bar Container */}
            <div className="flex-1 w-full space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div className="relative h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                        style={{ width: `${progress}%` }}
                    />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress || 0}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
                        disabled={!isSelected}
                    />
                </div>
            </div>

            {/* Volume Control (Only show for selected or desktop) */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-black/20 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5">
                <button onClick={() => isSelected && setIsMuted(!isMuted)} className="text-slate-400 hover:text-teal-500 transition-all">
                    {(isSelected && isMuted) || (isSelected && volume === 0) ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isSelected ? (isMuted ? 0 : volume) : 1}
                    onChange={(e) => isSelected && setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    disabled={!isSelected}
                />
            </div>
        </div>
    </div>
  );
};

export default AudioPlayer;
