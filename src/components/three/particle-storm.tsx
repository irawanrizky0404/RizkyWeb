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
    scene.background = new THREE.Color(0x080808);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Grid of particles
    const columns = 80;
    const rows = 40;
    const particleCount = columns * rows;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = i * rows + j;
        const i3 = idx * 3;
        
        positions[i3] = (i - columns / 2) * 1.5;
        positions[i3 + 1] = (j - rows / 2) * 1.2;
        positions[i3 + 2] = 0;

        // Color - orange and white
        if (Math.random() > 0.5) {
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.21;
          colors[i3 + 2] = 0.0;
        } else {
          colors[i3] = 1.0;
          colors[i3 + 1] = 1.0;
          colors[i3 + 2] = 1.0;
        }

        sizes[idx] = Math.random() * 2 + 2;
      }
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
          
          // Simple sine wave
          float wave = sin(pos.x * 0.12 + time * 0.6) * 3.0;
          float wave2 = sin(pos.x * 0.06 + time * 0.4) * 1.5;
          pos.y += wave + wave2;
          
          // Z depth wave
          pos.z += sin(pos.x * 0.1 + time * 0.5) * 1.0;
          
          // Mouse push - subtle and smooth
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 40.0, mouseY * 25.0));
          float push = smoothstep(25.0, 0.0, distToMouse) * (0.5 + mouseVelocity * 2.0);
          
          vec2 pushDir = normalize(vec2(pos.x, pos.y) - vec2(mouseX * 40.0, mouseY * 25.0));
          pos.x += pushDir.x * push * 2.0;
          pos.y += pushDir.y * push * 2.0;
          pos.z += push * 1.0;
          
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          float pulse = sin(time * 1.2 + pos.x * 0.1) * 0.2 + 0.8;
          vAlpha = smoothstep(90.0, 20.0, -mvPosition.z) * pulse + push * 0.5;
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
          
          float alpha = smoothstep(0.5, 0.15, dist) * vAlpha * 0.8;
          
          vec3 finalColor = vColor;
          if (vDist < 15.0) {
            finalColor = mix(vColor, vec3(1.0, 0.5, 0.1), smoothstep(15.0, 0.0, vDist) * 0.4);
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

    // Audio setup
    const initAudio = () => {
      if (isAudioReadyRef.current) return;
      isAudioReadyRef.current = true;
      
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new AudioContextClass();
        
        masterGainRef.current = audioRef.current.createGain();
        masterGainRef.current.gain.value = 0.2;
        masterGainRef.current.connect(audioRef.current.destination);
        
        // Main drone
        const osc1 = audioRef.current.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.value = 60;
        
        const gain1 = audioRef.current.createGain();
        gain1.gain.value = 0.15;
        
        const filter = audioRef.current.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 600;
        filter.Q.value = 3;
        
        osc1.connect(gain1);
        gain1.connect(filter);
        filter.connect(masterGainRef.current);
        osc1.start();
        
        // Second tone
        const osc2 = audioRef.current.createOscillator();
        osc2.type = "sine";
        osc2.frequency.value = 90;
        
        const gain2 = audioRef.current.createGain();
        gain2.gain.value = 0.1;
        
        osc2.connect(gain2);
        gain2.connect(masterGainRef.current);
        osc2.start();
        
        // Third tone
        const osc3 = audioRef.current.createOscillator();
        osc3.type = "triangle";
        osc3.frequency.value = 120;
        
        const gain3 = audioRef.current.createGain();
        gain3.gain.value = 0.05;
        
        osc3.connect(gain3);
        gain3.connect(masterGainRef.current);
        osc3.start();
        
      } catch (e) {
        console.warn("Audio error:", e);
      }
    };

    container.addEventListener("mouseenter", initAudio);
    container.addEventListener("click", initAudio);
    container.addEventListener("touchstart", initAudio, { once: true });

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      mouseRef.current.velocityX = (newX - mouseRef.current.lastX) * 0.3 + mouseRef.current.velocityX * 0.7;
      mouseRef.current.velocityY = (newY - mouseRef.current.lastY) * 0.3 + mouseRef.current.velocityY * 0.7;
      
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
        
        mouseRef.current.velocityX = (newX - mouseRef.current.lastX) * 0.3 + mouseRef.current.velocityX * 0.7;
        mouseRef.current.velocityY = (newY - mouseRef.current.lastY) * 0.3 + mouseRef.current.velocityY * 0.7;
        
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
      ) / 12;
      const normalizedVelocity = Math.min(Math.max(velocity, 0), 1);
      
      material.uniforms.mouseVelocity.value += (normalizedVelocity - material.uniforms.mouseVelocity.value) * 0.08;
      
      // Update audio
      if (masterGainRef.current && audioRef.current && audioRef.current.state !== "suspended") {
        masterGainRef.current.gain.value = 0.15 + normalizedVelocity * 0.25;
      }
      
      mouseRef.current.velocityX *= 0.92;
      mouseRef.current.velocityY *= 0.92;
      
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
      container.removeEventListener("touchstart", initAudio);
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
      style={{ background: "#080808" }}
    />
  );
}
