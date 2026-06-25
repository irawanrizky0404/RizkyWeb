"use client";

import { useEffect, useState, useRef } from "react";

export function AnalyticsChart() {
  const [data, setData] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Generate 30 days of simulated random traffic
    const points = [];
    let current = Math.floor(Math.random() * 100) + 50;
    for (let i = 0; i < 30; i++) {
      points.push(current);
      // Random walk with a slight upward trend
      current += Math.floor(Math.random() * 60) - 25; 
      if (current < 10) current = 10;
    }
    setData(points);
  }, []);

  if (data.length === 0) return null;

  const max = Math.max(...data) * 1.2; // Add some headroom
  
  return (
    <div className="border border-rule relative overflow-hidden group">
      <div className="flex items-center justify-between border-b border-rule px-5 py-3">
        <span className="lab text-white/60" style={{ fontSize: "0.58rem" }}>Traffic Overview (Simulated)</span>
        <span className="lab text-signal" style={{ fontSize: "0.52rem" }}>Last 30 Days</span>
      </div>
      
      <div ref={containerRef} className="h-48 relative px-5 py-4 flex items-end justify-between gap-1">
        {data.map((val, i) => {
          const heightPct = (val / max) * 100;
          return (
            <div key={i} className="relative flex-1 h-full flex items-end group/bar">
              <div 
                className="w-full bg-signal/20 hover:bg-signal transition-all duration-300" 
                style={{ height: `${heightPct}%` }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap bg-black border border-rule px-2 py-1 z-10 pointer-events-none">
                <span className="lab text-white" style={{ fontSize: "0.5rem" }}>{val} Views</span>
              </div>
            </div>
          );
        })}
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, transparent 95%, rgba(255,255,255,0.05) 100%)', backgroundSize: '100% 25%' }} />
      </div>
      
      <div className="border-t border-rule px-5 py-3 flex justify-between bg-black/50">
        <div className="flex flex-col">
          <span className="lab text-white/40 mb-1" style={{ fontSize: "0.5rem" }}>Total Visitors</span>
          <span className="dis text-white" style={{ fontSize: "1.2rem", lineHeight: 1 }}>
            {data.reduce((a, b) => a + b, 0).toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="lab text-white/40 mb-1" style={{ fontSize: "0.5rem" }}>Trend</span>
          <span className="dis text-signal" style={{ fontSize: "1.2rem", lineHeight: 1 }}>+14%</span>
        </div>
      </div>
    </div>
  );
}
