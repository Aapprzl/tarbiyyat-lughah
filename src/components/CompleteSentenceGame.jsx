import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, MessageSquare } from 'lucide-react';

const CompleteSentenceGame = ({ questions = [], title = "Lengkapi Kalimat" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSegments, setCurrentSegments] = useState([]); // Array of { text, isBlank, id, answer }
  const [wordBank, setWordBank] = useState([]); // Array of { id, text, status: 'pool' | 'placed' }
  const [userSlots, setUserSlots] = useState({}); // Map slotId -> wordId
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (questions && questions.length > 0) {
      loadQuestion(0);
    }
  }, [questions]);

  const loadQuestion = (index) => {
    if (index >= questions.length) {
      setShowCelebration(true);
      return;
    }

    const q = questions[index];
    const text = q.text || "";
    
    // Parse text: "Hello {world} pattern"
    // Regex to find {word}
    const parts = text.split(/(\{.*?\})/g);
    
    const segments = [];
    const bank = [];
    let slotCounter = 0;

    parts.forEach((part, i) => {
        if (part.startsWith('{') && part.endsWith('}')) {
            const answer = part.slice(1, -1); // Remove {}
            const slotId = `slot-${slotCounter++}`;
            segments.push({ type: 'blank', id: slotId, answer, index: i });
            bank.push({ id: `word-${slotId}`, text: answer, status: 'pool' }); // Link word ID loosely to slot for dev, but strictly unique
        } else if (part.trim() !== '') {
            segments.push({ type: 'text', text: part, index: i });
        }
    });

    // Scramble bank
    const scrambledBank = [...bank].sort(() => Math.random() - 0.5);

    setCurrentSegments(segments);
    setWordBank(scrambledBank);
    setUserSlots({});
    setIsCorrect(false);
    setCurrentIndex(index);
  };

  const handleWordClick = (word) => {
    if (isCorrect) return;

    if (word.status === 'pool') {
        // Find first empty slot
        const firstEmptySlot = currentSegments.find(
            seg => seg.type === 'blank' && !userSlots[seg.id]
        );
        
        if (firstEmptySlot) {
            // Place word
            const newSlots = { ...userSlots, [firstEmptySlot.id]: word };
            const newBank = wordBank.map(w => w.id === word.id ? { ...w, status: 'placed' } : w);
            
            setUserSlots(newSlots);
            setWordBank(newBank);
            
            checkAnswer(newSlots);
        }
    }
  };

  const handleSlotClick = (segment) => {
      if (isCorrect) return;
      const word = userSlots[segment.id];
      if (word) {
          // Remove word from slot, return to pool
          const newSlots = { ...userSlots };
          delete newSlots[segment.id];
          
          const newBank = wordBank.map(w => w.id === word.id ? { ...w, status: 'pool' } : w);
          
          setUserSlots(newSlots);
          setWordBank(newBank);
      }
  };

  const checkAnswer = (currentSlots) => {
      // Check if all slots filled
      const allFilled = currentSegments
          .filter(s => s.type === 'blank')
          .every(s => currentSlots[s.id]);

      if (!allFilled) return;

      // Validate
      const allCorrect = currentSegments
          .filter(s => s.type === 'blank')
          .every(s => {
              const placedWord = currentSlots[s.id];
              return placedWord && placedWord.text === s.answer;
          });

      if (allCorrect) {
          setIsCorrect(true);
      }
  };

  const handleNext = () => {
    setScore(s => s + 10);
    loadQuestion(currentIndex + 1);
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
            <h3 className="text-2xl font-bold text-[var(--color-text-main)] mb-2">Hebat!</h3>
            <p className="text-[var(--color-text-muted)] mb-6">Kamu berhasil melengkapi semua kalimat!</p>
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

  // Detect Arabic for basic direction support
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  // Check if the overall sentence looks Arabic-heavy
  const isRTL = questions[currentIndex]?.text && isArabic(questions[currentIndex].text);

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
         {/* Header */}
         <div className="bg-[var(--color-bg-muted)] px-6 py-4 flex justify-between items-center border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-[var(--color-text-main)]">{title}</span>
            </div>
            <div className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-main)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                {currentIndex + 1} / {questions.length}
            </div>
        </div>

        <div className="p-6 md:p-10 flex flex-col items-center">
            
            {/* Sentence Area */}
            <div 
                className={`text-xl md:text-2xl leading-loose font-medium text-[var(--color-text-main)] text-center mb-10 w-full flex flex-wrap gap-2 items-center justify-center ${isRTL ? 'font-arabic' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {currentSegments.map((seg, i) => {
                    if (seg.type === 'text') {
                        return <span key={i}>{seg.text}</span>;
                    } else {
                        const filledWord = userSlots[seg.id];
                        return (
                            <span 
                                key={seg.id}
                                onClick={() => handleSlotClick(seg)}
                                className={`inline-flex items-center justify-center min-w-[80px] h-10 px-3 border-b-2 mx-1 rounded transition-all cursor-pointer select-none
                                    ${filledWord 
                                        ? isCorrect 
                                            ? 'bg-green-100 border-green-500 text-green-800'
                                            : 'bg-blue-50 border-blue-400 text-blue-800 hover:bg-red-50 hover:border-red-300' // Hint delete on hover
                                        : 'bg-gray-100 border-gray-300 animate-pulse'
                                    }
                                `}
                            >
                                {filledWord ? filledWord.text : ''}
                            </span>
                        );
                    }
                })}
            </div>

            {/* Word Bank */}
            <div className="bg-[var(--color-bg-muted)] p-6 rounded-2xl border border-[var(--color-border)] w-full mb-8">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-4 text-center">Pilihan Kata</p>
                <div className="flex flex-wrap gap-3 justify-center">
                    {wordBank.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => handleWordClick(word)}
                            disabled={word.status === 'placed' || isCorrect}
                            className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all border
                                ${word.status === 'placed'
                                    ? 'opacity-0 pointer-events-none' // Hide placed words
                                    : 'bg-white dark:bg-gray-700 text-[var(--color-text-main)] border-[var(--color-border)] hover:-translate-y-1 hover:shadow-md'
                                }
                                ${isRTL ? 'font-arabic' : ''}
                            `}
                        >
                            {word.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feedback & Next */}
            <div className="h-16 flex items-center justify-center w-full">
                {isCorrect ? (
                     <button 
                        onClick={handleNext}
                        className="px-8 py-3 bg-teal-600 text-white rounded-full font-bold shadow-lg hover:bg-teal-700 hover:scale-105 transition-all flex items-center gap-2 animate-bounce-short"
                    >
                        <Check className="w-5 h-5" />
                        {currentIndex + 1 < questions.length ? 'Lanjut' : 'Selesai'}
                    </button>
                ) : (
                    <div className="text-[var(--color-text-muted)] text-sm italic">
                        Isi semua bagian kosong dengan benar.
                    </div>
                )}
            </div>

        </div>
    </div>
  );
};

export default CompleteSentenceGame;
