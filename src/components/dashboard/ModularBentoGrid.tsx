import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatARS } from '../../utils/currency';
import { Dumbbell, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ModularBentoGrid: React.FC = () => {
  const { monthlySummary, recurringCommitments, setActiveTab, toggleRecurringPaid, selectedMonth } = useFinance();

  const targetGymRevenue = 450000;
  const gymProgressPercent = Math.min(100, Math.round((monthlySummary.forceGymTotal / targetGymRevenue) * 100));

  const today = new Date();
  const currentDay = today.getDate();
  
  const sortedCommitments = [...recurringCommitments].sort((a, b) => a.dueDay - b.dueDay);
  
  const nextCommitment = sortedCommitments.find(c => !c.paidMonths[selectedMonth] && c.dueDay >= currentDay)
    || sortedCommitments.find(c => !c.paidMonths[selectedMonth])
    || sortedCommitments[0];

  const isNextPaid = nextCommitment ? !!nextCommitment.paidMonths[selectedMonth] : false;
  const daysUntilDue = nextCommitment ? nextCommitment.dueDay - currentDay : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* 1. Force Gym Inflows Bento Tile */}
      <div
        onClick={() => setActiveTab('force_gym')}
        className="bento-card bento-card-interactive p-4 flex flex-col justify-between group"
      >
        <div>
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <div className="flex items-center gap-1.5 text-[#FBE4A0] font-semibold">
              <Dumbbell size={14} />
              <span className="font-display tracking-tight">Force Gym HQ</span>
            </div>
            <span className="text-[10px] font-mono text-white/40 group-hover:text-white transition-colors flex items-center gap-0.5">
              <span>View Roster</span>
              <ChevronRight size={12} />
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-xl font-decimal font-bold text-white">
              {formatARS(monthlySummary.forceGymTotal)}
            </div>
            <span className="text-[11px] font-mono text-[#FBE4A0] font-semibold">
              {gymProgressPercent}% of target
            </span>
          </div>

          <div className="text-[11px] text-white/40 mt-0.5">
            {monthlySummary.forceCuotasCount} regular passes logged this month
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${gymProgressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-[#FBE4A0] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 2. Upcoming Deadlines Radar Bento Tile */}
      <div className="bento-card p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <div className="flex items-center gap-1.5 text-[#DED2F9] font-semibold">
              <Calendar size={14} />
              <span className="font-display tracking-tight">Deadlines Radar</span>
            </div>
            {nextCommitment && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isNextPaid
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : daysUntilDue <= 3 && daysUntilDue >= 0
                  ? 'bg-[#FBC3B8]/20 text-[#FBC3B8] border-[#FBC3B8]/30 font-bold'
                  : 'bg-white/5 text-white/50 border-white/10'
              }`}>
                {isNextPaid ? 'Settled' : daysUntilDue === 0 ? 'Due Today' : daysUntilDue > 0 ? `In ${daysUntilDue} days` : `Due Day ${nextCommitment.dueDay}`}
              </span>
            )}
          </div>

          {nextCommitment ? (
            <div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-[180px]">
                  {nextCommitment.name}
                </span>
                <span className="text-sm font-decimal font-bold text-white">
                  {formatARS(nextCommitment.defaultAmount)}
                </span>
              </div>
              <div className="text-[11px] text-white/40 mt-0.5">
                Target date: Day {nextCommitment.dueDay} of each month
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40 mt-2">All fixed bills settled for this month</div>
          )}
        </div>

        {/* 1-Tap Settle Button */}
        {nextCommitment && (
          <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] text-white/40">Status for {monthlySummary.monthName}:</span>
            <button
              type="button"
              onClick={() => toggleRecurringPaid(nextCommitment.id, selectedMonth)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all active:scale-95 flex items-center gap-1.5 ${
                isNextPaid
                  ? 'bg-[#C4E8D1]/10 text-[#C4E8D1] border-[#C4E8D1]/30 hover:bg-[#C4E8D1]/20'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
            >
              <CheckCircle2 size={12} className={isNextPaid ? 'text-[#C4E8D1]' : 'text-white/30'} />
              <span>{isNextPaid ? 'Paid' : 'Mark as Paid'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
