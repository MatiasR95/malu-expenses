import React from 'react';
import { Home, Dumbbell, PieChart, Plus, Landmark } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface Props {
  onOpenActionHub: () => void;
  onOpenBankSync: () => void;
}

export const BottomTabBar: React.FC<Props> = ({ onOpenActionHub, onOpenBankSync }) => {
  const { activeTab, setActiveTab } = useFinance();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 pb-6 pt-2 bg-gradient-to-t from-[var(--color-bg-sage)] via-[var(--color-bg-sage)] to-transparent pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        {/* Flat block navigation - 5 balanced columns */}
        <div className="grid grid-cols-5 items-center bg-[var(--color-ink)] px-1 py-1 shadow-2xl relative h-[60px]">
          
          <button 
            onClick={() => setActiveTab('cockpit')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${activeTab === 'cockpit' ? 'text-[var(--color-accent-mustard)]' : 'text-white/40 hover:text-white/70'}`}
          >
            <Home size={20} strokeWidth={activeTab === 'cockpit' ? 2.5 : 1.5} />
            <span className="text-[9px] font-mono uppercase tracking-widest mt-1 opacity-80">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('force_gym')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${activeTab === 'force_gym' ? 'text-[var(--color-accent-terracotta)]' : 'text-white/40 hover:text-white/70'}`}
          >
            <Dumbbell size={20} strokeWidth={activeTab === 'force_gym' ? 2.5 : 1.5} />
            <span className="text-[9px] font-mono uppercase tracking-widest mt-1 opacity-80">Force</span>
          </button>

          {/* Central Power Hub Trigger - Perfectly Centered, Diamond Shape */}
          <div className="flex justify-center items-start h-full relative z-50">
            <button
              onClick={onOpenActionHub}
              className="absolute -top-6 w-14 h-14 bg-[var(--color-accent-mustard)] text-[var(--color-ink)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/20 rounded-none rotate-45 border-2 border-[var(--color-bg-sage)]"
            >
              <Plus size={28} strokeWidth={2.5} className="-rotate-45" />
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${activeTab === 'analytics' ? 'text-[var(--color-accent-mustard)]' : 'text-white/40 hover:text-white/70'}`}
          >
            <PieChart size={20} strokeWidth={activeTab === 'analytics' ? 2.5 : 1.5} />
            <span className="text-[9px] font-mono uppercase tracking-widest mt-1 opacity-80">Data</span>
          </button>

          <button 
            onClick={onOpenBankSync}
            className="flex flex-col items-center justify-center h-full transition-colors text-white/40 hover:text-white/70"
          >
            <Landmark size={20} strokeWidth={1.5} />
            <span className="text-[9px] font-mono uppercase tracking-widest mt-1 opacity-80">Sync</span>
          </button>

        </div>
      </div>
    </div>
  );
};
