import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorA: { value: new THREE.Color('#FDB813') },
        colorB: { value: new THREE.Color('#FF6B00') },
        colorC: { value: new THREE.Color('#FFE4B5') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform vec3 colorC;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv;
          float n = noise(uv * 10.0 + time * 0.5);
          float n2 = noise(uv * 20.0 - time * 0.3);
          
          vec3 color = mix(colorA, colorB, n * 0.5 + 0.25);
          color = mix(color, colorC, n2 * 0.3);
          
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          color += vec3(1.0, 0.8, 0.4) * fresnel * 0.5;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 glow = vec3(1.0, 0.6, 0.2) * intensity * (1.0 + 0.2 * sin(time * 2.0));
          gl_FragColor = vec4(glow, intensity * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.1;
      (sunRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
    }
    
    if (glowRef.current) {
      (glowRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
      glowRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.02);
    }
    
    if (coronaRef.current) {
      coronaRef.current.rotation.z = time * 0.05;
    }
  });

  return (
    <group>
      {/* Core Sun - larger */}
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[5, 128, 128]} />
      </mesh>
      
      {/* Inner Glow */}
      <mesh ref={glowRef} material={glowMaterial}>
        <sphereGeometry args={[5.8, 64, 64]} />
      </mesh>
      
      {/* Outer Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[7, 64, 64]} />
        <meshBasicMaterial 
          color="#FF8C00" 
          transparent 
          opacity={0.12} 
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Solar flare ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 8, 64]} />
        <meshBasicMaterial 
          color="#FDB813" 
          transparent 
          opacity={0.05} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Point Light - main sun light */}
      <pointLight 
        color="#FDB813" 
        intensity={5} 
        distance={200} 
        decay={1}
      />
      
      {/* Secondary warm light */}
      <pointLight 
        color="#FF6B00" 
        intensity={2.5} 
        distance={100} 
        decay={1.5}
      />
    </group>
  );
};
