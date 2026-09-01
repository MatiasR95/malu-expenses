import React from 'react';
import { motion } from 'framer-motion';

export const StepLineChart: React.FC = () => {
  // A stark, brutalist step-chart (stock market style)
  // We'll generate 20 points
  const points = [];
  let currentY = 100;
  for (let i = 0; i <= 20; i++) {
    points.push({ x: i * (300 / 20), y: currentY });
    // Random step up or down
    currentY += (Math.random() - 0.3) * 30; // slightly upward trend
    currentY = Math.max(20, Math.min(130, currentY));
  }

  // Convert points to SVG polyline string (step chart style)
  let pathD = `M ${points[0].x},${points[0].y} `;
  for (let i = 1; i < points.length; i++) {
    // Horizontal then vertical for a step chart
    pathD += `L ${points[i].x},${points[i-1].y} L ${points[i].x},${points[i].y} `;
  }

  return (
    <div className="w-full h-32 relative border border-[var(--color-ink)]/10 bg-[var(--color-ink)]/5 p-4 flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-start z-10">
        <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">Monthly Trajectory</span>
        <span className="text-[9px] font-mono uppercase tracking-widest font-bold opacity-80">+14.2%</span>
      </div>
      
      <svg viewBox="0 0 300 150" className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none">
        <motion.path
          d={pathD}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Fill under the step chart */}
        <motion.path
          d={`${pathD} L 300,150 L 0,150 Z`}
          fill="var(--color-ink)"
          fillOpacity="0.05"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </svg>
      
      <div className="flex justify-between items-end z-10">
        <span className="text-[9px] font-mono opacity-40">01</span>
        <span className="text-[9px] font-mono opacity-40">15</span>
        <span className="text-[9px] font-mono opacity-40">30</span>
      </div>
    </div>
  );
};
