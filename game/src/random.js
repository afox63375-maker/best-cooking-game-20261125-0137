// A tiny seeded random source so a ?seed=N run (and every screenshot) plays the same
// orders in the same order. Mulberry32: small, fast, and deterministic across browsers.

/**
 * Builds a generator from a 32-bit seed. Every call to next() returns a float in [0, 1).
 * @param {number} seed any integer; it is folded into 32 bits.
 */
export function createRandom(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** An integer from 0 up to (but not including) max. */
    int(max) {
      return Math.floor(this.next() * max);
    },
    /** One element of an array, picked uniformly. */
    pick(list) {
      return list[this.int(list.length)];
    },
  };
}
