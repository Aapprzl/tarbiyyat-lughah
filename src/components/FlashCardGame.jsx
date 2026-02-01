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
      <div className="p-4 md:p-8 flex flex-col items-center min-h-[500px]">
         
         {/* Card Container */}
         <div 
            className="relative w-full max-w-lg min-h-[350px] cursor-pointer perspective-1000 group mb-6"
            onClick={handleFlip}
         >
            <div 
                className={`w-full h-full relative transition-all duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ minHeight: '350px' }}
            >
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 border-indigo-400/50">
                    <span className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2 flex-shrink-0">Depan (Pertanyaan)</span>
                    
                    <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar my-2">
                         <h3 className="text-2xl md:text-4xl font-bold text-white leading-relaxed dir-rtl px-2 break-words max-w-full" style={{ fontFamily: 'var(--font-arabic)' }}>
                            {currentItem.front}
                        </h3>
                    </div>

                    <p className="mt-2 text-white/50 text-xs flex items-center gap-2 animate-pulse flex-shrink-0">
                        <RotateCw className="w-4 h-4" /> Klik untuk balik
                    </p>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 border-[var(--color-border)]">
                     <span className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest mb-2 flex-shrink-0">Belakang (Jawaban)</span>
                     
                     <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar my-2">
                        <h3 className="text-xl md:text-3xl font-bold text-[var(--color-text-main)] leading-relaxed px-2 break-words max-w-full">
                            {currentItem.back}
                        </h3>
                     </div>
                </div>
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-4 md:gap-8 w-full justify-center">
            <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-3 md:p-4 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-[var(--color-border)] active:scale-95"
            >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button 
                onClick={handleFlip}
                className="flex-1 max-w-[200px] px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
                <RotateCw className="w-4 h-4" />
                Putar
            </button>

            <button 
                onClick={handleNext}
                disabled={currentIndex === items.length - 1}
                className="p-3 md:p-4 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-[var(--color-border)] active:scale-95"
            >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
         </div>

      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        /* Custom scrollbar for inside card */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default FlashCardGame;
