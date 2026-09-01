import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion';

type AmountSize = 'hero' | 'lg' | 'md' | 'sm' | 'xs';

interface AmountProps {
  value: number;
  /** Animate from the previous value when it changes. Hero figures only. */
  animate?: boolean;
  /** Render a leading + / - . Off by default: most figures read from context. */
  signed?: boolean;
  /**
   * Show the outlined `.0`. On for hero/lg by default and off below that --
   * in a dense ledger row it costs ~24px of label width per line and turns
   * every title into an ellipsis, which is a bad trade for a flourish.
   */
  decimals?: boolean;
  size?: AmountSize;
  className?: string;
}

/**
 * The app's signature figure.
 *
 * Every amount anywhere renders through here so the whole product reads as one
 * statement: Clash Display integers on tabular figures, a muted currency mark,
 * and the cent decimal knocked out to outline. Tabular is the point -- columns
 * of amounts line up down the page and digits do not reflow while a value
 * animates.
 */
const SIZES: Record<AmountSize, { unit: string; int: string; dec: string; stroke: string }> = {
  hero: { unit: 'text-2xl sm:text-3xl', int: 'text-[2.75rem] leading-none sm:text-6xl', dec: 'text-2xl sm:text-3xl', stroke: '2px' },
  lg:   { unit: 'text-base',            int: 'text-2xl leading-none',                   dec: 'text-base',           stroke: '1.5px' },
  md:   { unit: 'text-sm',              int: 'text-xl leading-none',                    dec: 'text-sm',             stroke: '1.25px' },
  sm:   { unit: 'text-xs',              int: 'text-base leading-none',                  dec: 'text-xs',             stroke: '1px' },
  xs:   { unit: 'text-[10px]',          int: 'text-xs leading-none',                    dec: 'text-[10px]',         stroke: '1px' },
};

export const Amount: React.FC<AmountProps> = ({
  value,
  animate = false,
  signed = false,
  size = 'md',
  decimals,
  className = '',
}) => {
  const showDecimals = decimals ?? (size === 'hero' || size === 'lg');
  const reduce = useReducedMotion();
  const s = SIZES[size];

  const negative = value < 0;
  const abs = Math.abs(value);
  const sign = signed ? (negative ? '-' : '+') : negative ? '-' : '';

  const spring = useSpring(abs, { mass: 0.6, stiffness: 90, damping: 18 });
  const [display, setDisplay] = useState(() => Math.round(abs).toLocaleString('en-US'));
  const mounted = useRef(false);

  useEffect(() => {
    // Do not animate the first paint -- a hero counting up from zero on every
    // cold load is decoration, not information.
    if (!mounted.current || reduce || !animate) {
      mounted.current = true;
      spring.jump(abs);
      setDisplay(Math.round(abs).toLocaleString('en-US'));
      return;
    }
    spring.set(abs);
  }, [abs, animate, reduce, spring]);

  const formatted = useTransform(spring, (v) => Math.round(v).toLocaleString('en-US'));

  useEffect(() => formatted.on('change', setDisplay), [formatted]);

  return (
    <span className={`font-display font-medium tabular inline-flex items-baseline whitespace-nowrap ${className}`}>
      {sign && <span className={`${s.unit} mr-0.5 opacity-70`}>{sign}</span>}
      <span className={`${s.unit} mr-1 opacity-50`}>$</span>
      <motion.span className={s.int}>{display}</motion.span>
      {showDecimals && (
        <span
          className={`${s.dec} ml-1 decimal-outline`}
          style={{ WebkitTextStroke: `${s.stroke} currentColor` }}
          aria-hidden="true"
        >
          .0
        </span>
      )}
    </span>
  );
};
