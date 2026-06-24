"use client";

import { createContext, useContext } from "react";
import type { DesignConfig } from "@/lib/store";

const DesignContext = createContext<DesignConfig | null>(null);

export function DesignProvider({ design, children }: { design: DesignConfig; children: React.ReactNode }) {
  return <DesignContext.Provider value={design}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  return useContext(DesignContext);
}
