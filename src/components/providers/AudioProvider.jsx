import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};

export const AudioProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [currentTrack, setCurrentTrack] = useState(null); // { id, src, title, artist, ... }
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Sync audio element with state
    useEffect(() => {
        const audio = audioRef.current;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
            setProgress((audio.currentTime / (audio.duration || 1)) * 100);
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Sync playback rate
    useEffect(() => {
        audioRef.current.playbackRate = speed;
    }, [speed]);

    const playTrack = (track) => {
        if (!track || !track.src) return;

        // If playing the same track, just toggle
        if (currentTrack?.src === track.src) {
            togglePlay();
            return;
        }

        // Change track
        audioRef.current.src = track.src;
        audioRef.current.load();
        audioRef.current.playbackRate = speed; // Apply current speed to new track
        audioRef.current.play()
            .then(() => {
                setCurrentTrack(track);
                setIsPlaying(true);
            })
            .catch(err => console.error("Global Audio Playback failed:", err));
    };

    const togglePlay = () => {
        if (!currentTrack) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.error("Global Audio Playback failed:", err));
        }
    };

    const stopAudio = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentTrack(null);
        setIsPlaying(false);
    };

    const seek = (percent) => {
        if (!audioRef.current.duration) return;
        const newTime = (percent / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
    };

    const value = {
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        speed,
        setSpeed,
        volume,
        setVolume: (v) => {
            setVolume(v);
            audioRef.current.volume = v;
        },
        isMuted,
        setIsMuted: (m) => {
            setIsMuted(m);
            audioRef.current.muted = m;
        },
        playTrack,
        togglePlay,
        stopAudio,
        seek
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
