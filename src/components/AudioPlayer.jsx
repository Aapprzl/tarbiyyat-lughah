import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({ src, title = 'Audio Clip' }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Fake Visualizer Bars
  const [bars, setBars] = useState(new Array(40).fill(10));
  const animationRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setBars(prev => prev.map(() => Math.max(10, Math.random() * 100)));
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      cancelAnimationFrame(animationRef.current);
      setBars(new Array(40).fill(10)); // Reset to flat
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
    setIsPlaying(!isPlaying);
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
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)] w-full max-w-2xl mx-auto md:mx-0">
        <h4 className="font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                🎵
            </span>
            {title}
        </h4>

        {/* Fake Visualizer Area */}
        <div className="h-24 bg-[var(--color-bg-muted)] rounded-xl mb-4 overflow-hidden flex items-end justify-center gap-[2px] px-4 py-2 border border-[var(--color-border)]">
             {bars.map((height, i) => (
                 <div 
                    key={i} 
                    className="w-2 bg-teal-500/50 rounded-t-sm transition-all duration-75 ease-in-out"
                    style={{ height: `${height}%`, opacity: isPlaying ? 0.8 : 0.3 }}
                 />
             ))}
             {!isPlaying && currentTime === 0 && (
                <div className="absolute self-center text-[var(--color-text-muted)] text-sm font-medium">
                   Klik Play untuk memutar
                </div>
             )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-text-muted)]">
                <span>{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress || 0}
                    onChange={handleSeek}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    style={{ backgroundSize: `${progress}% 100%` }}
                />
                <span>{formatTime(duration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between mt-2">
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/30"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>

                <button 
                    onClick={toggleSpeed}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text-main)] text-xs font-bold hover:bg-[var(--color-bg-hover)] transition-colors border border-[var(--color-border)]"
                >
                    {speed}x
                </button>
            </div>
        </div>

        <audio 
            ref={audioRef} 
            src={src} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            // No crossOrigin needed
        />
    </div>
  );
};

export default AudioPlayer;
