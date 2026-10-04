/**
 * Spring → CSS easing.
 * Simulates a damped spring (same parameters Framer Motion uses) and returns a
 * CSS `linear()` easing + duration, so CSS transitions/WAAPI can reproduce the
 * reference's spring motion exactly. Falls back to a cubic-bezier when
 * `linear()` is not supported.
 *
 * Accepts either physical params  { stiffness, damping, mass }
 * or Framer's duration-based      { duration (s), bounce }
 */
const cache = new Map();
const supportsLinear = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)');

function simulate(k, c, m, maxT = 4) {
  const dt = 1 / 240;
  let x = 0, v = 0, t = 0;
  const pts = [[0, 0]];
  let settledAt = null;
  while (t < maxT) {
    const a = (-k * (x - 1) - c * v) / m;
    v += a * dt;
    x += v * dt;
    t += dt;
    pts.push([t, x]);
    if (Math.abs(x - 1) < 0.0008 && Math.abs(v) < 0.02) {
      if (settledAt === null) settledAt = t;
      if (t - settledAt > 0.02) break;
    } else settledAt = null;
  }
  return { pts, T: settledAt ?? t };
}

function fromDuration(duration, bounce) {
  // Framer: dampingRatio = 1 - bounce; find stiffness so the spring settles in `duration`.
  const zeta = Math.max(0.05, 1 - bounce);
  let lo = 1, hi = 5000, best = 100;
  for (let i = 0; i < 40; i++) {
    const k = (lo + hi) / 2;
    const c = 2 * zeta * Math.sqrt(k);
    const { T } = simulate(k, c, 1, 10);
    if (T > duration) lo = k; else hi = k;
    best = k;
  }
  return { k: best, c: 2 * zeta * Math.sqrt(best), m: 1 };
}

export function spring(opts = {}) {
  const key = JSON.stringify(opts);
  if (cache.has(key)) return cache.get(key);
  let k, c, m;
  if (opts.duration != null) ({ k, c, m } = fromDuration(opts.duration, opts.bounce ?? 0));
  else { k = opts.stiffness ?? 100; c = opts.damping ?? 10; m = opts.mass ?? 1; }
  const { pts, T } = simulate(k, c, m);
  const steps = 48;
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = (T * i) / steps;
    let j = Math.min(pts.length - 1, Math.round(t * 240));
    out.push(pts[j][1].toFixed(4));
  }
  out[out.length - 1] = '1';
  const res = {
    duration: Math.round(T * 1000),
    easing: supportsLinear ? `linear(${out.join(', ')})` : 'cubic-bezier(.2, .9, .3, 1)',
  };
  cache.set(key, res);
  return res;
}

/** Convenience: `transform 800ms linear(...)` */
export function springTransition(props, opts, delay = 0) {
  const s = spring(opts);
  return props.map((p) => `${p} ${s.duration}ms ${s.easing} ${delay}s`).join(', ');
}

export const EASE_FRAMER = 'cubic-bezier(.44, 0, .56, 1)';
