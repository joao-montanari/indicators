/** Mulberry32 – fast, deterministic 32-bit PRNG */
export function createRng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(seed: number): number {
  return createRng(seed)();
}

export function seededRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

export function seededInt(seed: number, min: number, max: number): number {
  return Math.floor(min + seededRandom(seed) * (max - min + 1));
}

/** Returns a seed that changes every `intervalMs` (default 5 s) */
export function liveSeed(intervalMs = 5000): number {
  return Math.floor(Date.now() / intervalMs);
}
