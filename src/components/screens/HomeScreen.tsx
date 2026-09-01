import React from 'react';
import { StatementHeroCard } from '../dashboard/StatementHeroCard';
import { RecentActivityLedger } from '../dashboard/RecentActivityLedger';
import { Expense } from '../../types/finance';

interface HomeScreenProps {
  onEditExpense: (expense: Expense) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onEditExpense }) => {
  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Top half: Massive Sage block with text and sunburst */}
      <StatementHeroCard />
      
      {/* Bottom half: Stacked Flush Blocks for Transactions */}
      <div className="mt-4 flex flex-col w-full rounded-t-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* We wrap the ledger in a container that has rounded top corners just to give it a solid boundary if needed, 
            or we can leave it completely flat edge-to-edge. Let's make it flat. */}
        <RecentActivityLedger onExpenseClick={onEditExpense} />
      </div>
    </div>
  );
};
