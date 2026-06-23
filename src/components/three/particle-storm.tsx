"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ParticleStorm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ 
    x: 0, y: 0, 
    normalizedX: 0, normalizedY: 0, 
    velocityX: 0, velocityY: 0, 
    lastX: 0, lastY: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dense abstract particle field - 15000 particles for more detail
    const particleCount = 15000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const originalPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Organic cloud distribution - center dense, edges scattered
      const radius = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.pow(radius, 0.7) * 45;
      
      const x = Math.cos(angle) * spread + (Math.random() - 0.5) * 6;
      const y = Math.sin(angle) * spread + (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 25;
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;
      
      // Orange gradient - no white, all variations of orange
      const rand = Math.random();
      if (rand > 0.7) {
        // Bright orange
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.4;
        colors[i3 + 2] = 0.08;
      } else if (rand > 0.4) {
        // Warm orange
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.28;
        colors[i3 + 2] = 0.03;
      } else {
        // Deep orange
        colors[i3] = 0.95;
        colors[i3 + 1] = 0.18;
        colors[i3 + 2] = 0.02;
      }
      
      // Varying sizes for depth
      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouseX: { value: 0 },
        mouseY: { value: 0 },
        mouseVelocity: { value: 0 },
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
        uniform float mouseVelocity;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Complex flowing wave motion - multiple layers
          float flow = sin(pos.x * 0.05 + time * 0.35) * 4.5;
          float flow2 = cos(pos.y * 0.04 + time * 0.28) * 3.5;
          float flow3 = sin(pos.z * 0.03 + time * 0.42) * 2.5;
          float flow4 = cos((pos.x + pos.y) * 0.025 + time * 0.22) * 2.0;
          float flow5 = sin(pos.x * 0.02 - pos.y * 0.03 + time * 0.18) * 1.5;
          
          pos.y += flow + flow2 * 0.8;
          pos.x += flow3 * 0.5 + flow4 * 0.6;
          pos.z += flow5 + flow4 * 0.4;
          
          // Organic swirl - multiple dimensions
          float swirl = sin(time * 0.18 + pos.x * 0.06) * 2.5;
          float swirl2 = cos(time * 0.14 + pos.y * 0.05) * 2.0;
          float swirl3 = sin(time * 0.12 + pos.z * 0.04) * 1.5;
          pos.x += swirl * (pos.y / 22.0);
          pos.y += swirl2 * (pos.x / 26.0);
          pos.z += swirl3 * 0.8;
          
          // Subtle mouse influence
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 50.0, mouseY * 30.0));
          float push = smoothstep(30.0, 0.0, distToMouse) * (0.25 + mouseVelocity * 1.5);
          
          vec2 dirFromMouse = normalize(vec2(pos.x, pos.y) - vec2(mouseX * 50.0, mouseY * 30.0));
          pos.x += dirFromMouse.x * push * 2.5;
          pos.y += dirFromMouse.y * push * 2.5;
          pos.z += push * 1.5;
          
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          // Complex pulsing for more detail
          float pulse = sin(time * 0.9 + pos.x * 0.12 + pos.y * 0.08 + pos.z * 0.06) * 0.18 + 0.85;
          float pulse2 = sin(time * 0.6 + pos.x * 0.08) * 0.1;
          float mouseGlow = smoothstep(25.0, 0.0, distToMouse) * mouseVelocity * 0.4;
          vAlpha = smoothstep(90.0, 12.0, -mvPosition.z) * (pulse + pulse2) + mouseGlow;
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
          
          // Soft circular point with glow
          float alpha = smoothstep(0.5, 0.08, dist) * vAlpha * 0.9;
          
          vec3 finalColor = vColor;
          if (vDist < 18.0) {
            finalColor = mix(vColor, vec3(1.0, 0.5, 0.15), smoothstep(18.0, 0.0, vDist) * 0.35);
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      mouseRef.current.velocityX = (newX - mouseRef.current.lastX) * 0.25 + mouseRef.current.velocityX * 0.75;
      mouseRef.current.velocityY = (newY - mouseRef.current.lastY) * 0.25 + mouseRef.current.velocityY * 0.75;
      
      mouseRef.current.lastX = newX;
      mouseRef.current.lastY = newY;
      mouseRef.current.x = newX;
      mouseRef.current.y = newY;
      mouseRef.current.normalizedX = (newX / rect.width) * 2 - 1;
      mouseRef.current.normalizedY = -((newY / rect.height) * 2 - 1);
    };

    const handleMouseLeave = () => {
      mouseRef.current.velocityX = 0;
      mouseRef.current.velocityY = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const newX = e.touches[0].clientX - rect.left;
        const newY = e.touches[0].clientY - rect.top;
        
        mouseRef.current.velocityX = (newX - mouseRef.current.lastX) * 0.25 + mouseRef.current.velocityX * 0.75;
        mouseRef.current.velocityY = (newY - mouseRef.current.lastY) * 0.25 + mouseRef.current.velocityY * 0.75;
        
        mouseRef.current.lastX = newX;
        mouseRef.current.lastY = newY;
        mouseRef.current.normalizedX = (newX / rect.width) * 2 - 1;
        mouseRef.current.normalizedY = -((newY / rect.height) * 2 - 1);
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.velocityX = 0;
      mouseRef.current.velocityY = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      material.uniforms.time.value += 0.01;
      
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.04;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.04;
      
      const velocity = Math.sqrt(
        mouseRef.current.velocityX * mouseRef.current.velocityX +
        mouseRef.current.velocityY * mouseRef.current.velocityY
      ) / 10;
      const normalizedVelocity = Math.min(Math.max(velocity, 0), 1);
      
      material.uniforms.mouseVelocity.value += (normalizedVelocity - material.uniforms.mouseVelocity.value) * 0.05;
      
      mouseRef.current.velocityX *= 0.95;
      mouseRef.current.velocityY *= 0.95;
      
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
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
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
      style={{ background: "#0a0a0a" }}
    />
  );
}
