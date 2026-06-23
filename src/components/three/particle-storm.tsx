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
  const audioRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isAudioReadyRef = useRef(false);

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

    // Dense abstract particle field - 8000 particles
    const particleCount = 8000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Organic cloud distribution - center dense, edges scattered
      const radius = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.pow(radius, 0.7) * 40;
      
      const x = Math.cos(angle) * spread + (Math.random() - 0.5) * 5;
      const y = Math.sin(angle) * spread + (Math.random() - 0.5) * 5;
      const z = (Math.random() - 0.5) * 20;
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Orange gradient - no white, all variations of orange
      const rand = Math.random();
      if (rand > 0.7) {
        // Bright orange
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.35;
        colors[i3 + 2] = 0.05;
      } else if (rand > 0.4) {
        // Warm orange
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.25;
        colors[i3 + 2] = 0.02;
      } else {
        // Deep orange
        colors[i3] = 0.9;
        colors[i3 + 1] = 0.15;
        colors[i3 + 2] = 0.0;
      }
      
      sizes[i] = Math.random() * 2.5 + 0.8;
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
          
          // Flowing wave motion - always moving, even without hover
          float flow = sin(pos.x * 0.06 + time * 0.4) * 4.0;
          float flow2 = cos(pos.y * 0.05 + time * 0.3) * 3.0;
          float flow3 = sin(pos.z * 0.04 + time * 0.5) * 2.0;
          float flow4 = cos(pos.x * 0.03 + pos.y * 0.03 + time * 0.25) * 2.0;
          pos.y += flow;
          pos.x += flow2 * 0.6;
          pos.z += flow3;
          
          // More organic swirl - constant motion
          float swirl = sin(time * 0.2 + pos.x * 0.08) * 2.0;
          float swirl2 = cos(time * 0.15 + pos.y * 0.06) * 1.5;
          pos.x += swirl * (pos.y / 25.0);
          pos.y += swirl2 * (pos.x / 30.0);
          
          // Mouse influence
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 50.0, mouseY * 30.0));
          float push = smoothstep(35.0, 0.0, distToMouse) * (0.3 + mouseVelocity * 2.0);
          
          vec2 dirFromMouse = normalize(vec2(pos.x, pos.y) - vec2(mouseX * 50.0, mouseY * 30.0));
          pos.x += dirFromMouse.x * push * 3.0;
          pos.y += dirFromMouse.y * push * 3.0;
          pos.z += push * 2.0;
          
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          float pulse = sin(time * 1.0 + pos.x * 0.15 + pos.y * 0.1) * 0.2 + 0.85;
          float mouseGlow = smoothstep(30.0, 0.0, distToMouse) * mouseVelocity * 0.5;
          vAlpha = smoothstep(80.0, 15.0, -mvPosition.z) * pulse + mouseGlow;
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
          
          float alpha = smoothstep(0.5, 0.1, dist) * vAlpha * 0.85;
          
          vec3 finalColor = vColor;
          if (vDist < 20.0) {
            finalColor = mix(vColor, vec3(1.0, 0.6, 0.2), smoothstep(20.0, 0.0, vDist) * 0.4);
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

    // Joy Division bass
    const initAudio = () => {
      if (isAudioReadyRef.current) return;
      isAudioReadyRef.current = true;
      
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new AudioContextClass();
        
        masterGainRef.current = audioRef.current.createGain();
        masterGainRef.current.gain.value = 0.12;
        masterGainRef.current.connect(audioRef.current.destination);
        
        // Deep bass
        const bass = audioRef.current.createOscillator();
        bass.type = "sawtooth";
        bass.frequency.value = 40;
        const bassGain = audioRef.current.createGain();
        bassGain.gain.value = 0.1;
        bass.connect(bassGain);
        bassGain.connect(masterGainRef.current);
        bass.start();
        
        // Second bass with pulse
        const bass2 = audioRef.current.createOscillator();
        bass2.type = "square";
        bass2.frequency.value = 41;
        const bass2Gain = audioRef.current.createGain();
        bass2Gain.gain.value = 0.05;
        
        const lfo = audioRef.current.createOscillator();
        lfo.frequency.value = 0.7;
        const lfoGain = audioRef.current.createGain();
        lfoGain.gain.value = 0.04;
        lfo.connect(lfoGain);
        lfoGain.connect(bass2Gain.gain);
        lfo.start();
        
        bass2.connect(bass2Gain);
        bass2Gain.connect(masterGainRef.current);
        bass2.start();
        
        // High tone
        const high = audioRef.current.createOscillator();
        high.type = "sine";
        high.frequency.value = 160;
        const highGain = audioRef.current.createGain();
        highGain.gain.value = 0.03;
        const highFilter = audioRef.current.createBiquadFilter();
        highFilter.type = "bandpass";
        highFilter.frequency.value = 180;
        highFilter.Q.value = 12;
        high.connect(highFilter);
        highFilter.connect(highGain);
        highGain.connect(masterGainRef.current);
        high.start();
        
      } catch (e) {
        console.warn("Audio error:", e);
      }
    };

    container.addEventListener("mouseenter", initAudio);
    container.addEventListener("click", initAudio);
    container.addEventListener("touchstart", initAudio, { once: true });

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
      material.uniforms.time.value += 0.012;
      
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.05;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.05;
      
      const velocity = Math.sqrt(
        mouseRef.current.velocityX * mouseRef.current.velocityX +
        mouseRef.current.velocityY * mouseRef.current.velocityY
      ) / 10;
      const normalizedVelocity = Math.min(Math.max(velocity, 0), 1);
      
      material.uniforms.mouseVelocity.value += (normalizedVelocity - material.uniforms.mouseVelocity.value) * 0.06;
      
      if (masterGainRef.current && audioRef.current && audioRef.current.state !== "suspended") {
        masterGainRef.current.gain.value = 0.1 + normalizedVelocity * 0.12;
      }
      
      mouseRef.current.velocityX *= 0.94;
      mouseRef.current.velocityY *= 0.94;
      
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
      container.removeEventListener("mouseenter", initAudio);
      container.removeEventListener("click", initAudio);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (audioRef.current) {
        audioRef.current.close();
      }
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
