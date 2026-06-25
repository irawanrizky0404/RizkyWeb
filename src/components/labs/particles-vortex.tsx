"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function ParticlesVortex() {
  const pointsRef = useRef<THREE.Points>(null);

  const count = 5000;
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * 5 + 1;
      const y = (Math.random() - 0.5) * 10;
      
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      // Color mapping from signal color (orange) to darker reds
      const normalizedRadius = (radius - 1) / 5;
      color.setHSL(0.05 + normalizedRadius * 0.1, 0.9, 0.5); 
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return [positions, colors];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.15;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        
        const speed = 1 / (radius * 0.5);
        const newAngle = angle + speed * delta;
        
        positions[i * 3] = Math.cos(newAngle) * radius;
        positions[i * 3 + 2] = Math.sin(newAngle) * radius;
        
        // vertical wave
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.02;
        if (positions[i * 3 + 1] > 5) positions[i * 3 + 1] = -5;
        if (positions[i * 3 + 1] < -5) positions[i * 3 + 1] = 5;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.6} sizeAttenuation={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}
