import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Zap, Heart, Trophy, RefreshCcw, Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../../utils/cn';

const WordRainGame = ({ data, title }) => {
  const { targetCategory, correctWords = [], distractorWords = [], timeLimit = 60 } = data || {};
  
  // Game State
  const [gameState, setGameState] = useState('idle'); // idle, playing, paused, finished
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [fallingWords, setFallingWords] = useState([]);
  const [level, setLevel] = useState(1);
  
  // Refs for stable game loop
  const requestRef = useRef();
  const lastSpawnTime = useRef(0);
  const lastFrameTime = useRef(0);
  const gameContainerRef = useRef(null);
  const audioRefs = useRef({});
  const wordsRef = useRef([]); // Ref for words to keep loop stable

  // Initialize Audio with cleanup
  useEffect(() => {
    const sounds = {
      correct: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      wrong: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
      levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
    };
    const initialisedSounds = {};
    Object.entries(sounds).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      initialisedSounds[key] = audio;
    });
    audioRefs.current = initialisedSounds;
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
        audio.load();
      });
    };
  }, []);

  const playSound = useCallback((type) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  const spawnWord = useCallback(() => {
    const isCorrect = Math.random() > 0.4;
    const pool = (isCorrect ? correctWords : distractorWords) || [];
    const finalPool = pool.length > 0 ? pool : (isCorrect ? ['كِتَابٌ', 'قَلَمٌ', 'بَيْتٌ'] : ['يَأْكُلُ', 'يَشْرَبُ', 'عَلَى']);
    const word = finalPool[Math.floor(Math.random() * finalPool.length)];
    const id = Date.now() + Math.random();
    
    // Narrower horizontal range (15% to 85%) to prevent clipping
    const x = 15 + Math.random() * 70;
    
    const speed = (60 + (level * 25)) * (0.8 + Math.random() * 0.4);

    return {
      id,
      text: word,
      x,
      y: -60,
      speed,
      isCorrect,
      handled: false,
      isNew: true
    };
  }, [correctWords, distractorWords, level]);

  const updateGame = useCallback((time) => {
    if (gameState !== 'playing') return;

    if (!lastFrameTime.current) lastFrameTime.current = time;
    const deltaTime = Math.min(0.1, (time - lastFrameTime.current) / 1000);
    lastFrameTime.current = time;

    // Check for spawn
    const spawnRate = Math.max(800, 2400 - (level * 200));
    let newWord = null;
    if (time - lastSpawnTime.current > spawnRate) {
      newWord = spawnWord();
      lastSpawnTime.current = time;
    }

    const containerHeight = gameContainerRef.current?.offsetHeight || 650;
    
    let missedCorrectWordsCount = 0;
    const nextWords = [];

    wordsRef.current.forEach(word => {
      const newY = word.y + (word.speed * deltaTime);
      
      if (newY > containerHeight) {
        if (word.isCorrect && !word.handled) {
          missedCorrectWordsCount++;
        }
      } else {
        nextWords.push({
          ...word,
          y: newY,
          isNew: false
        });
      }
    });

    if (newWord) {
      nextWords.push(newWord);
    }

    // Update source of truth
    wordsRef.current = nextWords;
    setFallingWords(nextWords); // Trigger re-render

    if (missedCorrectWordsCount > 0) {
      setLives(l => {
        const nl = l - missedCorrectWordsCount;
        if (nl <= 0) setGameState('finished');
        return Math.max(0, nl);
      });
      setStreak(0);
      playSound('wrong');
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState, level, spawnWord, playSound]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastFrameTime.current = 0;
      lastSpawnTime.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, updateGame]);

  // Timer
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // Leveling up
  useEffect(() => {
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      playSound('levelUp');
    }
  }, [score, level, playSound]);

  const handleWordClick = (id) => {
    if (gameState !== 'playing') return;

    const clickedWord = wordsRef.current.find(w => w.id === id);
    if (!clickedWord || clickedWord.handled) return;

    // Mark word as handled in the ref immediately
    wordsRef.current = wordsRef.current.map(w => 
      w.id === id ? { ...w, handled: true } : w
    );

    if (clickedWord.isCorrect) {
      setStreak(prevStreak => {
        const nextStreak = prevStreak + 1;
        const points = 100 + (prevStreak * 10);
        setScore(s => s + points);
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });
      playSound('correct');
    } else {
      setLives(prevLives => {
        const newLives = prevLives - 1;
        if (newLives <= 0) setGameState('finished');
        return Math.max(0, newLives);
      });
      setStreak(0);
      playSound('wrong');
    }

    // Remove word from ref and then update state to trigger re-render
    const remaining = wordsRef.current.filter(w => w.id !== id);
    wordsRef.current = remaining;
    setFallingWords(remaining);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(timeLimit);
    setStreak(0);
    setMaxStreak(0);
    setFallingWords([]);
    wordsRef.current = []; // Clear the ref
    setLevel(1);
    setGameState('playing');
    playSound('click');
    lastSpawnTime.current = performance.now();
    wordsRef.current.push(spawnWord()); // Spawn first immediately and add to ref
    setFallingWords(wordsRef.current); // Update state to show it
  };

  useEffect(() => {
    if (gameState === 'finished' && score > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#6366f1', '#f43f5e']
      });
    }
  }, [gameState, score]);

  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="w-full max-w-4xl mx-auto md:px-4 py-0 md:py-8 overflow-hidden touch-none">
      <div className="bg-sky-50 dark:bg-slate-900 border-x-0 md:border-4 border-sky-100 dark:border-slate-800 rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl overflow-hidden relative h-[80vh] md:h-[70vh] md:min-h-[650px] flex flex-col font-sans">
        {/* Sky / Header */}
        <div className="bg-white/90 dark:bg-slate-800/80 p-3 md:p-6 flex items-center justify-between border-b border-sky-100 dark:border-white/10 z-20 backdrop-blur-md transition-colors duration-500">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-sky-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <CloudRain className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] md:text-sm truncate">Hujan Kata</h3>
              <p className="text-sky-600 dark:text-sky-400 text-[10px] md:text-xs font-bold truncate">{targetCategory}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-center">
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Waktu</p>
              <p className={cn("text-base md:text-2xl font-black font-mono leading-none", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-slate-900 dark:text-white")}>
                {timeLeft}s
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Skor</p>
              <p className="text-base md:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono leading-none">{score}</p>
            </div>
            <div className="flex gap-0.5 md:gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={cn("w-4 h-4 md:w-6 md:h-6 transition-all duration-500", i < lives ? "text-rose-500 fill-rose-500 scale-110" : "text-slate-300 dark:text-slate-700 scale-90")} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Level Path - Moved to top for better visibility */}
        <div className="h-1.5 md:h-2.5 bg-sky-100 dark:bg-slate-800 relative z-30 shrink-0 shadow-lg transition-colors duration-500">
           <motion.div 
             className="absolute inset-y-0 left-0 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
             animate={{ width: `${Math.min(100, (score % 500) / 5)}%` }}
             transition={{ duration: 0.5 }}
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[7px] md:text-[9px] font-black text-sky-900 dark:text-white uppercase tracking-[0.5em] mix-blend-difference drop-shadow-sm">
                 Level {level} Progress
              </span>
           </div>
        </div>

        {/* Game Area */}
        <div 
          ref={gameContainerRef}
          className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-200 via-sky-100 to-white dark:from-slate-800 dark:via-slate-900 dark:to-black select-none transition-colors duration-700"
        >
          {/* Decorative Clouds */}
          <div className="absolute top-4 left-10 opacity-10 pointer-events-none animate-bounce delay-100">
             <CloudRain className="w-12 h-12 md:w-20 md:h-20 text-sky-400" />
          </div>
          <div className="absolute top-10 right-20 opacity-05 pointer-events-none animate-bounce delay-500">
             <CloudRain className="w-20 h-20 md:w-32 md:h-32 text-indigo-400" />
          </div>

          {gameState === 'idle' && (
             <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/80 backdrop-blur-sm p-4 md:p-8 text-center transition-colors duration-500">
               <motion.div
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="max-w-md w-full bg-white dark:bg-slate-800 border-2 border-sky-100 dark:border-white/10 p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] shadow-2xl"
               >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-sky-500 rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center mb-6 md:mb-8 rotate-3 shadow-xl">
                   <Zap className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
                 <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 uppercase tracking-tighter">Siap Bermain?</h2>
                 <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-bold mb-8 md:mb-10 leading-relaxed">
                   Tangkap kata-kata kategori <span className="text-sky-500 font-black font-arabic">"{targetCategory}"</span> sebelum mereka menghilang!
                 </p>
                <button 
                  onClick={startGame}
                  className="w-full py-4 md:py-6 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-sky-500/30 transition-all flex items-center justify-center gap-3 group active:scale-95 text-sm md:text-lg"
                >
                   <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" /> Mulai Sekarang
                </button>
              </motion.div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="absolute top-4 right-4 z-20">
               {streak > 1 && (
                 <motion.div 
                   key={streak}
                   initial={{ scale: 0.5, opacity: 0, x: 20 }}
                   animate={{ scale: 1, opacity: 1, x: 0 }}
                   className="flex flex-col items-end"
                 >
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-4 md:px-6 py-2 rounded-full text-white font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2 shadow-xl border border-white/20">
                       <Zap className="w-3 h-3 md:w-4 md:h-4 fill-current shadow-lg" /> {streak} Combo!
                    </div>
                 </motion.div>
               )}
            </div>
          )}

          <AnimatePresence>
            {fallingWords.map((word) => (
              <motion.button
                key={word.id}
                initial={word.isNew ? { scale: 0.5, opacity: 0 } : false}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: "-50%",
                  left: `${word.x}%`, 
                  top: word.y
                }}
                transition={word.isNew ? { type: "spring", stiffness: 300, damping: 20 } : { duration: 0 }}
                onClick={() => handleWordClick(word.id)}
                 className={cn(
                  "absolute px-5 md:px-8 py-3 md:py-5 rounded-xl md:rounded-[2rem] font-black shadow-2xl transition-transform active:scale-90 group cursor-pointer",
                  "border-2 md:border-4 backdrop-blur-xl",
                  word.isCorrect 
                    ? "bg-sky-500/20 dark:bg-sky-500/30 border-sky-400 text-sky-900 dark:text-white shadow-sky-500/10" 
                    : "bg-white/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-500/50 text-slate-500 dark:text-slate-300 shadow-black/5"
                )}
                style={{ position: 'absolute' }}
              >
                <span className={cn(
                  "text-base md:text-2xl relative z-10 block whitespace-nowrap tracking-wide",
                  isArabic(word.text) ? "arabic-content leading-relaxed text-2xl md:text-4xl" : ""
                )}>
                  {word.text}
                </span>
                {/* Visual Highlights */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl md:rounded-[2rem]" />
                {word.isCorrect && (
                   <div className="absolute -inset-1 bg-sky-400/20 blur-lg rounded-full animate-pulse pointer-events-none" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>

          {gameState === 'finished' && (
             <div className="absolute inset-0 z-40 bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 text-center transition-colors duration-500">
               <motion.div
                 initial={{ y: 50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="max-w-xs md:max-w-sm w-full bg-white dark:bg-slate-800 border-4 border-sky-100 dark:border-white/10 p-6 md:p-10 rounded-3xl md:rounded-[4rem] shadow-2xl relative"
               >
                <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 bg-yellow-500 w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/30 border-4 md:border-8 border-slate-900">
                   <Trophy className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>

                 <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mt-8 md:mt-12 mb-1 md:mb-2 uppercase tracking-tighter">Hebat! 🏆</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-bold mb-6 md:mb-10 text-[10px] md:text-sm">Petualangan kata selesai!</p>

                 <div className="space-y-3 md:space-y-4 mb-6 md:mb-10">
                    <div className="bg-sky-50 dark:bg-slate-900/80 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-sky-200 dark:border-white/5 shadow-inner">
                       <p className="text-[8px] md:text-[10px] font-black text-sky-600 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Skor Akhir</p>
                       <p className="text-4xl md:text-6xl font-black text-sky-600 dark:text-sky-400 font-mono tracking-tighter tabular-nums drop-shadow-lg leading-none">{score}</p>
                    </div>
                    <div className="flex gap-2 md:gap-4">
                       <div className="flex-1 bg-sky-50/50 dark:bg-slate-900/40 p-2 md:p-4 rounded-xl md:rounded-3xl border border-sky-100 dark:border-white/5">
                          <p className="text-[7px] md:text-[9px] font-black text-sky-700 dark:text-slate-500 uppercase tracking-widest mb-1">Terbaik</p>
                          <p className="text-base md:text-xl font-black text-slate-900 dark:text-white">{maxStreak}</p>
                       </div>
                       <div className="flex-1 bg-sky-50/50 dark:bg-slate-900/40 p-2 md:p-4 rounded-xl md:rounded-3xl border border-sky-100 dark:border-white/5">
                          <p className="text-[7px] md:text-[9px] font-black text-sky-700 dark:text-slate-500 uppercase tracking-widest mb-1">Level</p>
                          <p className="text-base md:text-xl font-black text-sky-600 dark:text-sky-400">{level}</p>
                       </div>
                    </div>
                 </div>

                <button 
                  onClick={startGame}
                  className="w-full py-3 md:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest hover:bg-sky-600 dark:hover:bg-sky-500 hover:text-white dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 md:gap-3 text-xs md:text-base border-b-4 md:border-b-8 border-slate-700 dark:border-slate-200"
                >
                   <RefreshCcw className="w-4 h-4 md:w-5 md:h-5" /> Main Lagi
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions below game for better UX */}
      <div className="mt-4 md:mt-8 px-4 md:px-0">
        <div className="flex gap-3 md:gap-6 items-center bg-white dark:bg-slate-800 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
           <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-8 md:h-8 text-sky-500" />
           </div>
           <div className="space-y-0.5 md:space-y-1">
              <h4 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Cara Bermain</h4>
              <div className="flex flex-col md:flex-row md:flex-wrap md:gap-x-6 text-[10px] md:text-sm font-bold text-slate-500">
                 <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 shrink-0" /> Klik kata yang BENAR.</span>
                 <span className="flex items-center gap-2"><AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-rose-500 shrink-0" /> Jangan biarkan jatuh!</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WordRainGame;
