import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Check, Trophy, Move } from 'lucide-react';

const MatchUpGame = ({ pairs = [], title = "Pasangkan" }) => {
    // pairs: [{ id: 1, question: '...', answer: '...' }]
    
    // State
    const [matches, setMatches] = useState({}); // questionId -> answerId
    const [availableAnswers, setAvailableAnswers] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [shuffledPairs, setShuffledPairs] = useState([]);

    // Drag State
    const [dragItem, setDragItem] = useState(null); 
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const ghostRef = useRef(null);

    // Refs for Stale Closure Prevention (Event Listeners)
    const gameStateRef = useRef({ matches: {}, availableAnswers: [], dragItem: null, shuffledPairs: [] });
    useEffect(() => {
        gameStateRef.current = { matches, availableAnswers, dragItem, shuffledPairs };
    }, [matches, availableAnswers, dragItem, shuffledPairs]);

    // Initialize
    useEffect(() => {
        resetGame();
    }, [pairs]);

    const resetGame = () => {
        // Shuffle pairs for questions (optional, usually questions are fixed, answers shuffled)
        // Actually, usually Questions are fixed order, Answers are shuffled.
        const shuffled = [...pairs].map(p => ({ ...p, answerId: p.id })); // answerId same as pair id for correctness
        
        // Shuffle answers pool
        const answers = shuffled.map(p => ({ id: p.id, text: p.answer })).sort(() => Math.random() - 0.5);
        
        setShuffledPairs(shuffled);
        setAvailableAnswers(answers);
        setMatches({});
        setIsSubmitted(false);
        setScore(0);
    };

    // --- Drag & Drop Logic ---

    const handleDragStart = (e, item) => {
        if (isSubmitted) return;
        // item: { id, text, origin: 'pool' | 'slot', questionId }
        e.preventDefault(); // Prevent text selection
        
        const touch = e.touches ? e.touches[0] : e;
        setDragItem(item);
        setDragPosition({ x: touch.clientX, y: touch.clientY });

        // Add event listeners to window for smooth dragging outside component
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    };

    const handleDragMove = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        setDragPosition({ x: touch.clientX, y: touch.clientY });
        e.preventDefault(); // Prevent scrolling on mobile while dragging!
    };

    const handleDragEnd = (e) => {
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Hide ghost momentarily
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        let elemBelow = document.elementFromPoint(x, y);
        if (ghostRef.current) ghostRef.current.style.display = 'block';

        let slot = elemBelow?.closest('[data-droppable="true"]');
        
        // Fallback: Manual Collision Detection (Hit Testing)
        // This is robust against z-index issues, ghost elements, or pointer-events quirks.
        if (!slot) {
            const allSlots = document.querySelectorAll('[data-droppable="true"]');
            for (const s of allSlots) {
                const rect = s.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    slot = s;
                    break;
                }
            }
        }
        
        // Cleanup listeners
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
        
        if (slot) {
            const questionId = slot.getAttribute('data-question-id');
            console.log("Dropped on Q:", questionId, "Item:", gameStateRef.current.dragItem);
            handleDrop(questionId);
        } else {
             // Dropped elsewhere? 
             // If from slot, return to pool.
             const currentDragItem = gameStateRef.current.dragItem;
             if (currentDragItem?.origin === 'slot') {
                 returnAnswerToPool(currentDragItem.id, currentDragItem.questionId);
             }
        }
        setDragItem(null);
    };

    const handleDrop = (targetQuestionId) => {
        // Access LATEST state from Ref
        const { matches: currentMatches, availableAnswers: currentPool, dragItem: currentDragItem, shuffledPairs: currentPairs } = gameStateRef.current;
        
        if (!currentDragItem) return;

        const draggedAnswerId = currentDragItem.id;
        
        // 1. Calculate New Matches
        let newMatches = { ...currentMatches };
        const existingAnswerId = newMatches[targetQuestionId]; 
        
        if (currentDragItem.origin === 'slot') {
             delete newMatches[currentDragItem.questionId];
        }

        newMatches[targetQuestionId] = draggedAnswerId;
        
        // 2. Calculate New Available Answers Pool
        let newPool = [...currentPool];
        
        if (currentDragItem.origin === 'pool') {
             newPool = newPool.filter(a => a.id !== draggedAnswerId);
        }
        
        if (existingAnswerId && existingAnswerId != draggedAnswerId) {
             const pair = currentPairs.find(p => p.id === parseInt(existingAnswerId));
             if (pair) {
                 newPool.push({ id: pair.id, text: pair.answer });
             }
        }

        setMatches(newMatches);
        setAvailableAnswers(newPool);
    };

    const returnAnswerToPool = (answerId, fromQuestionId) => {
          const { matches: currentMatches, availableAnswers: currentPool, shuffledPairs: currentPairs } = gameStateRef.current;

          // Remove from matches
          const nextMatches = { ...currentMatches };
          delete nextMatches[fromQuestionId];
          setMatches(nextMatches);

          // Add back to pool
          const pair = currentPairs.find(p => p.id === parseInt(answerId));
          if (pair) {
              setAvailableAnswers([...currentPool, { id: pair.id, text: pair.answer }]);
          }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        shuffledPairs.forEach(p => {
            if (matches[p.id] == p.id) correctCount++;
        });
        setScore(correctCount);
        setIsSubmitted(true);
    };

    // --- Render Helpers ---

    return (
        <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] p-6 select-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center">
                        <Move className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                        {title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Tarik kartu jawaban ke kotak yang sesuai.</p>
                </div>
                {isSubmitted && (
                     <div className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-lg font-bold flex items-center animate-pulse">
                         <Trophy className="w-5 h-5 mr-2" />
                         SKOR: {score} / {pairs.length}
                     </div>
                )}
            </div>

            {/* Game Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left: Questions Slots */}
                <div className="space-y-4">
                    {shuffledPairs.map(pair => {
                        const filledAnswerId = matches[pair.id];
                        const filledAnswer = filledAnswerId ? shuffledPairs.find(p => p.id === parseInt(filledAnswerId))?.answer : null;
                        
                        let statusColor = "border-[var(--color-border)]";
                        if (isSubmitted) {
                            if (filledAnswerId == pair.id) statusColor = "border-green-500 bg-green-50 dark:bg-green-900/20";
                            else statusColor = "border-red-500 bg-red-50 dark:bg-red-900/20";
                        }

                        return (

                            <div 
                                key={pair.id} 
                                className="flex items-stretch group relative z-10"
                                data-droppable="true"
                                data-question-id={pair.id}
                            >
                                {/* Question Box (Now part of drop zone visually) */}
                                <div className="w-1/2 bg-[var(--color-bg-muted)] p-4 rounded-l-xl border-y border-l border-[var(--color-border)] flex items-center font-medium text-[var(--color-text-main)] transition-colors group-hover:bg-[var(--color-bg-hover)] cursor-pointer">
                                    {pair.question}
                                </div>
                                
                                {/* Drop Slot Visuals */}
                                <div 
                                    className={`w-1/2 p-1 rounded-r-xl border-2 border-dashed transition-colors relative flex items-center justify-center ${statusColor} ${!isSubmitted && !filledAnswer ? 'group-hover:bg-[var(--color-bg-hover)]' : ''}`}
                                >
                                    {filledAnswer ? (
                                        <div 
                                            className={`w-full h-full bg-[var(--color-bg-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-3 flex items-center justify-center text-center cursor-grab active:cursor-grabbing font-bold text-[var(--color-primary)] ${isSubmitted ? 'cursor-default' : ''}`}
                                            onMouseDown={(e) => {
                                                e.stopPropagation(); // Prevent triggering parent drop logic immediately
                                                handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', questionId: pair.id });
                                            }}
                                            onTouchStart={(e) => {
                                                e.stopPropagation();
                                                handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', questionId: pair.id });
                                            }}
                                        >
                                            {filledAnswer}
                                        </div>
                                    ) : (
                                        <div className="text-[var(--color-text-muted)] opacity-30 text-xs font-bold uppercase pointer-events-none">
                                            Letakkan Disini
                                        </div>
                                    )}

                                    {/* Evaluation Icon */}
                                    {isSubmitted && (
                                        <div className="absolute right-0 top-0 -mt-2 -mr-2 bg-white dark:bg-slate-800 rounded-full shadow-md p-1">
                                            {filledAnswerId == pair.id ? 
                                                <Check className="w-4 h-4 text-green-500" /> : 
                                                <div className="w-4 h-4 text-red-500 font-bold flex items-center justify-center">✕</div>
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right: Answer Pool */}
                <div>
                     <div className={`bg-[var(--color-bg-muted)] rounded-xl p-4 min-h-[300px] border border-[var(--color-border)] transition-opacity ${isSubmitted ? 'opacity-50 pointer-events-none' : ''}`}>
                         <h4 className="text-sm font-bold text-[var(--color-text-muted)] uppercase mb-4 text-center">Plihan Jawaban</h4>
                         
                         {availableAnswers.length === 0 && !isSubmitted && (
                             <div className="text-center text-gray-400 py-10 italic">Semua jawaban telah dipasang</div>
                         )}

                         <div className="flex flex-wrap gap-3 justify-center">
                             {availableAnswers.map(ans => (
                                 <div
                                     key={ans.id}
                                     className="bg-[var(--color-bg-card)] hover:ring-2 ring-[var(--color-primary)] cursor-grab active:cursor-grabbing px-4 py-3 rounded-lg shadow-sm border border-[var(--color-border)] font-bold text-[var(--color-text-main)] transition-transform hover:-translate-y-1"
                                     onMouseDown={(e) => handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' })}
                                     onTouchStart={(e) => handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' })}
                                 >
                                     {ans.text}
                                 </div>
                             ))}
                         </div>
                     </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-center gap-4">
                 {!isSubmitted ? (
                     <button 
                        onClick={handleSubmit} 
                        className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700 transition-transform active:scale-95 flex items-center"
                        disabled={Object.keys(matches).length === 0}
                     >
                        <Check className="w-5 h-5 mr-2" />
                        Cek Jawaban
                     </button>
                 ) : (
                     <button 
                        onClick={resetGame} 
                        className="bg-gray-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-600 transition-transform active:scale-95 flex items-center"
                     >
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        Main Lagi
                     </button>
                 )}
            </div>

            {/* Ghost Drag Item (Fixed Position Overlay) */}
            {dragItem && (
                <div 
                    ref={ghostRef}
                    className="fixed z-50 pointer-events-none bg-[var(--color-primary)] text-white px-4 py-3 rounded-lg shadow-2xl font-bold opacity-90 scale-105"
                    style={{ 
                        left: dragPosition.x, 
                        top: dragPosition.y,
                        transform: 'translate(-50%, -50%)',
                        width: 'max-content'
                    }}
                >
                    {dragItem.text}
                </div>
            )}
        </div>
    );
};

export default MatchUpGame;
