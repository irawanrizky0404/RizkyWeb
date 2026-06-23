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
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Joy Division Unknown Pleasures - 40 curved lines
    const lineCount = 40;
    const pointsPerLine = 100;
    
    // Pulsar amplitude data (normalized) - the classic curve
    const pulsarCurve = [
      0.1, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0,
      1.2, 1.5, 1.8, 2.2, 2.6, 3.0, 3.4, 3.8, 4.2, 4.6,
      5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.0, 7.2, 7.4,
      7.6, 7.8, 8.0, 8.2, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9,
      9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9,
      10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9,
      11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9,
      12.0, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9,
      13.0, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9,
      14.0, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9,
      15.0, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9,
      16.0, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9,
      17.0, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9,
      18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9,
      19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9,
      20.0, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9,
      21.0, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9,
      22.0, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9,
      23.0, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9,
      24.0, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9,
      25.0, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9,
      26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9,
      27.0, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9,
      28.0, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9,
      29.0, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9,
      30.0, 29.9, 29.8, 29.7, 29.6, 29.5, 29.4, 29.3, 29.2, 29.1,
      29.0, 28.9, 28.8, 28.7, 28.6, 28.5, 28.4, 28.3, 28.2, 28.1,
      28.0, 27.9, 27.8, 27.7, 27.6, 27.5, 27.4, 27.3, 27.2, 27.1,
      27.0, 26.9, 26.8, 26.7, 26.6, 26.5, 26.4, 26.3, 26.2, 26.1,
      26.0, 25.9, 25.8, 25.7, 25.6, 25.5, 25.4, 25.3, 25.2, 25.1,
      25.0, 24.9, 24.8, 24.7, 24.6, 24.5, 24.4, 24.3, 24.2, 24.1,
      24.0, 23.9, 23.8, 23.7, 23.6, 23.5, 23.4, 23.3, 23.2, 23.1,
      23.0, 22.9, 22.8, 22.7, 22.6, 22.5, 22.4, 22.3, 22.2, 22.1,
      22.0, 21.9, 21.8, 21.7, 21.6, 21.5, 21.4, 21.3, 21.2, 21.1,
      21.0, 20.9, 20.8, 20.7, 20.6, 20.5, 20.4, 20.3, 20.2, 20.1,
      20.0, 19.9, 19.8, 19.7, 19.6, 19.5, 19.4, 19.3, 19.2, 19.1,
      19.0, 18.9, 18.8, 18.7, 18.6, 18.5, 18.4, 18.3, 18.2, 18.1,
      18.0, 17.9, 17.8, 17.7, 17.6, 17.5, 17.4, 17.3, 17.2, 17.1,
      17.0, 16.9, 16.8, 16.7, 16.6, 16.5, 16.4, 16.3, 16.2, 16.1,
      16.0, 15.9, 15.8, 15.7, 15.6, 15.5, 15.4, 15.3, 15.2, 15.1,
      15.0, 14.9, 14.8, 14.7, 14.6, 14.5, 14.4, 14.3, 14.2, 14.1,
      14.0, 13.9, 13.8, 13.7, 13.6, 13.5, 13.4, 13.3, 13.2, 13.1,
      13.0, 12.9, 12.8, 12.7, 12.6, 12.5, 12.4, 12.3, 12.2, 12.1,
      12.0, 11.9, 11.8, 11.7, 11.6, 11.5, 11.4, 11.3, 11.2, 11.1,
      11.0, 10.9, 10.8, 10.7, 10.6, 10.5, 10.4, 10.3, 10.2, 10.1,
      10.0, 9.9, 9.8, 9.7, 9.6, 9.5, 9.4, 9.3, 9.2, 9.1, 9.0, 8.9,
      8.8, 8.7, 8.6, 8.5, 8.4, 8.3, 8.2, 8.1, 8.0, 7.9, 7.8, 7.7,
      7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5,
      6.4, 6.3, 6.2, 6.1, 6.0, 5.9, 5.8, 5.7, 5.6, 5.5, 5.4, 5.3,
      5.2, 5.1, 5.0, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1,
      4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.1, 3.0, 2.9,
      2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8, 1.7,
      1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5,
      0.4, 0.3, 0.2, 0.1, 0.1
    ];

    const particleCount = lineCount * pointsPerLine;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lineOffsets = new Float32Array(lineCount);

    // Generate line offsets for variation
    for (let l = 0; l < lineCount; l++) {
      lineOffsets[l] = (Math.random() - 0.5) * 0.3;
    }

    let idx = 0;
    for (let line = 0; line < lineCount; line++) {
      // Each line is offset vertically
      const baseY = (line - lineCount / 2) * 1.2;
      // The amplitude varies along the line (pulsar shape)
      
      for (let p = 0; p < pointsPerLine; p++) {
        const i3 = idx * 3;
        
        // X position - spreads wide
        const x = (p - pointsPerLine / 2) * 0.9;
        
        // Get amplitude at this point (0 to 1 normalized)
        const amp = pulsarCurve[p] / 15.0; // Normalize to ~1
        
        // Y position - curved based on amplitude, creating the wave
        // The curve goes up then down, following pulsar shape
        const curveY = (amp - 0.5) * 8.0; // Displacement from center
        const y = baseY + curveY + lineOffsets[line];
        
        // Z with slight variation
        const z = (Math.random() - 0.5) * 0.4;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        // Color - white/cream, with orange at peaks
        const distFromCenter = Math.abs(amp - 0.5);
        if (distFromCenter > 0.35) {
          // Orange at the peaks
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.25;
          colors[i3 + 2] = 0.0;
        } else {
          // White/cream
          colors[i3] = 0.95;
          colors[i3 + 1] = 0.93;
          colors[i3 + 2] = 0.90;
        }
        
        // Smaller particles
        sizes[idx] = Math.random() * 1.2 + 0.6;
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
        uniform float time;
        uniform float mouseX;
        uniform float mouseY;
        uniform float mouseVelocity;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Very subtle breathing animation
          float breathe = sin(time * 0.3) * 0.1;
          pos.y += breathe * (pos.y / 10.0);
          pos.z += sin(time * 0.4 + pos.x * 0.1) * 0.2;
          
          // Very subtle mouse influence
          float distToMouse = distance(vec2(pos.x, pos.y), vec2(mouseX * 45.0, mouseY * 25.0));
          float push = smoothstep(25.0, 0.0, distToMouse) * (0.2 + mouseVelocity * 0.8);
          
          vec2 pushDir = normalize(vec2(pos.x, pos.y) - vec2(mouseX * 45.0, mouseY * 25.0));
          pos.x += pushDir.x * push * 1.0;
          pos.y += pushDir.y * push * 1.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (220.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = smoothstep(100.0, 20.0, -mvPosition.z) * 0.9;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.1, dist) * vAlpha * 0.9;
          
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
        masterGainRef.current.gain.value = 0.15;
        masterGainRef.current.connect(audioRef.current.destination);
        
        // Deep industrial bass - the iconic JD sound
        const bassOsc = audioRef.current.createOscillator();
        bassOsc.type = "sawtooth";
        bassOsc.frequency.value = 41;
        
        const bassGain = audioRef.current.createGain();
        bassGain.gain.value = 0.12;
        
        bassOsc.connect(bassGain);
        bassGain.connect(masterGainRef.current);
        bassOsc.start();
        
        // Pulsing second bass
        const bass2 = audioRef.current.createOscillator();
        bass2.type = "square";
        bass2.frequency.value = 42;
        
        const bass2Gain = audioRef.current.createGain();
        bass2Gain.gain.value = 0.06;
        
        // LFO for pulsing
        const lfo = audioRef.current.createOscillator();
        lfo.frequency.value = 0.75;
        const lfoGain = audioRef.current.createGain();
        lfoGain.gain.value = 0.05;
        
        lfo.connect(lfoGain);
        lfoGain.connect(bass2Gain.gain);
        lfo.start();
        
        bass2.connect(bass2Gain);
        bass2Gain.connect(masterGainRef.current);
        bass2.start();
        
        // High eerie tone
        const highOsc = audioRef.current.createOscillator();
        highOsc.type = "sine";
        highOsc.frequency.value = 165;
        
        const highGain = audioRef.current.createGain();
        highGain.gain.value = 0.04;
        
        const highFilter = audioRef.current.createBiquadFilter();
        highFilter.type = "bandpass";
        highFilter.frequency.value = 180;
        highFilter.Q.value = 15;
        
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
      material.uniforms.time.value += 0.01;
      
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.04;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.04;
      
      const velocity = Math.sqrt(
        mouseRef.current.velocityX * mouseRef.current.velocityX +
        mouseRef.current.velocityY * mouseRef.current.velocityY
      ) / 10;
      const normalizedVelocity = Math.min(Math.max(velocity, 0), 1);
      
      material.uniforms.mouseVelocity.value += (normalizedVelocity - material.uniforms.mouseVelocity.value) * 0.05;
      
      if (masterGainRef.current && audioRef.current && audioRef.current.state !== "suspended") {
        masterGainRef.current.gain.value = 0.12 + normalizedVelocity * 0.1;
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
