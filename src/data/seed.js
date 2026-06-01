// Deterministic seeded RNG so mock numbers stay stable across renders/reloads.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(20260601);

export function rand(min, max) {
  return min + rng() * (max - min);
}
export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
export function pick(arr) {
  return arr[Math.floor(rng() * arr.length)];
}
