"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function TorusMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // Rotate slowly
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;

    // Pulse the emissive intensity
    const t = state.clock.elapsedTime;
    const pulse = (Math.sin(t * 2) + 1) * 0.5; // 0 to 1
    materialRef.current.emissiveIntensity = 0.5 + pulse * 1.5;
    
    // Slight float effect
    meshRef.current.position.y = Math.sin(t) * 0.2;
    
    // Add interactivity to mouse pointer
    const targetRotX = state.pointer.y * 0.5;
    const targetRotY = state.pointer.x * 0.5;
    
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[10, 2.5, 256, 32]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#ff3366"
        emissive="#ff3366"
        emissiveIntensity={1.5}
        wireframe={true}
        transparent={true}
        opacity={0.4}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

export function HologramTorus() {
  return (
    <Canvas camera={{ position: [0, 0, 15] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <TorusMesh />
    </Canvas>
  );
}
