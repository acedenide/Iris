import { useEffect, useState } from 'react';
import { TYPES as T } from './data.js';

const rnd = Math.random;
const ip = () =>
  [45, 103, 185, 192, 172][(rnd() * 5) | 0] + '.' + ((rnd() * 250) | 0) + '.' + ((rnd() * 250) | 0) + '.' + (1 + ((rnd() * 250) | 0));
const now = () => new Date().toLocaleTimeString([], { hour12: false });

const init = () => ({
  S: { f: 0, t: 0, s: 0, dt: 0 },
  cnt: T.map(() => 0),
  bins: Array(30).fill(0),
  alerts: [],
  src: {},
  models: { mp: 0, np: 0, risk: 0 },
  sel: null,
  pulse: 0,
  fps: 0,
  id: 0,
  pool: Array.from({ length: 6 }, ip)
});

const snap = (d) => ({
  fps: d.fps,
  S: { ...d.S },
  cnt: [...d.cnt],
  bins: [...d.bins],
  alerts: [...d.alerts],
  src: { ...d.src },
  models: { ...d.models },
  sel: d.sel,
  pulse: d.pulse
});

/* Simulated live traffic feed. Replace tick() with a real API / WebSocket later. */
export function useSim() {
  const [d] = useState(init);
  const [view, setView] = useState(() => snap(d));
  const [hot, setHot] = useState({});

  useEffect(() => {
    const timers = new Set();
    function tick() {
      const n = 40 + ((rnd() * 60) | 0);
      d.S.f += n;
      d.fps = n * 3;
      const ti = (rnd() * T.length) | 0;
      const ty = T[ti];
      const hit = rnd() < 0.45;
      let mp = rnd() * 0.35;
      let np = rnd() * 0.35;
      if (hit) {
        if (ty.w === 'm') { mp = 0.75 + rnd() * 0.24; np = rnd() * 0.5; }
        else { np = 0.75 + rnd() * 0.24; mp = rnd() * 0.5; }
      }
      const risk = Math.round(100 * (0.65 * Math.max(mp, np) + 0.35 * Math.min(mp, np)));
      d.bins.push(hit ? 1 : 0);
      d.bins.shift();
      if (hit) {
        d.S.t++;
        d.cnt[ti]++;
        const sip = rnd() < 0.6 ? d.pool[(rnd() * d.pool.length) | 0] : ip();
        d.src[sip] = (d.src[sip] || 0) + 1;
        const sec = 5 + ((rnd() * 10) | 0);
        d.S.dt += sec;
        const a = {
          id: ++d.id, ty, src: sip,
          dst: '10.0.' + ((rnd() * 20) | 0) + '.' + (1 + ((rnd() * 250) | 0)),
          mp, np, risk, sec, time: now()
        };
        d.alerts = [a, ...d.alerts].slice(0, 7);
        d.sel = a;
        d.models = { mp, np, risk };
        d.pulse++;
        setHot((h) => ({ ...h, [ty.m]: true }));
        const t = setTimeout(() => {
          timers.delete(t);
          setHot((h) => ({ ...h, [ty.m]: false }));
        }, 1500);
        timers.add(t);
      } else {
        if (rnd() < 0.3) d.S.s++;
        if (!d.sel || rnd() < 0.5) d.models = { mp, np, risk };
      }
      setView(snap(d));
    }
    tick();
    const iv = setInterval(tick, 1800);
    return () => {
      clearInterval(iv);
      timers.forEach(clearTimeout);
    };
  }, [d]);

  const select = (a) => {
    d.sel = a;
    d.models = { mp: a.mp, np: a.np, risk: a.risk };
    setView(snap(d));
  };

  return { view, hot, select };
}
