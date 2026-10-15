import { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Utensils, RotateCcw } from 'lucide-react';
import { playPop, playSplash } from '../../utils/sound';

export default function BasoNoodleSplash({ triggerText = 'Tumpahkan Baso & Mie!' }) {
  const canvasRef = useRef(null);
  const itemsRef = useRef([]);
  const animRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Spawn baso balls and wavy noodles
  const spawnSplash = useCallback((originX, originY) => {
    playSplash();
    setIsActive(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const startX = originX ?? width / 2;
    const startY = originY ?? height * 0.35;

    // Trigger sweet purple & gold confetti
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { x: startX / window.innerWidth, y: startY / window.innerHeight },
      colors: ['#a855f7', '#c084fc', '#e9d5ff', '#fbbf24', '#f3e8ff']
    });

    const newItems = [];

    // Spawn 5-8 Bouncing Baso Meatballs
    const basoCount = 6;
    for (let i = 0; i < basoCount; i++) {
      const angle = (Math.PI * 2 * i) / basoCount + (Math.random() - 0.5) * 0.8;
      const speed = 7 + Math.random() * 8;
      newItems.push({
        type: 'baso',
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        radius: 18 + Math.random() * 10,
        gravity: 0.42,
        bounce: 0.65,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.1,
        color: '#8b5a3c',
        tint: '#9c6644',
        fleckColor: '#22c55e' // celery fleck
      });
    }

    // Spawn 8-12 Wavy Noodle Strands
    const noodleCount = 10;
    for (let i = 0; i < noodleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 7;
      newItems.push({
        type: 'noodle',
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        length: 40 + Math.random() * 30,
        waveFreq: 0.15 + Math.random() * 0.1,
        waveAmp: 6 + Math.random() * 4,
        gravity: 0.35,
        bounce: 0.4,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.15,
        color: '#facc15'
      });
    }

    itemsRef.current = [...itemsRef.current, ...newItems].slice(-45); // Keep at max 45 items for max 60fps performance
    setCount(prev => prev + basoCount);
  }, []);

  // Animation physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const items = itemsRef.current;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Apply physics
        item.vy += item.gravity;
        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.vRot;

        // Ground collision
        const floor = canvas.height - 25;
        if (item.y + (item.radius || 15) > floor) {
          item.y = floor - (item.radius || 15);
          item.vy = -item.vy * item.bounce;
          item.vx *= 0.88;
          item.vRot *= 0.75;
        }

        // Wall collision
        if (item.x - 20 < 0) {
          item.x = 20;
          item.vx = -item.vx * 0.7;
        } else if (item.x + 20 > canvas.width) {
          item.x = canvas.width - 20;
          item.vx = -item.vx * 0.7;
        }

        // Draw based on type
        if (item.type === 'baso') {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotation);

          // Subtle shadow
          ctx.beginPath();
          ctx.ellipse(0, item.radius * 0.8, item.radius * 0.9, item.radius * 0.35, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
          ctx.fill();

          // Meatball 3D Gradient
          const grad = ctx.createRadialGradient(-item.radius * 0.3, -item.radius * 0.3, item.radius * 0.1, 0, 0, item.radius);
          grad.addColorStop(0, '#caa283');
          grad.addColorStop(0.5, '#9d6b49');
          grad.addColorStop(1, '#694125');

          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Meat texture & celery flecks
          ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
          ctx.fillRect(-item.radius * 0.3, -item.radius * 0.2, 3, 3);
          ctx.fillRect(item.radius * 0.2, item.radius * 0.3, 3, 2);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
          ctx.fillRect(-item.radius * 0.1, item.radius * 0.1, 2, 2);

          ctx.restore();
        } else if (item.type === 'noodle') {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotation);

          // Draw wavy ribbon noodle
          ctx.beginPath();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';

          for (let step = -item.length / 2; step <= item.length / 2; step += 4) {
            const waveY = Math.sin(step * item.waveFreq) * item.waveAmp;
            if (step === -item.length / 2) {
              ctx.moveTo(step, waveY);
            } else {
              ctx.lineTo(step, waveY);
            }
          }
          ctx.stroke();

          // Highlight line
          ctx.beginPath();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          for (let step = -item.length / 2; step <= item.length / 2; step += 4) {
            const waveY = Math.sin(step * item.waveFreq) * item.waveAmp - 1;
            if (step === -item.length / 2) {
              ctx.moveTo(step, waveY);
            } else {
              ctx.lineTo(step, waveY);
            }
          }
          ctx.stroke();

          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnSplash(x, y);
    playPop();
  };

  const handleReset = () => {
    itemsRef.current = [];
    setCount(0);
    setIsActive(false);
    playPop(440);
  };

  return (
    <div className="relative w-full h-[460px] md:h-[500px] overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-purple-900/10 via-purple-100/30 to-purple-50/60 border border-purple-200/60 shadow-xl backdrop-blur-md">
      {/* Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-pointer z-10"
        title="Klik di mana saja untuk menumpahkan baso!"
      />

      {/* Glass UI Overlay Controls */}
      <div className="relative z-20 pointer-events-none p-6 md:p-8 flex flex-col justify-between h-full">
        {/* Top Info Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-purple-200/70 shadow-sm text-xs md:text-sm font-medium text-purple-900">
            <Utensils className="w-4 h-4 text-purple-600" />
            <span>Zona Cheerful: Tumpahan Baso & Mie Interaktif</span>
          </div>

          {count > 0 && (
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-600 text-white shadow-sm">
                {count} Butir Baso
              </span>
              <button
                onClick={handleReset}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-purple-700 border border-purple-200 shadow-sm transition-transform active:scale-95"
                title="Bersihkan piring"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Center Guidance (Fades out once active) */}
        {!isActive && (
          <div className="text-center my-auto px-4 max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-100/90 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-sm">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-purple-950 mb-1">
              Sentuh Layar Untuk Tumpahan Baso!
            </h3>
            <p className="text-xs md:text-sm text-purple-700/80 leading-relaxed">
              Klik di mana saja atau tekan tombol di bawah untuk efek bouncy baso kenyal & mie kuning bergelombang.
            </p>
          </div>
        )}

        {/* Bottom Action Trigger */}
        <div className="flex items-center justify-center pt-4">
          <button
            type="button"
            onClick={() => spawnSplash()}
            className="pointer-events-auto group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-700 to-violet-600 hover:from-purple-800 hover:to-violet-700 text-white font-medium text-sm md:text-base shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
            <span>{triggerText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
