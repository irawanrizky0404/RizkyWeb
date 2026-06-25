"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function FluidMesh() {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2, 2, 128, 128]} />
      <shaderMaterial
        wireframe
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float noise = sin(pos.x * 5.0 + uTime) * cos(pos.y * 5.0 + uTime) * 0.2;
            pos.z += noise;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(1.0, 0.2, 0.0, 1.0); // Signal Orange
          }
        `}
      />
    </mesh>
  );
}

export function FluidSim() {
  return (
    <Canvas camera={{ position: [0, 0, 1] }}>
      <FluidMesh />
    </Canvas>
  );
}
