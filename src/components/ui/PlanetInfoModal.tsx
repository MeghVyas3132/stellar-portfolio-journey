import { X, Rocket } from 'lucide-react';
import { useGameStore, PlanetData } from '@/store/gameStore';
import { useEffect, useState } from 'react';

export const PlanetInfoModal = () => {
  const { selectedPlanet, setSelectedPlanet } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);
  const [displayPlanet, setDisplayPlanet] = useState<PlanetData | null>(null);
  const [showImpact, setShowImpact] = useState(false);

  useEffect(() => {
    if (selectedPlanet) {
      setDisplayPlanet(selectedPlanet);
      setShowImpact(true);
      setTimeout(() => setShowImpact(false), 300);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
      setTimeout(() => setDisplayPlanet(null), 300);
    }
  }, [selectedPlanet]);

  if (!displayPlanet) return null;

  return (
    <>
      {/* Impact flash effect */}
      {showImpact && (
        <div className="fixed inset-0 z-50 pointer-events-none animate-pulse">
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              background: `radial-gradient(circle at center, ${displayPlanet.color} 0%, transparent 70%)` 
            }}
          />
        </div>
      )}
      
      <div
        className={`fixed top-1/2 right-4 md:right-8 -translate-y-1/2 z-40 w-80 md:w-96 transition-all duration-500 ${
          isVisible 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 translate-x-12 scale-95'
        }`}
      >
        <div className="glass-panel-strong p-6 border-l-4" style={{ borderLeftColor: displayPlanet.color }}>
          {/* Close button */}
          <button
            onClick={() => setSelectedPlanet(null)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/20 transition-colors group"
          >
            <X className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* Impact indicator */}
          <div className="flex items-center gap-2 mb-3 text-xs text-primary/80 font-exo">
            <Rocket className="w-3 h-3" />
            <span>SYSTEM DETECTED</span>
          </div>

          {/* Planet indicator */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-5 h-5 rounded-full animate-pulse shadow-lg"
              style={{ 
                backgroundColor: displayPlanet.color,
                boxShadow: `0 0 20px ${displayPlanet.color}60`
              }}
            />
            <span className="font-exo text-sm text-muted-foreground uppercase tracking-wider">
              {displayPlanet.name}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-orbitron text-2xl font-bold text-primary glow-text-subtle mb-3">
            {displayPlanet.title}
          </h2>

          {/* Description */}
          <p className="font-exo text-muted-foreground text-sm mb-6 leading-relaxed">
            {displayPlanet.description}
          </p>

          {/* Details list with stagger animation */}
          <div className="space-y-2">
            {displayPlanet.details.map((detail, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/50 border border-primary/10 transition-all duration-300 hover:border-primary/40 hover:bg-secondary/70 hover:translate-x-1 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: displayPlanet.color }}
                />
                <span className="font-exo text-sm text-foreground/90">
                  {detail}
                </span>
              </div>
            ))}
          </div>

          {/* Ring data for Saturn */}
          {displayPlanet.hasRings && displayPlanet.ringData && (
            <div className="mt-6 pt-4 border-t border-primary/20">
              <h3 className="font-orbitron text-sm text-primary mb-3">
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayPlanet.ringData.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 text-xs font-exo rounded-full bg-primary/20 text-primary border border-primary/30 transition-all duration-300 hover:bg-primary/30 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                    style={{ transitionDelay: `${(displayPlanet.details.length + index) * 80}ms` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
