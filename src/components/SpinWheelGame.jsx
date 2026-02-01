import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Trophy } from 'lucide-react';

const SpinWheelGame = ({ items = [], title = "Spin the Wheel" }) => {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  
  // Physics state
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const animationRef = useRef(null);

  // Colors
  const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', 
      '#3498DB', '#E67E22', '#2ECC71', '#F1C40F'
  ];

  /* 
   * DRAWING LOGIC
   */
  const drawWheel = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      ctx.clearRect(0, 0, width, height);
      
      const numSegments = items.length;
      if (numSegments === 0) return;

      const angleStep = (2 * Math.PI) / numSegments;
      
      // Rotate entire canvas to current rotation
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      items.forEach((item, index) => {
          const startAngle = index * angleStep;
          const endAngle = (index + 1) * angleStep;

          // Slice
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, startAngle, endAngle);
          ctx.fillStyle = colors[index % colors.length];
          ctx.fill();
          ctx.stroke();

          // Text
          ctx.save();
          ctx.rotate(startAngle + angleStep / 2);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px sans-serif';
          if (/[\u0600-\u06FF]/.test(item.text)) {
             ctx.font = 'bold 18px Amiri, sans-serif';
          }
          ctx.fillText(item.text, radius - 20, 6);
          ctx.restore();
      });

      ctx.restore();

      // Draw Pointer (Triangle)
      ctx.beginPath();
      ctx.moveTo(centerX + 15, centerY - radius - 10); // Check logic: Pointer usually fixed at top or right. Let's fix at RIGHT for 0 deg?
      // Actually, standard is pointer at RIGHT (0 rad).
      // Canvas 0 rad is 3 o'clock. 
      // Let's put pointer at 3 o'clock.
      ctx.moveTo(width - 10, centerY - 10);
      ctx.lineTo(width - 35, centerY);
      ctx.lineTo(width - 10, centerY + 10);
      ctx.fillStyle = '#333';
      ctx.fill();
      
      // Or Center Pin
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.stroke();
  };

  useEffect(() => {
      drawWheel();
  }, [items]);

  /*
   * ANIMATION LOGIC
   */
  const spin = () => {
      if (isSpinning || items.length < 2) return;
      
      setIsSpinning(true);
      setResult(null);

      // Random huge velocity
      velocityRef.current = Math.random() * 0.3 + 0.4; // 0.4 to 0.7 rad/frame
      
      const animate = () => {
          rotationRef.current += velocityRef.current;
          
          // Friction
          velocityRef.current *= 0.985; // Deceleration

          drawWheel();

          if (velocityRef.current > 0.001) {
              animationRef.current = requestAnimationFrame(animate);
          } else {
              setIsSpinning(false);
              calculateResult();
          }
      };
      
      animationRef.current = requestAnimationFrame(animate);
  };

  const calculateResult = () => {
      const numSegments = items.length;
      const angleStep = (2 * Math.PI) / numSegments;
      
      // Normalize rotation (0 to 2PI)
      // The drawing rotates the WHEEL.
      // Pointer is at 0 (Right, 3 o'clock).
      // If Wheel rotates +PI/2 (90deg), the segment at -90deg is now at 0.
      
      // Math:
      // Pointer Angle = 0.
      // Segment 'i' spans [i*step + rot, (i+1)*step + rot]
      // We want to find 'i' such that 0 is in that range (mod 2PI).
      // Actually simpler: 
      // The pointer is stationary at 0. We rotate the coordinate system.
      // The angle of the pointer relative to the wheel is: -rotation.
      
      let relativeAngle = (0 - rotationRef.current) % (2 * Math.PI);
      if (relativeAngle < 0) relativeAngle += 2 * Math.PI;
      
      const index = Math.floor(relativeAngle / angleStep);
      const wonItem = items[index];
      
      setResult(wonItem);
  };

  useEffect(() => {
      // Cleanup
      return () => {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
  }, []);


  if (!items || items.length === 0) {
      return <div className="text-center p-4 text-gray-500">Belum ada item untuk diputar.</div>;
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden flex flex-col items-center p-6">
        
        <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-6 flex items-center gap-2">
            <RefreshCcw className="w-6 h-6 text-pink-500" />
            {title}
        </h3>

        <div className="relative mb-8">
            <canvas 
                ref={canvasRef} 
                width={320} 
                height={320} 
                className="max-w-full h-auto cursor-pointer"
                onClick={spin}
            />
            
            {/* Overlay Start Button if clean slate */}
            {!isSpinning && !result && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="bg-white/90 text-sm font-bold px-2 py-1 rounded shadow-sm">SPIN</span>
                </div>
            )}
        </div>

        {isSpinning ? (
            <div className="text-lg font-bold text-[var(--color-text-muted)] animate-pulse">
                Memutar...
            </div>
        ) : result ? (
            <div className="bg-green-100 text-green-800 p-6 rounded-xl text-center animate-bounce-short">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm uppercase tracking-widest font-bold mb-1">Hasil:</p>
                <p className="text-3xl font-bold font-arabic">{result.text}</p>
            </div>
        ) : (
             <button 
                onClick={spin}
                className="px-8 py-3 bg-pink-600 text-white rounded-full font-bold shadow-lg hover:bg-pink-700 hover:scale-105 transition-all"
             >
                Putar Roda!
             </button>
        )}

    </div>
  );
};

export default SpinWheelGame;
