"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ShaderPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Full screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(width, height) },
        mouse: { value: new THREE.Vector2(0.5, 0.5) },
        hoverIntensity: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        uniform float hoverIntensity;
        varying vec2 vUv;
        
        // Noise function
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec2 uv = vUv;
          vec2 p = (uv - 0.5) * 2.0;
          p.x *= resolution.x / resolution.y;
          
          // Mouse influence
          vec2 mouseP = (mouse - 0.5) * 2.0;
          mouseP.x *= resolution.x / resolution.y;
          float mouseDist = length(p - mouseP);
          
          // Layered noise
          float n1 = fbm(p * 2.0 + time * 0.1);
          float n2 = fbm(p * 4.0 - time * 0.15);
          float n3 = fbm(p * 8.0 + time * 0.2);
          
          // Combine
          float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
          
          // Mouse glow
          float glow = smoothstep(0.8, 0.0, mouseDist) * 0.5;
          
          // Orange color palette
          vec3 deepOrange = vec3(0.8, 0.15, 0.0);
          vec3 brightOrange = vec3(1.0, 0.4, 0.1);
          vec3 cream = vec3(1.0, 0.9, 0.8);
          
          vec3 color = mix(deepOrange, brightOrange, pattern);
          color = mix(color, cream, pattern * pattern * 0.5);
          
          // Add mouse glow
          color += vec3(1.0, 0.3, 0.1) * glow;
          
          // Invert only near mouse area
          float invertMask = smoothstep(0.6, 0.1, mouseDist) * hoverIntensity;
          color = mix(color, vec3(1.0) - color, invertMask);
          
          // Vignette
          float vignette = 1.0 - length(uv - 0.5) * 0.8;
          color *= vignette;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    // Mouse tracking
    const hoverRef = { current: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      material.uniforms.mouse.value.x = (e.clientX - rect.left) / rect.width;
      material.uniforms.mouse.value.y = 1.0 - (e.clientY - rect.top) / rect.height;
      hoverRef.current = 1;
    };
    const handleMouseLeave = () => {
      hoverRef.current = 0;
    };
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      material.uniforms.time.value += 0.01;
      material.uniforms.hoverIntensity.value += (hoverRef.current - material.uniforms.hoverIntensity.value) * 0.06;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      material.uniforms.resolution.value.set(w, h);
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
