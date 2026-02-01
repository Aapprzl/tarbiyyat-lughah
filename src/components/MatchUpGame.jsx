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

    // Selection State (for Tap interaction)
    const [selectedId, setSelectedId] = useState(null); // id of the item currently selected (from selection pool or slot)

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
        const shuffled = [...pairs].map(p => ({ ...p, answerId: p.id })); 
        // Shuffle answers pool
        const answers = shuffled.map(p => ({ id: p.id, text: p.answer })).sort(() => Math.random() - 0.5);
        
        setShuffledPairs(shuffled);
        setAvailableAnswers(answers);
        setMatches({});
        setIsSubmitted(false);
        setScore(0);
        setSelectedId(null);
    };

    // Helper to detect Arabic
    const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

    // --- Tap / Click Interaction Logic ---

    const handleItemClick = (item) => {
        if (isSubmitted) return;
        
        // item: { id, text, type: 'question' | 'answer' | 'pool', questionId? }

        // If nothing selected yet
        if (!selectedId) {
            // Can select a Question Slot (to fill) or an Answer (from pool or filled slot)
            // Actually, simplified:
            // User taps Question Slot -> Wants to fill it.
            // User taps Answer (Pool) -> Wants to place it.
            // User taps Answer (Filled) -> Wants to move it.
            
            setSelectedId(item);
            return;
        }

        // If same item clicked -> Deselect
        if (selectedId.id === item.id && selectedId.type === item.type) {
            setSelectedId(null);
            return;
        }

        // MATCHING LOGIC
        // Case 1: Source was Answer (Pool), Target is Question Slot
        if (selectedId.type === 'pool' && item.type === 'question') {
            placeAnswer(selectedId.id, item.questionId);
            setSelectedId(null);
        }
        // Case 2: Source was Question Slot (Target), Target is Answer (Pool) -> Meaning user tapped Slot then Answer
        else if (selectedId.type === 'question' && item.type === 'pool') {
            placeAnswer(item.id, selectedId.questionId);
            setSelectedId(null);
        }
        // Case 3: Swapping/Moving? (Optional, maybe later)
        else {
            // Change selection to new item
            setSelectedId(item);
        }
    };

    const placeAnswer = (answerId, questionId) => {
        // 1. Calculate New Matches
        let newMatches = { ...matches };
        const existingAnswerId = newMatches[questionId]; 
        
        // Logic similar to drop
        // If this answer was elsewhere, remove it? (Not needed for pool items, but needed for moving filled items)
        // For now, simpler tap logic: Pool -> Slot.

        newMatches[questionId] = answerId;
        
        // 2. Remove from Pool
        let newPool = availableAnswers.filter(a => a.id !== answerId);
        
        // 3. If slot had something, return it to pool
        if (existingAnswerId) {
             const pair = shuffledPairs.find(p => p.id === parseInt(existingAnswerId));
             if (pair) {
                 newPool.push({ id: pair.id, text: pair.answer });
             }
        }

        setMatches(newMatches);
        setAvailableAnswers(newPool);
    };

    const handleSlotClick = (questionId, filledAnswerId, filledAnswerText) => {
        if (isSubmitted) return;

        // If clicking a filled slot, we treat it as clicking the answer inside it (to move or deselect)
        // OR treating it as a target for a previously selected pool item.
        
        if (selectedId && selectedId.type === 'pool') {
            // Place selected pool item into this slot
            placeAnswer(selectedId.id, questionId);
            setSelectedId(null);
        } else if (filledAnswerId) {
            // Clicking an existing answer -> Select it to move (or return to pool)
            // For now, just return to pool on click? Or select?
            // Let's toggle selection.
            handleItemClick({ id: filledAnswerId, text: filledAnswerText, type: 'answer', questionId });
        } else {
            // Empty slot -> Select as target
            handleItemClick({ id: questionId, type: 'question', questionId });
        }
    };

    const handleReturnToPool = (questionId) => {
        const answerId = matches[questionId];
        if (!answerId) return;

        const nextMatches = { ...matches };
        delete nextMatches[questionId];
        setMatches(nextMatches);

        const pair = shuffledPairs.find(p => p.id === parseInt(answerId));
        if (pair) {
            setAvailableAnswers([...availableAnswers, { id: pair.id, text: pair.answer }]);
        }
    };


    // --- Drag & Drop Logic (Legacy / Hybrid) ---

    // ... (Keep existing drag logic mostly same, but update state refs)
    const handleDragStart = (e, item) => {
        if (isSubmitted) return;
        // item: { id, text, origin: 'pool' | 'slot', questionId }
        // e.preventDefault(); // removed to allow scrolling if not holding long enough? No, drag needs preventDefault usually.
        
        const touch = e.touches ? e.touches[0] : e;
        setDragItem(item);
        setDragPosition({ x: touch.clientX, y: touch.clientY });

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    };

    const handleDragMove = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        setDragPosition({ x: touch.clientX, y: touch.clientY });
        e.preventDefault(); 
    };

    const handleDragEnd = (e) => {
        // ... (Same hit testing)
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;
        
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        let elemBelow = document.elementFromPoint(x, y);
        if (ghostRef.current) ghostRef.current.style.display = 'block';

        let slot = elemBelow?.closest('[data-droppable="true"]');
        
        // Fallback hit test
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
            // Use local state dragItem since ref might be stale if we relied solely on it? No ref is better.
            const currentDragItem = gameStateRef.current.dragItem;
            if(currentDragItem) {
                 // Reuse placeAnswer logic
                 // Need to implement complex swap logic here or call placeAnswer
                 // placeAnswer assumes from Pool. If from Slot, placeAnswer logic handles clearing source?
                 // Let's implement custom logic here to be safe with existing behavior
                 handleDrop(questionId);
            }
        }
        setDragItem(null);
    };

    const handleDrop = (targetQuestionId) => {
        const { matches: currentMatches, availableAnswers: currentPool, dragItem: currentDragItem, shuffledPairs: currentPairs } = gameStateRef.current;
        if (!currentDragItem) return;

        const draggedAnswerId = currentDragItem.id;
        
        let newMatches = { ...currentMatches };
        const existingAnswerId = newMatches[targetQuestionId]; 
        
        if (currentDragItem.origin === 'slot') {
             delete newMatches[currentDragItem.questionId];
        }

        newMatches[targetQuestionId] = draggedAnswerId;
        
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
        <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] p-4 md:p-6 select-none max-w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center">
                        <Move className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                        {title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Tap jawaban lalu tap kotak kosong, atau tarik jawaban.
                    </p>
                </div>
                {isSubmitted && (
                     <div className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-lg font-bold flex items-center animate-pulse w-full md:w-auto justify-center">
                         <Trophy className="w-5 h-5 mr-2" />
                         SKOR: {score} / {pairs.length}
                     </div>
                )}
            </div>

            {/* Game Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative">
                
                {/* Left Column: Questions Slots */}
                <div className="space-y-4">
                    {shuffledPairs.map(pair => {
                        const filledAnswerId = matches[pair.id];
                        const filledAnswer = filledAnswerId ? shuffledPairs.find(p => p.id === parseInt(filledAnswerId))?.answer : null;
                        
                        let statusColor = "border-[var(--color-border)]";
                        if (isSubmitted) {
                            if (filledAnswerId == pair.id) statusColor = "border-green-500 bg-green-50 dark:bg-green-900/20";
                            else statusColor = "border-red-500 bg-red-50 dark:bg-red-900/20";
                        } else if (selectedId?.type === 'question' && selectedId.id === pair.id) {
                            statusColor = "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30";
                        }

                        // Can drop if not submitted
                        const canDrop = !isSubmitted;

                        return (
                            <div 
                                key={pair.id} 
                                className="flex flex-col md:flex-row items-stretch group relative z-10"
                                data-droppable={canDrop}
                                data-question-id={pair.id}
                            >
                                {/* Question Box */}
                                <div 
                                    className="w-full md:w-1/2 bg-[var(--color-bg-muted)] p-4 rounded-t-xl md:rounded-l-xl md:rounded-tr-none border border-[var(--color-border)] flex items-center font-medium text-[var(--color-text-main)] cursor-pointer"
                                    onClick={() => handleSlotClick(pair.id, filledAnswerId, filledAnswer)}
                                >
                                    <span className={isArabic(pair.question) ? 'font-arabic text-lg' : ''}>{pair.question}</span>
                                </div>
                                
                                {/* Drop Slot / Answer Box */}
                                <div 
                                    className={`w-full md:w-1/2 min-h-[60px] p-1 rounded-b-xl md:rounded-r-xl md:rounded-bl-none border-2 border-t-0 md:border-t-2 md:border-l-0 border-dashed transition-all relative flex items-center justify-center ${statusColor} ${!isSubmitted && !filledAnswer ? 'hover:bg-[var(--color-bg-hover)]' : ''}`}
                                    onClick={() => handleSlotClick(pair.id, filledAnswerId, filledAnswer)}
                                >
                                    {filledAnswer ? (
                                        <div 
                                            className={`w-full h-full bg-[var(--color-bg-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-3 flex items-center justify-center text-center font-bold text-[var(--color-primary)] relative ${isSubmitted ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                                            onMouseDown={(e) => {
                                                e.stopPropagation(); 
                                                handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', questionId: pair.id });
                                            }}
                                            onTouchStart={(e) => {
                                                e.stopPropagation();
                                                handleDragStart(e, { id: filledAnswerId, text: filledAnswer, origin: 'slot', questionId: pair.id });
                                            }}
                                            style={{ touchAction: 'none' }} // Prevent scrolling
                                        >
                                            <span className={isArabic(filledAnswer) ? 'font-arabic text-lg' : ''}>{filledAnswer}</span>
                                            {!isSubmitted && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReturnToPool(pair.id);
                                                    }}
                                                    className="absolute top-1 right-1 text-gray-300 hover:text-red-500"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`text-[var(--color-text-muted)] opacity-50 text-xs font-bold uppercase pointer-events-none flex flex-col items-center ${selectedId?.type === 'pool' ? 'animate-pulse text-[var(--color-primary)] opacity-100' : ''}`}>
                                            {selectedId?.type === 'pool' ? 'Tap Disini' : 'Kosong'}
                                        </div>
                                    )}

                                    {/* Evaluation Icon */}
                                    {isSubmitted && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-full shadow-md p-1">
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

                {/* Answer Pool (Floating or Bottom) */}
                <div className="sticky bottom-4 z-10">
                     <div className={`bg-[var(--color-bg-card)]/95 backdrop-blur shadow-[0_-5px_20px_rgba(0,0,0,0.1)] rounded-xl p-4 border border-[var(--color-border)] transition-opacity ${isSubmitted ? 'opacity-50 pointer-events-none' : ''}`}>
                         <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3 text-center flex items-center justify-center gap-2">
                             <span>Pilihan Jawaban</span>
                             <span className="bg-[var(--color-bg-muted)] px-2 py-0.5 rounded-full text-[10px]">{availableAnswers.length} Tersisa</span>
                         </h4>
                         
                         {availableAnswers.length === 0 && !isSubmitted && (
                             <div className="text-center text-green-500 py-2 text-sm font-medium">✨ Semua kartu sudah dipasang</div>
                         )}

                         <div className="flex flex-wrap gap-2 justify-center max-h-[150px] overflow-y-auto pr-1">
                             {availableAnswers.map(ans => {
                                 const isSelected = selectedId?.id === ans.id && selectedId?.type === 'pool';
                                 return (
                                     <button
                                         key={ans.id}
                                         className={`relative px-4 py-2 rounded-lg shadow-sm border font-medium text-sm transition-all
                                             ${isSelected 
                                                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] ring-2 ring-offset-1 ring-[var(--color-primary)] scale-105 z-10' 
                                                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-main)] border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                                             }
                                         `}
                                         onClick={() => handleItemClick({ id: ans.id, text: ans.text, type: 'pool' })}
                                         onMouseDown={(e) => { 
                                             handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' });
                                          }}
                                         onTouchStart={(e) => { 
                                             handleDragStart(e, { id: ans.id, text: ans.text, origin: 'pool' });
                                         }}
                                         style={{ touchAction: 'none' }} // Prevent scrolling while dragging
                                     >
                                         <span className={isArabic(ans.text) ? 'font-arabic' : ''}>{ans.text}</span>
                                     </button>
                                 );
                             })}
                         </div>
                     </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-center gap-4 pb-4 md:pb-0">
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

            {/* Ghost Drag Item */}
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
                    <span className={isArabic(dragItem.text) ? 'font-arabic' : ''}>{dragItem.text}</span>
                </div>
            )}
        </div>
    );
};

export default MatchUpGame;
