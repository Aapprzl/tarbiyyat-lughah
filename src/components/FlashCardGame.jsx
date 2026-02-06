import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, RefreshCcw, Shuffle, Sparkles, Languages, Volume2, VolumeX } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '../utils/cn';

const FlashCardGame = ({ items = [], title = "Flash Card" }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState(new Set());
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

  useEffect(() => {
    if (items && items.length > 0) {
      setCards(items);
    }
  }, [items]);

  const handleShuffle = () => {
    playSound(clickSound);
    playSound(successSound);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices(new Set());
  };

  const handleReset = () => {
    playSound(clickSound);
    setCards(items);
    setFlippedIndices(new Set());
  };

  const toggleFlip = (idx) => {
    playSound(clickSound);
    const newFlipped = new Set(flippedIndices);
    if (newFlipped.has(idx)) {
      newFlipped.delete(idx);
    } else {
      newFlipped.add(idx);
    }
    setFlippedIndices(newFlipped);
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
           {/* Fallback icon if Layers is not imported, but it was in previous version */}
           <RotateCw className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-bold text-lg">Belum ada kartu</h3>
        <p className="text-slate-500 text-sm mt-1">Tambahkan kosakata melalui panel admin untuk mulai bermain.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 select-none">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
              <span className="text-4xl">🃏</span> Flash <span className="text-teal-500 italic">Card</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
              Ketuk kartu untuk melihat jawaban. Latih ingatanmu setiap hari!
           </p>
        </div>
      </div>

      {/* Grid Area */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 px-2 md:px-0">
        <AnimatePresence mode="popLayout">
          {cards.map((item, idx) => (
            <motion.div
              layout
              key={item.id || idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="perspective-1000 h-[160px] md:h-[240px] group cursor-pointer"
              onClick={() => toggleFlip(idx)}
            >
              <motion.div
                className="relative w-full h-full transition-all duration-500 transform-style-3d bg-transparent rounded-[2rem]"
                animate={{ 
                  rotateY: flippedIndices.has(idx) ? 180 : 0,
                  scale: flippedIndices.has(idx) ? [1, 1.05, 1] : [1, 1.05, 1]
                }}
                transition={{ 
                  rotateY: { type: "spring", stiffness: 300, damping: 25 },
                  scale: { duration: 0.4 }
                }}
              >
                {/* FRONT (Arabic) - Vibrant Teal Gradient */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[1.5rem] md:rounded-[2rem] border-2 border-white/20 flex flex-col items-center justify-center p-4 md:p-8 transition-all group-hover:border-white/40 overflow-hidden shadow-lg">
                   <div className="font-arabic font-black transition-all text-center leading-tight text-3xl md:text-6xl text-white drop-shadow-md">
                      {item.front}
                   </div>
                </div>

                {/* BACK (Indonesian) - Vibrant Cyan/Indigo Gradient */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center p-4 md:p-8 text-center border-2 md:border-4 border-white/20 shadow-inner overflow-hidden">
                   <div className="font-black text-white transition-all text-center drop-shadow-md leading-tight text-sm md:text-2xl px-2">
                      {item.back}
                   </div>
                   <div className="mt-2 md:mt-4 flex items-center gap-2 text-white/50 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                      <RotateCw className="w-3 h-3" /> Klik balik
                   </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button 
           onClick={handleShuffle}
           className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-3 active:scale-95"
        >
           <Shuffle className="w-5 h-5" /> Acak Kartu
        </button>
         <button 
            onClick={handleReset}
            className="px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 border border-slate-200 dark:border-white/10"
         >
            <RefreshCcw className="w-4 h-4" /> Reset
         </button>
         <button 
            onClick={toggleMute}
            className="p-4 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-teal-500 rounded-2xl border border-slate-200 dark:border-white/10 transition-colors shadow-lg active:scale-95"
         >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
         </button>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FlashCardGame;
