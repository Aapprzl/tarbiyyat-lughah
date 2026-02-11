import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  RefreshCcw, 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Mountain,
  Volume2,
  VolumeX,
  ChevronRight,
  Flame,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../../utils/cn';

const isArabic = (text) => {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

const CamelRaceGame = ({ data, title }) => {
  const { questions = [], goalDistance = 5000 } = data || {};
  
  // Game State
  const [gameState, setGameState] = useState('idle'); // idle, playing, finished
  const [distance, setDistance] = useState(0);
  const [opponentDistance, setOpponentDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [opponentSpeed, setOpponentSpeed] = useState(120); // base AI speed
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Refs for stable game loop
  const requestRef = useRef();
  const lastFrameTime = useRef(0);
  const distanceRef = useRef(0);
  const opponentDistanceRef = useRef(0);
  const speedRef = useRef(0);
  const audioRefs = useRef({});

  // Initialize Audio
  useEffect(() => {
    const sounds = {
      correct: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      wrong: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
      boost: 'https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3',
      finish: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
    };
    const loaded = {};
    Object.entries(sounds).forEach(([key, url]) => {
      loaded[key] = new Audio(url);
    });
    audioRefs.current = loaded;
    return () => {
      Object.values(audioRefs.current).forEach(a => { a.pause(); a.src = ''; });
    };
  }, []);

  const playSound = (type) => {
    if (isMuted) return;
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const updateGame = useCallback((time) => {
    if (gameState !== 'playing') return;

    if (!lastFrameTime.current) lastFrameTime.current = time;
    const deltaTime = Math.min(0.1, (time - lastFrameTime.current) / 1000);
    lastFrameTime.current = time;

    // Update Player Distance
    distanceRef.current += speedRef.current * deltaTime;
    setDistance(distanceRef.current);

    // Update Opponent Distance (Dynamic AI speed based on player level)
    const baseOpponentSpeed = 100 + (Math.floor(distanceRef.current / 1000) * 10);
    opponentDistanceRef.current += baseOpponentSpeed * deltaTime;
    setOpponentDistance(opponentDistanceRef.current);

    // Friction - Speed naturally decays
    speedRef.current = Math.max(50, speedRef.current * (1 - 0.2 * deltaTime));
    setSpeed(speedRef.current);

    // Check Win/Loss
    if (distanceRef.current >= goalDistance || opponentDistanceRef.current >= goalDistance) {
      setGameState('finished');
      if (distanceRef.current >= goalDistance) {
        playSound('finish');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
      return;
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState, goalDistance]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastFrameTime.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, updateGame]);

  const handleAnswer = (option) => {
    if (selectedOption !== null || gameState !== 'playing') return;

    setSelectedOption(option);
    const correct = option === questions[currentQuestionIdx].correct;
    setIsCorrect(correct);

    if (correct) {
      playSound('correct');
      const boostValue = 150 + (streak * 20);
      speedRef.current += boostValue;
      setSpeed(speedRef.current);
      setStreak(s => s + 1);
      setScore(s => s + 100);
    } else {
      playSound('wrong');
      speedRef.current = Math.max(20, speedRef.current - 100);
      setStreak(0);
    }

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      setCurrentQuestionIdx(prev => (prev + 1) % questions.length);
    }, 1000);
  };

  const startGame = () => {
    setDistance(0);
    setOpponentDistance(0);
    distanceRef.current = 0;
    opponentDistanceRef.current = 0;
    speedRef.current = 80;
    setSpeed(80);
    setCurrentQuestionIdx(0);
    setGameState('playing');
    setStreak(0);
    setScore(0);
  };

  const currentQuestion = questions[currentQuestionIdx] || {
    question: "Apa arti dari 'كِتَابٌ'?",
    options: ["Buku", "Meja", "Pena", "Kursi"],
    correct: "Buku"
  };

  // Parallax layers
  const backgroundShift = (distance / 10) % 100;
  const midgroundShift = (distance / 5) % 100;
  const foregroundShift = (distance / 2) % 100;

  return (
    <div className="w-full max-w-5xl mx-auto md:px-4 py-0 md:py-8 overflow-hidden touch-none">
      <div className="bg-amber-50 dark:bg-slate-900 border-x-0 md:border-4 border-amber-800 rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl overflow-hidden relative h-screen md:h-[80vh] md:min-h-[650px] flex flex-col font-sans">
        
        {/* Sky & Header */}
        <div className="bg-gradient-to-b from-sky-400 to-sky-300 dark:from-slate-800 dark:to-slate-900 p-3 md:p-6 flex items-center justify-between border-b-4 border-amber-900/20 z-20 relative text-amber-900 dark:text-amber-500">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/30 border-2 border-amber-400/30">
              <Mountain className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-amber-900 font-black uppercase tracking-tighter text-xs md:text-xl">Balap Unta</h3>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-amber-800/70 text-[8px] md:text-xs font-bold uppercase tracking-widest">Sahara Desert Cup</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="bg-white/20 backdrop-blur-md px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/30 flex flex-col items-center">
              <span className="text-[7px] md:text-[9px] font-black text-amber-900 uppercase">Jarak</span>
              <span className="text-sm md:text-xl font-black text-amber-950">{Math.floor(distance)}m</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/30 flex flex-col items-center">
              <span className="text-[7px] md:text-[9px] font-black text-amber-900 uppercase">Lawan</span>
              <span className="text-sm md:text-xl font-black text-rose-700">{Math.floor(opponentDistance)}m</span>
            </div>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 md:p-4 bg-white/20 hover:bg-white/30 rounded-xl md:rounded-2xl border border-white/30 transition-all text-amber-900"
            >
              {isMuted ? <VolumeX className="w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="w-4 h-4 md:w-6 md:h-6" />}
            </button>
          </div>
        </div>

        {/* Racing Track (Visual Parallax Area) */}
        <div className="relative h-28 md:h-44 bg-gradient-to-b from-sky-300 via-orange-200 to-orange-300 dark:from-slate-900 dark:via-blue-900/40 dark:to-indigo-950 overflow-hidden border-b-4 border-amber-900/30 shrink-0">
          
          {/* Parallax Layers */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0%, transparent 40%)',
              transform: `translateX(-${backgroundShift}%)`
            }} 
          />
          
          {/* Far Dunes */}
          <div className="absolute bottom-0 w-[200%] h-24 flex items-end opacity-40 translate-x-[-10%] transition-transform duration-100 ease-linear" style={{ transform: `translateX(-${midgroundShift}%)` }}>
             <div className="w-full h-full bg-orange-400" style={{ clipPath: 'polygon(0 100%, 20% 40%, 40% 80%, 60% 30%, 80% 90%, 100% 50%, 100% 100%)' }} />
          </div>

          {/* Near Dunes */}
          <div className="absolute bottom-0 w-[200%] h-16 flex items-end translate-x-[-5%] transition-transform duration-100 ease-linear" style={{ transform: `translateX(-${foregroundShift}%)` }}>
             <div className="w-full h-full bg-orange-500 shadow-2xl" style={{ clipPath: 'polygon(0 100%, 15% 50%, 30% 80%, 45% 40%, 70% 90%, 85% 60%, 100% 100%)' }} />
          </div>

          {/* Start/Finish Line Markers */}
          <div className="absolute bottom-4 flex items-center transition-all duration-100 ease-linear" style={{ left: `${(goalDistance - distance) / 10}px` }}>
             <Flag className="w-10 h-10 text-rose-600 animate-bounce" />
          </div>

          {/* The Tracks */}
          <div className="absolute bottom-0 w-full h-10 bg-amber-900/20 backdrop-blur-sm" />

          {/* Camels */}
          {/* Opponent Camel */}
          <motion.div 
            className="absolute bottom-4 z-10"
            animate={{ 
              left: `${Math.min(85, (opponentDistance / goalDistance) * 80 + 5)}%`,
              y: [0, -5, 0]
            }}
            transition={{ y: { repeat: Infinity, duration: 0.4 } }}
          >
            <div className="relative group">
               <div className="w-9 h-9 md:w-16 md:h-16 bg-rose-600 rounded-full flex items-center justify-center shadow-lg border-2 md:border-4 border-rose-400 rotate-12">
                  <span className="text-white font-black text-sm md:text-2xl font-arabic">🐪</span>
               </div>
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-700 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Lawan</div>
            </div>
          </motion.div>

          {/* Player Camel */}
          <motion.div 
            className="absolute bottom-2 z-10"
            animate={{ 
              left: `${Math.min(85, (distance / goalDistance) * 80 + 5)}%`,
              y: [0, -8, 0],
              rotate: speed > 200 ? [-2, 2, -2] : 0
            }}
            transition={{ y: { repeat: Infinity, duration: Math.max(0.2, 0.6 - (speed/500)) } }}
          >
            <div className="relative">
               <div className={cn(
                 "w-10 h-10 md:w-20 md:h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl border-2 md:border-4 border-amber-300 transition-all duration-300",
                 speed > 200 ? "shadow-orange-500/50 scale-110" : ""
               )}>
                  <span className="text-white font-black text-lg md:text-4xl font-arabic">🐪</span>
                  {streak > 2 && (
                    <motion.div 
                      className="absolute -right-2 -top-2 bg-orange-500 rounded-full p-1 border-2 border-white"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity }}
                    >
                      <Flame className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </motion.div>
                  )}
               </div>
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-md">Anda</div>
               
               {/* Speed Particles */}
               {speed > 150 && (
                 <div className="absolute -left-10 top-1/2 flex gap-1 opacity-50">
                    <div className="h-1 w-6 md:w-8 bg-white rounded-full animate-pulse" />
                    <div className="h-1 w-4 md:w-5 bg-white rounded-full animate-pulse delay-75" />
                 </div>
               )}
            </div>
          </motion.div>
        </div>

        {/* Question Area */}
        <div className="flex-1 bg-amber-50 dark:bg-slate-800 p-3 md:p-6 flex flex-col gap-3 md:gap-6 overflow-y-auto transition-colors duration-500">
          {gameState === 'playing' ? (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-4 md:gap-6">
              {/* Question Card */}
               <div className="bg-white dark:bg-slate-700/50 border-2 border-amber-200 dark:border-slate-600 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-center shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 group-hover:w-4 transition-all duration-300" />
                 <span className="text-[8px] md:text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] mb-1 md:mb-2 block">Tantangan Kecepatan</span>
                 <h2 className={cn(
                   "text-lg md:text-4xl font-black text-slate-900 dark:text-white px-2 md:px-4 leading-tight",
                   isArabic(currentQuestion.question) ? "font-arabic leading-relaxed text-2xl md:text-5xl" : ""
                 )}>
                   {currentQuestion.question}
                 </h2>
               </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedOption !== null}
                     className={cn(
                      "group relative p-3 md:p-5 rounded-xl md:rounded-[2rem] border-2 md:border-4 font-black text-sm md:text-xl uppercase tracking-tight transition-all active:scale-95 text-center overflow-hidden",
                      selectedOption === null 
                        ? "bg-white dark:bg-slate-700 border-amber-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-amber-500 hover:text-amber-700 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-slate-600 shadow-md" 
                        : selectedOption === option 
                          ? isCorrect === true 
                            ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/30" 
                            : "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30"
                          : option === currentQuestion.correct && selectedOption !== null
                            ? "bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50"
                    )}
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className={isArabic(option) ? "font-arabic text-2xl md:text-3xl" : ""}>{option}</span>
                    
                    {selectedOption === option && (
                      <div className="absolute top-2 right-2">
                         {isCorrect ? <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6" /> : <AlertCircle className="w-4 h-4 md:w-6 md:h-6" />}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : gameState === 'idle' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 transition-colors duration-500">
               <motion.div
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="max-w-md w-full bg-white dark:bg-slate-800 border-4 border-amber-200 dark:border-amber-900/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden"
               >
                 <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                 <div className="w-16 h-16 md:w-32 md:h-32 bg-amber-500 rounded-2xl md:rounded-[3rem] mx-auto flex items-center justify-center mb-6 md:mb-8 rotate-3 shadow-2xl border-2 md:border-4 border-amber-300/30 group">
                    <span className="text-white text-4xl md:text-7xl font-arabic group-hover:scale-110 transition-transform">🐪</span>
                 </div>
                 <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 md:mb-6 uppercase tracking-tighter">Balap Unta</h2>
                 <p className="text-[10px] md:text-base text-slate-500 dark:text-slate-400 font-bold mb-8 md:mb-10 leading-relaxed uppercase tracking-widest">
                   Kalahkan lawanmu dengan menjawab <span className="text-amber-500">cepat</span> dan <span className="text-amber-500">akurat</span>!
                 </p>
                 <button 
                   onClick={startGame}
                   className="w-full py-4 md:py-8 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl shadow-amber-900/50 transition-all flex items-center justify-center gap-3 group active:scale-95 text-base md:text-2xl border-b-4 md:border-b-8 border-amber-800"
                 >
                    <Flag className="w-5 h-5 md:w-8 md:h-8" /> GAS POL!
                 </button>
               </motion.div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-8 text-center bg-amber-50/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors duration-500">
               <motion.div
                 initial={{ y: 50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="max-w-md w-full bg-white dark:bg-slate-800 border-4 border-amber-200 dark:border-white/5 p-4 md:p-12 rounded-[2rem] md:rounded-[4.5rem] shadow-2xl relative"
               >
                 <div className="absolute -top-8 md:-top-14 left-1/2 -translate-x-1/2 bg-yellow-500 w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/30 border-4 md:border-8 border-slate-900">
                    <Trophy className="w-8 h-8 md:w-14 md:h-14 text-white" />
                 </div>

                 <h2 className="text-xl md:text-5xl font-black text-slate-900 dark:text-white mt-6 md:mt-12 mb-1 md:mb-2 uppercase tracking-tighter">
                   {distance >= goalDistance ? "JUARA! 🏆" : "KALAH! 🐪"}
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400 font-bold mb-4 md:mb-10 text-[9px] md:text-lg uppercase tracking-widest">
                   {distance >= goalDistance ? "Anda tercepat di Sahara!" : "Lawanmu lebih gesit kali ini!"}
                 </p>

                 <div className="space-y-2 md:space-y-4 mb-4 md:mb-10">
                    <div className="bg-amber-50 dark:bg-slate-900/80 p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border-2 border-amber-200 dark:border-white/5 shadow-inner">
                       <p className="text-[7px] md:text-xs font-black text-amber-600 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5 md:mb-2">Skor Anda</p>
                       <p className="text-3xl md:text-7xl font-black text-amber-600 dark:text-amber-500 font-mono tracking-tighter tabular-nums drop-shadow-lg leading-none">{score}</p>
                    </div>
                    <div className="flex gap-2 md:gap-4">
                       <div className="flex-1 bg-amber-100/50 dark:bg-slate-900/40 p-2 md:p-5 rounded-xl md:rounded-[2rem] border border-amber-200 dark:border-white/5">
                          <p className="text-[7px] md:text-[10px] font-black text-amber-700 dark:text-slate-500 uppercase tracking-widest mb-0.5">Jarak</p>
                          <p className="text-sm md:text-2xl font-black text-slate-900 dark:text-white">{Math.floor(distance)}m</p>
                       </div>
                       <div className="flex-1 bg-orange-100/50 dark:bg-slate-900/40 p-2 md:p-5 rounded-xl md:rounded-[2rem] border border-orange-200 dark:border-white/5">
                          <p className="text-[7px] md:text-[10px] font-black text-orange-700 dark:text-slate-500 uppercase tracking-widest mb-0.5">Streak</p>
                          <p className="text-sm md:text-2xl font-black text-orange-600 dark:text-orange-500">{streak}</p>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={startGame}
                   className="w-full py-3 md:py-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 text-[10px] md:text-lg border-b-4 md:border-b-8 border-slate-700 dark:border-slate-200"
                 >
                    <RefreshCcw className="w-3 h-3 md:w-6 md:h-6" /> Balapan Lagi
                 </button>
               </motion.div>
            </div>
          )}
        </div>

        {/* Speedometer Footer */}
        <div className="h-2 bg-slate-800 relative z-30 shrink-0">
           <motion.div 
             className="absolute inset-y-0 left-0 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
             animate={{ width: `${Math.min(100, (speed / 1000) * 100)}%` }}
             transition={{ duration: 0.5 }}
           />
        </div>
      </div>
    </div>
  );
};

export default CamelRaceGame;
