"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

function AudioMesh({ analyser }: { analyser: AnalyserNode | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const dataArray = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (analyser) {
      dataArray.current = new Uint8Array(analyser.frequencyBinCount);
    }
  }, [analyser]);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // Default slow rotation
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.2;

    if (analyser && dataArray.current) {
      analyser.getByteFrequencyData(dataArray.current as any);
      
      // Calculate average volume (low frequencies)
      let sum = 0;
      for (let i = 0; i < 32; i++) {
        sum += dataArray.current[i];
      }
      const avg = sum / 32;
      const normalizedAvg = avg / 255; // 0 to 1

      // Deform scale based on volume
      const scaleTarget = 1 + normalizedAvg * 0.8;
      meshRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.1);

      // Pulse emissive intensity
      materialRef.current.emissiveIntensity = 0.5 + normalizedAvg * 2;
      
      // Rotate faster based on volume
      meshRef.current.rotation.y += normalizedAvg * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[5, 4]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#ff3366"
        emissive="#ff3366"
        emissiveIntensity={0.5}
        wireframe={true}
        transparent={true}
        opacity={0.6}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

export function AudioVisualizer() {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);
      setStarted(true);
      setError("");
    } catch (err: any) {
      setError(err.message || "Microphone access denied");
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 15] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      
      <AudioMesh analyser={analyser} />

      {!started && (
        <Html center>
          <div className="flex flex-col items-center gap-4 p-8 bg-black/80 border border-rule backdrop-blur-md rounded-lg whitespace-nowrap">
            <span className="fac text-signal block" style={{ fontSize: "0.5rem" }}>FAC.05 — AUDIO REACTIVE</span>
            <p className="lab text-white text-center" style={{ fontSize: "0.7rem" }}>
              This experiment requires microphone access<br />to visualize audio frequencies.
            </p>
            <button 
              onClick={startAudio}
              className="px-6 py-3 border border-signal hover:bg-signal transition-colors group mt-2"
            >
              <span className="lab text-white group-hover:text-black transition-colors" style={{ fontSize: "0.6rem" }}>
                Enable Microphone
              </span>
            </button>
            {error && <span className="lab text-red-400" style={{ fontSize: "0.5rem" }}>{error}</span>}
          </div>
        </Html>
      )}
    </Canvas>
  );
}
