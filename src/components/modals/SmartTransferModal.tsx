import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseTransferText, ParsedTransferResult } from '../../utils/transferParser';
import { useFinance } from '../../context/FinanceContext';
import { formatARS } from '../../utils/currency';
import {
  Zap,
  X,
  Clipboard,
  Check,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartTransferModal: React.FC<SmartTransferModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addIncome } = useFinance();
  const [inputText, setInputText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedTransferResult | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);

  const sampleTransfers = [
    {
      title: 'Mercado Pago (Gym Monthly Due $45,000)',
      text: 'Recibiste $ 45.000 de Lucas Fernandez en tu cuenta de Mercado Pago. Dinero disponible.',
    },
    {
      title: 'Cuenta DNI (Gym Member Due $45,000)',
      text: 'Transferencia recibida por $ 45.000,00 de Camila Rodriguez. Motivo: VARIOS. Cuenta DNI.',
    },
    {
      title: 'Mercado Pago (Creatine Supplement $29,000)',
      text: 'Transferencia recibida: $ 29.000 de Federico Perez. Pago acreditado en Mercado Pago.',
    },
    {
      title: 'Lemon Cash (Protein Bars $5,200)',
      text: '¡Recibiste $ 5.200 en Lemon Cash de Tomas Diaz! Acreditado al instante.',
    },
  ];

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setInputText(text);
    const result = parseTransferText(text);
    setParsedResult(result);
  };

  const handleApplySample = (text: string) => {
    handleParse(text);
  };

  const handleConfirm = () => {
    if (!parsedResult) return;

    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#155EEF', '#8FB0FA', '#C9A227'],
    });

    if ('vibrate' in navigator) navigator.vibrate(15);
    const today = new Date().toISOString().split('T')[0];

    addIncome({
      amount: parsedResult.amount,
      source: 'force_gym',
      platform: parsedResult.platform,
      forceDetails: {
        type: parsedResult.forceType || 'cuota',
        memberName: parsedResult.memberName || undefined,
        productTag: parsedResult.forceType === 'suplemento' ? 'Creatine Monohydrate' : undefined,
      },
      notes: `Smart Auto-Parsed Transfer (${parsedResult.platform.toUpperCase()})`,
      date: today,
      createdBy: 'mati',
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#0a0d14] border border-white/15 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#155EEF]/20 text-[#8FB0FA] border border-[#155EEF]/30 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white font-display">
                  Smart Bank Transfer Detector
                </h2>
                <p className="text-xs text-white/50">Parses Mercado Pago, Cuenta DNI, Lemon & Galicia</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Paste Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 block">
                  Paste bank transfer notification or SMS:
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      handleParse(text);
                    } catch {
                      // Fallback
                    }
                  }}
                  className="text-[11px] text-[#8FB0FA] font-bold flex items-center gap-1 hover:underline"
                >
                  <Clipboard size={12} />
                  Paste from Clipboard
                </button>
              </div>

              <textarea
                rows={3}
                value={inputText}
                onChange={e => handleParse(e.target.value)}
                placeholder="Example: 'You received $ 45,000 from Lucas Fernandez in your Mercado Pago account...'"
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#155EEF] resize-none"
              />
            </div>

            {/* Quick Test Samples */}
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5 font-display">
                Test with 1-tap live presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sampleTransfers.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSampleIndex(idx);
                      handleApplySample(sample.text);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      sampleIndex === idx && inputText === sample.text
                        ? 'bg-[#155EEF]/20 border-[#155EEF]/50 text-white'
                        : 'bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <p className="font-bold text-[11px] truncate font-display">{sample.title}</p>
                    <span className="text-[9px] text-white/40 line-clamp-1">{sample.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Detection Parser Result Card */}
            {parsedResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-b from-[#155EEF]/20 to-[#07080B] border border-[#155EEF]/40 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-[#8FB0FA]" />
                    <span className="font-black text-white font-display text-sm">
                      Transfer Detected!
                    </span>
                  </div>
                  <span className="text-lg font-black text-[#8FB0FA] font-impact-num">
                    {formatARS(parsedResult.amount)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-black/60 p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 block">Member/Sender</span>
                    <span className="font-bold text-white truncate block">
                      {parsedResult.memberName || 'Identified in app'}
                    </span>
                  </div>

                  <div className="bg-black/60 p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 block">Platform</span>
                    <span className="font-bold text-[#8FB0FA] uppercase">
                      {parsedResult.platform}
                    </span>
                  </div>

                  <div className="bg-black/60 p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 block">Classification</span>
                    <span className="font-bold text-white">
                      {parsedResult.forceType === 'cuota' ? 'Gym Member Due' : 'Supplement'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full py-3 px-4 rounded-xl bg-[#155EEF] hover:bg-[#0F45C9] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#155EEF]/30 active:scale-98 transition-all font-display"
                >
                  <Check size={16} />
                  <span>Log Into Force Gym Income</span>
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
