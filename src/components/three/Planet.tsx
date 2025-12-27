import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { PlanetData, useGameStore } from '@/store/gameStore';

interface PlanetProps {
  data: PlanetData;
  onApproach: (planet: PlanetData) => void;
  onCollision: (planet: PlanetData, planetPosition: THREE.Vector3) => void;
  shipPositionRef: React.MutableRefObject<THREE.Vector3>;
}

// Advanced procedural texture generation with realistic features
const createRealisticTexture = (color: string, planetType: string, size: number): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  const baseColor = new THREE.Color(color);
  
  // Simplex-like noise function
  const noise2D = (x: number, y: number, seed: number = 0): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };
  
  // Fractal Brownian Motion for realistic terrain
  const fbm = (x: number, y: number, octaves: number = 6): number => {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    
    for (let i = 0; i < octaves; i++) {
      value += amplitude * noise2D(x * frequency, y * frequency, i * 100);
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value;
  };
  
  const imageData = ctx.createImageData(1024, 512);
  const data = imageData.data;
  
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const idx = (y * 1024 + x) * 4;
      const u = x / 1024;
      const v = y / 512;
      
      // Multi-scale noise
      const n1 = fbm(u * 8, v * 4, 6);
      const n2 = fbm(u * 16, v * 8, 4);
      const n3 = fbm(u * 32, v * 16, 3);
      
      let r: number, g: number, b: number;
      
      switch (planetType) {
        case 'earth': {
          // Realistic Earth with oceans, continents, mountains
          const continent = fbm(u * 6 + 0.5, v * 3, 5);
          const detail = fbm(u * 20, v * 10, 4);
          
          if (continent < 0.42) {
            // Deep ocean
            r = 15 + n2 * 25;
            g = 50 + n2 * 40;
            b = 120 + n2 * 50;
          } else if (continent < 0.47) {
            // Shallow water
            r = 30 + n2 * 30;
            g = 90 + n2 * 50;
            b = 150 + n2 * 40;
          } else if (continent < 0.52) {
            // Beach/coast
            r = 190 + detail * 40;
            g = 170 + detail * 30;
            b = 120 + detail * 20;
          } else if (continent < 0.65) {
            // Lowland/forest
            r = 40 + detail * 30;
            g = 100 + detail * 50;
            b = 30 + detail * 20;
          } else if (continent < 0.78) {
            // Highland/grassland
            r = 80 + detail * 40;
            g = 130 + detail * 40;
            b = 50 + detail * 25;
          } else if (continent < 0.88) {
            // Mountains
            r = 100 + detail * 50;
            g = 90 + detail * 40;
            b = 70 + detail * 30;
          } else {
            // Snow caps
            r = 230 + detail * 25;
            g = 240 + detail * 15;
            b = 250;
          }
          break;
        }
        
        case 'mars': {
          // Mars with craters, valleys, dust storms
          const terrain = fbm(u * 10, v * 5, 6);
          const crater = Math.pow(Math.sin(u * 40) * Math.cos(v * 20), 4);
          const dust = fbm(u * 3 + n1, v * 1.5, 3);
          
          r = 180 + terrain * 50 - crater * 40 + dust * 20;
          g = 80 + terrain * 35 - crater * 30 + dust * 15;
          b = 40 + terrain * 25 - crater * 20 + dust * 10;
          break;
        }
        
        case 'jupiter': {
          // Gas giant with bands and Great Red Spot
          const band = Math.sin(v * Math.PI * 12) * 0.5 + 0.5;
          const storm = fbm(u * 4 + n1 * 0.3, v * 2, 4);
          const turbulence = fbm(u * 15, v * 8, 3);
          
          // Great Red Spot simulation
          const spotX = 0.7, spotY = 0.35;
          const spotDist = Math.sqrt(Math.pow(u - spotX, 2) * 4 + Math.pow(v - spotY, 2));
          const spot = spotDist < 0.08 ? (1 - spotDist / 0.08) * 0.8 : 0;
          
          r = 200 + band * 40 + storm * 25 + spot * 80 + turbulence * 15;
          g = 160 + band * 50 + storm * 20 - spot * 20 + turbulence * 10;
          b = 100 + band * 30 + storm * 15 - spot * 40 + turbulence * 5;
          break;
        }
        
        case 'saturn': {
          // Saturn with subtle bands
          const band = Math.sin(v * Math.PI * 8) * 0.4 + 0.6;
          const atmosphere = fbm(u * 6, v * 3, 4);
          
          r = 210 + band * 30 + atmosphere * 20;
          g = 190 + band * 40 + atmosphere * 25;
          b = 140 + band * 20 + atmosphere * 15;
          break;
        }
        
        case 'venus': {
          // Venus with thick cloud patterns
          const clouds = fbm(u * 5 + n1 * 2, v * 2.5 + n2, 5);
          const swirl = Math.sin(u * 10 + clouds * 4 + v * 3) * 0.3;
          
          r = 220 + clouds * 30 + swirl * 20;
          g = 180 + clouds * 40 + swirl * 25;
          b = 100 + clouds * 25 + swirl * 15;
          break;
        }
        
        case 'mercury': {
          // Mercury with heavy cratering
          const terrain = fbm(u * 12, v * 6, 6);
          const craters = Math.pow(Math.sin(u * 80) * Math.cos(v * 40), 6) * 0.8;
          const bigCrater = Math.pow(Math.sin(u * 20 + 2) * Math.cos(v * 10 + 1), 8);
          
          const gray = 100 + terrain * 50 - craters * 50 - bigCrater * 40;
          r = gray + 20;
          g = gray + 10;
          b = gray;
          break;
        }
        
        case 'neptune': {
          // Neptune with icy blue atmosphere
          const clouds = fbm(u * 4, v * 2, 5);
          const storm = fbm(u * 8 + clouds, v * 4 + n1, 4);
          const darkSpot = Math.exp(-Math.pow((u - 0.3) * 8, 2) - Math.pow((v - 0.5) * 4, 2)) * 0.4;
          
          r = 40 + clouds * 25 + storm * 15 - darkSpot * 30;
          g = 80 + clouds * 35 + storm * 25 - darkSpot * 20;
          b = 180 + clouds * 50 + storm * 30 - darkSpot * 10;
          break;
        }
        
        default: {
          r = baseColor.r * 255 * (0.6 + n1 * 0.8);
          g = baseColor.g * 255 * (0.6 + n1 * 0.8);
          b = baseColor.b * 255 * (0.6 + n1 * 0.8);
        }
      }
      
      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 16;
  return texture;
};

// Create bump map for 3D surface detail
const createBumpMap = (planetType: string): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  const imageData = ctx.createImageData(512, 256);
  const data = imageData.data;
  
  const noise2D = (x: number, y: number, seed: number = 0): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };
  
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const u = x / 512;
      const v = y / 256;
      
      let height = 0;
      let amplitude = 0.5;
      
      // Multiple octaves for detailed terrain
      for (let i = 0; i < 6; i++) {
        height += amplitude * noise2D(u * Math.pow(2, i + 2), v * Math.pow(2, i + 1), i * 50);
        amplitude *= 0.5;
      }
      
      // Planet-specific bump intensity
      const intensity = planetType === 'jupiter' || planetType === 'saturn' || planetType === 'neptune' ? 0.2 : 1;
      
      const gray = Math.floor(height * 255 * intensity);
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
};

// Create realistic ring texture for Saturn
const createRealisticRingTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  for (let x = 0; x < 1024; x++) {
    const t = x / 1024;
    
    // Multiple ring bands with gaps
    let alpha = 0;
    let brightness = 0;
    
    // A Ring (outer)
    if (t > 0.7 && t < 0.95) {
      const ringT = (t - 0.7) / 0.25;
      alpha = 0.7 * (1 - Math.pow(Math.abs(ringT - 0.5) * 2, 2));
      brightness = 0.9 + Math.sin(x * 0.5) * 0.1;
    }
    
    // Cassini Division
    if (t > 0.65 && t < 0.7) {
      alpha = 0.05;
      brightness = 0.3;
    }
    
    // B Ring (middle, brightest)
    if (t > 0.4 && t < 0.65) {
      alpha = 0.9 * (1 - Math.pow(Math.abs((t - 0.4) / 0.25 - 0.5) * 2, 4) * 0.3);
      brightness = 0.95 + Math.sin(x * 0.3) * 0.05;
    }
    
    // C Ring (inner, faint)
    if (t > 0.2 && t < 0.4) {
      alpha = 0.3 * (t - 0.2) / 0.2;
      brightness = 0.6 + Math.sin(x * 0.8) * 0.1;
    }
    
    // Add noise for particle detail
    const noise = Math.random() * 0.1;
    alpha = Math.max(0, alpha - noise * 0.5);
    
    const r = Math.floor((200 + brightness * 40) * (0.9 + noise));
    const g = Math.floor((180 + brightness * 40) * (0.9 + noise));
    const b = Math.floor((140 + brightness * 30) * (0.9 + noise));
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fillRect(x, 0, 1, 64);
  }
  
  return new THREE.CanvasTexture(canvas);
};

export const Planet = ({ data, onApproach, onCollision, shipPositionRef }: PlanetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const orbitAngleRef = useRef(Math.random() * Math.PI * 2);
  const lastCollisionTime = useRef(0);
  const { setSelectedPlanet } = useGameStore();
  
  const planetType = data.id;

  // Create realistic textures
  const [diffuseTexture, bumpMap, ringTexture] = useMemo(() => {
    return [
      createRealisticTexture(data.color, planetType, data.size),
      createBumpMap(planetType),
      data.hasRings ? createRealisticRingTexture() : null
    ];
  }, [data.color, planetType, data.hasRings, data.size]);

  // Cloud texture for Earth
  const cloudTexture = useMemo(() => {
    if (planetType !== 'earth') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(512, 256);
    const data = imageData.data;
    
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const u = x / 512;
        const v = y / 256;
        
        // Cloud noise
        let cloud = 0;
        let amp = 1;
        for (let i = 0; i < 5; i++) {
          cloud += amp * (Math.sin(u * Math.pow(2, i + 2) + v * Math.pow(2, i + 1)) * 0.5 + 0.5);
          amp *= 0.5;
        }
        cloud = Math.pow(cloud / 2, 2);
        
        const alpha = cloud > 0.4 ? (cloud - 0.4) * 2 : 0;
        
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = Math.floor(alpha * 200);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
  }, [planetType]);

  // Atmosphere shader for realistic glow
  const atmosphereMaterial = useMemo(() => {
    const color = new THREE.Color(data.color);
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: color },
        intensity: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          float brightness = pow(intensity - dot(vNormal, vPositionNormal), 3.0);
          gl_FragColor = vec4(glowColor, brightness * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [data.color]);

  useFrame((state) => {
    orbitAngleRef.current += data.orbitSpeed;
    
    if (groupRef.current) {
      const x = Math.cos(orbitAngleRef.current) * data.orbitRadius;
      const z = Math.sin(orbitAngleRef.current) * data.orbitRadius;
      groupRef.current.position.set(x, 0, z);
      
      // Get current ship position
      const shipPos = shipPositionRef.current;
      const planetPos = groupRef.current.position;
      const distance = planetPos.distanceTo(shipPos);
      const collisionRadius = data.size + 0.5; // Ship is tiny
      
      // Check for collision (with cooldown to prevent spam)
      const now = Date.now();
      if (distance < collisionRadius && now - lastCollisionTime.current > 1500) {
        lastCollisionTime.current = now;
        onCollision(data, planetPos.clone());
        setSelectedPlanet(data); // Force show the modal
      } else if (distance < data.size + 8) {
        // Proximity trigger for approach
        onApproach(data);
      }
    }
    
    // Planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001;
    }
    
    // Cloud rotation (faster than planet)
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0015;
    }
    
    // Atmosphere subtle pulse
    if (atmosphereRef.current) {
      const scale = 1.12 + Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      atmosphereRef.current.scale.setScalar(scale);
    }
    
    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main planet body with realistic materials */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[data.size, 128, 128]} />
        <meshStandardMaterial 
          map={diffuseTexture}
          bumpMap={bumpMap}
          bumpScale={planetType === 'jupiter' || planetType === 'saturn' ? 0.02 : 0.15}
          roughness={planetType === 'jupiter' || planetType === 'saturn' ? 0.9 : 0.7}
          metalness={0.05}
        />
      </mesh>
      
      {/* Cloud layer for Earth */}
      {planetType === 'earth' && cloudTexture && (
        <mesh ref={cloudRef} scale={1.015}>
          <sphereGeometry args={[data.size, 64, 64]} />
          <meshStandardMaterial 
            map={cloudTexture}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Atmospheric glow */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[data.size * 1.15, 64, 64]} />
      </mesh>
      
      {/* Saturn's Rings */}
      {data.hasRings && ringTexture && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[data.size * 1.3, data.size * 2.5, 128]} />
          <meshBasicMaterial 
            map={ringTexture}
            transparent 
            opacity={0.9} 
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Planet name label */}
      <Html
        position={[0, data.size + 2, 0]}
        center
        distanceFactor={20}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="font-orbitron text-xs text-primary whitespace-nowrap px-3 py-1.5 rounded-lg glass-panel border border-primary/40 shadow-lg shadow-primary/20">
          {data.title}
        </div>
      </Html>
    </group>
  );
};