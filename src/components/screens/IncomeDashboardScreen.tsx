import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Check, ShoppingBag, Building2, ArrowDownLeft, Pencil } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FORCE_REGULAR_MEMBERS } from '../../data/initialData';
import { StepLineChart } from '../dashboard/StepLineChart';
import { Amount } from '../common/Amount';
import { parseLocalDate } from '../../utils/currency';
import { Income } from '../../types/finance';
import { PRESS, PRESS_HARD } from '../../lib/motion';
import { tick } from '../../utils/haptics';

interface Props {
  onOpenQuickAdd: (mode: 'expense' | 'income') => void;
  onEditIncome: (income: Income) => void;
}

const FORCE_TARGET = 1_500_000;
/** Tiles shown in the check-in grid. A gym with years of history has hundreds
    of past members; the ones worth a thumb are the recent, still-unpaid few. */
const ROSTER_LIMIT = 24;

const SUPPLEMENTS = [
  { id: 's1', name: 'Creatine Monohydrate', defaultPrice: 28000 },
  { id: 's2', name: 'Whey Protein', defaultPrice: 35000 },
  { id: 's3', name: 'Pre-Workout', defaultPrice: 22000 },
];

/** Section heading used down the whole screen. */
const Rule: React.FC<{ title: string; right?: React.ReactNode; dark?: boolean }> = ({
  title,
  right,
  dark = true,
}) => (
  <div
    className={`flex items-center justify-between gap-3 pb-2.5 mb-4 border-b ${
      dark ? 'border-white/12' : 'border-[var(--color-ink)]/12'
    }`}
  >
    <h2
      className={`text-[10px] font-mono uppercase tracking-[0.24em] ${
        dark ? 'text-white/65' : 'text-[var(--color-ink-3)]'
      }`}
    >
      {title}
    </h2>
    {right}
  </div>
);

export const IncomeDashboardScreen: React.FC<Props> = ({ onOpenQuickAdd, onEditIncome }) => {
  const { monthlySummary, addIncome, incomes, selectedMonth } = useFinance();

  const today = new Date();
  const progress = Math.min(100, Math.round((monthlySummary.forceGymTotal / FORCE_TARGET) * 100));

  const monthIncomes = useMemo(
    () =>
      incomes
        .filter((i) => i.date.startsWith(selectedMonth))
        .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()),
    [incomes, selectedMonth]
  );

  const gymIncomes = monthIncomes.filter((i) => i.source === 'force_gym');
  const hasSalary = monthIncomes.some((i) => i.source === 'assurant');

  /** Members already checked in this month — drives the paid state below. */
  const paidMembers = useMemo(
    () =>
      new Set(
        gymIncomes
          .filter((i) => i.forceDetails?.type === 'cuota' && i.forceDetails.memberName)
          .map((i) => i.forceDetails!.memberName!.toLowerCase())
      ),
    [gymIncomes]
  );

  /**
   * The roster comes from who has actually paid, newest first.
   *
   * A fixed list of eight sample names is no use against a real ledger -- none
   * of them match the people in it, so every tile reads unpaid and tapping one
   * files dues under a member who does not exist. Anyone with a membership
   * payment on record belongs here; the sample roster only fills in for a gym
   * with no history yet.
   */
  const roster = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; plan: string; defaultAmount: number }>();

    [...incomes]
      .filter((i) => i.source === 'force_gym' && i.forceDetails?.type === 'cuota')
      .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
      .forEach((i) => {
        const name = i.forceDetails?.memberName?.trim();
        if (!name) return;
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.set(key, { id: key, name, plan: 'Member', defaultAmount: i.amount });
      });

    if (seen.size === 0) return { members: FORCE_REGULAR_MEMBERS, total: FORCE_REGULAR_MEMBERS.length };

    const all = [...seen.values()];
    const paid = all.filter((m) => paidMembers.has(m.id));
    const unpaid = all.filter((m) => !paidMembers.has(m.id));

    /* Outstanding members lead -- those are the tiles you came here to tap --
       but everyone already checked in this month is reserved a slot before the
       list is trimmed. Sorting paid to the end and then slicing dropped them
       off the bottom entirely, so a month with check-ins still read 0 paid. */
    const members = [...unpaid.slice(0, Math.max(0, ROSTER_LIMIT - paid.length)), ...paid];
    return { members, total: all.length };
  }, [incomes, paidMembers]);

  const paidCount = roster.members.filter((m) => paidMembers.has(m.name.toLowerCase())).length;

  const chartData = useMemo(() => {
    const byDay = new Map<number, number>();
    let cumulative = 0;
    [...gymIncomes]
      .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
      .forEach((inc) => {
        cumulative += inc.amount;
        byDay.set(parseLocalDate(inc.date).getDate(), cumulative);
      });
    return Array.from(byDay.entries())
      .map(([date, cumulativeAmount]) => ({ date, cumulativeAmount }))
      .sort((a, b) => a.date - b.date);
  }, [gymIncomes]);

  const logIncome = (
    amount: number,
    details: { type: 'cuota' | 'suplemento'; memberName?: string; productTag?: string },
    notes: string
  ) => {
    addIncome({
      amount,
      source: 'force_gym',
      platform: 'mercadopago',
      forceDetails: details,
      notes,
      date: today.toISOString().split('T')[0],
      createdBy: 'mati',
    });
    tick(15);
  };

  return (
    <div className="w-full flex flex-col bg-[var(--color-olive-1)]">
      {/* Revenue head */}
      <section className="reveal w-full px-5 pt-5 pb-6 bg-[var(--color-mustard)] text-[var(--color-ink)] relative z-10">
        <Rule title="Force Gym HQ" dark={false} right={
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink)]/55">
            {monthlySummary.monthName}
          </span>
        } />

        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--color-ink)]/55 mb-2">
          Revenue
        </p>
        <Amount value={monthlySummary.forceGymTotal} size="hero" animate />

        <div className="mt-6">
          <StepLineChart data={chartData} targetAmount={FORCE_TARGET} />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink)]/65 mb-1.5">
            <span>Target ${FORCE_TARGET.toLocaleString('en-US')}</span>
            <span className="font-bold tabular">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-ink)]/12 overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-[var(--color-ink)] transition-[width] duration-700 ease-out"
            />
          </div>
        </div>
      </section>

      {/* One-tap member check-in.
          The handler for this existed in the old build but nothing rendered
          it, so the headline feature of this screen -- log a member's dues in
          a single tap -- was unreachable. */}
      <section className="reveal w-full px-5 py-6 bg-[var(--color-olive-2)] text-white" style={{ animationDelay: '70ms' }}>
        <Rule
          title="Member check-in"
          right={
            <span className="text-[10px] font-mono tabular text-white/45">
              {paidCount}/{roster.members.length} paid
            </span>
          }
        />

        <div className="grid grid-cols-2 gap-1.5">
          {roster.members.map((member, i) => {
            const paid = paidMembers.has(member.name.toLowerCase());
            const [first, ...rest] = member.name.split(' ');
            return (
              <motion.button
                key={member.id}
                type="button"
                style={{ '--i': Math.min(i, 10) } as React.CSSProperties}
                whileTap={paid ? undefined : PRESS_HARD}
                disabled={paid}
                onClick={() =>
                  logIncome(
                    member.defaultAmount,
                    { type: 'cuota', memberName: member.name },
                    `Cuota Mensual - ${member.name}`
                  )
                }
                aria-label={paid ? `${member.name} already paid` : `Log dues for ${member.name}`}
                className={`reveal-item min-h-[3.75rem] px-3 py-2.5 flex items-center justify-between gap-2 text-left transition-colors duration-150 ${
                  paid
                    ? 'bg-[var(--color-olive-1)] text-white/40'
                    : 'bg-[var(--color-olive-3)] text-white hover:bg-[var(--color-olive-4)]'
                }`}
              >
                <span className="min-w-0 flex flex-col">
                  <span className="font-display font-medium text-sm leading-tight truncate">
                    {first}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-[0.12em] opacity-55 truncate">
                    {rest.join(' ') || member.plan}
                  </span>
                </span>
                <span
                  className={`w-7 h-7 shrink-0 flex items-center justify-center ${
                    paid ? 'text-[var(--color-mustard)]' : 'border border-white/25'
                  }`}
                >
                  {paid ? <Check size={15} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
                </span>
              </motion.button>
            );
          })}
        </div>

        {roster.total > roster.members.length && (
          <p className="mt-3 text-[9px] font-mono uppercase tracking-[0.16em] text-white/40">
            Showing the {roster.members.length} most recent of {roster.total} members ·
            use Log for anyone else
          </p>
        )}
      </section>

      {/* Salary */}
      <section className="reveal w-full bg-[var(--color-paper-hi)] text-[var(--color-ink)] px-5 py-5 flex items-center justify-between gap-3" style={{ animationDelay: '110ms' }}>
        <span className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 shrink-0 bg-[var(--color-ink)]/8 flex items-center justify-center">
            <Building2 size={19} strokeWidth={1.6} />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="font-display font-medium text-lg tracking-wide leading-tight">Assurant</span>
            <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)] mt-0.5">
              Corporate salary
            </span>
          </span>
        </span>

        {hasSalary ? (
          <span className="flex flex-col items-end shrink-0">
            <Amount value={monthlySummary.assurantTotal} size="lg" />
            <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)] mt-1 flex items-center gap-1">
              <Check size={10} strokeWidth={3} /> Logged
            </span>
          </span>
        ) : (
          <motion.button
            type="button"
            whileTap={PRESS}
            onClick={() => onOpenQuickAdd('income')}
            className="shrink-0 h-11 px-4 bg-[var(--color-ink)] text-[var(--color-mustard)] text-[10px] font-mono uppercase tracking-[0.16em] font-bold flex items-center gap-1.5"
          >
            <Plus size={13} strokeWidth={3} /> Log
          </motion.button>
        )}
      </section>

      {/* Gym ledger */}
      <section className="w-full bg-[var(--color-olive-2)] text-white px-5 py-6">
        <Rule
          title="Gym inflows"
          right={
            <motion.button
              type="button"
              whileTap={PRESS}
              onClick={() => onOpenQuickAdd('income')}
              className="h-9 px-2 -mr-2 text-[var(--color-mustard)] text-[10px] font-mono uppercase tracking-[0.16em] font-bold flex items-center gap-1.5"
            >
              <Plus size={12} strokeWidth={3} /> Add
            </motion.button>
          }
        />

        {gymIncomes.length === 0 ? (
          <p className="text-center py-8 text-white/40 text-[11px] font-mono uppercase tracking-[0.16em]">
            No inflows logged this month
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {gymIncomes.map((income, i) => (
              <li
                key={income.id}
                className="reveal-item"
                style={{ '--i': Math.min(i, 10) } as React.CSSProperties}
              >
                  <motion.button
                    type="button"
                    whileTap={PRESS}
                    onClick={() => onEditIncome(income)}
                    className="group w-full p-3.5 flex items-center justify-between gap-3 text-left bg-[var(--color-olive-3)] hover:bg-[var(--color-olive-4)] transition-colors"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 shrink-0 border border-white/20 flex items-center justify-center">
                        <ArrowDownLeft size={14} className="text-[var(--color-mustard)]" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex flex-col">
                        <span className="font-display font-medium text-sm tracking-wide truncate">
                          {income.forceDetails?.memberName || income.notes || 'Income'}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-[0.14em] opacity-55 mt-0.5 truncate">
                          {income.forceDetails?.type === 'cuota' ? 'Membership' : 'Store'} ·{' '}
                          {income.platform} · {format(parseLocalDate(income.date), 'dd MMM')}
                        </span>
                      </span>
                    </span>

                    <span className="shrink-0 flex items-center gap-2">
                      <Amount value={income.amount} size="md" />
                      <Pencil size={12} className="text-white/25 group-hover:text-white/60 transition-colors" />
                    </span>
                </motion.button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Store */}
      <section className="w-full bg-[var(--color-olive-1)] text-white px-5 py-6 pb-10">
        <Rule
          title="Supplement store"
          right={
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-terracotta)]">
              <ShoppingBag size={12} /> POS
            </span>
          }
        />

        <div className="flex flex-col gap-1.5">
          {SUPPLEMENTS.map((product, i) => (
            <motion.button
              key={product.id}
              type="button"
              style={{ '--i': i } as React.CSSProperties}
              whileTap={PRESS}
              onClick={() =>
                logIncome(
                  product.defaultPrice,
                  { type: 'suplemento', productTag: product.name },
                  `Store Sale - ${product.name}`
                )
              }
              aria-label={`Log a sale of ${product.name}`}
              className="reveal-item w-full px-4 py-3.5 bg-[var(--color-olive-2)] hover:bg-[var(--color-olive-3)] transition-colors flex items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0 flex flex-col">
                <span className="font-display font-medium text-sm tracking-wide truncate">
                  {product.name}
                </span>
                <span className="text-[10px] font-mono tabular text-[var(--color-mustard)] mt-0.5">
                  ${product.defaultPrice.toLocaleString('en-US')}
                </span>
              </span>
              <span className="shrink-0 h-9 px-3 bg-[var(--color-olive-4)] flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] font-bold">
                <Plus size={12} strokeWidth={3} /> Sell
              </span>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};
