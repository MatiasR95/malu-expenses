import React from 'react';
import { StatementHeroCard } from '../dashboard/StatementHeroCard';
import { RecentActivityLedger } from '../dashboard/RecentActivityLedger';
import { Expense } from '../../types/finance';

interface HomeScreenProps {
  onEditExpense: (expense: Expense) => void;
  onAdd: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onEditExpense, onAdd }) => {
  return (
    <div className="flex flex-col w-full">
      <StatementHeroCard />
      <RecentActivityLedger onExpenseClick={onEditExpense} onAdd={onAdd} />
    </div>
  );
};
