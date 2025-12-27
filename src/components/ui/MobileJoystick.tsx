import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export const MobileJoystick = () => {
  const { isMobile, setIsMobile } = useGameStore();
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  const handleStart = (clientX: number, clientY: number) => {
    setIsActive(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isActive || !joystickRef.current || !knobRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2 - 20;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }

    knobRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Dispatch joystick event
    const normalizedX = deltaX / maxRadius;
    const normalizedY = deltaY / maxRadius;
    
    window.dispatchEvent(new CustomEvent('joystick-move', {
      detail: { x: normalizedX, y: normalizedY, active: true }
    }));
  };

  const handleEnd = () => {
    setIsActive(false);
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    
    window.dispatchEvent(new CustomEvent('joystick-move', {
      detail: { x: 0, y: 0, active: false }
    }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-8 left-8 z-30">
      {/* Joystick base */}
      <div
        ref={joystickRef}
        className="w-32 h-32 rounded-full glass-panel flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
      >
        {/* Joystick knob */}
        <div
          ref={knobRef}
          className={`w-14 h-14 rounded-full bg-primary/80 border-2 border-primary transition-transform ${
            isActive ? 'scale-110' : ''
          }`}
          style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}
        />
      </div>
      
      {/* Label */}
      <p className="text-center mt-2 font-exo text-xs text-muted-foreground">
        MOVE
      </p>
    </div>
  );
};
