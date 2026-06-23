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

    // Joy Division Unknown Pleasures waveform - 50 curved lines
    const lines = 50;
    const pointsPerLine = 120;
    const particleCount = lines * pointsPerLine;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Pulsar data - the classic amplitude pattern
    const pulsarAmplitude = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 
      5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14, 
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 
      33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 
      51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 
      69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 
      87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 
      105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120
    ];

    let idx = 0;
    for (let line = 0; line < lines; line++) {
      // Each line curves based on pulsar amplitude
      const yOffset = (line - lines / 2) * 0.8;
      const pulseOffset = Math.sin(line * 0.3) * 2;
      
      for (let p = 0; p < pointsPerLine; p++) {
        const i3 = idx * 3;
        
        // X position across width
        const x = (p - pointsPerLine / 2) * 0.7;
        
        // Y position from pulsar amplitude
        const amp = pulsarAmplitude[p] || 0;
        const amplitudeNormalized = amp / 60;
        const y = yOffset + (Math.random() - 0.5) * 0.2;
        
        // Z slight variation
        const z = (Math.random() - 0.5) * 0.5;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        // Color - white to orange gradient based on amplitude
        if (amplitudeNormalized > 0.8) {
          // Orange at peaks
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.21;
          colors[i3 + 2] = 0.0;
        } else {
          // White
          colors[i3] = 0.95;
          colors[i3 + 1] = 0.95;
          colors[i3 + 2] = 0.95;
        }
        
        sizes[idx] = Math.random() * 1.5 + 0.8;
        idx++;
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
          
          // Subtle wave animation
          float wave = sin(pos.x * 0.1 + time * 0.5) * 0.3;
          float wave2 = cos(pos.y * 0.2 + time * 0.3) * 0.2;
          pos.y += wave + wave2;
          pos.z += sin(pos.x * 0.05 + time * 0.4) * 0.5;
          
          // Very subtle mouse influence
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 35.0, mouseY * 20.0));
          float push = smoothstep(20.0, 0.0, distToMouse) * (0.3 + mouseVelocity * 1.0);
          
          vec2 pushDir = normalize(vec2(pos.x, pos.y) - vec2(mouseX * 35.0, mouseY * 20.0));
          pos.x += pushDir.x * push * 1.5;
          pos.y += pushDir.y * push * 1.5;
          pos.z += push * 0.5;
          
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          float pulse = sin(time * 0.8 + pos.x * 0.1 + pos.y * 0.05) * 0.15 + 0.85;
          vAlpha = smoothstep(80.0, 20.0, -mvPosition.z) * pulse;
          vAlpha = min(vAlpha, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.15, dist) * vAlpha * 0.9;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Joy Division Industrial Bass Sound
    const initAudio = () => {
      if (isAudioReadyRef.current) return;
      isAudioReadyRef.current = true;
      
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new AudioContextClass();
        
        masterGainRef.current = audioRef.current.createGain();
        masterGainRef.current.gain.value = 0.12;
        masterGainRef.current.connect(audioRef.current.destination);
        
        // Deep industrial bass - the iconic JD sound
        const bassOsc = audioRef.current.createOscillator();
        bassOsc.type = "sawtooth";
        bassOsc.frequency.value = 41; // Very low D
        bassOsc.connect(masterGainRef.current);
        bassOsc.start();
        
        // Pulsing second bass
        const bass2 = audioRef.current.createOscillator();
        bass2.type = "square";
        bass2.frequency.value = 42;
        
        const bass2Gain = audioRef.current.createGain();
        bass2Gain.gain.value = 0.06;
        
        // LFO for pulsing effect
        const lfo = audioRef.current.createOscillator();
        lfo.frequency.value = 0.8; // Slow pulse like the song
        const lfoGain = audioRef.current.createGain();
        lfoGain.gain.value = 0.04;
        
        lfo.connect(lfoGain);
        lfoGain.connect(bass2Gain.gain);
        lfo.start();
        
        bass2.connect(bass2Gain);
        bass2Gain.connect(masterGainRef.current);
        bass2.start();
        
        // High tension sound
        const highOsc = audioRef.current.createOscillator();
        highOsc.type = "sine";
        highOsc.frequency.value = 180;
        
        const highGain = audioRef.current.createGain();
        highGain.gain.value = 0.03;
        
        const highFilter = audioRef.current.createBiquadFilter();
        highFilter.type = "bandpass";
        highFilter.frequency.value = 200;
        highFilter.Q.value = 10;
        
        highOsc.connect(highFilter);
        highFilter.connect(highGain);
        highGain.connect(masterGainRef.current);
        highOsc.start();
        
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
      
      mouseRef.current.velocityX = (newX - mouseRef.current.lastX) * 0.2 + mouseRef.current.velocityX * 0.8;
      mouseRef.current.velocityY = (newY - mouseRef.current.lastY) * 0.2 + mouseRef.current.velocityY * 0.8;
      
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
        
        mouseRef.current.velocityX = (newX - mouseRef.current.lastX) * 0.2 + mouseRef.current.velocityX * 0.8;
        mouseRef.current.velocityY = (newY - mouseRef.current.lastY) * 0.2 + mouseRef.current.velocityY * 0.8;
        
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
      material.uniforms.time.value += 0.008;
      
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.05;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.05;
      
      const velocity = Math.sqrt(
        mouseRef.current.velocityX * mouseRef.current.velocityX +
        mouseRef.current.velocityY * mouseRef.current.velocityY
      ) / 10;
      const normalizedVelocity = Math.min(Math.max(velocity, 0), 1);
      
      material.uniforms.mouseVelocity.value += (normalizedVelocity - material.uniforms.mouseVelocity.value) * 0.06;
      
      if (masterGainRef.current && audioRef.current && audioRef.current.state !== "suspended") {
        masterGainRef.current.gain.value = 0.1 + normalizedVelocity * 0.1;
      }
      
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
