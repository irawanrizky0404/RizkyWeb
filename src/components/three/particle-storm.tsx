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
    isActive: false
  });
  const audioRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

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

    // Particles - more of them for more interactivity
    const columns = 100;
    const rows = 60;
    const particleCount = columns * rows;
    const originalPositions = new Float32Array(particleCount * 3);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3); // For physics

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = i * rows + j;
        const i3 = idx * 3;
        
        const x = (i - columns / 2) * 1.5 + (Math.random() - 0.5) * 0.8;
        const y = (j - rows / 2) * 1.2 + (Math.random() - 0.5) * 0.8;
        const z = (Math.random() - 0.5) * 10;

        originalPositions[i3] = x;
        originalPositions[i3 + 1] = y;
        originalPositions[i3 + 2] = z;
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        // Initialize velocities
        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;

        // Color - orange and white
        if (Math.random() > 0.45) {
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

    // Shader material with physics-based interaction
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
          
          // Clean sine wave base
          float wave = sin(pos.x * 0.15 + time * 0.8) * 5.0;
          float wave2 = sin(pos.x * 0.08 + time * 0.5) * 3.0;
          pos.y += wave + wave2;
          
          // Subtle depth wave
          pos.z += sin(pos.x * 0.1 + time * 0.6) * 2.0;
          
          // Mouse interaction - gentle push
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 35.0, mouseY * 25.0));
          float interaction = smoothstep(30.0, 0.0, distToMouse);
          
          vec2 dirFromMouse = normalize(vec2(pos.x, pos.y) - vec2(mouseX * 35.0, mouseY * 25.0));
          float pushStrength = interaction * (1.0 + mouseVelocity * 5.0);
          
          pos.x += dirFromMouse.x * pushStrength * 3.0;
          pos.y += dirFromMouse.y * pushStrength * 3.0;
          pos.z += pushStrength * 2.0;
          
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          // Soft pulsing alpha
          float pulse = sin(time * 1.5 + pos.x * 0.15) * 0.3 + 0.7;
          float mouseBoost = interaction * (0.5 + mouseVelocity * 1.5);
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
          
          // Color shifts near mouse
          vec3 finalColor = vColor;
          if (vDist < 20.0) {
            float mouseGlow = smoothstep(20.0, 0.0, vDist);
            // Orange glow near cursor
            finalColor = mix(vColor, vec3(1.0, 0.4, 0.1), mouseGlow * 0.6);
            // Add white core at very close range
            finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), smoothstep(8.0, 0.0, vDist) * 0.5);
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

    scene.fog = new THREE.FogExp2(0x080808, 0.01);

    // Audio setup - more dramatic
    const initAudio = () => {
      if (audioRef.current) return;
      
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioRef.current = new AudioContextClass();
      
      // Master gain - MUCH louder
      masterGainRef.current = audioRef.current.createGain();
      masterGainRef.current.gain.value = 0.7;
      masterGainRef.current.connect(audioRef.current.destination);
      
      // Drone oscillator - deeper
      droneOscRef.current = audioRef.current.createOscillator();
      droneOscRef.current.type = "sawtooth";
      droneOscRef.current.frequency.value = 45;
      
      droneGainRef.current = audioRef.current.createGain();
      droneGainRef.current.gain.value = 0.5;
      
      // Lowpass filter for warmth
      filterRef.current = audioRef.current.createBiquadFilter();
      filterRef.current.type = "lowpass";
      filterRef.current.frequency.value = 400;
      filterRef.current.Q.value = 3;
      
      droneOscRef.current.connect(droneGainRef.current);
      droneGainRef.current.connect(filterRef.current);
      filterRef.current.connect(masterGainRef.current);
      
      droneOscRef.current.start();
      
      // Second harmonic
      const osc2 = audioRef.current.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 90;
      const gain2 = audioRef.current.createGain();
      gain2.gain.value = 0.3;
      osc2.connect(gain2);
      gain2.connect(filterRef.current);
      osc2.start();
    };

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      const dx = newX - mouseRef.current.lastX;
      const dy = newY - mouseRef.current.lastY;
      
      mouseRef.current.velocityX = mouseRef.current.velocityX * 0.8 + dx * 0.2;
      mouseRef.current.velocityY = mouseRef.current.velocityY * 0.8 + dy * 0.2;
      
      mouseRef.current.lastX = newX;
      mouseRef.current.lastY = newY;
      mouseRef.current.x = newX;
      mouseRef.current.y = newY;
      mouseRef.current.normalizedX = (newX / rect.width) * 2 - 1;
      mouseRef.current.normalizedY = -((newY / rect.height) * 2 - 1);
      mouseRef.current.isActive = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.velocityX = 0;
      mouseRef.current.velocityY = 0;
      mouseRef.current.isActive = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const newX = e.touches[0].clientX - rect.left;
        const newY = e.touches[0].clientY - rect.top;
        
        mouseRef.current.velocityX = mouseRef.current.velocityX * 0.8 + (newX - mouseRef.current.lastX) * 0.2;
        mouseRef.current.velocityY = mouseRef.current.velocityY * 0.8 + (newY - mouseRef.current.lastY) * 0.2;
        
        mouseRef.current.lastX = newX;
        mouseRef.current.lastY = newY;
        mouseRef.current.x = newX;
        mouseRef.current.y = newY;
        mouseRef.current.normalizedX = (newX / rect.width) * 2 - 1;
        mouseRef.current.normalizedY = -((newY / rect.height) * 2 - 1);
        mouseRef.current.isActive = true;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.velocityX = 0;
      mouseRef.current.velocityY = 0;
      mouseRef.current.isActive = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("mouseenter", initAudio);
    container.addEventListener("touchstart", initAudio, { once: true });

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      material.uniforms.time.value += 0.012;
      
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.08;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.08;
      
      // Calculate velocity magnitude for audio
      const velocity = Math.sqrt(
        mouseRef.current.velocityX * mouseRef.current.velocityX +
        mouseRef.current.velocityY * mouseRef.current.velocityY
      ) / 15; // Normalize
      const normalizedVelocity = Math.min(Math.max(velocity, 0), 1);
      
      material.uniforms.mouseVelocity.value += (normalizedVelocity - material.uniforms.mouseVelocity.value) * 0.15;
      
      // Audio updates - MUCH louder
      if (audioRef.current && masterGainRef.current && droneGainRef.current && filterRef.current && droneOscRef.current) {
        const vol = 0.4 + normalizedVelocity * 0.6;
        masterGainRef.current.gain.value = vol;
        
        // Filter follows velocity - brighter when fast
        filterRef.current.frequency.value = 400 + normalizedVelocity * 1200;
        filterRef.current.Q.value = 2 + normalizedVelocity * 5;
        
        // Pitch follows velocity
        droneOscRef.current.frequency.value = 50 + normalizedVelocity * 100;
        droneGainRef.current.gain.value = 0.4 + normalizedVelocity * 0.5;
      }
      
      // Decay velocity
      mouseRef.current.velocityX *= 0.92;
      mouseRef.current.velocityY *= 0.92;
      
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
      className="w-full h-full cursor-none"
      style={{ background: "#080808" }}
    />
  );
}
