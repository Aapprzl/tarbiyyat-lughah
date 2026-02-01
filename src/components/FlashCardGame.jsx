import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Layers } from 'lucide-react';
const FlashCardGame = ({ items = [], title = "Flash Card" }) => {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentItem = items[currentIndex];

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < items.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)]">Belum ada kartu flash card.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden select-none">
      {/* Header */}
      <div className="bg-[var(--color-bg-muted)] px-6 py-4 flex justify-between items-center border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-[var(--color-text-main)]">{title}</span>
        </div>
        <div className="text-xs font-bold bg-[var(--color-bg-main)] px-3 py-1 rounded-full text-[var(--color-text-muted)] border border-[var(--color-border)]">
           {currentIndex + 1} / {items.length}
        </div>
      </div>

      {/* Game Area */}
      <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
         
         {/* Card Container */}
         <div 
            className="relative w-full max-w-md aspect-[4/3] cursor-pointer perspective-1000 group"
            onClick={handleFlip}
         >
            <div 
                className={`w-full h-full relative transition-all duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-indigo-400/50">
                    <span className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">Depan (Pertanyaan)</span>
                    <h3 className="text-3xl md:text-5xl font-bold text-white leading-relaxed dir-rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
                        {currentItem.front}
                    </h3>
                    <p className="mt-8 text-white/50 text-xs flex items-center gap-2 animate-pulse">
                        <RotateCw className="w-4 h-4" /> Klik untuk balik
                    </p>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-[var(--color-border)]">
                     <span className="text-[var(--color-text-muted)] text-sm font-bold uppercase tracking-widest mb-4">Belakang (Jawaban)</span>
                     <h3 className="text-2xl md:text-4xl font-bold text-[var(--color-text-main)] leading-relaxed">
                        {currentItem.back}
                    </h3>
                </div>
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-8 mt-10">
            <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-[var(--color-border)]"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            <button 
                onClick={handleFlip}
                className="px-6 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
                Putar Kartu
            </button>

            <button 
                onClick={handleNext}
                disabled={currentIndex === items.length - 1}
                className="p-4 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-[var(--color-border)]"
            >
                <ArrowRight className="w-6 h-6" />
            </button>
         </div>

      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashCardGame;
