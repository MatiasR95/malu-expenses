import React, { Suspense, useEffect, useState } from 'react';

interface Props {
  /** The sheet's own open flag. */
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * Hold a code-split sheet out of the app until it is first opened.
 *
 * Two rules make this work, and both matter:
 *
 * 1. Nothing is rendered before the first open, so React never resolves the
 *    lazy component and its chunk is never fetched. Writing `<QuickAddModal/>`
 *    in the parent's JSX only builds an element descriptor -- the import fires
 *    when React commits it -- so the eight sheets can all sit in App's tree
 *    exactly as before and still cost nothing until used.
 *
 * 2. Once opened, the sheet stays mounted for the rest of the session. Sheets
 *    animate themselves out on `isOpen: false`; unmounting on close would cut
 *    the exit animation and re-fetch the chunk on every subsequent open.
 */
export const DeferredSheet: React.FC<Props> = ({ isOpen, children }) => {
  const [everOpened, setEverOpened] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setEverOpened(true);
  }, [isOpen]);

  if (!everOpened) return null;

  /* `fallback={null}` on purpose: the sheet's own entrance animation is the
     loading affordance. A spinner that appears and vanishes inside one chunk
     fetch is a flash, not feedback. */
  return <Suspense fallback={null}>{children}</Suspense>;
};
