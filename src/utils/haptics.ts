/**
 * Fire a short haptic tick, if the device offers one.
 *
 * Guarded because `navigator.vibrate` is not a safe no-op: browsers reject it
 * when the page has not yet had a real user gesture, and it throws outright on
 * platforms that expose the method without supporting it. A confirmation buzz
 * is never worth an exception on the path to saving a transaction.
 */
export function tick(ms = 8): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  } catch {
    /* Haptics are decoration; never let them break the interaction. */
  }
}
