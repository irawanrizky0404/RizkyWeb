"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ParticleStorm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Waveform particles
    const columns = 80;
    const rows = 40;
    const particleCount = columns * rows;
    const originalPositions = new Float32Array(particleCount * 3);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = i * rows + j;
        const i3 = idx * 3;
        
        // Position in grid with some randomness for surreal feel
        const x = (i - columns / 2) * 1.5 + (Math.random() - 0.5) * 0.5;
        const baseY = (j - rows / 2) * 1.0 + (Math.random() - 0.5) * 0.5;
        const z = (Math.random() - 0.5) * 8;

        originalPositions[i3] = x;
        originalPositions[i3 + 1] = baseY;
        originalPositions[i3 + 2] = z;
        positions[i3] = x;
        positions[i3 + 1] = baseY;
        positions[i3 + 2] = z;

        // Color - orange and white only
        const rand = Math.random();
        if (rand > 0.5) {
          // Signal orange
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.21;
          colors[i3 + 2] = 0.0;
        } else {
          // Pure white
          colors[i3] = 0.95;
          colors[i3 + 1] = 0.95;
          colors[i3 + 2] = 0.95;
        }

        sizes[idx] = Math.random() * 3 + 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouseX: { value: 0 },
        mouseY: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vDist;
        uniform float time;
        uniform float mouseX;
        uniform float mouseY;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Surreal wave effect - multiple layered waves
          float wave1 = sin(pos.x * 0.4 + time * 0.6) * 4.0;
          float wave2 = cos(pos.y * 0.3 + time * 0.4) * 3.0;
          float wave3 = sin(pos.x * 0.2 + pos.y * 0.2 + time * 0.8) * 2.0;
          float wave4 = cos(time * 0.3 + pos.x * pos.y * 0.01) * 1.5;
          
          pos.y += wave1 + wave2 + wave3 + wave4;
          pos.z += sin(pos.x * 0.3 + time * 0.5) * 4.0;
          
          // Surreal breathing/pulsing effect
          float breath = sin(time * 0.5) * 0.5 + 0.5;
          pos.x += sin(time * 0.3 + pos.y * 0.2) * 2.0 * breath;
          
          // Mouse interaction - more dramatic
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 35.0, mouseY * 25.0));
          float mouseInfluence = smoothstep(30.0, 0.0, distToMouse);
          float mousePull = sin(time * 3.0 + distToMouse * 0.1) * 5.0 * mouseInfluence;
          
          pos.x += mouseX * 12.0 * mouseInfluence + mousePull * 0.5;
          pos.y += mouseY * 8.0 * mouseInfluence + mousePull * 0.3;
          pos.z += 5.0 * mouseInfluence + mousePull;
          
          // Pass distance for color variation
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          // Alpha with surreal pulsing
          float pulse = sin(time * 1.5 + pos.x * 0.2 + pos.y * 0.2) * 0.3 + 0.7;
          float mouseGlow = mouseInfluence * 3.0;
          vAlpha = smoothstep(90.0, 25.0, -mvPosition.z) * pulse + mouseGlow;
          vAlpha = min(vAlpha, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vDist;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // Soft circular point
          float alpha = smoothstep(0.5, 0.15, dist) * vAlpha * 0.8;
          
          // Slight color shift near edges
          vec3 finalColor = vColor;
          if (vDist < 15.0) {
            // Add glow near mouse
            finalColor = mix(vColor, vec3(1.0, 0.5, 0.2), smoothstep(15.0, 0.0, vDist) * 0.3);
          }
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Fog
    scene.fog = new THREE.FogExp2(0x080808, 0.012);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.normalizedX = (mouseRef.current.x / rect.width) * 2 - 1;
      mouseRef.current.normalizedY = -((mouseRef.current.y / rect.height) * 2 - 1);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
        mouseRef.current.normalizedX = (mouseRef.current.x / rect.width) * 2 - 1;
        mouseRef.current.normalizedY = -((mouseRef.current.y / rect.height) * 2 - 1);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      material.uniforms.time.value += 0.015;
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.05;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
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
