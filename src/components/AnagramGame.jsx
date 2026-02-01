import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, HelpCircle, Shuffle } from 'lucide-react';

const AnagramGame = ({ questions = [], title = "Anagram" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]); // Array of { id, char } or null
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
    // Allow all chars, just remove spaces. uppercase is fine for latin, no-op for arabic
    const answer = q.answer.replace(/\s/g, '').toUpperCase(); 
    const letters = answer.split('').map((char, i) => ({ id: i, char }));
    
    // Scramble
    let scrambled = [...letters].sort(() => Math.random() - 0.5);
    if (scrambled.map(l => l.char).join('') === answer && answer.length > 1) {
       scrambled = [...letters].sort(() => Math.random() - 0.5);
    }

    setCurrentQuestion(q);
    setCurrentIndex(index);
    setScrambledLetters(scrambled);
    setSelectedLetters(Array(answer.length).fill(null));
    setIsCorrect(false);
  };

  const handleLetterClick = (letter, source) => {
    if (isCorrect) return;

    if (source === 'pool') {
      const firstEmptyIndex = selectedLetters.findIndex(l => l === null);
      if (firstEmptyIndex !== -1) {
        const newSelected = [...selectedLetters];
        newSelected[firstEmptyIndex] = letter;
        setSelectedLetters(newSelected);

        const newScrambled = scrambledLetters.filter(l => l.id !== letter.id);
        setScrambledLetters(newScrambled);
        checkAnswer(newSelected);
      }
    } else {
      const newSelected = [...selectedLetters];
      const index = newSelected.findIndex(l => l && l.id === letter.id);
      if (index !== -1) {
        newSelected[index] = null;
        setSelectedLetters(newSelected);
        setScrambledLetters([...scrambledLetters, letter]);
      }
    }
  };

  const checkAnswer = (currentSelected) => {
    if (currentSelected.some(l => l === null)) return;

    const userAnswer = currentSelected.map(l => l.char).join('');
    const correctAnswer = currentQuestion.answer.replace(/\s/g, '').toUpperCase();

    if (userAnswer === correctAnswer) {
      setIsCorrect(true);
    }
  };

  const handleNext = () => {
    setScore(s => s + 10);
    loadQuestion(currentIndex + 1);
  };

  const handleReset = () => {
     if (!currentQuestion) return;
     const answer = currentQuestion.answer.replace(/\s/g, '').toUpperCase();
     const letters = answer.split('').map((char, i) => ({ id: i, char }));
     setScrambledLetters(letters.sort(() => Math.random() - 0.5));
     setSelectedLetters(Array(answer.length).fill(null));
     setIsCorrect(false);
  };

  if (!questions || questions.length === 0) {
     return <div className="text-center p-4 text-gray-500">Belum ada pertanyaan anagram.</div>;
  }

  if (showCelebration) {
      return (
          <div className="bg-[var(--color-bg-card)] p-8 rounded-xl border border-[var(--color-border)] text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text-main)] mb-2">Selamat!</h3>
              <p className="text-[var(--color-text-muted)] mb-6">Kamu telah menyelesaikan semua kata!</p>
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

  if (!currentQuestion) return <div>Loading...</div>;

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--color-bg-muted)] px-6 py-4 flex justify-between items-center border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-[var(--color-text-main)]">{title}</span>
            </div>
            <div className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-main)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                {currentIndex + 1} / {questions.length}
            </div>
        </div>

        {/* Game Area */}
        <div className="p-6 md:p-10 flex flex-col items-center">
            
            {/* Clue */}
            <div className="mb-8 text-center">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2 block">Petunjuk</span>
                <p className="text-lg md:text-xl font-medium text-[var(--color-text-main)]">
                    {currentQuestion.clue || "Susun huruf menjadi kata yang benar"}
                </p>
            </div>

            {/* Slots (Answer Area) */}
            <div className={`flex flex-wrap gap-2 justify-center mb-12 min-h-[64px] ${currentQuestion && isArabic(currentQuestion.answer) ? 'flex-row-reverse' : ''}`}>
                {selectedLetters.map((letter, idx) => (
                    <button
                        key={idx}
                        onClick={() => letter && handleLetterClick(letter, 'slot')}
                        disabled={!letter || isCorrect}
                        className={`w-12 h-14 md:w-14 md:h-16 rounded-lg text-2xl font-bold flex items-center justify-center border-b-4 transition-all
                            ${letter 
                                ? isCorrect 
                                    ? 'bg-green-500 border-green-700 text-white transform scale-110 shadow-lg' 
                                    : 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200'
                                : 'bg-[var(--color-bg-muted)] border-[var(--color-border)] border-dashed border-2'
                            }
                            ${letter && isArabic(letter.char) ? 'font-arabic' : ''}
                        `}
                    >
                        {letter ? letter.char : ''}
                    </button>
                ))}
            </div>

            {/* Message Alert */}
            {isCorrect && (
                 <div className="mb-8 animate-bounce bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                    <Check className="w-5 h-5" />
                    Benar! Jawaban: {currentQuestion.answer}
                 </div>
            )}

            {/* Pool (Scrambled Letters) */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 bg-[var(--color-bg-muted)] p-6 rounded-2xl border border-[var(--color-border)] w-full max-w-lg">
                {scrambledLetters.map((letter) => (
                    <button 
                        key={letter.id}
                        onClick={() => handleLetterClick(letter, 'pool')}
                        disabled={isCorrect}
                        className={`w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-[var(--color-border)] text-lg font-bold text-[var(--color-text-main)] hover:bg-gray-50 dark:hover:bg-gray-600 hover:-translate-y-1 transition-transform active:scale-95 flex items-center justify-center ${isArabic(letter.char) ? 'font-arabic' : ''}`}
                    >
                        {letter.char}
                    </button>
                ))}
                {scrambledLetters.length === 0 && !isCorrect && (
                   <div className="text-xs text-[var(--color-text-muted)] italic flex items-center h-12">
                      Semua huruf terpakai
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
                        className="px-6 py-3 bg-teal-600 text-white rounded-full font-bold shadow-lg hover:bg-teal-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        Lanjut <div className="w-px h-4 bg-teal-400 mx-1"></div> {currentIndex + 1 < questions.length ? 'Pertanyaan Berikutnya' : 'Selesai'}
                    </button>
                )}
            </div>

        </div>
    </div>
  );
};

export default AnagramGame;
