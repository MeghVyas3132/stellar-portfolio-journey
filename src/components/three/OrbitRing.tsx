import { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitRingProps {
  radius: number;
  color?: string;
}

export const OrbitRing = ({ radius, color = '#00A1E0' }: OrbitRingProps) => {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.15 
    }))} />
  );
};
