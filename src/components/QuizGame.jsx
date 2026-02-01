import React, { useState } from 'react';
import { Check, X, Trophy, RefreshCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const QuizGame = ({ questions = [], title = "Kuis Pilihan Ganda" }) => {
  const { theme } = useTheme();
  
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false); // To freeze interaction after click

  const currentQuestion = questions[currentIndex];

  // Helper to detect Arabic
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  
  const handleOptionClick = (option) => {
    if (isAnswered) return;
    
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      setScore(prev => prev + 1);
    }

    // Auto next after delay? Or manual? 
    // Wordwall usually waits or has a "Next" button. 
    // Let's do a "Next" button for better control/learning.
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOptionId(null);
    setIsAnswered(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)]">Belum ada pertanyaan quiz.</p>
      </div>
    );
  }

  // Final Result Screen
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
           <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--color-text-main)] mb-2">Quiz Selesai!</h3>
        <p className="text-[var(--color-text-muted)] mb-6">Kamu berhasil menjawab</p>
        
        <div className="text-5xl font-black text-[var(--color-primary)] mb-8">
          {score} <span className="text-2xl text-[var(--color-text-muted)] font-bold">/ {questions.length}</span>
        </div>

        <div className="flex justify-center gap-4">
           <button 
             onClick={resetGame}
             className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-teal-700 transition-all shadow-lg flex items-center"
           >
             <RefreshCcw className="w-4 h-4 mr-2" />
             Ulangi Quiz
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--color-bg-muted)] px-6 py-4 flex justify-between items-center border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-bold text-[var(--color-text-main)]">{title}</span>
        </div>
        <div className="text-xs font-bold bg-[var(--color-bg-main)] px-3 py-1 rounded-full text-[var(--color-text-muted)] border border-[var(--color-border)]">
           {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--color-border)] h-1">
         <div 
           className="bg-[var(--color-primary)] h-1 transition-all duration-500"
           style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
         ></div>
      </div>

      <div className="p-6 md:p-8">
         {/* Question */}
         <h4 
            className={`text-xl md:text-2xl font-bold text-[var(--color-text-main)] mb-8 leading-relaxed ${isArabic(currentQuestion.text) ? 'font-arabic text-right' : ''}`}
            dir={isArabic(currentQuestion.text) ? 'rtl' : 'ltr'}
         >
            {currentQuestion.text}
         </h4>

         {/* Options Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => {
               const isSelected = selectedOptionId === option.id;
               const isCorrect = option.isCorrect;
               
               // Determine Style based on state
               let containerClass = "border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]";
               let icon = null;

               if (isAnswered) {
                 if (isCorrect) {
                    // Always highlight correct answer in green if answered
                    containerClass = "border-green-500 bg-green-50 dark:bg-green-900/20";
                    icon = <Check className="w-5 h-5 text-green-600" />;
                 } else if (isSelected && !isCorrect) {
                    // Highlight selected wrong answer in red
                    containerClass = "border-red-500 bg-red-50 dark:bg-red-900/20";
                    icon = <X className="w-5 h-5 text-red-600" />;
                 } else {
                    // Dim others
                    containerClass = "border-[var(--color-border)] opacity-50";
                 }
               } else {
                  // Interactive state
                  if (isSelected) containerClass = "border-[var(--color-primary)] bg-teal-50 dark:bg-teal-900/10";
               }

               return (
                 <button
                   key={option.id}
                   onClick={() => handleOptionClick(option)}
                   disabled={isAnswered}
                   className={`relative p-4 rounded-xl text-left transition-all flex items-center justify-between group ${containerClass}`}
                 >
                    <span className={`font-medium ${isAnswered && isCorrect ? 'text-green-700 dark:text-green-400 font-bold' : 'text-[var(--color-text-main)]'} ${isArabic(option.text) ? 'font-arabic text-lg' : ''}`}>
                      {option.text}
                    </span>
                    {icon}
                 </button>
               );
            })}
         </div>

         {/* Footer / Next Button */}
         {isAnswered && (
            <div className="mt-8 flex justify-end animate-slide-up">
               <button 
                 onClick={nextQuestion}
                 className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md flex items-center"
               >
                 {currentIndex < questions.length - 1 ? 'Pertanyaan Selanjutnya' : 'Lihat Hasil'}
                 <ArrowRight className="w-4 h-4 ml-2" />
               </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default QuizGame;
