"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function NoiseTerrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, normalizedX: 0, normalizedY: 0, velocityX: 0, velocityY: 0, lastX: 0, lastY: 0 });

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
        mouseX: { value: 0 },
        mouseY: { value: 0 },
        mouseVelocity: { value: 0 },
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying float vHeight;
        varying float vDist;
        uniform float time;
        uniform float mouseX;
        uniform float mouseY;
        uniform float mouseVelocity;
        
        void main() {
          vColor = color;
          vNormal = normal;
          vHeight = position.y;
          
          vec3 pos = position;
          
          // Animate terrain with wave
          float wave = sin(pos.x * 0.1 + time * 0.5) * cos(pos.z * 0.1 + time * 0.3) * 2.0;
          float wave2 = sin(pos.x * 0.05 + pos.z * 0.05 + time * 0.4) * 1.5;
          
          // Mouse influence - create ripple from cursor
          float distToMouse = distance(vec2(pos.x, pos.z), vec2(mouseX * 40.0, mouseY * 40.0));
          float ripple = sin(distToMouse * 0.3 - time * 3.0) * exp(-distToMouse * 0.05) * mouseVelocity * 3.0;
          
          pos.y += wave + wave2 + ripple;
          
          vDist = distToMouse;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec3 vNormal;
        varying float vHeight;
        varying float vDist;
        
        void main() {
          vec3 light = normalize(vec3(0.5, 1.0, 0.3));
          float diff = max(dot(vNormal, light), 0.0);
          
          vec3 finalColor = vColor * (0.3 + diff * 0.7);
          
          // Add glow at peaks
          if (vHeight > 3.0) {
            finalColor += vec3(0.3, 0.1, 0.0) * ((vHeight - 3.0) / 5.0);
          }
          
          // Mouse glow effect
          if (vDist < 15.0) {
            float glow = smoothstep(15.0, 0.0, vDist) * 0.4;
            finalColor += vec3(1.0, 0.4, 0.1) * glow;
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
      
      material.uniforms.mouseX.value += (mouseRef.current.normalizedX - material.uniforms.mouseX.value) * 0.08;
      material.uniforms.mouseY.value += (mouseRef.current.normalizedY - material.uniforms.mouseY.value) * 0.08;
      
      wireframeMaterial.opacity = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

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

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

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
