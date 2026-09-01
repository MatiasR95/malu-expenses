import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';

export const InteractiveHeroChart: React.FC = () => {
  const { monthlySummary } = useFinance();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate 14 days of mock daily cashflow data based on net available cash
  const data = useMemo(() => {
    let current = monthlySummary.netAvailableCash * 0.8; 
    const pts = [];
    for (let i = 0; i < 14; i++) {
      pts.push({
        day: 14 - i,
        value: current
      });
      current += (Math.random() - 0.4) * 150000;
    }
    return pts.reverse();
  }, [monthlySummary.netAvailableCash]);

  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = Math.min(...data.map(d => d.value));
  
  const normalize = (val: number) => {
    return 100 - ((val - minVal) / (maxVal - minVal)) * 100;
  };

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 300;
    const y = normalize(d.value);
    return { x, y, ...d };
  });

  const pathD = `M 0,${points[0].y} ` + points.map(p => `L ${p.x},${p.y}`).join(' ');

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const targetIndex = Math.min(Math.max(Math.round(percentage * (data.length - 1)), 0), data.length - 1);
    setHoverIndex(targetIndex);
  };

  return (
    <div className="w-full mt-4 flex flex-col items-center relative z-20">
      
      {/* Interactive Display Number */}
      <div className="h-6 mb-2 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {hoverIndex !== null ? (
            <motion.div
              key="hovering"
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink)] flex items-center justify-center gap-3 bg-[var(--color-accent-mustard)] px-4 py-1.5 shadow-[2px_2px_0_0_var(--color-ink)] border-2 border-[var(--color-ink)]"
            >
              <span className="opacity-70 font-bold">Day {points[hoverIndex].day}</span>
              <span className="font-display text-sm font-bold">${Math.round(points[hoverIndex].value).toLocaleString()}</span>
            </motion.div>
          ) : (
             <motion.div
             key="idle"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink)] opacity-50 bg-[var(--color-ink)]/5 px-4 py-1.5 rounded-full"
           >
             14-Day Trajectory (Hold & Drag)
           </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full h-40 relative">
        <svg 
          viewBox="0 0 300 120" 
          className="w-full h-full overflow-visible touch-none" 
          preserveAspectRatio="none"
          onPointerDown={(e) => {
            setIsDragging(true);
            (e.target as Element).setPointerCapture(e.pointerId);
            handlePointerMove(e);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => {
            setIsDragging(false);
            setHoverIndex(null);
            (e.target as Element).releasePointerCapture(e.pointerId);
          }}
          onPointerLeave={() => {
            setIsDragging(false);
            setHoverIndex(null);
          }}
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
            </linearGradient>
            
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-accent-terracotta)" />
              <stop offset="50%" stopColor="var(--color-ink)" />
              <stop offset="100%" stopColor="var(--color-accent-mustard)" />
            </linearGradient>
          </defs>

          {/* Base Area Fill */}
          <motion.path
            d={`${pathD} L 300,120 L 0,120 Z`}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          
          {/* Colored Brutalist Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Touch Nodes */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Vertical guideline on hover */}
              {hoverIndex === i && (
                <motion.line 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  x1={p.x} y1={p.y} 
                  x2={p.x} y2="120" 
                  stroke="var(--color-ink)" 
                  strokeWidth="1.5" 
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                  className="pointer-events-none"
                />
              )}
              {/* Visible node */}
              <motion.circle 
                cx={p.x} 
                cy={p.y} 
                animate={{
                  r: hoverIndex === i ? 6 : 2,
                  fill: hoverIndex === i ? "var(--color-accent-mustard)" : "var(--color-ink)",
                  stroke: hoverIndex === i ? "var(--color-ink)" : "transparent",
                  strokeWidth: hoverIndex === i ? 2 : 0
                }}
                vectorEffect="non-scaling-stroke"
                className="pointer-events-none"
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
