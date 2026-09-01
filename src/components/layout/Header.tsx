import React from 'react';
import { Grip, User } from 'lucide-react';

interface HeaderProps {
  onOpenCreditCardSplitter: () => void;
  onOpenBankSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreditCardSplitter, onOpenBankSync }) => {
  return (
    <header className="px-5 pt-12 pb-4 flex items-center justify-between z-40 bg-[var(--color-bg-sage)]">
      {/* Profile Avatar (Top Left) */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--color-block-2)] flex items-center justify-center border border-[var(--color-ink)]/10 shadow-sm relative group cursor-pointer" onClick={onOpenBankSync}>
        <User size={18} className="text-[#c1c4b1]" />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Grid Menu Icon (Top Right) */}
      <button 
        onClick={onOpenCreditCardSplitter}
        className="w-10 h-10 flex items-center justify-center text-[var(--color-ink)] opacity-70 hover:opacity-100 transition-opacity"
      >
        <Grip size={22} strokeWidth={2.5} />
      </button>
    </header>
  );
};
