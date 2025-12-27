import { Suspense, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitRing } from './OrbitRing';
import { Spaceship } from './Spaceship';
import { Stars } from './Stars';
import { PLANETS, PlanetData, useGameStore } from '@/store/gameStore';

const SceneContent = () => {
  const { setSelectedPlanet, updateShipPosition } = useGameStore();
  const lastPlanetRef = useRef<string | null>(null);
  const shipPositionRef = useRef(new THREE.Vector3(0, 2, 50));

  const handlePlanetApproach = useCallback((planet: PlanetData) => {
    if (lastPlanetRef.current !== planet.id) {
      lastPlanetRef.current = planet.id;
    }
  }, []);

  const handlePlanetCollision = useCallback((planet: PlanetData, planetPosition: THREE.Vector3) => {
    // On collision, show the planet info
    lastPlanetRef.current = planet.id;
    setSelectedPlanet(planet);
  }, [setSelectedPlanet]);

  const handlePositionUpdate = useCallback((position: THREE.Vector3) => {
    updateShipPosition(position);
    shipPositionRef.current.copy(position);
    
    // Check if we've moved away from all planets
    let nearAnyPlanet = false;
    PLANETS.forEach(planet => {
      const planetAngle = Date.now() * 0.001 * planet.orbitSpeed;
      const planetX = Math.cos(planetAngle) * planet.orbitRadius;
      const planetZ = Math.sin(planetAngle) * planet.orbitRadius;
      const distance = position.distanceTo(new THREE.Vector3(planetX, 0, planetZ));
      if (distance < planet.size + 8) {
        nearAnyPlanet = true;
      }
    });
    
    if (!nearAnyPlanet && lastPlanetRef.current) {
      lastPlanetRef.current = null;
      setSelectedPlanet(null);
    }
  }, [updateShipPosition, setSelectedPlanet]);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      <hemisphereLight args={['#3b4aa8', '#070712', 0.18]} />
      
      {/* Background color */}
      <color attach="background" args={['#050512']} />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#050512', 140, 520]} />
      
      {/* Stars background */}
      <Stars />
      
      {/* The Sun */}
      <Sun />
      
      {/* Orbit rings */}
      {PLANETS.map((planet) => (
        <OrbitRing key={`orbit-${planet.id}`} radius={planet.orbitRadius} />
      ))}
      
      {/* Planets */}
      {PLANETS.map((planet) => (
        <Planet 
          key={planet.id} 
          data={planet} 
          onApproach={handlePlanetApproach}
          onCollision={handlePlanetCollision}
          shipPositionRef={shipPositionRef}
        />
      ))}
      
      {/* Player spaceship */}
      <Spaceship 
        onPositionUpdate={handlePositionUpdate} 
        positionRef={shipPositionRef}
      />
    </>
  );
};

export const SolarSystem = () => {
  return (
    <Canvas
      className="w-full h-full"
      gl={{ 
        antialias: true, 
        alpha: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 2]}
      camera={{ position: [0, 10, 60], fov: 60, near: 0.1, far: 1000 }}
      shadows
      onCreated={({ gl }) => {
        gl.setClearColor('#030308');
      }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
};
