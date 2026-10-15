import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { animate, stagger } from 'animejs';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { bouquetLetters, diaryTitle } from '../../data/messages';
import { playChime, playPop } from '../../utils/sound';
import { clamp, mix, prefersReduced } from '../story/kit';

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

// Font surat. Mau ganti? Ubah dua baris ini + FONT_HREF.
const TITLE_FONT = "'Great Vibes', 'Snell Roundhand', cursive";
const BODY_FONT = "'La Belle Aurore', 'Segoe Script', cursive";
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=La+Belle+Aurore&display=swap';

const INK = '#3a2a22';
const NOTE_ROT = 11;
const PIVOT = { x: 200, y: 418 };

const mulberry = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f2 = (n) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ */
/* Isi tiap buket (posisi bunga ada di sini, bisa kamu geser-geser)     */
/* t: rose | lily | tulipW | iris | bud | peony | daisy | tulipP | baby */
/* ------------------------------------------------------------------ */

const BOUQUETS = [
  {
    id: 'b1',
    k: 1, // mawar merah + tulip putih + iris + lily pink
    flowers: [
      { t: 'lilyP', x: 200, y: 78, s: 1.05, r: 0, seed: 101, lf: 'blade' },
      { t: 'tulipW', x: 120, y: 125, s: 0.95, r: -18, seed: 102, lf: 'blade' },
      { t: 'iris', x: 282, y: 128, s: 0.95, r: 18, seed: 103, lf: 'blade' },
      { t: 'lilyP', x: 60, y: 200, s: 0.88, r: -28, seed: 104 },
      { t: 'iris', x: 340, y: 205, s: 0.88, r: 26, seed: 105 },
      { t: 'rose', x: 200, y: 198, s: 1.25, r: 0, seed: 106, lf: 'broad' },
      { t: 'tulipW', x: 122, y: 265, s: 0.92, r: -14, seed: 107, lf: 'blade' },
      { t: 'lilyP', x: 278, y: 270, s: 0.98, r: 14, seed: 108, lf: 'broad' },
      { t: 'rose', x: 200, y: 295, s: 1.15, r: 0, seed: 109, lf: 'broad' },
    ],
    euc: [
      [34, 152],
      [366, 160],
      [160, 36],
      [248, 44],
    ],
  },
  {
    id: 'b2',
    k: 2, // kuncup mawar + daisy + peony banyak + lily banyak
    flowers: [
      { t: 'lily', x: 200, y: 72, s: 1.05, r: 0, seed: 201, lf: 'blade' },
      { t: 'lily', x: 110, y: 118, s: 0.95, r: -20, seed: 202, lf: 'blade' },
      { t: 'lily', x: 290, y: 122, s: 0.95, r: 20, seed: 203, lf: 'blade' },
      { t: 'bud', x: 160, y: 155, s: 0.9, r: -12, seed: 204 },
      { t: 'bud', x: 240, y: 158, s: 0.9, r: 14, seed: 205 },
      { t: 'daisy', x: 50, y: 200, s: 0.95, r: 0, seed: 206 },
      { t: 'daisy', x: 350, y: 204, s: 0.95, r: 0, seed: 207 },
      { t: 'peony', x: 130, y: 215, s: 1.2, r: -8, seed: 208, lf: 'broad' },
      { t: 'peony', x: 270, y: 218, s: 1.2, r: 8, seed: 209, lf: 'broad' },
      { t: 'peony', x: 200, y: 228, s: 1.3, r: 0, seed: 210, lf: 'broad' },
      { t: 'lily', x: 88, y: 278, s: 0.95, r: -18, seed: 211 },
      { t: 'daisy', x: 200, y: 300, s: 0.9, r: 0, seed: 212 },
      { t: 'lily', x: 312, y: 278, s: 0.95, r: 18, seed: 213 },
      { t: 'bud', x: 145, y: 312, s: 0.8, r: -22, seed: 214 },
      { t: 'bud', x: 255, y: 312, s: 0.8, r: 22, seed: 215 },
    ],
    euc: [
      [30, 168],
      [370, 176],
      [150, 40],
      [256, 48],
    ],
  },
  {
    id: 'b3',
    k: 3, // daisy + tulip + baby rose
    flowers: [
      { t: 'tulipW', x: 200, y: 72, s: 1.05, r: 0, seed: 301, lf: 'blade' },
      { t: 'tulipP', x: 118, y: 122, s: 0.95, r: -18, seed: 302, lf: 'blade' },
      { t: 'tulipW', x: 282, y: 125, s: 0.95, r: 18, seed: 303, lf: 'blade' },
      { t: 'daisy', x: 55, y: 200, s: 0.95, r: 0, seed: 304 },
      { t: 'daisy', x: 345, y: 204, s: 0.95, r: 0, seed: 305 },
      { t: 'daisy', x: 200, y: 175, s: 1.0, r: 0, seed: 306 },
      { t: 'baby', c: 'peach', x: 130, y: 220, s: 1.25, r: 0, seed: 307, lf: 'blade' },
      { t: 'baby', c: 'pink', x: 270, y: 220, s: 1.25, r: 0, seed: 308, lf: 'blade' },
      { t: 'tulipP', x: 200, y: 245, s: 1.1, r: 2, seed: 309, lf: 'broad' },
      { t: 'daisy', x: 85, y: 280, s: 0.88, r: 0, seed: 310 },
      { t: 'baby', c: 'pink', x: 145, y: 285, s: 1.3, r: 0, seed: 311 },
      { t: 'baby', c: 'peach', x: 255, y: 285, s: 1.3, r: 0, seed: 312 },
      { t: 'daisy', x: 315, y: 280, s: 0.88, r: 0, seed: 313 },
      { t: 'baby', c: 'pink', x: 200, y: 312, s: 1.35, r: 0, seed: 314 },
    ],
    euc: [
      [34, 150],
      [366, 158],
      [158, 34],
      [252, 40],
    ],
  },
  {
    id: 'b4',
    k: 4, // kertas krem + pita merah anggur, biar lily pink-nya menonjol
    flowers: [
      // puncak
      { t: 'lilyP', x: 200, y: 70, s: 1.0, r: 0, seed: 401, lf: 'blade' },
      // baris 2
      { t: 'lilyP', x: 126, y: 112, s: 0.98, r: -20, seed: 402, lf: 'blade' },
      { t: 'lilyP', x: 274, y: 112, s: 0.98, r: 20, seed: 403, lf: 'blade' },
      // baris 3
      { t: 'lilyP', x: 58, y: 172, s: 0.9, r: -30, seed: 404, lf: 'broad' },
      { t: 'lilyP', x: 200, y: 150, s: 1.1, r: 0, seed: 405 },
      { t: 'lilyP', x: 342, y: 172, s: 0.9, r: 30, seed: 406, lf: 'broad' },
      // baris 4
      { t: 'lilyP', x: 128, y: 206, s: 1.05, r: -12, seed: 407 },
      { t: 'lilyP', x: 272, y: 206, s: 1.05, r: 12, seed: 408 },
      // baris 5
      { t: 'lilyP', x: 56, y: 260, s: 0.85, r: -26, seed: 409, lf: 'broad' },
      { t: 'lilyP', x: 200, y: 250, s: 1.18, r: 0, seed: 410 },
      { t: 'lilyP', x: 344, y: 260, s: 0.85, r: 26, seed: 411, lf: 'broad' },
      // baris 6
      { t: 'lilyP', x: 126, y: 292, s: 0.98, r: -14, seed: 412, lf: 'blade' },
      { t: 'lilyP', x: 274, y: 292, s: 0.98, r: 14, seed: 413, lf: 'blade' },
      // bawah, tepat di atas pita
      { t: 'lilyP', x: 200, y: 320, s: 1.0, r: 0, seed: 414 },
    ],
    euc: [
      [30, 152],
      [370, 160],
      [154, 36],
      [250, 42],
    ],
  },

];

const BASE_LEAVES = [
  { k: 'blade', x: 178, y: 372, r: -36, s: 1.25 },
  { k: 'blade', x: 222, y: 372, r: 34, s: 1.25 },
  { k: 'broad', x: 150, y: 368, r: -64, s: 1.5 },
  { k: 'broad', x: 250, y: 368, r: 64, s: 1.5 },
  { k: 'broad', x: 200, y: 364, r: 0, s: 1.35 },
];

/* ------------------------------------------------------------------ */
/* Gradient & filter bersama (didefinisikan sekali)                    */
/* ------------------------------------------------------------------ */

// dir: up (pangkal -> ujung ke atas), down, diag
const GRADS = [
  ['g-rose-a', 'up', [[0, '#3d040d'], [0.35, '#7d0c1b'], [0.8, '#b81f33'], [1, '#d4404f']]],
  ['g-rose-b', 'up', [[0, '#2c0309'], [0.5, '#5f0915'], [1, '#9a1426']]],
  ['g-twhite-front', 'up', [[0, '#d3dbc2'], [0.3, '#f1ede5'], [1, '#ffffff']]],
  ['g-twhite-side', 'up', [[0, '#bfc4b0'], [0.4, '#e0dbd0'], [1, '#f3efe8']]],
  ['g-tpink-front', 'up', [[0, '#d9728f'], [0.4, '#f2a8bb'], [1, '#fde0e8']]],
  ['g-tpink-side', 'up', [[0, '#c0566f'], [0.5, '#e48ca3'], [1, '#f6c4d0']]],
  ['g-iris-fall', 'down', [[0, '#eee6fa'], [0.22, '#8068d4'], [1, '#33237d']]],
  ['g-iris-std', 'up', [[0, '#5b47b8'], [1, '#b4a7f1']]],
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
  ['g-gerbera-a', 'up', [[0, '#d96c43'], [0.35, '#f28e68'], [0.8, '#fab89e'], [1, '#fff0e8']]],
  ['g-gerbera-b', 'up', [[0, '#bf552f'], [0.4, '#e07952'], [1, '#f7a88b']]],
  ['g-gerbera-disk', 'up', [[0, '#9e4620'], [1, '#f5af58']]],
  ['g-gompie-a', 'up', [[0, '#c75878'], [0.4, '#e5829e'], [0.8, '#f7b9cb'], [1, '#fff2f6']]],
  ['g-gompie-b', 'up', [[0, '#a83c5e'], [0.45, '#cb6885'], [1, '#efa6ba']]],
  ['g-gompie-c', 'up', [[0, '#852442'], [0.5, '#b04969'], [1, '#df7d98']]],
  ['g-leaf', 'up', [[0, '#173d2c'], [0.5, '#2f6a4a'], [1, '#68a883']]],
  ['g-euc', 'up', [[0, '#587a6c'], [1, '#a3c2b5']]],
  ['g-note', 'diag', [[0, '#fbf3e1'], [1, '#e8d8b6']]],
  // kertas pembungkus (back, front) dan pita per buket
  ['g-wrap-back-1', 'diag', [[0, '#a8946d'], [1, '#cdbd9c']]],
  ['g-wrap-front-1', 'diag', [[0, '#fff8ec'], [1, '#ead7c2']]],
  ['g-rib-1', 'diag', [[0, '#800020'], [0.5, '#a82441'], [1, '#580016']]],
  ['g-wrap-back-2', 'diag', [[0, '#a8677a'], [1, '#cb96a4']]],
  ['g-wrap-front-2', 'diag', [[0, '#f5d3d8'], [1, '#cb97a3']]],
  ['g-rib-2', 'diag', [[0, '#800020'], [0.5, '#b83e63'], [1, '#580016']]],
  ['g-wrap-back-3', 'diag', [[0, '#6f866c'], [1, '#9bb097']]],
  ['g-wrap-front-3', 'diag', [[0, '#dfe8d6'], [1, '#a2b79d']]],
  ['g-rib-3', 'diag', [[0, '#800020'], [0.5, '#a82441'], [1, '#580016']]],
  ['g-wrap-back-4', 'diag', [[0, '#9a6a3e'], [1, '#cdbb92']]],
  ['g-wrap-front-4', 'diag', [[0, '#faf6ee'], [1, '#ebe3d5']]],
  ['g-rib-4', 'diag', [[0, '#800020'], [0.5, '#a82441'], [1, '#580016']]],
];

const DIRS = {
  up: { x1: 0, y1: 1, x2: 0, y2: 0 },
  down: { x1: 0, y1: 0, x2: 0, y2: 1 },
  diag: { x1: 0, y1: 0, x2: 1, y2: 1 },
};

function SharedDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute"
    >
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
        {/* Bikin tepi bunga sedikit tidak simetris biar terasa dilukis */}
        <filter id="f-organic" filterUnits="userSpaceOnUse" x="-20" y="-20" width="440" height="580">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="3.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Kepala bunga (digambar di sekitar 0,0)                              */
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
          <path
            d={lipPath(p.len, p.w)}
            fill="none"
            stroke={lip}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
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
  <RoseLike
    seed={seed}
    rings={ROSE_RINGS}
    lip="rgba(255,170,175,.5)"
    edge="rgba(40,0,8,.35)"
    core={roseCore}
  />
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
      <path
        d="M-6,-32 C-21,-24 -23,6 -12,23 C-7,29 7,29 12,23 C23,6 21,-24 6,-32 Z"
        fill={side}
        stroke={edge}
        strokeWidth="0.6"
      />
      <path
        d="M-3,-36 C-19,-27 -26,2 -16,21 C-11,28 -3,29 1,26 C-5,8 -7,-17 -3,-36Z"
        fill={side}
        stroke={edge}
        strokeWidth="0.6"
      />
      <path
        d="M3,-36 C19,-27 26,2 16,21 C11,28 3,29 -1,26 C5,8 7,-17 3,-36Z"
        fill={side}
        stroke={edge}
        strokeWidth="0.6"
      />
      <path
        d="M0,-38 C-12,-27 -17,-2 -11,18 C-7,27 7,27 11,18 C17,-2 12,-27 0,-38Z"
        fill={front}
        stroke={edge}
        strokeWidth="0.7"
      />
      <path
        d="M-5,-24 C-9,-12 -9,0 -6,10"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M0,-34 C2,-14 2,6 0,24" fill="none" stroke={edge} strokeWidth="0.8" />
    </g>
  );
}

function Iris({ seed }) {
  const r = useMemo(() => mulberry(seed), [seed]);
  const std = (ang, len, w) => (
    <path
      key={`s${ang}`}
      transform={`rotate(${ang})`}
      d={`M0,0 C${-w},${-len * 0.25} ${-w * 1.05},${-len * 0.8} 0,${-len} C${w * 1.05},${-len * 0.8} ${w},${-len * 0.25} 0,0Z`}
      fill="url(#g-iris-std)"
      stroke="rgba(30,20,90,.3)"
      strokeWidth="0.6"
    />
  );
  const fall = (ang, len, w) => (
    <g key={`f${ang}`} transform={`rotate(${f2(ang + (r() - 0.5) * 6)})`}>
      <path
        d={`M0,0 C${-w * 0.7},${len * 0.2} ${-w * 1.35},${len * 0.6} ${-w * 0.8},${len * 0.95} Q0,${len * 1.12} ${w * 0.8},${len * 0.95} C${w * 1.35},${len * 0.6} ${w * 0.7},${len * 0.2} 0,0Z`}
        fill="url(#g-iris-fall)"
        stroke="rgba(25,15,80,.35)"
        strokeWidth="0.6"
      />
      {[-4, -1.5, 1.5, 4].map((v) => (
        <path
          key={v}
          d={`M0,3 Q${v},${len * 0.4} ${v * 2},${len * 0.82}`}
          fill="none"
          stroke="rgba(240,232,255,.32)"
          strokeWidth="0.7"
        />
      ))}
      <path d={`M0,3 L0,${len * 0.55}`} stroke="#f1ae1f" strokeWidth="3.2" strokeLinecap="round" />
      <path d={`M0,3 L0,${len * 0.48}`} stroke="#fff1b8" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <circle r="42" cy="4" fill="url(#g-shadow)" />
      {std(-26, 38, 10)}
      {std(26, 38, 10)}
      {std(0, 46, 11)}
      {fall(62, 34, 13)}
      {fall(-62, 34, 13)}
      {fall(0, 36, 13.5)}
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
        <path
          key={`b${i}`}
          transform={`rotate(${f2(p.ang)})`}
          d={p.d}
          fill="#e2d9cc"
          stroke="rgba(120,100,90,.25)"
          strokeWidth="0.5"
        />
      ))}
      {front.map((p, i) => (
        <path
          key={`f${i}`}
          transform={`rotate(${f2(p.ang)})`}
          d={p.d}
          fill="url(#g-daisy)"
          stroke="rgba(120,100,90,.22)"
          strokeWidth="0.5"
        />
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
      <path
        d="M0,-36 C-15,-28 -19,-4 -11,13 C-6,22 6,22 11,13 C19,-4 15,-28 0,-36Z"
        fill="url(#g-bud)"
        stroke="rgba(30,0,8,.4)"
        strokeWidth="0.7"
      />
      <path
        d="M-1,-36 C11,-27 17,-6 9,12 C4,19 -4,20 -8,14 C-3,4 -2,-14 -1,-36Z"
        fill="url(#g-bud-b)"
        opacity="0.92"
      />
      <path d="M-1,-35 C5,-22 7,-6 3,12" fill="none" stroke="rgba(30,0,8,.45)" strokeWidth="1" />
      <path
        d="M-9,-14 C-6,-4 -4,6 -3,14"
        fill="none"
        stroke="rgba(255,170,185,.4)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M-2,16 C-14,14 -26,20 -32,34 C-20,32 -10,28 -2,16Z" fill="url(#g-leaf)" />
      <path d="M2,16 C14,14 26,20 32,34 C20,32 10,28 2,16Z" fill="url(#g-leaf)" />
      <path d="M0,18 C-4,26 -4,36 0,44 C4,36 4,26 0,18Z" fill="url(#g-leaf)" />
    </g>
  );
}

// Lily putih atau pink: 3 kelopak luar + 3 kelopak dalam, benang sari emas
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
        spots: outer
          ? []
          : Array.from({ length: 5 }, () => [
              f2((r() - 0.5) * 6),
              f2(-len * (0.2 + r() * 0.35)),
            ]),
      };
    });
    const st = [0, 1, 2, 3, 4, 5].map((k) => {
      const a = ((k * 60 + 15 + (r() - 0.5) * 16) * Math.PI) / 180;
      const L = 19 + r() * 7;
      return {
        k,
        x: f2(Math.sin(a) * L),
        y: f2(-Math.cos(a) * L),
        deg: f2((a * 180) / Math.PI),
      };
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
            <path
              d={p.d}
              fill={p.outer ? fillOuter : fillInner}
              stroke={isPink ? 'rgba(180,50,90,.25)' : 'rgba(120,100,95,.28)'}
              strokeWidth="0.6"
            />
            <path d={p.vein} fill="none" stroke={veinStroke} strokeWidth="0.9" />
            <path
              d={`M0,0 L0,${f2(-p.len * 0.34)}`}
              stroke={midribColor}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            {p.spots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.9" fill={spotColor} opacity="0.8" />
            ))}
          </g>
        ))}
      {stamens.map((s) => (
        <g key={s.k}>
          <path d={`M0,0 L${s.x},${s.y}`} stroke="#efe9d2" strokeWidth="1.1" strokeLinecap="round" />
          <ellipse
            cx={s.x}
            cy={s.y}
            rx="2"
            ry="4.2"
            transform={`rotate(${s.deg + 90} ${s.x} ${s.y})`}
            fill="#c98a3a"
          />
        </g>
      ))}
      <path d="M0,0 L2,-28" stroke="#e7d9b8" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="2" cy="-28" r="2" fill={isPink ? '#d4404f' : '#e8a9ba'} />
      <circle r="2.2" fill="#c9d9a5" />
    </g>
  );
}

// Bunga Garbera (Gerbera): kelopak radiasi rapat bertingkat dengan mata piringan gelap
function Gerbera({ seed }) {
  const { outerPetals, innerPetals, diskFlorets, dots } = useMemo(() => {
    const r = mulberry(seed);
    const nOuter = 26;
    const nInner = 24;
    const nFlorets = 20;

    const mkPetals = (n, len0, w0, offset) =>
      Array.from({ length: n }, (_, k) => {
        const len = len0 * (0.92 + r() * 0.16);
        const w = w0 * (0.92 + r() * 0.16);
        const tx = (r() - 0.5) * 2;
        return {
          ang: offset + (360 / n) * k + (r() - 0.5) * 6,
          d: `M0,0 C${f2(-w * 0.8)},${f2(-len * 0.25)} ${f2(-w)},${f2(-len * 0.75)} ${f2(tx)},${f2(-len)} C${f2(w)},${f2(-len * 0.75)} ${f2(w * 0.8)},${f2(-len * 0.25)} 0,0Z`,
        };
      });

    const outP = mkPetals(nOuter, 32, 3.6, 0);
    const inP = mkPetals(nInner, 26, 3.2, 360 / nInner / 2);
    const flor = Array.from({ length: nFlorets }, (_, k) => ({
      ang: (360 / nFlorets) * k + (r() - 0.5) * 8,
      len: 11 + r() * 2,
    }));

    const dts = Array.from({ length: 28 }, (_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const rad = Math.sqrt(i + 1) * 1.5;
      return [f2(Math.cos(a) * rad), f2(Math.sin(a) * rad)];
    });

    return { outerPetals: outP, innerPetals: inP, diskFlorets: flor, dots: dts };
  }, [seed]);

  return (
    <g>
      <circle r="36" cy="2" fill="url(#g-shadow)" />
      {outerPetals.map((p, i) => (
        <path
          key={`gp-out-${i}`}
          transform={`rotate(${f2(p.ang)})`}
          d={p.d}
          fill="url(#g-gerbera-b)"
          stroke="rgba(140,50,20,.25)"
          strokeWidth="0.5"
        />
      ))}
      {innerPetals.map((p, i) => (
        <path
          key={`gp-in-${i}`}
          transform={`rotate(${f2(p.ang)})`}
          d={p.d}
          fill="url(#g-gerbera-a)"
          stroke="rgba(140,50,20,.22)"
          strokeWidth="0.5"
        />
      ))}
      {diskFlorets.map((f, i) => (
        <line
          key={`gf-${i}`}
          transform={`rotate(${f2(f.ang)})`}
          x1="0"
          y1="0"
          x2="0"
          y2={-f.len}
          stroke="#f28e68"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}
      <circle r="9" fill="#2d1308" />
      <circle r="7.5" fill="url(#g-gerbera-disk)" opacity="0.6" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.8" fill="#1b0802" />
      ))}
    </g>
  );
}

// Bunga Krisan Gompie: bentuk bulat penuh dengan kelopak melengkung ke dalam (incurved)
const GOMPIE_RINGS = [
  { n: 12, len: 32, w: 10, fill: 'url(#g-gompie-a)', stroke: 'rgba(120,30,55,.25)' },
  { n: 11, len: 26, w: 9, fill: 'url(#g-gompie-a)', stroke: 'rgba(120,30,55,.25)' },
  { n: 9, len: 21, w: 8, fill: 'url(#g-gompie-b)', stroke: 'rgba(110,25,50,.28)' },
  { n: 8, len: 16, w: 7, fill: 'url(#g-gompie-b)', stroke: 'rgba(100,20,45,.3)' },
  { n: 6, len: 11, w: 5.5, fill: 'url(#g-gompie-c)', stroke: 'rgba(80,15,35,.35)' },
  { n: 5, len: 7, w: 4, fill: 'url(#g-gompie-c)', stroke: 'rgba(60,10,25,.4)' },
];

function Gompie({ seed }) {
  const petals = useMemo(() => {
    const r = mulberry(seed);
    const cupIncurved = (len, w) => {
      const tipY = -len;
      const cup = w * 1.1;
      return `M0,0 C${f2(-w * 0.7)},${f2(-len * 0.2)} ${f2(-cup)},${f2(-len * 0.65)} ${f2(-w * 0.35)},${f2(tipY)} Q0,${f2(tipY - len * 0.1)} ${f2(w * 0.35)},${f2(tipY)} C${f2(cup)},${f2(-len * 0.65)} ${f2(w * 0.7)},${f2(-len * 0.2)} 0,0Z`;
    };

    let off = r() * 45;
    const out = [];
    GOMPIE_RINGS.forEach((ring, ri) => {
      off += 18 + r() * 18;
      for (let k = 0; k < ring.n; k++) {
        const len = ring.len * (0.92 + r() * 0.16);
        const w = ring.w * (0.92 + r() * 0.16);
        out.push({
          key: `gmp-${ri}-${k}`,
          ang: off + (360 / ring.n) * k + (r() - 0.5) * 8,
          d: cupIncurved(len, w),
          fill: ring.fill,
          stroke: ring.stroke,
          crease: `M0,${f2(-len * 0.1)} L0,${f2(-len * 0.78)}`,
        });
      }
    });
    return out;
  }, [seed]);

  return (
    <g>
      <circle r="42" cy="2" fill="url(#g-shadow)" />
      {petals.map((p) => (
        <g key={p.key} transform={`rotate(${f2(p.ang)})`}>
          <path d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth="0.6" />
          <path d={p.crease} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      ))}
      <circle r="3" fill="#600018" />
    </g>
  );
}

function Flower({ f }) {
  switch (f.t) {
    case 'rose':
      return <Rose seed={f.seed} />;
    case 'baby':
      return <BabyRose seed={f.seed} c={f.c} />;
    case 'tulipW':
      return <Tulip pal="white" />;
    case 'tulipP':
      return <Tulip pal="pink" />;
    case 'tulip':
      return <Tulip pal={f.pal || 'white'} />;
    case 'iris':
      return <Iris seed={f.seed} />;
    case 'daisy':
      return <Daisy seed={f.seed} />;
    case 'peony':
      return <Peony seed={f.seed} />;
    case 'lily':
      return <Lily seed={f.seed} pal={f.pal || 'white'} />;
    case 'lilyP':
      return <Lily seed={f.seed} pal="pink" />;
    case 'gerbera':
    case 'garbera':
      return <Gerbera seed={f.seed} />;
    case 'gompie':
      return <Gompie seed={f.seed} />;
    default:
      return <Bud />;
  }
}

/* ------------------------------------------------------------------ */
/* Daun, batang, eucalyptus                                            */
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

const quad = (p0, c, p1, t) => ({
  x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x,
  y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y,
});

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
      <path
        data-stem
        d={`M${PIVOT.x},${PIVOT.y} Q${f2(c.x)},${f2(c.y)} ${tx},${ty}`}
        pathLength="1"
        fill="none"
        stroke="#6b8f7f"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{ strokeDasharray: 1 }}
      />
      {leaves.map((l) => (
        <ellipse
          key={l.key}
          data-leaf
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
/* Kertas pembungkus + pita (lapisan depan)                             */
/* ------------------------------------------------------------------ */

const BACK_SHEET =
  'M72,336 C120,322 160,338 200,352 C240,338 280,322 328,336 L250,508 Q200,520 150,508Z';

function WrapFront({ k }) {
  const rib = `url(#g-rib-${k})`;
  return (
    <svg
      viewBox="0 0 400 540"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    >
      <path
        d="M342,350 C296,332 240,350 200,390 L212,516 C228,520 246,514 258,506 Z"
        fill={`url(#g-wrap-front-${k})`}
      />
      <path d="M200,390 L212,516" stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
      <path
        d="M280,346 C262,400 252,450 250,508"
        fill="none"
        stroke="rgba(0,0,0,.08)"
        strokeWidth="1.4"
      />
      <path
        d="M58,352 C106,334 160,352 204,394 L192,516 C176,520 158,516 146,506 Z"
        fill={`url(#g-wrap-front-${k})`}
      />
      <path d="M204,394 L192,516" stroke="rgba(0,0,0,.16)" strokeWidth="1.2" />
      <path
        d="M120,348 C150,380 170,440 176,512"
        fill="none"
        stroke="rgba(255,255,255,.38)"
        strokeWidth="1.6"
      />
      <path
        d="M96,360 C118,400 134,440 148,500"
        fill="none"
        stroke="rgba(0,0,0,.08)"
        strokeWidth="1.2"
      />

      {/* pita satin */}
      <path d="M110,436 Q200,464 292,436 L288,454 Q200,482 114,454Z" fill={rib} />
      <path d="M197,468 L170,522 L186,514 L194,526 L204,474Z" fill={rib} />
      <path d="M203,468 L230,522 L214,514 L206,526 L196,474Z" fill={rib} />
      <path d="M200,462 C170,432 128,440 140,468 C150,486 188,476 200,462Z" fill={rib} />
      <path d="M200,462 C230,432 272,440 260,468 C250,486 212,476 200,462Z" fill={rib} />
      <path
        d="M150,452 C160,444 180,448 192,458"
        fill="none"
        stroke="rgba(255,255,255,.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M250,452 C240,444 220,448 208,458"
        fill="none"
        stroke="rgba(255,255,255,.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="200" cy="466" rx="11" ry="9" fill={rib} />
      <ellipse cx="200" cy="466" rx="11" ry="9" fill="rgba(0,0,0,.28)" />
      <path
        d="M194,462 C198,459 203,459 207,462"
        fill="none"
        stroke="rgba(255,255,255,.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Satu buket                                                          */
/* ------------------------------------------------------------------ */

function Bouquet({ data, onNote, noteRef }) {
  const stackRef = useRef(null);
  const tiltRef = useRef(null);

  const geo = useMemo(
    () =>
      data.flowers.map((f, i) => {
        const c = { x: PIVOT.x + (f.x - PIVOT.x) * 0.18, y: (PIVOT.y + f.y) / 2 + 40 };
        const side = f.x > 210 ? 1 : -1;
        const p = quad(PIVOT, c, f, 0.56);
        return {
          i,
          f,
          path: `M${PIVOT.x},${PIVOT.y} Q${f2(c.x)},${f2(c.y)} ${f.x},${f.y}`,
          w: f2(2.4 + f.s * 1.1),
          leaf: f.lf
            ? { x: f2(p.x), y: f2(p.y), rot: side * (f.lf === 'blade' ? 26 : 52), k: f.lf }
            : null,
        };
      }),
    [data]
  );
  const heads = useMemo(() => [...geo].sort((a, b) => a.f.y - b.f.y), [geo]);

  // Tumbuh dan mekar saat buket masuk layar
  useLayoutEffect(() => {
    const root = stackRef.current;
    if (!root || prefersReduced()) return undefined;
    const q = (s) => root.querySelectorAll(s);
    const stems = q('[data-stem]');
    const leaves = q('[data-leaf]');
    const hs = q('[data-head]');

    leaves.forEach((el) => (el.style.opacity = 0));
    stems.forEach((el) => (el.style.strokeDashoffset = 1));
    hs.forEach((el) => (el.style.transform = 'scale(0)'));

    const anims = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        anims.push(
          animate(stems, {
            strokeDashoffset: [1, 0],
            duration: 1400,
            delay: stagger(90),
            ease: 'outCubic',
          }),
          animate(leaves, {
            opacity: [0, 1],
            duration: 700,
            delay: stagger(60, { start: 600 }),
            ease: 'outQuad',
          }),
          animate(hs, {
            scale: [0, 1],
            rotate: [-25, 0],
            duration: 1200,
            delay: stagger(120, { start: 700 }),
            ease: 'outBack',
          })
        );
      },
      { threshold: 0.25 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      anims.forEach((a) => a.revert());
      leaves.forEach((el) => (el.style.opacity = ''));
      stems.forEach((el) => (el.style.strokeDashoffset = ''));
      hs.forEach((el) => (el.style.transform = ''));
    };
  }, []);

  // Buket miring halus mengikuti kursor
  useEffect(() => {
    const el = tiltRef.current;
    if (!el || prefersReduced() || !window.matchMedia('(hover: hover)').matches) return undefined;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      el.style.transform = `perspective(1000px) rotateY(${cx * 7}deg) rotateX(${-cy * 5}deg)`;
      raf = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      kick();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, []);

  return (
    <div ref={tiltRef} className="will-change-transform">
      <div className="bq-sway">
        <div ref={stackRef} className="relative aspect-[400/540] w-full">
          {/* Belakang: kertas dalam + semua tanaman */}
          <svg
            viewBox="0 0 400 540"
            aria-hidden="true"
            focusable="false"
            className="absolute inset-0 z-0 h-full w-full"
          >
            <ellipse cx="200" cy="524" rx="104" ry="11" fill="url(#g-shadow)" />
            <path d={BACK_SHEET} fill={`url(#g-wrap-back-${data.k})`} />

            <g filter="url(#f-organic)">
              {data.euc.map((tip, i) => (
                <Euc key={i} tip={tip} />
              ))}

              {BASE_LEAVES.map((l, i) => (
                <g
                  key={i}
                  data-leaf
                  transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}
                >
                  <Leaf k={l.k} />
                </g>
              ))}

              {geo.map((g) => (
                <g key={`st${g.i}`}>
                  <path
                    data-stem
                    d={g.path}
                    pathLength="1"
                    fill="none"
                    stroke="#2f6a49"
                    strokeWidth={g.w}
                    strokeLinecap="round"
                    style={{ strokeDasharray: 1 }}
                  />
                  {g.leaf && (
                    <g
                      data-leaf
                      transform={`translate(${g.leaf.x} ${g.leaf.y}) rotate(${g.leaf.rot}) scale(0.95)`}
                    >
                      <Leaf k={g.leaf.k} />
                    </g>
                  )}
                </g>
              ))}

              {heads.map((g) => (
                <g
                  key={`hd${g.i}`}
                  transform={`translate(${g.f.x} ${g.f.y}) rotate(${g.f.r}) scale(${g.f.s})`}
                >
                  <g data-head style={{ transformOrigin: '0 0' }}>
                    <Flower f={g.f} />
                  </g>
                </g>
              ))}
            </g>
          </svg>

          {/* Secarik kertas yang terselip di buket */}
          <div
            ref={noteRef}
            className="absolute z-10 transition-opacity duration-500"
            style={{
              left: '58.5%',
              top: '53%',
              width: '14%',
              height: '14.8%',
              transform: `rotate(${NOTE_ROT}deg)`,
            }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label="Buka secarik kertas di buket ini"
              onClick={onNote}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNote(e);
                }
              }}
              className="bq-note group relative h-full w-full cursor-pointer outline-none before:absolute before:-inset-3 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300"
            >
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-focus-visible:-translate-y-2">
                <svg
                  viewBox="0 0 56 80"
                  aria-hidden="true"
                  className="h-full w-full drop-shadow-[0_6px_10px_rgba(110,60,70,0.3)]"
                >
                  <rect width="56" height="80" rx="2" fill="url(#g-note)" />
                  {[28, 38, 48, 58, 68].map((y) => (
                    <path
                      key={y}
                      d={`M8,${y} q4,-4 8,0 t8,0 t8,0 t8,0 t8,0`}
                      fill="none"
                      stroke="#7a5a45"
                      strokeOpacity="0.5"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                    />
                  ))}
                  <circle cx="41" cy="14" r="6" fill="#8e1230" />
                  <circle cx="39.5" cy="12.5" r="2" fill="rgba(255,255,255,.28)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Depan: kertas pembungkus + pita */}
          <WrapFront k={data.k} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Surat / secarik kertas                                              */
/* ------------------------------------------------------------------ */

// Tepi atas dan bawah kertas dirobek sedikit
const tornClip = (seed) => {
  const r = mulberry(seed);
  const N = 48;
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(`${((i / N) * 100).toFixed(2)}% ${(r() * 6).toFixed(1)}px`);
  for (let i = N; i >= 0; i--)
    pts.push(`${((i / N) * 100).toFixed(2)}% calc(100% - ${(r() * 6).toFixed(1)}px)`);
  return `polygon(${pts.join(',')})`;
};

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45 0 0 0 0 .33 0 0 0 0 .2 0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const PAPER_BG = `${NOISE}, linear-gradient(160deg, #f8eed9, #eddcbc)`;
const RULES =
  'linear-gradient(to bottom, transparent 39px, rgba(120,92,70,.2) 39px, rgba(120,92,70,.2) 40px)';

function Reveal({ rootRef, className = '', children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => prefersReduced());

  useEffect(() => {
    if (shown) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { root: rootRef.current, threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, rootRef]);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-1000 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Semua baris pakai tinggi 40px biar pas dengan garis buku
function Entry({ text, rootRef }) {
  let node;
  if (text === '---') {
    node = <div className="flex h-[40px] items-center justify-center text-[#9b7b62]">· · ·</div>;
  } else if (text.startsWith('# ')) {
    node = (
      <h4 style={{ fontFamily: TITLE_FONT, lineHeight: '40px' }} className="text-[36px]">
        {text.slice(2)}
      </h4>
    );
  } else if (text.startsWith('~ ')) {
    node = (
      <p
        style={{ fontFamily: TITLE_FONT, lineHeight: '40px' }}
        className="text-right text-[34px]"
      >
        {text.slice(2)}
      </p>
    );
  } else {
    node = (
      <p
        style={{ lineHeight: '40px', textIndent: '1.6em' }}
        className="whitespace-pre-line text-[20px] md:text-[21px]"
      >
        {text}
      </p>
    );
  }
  return (
    <Reveal rootRef={rootRef} className="pb-[40px]">
      {node}
    </Reveal>
  );
}

function Letter({ letter, originEl, onClose }) {
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const foldRef = useRef(null);
  const scrollRef = useRef(null);
  const closeRef = useRef(null);
  const closing = useRef(false);
  const [hint, setHint] = useState(false);
  const reduced = useMemo(() => prefersReduced(), []);
  const torn = useMemo(() => tornClip(7), []);

  // Posisi & ukuran secarik kertas di buket, relatif ke posisi akhir kartu di tengah layar
  const calc = useCallback(() => {
    const card = cardRef.current;
    const o = originEl.getBoundingClientRect();
    const cx = document.documentElement.clientWidth / 2;
    const cy = window.innerHeight / 2;
    return {
      dx: o.left + o.width / 2 - cx,
      dy: o.top + o.height / 2 - cy,
      s: Math.min(0.5, o.width / card.offsetWidth),
    };
  }, [originEl]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const finish = () => {
      originEl.style.opacity = '';
      onClose();
    };
    if (prefersReduced()) {
      finish();
      return;
    }
    const { dx, dy, s } = calc();
    animate(cardRef.current, {
      translateX: dx,
      translateY: dy,
      scale: s,
      rotate: NOTE_ROT,
      duration: 650,
      ease: 'inCubic',
    });
    animate(foldRef.current, {
      clipPath: 'inset(0% 0% 86% 0% round 4px)',
      duration: 520,
      ease: 'inCubic',
    });
    animate(cardRef.current, { opacity: 0, duration: 160, delay: 500, onComplete: finish });
    animate(backdropRef.current, { opacity: 0, duration: 500, ease: 'outQuad' });
  }, [calc, onClose, originEl]);

  // Kertas keluar dari buket, terbang ke tengah, lalu terbuka ke bawah
  useLayoutEffect(() => {
    originEl.style.opacity = '0';
    if (reduced) {
      return () => {
        originEl.style.opacity = '';
      };
    }
    const { dx, dy, s } = calc();
    const list = [
      animate(backdropRef.current, { opacity: [0, 1], duration: 500, ease: 'outQuad' }),
      animate(cardRef.current, {
        translateX: [dx, 0],
        translateY: [dy, 0],
        scale: [s, 1],
        rotate: [NOTE_ROT, 0],
        duration: 1100,
        ease: 'outExpo',
      }),
      animate(cardRef.current, { opacity: [0, 1], duration: 160 }),
      animate(foldRef.current, {
        clipPath: ['inset(0% 0% 86% 0% round 4px)', 'inset(0% 0% 0% 0% round 4px)'],
        duration: 950,
        delay: 220,
        ease: 'outCubic',
      }),
    ];
    return () => {
      list.forEach((a) => a.revert());
      originEl.style.opacity = '';
    };
  }, [calc, originEl, reduced]);

  // Kunci scroll halaman, Esc, fokus tetap di surat
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = cardRef.current?.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if (!nodes || !nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setHint(max > 12 && el.scrollTop < max - 24);
  }, []);

  useEffect(() => {
    measure();
    const t = setTimeout(measure, 1200);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={diaryTitle}
      className="fixed inset-0 z-[85] flex items-center justify-center p-3 md:p-8"
    >
      <div
        ref={backdropRef}
        onClick={close}
        style={{ opacity: reduced ? 1 : 0 }}
        className="absolute inset-0 bg-[#f4e6e1]/80 backdrop-blur-md"
      />

      <div
        ref={cardRef}
        style={{
          opacity: reduced ? 1 : 0,
          filter: 'drop-shadow(0 24px 40px rgba(120,70,80,0.35))',
        }}
        className="relative flex max-h-[min(88svh,780px)] w-full max-w-[520px] flex-col will-change-transform"
      >
        <div
          ref={foldRef}
          className="flex min-h-0 flex-1 flex-col"
          style={reduced ? undefined : { clipPath: 'inset(0% 0% 86% 0% round 4px)' }}
        >
          <div
            className="relative flex min-h-0 flex-1 flex-col"
            style={{ clipPath: torn, background: PAPER_BG }}
          >
            {/* garis margin buku */}
            <div className="pointer-events-none absolute inset-y-0 left-[38px] w-px bg-[rgba(176,72,84,0.38)] md:left-[54px]" />

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#7a5c48] transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a35a64]"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              ref={scrollRef}
              onScroll={measure}
              tabIndex={0}
              aria-label="Isi surat"
              style={{
                fontFamily: BODY_FONT,
                color: INK,
                textShadow: '0 0 0.5px rgba(58,42,34,.55)',
                backgroundImage: RULES,
                backgroundSize: '100% 40px',
                backgroundAttachment: 'local',
              }}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[80px] pl-[52px] pr-8 outline-none [scrollbar-color:rgba(120,92,70,0.45)_transparent] [scrollbar-width:thin] md:pl-[72px] md:pr-10 [&::-webkit-scrollbar-thumb]:bg-[rgba(120,92,70,0.4)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
            >
              {/* Judul paling atas */}
              <div className="-ml-[14px] flex h-[160px] flex-col items-center justify-center md:-ml-[18px]">
                <h3
                  style={{ fontFamily: TITLE_FONT }}
                  className="text-[58px] leading-[1.2] md:text-[64px]"
                >
                  {diaryTitle}
                </h3>
                {letter.date && (
                  <p className="text-[18px] leading-[40px] text-[#7a5c48]">{letter.date}</p>
                )}
              </div>

              {letter.paragraphs.map((text, i) => (
                <Entry key={i} text={text} rootRef={scrollRef} />
              ))}
            </div>

            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-20 items-end justify-center bg-gradient-to-t from-[#eddcbc] via-[#eddcbc]/80 to-transparent pb-3 text-[#7a5c48] transition-opacity duration-500 ${
                hint ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section: tiga buket yang bisa di-slide                              */
/* ------------------------------------------------------------------ */

const CSS = `
@keyframes bq-sway { from { transform: rotate(-1deg); } to { transform: rotate(1deg); } }
.bq-sway { transform-origin: 50% 92%; animation: bq-sway 5.5s ease-in-out infinite alternate; }
@keyframes bq-peek { from { transform: translateY(0); } to { transform: translateY(-5px); } }
.bq-note { animation: bq-peek 2.2s ease-in-out infinite alternate; }

.bq-lace-top, .bq-lace-bot {
  position: absolute; left: 0; right: 0; height: 22px; pointer-events: none;
  background: radial-gradient(circle at 11px 0, #fffaf3 10px, transparent 10.5px) 0 0 / 22px 22px repeat-x;
}
.bq-lace-top { top: 0; }
.bq-lace-bot { bottom: 0; transform: scaleY(-1); }
.bq-pearls {
  position: absolute; left: 0; right: 0; height: 6px; pointer-events: none; opacity: .9;
  background: radial-gradient(circle at 50% 50%, #fff 0 2px, #e9d9d6 2.6px, transparent 3.2px) 0 0 / 14px 6px repeat-x;
}
@keyframes bq-twinkle { from { opacity: .25; transform: scale(.85); } to { opacity: .9; transform: scale(1.1); } }
.bq-spark { position: absolute; color: #e8a9ba; pointer-events: none; animation: bq-twinkle 2.8s ease-in-out infinite alternate; }

@media (prefers-reduced-motion: reduce) { .bq-sway, .bq-note, .bq-spark { animation: none; } }
`;

export default function ReasonScene() {
  const scrollerRef = useRef(null);
  const slideRefs = useRef([]);
  const noteRefs = useRef([]);
  const rafRef = useRef(0);
  const activeRef = useRef(0);
  const drag = useRef({ moved: false });
  const lastFocus = useRef(null);
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState(null);

  // Muat font surat
  useEffect(() => {
    if (document.getElementById('bq-fonts')) return;
    const l = document.createElement('link');
    l.id = 'bq-fonts';
    l.rel = 'stylesheet';
    l.href = FONT_HREF;
    document.head.appendChild(l);
  }, []);

  // Slide tengah membesar, yang di samping mengecil dan redup
  const update = useCallback(() => {
    rafRef.current = 0;
    const el = scrollerRef.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bd = Infinity;
    slideRefs.current.forEach((s, i) => {
      if (!s) return;
      const c = s.offsetLeft + s.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < bd) {
        bd = d;
        best = i;
      }
      const t = clamp(d / (s.offsetWidth * 1.1), 0, 1);
      const inner = s.firstElementChild;
      inner.style.transform = `scale(${mix(1, 0.74, t)})`;
      inner.style.opacity = mix(1, 0.38, t);
    });
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, []);

  const onScroll = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
  }, [update]);

  useLayoutEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  const goTo = useCallback((i) => {
    const el = scrollerRef.current;
    const s = slideRefs.current[clamp(i, 0, BOUQUETS.length - 1)];
    if (!el || !s) return;
    el.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - el.clientWidth / 2, behavior: 'smooth' });
  }, []);

  // Geser pakai mouse (sentuhan dan trackpad sudah native)
  const onDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = scrollerRef.current;
    const start = { x: e.clientX, left: el.scrollLeft };
    drag.current.moved = false;

    const move = (ev) => {
      const dx = ev.clientX - start.x;
      if (!drag.current.moved && Math.abs(dx) > 5) {
        drag.current.moved = true;
        el.style.scrollSnapType = 'none';
        el.style.cursor = 'grabbing';
      }
      if (drag.current.moved) el.scrollLeft = start.left - dx;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.style.cursor = '';
      if (drag.current.moved) {
        goTo(activeRef.current);
        el.style.scrollSnapType = '';
        setTimeout(() => {
          drag.current.moved = false;
        }, 0);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const openNote = (i) => {
    if (drag.current.moved) return;
    playPop();
    playChime();
    lastFocus.current = document.activeElement;
    setOpenIdx(i);
  };

  const handleClose = useCallback(() => {
    setOpenIdx(null);
    lastFocus.current?.focus?.({ preventScroll: true });
  }, []);

  return (
    <section
      id="photos"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#f6efe6] py-16"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 60% 52% at 50% 48%, rgba(247,201,214,0.6), transparent 72%),
          radial-gradient(ellipse 40% 30% at 12% 12%, rgba(255,255,255,0.9), transparent 70%),
          radial-gradient(ellipse 40% 30% at 88% 90%, rgba(255,236,230,0.9), transparent 70%)`,
      }}
    >
      <style>{CSS}</style>
      <SharedDefs />

      {/* renda + mutiara */}
      <div className="bq-lace-top" />
      <div className="bq-pearls" style={{ top: 26 }} />
      <div className="bq-lace-bot" />
      <div className="bq-pearls" style={{ bottom: 26 }} />

      {/* kilau kecil */}
      <span className="bq-spark" style={{ top: '14%', left: '10%', fontSize: 18 }}>✦</span>
      <span className="bq-spark" style={{ top: '22%', right: '12%', fontSize: 12, animationDelay: '.8s' }}>✧</span>
      <span className="bq-spark" style={{ bottom: '20%', left: '14%', fontSize: 13, animationDelay: '1.4s' }}>✧</span>
      <span className="bq-spark" style={{ bottom: '16%', right: '9%', fontSize: 18, animationDelay: '.4s' }}>✦</span>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        onPointerDown={onDown}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(activeRef.current + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(activeRef.current - 1);
          }
        }}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Buket bunga"
        style={{ '--sw': 'min(80vw, 440px, calc((100svh - 150px) * 0.74))' }}
        className="relative flex w-full cursor-grab select-none snap-x snap-mandatory items-center gap-6 overflow-x-auto px-[calc(50%-var(--sw)/2)] py-6 outline-none [scrollbar-width:none] md:gap-10 [&::-webkit-scrollbar]:hidden"
      >
        {BOUQUETS.map((b, i) => (
          <div
            key={b.id}
            ref={(el) => (slideRefs.current[i] = el)}
            className="w-[var(--sw)] flex-none snap-center"
            // Klik buket di samping = geser ke buket itu dulu
            onClickCapture={(e) => {
              if (i !== activeRef.current && !drag.current.moved) {
                e.stopPropagation();
                goTo(i);
              }
            }}
          >
            <div className="will-change-transform" style={{ transformOrigin: '50% 70%' }}>
              <Bouquet
                data={b}
                noteRef={(el) => (noteRefs.current[i] = el)}
                onNote={() => openNote(i)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tombol geser buket kiri & kanan */}
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        disabled={active <= 0}
        aria-label="Buket sebelumnya"
        className="absolute left-2.5 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e3d8c6] bg-[#faf6ee]/90 text-[#800020] shadow-md backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-20 sm:left-4 md:left-8 md:h-12 md:w-12"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <button
        type="button"
        onClick={() => goTo(active + 1)}
        disabled={active >= BOUQUETS.length - 1}
        aria-label="Buket berikutnya"
        className="absolute right-2.5 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e3d8c6] bg-[#faf6ee]/90 text-[#800020] shadow-md backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-20 sm:right-4 md:right-8 md:h-12 md:w-12"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Indikator titik buket yang bisa diklik */}
      <div className="relative z-20 mt-3 flex items-center justify-center gap-2">
        {BOUQUETS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Buket ${i + 1}`}
            className={`h-2 cursor-pointer rounded-full transition-all duration-500 ${
              i === active ? 'w-8 bg-[#800020]' : 'w-2 bg-[#d9cdb8] hover:bg-[#800020]/40'
            }`}
          />
        ))}
      </div>

      {openIdx !== null &&
        createPortal(
          <Letter
            letter={bouquetLetters[openIdx] ?? bouquetLetters[0]}
            originEl={noteRefs.current[openIdx]}
            onClose={handleClose}
          />,
          document.body
        )}
    </section>
  );
}