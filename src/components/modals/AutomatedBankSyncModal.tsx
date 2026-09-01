import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CircleCheck, TriangleAlert, CloudOff, Zap } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Sheet } from '../common/Sheet';
import { PRESS } from '../../lib/motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const relative = (ts: number | null) => {
  if (!ts) return 'never';
  const secs = Math.round((Date.now() - ts) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.round(secs / 60)}m ago`;
  return `${Math.round(secs / 3600)}h ago`;
};

/**
 * Sync panel.
 *
 * The previous version was a prop: a button that ran a `setTimeout`, printed
 * "Synced!" and touched nothing. Meanwhile the app really was polling a Google
 * Apps Script every 15 seconds and replacing the entire ledger with whatever
 * came back -- which is why figures could change on their own with no
 * explanation. This screen now drives that real engine and says plainly what
 * it did and when.
 */
export const AutomatedBankSyncModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    syncStatus, lastSyncedAt, isBackendConfigured, syncNow,
    autoSyncEnabled, toggleAutoSync, bankConnections, simulateInboundBankTransfer,
  } = useFinance();

  const state = !isBackendConfigured ? 'offline' : syncStatus;

  const HEAD = {
    offline: { icon: CloudOff, title: 'Not connected', copy: 'No backend URL is set, so this device is working from its own storage.' },
    idle:    { icon: RefreshCw, title: 'Ready', copy: 'Pull the latest rows from the shared sheet.' },
    syncing: { icon: RefreshCw, title: 'Syncing', copy: 'Fetching the shared ledger.' },
    ok:      { icon: CircleCheck, title: 'Up to date', copy: 'This device matches the shared ledger.' },
    error:   { icon: TriangleAlert, title: "Couldn't reach the sheet", copy: 'Showing the last rows this device saw. Nothing was lost.' },
  }[state];

  const Icon = HEAD.icon;
  const connected = Object.entries(bankConnections).filter(([, c]) => c.connected);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Sync"
      subtitle={`Last pull · ${relative(lastSyncedAt)}`}
      tone={state === 'error' ? 'terracotta' : 'ink'}
      footer={
        <motion.button
          type="button"
          whileTap={PRESS}
          onClick={syncNow}
          disabled={!isBackendConfigured || syncStatus === 'syncing'}
          className="w-full h-14 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-35"
        >
          <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : undefined} />
          {syncStatus === 'syncing' ? 'Pulling…' : 'Pull now'}
        </motion.button>
      }
    >
      <div className="px-4 py-4 flex flex-col gap-4">
        <div className="flex items-start gap-3.5 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] p-4">
          <span
            className={`w-11 h-11 shrink-0 flex items-center justify-center border-2 border-[var(--color-ink)] ${
              state === 'error' ? 'bg-[var(--color-terracotta)] text-white' : 'bg-[var(--color-mustard)] text-[var(--color-ink)]'
            }`}
          >
            <Icon size={20} className={state === 'syncing' ? 'animate-spin' : undefined} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display font-medium text-lg leading-tight">{HEAD.title}</h3>
            <p className="text-[11px] text-[var(--color-ink-2)] leading-relaxed mt-1">{HEAD.copy}</p>
          </div>
        </div>

        {/* Auto-pull. This is the setting that was quietly rewriting the ledger
            every 15 seconds with nowhere to see or stop it. */}
        <label className="flex items-center justify-between gap-4 bg-[var(--color-paper)] p-4 cursor-pointer">
          <span className="min-w-0">
            <span className="font-display font-medium text-base block leading-tight">Auto-pull</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] mt-1 block">
              Refresh every 15 seconds
            </span>
          </span>
          <input
            type="checkbox"
            className="sr-only peer"
            checked={autoSyncEnabled}
            onChange={toggleAutoSync}
          />
          <span
            aria-hidden="true"
            className="shrink-0 w-14 h-8 bg-[var(--color-ink)]/15 peer-checked:bg-[var(--color-ink)] transition-colors relative peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--color-ink)] peer-focus-visible:outline-offset-2"
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-[var(--color-paper-hi)] transition-transform duration-200 ${
                autoSyncEnabled ? 'translate-x-6 bg-[var(--color-mustard)]' : ''
              }`}
            />
          </span>
        </label>

        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] mb-2">
            Accounts
          </h3>
          <ul className="flex flex-col">
            {connected.map(([key, conn], i) => (
              <li
                key={key}
                style={{ '--i': i } as React.CSSProperties}
                className="reveal-item flex items-center justify-between gap-3 py-3 border-b border-[var(--color-ink)]/10"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 bg-[var(--color-mustard-dp)] shrink-0" aria-hidden="true" />
                  <span className="font-display font-medium text-sm truncate">{conn.name}</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] shrink-0">
                  {conn.lastSync} · {conn.count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <motion.button
          type="button"
          whileTap={PRESS}
          onClick={() => simulateInboundBankTransfer('mercadopago')}
          className="h-12 border-2 border-dashed border-[var(--color-ink)]/30 text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-2)] flex items-center justify-center gap-2 hover:bg-[var(--color-ink)]/5 transition-colors"
        >
          <Zap size={13} />
          Simulate an inbound transfer
        </motion.button>
      </div>
    </Sheet>
  );
};
