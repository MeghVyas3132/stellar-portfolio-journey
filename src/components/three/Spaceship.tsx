import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, PLANETS } from '@/store/gameStore';

interface SpaceshipProps {
  onPositionUpdate: (position: THREE.Vector3) => void;
  positionRef: React.MutableRefObject<THREE.Vector3>;
}

export const Spaceship = ({ onPositionUpdate, positionRef }: SpaceshipProps) => {
  const shipRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const { isWarping, warpTarget, endWarp, setSelectedPlanet } = useGameStore();
  
  const velocity = useRef(new THREE.Vector3());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const initialized = useRef(false);
  const collisionCooldown = useRef(0);
  const engineIntensity = useRef(0);
  
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const joystick = useRef({ x: 0, y: 0, active: false });

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(150 * 3), 3));
    return geometry;
  }, []);

  const trailMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#00A1E0',
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Initialize camera position
  useEffect(() => {
    if (!initialized.current && shipRef.current) {
      camera.position.set(0, 8, 70);
      camera.lookAt(0, 2, 60);
      initialized.current = true;
    }
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          e.preventDefault();
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          e.preventDefault();
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          e.preventDefault();
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          e.preventDefault();
          break;
        case 'Space':
          keys.current.up = true;
          e.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.down = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.up = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.down = false;
          break;
      }
    };

    const handleJoystickMove = (e: CustomEvent) => {
      joystick.current = e.detail;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('joystick-move' as any, handleJoystickMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('joystick-move' as any, handleJoystickMove);
    };
  }, []);

  // Handle collision with celestial body
  const handleCollision = (bodyPosition: THREE.Vector3, bodyRadius: number, planetData?: typeof PLANETS[0]) => {
    if (collisionCooldown.current > 0) return;
    
    const ship = shipRef.current;
    if (!ship) return;
    
    // Calculate bounce direction
    const normal = ship.position.clone().sub(bodyPosition).normalize();
    
    // Bounce the ship
    velocity.current.reflect(normal);
    velocity.current.multiplyScalar(0.4);
    
    // Push ship outside the body
    ship.position.copy(bodyPosition).add(normal.multiplyScalar(bodyRadius + 1));
    
    collisionCooldown.current = 90; // frames cooldown
    
    // Trigger planet info modal
    if (planetData) {
      setSelectedPlanet(planetData);
    }
  };

  useFrame((state) => {
    if (!shipRef.current) return;
    
    const ship = shipRef.current;
    const time = state.clock.elapsedTime;
    
    // Decrease collision cooldown
    if (collisionCooldown.current > 0) {
      collisionCooldown.current--;
    }
    
    // Warp handling
    if (isWarping && warpTarget) {
      const direction = warpTarget.clone().sub(ship.position);
      const distance = direction.length();
      
      if (distance > 8) {
        direction.normalize();
        const warpSpeed = Math.min(distance * 0.04, 3);
        ship.position.add(direction.multiplyScalar(warpSpeed));
        
        // Smoothly rotate towards target
        const targetYaw = Math.atan2(direction.x, direction.z);
        yaw.current += (targetYaw - yaw.current) * 0.02;
        
        engineIntensity.current = 1;
      } else {
        endWarp();
        velocity.current.set(0, 0, 0);
      }
    } else {
      // Normal controls - stable 3D flight (altitude) with subtle speed
      const acceleration = 0.005;
      const maxSpeed = 0.4;
      const turnSpeed = 0.012;
      const verticalAccel = 0.012;
      const damping = 0.992;
      const verticalDamping = 0.985;
      
      let inputX = 0;
      let inputY = 0;
      let inputVertical = 0;
      
      if (keys.current.forward) inputY = 1;
      if (keys.current.backward) inputY = -1;
      if (keys.current.left) inputX = -1;
      if (keys.current.right) inputX = 1;
      if (keys.current.up) inputVertical = 1;
      if (keys.current.down) inputVertical = -1;
      
      if (joystick.current.active) {
        inputX = joystick.current.x;
        inputY = -joystick.current.y;
      }
      
      // Yaw rotation (left/right) – reduced sensitivity
      yaw.current -= inputX * turnSpeed;
      
      // Subtle pitch for visual feel only (altitude is separate)
      pitch.current += inputVertical * turnSpeed * 0.18;
      pitch.current = Math.max(-0.35, Math.min(0.35, pitch.current));
      if (inputVertical === 0) pitch.current *= 0.96;
      
      ship.rotation.set(pitch.current, yaw.current, 0);
      
      // Forward direction
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyEuler(new THREE.Euler(0, yaw.current, 0));
      
      // Forward/back thrust
      if (inputY > 0) {
        velocity.current.add(forward.clone().multiplyScalar(acceleration));
        engineIntensity.current = Math.min(engineIntensity.current + 0.04, 1);
      } else if (inputY < 0) {
        velocity.current.add(forward.clone().multiplyScalar(-acceleration * 0.35));
        engineIntensity.current = Math.min(engineIntensity.current + 0.02, 0.6);
      } else {
        engineIntensity.current = Math.max(engineIntensity.current - 0.02, 0.1);
      }
      
      // Altitude control (Space / Shift)
      if (inputVertical !== 0) {
        velocity.current.y += inputVertical * verticalAccel;
      }
      velocity.current.y *= verticalDamping;
      
      // Check collision with all planets
      for (const planet of PLANETS) {
        const planetAngle = state.clock.elapsedTime * planet.orbitSpeed;
        const planetX = Math.cos(planetAngle) * planet.orbitRadius;
        const planetZ = Math.sin(planetAngle) * planet.orbitRadius;
        const planetPos = new THREE.Vector3(planetX, 0, planetZ);
        
        const distance = ship.position.distanceTo(planetPos);
        
        if (distance < planet.size + 0.8) {
          handleCollision(planetPos, planet.size, planet);
          break;
        }
      }
      
      // Check collision with Sun
      const sunPos = new THREE.Vector3(0, 0, 0);
      const sunDistance = ship.position.distanceTo(sunPos);
      const sunRadius = 5;
      if (sunDistance < sunRadius + 0.8) {
        handleCollision(sunPos, sunRadius);
        // Show Sun info (Vaibhav Chauhan)
        setSelectedPlanet({
          id: 'sun',
          name: 'Sun',
          title: 'Vaibhav Chauhan',
          description: 'Full Stack + Salesforce Developer creating stellar digital experiences.',
          details: [
            'Full Stack Developer',
            'Salesforce Specialist',
            'React & Three.js Expert',
            'Building the future of web'
          ],
          color: '#FDB813',
          size: 5,
          orbitRadius: 0,
          orbitSpeed: 0,
        });
      }
      
      // Clamp horizontal speed (keep altitude separate)
      const horizontalVel = new THREE.Vector3(velocity.current.x, 0, velocity.current.z);
      if (horizontalVel.length() > maxSpeed) {
        horizontalVel.normalize().multiplyScalar(maxSpeed);
        velocity.current.x = horizontalVel.x;
        velocity.current.z = horizontalVel.z;
      }
      
      // Apply velocity and damping
      ship.position.add(velocity.current);
      velocity.current.x *= damping;
      velocity.current.z *= damping;
      
      // Boundary limits
      const maxBound = 180;
      ship.position.clamp(
        new THREE.Vector3(-maxBound, -40, -maxBound),
        new THREE.Vector3(maxBound, 40, maxBound)
      );
    }
    
    // Update position ref
    positionRef.current.copy(ship.position);
    
    // Engine glow animation
    if (engineGlowRef.current) {
      const glowScale = 0.5 + engineIntensity.current * 0.4 + Math.sin(time * 15) * 0.05;
      engineGlowRef.current.scale.setScalar(glowScale);
      (engineGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + engineIntensity.current * 0.5;
    }
    
    // Update trail
    if (trailRef.current && velocity.current.length() > 0.01) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = positions.length - 3; i >= 3; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
      }
      
      positions[0] = ship.position.x;
      positions[1] = ship.position.y;
      positions[2] = ship.position.z;
      
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Smooth third-person camera
    const cameraOffset = new THREE.Vector3(0, 1.2, 4);
    cameraOffset.applyEuler(new THREE.Euler(pitch.current * 0.3, yaw.current, 0));
    const targetCameraPos = ship.position.clone().add(cameraOffset);
    
    camera.position.lerp(targetCameraPos, 0.03);
    
    const lookTarget = ship.position.clone().add(
      new THREE.Vector3(0, 0, -2).applyEuler(new THREE.Euler(pitch.current, yaw.current, 0))
    );
    camera.lookAt(lookTarget);
    
    onPositionUpdate(ship.position.clone());
  });

  // Much smaller spaceship - about 0.3 units total
  return (
    <>
      {/* Engine trail */}
      <points ref={trailRef} geometry={trailGeometry} material={trailMaterial} />
      
      <group ref={shipRef} position={[0, 2, 60]} scale={0.15}>
        {/* Ship body - sleek futuristic design */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.35, 2.2, 8]} />
          <meshStandardMaterial 
            color="#0a0a15" 
            metalness={0.95} 
            roughness={0.05}
            emissive="#00A1E0"
            emissiveIntensity={0.05}
          />
        </mesh>
        
        {/* Hull details */}
        <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.35, 0.8, 8]} />
          <meshStandardMaterial 
            color="#0d0d1a" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
        
        {/* Cockpit canopy */}
        <mesh position={[0, 0.18, -0.5]}>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#00A1E0" 
            metalness={0.98} 
            roughness={0.02}
            transparent
            opacity={0.85}
            emissive="#00A1E0"
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Cockpit interior glow */}
        <pointLight 
          position={[0, 0.1, -0.5]} 
          color="#00A1E0" 
          intensity={0.2} 
          distance={1.5}
        />
        
        {/* Left Wing */}
        <mesh position={[0.7, 0, 0.4]} rotation={[0, 0.1, Math.PI / 10]}>
          <boxGeometry args={[1.1, 0.04, 0.45]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} />
        </mesh>
        
        {/* Left wing tip */}
        <mesh position={[1.2, 0, 0.5]}>
          <boxGeometry args={[0.08, 0.15, 0.3]} />
          <meshStandardMaterial 
            color="#00A1E0" 
            emissive="#00A1E0"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Right Wing */}
        <mesh position={[-0.7, 0, 0.4]} rotation={[0, -0.1, -Math.PI / 10]}>
          <boxGeometry args={[1.1, 0.04, 0.45]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} />
        </mesh>
        
        {/* Right wing tip */}
        <mesh position={[-1.2, 0, 0.5]}>
          <boxGeometry args={[0.08, 0.15, 0.3]} />
          <meshStandardMaterial 
            color="#00A1E0" 
            emissive="#00A1E0"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Rear stabilizer */}
        <mesh position={[0, 0.25, 0.8]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.3]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Engine housing */}
        <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.18, 0.3, 8]} />
          <meshStandardMaterial color="#0d0d1a" metalness={0.85} roughness={0.15} />
        </mesh>
        
        {/* Engine glow core */}
        <mesh ref={engineGlowRef} position={[0, 0, 1.1]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial 
            color="#00D4FF" 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        {/* Engine outer glow */}
        <mesh position={[0, 0, 1.05]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color="#00A1E0" 
            transparent 
            opacity={0.3}
          />
        </mesh>
        
        {/* Engine light */}
        <pointLight 
          position={[0, 0, 1.3]} 
          color="#00D4FF" 
          intensity={2} 
          distance={8}
        />
        
        {/* Ambient ship light */}
        <pointLight 
          position={[0, 0.5, 0]} 
          color="#00A1E0" 
          intensity={0.3} 
          distance={3}
        />
      </group>
    </>
  );
};