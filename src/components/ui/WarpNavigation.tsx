import { useState } from 'react';
import { ChevronLeft, ChevronRight, Rocket, Zap, User, Code, Briefcase, Clock, Award, Mail } from 'lucide-react';
import { PLANETS, useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const planetIcons: Record<string, React.ReactNode> = {
  mercury: <User className="w-4 h-4" />,
  venus: <Code className="w-4 h-4" />,
  earth: <Briefcase className="w-4 h-4" />,
  mars: <Zap className="w-4 h-4" />,
  jupiter: <Clock className="w-4 h-4" />,
  saturn: <Award className="w-4 h-4" />,
  neptune: <Mail className="w-4 h-4" />,
};

export const WarpNavigation = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { startWarp, isWarping } = useGameStore();

  const handleWarp = (orbitRadius: number) => {
    // Calculate a position near the planet's orbit
    const angle = Math.random() * Math.PI * 2;
    const target = new THREE.Vector3(
      Math.cos(angle) * orbitRadius,
      2,
      Math.sin(angle) * orbitRadius + 5
    );
    startWarp(target);
  };

  return (
    <div className={`fixed left-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full glass-panel px-2 py-4 rounded-r-lg border-l-0"
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-primary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-primary" />
        )}
      </button>

      {/* Navigation panel */}
      <div className="glass-panel-strong p-4 rounded-r-xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/20">
          <Rocket className="w-5 h-5 text-primary" />
          <span className="font-orbitron text-sm text-primary">WARP DRIVE</span>
        </div>

        {/* Sun destination */}
        <button
          onClick={() => handleWarp(0)}
          disabled={isWarping}
          className="nav-button w-full mb-2 rounded-lg disabled:opacity-50"
        >
          <div className="w-3 h-3 rounded-full bg-amber-500" style={{ boxShadow: '0 0 10px #FDB813' }} />
          <span className="font-exo">Vaibhav (Sun)</span>
        </button>

        {/* Planets */}
        <div className="space-y-1">
          {PLANETS.map((planet) => (
            <button
              key={planet.id}
              onClick={() => handleWarp(planet.orbitRadius)}
              disabled={isWarping}
              className="nav-button w-full rounded-lg disabled:opacity-50"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: planet.color }}
              />
              <span className="font-exo flex-1 text-left">{planet.title}</span>
              {planetIcons[planet.id]}
            </button>
          ))}
        </div>

        {/* Warp indicator */}
        {isWarping && (
          <div className="mt-4 pt-3 border-t border-primary/20">
            <div className="flex items-center gap-2 text-primary animate-pulse">
              <Zap className="w-4 h-4" />
              <span className="font-orbitron text-xs">WARPING...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
