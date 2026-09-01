import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { InteractiveHeroChart } from './InteractiveHeroChart';

export const StatementHeroCard: React.FC = () => {
  const { monthlySummary, userFilter } = useFinance();

  const formattedTotal = monthlySummary.netAvailableCash.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const [integerPart, decimalPart] = formattedTotal.split('.');

  return (
    <div className="flex flex-col items-center pt-2 pb-8 bg-[var(--color-bg-sage)] overflow-hidden w-full">
      {/* Title */}
      <div className="w-full text-left px-6">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-ink)] opacity-60 mb-2">
          {userFilter === 'all' ? 'Total Available' : `${userFilter}'s Available`}
        </h2>
      </div>

      {/* Massive Amount - using standard responsive text sizing to prevent overflow */}
      <div className="w-full text-left px-6">
        <div className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-[var(--color-ink)] flex items-baseline whitespace-nowrap tracking-normal">
          <span className="text-2xl sm:text-3xl mr-1 opacity-70">$</span>
          <span>{integerPart}</span>
          {/* Use ml-1 to separate the outline stroke slightly so it doesn't overlap */}
          <span className="decimal-outline text-3xl sm:text-4xl ml-1">.{decimalPart}</span>
        </div>
      </div>

      {/* Interactive Trajectory Visualization (Bleeds Edge to Edge) */}
      <div className="w-full mt-4">
        <InteractiveHeroChart />
      </div>
    </div>
  );
};
