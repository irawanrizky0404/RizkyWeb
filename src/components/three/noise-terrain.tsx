"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function NoiseTerrain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create terrain geometry
    const gridSize = 100;
    const geometry = new THREE.PlaneGeometry(80, 80, gridSize, gridSize);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Simple noise-like function
      const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3 +
                Math.sin(x * 0.05 + z * 0.05) * 2 +
                Math.sin(x * 0.2) * Math.sin(z * 0.15) * 1.5;
      positions[i + 1] = y;

      // Orange gradient based on height
      const normalizedY = (y + 6) / 12;
      colors[i] = 0.8 + normalizedY * 0.2;
      colors[i + 1] = 0.15 + normalizedY * 0.2;
      colors[i + 2] = 0.02;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying float vHeight;
        uniform float time;
        
        void main() {
          vColor = color;
          vNormal = normal;
          vHeight = position.y;
          
          vec3 pos = position;
          
          // Animate terrain
          float wave = sin(pos.x * 0.1 + time * 0.5) * cos(pos.z * 0.1 + time * 0.3) * 2.0;
          pos.y += wave;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec3 vNormal;
        varying float vHeight;
        
        void main() {
          vec3 light = normalize(vec3(0.5, 1.0, 0.3));
          float diff = max(dot(vNormal, light), 0.0);
          
          vec3 finalColor = vColor * (0.3 + diff * 0.7);
          
          // Add glow at peaks
          if (vHeight > 3.0) {
            finalColor += vec3(0.3, 0.1, 0.0) * ((vHeight - 3.0) / 5.0);
          }
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    const terrain = new THREE.Mesh(geometry, material);
    scene.add(terrain);

    // Add wireframe overlay
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3500,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(wireframe);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      material.uniforms.time.value += 0.02;
      wireframeMaterial.opacity = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationId(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      wireframeMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ background: "#080808" }}
    />
  );
}
