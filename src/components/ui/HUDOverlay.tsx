import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

export const HUDOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Logo/Name */}
        <div className="pointer-events-auto">
          <h1 className="font-orbitron text-lg md:text-xl font-bold text-primary glow-text-subtle">
            MEGH VYAS
          </h1>
          <p className="font-exo text-xs text-muted-foreground">
            DevOps Engineer | Cloud Specialist
          </p>
        </div>

        {/* Social links */}
        <div className="pointer-events-auto flex gap-2">
          <a
            href="https://github.com/MeghVyas3132"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 glass-panel rounded-lg hover:border-primary/50 transition-all"
          >
            <Github className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </a>
          <a
            href="https://linkedin.com/in/meghvyas"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 glass-panel rounded-lg hover:border-primary/50 transition-all"
          >
            <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </a>
          <a
            href="mailto:megh.vyas@yahoo.com"
            className="p-2 glass-panel rounded-lg hover:border-primary/50 transition-all"
          >
            <Mail className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </a>
        </div>
      </div>

      {/* Bottom bar - coordinates and status */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
        <div className="glass-panel px-4 py-2 rounded-lg pointer-events-auto">
          <div className="flex items-center gap-4 font-orbitron text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SYSTEMS ONLINE
            </span>
            <span className="hidden md:block">|</span>
            <span className="hidden md:block">SECTOR: PORTFOLIO-PRIME</span>
          </div>
        </div>
      </div>
    </div>
  );
};
