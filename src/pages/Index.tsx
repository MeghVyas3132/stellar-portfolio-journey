import { SolarSystem } from '@/components/three/SolarSystem';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PlanetInfoModal } from '@/components/ui/PlanetInfoModal';
import { WarpNavigation } from '@/components/ui/WarpNavigation';
import { MobileJoystick } from '@/components/ui/MobileJoystick';
import { ControlsHelp } from '@/components/ui/ControlsHelp';
import { HUDOverlay } from '@/components/ui/HUDOverlay';
import { useGameStore } from '@/store/gameStore';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const { isLoading } = useGameStore();

  return (
    <>
      <Helmet>
        <title>Vaibhav Chauhan | Full Stack + Salesforce Developer Portfolio</title>
        <meta name="description" content="Explore the interactive 3D solar system portfolio of Vaibhav Chauhan - Full Stack Developer and Salesforce Specialist." />
      </Helmet>
      
      <main className="relative w-full h-screen overflow-hidden bg-background">
        {/* Loading screen */}
        <LoadingScreen />

        {/* 3D Solar System */}
        <div 
          className={`w-full h-full transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          role="application"
          aria-label="3D Solar System Portfolio - Use WASD or Arrow keys to navigate"
        >
          <SolarSystem />
        </div>

        {/* UI Overlays - only show when loaded */}
        {!isLoading && (
          <>
            <HUDOverlay />
            <WarpNavigation />
            <PlanetInfoModal />
            <MobileJoystick />
            <ControlsHelp />
          </>
        )}
      </main>
    </>
  );
};

export default Index;
