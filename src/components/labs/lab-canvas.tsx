"use client";

import dynamic from "next/dynamic";

const FluidSim = dynamic(() => import("@/components/labs/fluid-sim").then(m => m.FluidSim), { ssr: false });
const WireframeCube = dynamic(() => import("@/components/labs/wireframe-cube").then(m => m.WireframeCube), { ssr: false });
const ParticlesVortex = dynamic(() => import("@/components/labs/particles-vortex").then(m => m.ParticlesVortex), { ssr: false });
const DistortedSphere = dynamic(() => import("@/components/labs/distorted-sphere").then(m => m.DistortedSphere), { ssr: false });
const HologramTorus = dynamic(() => import("@/components/labs/hologram-torus").then(m => m.HologramTorus), { ssr: false });

export function LabCanvas({ componentName }: { componentName: string }) {
  if (componentName === "FluidSim") return <FluidSim />;
  if (componentName === "WireframeCube") return <WireframeCube />;
  if (componentName === "ParticlesVortex") return <ParticlesVortex />;
  if (componentName === "DistortedSphere") return <DistortedSphere />;
  if (componentName === "HologramTorus") return <HologramTorus />;
  return null;
}
