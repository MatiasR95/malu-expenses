import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  data: { label: string; value: number }[];
}

export const BrutalistBarcodeChart: React.FC<Props> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full flex items-end gap-[2px] h-32 mt-6">
      {data.map((item, i) => {
        const heightPercent = (item.value / maxValue) * 100;
        // Alternate colors for brutalist contrast
        const isHighlight = i % 3 === 0;
        
        return (
          <div key={item.label} className="flex-1 flex flex-col justify-end group relative h-full">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${heightPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full min-h-[4px] ${isHighlight ? 'bg-[var(--color-accent-terracotta)]' : 'bg-[var(--color-ink)]'}`}
            />
            
            {/* Tooltip on hover (desktop) or just subtle data visual */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-ink)] text-white text-[9px] font-mono px-1 py-0.5 pointer-events-none whitespace-nowrap z-10">
              {item.label}: ${Math.round(item.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
