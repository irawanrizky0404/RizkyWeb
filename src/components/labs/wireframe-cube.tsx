"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Cube() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.2;
      mesh.current.rotation.y += delta * 0.3;
      
      // React to mouse
      const targetX = (state.pointer.x * Math.PI) / 4;
      const targetY = (state.pointer.y * Math.PI) / 4;
      
      mesh.current.rotation.y += 0.05 * (targetX - mesh.current.rotation.y);
      mesh.current.rotation.x += 0.05 * (targetY - mesh.current.rotation.x);
    }
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#f0f0ee" wireframe transparent opacity={0.3} />
      
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
        <lineBasicMaterial color="#ff3500" />
      </lineSegments>
    </mesh>
  );
}

export function WireframeCube() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Cube />
    </Canvas>
  );
}
