/**
 * BouquetArt.jsx
 *
 * Ilustrasi buket statis untuk hiasan halaman buku. Komposisinya sengaja dibuat
 * berbeda dari buket di ReasonScene (susunan bunga, palet, dan pembungkus).
 * Tiap buket dirender SATU KALI jadi gambar SVG (data URI) supaya ringan saat
 * halaman diputar 3D.
 *
 * Pemakaian:  import { getBouquetUrl } from './BouquetArt';
 *             <img src={getBouquetUrl(0)} />   // 0, 1, 2, 3, ... (variasi terus bertambah)
 */
import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const PIVOT = { x: 200, y: 418 };

const mulberry = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f2 = (n) => Math.round(n * 10) / 10;
const quad = (p0, c, p1, t) => ({
  x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x,
  y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y,
});

/* ------------------------------------------------------------------ */
/* Gradient                                                            */
/* ------------------------------------------------------------------ */
const GRADS = [
  ['g-rose-a', 'up', [[0, '#3d040d'], [0.35, '#7d0c1b'], [0.8, '#b81f33'], [1, '#d4404f']]],
  ['g-rose-b', 'up', [[0, '#2c0309'], [0.5, '#5f0915'], [1, '#9a1426']]],
  ['g-twhite-front', 'up', [[0, '#d3dbc2'], [0.3, '#f1ede5'], [1, '#ffffff']]],
  ['g-twhite-side', 'up', [[0, '#bfc4b0'], [0.4, '#e0dbd0'], [1, '#f3efe8']]],
  ['g-tpink-front', 'up', [[0, '#d9728f'], [0.4, '#f2a8bb'], [1, '#fde0e8']]],
  ['g-tpink-side', 'up', [[0, '#c0566f'], [0.5, '#e48ca3'], [1, '#f6c4d0']]],
  ['g-peony-a', 'up', [[0, '#d2607e'], [0.5, '#f0a1b5'], [1, '#fde6ec']]],
  ['g-peony-b', 'up', [[0, '#b83e63'], [1, '#ee94ac']]],
  ['g-bud', 'up', [[0, '#5c0b22'], [0.55, '#a81d3d'], [1, '#dd5870']]],
  ['g-bud-b', 'up', [[0, '#7a1230'], [1, '#e8788b']]],
  ['g-br-pink', 'up', [[0, '#c94a72'], [0.6, '#ef93ae'], [1, '#fcd0dc']]],
  ['g-br-peach', 'up', [[0, '#d97c63'], [0.6, '#f5b49a'], [1, '#fde0d0']]],
  ['g-daisy', 'up', [[0, '#d8cfc2'], [0.4, '#f6f2ec'], [1, '#ffffff']]],
  ['g-lily-a', 'up', [[0, '#d6e2bd'], [0.28, '#fbf9f2'], [1, '#ffffff']]],
  ['g-lily-b', 'up', [[0, '#c3d1a8'], [0.3, '#ece6da'], [1, '#f7f2ea']]],
  ['g-lily-pink-a', 'up', [[0, '#cbdcb5'], [0.25, '#f5c6d3'], [0.75, '#fce4ec'], [1, '#fff5f8']]],
  ['g-lily-pink-b', 'up', [[0, '#b8cf9d'], [0.3, '#ea9db3'], [0.8, '#f7ccd7'], [1, '#fdebf1']]],
  ['g-leaf', 'up', [[0, '#173d2c'], [0.5, '#2f6a4a'], [1, '#68a883']]],
  ['g-euc', 'up', [[0, '#587a6c'], [1, '#a3c2b5']]],
  // kertas pembungkus kerucut & pita satin pink
  ['g-wrap-back-2', 'diag', [[0, '#a8677a'], [1, '#cb96a4']]],
  ['g-wrap-front-2', 'diag', [[0, '#f5d3d8'], [1, '#cb97a3']]],
  ['g-wrap-back-3', 'diag', [[0, '#6f866c'], [1, '#9bb097']]],
  ['g-wrap-front-3', 'diag', [[0, '#dfe8d6'], [1, '#a2b79d']]],
  ['g-wrap-back-4', 'diag', [[0, '#9a6a3e'], [1, '#cdbb92']]],
  ['g-wrap-front-4', 'diag', [[0, '#faf6ee'], [1, '#ebe3d5']]],
  ['g-rib-2', 'diag', [[0, '#e79db0'], [0.5, '#f6c3cf'], [1, '#c9708a']]],
  ['g-rib-3', 'diag', [[0, '#e79db0'], [0.5, '#f6c3cf'], [1, '#c9708a']]],
  ['g-rib-4', 'diag', [[0, '#e79db0'], [0.5, '#f6c3cf'], [1, '#c9708a']]],
];
const DIRS = {
  up: { x1: 0, y1: 1, x2: 0, y2: 0 },
  down: { x1: 0, y1: 0, x2: 0, y2: 1 },
  diag: { x1: 0, y1: 0, x2: 1, y2: 1 },
};

function Defs() {
  return (
    <defs>
      {GRADS.map(([id, dir, stops]) => (
        <linearGradient key={id} id={id} {...DIRS[dir]}>
          {stops.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      ))}
      <radialGradient id="g-dcenter" cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#fde68a" />
        <stop offset="0.6" stopColor="#f2b032" />
        <stop offset="1" stopColor="#b8730f" />
      </radialGradient>
      <radialGradient id="g-shadow">
        <stop offset="0" stopColor="#7a4a52" stopOpacity="0.26" />
        <stop offset="1" stopColor="#7a4a52" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* ------------------------------------------------------------------ */
/* Kepala bunga                                                        */
/* ------------------------------------------------------------------ */
const cupPath = (len, w) =>
  `M0,0 C${f2(-w * 0.5)},${f2(-len * 0.18)} ${f2(-w * 1.25)},${f2(-len * 0.55)} ${f2(-w * 0.8)},${f2(-len * 0.92)} Q0,${f2(-len * 1.12)} ${f2(w * 0.8)},${f2(-len * 0.92)} C${f2(w * 1.25)},${f2(-len * 0.55)} ${f2(w * 0.5)},${f2(-len * 0.18)} 0,0Z`;
const lipPath = (len, w) =>
  `M${f2(-w * 0.8)},${f2(-len * 0.92)} Q0,${f2(-len * 1.12)} ${f2(w * 0.8)},${f2(-len * 0.92)}`;

const ROSE_RINGS = [
  { n: 5, len: 33, w: 17, fill: 'url(#g-rose-a)' },
  { n: 5, len: 27, w: 15, fill: 'url(#g-rose-a)' },
  { n: 4, len: 21, w: 12.5, fill: 'url(#g-rose-b)' },
  { n: 3, len: 14, w: 9.5, fill: 'url(#g-rose-b)' },
];
const BABY_PINK = [
  { n: 5, len: 15, w: 8.5, fill: 'url(#g-br-pink)' },
  { n: 4, len: 11, w: 7, fill: 'url(#g-br-pink)' },
  { n: 3, len: 7.5, w: 5, fill: 'url(#g-br-pink)' },
];
const BABY_PEACH = BABY_PINK.map((r) => ({ ...r, fill: 'url(#g-br-peach)' }));

function RoseLike({ seed, rings, lip, edge, core }) {
  const petals = useMemo(() => {
    const r = mulberry(seed);
    let off = r() * 72;
    const out = [];
    rings.forEach((ring, ri) => {
      off += 22 + r() * 22;
      for (let k = 0; k < ring.n; k++) {
        out.push({
          key: `${ri}-${k}`,
          ang: off + (360 / ring.n) * k + (r() - 0.5) * 14,
          len: ring.len * (0.92 + r() * 0.16),
          w: ring.w * (0.92 + r() * 0.16),
          fill: ring.fill,
        });
      }
    });
    return out;
  }, [seed, rings]);
  const big = rings[0].len;
  return (
    <g>
      <circle r={big * 1.25} cy={big * 0.1} fill="url(#g-shadow)" />
      {petals.map((p) => (
        <g key={p.key} transform={`rotate(${f2(p.ang)})`}>
          <path d={cupPath(p.len, p.w)} fill={p.fill} stroke={edge} strokeWidth="0.6" />
          <path d={lipPath(p.len, p.w)} fill="none" stroke={lip} strokeWidth="1.1" strokeLinecap="round" />
        </g>
      ))}
      {core}
    </g>
  );
}

const roseCore = (
  <g>
    <circle r="3.4" fill="#3a040c" />
    <path
      d="M0,-1 C3,-5 7,-1 4,4 C1,8 -6,5 -4,-1 C-3,-4 1,-5 2,-3"
      fill="none"
      stroke="rgba(20,0,5,.55)"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </g>
);
const Rose = ({ seed }) => (
  <RoseLike seed={seed} rings={ROSE_RINGS} lip="rgba(255,170,175,.5)" edge="rgba(40,0,8,.35)" core={roseCore} />
);
const BabyRose = ({ seed, c }) => (
  <RoseLike
    seed={seed}
    rings={c === 'peach' ? BABY_PEACH : BABY_PINK}
    lip="rgba(255,240,240,.65)"
    edge="rgba(110,30,50,.28)"
    core={<circle r="1.8" fill={c === 'peach' ? '#b4543c' : '#9c2f55'} />}
  />
);

function Tulip({ pal }) {
  const front = `url(#g-t${pal}-front)`;
  const side = `url(#g-t${pal}-side)`;
  const edge = pal === 'white' ? 'rgba(90,75,65,.22)' : 'rgba(110,30,55,.28)';
  return (
    <g>
      <ellipse cy="4" rx="26" ry="34" fill="url(#g-shadow)" />
      <path d="M-6,-32 C-21,-24 -23,6 -12,23 C-7,29 7,29 12,23 C23,6 21,-24 6,-32 Z" fill={side} stroke={edge} strokeWidth="0.6" />
      <path d="M-3,-36 C-19,-27 -26,2 -16,21 C-11,28 -3,29 1,26 C-5,8 -7,-17 -3,-36Z" fill={side} stroke={edge} strokeWidth="0.6" />
      <path d="M3,-36 C19,-27 26,2 16,21 C11,28 3,29 -1,26 C5,8 7,-17 3,-36Z" fill={side} stroke={edge} strokeWidth="0.6" />
      <path d="M0,-38 C-12,-27 -17,-2 -11,18 C-7,27 7,27 11,18 C17,-2 12,-27 0,-38Z" fill={front} stroke={edge} strokeWidth="0.7" />
      <path d="M-5,-24 C-9,-12 -9,0 -6,10" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M0,-34 C2,-14 2,6 0,24" fill="none" stroke={edge} strokeWidth="0.8" />
    </g>
  );
}

function Daisy({ seed }) {
  const { back, front, dots } = useMemo(() => {
    const r = mulberry(seed);
    const n = 17;
    const mk = (offset, len0, w0) =>
      Array.from({ length: n }, (_, k) => {
        const len = len0 * (0.88 + r() * 0.22);
        const w = w0 * (0.9 + r() * 0.2);
        const tx = (r() - 0.5) * 3;
        return {
          ang: offset + (360 / n) * k + (r() - 0.5) * 8,
          d: `M0,0 C${f2(-w)},${f2(-len * 0.3)} ${f2(-w * 1.05)},${f2(-len * 0.85)} ${f2(tx)},${f2(-len)} C${f2(w * 1.05)},${f2(-len * 0.85)} ${f2(w)},${f2(-len * 0.3)} 0,0Z`,
        };
      });
    const dts = Array.from({ length: 24 }, (_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const rad = Math.sqrt(i + 1) * 1.25;
      return [f2(Math.cos(a) * rad), f2(Math.sin(a) * rad)];
    });
    return { back: mk(0, 26, 3.7), front: mk(360 / n / 2, 24, 3.5), dots: dts };
  }, [seed]);
  return (
    <g>
      <circle r="32" fill="url(#g-shadow)" />
      {back.map((p, i) => (
        <path key={`b${i}`} transform={`rotate(${f2(p.ang)})`} d={p.d} fill="#e2d9cc" stroke="rgba(120,100,90,.25)" strokeWidth="0.5" />
      ))}
      {front.map((p, i) => (
        <path key={`f${i}`} transform={`rotate(${f2(p.ang)})`} d={p.d} fill="url(#g-daisy)" stroke="rgba(120,100,90,.22)" strokeWidth="0.5" />
      ))}
      <circle r="8" fill="#a9640a" opacity="0.5" />
      <circle r="6.6" fill="url(#g-dcenter)" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.75" fill="rgba(110,60,5,.55)" />
      ))}
    </g>
  );
}

const PEONY_RINGS = [
  { n: 8, len: 36, w: 18, fill: 'url(#g-peony-a)' },
  { n: 7, len: 30, w: 16, fill: 'url(#g-peony-a)' },
  { n: 6, len: 24, w: 14, fill: 'url(#g-peony-a)' },
  { n: 5, len: 17, w: 11, fill: 'url(#g-peony-b)' },
  { n: 4, len: 10, w: 8, fill: 'url(#g-peony-b)' },
];

function Peony({ seed }) {
  const petals = useMemo(() => {
    const r = mulberry(seed);
    const ruff = (len, w) => {
      const bumps = 4;
      const span = 2 * w * 0.95;
      let d = `M0,0 C${f2(-w * 0.9)},${f2(-len * 0.15)} ${f2(-w * 1.3)},${f2(-len * 0.5)} ${f2(-w * 0.95)},${f2(-len * 0.82)}`;
      for (let i = 0; i < bumps; i++) {
        const x0 = -w * 0.95 + (i * span) / bumps;
        const x1 = x0 + span / bumps;
        const cy = -len * (1.1 + r() * 0.1);
        const ey = -len * (0.86 + r() * 0.08);
        d += ` Q${f2((x0 + x1) / 2)},${f2(cy)} ${f2(x1)},${f2(ey)}`;
      }
      d += ` C${f2(w * 1.3)},${f2(-len * 0.5)} ${f2(w * 0.9)},${f2(-len * 0.15)} 0,0Z`;
      return d;
    };
    let off = r() * 60;
    const out = [];
    PEONY_RINGS.forEach((ring, ri) => {
      off += 20 + r() * 20;
      for (let k = 0; k < ring.n; k++) {
        const len = ring.len * (0.92 + r() * 0.16);
        const w = ring.w * (0.92 + r() * 0.16);
        out.push({
          key: `${ri}-${k}`,
          ang: off + (360 / ring.n) * k + (r() - 0.5) * 12,
          d: ruff(len, w),
          fill: ring.fill,
          crease: `M0,${f2(-len * 0.15)} Q${f2((r() - 0.5) * 8)},${f2(-len * 0.5)} 0,${f2(-len * 0.82)}`,
        });
      }
    });
    return out;
  }, [seed]);
  return (
    <g>
      <circle r="46" cy="3" fill="url(#g-shadow)" />
      {petals.map((p) => (
        <g key={p.key} transform={`rotate(${f2(p.ang)})`}>
          <path d={p.d} fill={p.fill} stroke="rgba(150,40,80,.3)" strokeWidth="0.6" />
          <path d={p.crease} fill="none" stroke="rgba(190,70,105,.28)" strokeWidth="0.8" />
        </g>
      ))}
      <circle r="2.2" fill="#a52f55" />
    </g>
  );
}

function Bud() {
  return (
    <g>
      <circle r="32" cy="2" fill="url(#g-shadow)" />
      <path d="M0,-36 C-15,-28 -19,-4 -11,13 C-6,22 6,22 11,13 C19,-4 15,-28 0,-36Z" fill="url(#g-bud)" stroke="rgba(30,0,8,.4)" strokeWidth="0.7" />
      <path d="M-1,-36 C11,-27 17,-6 9,12 C4,19 -4,20 -8,14 C-3,4 -2,-14 -1,-36Z" fill="url(#g-bud-b)" opacity="0.92" />
      <path d="M-1,-35 C5,-22 7,-6 3,12" fill="none" stroke="rgba(30,0,8,.45)" strokeWidth="1" />
      <path d="M-9,-14 C-6,-4 -4,6 -3,14" fill="none" stroke="rgba(255,170,185,.4)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M-2,16 C-14,14 -26,20 -32,34 C-20,32 -10,28 -2,16Z" fill="url(#g-leaf)" />
      <path d="M2,16 C14,14 26,20 32,34 C20,32 10,28 2,16Z" fill="url(#g-leaf)" />
      <path d="M0,18 C-4,26 -4,36 0,44 C4,36 4,26 0,18Z" fill="url(#g-leaf)" />
    </g>
  );
}

function Lily({ seed, pal = 'white' }) {
  const isPink = pal === 'pink';
  const { petals, stamens } = useMemo(() => {
    const r = mulberry(seed);
    const ps = [0, 1, 2, 3, 4, 5].map((k) => {
      const outer = k < 3;
      const len = (outer ? 43 : 39) * (0.94 + r() * 0.12);
      const w = (outer ? 10.5 : 12.5) * (0.94 + r() * 0.12);
      const bend = (r() - 0.5) * 7;
      const base = outer ? k * 120 : 60 + (k - 3) * 120;
      return {
        k,
        outer,
        len,
        ang: base + (r() - 0.5) * 10,
        d: `M0,0 C${f2(-w)},${f2(-len * 0.28)} ${f2(-w * 1.15)},${f2(-len * 0.72)} ${f2(bend)},${f2(-len)} C${f2(w * 1.15)},${f2(-len * 0.72)} ${f2(w)},${f2(-len * 0.28)} 0,0Z`,
        vein: `M0,-3 Q${f2(bend * 0.5)},${f2(-len * 0.5)} ${f2(bend * 0.9)},${f2(-len * 0.88)}`,
        spots: outer ? [] : Array.from({ length: 5 }, () => [f2((r() - 0.5) * 6), f2(-len * (0.2 + r() * 0.35))]),
      };
    });
    const st = [0, 1, 2, 3, 4, 5].map((k) => {
      const a = ((k * 60 + 15 + (r() - 0.5) * 16) * Math.PI) / 180;
      const L = 19 + r() * 7;
      return { k, x: f2(Math.sin(a) * L), y: f2(-Math.cos(a) * L), deg: f2((a * 180) / Math.PI) };
    });
    return { petals: ps, stamens: st };
  }, [seed]);

  const fillOuter = isPink ? 'url(#g-lily-pink-b)' : 'url(#g-lily-b)';
  const fillInner = isPink ? 'url(#g-lily-pink-a)' : 'url(#g-lily-a)';
  const veinStroke = isPink ? 'rgba(210,60,100,.45)' : 'rgba(140,165,115,.5)';
  const midribColor = isPink ? '#f49cb2' : '#d3e3b4';
  const spotColor = isPink ? '#b02048' : '#e79bb0';

  return (
    <g>
      <circle r="48" cy="4" fill="url(#g-shadow)" />
      {[...petals]
        .sort((a, b) => Number(b.outer) - Number(a.outer))
        .map((p) => (
          <g key={p.k} transform={`rotate(${f2(p.ang)})`}>
            <path d={p.d} fill={p.outer ? fillOuter : fillInner} stroke={isPink ? 'rgba(180,50,90,.25)' : 'rgba(120,100,95,.28)'} strokeWidth="0.6" />
            <path d={p.vein} fill="none" stroke={veinStroke} strokeWidth="0.9" />
            <path d={`M0,0 L0,${f2(-p.len * 0.34)}`} stroke={midribColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            {p.spots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.9" fill={spotColor} opacity="0.8" />
            ))}
          </g>
        ))}
      {stamens.map((s) => (
        <g key={s.k}>
          <path d={`M0,0 L${s.x},${s.y}`} stroke="#efe9d2" strokeWidth="1.1" strokeLinecap="round" />
          <ellipse cx={s.x} cy={s.y} rx="2" ry="4.2" transform={`rotate(${s.deg + 90} ${s.x} ${s.y})`} fill="#c98a3a" />
        </g>
      ))}
      <path d="M0,0 L2,-28" stroke="#e7d9b8" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="2" cy="-28" r="2" fill={isPink ? '#d4404f' : '#e8a9ba'} />
      <circle r="2.2" fill="#c9d9a5" />
    </g>
  );
}

function Flower({ f, off }) {
  const seed = f.seed + off;
  switch (f.t) {
    case 'rose':
      return <Rose seed={seed} />;
    case 'baby':
      return <BabyRose seed={seed} c={f.c} />;
    case 'tulipW':
      return <Tulip pal="white" />;
    case 'tulipP':
      return <Tulip pal="pink" />;
    case 'daisy':
      return <Daisy seed={seed} />;
    case 'peony':
      return <Peony seed={seed} />;
    case 'lily':
      return <Lily seed={seed} pal="white" />;
    case 'lilyP':
      return <Lily seed={seed} pal="pink" />;
    default:
      return <Bud />;
  }
}

/* ------------------------------------------------------------------ */
/* Daun, eucalyptus                                                    */
/* ------------------------------------------------------------------ */
const LEAF_BROAD = 'M0,0 C-11,-10 -15,-28 0,-48 C15,-28 11,-10 0,0Z';
const LEAF_BLADE = 'M0,0 C8,-26 6,-64 -6,-98 C-12,-64 -10,-26 0,0Z';

function Leaf({ k }) {
  return (
    <>
      <path d={k === 'blade' ? LEAF_BLADE : LEAF_BROAD} fill="url(#g-leaf)" />
      <path
        d={k === 'blade' ? 'M0,0 C2,-30 0,-64 -5,-92' : 'M0,0 C1,-16 1,-32 0,-44'}
        fill="none"
        stroke="rgba(255,255,255,.2)"
        strokeWidth="0.9"
      />
    </>
  );
}

function Euc({ tip }) {
  const [tx, ty] = tip;
  const c = { x: PIVOT.x + (tx - PIVOT.x) * 0.2, y: (PIVOT.y + ty) / 2 + 30 };
  const p1 = { x: tx, y: ty };
  const leaves = [0.4, 0.52, 0.64, 0.76, 0.88, 1].map((t, i) => {
    const p = quad(PIVOT, c, p1, t);
    const dx = 2 * (1 - t) * (c.x - PIVOT.x) + 2 * t * (tx - c.x);
    const dy = 2 * (1 - t) * (c.y - PIVOT.y) + 2 * t * (ty - c.y);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    const tipLeaf = t === 1;
    const side = i % 2 ? 1 : -1;
    return {
      key: t,
      x: f2(p.x),
      y: f2(p.y),
      rot: f2(tipLeaf ? a - 90 : a + side * 52 - 90),
      rx: tipLeaf ? 7 : 8.5,
      ry: tipLeaf ? 10 : 11,
    };
  });
  return (
    <g>
      <path d={`M${PIVOT.x},${PIVOT.y} Q${f2(c.x)},${f2(c.y)} ${tx},${ty}`} fill="none" stroke="#6b8f7f" strokeWidth="1.8" strokeLinecap="round" />
      {leaves.map((l) => (
        <ellipse
          key={l.key}
          cx="0"
          cy={l.ry}
          rx={l.rx}
          ry={l.ry}
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}
          fill="url(#g-euc)"
          stroke="rgba(30,60,50,.25)"
          strokeWidth="0.5"
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Pembungkus 1: kertas kerucut                                        */
/* ------------------------------------------------------------------ */
const BACK_SHEET = 'M72,336 C120,322 160,338 200,352 C240,338 280,322 328,336 L250,508 Q200,520 150,508Z';

function WrapFront({ k }) {
  const rib = `url(#g-rib-${k})`;
  return (
    <g>
      <path d="M342,350 C296,332 240,350 200,390 L212,516 C228,520 246,514 258,506 Z" fill={`url(#g-wrap-front-${k})`} />
      <path d="M200,390 L212,516" stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
      <path d="M280,346 C262,400 252,450 250,508" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1.4" />
      <path d="M58,352 C106,334 160,352 204,394 L192,516 C176,520 158,516 146,506 Z" fill={`url(#g-wrap-front-${k})`} />
      <path d="M204,394 L192,516" stroke="rgba(0,0,0,.16)" strokeWidth="1.2" />
      <path d="M120,348 C150,380 170,440 176,512" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="1.6" />
      <path d="M96,360 C118,400 134,440 148,500" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1.2" />
      {/* pita satin */}
      <path d="M110,436 Q200,464 292,436 L288,454 Q200,482 114,454Z" fill={rib} />
      <path d="M197,468 L170,522 L186,514 L194,526 L204,474Z" fill={rib} />
      <path d="M203,468 L230,522 L214,514 L206,526 L196,474Z" fill={rib} />
      <path d="M200,462 C170,432 128,440 140,468 C150,486 188,476 200,462Z" fill={rib} />
      <path d="M200,462 C230,432 272,440 260,468 C250,486 212,476 200,462Z" fill={rib} />
      <path d="M150,452 C160,444 180,448 192,458" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M250,452 C240,444 220,448 208,458" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="200" cy="466" rx="11" ry="9" fill={rib} />
      <ellipse cx="200" cy="466" rx="11" ry="9" fill="rgba(120,40,60,.22)" />
      <path d="M194,462 C198,459 203,459 207,462" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Pembungkus 2: diikat pita, tisu tipis di belakang                   */
/* ------------------------------------------------------------------ */
function TiedBack() {
  return (
    <g>
      <path
        d="M52,326 C110,292 160,318 200,342 C240,318 290,292 348,326 L288,476 Q200,496 112,476Z"
        fill="#fff8f4"
        fillOpacity="0.7"
        stroke="#e3c9cf"
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      <path d="M200,342 L200,488" stroke="#e3c9cf" strokeOpacity="0.5" strokeWidth="1" />
    </g>
  );
}

function TiedFront() {
  const rib = 'url(#g-rib-2)';
  return (
    <g>
      {[158, 180, 200, 220, 242].map((x, i) => (
        <path key={x} d={`M200,418 L${x},${512 - (i % 2) * 6}`} stroke="#2f6a49" strokeWidth="3.4" strokeLinecap="round" />
      ))}
      <path d="M196,452 L168,510 L185,502 L193,514 L204,458Z" fill={rib} />
      <path d="M204,452 L232,510 L215,502 L207,514 L196,458Z" fill={rib} />
      <path d="M200,446 C166,408 120,418 136,452 C148,474 188,466 200,446Z" fill={rib} />
      <path d="M200,446 C234,408 280,418 264,452 C252,474 212,466 200,446Z" fill={rib} />
      <path d="M146,440 C158,430 180,434 192,444" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M254,440 C242,430 220,434 208,444" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="200" cy="449" rx="11" ry="9" fill={rib} />
      <ellipse cx="200" cy="449" rx="11" ry="9" fill="rgba(120,40,60,.2)" />
      <path d="M194,445 C198,442 203,442 207,445" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Komposisi buket                                                     */
/* ------------------------------------------------------------------ */
const BASE_LEAVES = [
  { k: 'blade', x: 178, y: 372, r: -36, s: 1.25 },
  { k: 'blade', x: 222, y: 372, r: 34, s: 1.25 },
  { k: 'broad', x: 150, y: 368, r: -64, s: 1.5 },
  { k: 'broad', x: 250, y: 368, r: 64, s: 1.5 },
  { k: 'broad', x: 200, y: 364, r: 0, s: 1.35 },
];

// wrap: 'cone' = kertas kerucut (k = palet 2 blush, 3 sage, 4 krem)
//       'tied' = batang diikat pita + tisu tipis
const CONFIGS = [
  {
    // posy bulat, diikat pita
    wrap: 'tied',
    flowers: [
      { t: 'lily', x: 200, y: 118, s: 0.95, r: 0, seed: 501, lf: 'blade' },
      { t: 'tulipP', x: 78, y: 190, s: 0.85, r: -24, seed: 508, lf: 'blade' },
      { t: 'tulipW', x: 322, y: 190, s: 0.85, r: 24, seed: 509, lf: 'blade' },
      { t: 'baby', c: 'pink', x: 135, y: 172, s: 1.35, r: 0, seed: 502 },
      { t: 'baby', c: 'peach', x: 265, y: 172, s: 1.35, r: 0, seed: 503 },
      { t: 'peony', x: 200, y: 208, s: 1.25, r: 0, seed: 504, lf: 'broad' },
      { t: 'daisy', x: 110, y: 252, s: 0.95, r: 0, seed: 505 },
      { t: 'daisy', x: 290, y: 252, s: 0.95, r: 0, seed: 506 },
      { t: 'baby', c: 'pink', x: 200, y: 296, s: 1.3, r: 0, seed: 507 },
    ],
    euc: [[40, 215], [360, 215], [150, 66], [250, 66]],
  },
  {
    // tegak ramping, kertas sage
    wrap: 'cone',
    k: 3,
    flowers: [
      { t: 'tulipW', x: 200, y: 60, s: 1.0, r: 0, seed: 511, lf: 'blade' },
      { t: 'tulipP', x: 150, y: 115, s: 0.95, r: -12, seed: 512, lf: 'blade' },
      { t: 'tulipW', x: 252, y: 120, s: 0.95, r: 12, seed: 513, lf: 'blade' },
      { t: 'lilyP', x: 200, y: 178, s: 1.0, r: 0, seed: 514, lf: 'broad' },
      { t: 'tulipP', x: 120, y: 212, s: 0.9, r: -18, seed: 515, lf: 'blade' },
      { t: 'tulipW', x: 282, y: 216, s: 0.9, r: 18, seed: 516, lf: 'blade' },
      { t: 'baby', c: 'pink', x: 160, y: 272, s: 1.2, r: 0, seed: 517 },
      { t: 'baby', c: 'peach', x: 242, y: 274, s: 1.2, r: 0, seed: 518 },
      { t: 'daisy', x: 200, y: 304, s: 0.85, r: 0, seed: 519 },
    ],
    euc: [[78, 120], [322, 126], [130, 30], [272, 34]],
  },
  {
    // menjuntai miring, diikat pita
    wrap: 'tied',
    flowers: [
      { t: 'peony', x: 170, y: 105, s: 1.2, r: -8, seed: 521, lf: 'broad' },
      { t: 'lily', x: 262, y: 140, s: 1.0, r: 14, seed: 522, lf: 'blade' },
      { t: 'lilyP', x: 100, y: 172, s: 0.95, r: -22, seed: 523 },
      { t: 'baby', c: 'pink', x: 200, y: 188, s: 1.3, r: 0, seed: 524 },
      { t: 'daisy', x: 305, y: 218, s: 0.95, r: 0, seed: 525 },
      { t: 'peony', x: 140, y: 246, s: 1.1, r: -6, seed: 526, lf: 'broad' },
      { t: 'tulipP', x: 262, y: 262, s: 0.9, r: 12, seed: 527, lf: 'blade' },
      { t: 'baby', c: 'peach', x: 80, y: 268, s: 1.2, r: 0, seed: 528 },
      { t: 'daisy', x: 205, y: 304, s: 0.9, r: 0, seed: 529 },
    ],
    euc: [[28, 205], [372, 252], [110, 48], [300, 68]],
  },
  {
    // taman liar, kertas krem
    wrap: 'cone',
    k: 4,
    flowers: [
      { t: 'daisy', x: 200, y: 80, s: 1.0, r: 0, seed: 531 },
      { t: 'daisy', x: 128, y: 122, s: 0.9, r: 0, seed: 532 },
      { t: 'daisy', x: 276, y: 126, s: 0.95, r: 0, seed: 533 },
      { t: 'lily', x: 200, y: 180, s: 0.95, r: 0, seed: 534, lf: 'blade' },
      { t: 'baby', c: 'pink', x: 88, y: 190, s: 1.25, r: 0, seed: 535 },
      { t: 'baby', c: 'peach', x: 312, y: 196, s: 1.25, r: 0, seed: 536 },
      { t: 'daisy', x: 148, y: 246, s: 0.9, r: 0, seed: 537 },
      { t: 'baby', c: 'pink', x: 256, y: 246, s: 1.3, r: 0, seed: 538, lf: 'broad' },
      { t: 'lilyP', x: 200, y: 304, s: 0.9, r: 0, seed: 539 },
    ],
    euc: [[34, 140], [366, 148], [150, 36], [252, 40]],
  },
];

function BouquetSVG({ idx }) {
  const cfg = CONFIGS[idx % CONFIGS.length];
  const off = Math.floor(idx / CONFIGS.length) * 1000;
  const tied = cfg.wrap === 'tied';

  const geo = cfg.flowers.map((f, i) => {
    const c = { x: PIVOT.x + (f.x - PIVOT.x) * 0.18, y: (PIVOT.y + f.y) / 2 + 40 };
    const side = f.x > 210 ? 1 : -1;
    const p = quad(PIVOT, c, f, 0.56);
    return {
      i,
      f,
      path: `M${PIVOT.x},${PIVOT.y} Q${f2(c.x)},${f2(c.y)} ${f.x},${f.y}`,
      w: f2(2.4 + f.s * 1.1),
      leaf: f.lf ? { x: f2(p.x), y: f2(p.y), rot: side * (f.lf === 'blade' ? 26 : 52), k: f.lf } : null,
    };
  });
  const heads = [...geo].sort((a, b) => a.f.y - b.f.y);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 540" width="400" height="540">
      <Defs />
      <ellipse cx="200" cy="524" rx="104" ry="11" fill="url(#g-shadow)" />
      {tied ? <TiedBack /> : <path d={BACK_SHEET} fill={`url(#g-wrap-back-${cfg.k})`} />}

      {cfg.euc.map((tip, i) => (
        <Euc key={i} tip={tip} />
      ))}
      {BASE_LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}>
          <Leaf k={l.k} />
        </g>
      ))}
      {geo.map((g) => (
        <g key={`st${g.i}`}>
          <path d={g.path} fill="none" stroke="#2f6a49" strokeWidth={g.w} strokeLinecap="round" />
          {g.leaf && (
            <g transform={`translate(${g.leaf.x} ${g.leaf.y}) rotate(${g.leaf.rot}) scale(0.95)`}>
              <Leaf k={g.leaf.k} />
            </g>
          )}
        </g>
      ))}
      {heads.map((g) => (
        <g key={`hd${g.i}`} transform={`translate(${g.f.x} ${g.f.y}) rotate(${g.f.r}) scale(${g.f.s})`}>
          <Flower f={g.f} off={off} />
        </g>
      ))}
      {tied ? <TiedFront /> : <WrapFront k={cfg.k} />}
    </svg>
  );
}

const cache = {};

/** URL gambar (data URI) untuk buket ke-idx. Dihitung sekali lalu disimpan. */
export function getBouquetUrl(idx = 0) {
  if (!cache[idx]) {
    const markup = renderToStaticMarkup(<BouquetSVG idx={idx} />);
    cache[idx] = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  }
  return cache[idx];
}

export const BOUQUET_VARIANTS = CONFIGS.length;