import React from 'react';

/**
 * Placeholder for a screen whose chunk is still in flight.
 *
 * It mirrors the real shape every screen opens with -- a label, a hero figure,
 * a rule of readings -- so the swap lands without the page resizing under the
 * reader. An empty box would let the nav rail and footer jump, which is a
 * worse artefact than a brief grey.
 */
export const ScreenSkeleton: React.FC = () => (
  <div className="w-full flex flex-col gap-7 pt-1" aria-hidden="true">
    <div className="px-5 flex flex-col gap-3">
      <span className="h-2.5 w-24 bg-[var(--color-ink)]/10" />
      <span className="h-11 w-3/4 bg-[var(--color-ink)]/10" />
      <span className="h-16 w-full bg-[var(--color-ink)]/[0.07] mt-2" />
    </div>
    <span className="h-32 mx-5 bg-[var(--color-ink)]/[0.07]" />
    <span className="h-40 w-full bg-[var(--color-olive-2)]/25" />
    <span className="sr-only" role="status">
      Loading
    </span>
  </div>
);
