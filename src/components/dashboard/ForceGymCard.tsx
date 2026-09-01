import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { RollingNumber } from '../common/RollingNumber';
import { formatARS } from '../../utils/currency';
import { Dumbbell, Users, Zap, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ForceGymCardProps {
  onOpenTransferModal: () => void;
}

export const ForceGymCard: React.FC<ForceGymCardProps> = ({ onOpenTransferModal }) => {
  const { monthlySummary, incomes } = useFinance();
  const [activeTab, setActiveTab] = useState<'cuotas' | 'suplementos'>('cuotas');

  // Filter gym incomes for the selected month
  const gymIncomes = incomes.filter(
    i => i.source === 'force_gym' && i.date.startsWith(monthlySummary.monthKey)
  );

  const cuotaIncomes = gymIncomes.filter(i => i.forceDetails?.type === 'cuota');
  const suplementoIncomes = gymIncomes.filter(i => i.forceDetails?.type === 'suplemento');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-b from-[#13171f] via-[#0d1015] to-[#08090d] border border-emerald-500/20 shadow-xl"
    >
      {/* Ambient Gym Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Dumbbell size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Force Gym
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                En vivo
              </span>
            </h3>
            <p className="text-[11px] text-white/50">Cuotas y suplementación</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-bold text-emerald-400">
            <RollingNumber value={monthlySummary.forceGymTotal} />
          </div>
          <span className="text-[10px] text-white/40">Total mes</span>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 mb-3.5">
        <button
          onClick={() => setActiveTab('cuotas')}
          className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'cuotas'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Users size={13} />
          <span>Cuotas ({monthlySummary.forceCuotasCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('suplementos')}
          className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'suplementos'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Zap size={13} />
          <span>Suplementos</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[120px]">
        <AnimatePresence mode="wait">
          {activeTab === 'cuotas' ? (
            <motion.div
              key="cuotas-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              {cuotaIncomes.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/40">
                  No hay cuotas registradas en este mes
                </div>
              ) : (
                cuotaIncomes.slice(0, 4).map(inc => (
                  <div
                    key={inc.id}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 text-xs hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        {inc.forceDetails?.memberName ? inc.forceDetails.memberName.charAt(0) : 'S'}
                      </div>
                      <div>
                        <p className="font-semibold text-white/90">
                          {inc.forceDetails?.memberName || 'Socio'}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {inc.platform.toUpperCase()} · {inc.date.split('-')[2]}/{inc.date.split('-')[1]}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white font-mono-num">
                      {formatARS(inc.amount)}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="suplementos-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: -10 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              {suplementoIncomes.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/40">
                  No hay ventas de suplementos registradas este mes
                </div>
              ) : (
                suplementoIncomes.slice(0, 4).map(inc => (
                  <div
                    key={inc.id}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 text-xs hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                        ⚡
                      </div>
                      <div>
                        <p className="font-semibold text-white/90">
                          {inc.forceDetails?.productTag || 'Suplemento'}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {inc.forceDetails?.memberName ? `${inc.forceDetails.memberName} · ` : ''}
                          {inc.platform.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-300 font-mono-num">
                      {formatARS(inc.amount)}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={onOpenTransferModal}
        className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
      >
        <Plus size={14} />
        <span>Ingresar Transferencia Gym</span>
      </button>
    </motion.div>
  );
};
