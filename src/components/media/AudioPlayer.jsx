import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Repeat1,
  Music4
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const AudioPlayer = ({ src, title = 'Audio Clip' }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Sophisticated Waveform Visualizer
  const [bars, setBars] = useState(new Array(32).fill(15));
  const animationRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        // Generate a more "fluid" waveform look
        setBars(prev => prev.map((h, i) => {
           const target = Math.max(15, Math.random() * 80);
           return h + (target - h) * 0.2; // Smooth interpolation
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      cancelAnimationFrame(animationRef.current);
      // Gently return to baseline instead of instant snap
      const reset = () => {
         setBars(prev => {
            const next = prev.map(h => h + (15 - h) * 0.1);
            if (next.every(h => Math.abs(h - 15) < 1)) return new Array(32).fill(15);
            animationRef.current = requestAnimationFrame(reset);
            return next;
         });
      };
      reset();
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
  };

  const skip = (amount) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + amount));
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(curr);
      setDuration(total || 0);
      setProgress((curr / total) * 100);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const toggleSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
        audioRef.current.volume = v;
        audioRef.current.muted = v === 0;
        setIsMuted(v === 0);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  return (
    <div className="group relative md:bg-white/40 md:dark:bg-slate-900/40 md:backdrop-blur-xl md:rounded-[2.5rem] py-6 md:p-8 md:border md:border-slate-200 md:dark:border-white/10 w-full max-w-3xl mx-auto md:mx-0 md:shadow-xl md:hover:shadow-2xl transition-all duration-500 overflow-hidden">
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
                             <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audio Lesson Block</span>
                        </div>
                    </div>
                </div>

                {/* Waveform Visualizer */}
                <div className="h-20 bg-slate-50 dark:bg-black/20 rounded-[1.5rem] flex items-center justify-center gap-[3px] px-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group/viz">
                    {bars.map((height, i) => (
                        <motion.div 
                            key={i} 
                            className="w-1.5 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full"
                            animate={{ 
                                height: `${height}%`,
                                opacity: isPlaying ? 1 : 0.3
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                    ))}
                    {!isPlaying && currentTime === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-[1px] opacity-0 group-hover/viz:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-sm">
                                Ready to Play
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Controls Area */}
            <div className="w-full md:w-64 space-y-6">
                <div className="flex items-center justify-center gap-4">
                    <button 
                        onClick={() => skip(-10)}
                        className="p-2 text-slate-400 hover:text-teal-500 transition-all active:scale-90"
                        title="Mundur 10 detik"
                    >
                        <SkipBack className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-white/10"
                    >
                        {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                    </button>

                    <button 
                        onClick={() => skip(10)}
                        className="p-2 text-slate-400 hover:text-teal-500 transition-all active:scale-90"
                        title="Maju 10 detik"
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                </div>

                {/* Speed & Loop Row */}
                <div className="flex items-center justify-center gap-6">
                    <button 
                        onClick={toggleSpeed}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-teal-500 transition-all bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full"
                    >
                        {speed}x Speed
                    </button>
                    <button 
                        onClick={() => setIsLooping(!isLooping)}
                        className={cn(
                            "p-2 rounded-full transition-all",
                            isLooping ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "text-slate-400 hover:text-slate-600"
                        )}
                        title="Ulangi otomatis"
                    >
                        {isLooping ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-black/20 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5">
                <button onClick={toggleMute} className="text-slate-400 hover:text-teal-500 transition-all">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
            </div>
        </div>

        <audio 
            ref={audioRef} 
            src={src} 
            loop={isLooping}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => !isLooping && setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
        />
    </div>
  );
};

export default AudioPlayer;
