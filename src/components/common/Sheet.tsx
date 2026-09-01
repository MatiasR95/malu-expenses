import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING_SHEET, PRESS_HARD } from '../../lib/motion';

type Tone = 'ink' | 'mustard' | 'terracotta' | 'olive';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Small uppercase line under the title. */
  subtitle?: string;
  /** Colour of the header block. Signals what the sheet does. */
  tone?: Tone;
  /** Pinned to the bottom, always reachable regardless of body scroll. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Sheets that own the full screen opt out of the header block. */
  bare?: boolean;
  maxHeight?: string;
}

const TONES: Record<Tone, string> = {
  ink:        'bg-[var(--color-ink)] text-white',
  mustard:    'bg-[var(--color-mustard)] text-[var(--color-ink)]',
  terracotta: 'bg-[var(--color-terracotta)] text-white',
  olive:      'bg-[var(--color-olive-2)] text-white',
};

/** Belt and braces: if an animation callback is ever dropped, unmount anyway. */
const EXIT_FALLBACK_MS = 700;

/**
 * The single bottom-sheet shell every modal in the app is built on.
 *
 * Each modal used to early-return `null` when closed, which unmounts the tree
 * *above* its own AnimatePresence, so exit animations never ran and sheets
 * vanished on a frame. This shell owns that lifecycle once for all of them,
 * and adds scroll-lock, Escape, focus trap and return, drag-to-dismiss and a
 * pinned footer.
 *
 * The mount is driven by local state rather than AnimatePresence deliberately.
 * Presence tracking through a portal never released these nodes here: the
 * sheet would finish its exit and then stay in the DOM as an invisible
 * full-screen backdrop that swallowed every tap on the app underneath. Holding
 * the mount ourselves and dropping it when the close animation reports done is
 * deterministic, and the timeout above covers a dropped callback.
 */
export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  tone = 'ink',
  footer,
  children,
  bare = false,
  maxHeight = '92vh',
}) => {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), EXIT_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Escape to dismiss.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock the page behind the sheet, and hand focus back where it came from.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocus.current = document.activeElement as HTMLElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button:not([data-sheet-close])'
      );
      (first ?? panelRef.current)?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
      restoreFocus.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  // Keep Tab inside the sheet.
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      /* Once closing, stop intercepting taps straight away -- the app behind
         is usable again and should not have to wait out the animation. */
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <motion.button
        type="button"
        aria-label="Close"
        data-sheet-close
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-ink)]/45 backdrop-blur-[3px] cursor-default"
      />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={reduce ? { opacity: 0 } : { y: '100%' }}
        animate={reduce ? { opacity: isOpen ? 1 : 0 } : { y: isOpen ? 0 : '100%' }}
        transition={SPRING_SHEET}
        onAnimationComplete={() => {
          if (!isOpen) setMounted(false);
        }}
        style={{ maxHeight }}
        className="relative w-full max-w-md mx-auto bg-[var(--color-sage)] text-[var(--color-ink)] flex flex-col shadow-[0_-12px_40px_-12px_rgba(21,22,19,0.5)] outline-none"
      >
        {/* Drag lives on the chrome, not the whole panel: flick the header to
            dismiss, scroll the body to scroll. Keeping the gesture off the
            panel also stops it fighting the open/close transform. */}
        <motion.div
          drag={reduce ? false : 'y'}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 650) onClose();
          }}
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--color-ink)]/25" />
          </div>

          {!bare && (
            <div className={`flex items-center justify-between gap-3 px-5 py-3.5 ${TONES[tone]}`}>
              <div className="min-w-0">
                <h2 className="font-display font-medium text-xl tracking-wide truncate">{title}</h2>
                {subtitle && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] opacity-70 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              <motion.button
                type="button"
                data-sheet-close
                onClick={onClose}
                whileTap={PRESS_HARD}
                aria-label="Close"
                className="shrink-0 w-11 h-11 -mr-2 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
              >
                <X size={22} strokeWidth={2} />
              </motion.button>
            </div>
          )}
        </motion.div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>

        {footer && (
          <div className="shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] bg-[var(--color-sage)] border-t border-[var(--color-ink)]/10">
            {footer}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
};
