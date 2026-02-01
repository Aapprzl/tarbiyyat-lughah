import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, ArrowRightLeft } from 'lucide-react';

const UnjumbleGame = ({ questions = [], title = "Susun Kalimat" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  const [poolWords, setPoolWords] = useState([]); // Array of { id, text }
  const [selectedWords, setSelectedWords] = useState([]); // Array of { id, text }
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (questions && questions.length > 0) {
      loadQuestion(0);
    }
  }, [questions]);

  // Helper to detect Arabic
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

  const loadQuestion = (index) => {
    if (index >= questions.length) {
      setShowCelebration(true);
      return;
    }

    const q = questions[index];
    const originalText = q.text || "";
    
    // Split into words, keeping punctuation attached for now or better splitting?
    // Simple space split is usually enough for "Unjumble" games.
    const words = originalText.split(/\s+/).filter(w => w.trim() !== '');
    
    const wordObjects = words.map((text, i) => ({
        id: `${index}-${i}`,
        text: text
    }));

    // Scramble
    let scrambled = [...wordObjects].sort(() => Math.random() - 0.5);
    // Ensure not already sorted (if len > 1)
    if (scrambled.map(w => w.text).join(' ') === originalText && words.length > 1) {
        scrambled = [...wordObjects].sort(() => Math.random() - 0.5);
    }

    setCurrentQuestion(q);
    setCurrentIndex(index);
    setPoolWords(scrambled);
    setSelectedWords([]);
    setIsCorrect(false);
  };

  const handleWordClick = (word, source) => {
    if (isCorrect) return;

    if (source === 'pool') {
        const newPool = poolWords.filter(w => w.id !== word.id);
        const newSelected = [...selectedWords, word];
        
        setPoolWords(newPool);
        setSelectedWords(newSelected);
        
        checkAnswer(newSelected);
    } else {
        // Return to pool
        const newSelected = selectedWords.filter(w => w.id !== word.id);
        const newPool = [...poolWords, word];
        
        setSelectedWords(newSelected);
        setPoolWords(newPool);
    }
  };

  const checkAnswer = (currentSelected) => {
      const targetSentence = currentQuestion.text.trim().split(/\s+/).join(' '); // Normalize spaces
      const targetWordsCount = targetSentence.split(' ').length;

      // Only check if we have placed all words
      if (currentSelected.length !== targetWordsCount) return;
      
      const formedSentence = currentSelected.map(w => w.text).join(' ');

      if (formedSentence === targetSentence) {
          setIsCorrect(true);
      }
  };

  const handleNext = () => {
    setScore(s => s + 10);
    loadQuestion(currentIndex + 1);
  };

  const handleReset = () => {
      loadQuestion(currentIndex);
  };

  if (!questions || questions.length === 0) {
     return <div className="text-center p-4 text-gray-500">Belum ada pertanyaan.</div>;
  }

  if (showCelebration) {
    return (
        <div className="bg-[var(--color-bg-card)] p-8 rounded-xl border border-[var(--color-border)] text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-text-main)] mb-2">Luar Biasa!</h3>
            <p className="text-[var(--color-text-muted)] mb-6">Semua kalimat berhasil disusun!</p>
            <div className="font-bold text-lg text-teal-600 mb-6">Skor Akhir: {score}</div>
            <button 
                onClick={() => {
                    setScore(0);
                    setShowCelebration(false);
                    loadQuestion(0);
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition"
            >
                Main Lagi
            </button>
        </div>
    );
  }

  const isRTL = currentQuestion && isArabic(currentQuestion.text);

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
         {/* Header */}
         <div className="bg-[var(--color-bg-muted)] px-6 py-4 flex justify-between items-center border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-[var(--color-text-main)]">{title}</span>
            </div>
            <div className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-main)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                {currentIndex + 1} / {questions.length}
            </div>
        </div>

        <div className="p-6 md:p-10 flex flex-col items-center">
             
             {/* Target Area (Sentence Line) */}
             <div 
                className={`min-h-[80px] w-full bg-[var(--color-bg-muted)] rounded-2xl border-2 border-dashed border-[var(--color-border)] mb-8 flex flex-wrap gap-2 p-4 items-center justify-center transition-colors
                    ${isCorrect ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : ''}
                `}
                dir={isRTL ? 'rtl' : 'ltr'}
             >
                 {selectedWords.length === 0 ? (
                     <span className="text-[var(--color-text-muted)] text-sm italic">
                         Ketuk kata-kata di bawah untuk menyusun kalimat.
                     </span>
                 ) : (
                     selectedWords.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => handleWordClick(word, 'selected')}
                            disabled={isCorrect}
                            className={`px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-[var(--color-border)] font-medium text-[var(--color-text-main)] hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all text-lg
                              ${isArabic(word.text) ? 'font-arabic' : ''}
                            `}
                        >
                            {word.text}
                        </button>
                     ))
                 )}
             </div>

             {/* Feedback */}
             {isCorrect && (
                 <div className="mb-8 animate-bounce bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                    <Check className="w-5 h-5" />
                    Benar!
                 </div>
             )}

             {/* Word Pool */}
             <div className="flex flex-wrap gap-3 justify-center mb-8 max-w-2xl">
                 {poolWords.map((word) => (
                     <button
                        key={word.id}
                        onClick={() => handleWordClick(word, 'pool')}
                        disabled={isCorrect}
                        className={`px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all text-lg
                            ${isArabic(word.text) ? 'font-arabic' : ''}
                        `}
                     >
                         {word.text}
                     </button>
                 ))}
                 {poolWords.length === 0 && !isCorrect && selectedWords.length > 0 && (
                     <div className="w-full text-center text-red-400 font-bold text-sm animate-pulse">
                         Susunan belum tepat, coba atur ulang.
                     </div>
                 )}
             </div>

             {/* Actions */}
             <div className="flex gap-4">
                <button 
                    onClick={handleReset}
                    className="p-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] rounded-full transition-colors"
                    title="Ulangi"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
                
                {isCorrect && (
                    <button 
                        onClick={handleNext}
                        className="px-6 py-3 bg-purple-600 text-white rounded-full font-bold shadow-lg hover:bg-purple-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        Lanjut <div className="w-px h-4 bg-purple-400 mx-1"></div> {currentIndex + 1 < questions.length ? 'Berikutnya' : 'Selesai'}
                    </button>
                )}
             </div>

        </div>
    </div>
  );
};

export default UnjumbleGame;
