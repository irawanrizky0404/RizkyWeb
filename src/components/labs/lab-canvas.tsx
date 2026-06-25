"use client";

import dynamic from "next/dynamic";

const FluidSim = dynamic(() => import("@/components/labs/fluid-sim").then(m => m.FluidSim), { ssr: false });
const WireframeCube = dynamic(() => import("@/components/labs/wireframe-cube").then(m => m.WireframeCube), { ssr: false });

export function LabCanvas({ componentName }: { componentName: string }) {
  if (componentName === "FluidSim") return <FluidSim />;
  if (componentName === "WireframeCube") return <WireframeCube />;
  return null;
}
