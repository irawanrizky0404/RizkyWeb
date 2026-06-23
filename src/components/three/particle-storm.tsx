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
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const audioStartedRef = useRef(false);

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

    // Particles
    const columns = 100;
    const rows = 50;
    const particleCount = columns * rows;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = i * rows + j;
        const i3 = idx * 3;
        
        const x = (i - columns / 2) * 1.5;
        const y = (j - rows / 2) * 1.2;
        const z = 0;

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        // Color - orange and white
        if (Math.random() > 0.5) {
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.21;
          colors[i3 + 2] = 0.0;
        } else {
          colors[i3] = 0.95;
          colors[i3 + 1] = 0.95;
          colors[i3 + 2] = 0.95;
        }

        sizes[idx] = Math.random() * 3 + 2;
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
        
        // Pseudo-random function
        float random(float seed) {
          return fract(sin(seed * 12.9898) * 43758.5453);
        }
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Clean sine wave
          float wave = sin(pos.x * 0.12 + time * 0.6) * 5.0;
          float wave2 = sin(pos.x * 0.06 + time * 0.4) * 3.0;
          pos.y += wave + wave2;
          
          // Z depth
          pos.z += sin(pos.x * 0.1 + time * 0.5) * 2.0;
          
          // Mouse interaction with RANDOMNESS
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 40.0, mouseY * 30.0));
          float interaction = smoothstep(35.0, 0.0, distToMouse);
          
          // Random displacement when near mouse
          float randomX = random(pos.x * 0.1 + pos.y * 0.1 + time * 2.0) - 0.5;
          float randomY = random(pos.y * 0.1 + pos.x * 0.1 + time * 2.5 + 1.0) - 0.5;
          float randomZ = random(pos.x * pos.y * 0.001 + time * 1.5) - 0.5;
          
          float moveStrength = interaction * (1.0 + mouseVelocity * 8.0);
          
          // Random chaotic movement near cursor
          pos.x += randomX * 15.0 * moveStrength;
          pos.y += randomY * 15.0 * moveStrength;
          pos.z += randomZ * 8.0 * moveStrength;
          
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          float pulse = sin(time * 1.2 + pos.x * 0.1) * 0.3 + 0.7;
          float mouseBoost = interaction * (0.5 + mouseVelocity * 2.0);
          vAlpha = smoothstep(90.0, 20.0, -mvPosition.z) * pulse + mouseBoost;
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
          if (vDist < 15.0) {
            float mouseGlow = smoothstep(15.0, 0.0, vDist);
            finalColor = mix(vColor, vec3(1.0, 0.5, 0.2), mouseGlow * 0.5);
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

    scene.fog = new THREE.FogExp2(0x080808, 0.012);

    // Audio setup - start on first user interaction
    const startAudio = () => {
      if (audioStartedRef.current) return;
      audioStartedRef.current = true;
      
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new AudioContextClass();
        
        // Master gain
        masterGainRef.current = audioRef.current.createGain();
        masterGainRef.current.gain.value = 0.6;
        masterGainRef.current.connect(audioRef.current.destination);
        
        // Drone oscillator
        droneOscRef.current = audioRef.current.createOscillator();
        droneOscRef.current.type = "sawtooth";
        droneOscRef.current.frequency.value = 55;
        
        droneGainRef.current = audioRef.current.createGain();
        droneGainRef.current.gain.value = 0.5;
        
        // Filter
        filterRef.current = audioRef.current.createBiquadFilter();
        filterRef.current.type = "lowpass";
        filterRef.current.frequency.value = 500;
        filterRef.current.Q.value = 5;
        
        droneOscRef.current.connect(droneGainRef.current);
        droneGainRef.current.connect(filterRef.current);
        filterRef.current.connect(masterGainRef.current);
        
        droneOscRef.current.start();
        
        // Second oscillator
        const osc2 = audioRef.current.createOscillator();
        osc2.type = "sine";
        osc2.frequency.value = 110;
        const gain2 = audioRef.current.createGain();
        gain2.gain.value = 0.25;
        osc2.connect(gain2);
        gain2.connect(filterRef.current);
        osc2.start();
      } catch (e) {
        console.warn("Audio init failed:", e);
      }
    };

    // Start audio on click
    container.addEventListener("click", startAudio);
    container.addEventListener("touchstart", startAudio);

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      mouseRef.current.velocityX = mouseRef.current.velocityX * 0.7 + (newX - mouseRef.current.lastX) * 0.3;
      mouseRef.current.velocityY = mouseRef.current.velocityY * 0.7 + (newY - mouseRef.current.lastY) * 0.3;
      
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
        
        mouseRef.current.velocityX = mouseRef.current.velocityX * 0.7 + (newX - mouseRef.current.lastX) * 0.3;
        mouseRef.current.velocityY = mouseRef.current.velocityY * 0.7 + (newY - mouseRef.current.lastY) * 0.3;
        
        mouseRef.current.lastX = newX;
        mouseRef.current.lastY = newY;
        mouseRef.current.x = newX;
        mouseRef.current.y = newY;
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

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      material.uniforms.time.value += 0.015;
      
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.08;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.08;
      
      const velocity = Math.sqrt(
        mouseRef.current.velocityX * mouseRef.current.velocityX +
        mouseRef.current.velocityY * mouseRef.current.velocityY
      ) / 10;
      const normalizedVelocity = Math.min(Math.max(velocity, 0), 1);
      
      material.uniforms.mouseVelocity.value += (normalizedVelocity - material.uniforms.mouseVelocity.value) * 0.1;
      
      // Audio updates
      if (masterGainRef.current && droneGainRef.current && filterRef.current && droneOscRef.current) {
        const vol = 0.3 + normalizedVelocity * 0.7;
        masterGainRef.current.gain.value = vol;
        filterRef.current.frequency.value = 300 + normalizedVelocity * 1000;
        droneOscRef.current.frequency.value = 50 + normalizedVelocity * 100;
        droneGainRef.current.gain.value = 0.3 + normalizedVelocity * 0.5;
      }
      
      mouseRef.current.velocityX *= 0.9;
      mouseRef.current.velocityY *= 0.9;
      
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
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("click", startAudio);
      container.removeEventListener("touchstart", startAudio);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (droneOscRef.current) {
        droneOscRef.current.stop();
        droneOscRef.current.disconnect();
      }
      if (masterGainRef.current) masterGainRef.current.disconnect();
      if (droneGainRef.current) droneGainRef.current.disconnect();
      if (filterRef.current) filterRef.current.disconnect();
      if (audioRef.current) audioRef.current.close();
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
