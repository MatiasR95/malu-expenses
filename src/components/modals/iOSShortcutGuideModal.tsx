import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Check, Share } from 'lucide-react';

interface IOSShortcutGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSShortcutGuideModal: React.FC<IOSShortcutGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

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
          className="relative w-full max-w-lg bg-[#0a0d14] border border-white/15 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#155EEF]/20 text-[#8FB0FA] border border-[#155EEF]/30 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white font-display">
                  iPhone PWA & iOS Shortcut Setup
                </h2>
                <p className="text-xs text-white/50">Install to Home Screen & Auto-Sync Notifications</p>
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
            {/* Step 1: Install to Home Screen */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#155EEF] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-white text-sm font-display">
                  Install as Native App on iPhone
                </h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                Open Safari on your iPhone, tap the <strong className="text-white">Share button</strong> <Share size={12} className="inline mx-0.5" /> in the bottom bar, and select <strong className="text-white">"Add to Home Screen"</strong>.
              </p>
            </div>

            {/* Step 2: iOS Shortcuts Automation */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-bold text-white text-sm font-display">
                  Automatic Notification Sync
                </h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                In the <strong className="text-white">Shortcuts app</strong>, go to <strong className="text-white">Automation → New Automation</strong>, trigger on bank notifications (Mercado Pago, Cuenta DNI, Galicia), and send the notification text to your personal Webhook URL.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0F45C9] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#155EEF]/30 active:scale-98 transition-all font-display"
            >
              <Check size={16} />
              <span>Got it!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
