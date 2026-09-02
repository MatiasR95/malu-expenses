import React from 'react';
import { StatementHeroCard } from '../dashboard/StatementHeroCard';
import { PaceMeter } from '../dashboard/PaceMeter';
import { MonthVitals } from '../dashboard/MonthVitals';
import { CategorySplit } from '../dashboard/CategorySplit';
import { RecentActivityLedger } from '../dashboard/RecentActivityLedger';
import { Expense } from '../../types/finance';

interface HomeScreenProps {
  onEditExpense: (expense: Expense) => void;
  onAdd: () => void;
  onSeeCategories: () => void;
}

/**
 * The cockpit, top to bottom: how much is left, whether the rate of spend
 * reaches the end of the month, the readings behind that verdict, where the
 * money went, and finally the rows themselves.
 *
 * The order is deliberate -- headline figure, then the judgement, then the
 * evidence. Each block is a section with its own reveal delay so the screen
 * assembles rather than appearing all at once.
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({ onEditExpense, onAdd, onSeeCategories }) => {
  return (
    <div className="flex flex-col w-full gap-7">
      <StatementHeroCard />

      <div className="reveal" style={{ animationDelay: '160ms' }}>
        <PaceMeter />
      </div>

      <div className="reveal" style={{ animationDelay: '200ms' }}>
        <MonthVitals />
      </div>

      <div className="reveal" style={{ animationDelay: '240ms' }}>
        <CategorySplit onSeeAll={onSeeCategories} />
      </div>

      <RecentActivityLedger onExpenseClick={onEditExpense} onAdd={onAdd} />
    </div>
  );
};
