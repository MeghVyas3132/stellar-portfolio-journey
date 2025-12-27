import { useState } from 'react';
import { HelpCircle, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const ControlsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-30 p-3 glass-panel rounded-full hover:border-primary/50 transition-all"
      >
        <HelpCircle className="w-5 h-5 text-primary" />
      </button>

      {/* Help modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-panel-strong p-6 max-w-md w-full animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-primary/20 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-primary" />
            </button>

            <h2 className="font-orbitron text-xl text-primary glow-text-subtle mb-6">
              FLIGHT CONTROLS
            </h2>

            {/* Controls grid */}
            <div className="space-y-4">
              {/* Movement */}
              <div>
                <h3 className="font-exo text-sm text-muted-foreground mb-2">MOVEMENT</h3>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-10 h-10 glass-panel flex items-center justify-center text-xs font-orbitron">
                      W
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-10 h-10 glass-panel flex items-center justify-center text-xs font-orbitron">
                      A
                    </div>
                    <div className="w-10 h-10 glass-panel flex items-center justify-center text-xs font-orbitron">
                      S
                    </div>
                    <div className="w-10 h-10 glass-panel flex items-center justify-center text-xs font-orbitron">
                      D
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  or Arrow Keys
                </p>
              </div>

              {/* Vertical */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-exo text-sm text-muted-foreground mb-2">ASCEND</h3>
                  <div className="w-full h-10 glass-panel flex items-center justify-center text-xs font-orbitron">
                    SPACE
                  </div>
                </div>
                <div>
                  <h3 className="font-exo text-sm text-muted-foreground mb-2">DESCEND</h3>
                  <div className="w-full h-10 glass-panel flex items-center justify-center text-xs font-orbitron">
                    SHIFT
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="pt-4 border-t border-primary/20">
                <h3 className="font-exo text-sm text-muted-foreground mb-2">OBJECTIVE</h3>
                <p className="text-sm text-foreground/80 font-exo leading-relaxed">
                  Fly your spaceship close to any planet to learn about Vaibhav's skills and experience. 
                  Use the <span className="text-primary">Warp Drive</span> menu on the left for instant travel.
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 py-2 glass-panel rounded-lg text-primary font-orbitron text-sm hover:bg-primary/20 transition-colors"
            >
              LAUNCH
            </button>
          </div>
        </div>
      )}
    </>
  );
};
