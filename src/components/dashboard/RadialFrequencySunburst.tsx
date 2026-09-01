import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const RadialFrequencySunburst: React.FC = () => {
  // 30 rays representing the last 30 days of spend velocity
  const rays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i * 360) / 30;
      // Procedural variation to simulate daily spend amounts
      const noise = Math.sin(i * 1.5) * Math.cos(i * 0.2) * Math.sin(i * 2.1);
      const baseLength = 40;
      const maxLength = 110;
      const length = baseLength + Math.abs(noise) * (maxLength - baseLength);
      
      arr.push({ angle, length, day: i + 1 });
    }
    return arr;
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="-140 -140 280 280" className="w-full h-full transform -rotate-90">
        <defs>
          <linearGradient id="inkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <g>
          {rays.map((ray, i) => {
            const innerRadius = 45;
            const outerRadius = ray.length;
            
            const x1 = innerRadius * Math.cos((ray.angle * Math.PI) / 180);
            const y1 = innerRadius * Math.sin((ray.angle * Math.PI) / 180);
            
            const x2 = outerRadius * Math.cos((ray.angle * Math.PI) / 180);
            const y2 = outerRadius * Math.sin((ray.angle * Math.PI) / 180);

            // Add day markers for every 5th day
            const isMarker = ray.day % 5 === 0 || ray.day === 1;
            const textRadius = 125;
            const tx = textRadius * Math.cos((ray.angle * Math.PI) / 180);
            const ty = textRadius * Math.sin((ray.angle * Math.PI) / 180);

            return (
              <g key={i}>
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#inkGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="butt"
                  initial={{ x2: x1, y2: y1, opacity: 0 }}
                  whileInView={{ x2, y2, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: i * 0.02,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                />
                {isMarker && (
                  <motion.text
                    x={tx}
                    y={ty}
                    fill="var(--color-ink)"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="opacity-40 tracking-tighter"
                    transform={`rotate(90, ${tx}, ${ty})`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.4 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.02 }}
                  >
                    {ray.day}
                  </motion.text>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Center empty void */}
        <circle cx="0" cy="0" r="42" fill="var(--color-bg-sage)" />
      </svg>

      {/* Center Label Context */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-ink)] leading-tight text-center">
          <div>30 DAY</div>
          <div className="opacity-50">VELOCITY</div>
        </div>
      </motion.div>
    </div>
  );
};
