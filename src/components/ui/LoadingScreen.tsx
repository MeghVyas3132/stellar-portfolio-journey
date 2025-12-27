import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export const LoadingScreen = () => {
  const { isLoading, setLoading, loadingProgress, setLoadingProgress } = useGameStore();
  const [statusText, setStatusText] = useState('Initializing systems...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const stages = [
      { progress: 20, text: 'Mapping star coordinates...' },
      { progress: 40, text: 'Calibrating warp drives...' },
      { progress: 60, text: 'Loading planetary data...' },
      { progress: 80, text: 'Rendering solar system...' },
      { progress: 95, text: 'Preparing spaceship...' },
      { progress: 100, text: 'Launch sequence initiated!' },
    ];

    let currentStage = 0;
    
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setLoadingProgress(stages[currentStage].progress);
        setStatusText(stages[currentStage].text);
        currentStage++;
      } else {
        clearInterval(interval);
        setFadeOut(true);
        setTimeout(() => setLoading(false), 800);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [setLoading, setLoadingProgress]);

  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 cosmic-gradient opacity-50" />
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse-glow ${1.5 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="font-orbitron text-3xl sm:text-4xl md:text-6xl font-bold glow-text mb-2">
            MEGH VYAS
          </h1>
          <p className="font-exo text-base sm:text-lg md:text-xl text-primary/80 tracking-widest">
            DevOps Engineer | Cloud Specialist
          </p>
        </div>

        {/* Spaceship icon */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 float-animation">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="shipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(199, 100%, 44%)" />
                <stop offset="100%" stopColor="hsl(280, 70%, 50%)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M50 10 L70 70 L50 55 L30 70 Z"
              fill="url(#shipGradient)"
              filter="url(#glow)"
            />
            <ellipse cx="50" cy="80" rx="12" ry="4" fill="hsl(199, 100%, 44%)" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1s" repeatCount="indefinite" />
            </ellipse>
          </svg>
        </div>

        {/* Progress bar */}
        <div className="w-64 md:w-80">
          <div className="flex justify-between mb-2">
            <span className="font-exo text-xs sm:text-sm text-muted-foreground">
              {statusText}
            </span>
            <span className="font-orbitron text-xs sm:text-sm text-primary">
              {loadingProgress}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden border border-primary/20">
            <div
              className="h-full loading-bar rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>

        {/* Instructions hint */}
        <div className="text-center mt-4 space-y-1">
          <p className="font-exo text-xs sm:text-sm text-muted-foreground">
            Use <span className="text-primary font-semibold">WASD</span> or <span className="text-primary font-semibold">Arrow Keys</span> to navigate
          </p>
          <p className="font-exo text-xs text-muted-foreground/70">
            Fly close to planets to discover more
          </p>
        </div>
      </div>
    </div>
  );
};
