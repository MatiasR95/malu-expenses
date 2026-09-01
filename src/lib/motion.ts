import type { Transition } from 'framer-motion';

/**
 * One motion vocabulary for the whole app.
 *
 * The rule here is orchestration over quantity: a screen change, a sheet, a
 * list reveal and a press are the only four things that move. Everything uses
 * the same two curves so the app feels like one object rather than a pile of
 * separately-animated widgets.
 */

/** Decelerating curve for anything entering the screen. */
export const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];
/** Symmetric curve for things that move between two known states. */
export const EASE_IN_OUT: Transition['ease'] = [0.65, 0, 0.35, 1];

/** Sheets and the nav indicator — weighty, no overshoot wobble. */
export const SPRING_SHEET: Transition = { type: 'spring', damping: 32, stiffness: 320, mass: 0.9 };
export const SPRING_SNAP: Transition = { type: 'spring', damping: 30, stiffness: 500, mass: 0.6 };

/* Screen swaps use plain initial/animate/exit objects in App.tsx rather than a
   variants map: variant *labels* propagate from a parent motion component to
   its motion children, and the screens contain sections with their own
   hidden/show variants that would be hijacked by the wrapper's labels. */

/* Entrance reveals -- screens, sections and list staggers -- are CSS
   animations (`.reveal`, `.reveal-item`, `.reveal-wipe` in index.css), not
   variants. Anything that gates whether content is *visible* must not depend
   on an animation frame loop: a stalled loop left whole screens sitting at
   opacity 0. What stays here is the motion that only ever adds to something
   already on screen. */

/** Press feedback. Applied via whileTap on every tappable surface. */
export const PRESS = { scale: 0.975 };
export const PRESS_HARD = { scale: 0.95 };
