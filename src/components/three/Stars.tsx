import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Stars = () => {
  const starsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const distantGalaxiesRef = useRef<THREE.Points>(null);

  // Main starfield with twinkling
  const [starGeometry, starMaterial] = useMemo(() => {
    const count = 9000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkle = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 200 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Star colors - white, blue-white, yellow-white, orange
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1;
      } else if (colorChoice < 0.7) {
        colors[i3] = 0.7; colors[i3 + 1] = 0.85; colors[i3 + 2] = 1;
      } else if (colorChoice < 0.85) {
        colors[i3] = 1; colors[i3 + 1] = 0.95; colors[i3 + 2] = 0.7;
      } else {
        colors[i3] = 1; colors[i3 + 1] = 0.7; colors[i3 + 2] = 0.5;
      }
      
      sizes[i] = Math.random() * 2.5 + 0.5;
      twinkle[i] = Math.random() * Math.PI * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('twinkle', new THREE.BufferAttribute(twinkle, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float twinkle;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float time;
        
        void main() {
          vColor = color;
          vTwinkle = twinkle;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkleAmount = sin(time * 2.0 + twinkle) * 0.3 + 0.7;
          gl_PointSize = size * twinkleAmount * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          float glow = exp(-dist * 4.0);
          
          gl_FragColor = vec4(vColor * (alpha + glow * 0.5), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return [geometry, material];
  }, []);

  // Cosmic dust clouds
  const [dustGeometry, dustMaterial] = useMemo(() => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create dust in bands
      const band = (Math.random() - 0.5) * 150;
      positions[i3] = (Math.random() - 0.5) * 400;
      positions[i3 + 1] = band + (Math.random() - 0.5) * 40;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;
      
      // Dust colors - blue, purple, warm tones
      const colorType = Math.random();
      if (colorType < 0.4) {
        colors[i3] = 0.3; colors[i3 + 1] = 0.5; colors[i3 + 2] = 0.9;
      } else if (colorType < 0.7) {
        colors[i3] = 0.6; colors[i3 + 1] = 0.3; colors[i3 + 2] = 0.8;
      } else {
        colors[i3] = 0.9; colors[i3 + 1] = 0.5; colors[i3 + 2] = 0.3;
      }
      
      sizes[i] = Math.random() * 4 + 1;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(time * 0.2 + position.x * 0.01) * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 0.15 * (1.0 - dist * 2.0);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return [geometry, material];
  }, []);

  // Nebula clouds - larger, softer clouds
  const [nebulaGeometry, nebulaMaterial] = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Nebula positioned in specific regions
      const angle = (i / count) * Math.PI * 2;
      const radius = 250 + Math.random() * 100;
      
      positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 80;
      positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 100;
      
      // Nebula colors - deep blues, purples, magentas
      const hue = 0.6 + Math.random() * 0.3; // Blue to purple range
      const color = new THREE.Color().setHSL(hue, 0.8, 0.4);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = 30 + Math.random() * 50;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (150.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
           float alpha = 0.09 * pow(1.0 - dist * 2.0, 2.0);
           gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return [geometry, material];
  }, []);

  // Distant galaxies
  const [galaxyGeometry, galaxyMaterial] = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 400 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = 8 + Math.random() * 12;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // Galaxy spiral pattern
          float angle = atan(center.y, center.x);
          float spiral = sin(angle * 3.0 + dist * 10.0) * 0.5 + 0.5;
          
          float core = exp(-dist * 8.0);
          float arms = spiral * (1.0 - dist * 2.0) * 0.5;
          
           vec3 color = mix(vec3(0.45, 0.6, 1.0), vec3(1.0, 0.95, 0.8), core);
           float alpha = (core + arms) * 0.55;
           
           gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return [geometry, material];
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (starsRef.current) {
      starsRef.current.rotation.y = time * 0.003;
      (starsRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
    }
    
    if (dustRef.current) {
      dustRef.current.rotation.y = time * 0.008;
      (dustRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
    }
    
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = time * 0.002;
    }
    
    if (distantGalaxiesRef.current) {
      distantGalaxiesRef.current.rotation.y = time * 0.001;
    }
  });

  return (
    <>
      <points ref={nebulaRef} geometry={nebulaGeometry} material={nebulaMaterial} />
      <points ref={dustRef} geometry={dustGeometry} material={dustMaterial} />
      <points ref={starsRef} geometry={starGeometry} material={starMaterial} />
      <points ref={distantGalaxiesRef} geometry={galaxyGeometry} material={galaxyMaterial} />
    </>
  );
};
