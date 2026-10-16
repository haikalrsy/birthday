import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react';
import { BOOK_DATA } from '../../data/bookContent';
import { playPop, playChime } from '../../utils/sound';
import { getBouquetUrl } from './BouquetArt';
const coverImg = '/photos/cover.png';


/* ------------------------------------------------------------------
   PENGATURAN
   - Cover: src/assets/images/cover.png (di-import di atas).
   - Gambar kotak di halaman teks: isi field `pageImage` di bab
     (lihat TextPage) -> { src, caption, at: 'first' | 'last' }
------------------------------------------------------------------- */
const BOOK_TITLE = 'Sebuah Pengarsipan atas Dirimu';
const AUTHOR = 'Haikal';
const COVER_SRC = coverImg;

const CAPTIONS = [
  // 'untuk Aneska',
  // 'sebuah taman kecil',
  // 'yang tak pernah layu',
  // 'dari Haikal',
  // 'selalu pulang padamu',
  // 'arsip yang wangi',
  // 'satu tangkai lagi',
  // 'kita, di antara bunga',
];

/* Proporsi halaman = proporsi gambar cover (5:8) */
const PW = 344;
const PH = 550;
const OVERHANG = 7;
const PAD = 12; // ruang aman kiri/kanan buku biar bayangan & papan sampul nggak kepotong
const EASE = [0.645, 0.045, 0.355, 1];

const F_BODY = "'Newsreader', 'EB Garamond', Georgia, serif";
const F_DISPLAY = "'Instrument Serif', Georgia, serif";

const PAPER_IMG = 'public/photos/bg.png';
const PAPER = '#fdf6f2';
const INK = '#2e1a20'; // lebih gelap
const SAGE = '#e3a3b4'; // pink muda (garis, bingkai, pembatas)
const SAGE_DARK = '#7d3a4f'; // rose tua (judul), lebih gelap
const ROSE = '#d17f95';
const ROSE_DEEP = '#8f3d57'; // lebih gelap
const LEAF = '#9db296'; // hijau cuma buat daun
const LEAF_DARK = '#5f7559';
const CLOTH = 'linear-gradient(145deg, #f6d0da 0%, #ecaebd 55%, #dc93a6 100%)';

const faceBase = {
  position: 'absolute',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
};

const PAPER_VEIL = 0.81; // naik dari 0.79

const paperTexture = {
  backgroundColor: PAPER,
  backgroundImage: `
    radial-gradient(circle at 15% 10%, rgba(255,255,255,0.45), transparent 85%),
    linear-gradient(rgba(255,244,247,${PAPER_VEIL}), rgba(255,244,247,${PAPER_VEIL})),
    url("${PAPER_IMG}")
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

function toRoman(num) {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let r = '';
  for (const [v, s] of map) while (num >= v) { r += s; num -= v; }
  return r;
}

/** Potong paragraf-paragraf jadi halaman-halaman novel (per kalimat) */
function paginate(paras, budget = 600) {
  const pages = [];
  let cur = [];
  let used = 0;
  const flush = () => {
    if (cur.length) pages.push(cur);
    cur = [];
    used = 0;
  };
  paras.forEach((para) => {
    const sentences = (para.match(/[^.!?…]+(?:[.!?…]+["”’')\]]*)\s*|[^.!?…]+$/g) || [para])
      .map((s) => s.trim())
      .filter(Boolean);
    let chunk = '';
    let cont = false;
    const pushChunk = () => {
      if (chunk) {
        cur.push({ text: chunk, cont });
        chunk = '';
        cont = true;
      }
    };
    sentences.forEach((s) => {
      let extra = s.length + (chunk ? 1 : cont ? 0 : 50);
      if (used + extra > budget && (cur.length || chunk)) {
        pushChunk();
        flush();
        extra = s.length;
      }
      chunk = chunk ? `${chunk} ${s}` : s;
      used += extra;
    });
    pushChunk();
  });
  flush();
  return pages;
}

/* ==================================================================
   ORNAMEN COQUETTE (SVG / CSS)
================================================================== */

function LilyBloom() {
  const petal = 'M0 0 C 12 -16 17 -44 0 -70 C -17 -44 -12 -16 0 0Z';
  const stamens = [-38, -22, -8, 8, 22, 38];
  return (
    <g>
      {[0, 120, 240].map((a) => (
        <g key={`o${a}`} transform={`rotate(${a})`}>
          <path d={petal} fill="url(#lilyPetal)" stroke={LEAF_DARK} strokeOpacity="0.55" strokeWidth="0.8" />
          <path d="M0 -6 L0 -58" stroke={ROSE} strokeOpacity="0.45" strokeWidth="0.6" />
        </g>
      ))}
      {[60, 180, 300].map((a) => (
        <g key={`i${a}`} transform={`rotate(${a}) scale(0.92)`}>
          <path d={petal} fill="url(#lilyPetal)" stroke={LEAF_DARK} strokeOpacity="0.55" strokeWidth="0.8" />
          <path d="M0 -6 L0 -58" stroke={ROSE} strokeOpacity="0.45" strokeWidth="0.6" />
        </g>
      ))}
      {stamens.map((a) => (
        <g key={`s${a}`} transform={`rotate(${a})`}>
          <path d="M0 0 L0 -30" stroke={LEAF_DARK} strokeOpacity="0.6" strokeWidth="0.7" />
          <ellipse cx="0" cy="-32" rx="2" ry="4.4" fill="#d1a867" fillOpacity="0.85" />
        </g>
      ))}
    </g>
  );
}

function LilySprig({ className, style }) {
  return (
    <svg viewBox="0 0 120 230" className={className} style={style} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lilyPetal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-70">
          <stop offset="0" stopColor="#e6ecc4" />
          <stop offset="0.28" stopColor="#fffdf8" />
          <stop offset="1" stopColor="#fbe7ec" />
        </linearGradient>
      </defs>
      <path d="M60 228 C 56 190 66 140 60 94" stroke={LEAF_DARK} strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M60 204 C 38 194 22 172 20 142 C 38 152 56 176 60 204Z" fill={LEAF} fillOpacity="0.28" stroke={LEAF_DARK} strokeOpacity="0.6" strokeWidth="0.9" />
      <path d="M62 178 C 84 171 98 153 102 128 C 84 136 68 152 62 178Z" fill={LEAF} fillOpacity="0.28" stroke={LEAF_DARK} strokeOpacity="0.6" strokeWidth="0.9" />
      <path d="M63 150 C 78 140 90 122 90 96" stroke={LEAF_DARK} strokeOpacity="0.65" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M90 98 C 80 84 82 58 90 42 C 98 58 100 84 90 98Z" fill="#fbf1f2" stroke={LEAF_DARK} strokeOpacity="0.55" strokeWidth="0.9" />
      <g transform="translate(60 80) rotate(-10) scale(0.62 0.5)">
        <LilyBloom />
      </g>
    </svg>
  );
}

/** Pita satin */
function Bow({ className, style }) {
  return (
    <svg viewBox="0 0 120 84" className={className} style={style} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bowSatin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d3db" />
          <stop offset="0.55" stopColor="#e8a9b8" />
          <stop offset="1" stopColor="#d58a9d" />
        </linearGradient>
      </defs>
      <path d="M58 44 L36 78 L49 72 L54 83 L65 50Z" fill="url(#bowSatin)" stroke={ROSE_DEEP} strokeOpacity="0.45" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M62 44 L84 78 L71 72 L66 83 L55 50Z" fill="url(#bowSatin)" stroke={ROSE_DEEP} strokeOpacity="0.45" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M60 42 C 40 8 6 6 8 36 C 10 64 40 66 60 42Z" fill="url(#bowSatin)" stroke={ROSE_DEEP} strokeOpacity="0.5" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M60 42 C 80 8 114 6 112 36 C 110 64 80 66 60 42Z" fill="url(#bowSatin)" stroke={ROSE_DEEP} strokeOpacity="0.5" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M54 40 C 40 22 22 20 18 34" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M66 40 C 80 22 98 20 102 34" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="60" cy="42" rx="9" ry="10.5" fill="url(#bowSatin)" stroke={ROSE_DEEP} strokeOpacity="0.55" strokeWidth="0.9" />
      <path d="M55 38 C 58 36 62 36 65 38" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function Pearl({ size = 5, style, className = '' }) {
  return (
    <span
      className={`block rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 35% 30%, #fff, #eadfd0 70%, #d4c5ae)',
        boxShadow: '0 0 0 0.5px rgba(150,130,100,0.35)',
        ...style,
      }}
    />
  );
}

function PearlDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="h-px w-10" style={{ background: `${SAGE}88` }} />
      <span className="flex items-center gap-[5px]">
        <Pearl size={4} />
        <span style={{ color: ROSE, fontSize: 11, lineHeight: 1 }}>♡</span>
        <Pearl size={4} />
      </span>
      <span className="h-px w-10" style={{ background: `${SAGE}88` }} />
    </div>
  );
}

/** Renda scallop + untaian mutiara di tepi bawah halaman */
function PageTrim() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[9px] h-[6px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, #fff 0 1.5px, #e3d6c6 2.1px, transparent 2.7px) 0 0 / 12px 6px repeat-x',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[8px]"
        style={{ background: `radial-gradient(circle at 8px 100%, transparent 6.4px, ${SAGE}3a 6.9px) 0 0 / 16px 8px repeat-x` }}
      />
    </>
  );
}

function Sparkle({ children = '✦', style }) {
  return (
    <span className="ps-spark" style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      {children}
    </span>
  );
}

const gutterLeftPage = (
  <div
    className="pointer-events-none absolute right-0 top-0 h-full w-14"
    style={{ background: 'linear-gradient(270deg, rgba(110,60,70,0.2) 0%, rgba(110,60,70,0.06) 55%, transparent 100%)' }}
  />
);
const gutterRightPage = (
  <div
    className="pointer-events-none absolute left-0 top-0 h-full w-14"
    style={{ background: 'linear-gradient(90deg, rgba(110,60,70,0.2) 0%, rgba(110,60,70,0.06) 55%, transparent 100%)' }}
  />
);
function Gutter({ side }) {
  return side === 'left' ? gutterLeftPage : gutterRightPage;
}

/** Bingkai foto persegi: putih, pita di atas, mutiara di sudut */
function PhotoFrame({ src, alt, caption, w = 150, h = 180 }) {
  return (
    <figure className="relative flex flex-col items-center">
      <div
        className="relative"
        style={{
          padding: 8,
          background: '#fffdf8',
          border: `1px solid ${ROSE}55`,
          borderRadius: 3,
          boxShadow: '0 8px 18px -8px rgba(130,60,85,0.42)',
          transform: 'rotate(-1deg)',
        }}
      >
        <Bow className="absolute left-1/2 z-10 w-[46px] -translate-x-1/2" style={{ top: -17, filter: 'drop-shadow(0 2px 2px rgba(120,60,75,0.25))' }} />
        {[
          { left: 3, top: 3 },
          { right: 3, top: 3 },
          { left: 3, bottom: 3 },
          { right: 3, bottom: 3 },
        ].map((pos, i) => (
          <Pearl key={i} size={4} style={{ position: 'absolute', ...pos }} />
        ))}
        <div className="overflow-hidden" style={{ width: w, height: h, borderRadius: 2, border: `1px solid ${INK}22` }}>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full select-none object-cover"
            style={{ filter: 'saturate(0.94) contrast(1.02)' }}
            draggable={false}
          />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2.5 max-w-[210px] text-center text-[10.5px] italic leading-snug" style={{ fontFamily: F_BODY, color: `${INK}99` }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ==================================================================
   HALAMAN
================================================================== */

/** Halaman buket penuh (hiasan) */
function PlatePage({ n, side }) {
  return (
    <div className="relative h-full w-full" style={paperTexture}>
      <div className="pointer-events-none absolute" style={{ inset: 14, border: `1px solid ${SAGE}55`, borderRadius: 3 }} />
      {[
        { left: 10, top: 10 },
        { right: 10, top: 10 },
        { left: 10, bottom: 22 },
        { right: 10, bottom: 22 },
      ].map((pos, i) => (
        <Pearl key={i} size={5} style={{ position: 'absolute', ...pos }} />
      ))}
      <div className="relative flex h-full flex-col items-center px-9 pb-9 pt-8">
        <Bow className="w-9" />
        <img src={getBouquetUrl(n % 8)} alt="" className="mt-1 w-full max-w-[252px] select-none" draggable={false} />
        <p className="mt-auto text-[22px] italic" style={{ fontFamily: F_DISPLAY, color: ROSE_DEEP }}>
          {CAPTIONS[n % CAPTIONS.length]}
        </p>
        <PearlDivider className="mt-2" />
      </div>
      <Sparkle style={{ left: 34, top: 120, fontSize: 13, color: '#e8a9ba' }}>✦</Sparkle>
      <Sparkle style={{ right: 36, top: 170, fontSize: 11, color: SAGE, animationDelay: '.9s' }}>✧</Sparkle>
      <Sparkle style={{ left: 40, top: 330, fontSize: 11, color: SAGE, animationDelay: '1.5s' }}>✧</Sparkle>
      <Sparkle style={{ right: 32, top: 90, fontSize: 14, color: '#e8a9ba', animationDelay: '.4s' }}>✦</Sparkle>
      <PageTrim />
      <Gutter side={side} />
    </div>
  );
}

/** Halaman judul (kanan, setelah cover) */
function TitlePage({ side }) {
  return (
    <div className="relative h-full w-full" style={paperTexture}>
      <div className="pointer-events-none absolute" style={{ inset: 14, border: `1px solid ${SAGE}55`, borderRadius: 3 }} />
      <div className="relative flex h-full flex-col items-center px-10 pb-9 pt-10 text-center">
        <Bow className="w-11" />
        <span className="mt-2 text-[9px] uppercase tracking-[0.42em]" style={{ fontFamily: F_BODY, color: ROSE_DEEP }}>
          sebuah arsip
        </span>
        <h2 className="mt-3 text-[32px] font-normal italic leading-[1.1]" style={{ fontFamily: F_DISPLAY, color: SAGE_DARK }}>
          {BOOK_TITLE}
        </h2>
        <PearlDivider className="my-3" />
        <p className="text-[11px] uppercase tracking-[0.5em]" style={{ fontFamily: F_BODY, color: SAGE_DARK }}>
          {AUTHOR}
        </p>
        <img src={getBouquetUrl(2)} alt="" className="mt-auto w-[170px] select-none" draggable={false} />
      </div>
      <PageTrim />
      <Gutter side={side} />
    </div>
  );
}

/** Pembuka bab (kiri): judul, epigraf, foto persegi */
function OpenerPage({ ch, ci, side }) {
  const label = ci === 0 ? 'Pembuka' : `Bab ${toRoman(ci)}`;
  return (
    <div className="relative h-full w-full" style={paperTexture}>
      <div className="pointer-events-none absolute" style={{ inset: 12, border: `1px solid ${SAGE}40`, borderRadius: 3 }} />
      <div className="relative flex h-full flex-col items-center px-9 pb-8 pt-8 text-center">
        <Bow className="mb-1.5 w-9" />
        <span className="text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: F_BODY, color: ROSE_DEEP }}>
          {label}
        </span>
        <h3 className="mt-2.5 text-[31px] font-normal italic leading-[1.08]" style={{ fontFamily: F_DISPLAY, color: SAGE_DARK }}>
          {ch.title}
        </h3>
        {ch.subtitle && (
          <p className="mt-1.5 text-[12px] font-light italic" style={{ fontFamily: F_BODY, color: `${INK}99` }}>
            {ch.subtitle}
          </p>
        )}
        <PearlDivider className="my-3" />
        {ch.quote && (
          <p className="line-clamp-3 max-w-[236px] text-[12.5px] italic leading-relaxed" style={{ fontFamily: F_DISPLAY, color: ROSE_DEEP }}>
            {ch.quote}
          </p>
        )}
        {ch.photo && (
          <div className="mt-auto pt-4">
            <PhotoFrame src={ch.photo} alt={ch.title} caption={ch.photoCaption} w={146} h={172} />
          </div>
        )}
      </div>
      <PageTrim />
      <Gutter side={side} />
    </div>
  );
}

/** Halaman isi cerita */
function TextPage({ page, ch, side, no }) {
  const dropCap =
    'first-letter:float-left first-letter:mr-1.5 first-letter:mt-1 first-letter:text-[44px] first-letter:leading-[0.8] first-letter:text-[#8f4a5d]';

  // gambar kotak di bawah teks (opsional, diatur lewat ch.pageImage)
  const img = ch.pageImage;
  const showImg = img && (img.at === 'last' ? page.last : page.first);

  return (
    <div className="relative h-full w-full" style={paperTexture}>
      <LilySprig
        className="pointer-events-none absolute bottom-5 w-[42px]"
        style={{
          opacity: 0.15,
          [side === 'left' ? 'left' : 'right']: 8,
          transform: side === 'left' ? 'rotate(-6deg)' : 'scaleX(-1) rotate(-6deg)',
        }}
      />
      <div
        className="relative flex h-full flex-col"
        style={{ padding: side === 'left' ? '28px 28px 30px 36px' : '28px 36px 30px 28px' }}
      >
        <div className="truncate text-center text-[9px] uppercase tracking-[0.32em]" style={{ fontFamily: F_BODY, color: `${SAGE_DARK}b0` }}>
          {side === 'left' ? AUTHOR : ch.title}
        </div>
        <div className="mx-auto mt-2 flex items-center gap-1.5">
          <span className="h-px w-6" style={{ background: `${SAGE}88` }} />
          <Pearl size={4} />
          <span className="h-px w-6" style={{ background: `${SAGE}88` }} />
        </div>

        <div
          lang="id"
          className="ps-scroll mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto"
          style={{
            fontFamily: F_BODY,
            color: INK,
            fontSize: 13.5,
            lineHeight: 1.7,
            textAlign: 'justify',
            textAlignLast: 'left',
            hyphens: 'auto',
            WebkitHyphens: 'auto',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
          }}
        >
          {page.chunk.map((c, i) => {
            const isDrop = page.first && i === 0;
            return (
              <p key={i} className={isDrop ? dropCap : ''} style={{ margin: 0, textIndent: isDrop || c.cont ? 0 : '1.4em' }}>
                {c.text}
              </p>
            );
          })}
          {page.last && ch.signature && (
            <p className="mt-3 text-right italic" style={{ fontFamily: F_DISPLAY, color: ROSE_DEEP, fontSize: 15 }}>
              {ch.signature}
            </p>
          )}

          {showImg && (
            <div className="mt-5 flex shrink-0 justify-center pb-2">
              <figure className="w-full max-w-[220px]">
                <img
                  src={img.src}
                  alt={img.caption || ch.title}
                  className="block aspect-square w-full object-cover"
                  draggable={false}
                />
                {img.caption && (
                  <figcaption
                    className="mt-2 text-center text-xs italic"
                    style={{
                      fontFamily: F_BODY,
                      color: `${INK}99`,
                    }}
                  >
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            </div>
          )}
        </div>

        <div className="mt-2 text-center text-[11px]" style={{ fontFamily: F_BODY, color: `${INK}80` }}>
          · {no} ·
        </div>
      </div>
      <PageTrim />
      <Gutter side={side} />
    </div>
  );
}

/** Halaman penutup */
function EndPage({ side }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-10 text-center" style={paperTexture}>
      <div className="pointer-events-none absolute" style={{ inset: 14, border: `1px solid ${SAGE}55`, borderRadius: 3 }} />
      <img src={getBouquetUrl(3)} alt="" className="w-[170px] select-none" draggable={false} />
      <p className="mt-1 text-[34px] italic" style={{ fontFamily: F_DISPLAY, color: SAGE_DARK }}>
        Bersambung…
      </p>
      <PearlDivider className="my-3" />
      <p className="max-w-[220px] text-[13px] font-light italic leading-relaxed" style={{ fontFamily: F_BODY, color: `${INK}a6` }}>
        Kisah ini belum selesai, karena ceritanya masih terus ditulis.
      </p>
      <p className="mt-5 text-sm italic" style={{ fontFamily: F_DISPLAY, color: ROSE_DEEP }}>
        — {AUTHOR}
      </p>
      <PageTrim />
      <Gutter side={side} />
    </div>
  );
}

/** Sampul depan: memakai gambar cover buatanmu */
function CoverFront({ src, hover }) {
  const [bad, setBad] = useState(false);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[3px]" style={{ background: '#f6d3db' }}>
      {src && !bad ? (
        <img
          src={src}
          alt={BOOK_TITLE}
          onError={() => setBad(true)}
          className="absolute inset-0 h-full w-full select-none object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          style={{ background: 'linear-gradient(160deg, #fdeff2 0%, #f6d3db 55%, #e8a9b8 100%)' }}
        >
          <div className="pointer-events-none absolute" style={{ inset: 16, border: `1px solid ${ROSE}66`, borderRadius: 3 }} />
          <Bow className="w-14" />
          <p className="mt-4 text-[34px] italic leading-tight" style={{ fontFamily: F_DISPLAY, color: ROSE_DEEP }}>
            {BOOK_TITLE}
          </p>
          <PearlDivider className="my-4" />
          <p className="text-[11px] uppercase tracking-[0.5em]" style={{ fontFamily: F_BODY, color: SAGE_DARK }}>
            {AUTHOR}
          </p>
          <p className="mt-10 text-[10px]" style={{ color: `${ROSE_DEEP}99` }}>
            (taruh gambar cover di src/assets/images/cover.png)
          </p>
        </div>
      )}
      {/* bayangan lipatan punggung buku */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 w-[30px]"
        style={{ background: 'linear-gradient(90deg, rgba(90,50,60,0.28) 0%, rgba(90,50,60,0.08) 60%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 top-0 w-[2.5px]"
        style={{ left: 20, background: 'linear-gradient(90deg, rgba(90,50,60,0.25), rgba(255,255,255,0.4))' }}
      />
      {/* kilau */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(115deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 45%, rgba(120,60,75,0.1) 100%)',
          opacity: hover ? 1 : 0.5,
        }}
      />
    </div>
  );
}

function InsideCover({ children }) {
  return (
    <div className="relative h-full w-full" style={{ background: CLOTH }}>
      <div className="absolute overflow-hidden" style={{ top: OVERHANG, bottom: OVERHANG, left: OVERHANG, right: 0, background: PAPER }}>
        {children}
      </div>
    </div>
  );
}

/* ==================================================================
   LEMBAR (LEAF)
================================================================== */
function Leaf({ index, angle, z, front, back, isCover, onForward, onBackward, onSettled, isVisible = true }) {
  const rot = useMotionValue(0);

  useEffect(() => {
    const controls = animate(rot, angle, {
      duration: 1.05,
      ease: EASE,
      onComplete: () => onSettled(index),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle]);

  const frontShade = useTransform(rot, [0, -90], [0, 0.38]);
  const backShade = useTransform(rot, [-90, -180], [0.38, 0]);

  const faceRect = isCover
    ? { top: -OVERHANG, bottom: -OVERHANG, left: 0, right: -OVERHANG }
    : { top: 0, bottom: 0, left: 0, right: 0 };

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: PW,
        width: PW,
        height: PH,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        rotateY: rot,
        zIndex: z,
      }}
    >
      <div
        style={{
          ...faceBase,
          ...faceRect,
          ...(isCover ? {} : paperTexture),
          boxShadow: isCover ? '-3px 8px 24px -4px rgba(130,60,85,0.5)' : undefined,
        }}
      >
        {isVisible ? front : null}
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: frontShade }} />
        {!isCover && isVisible && (
          <button
            aria-label="Halaman berikutnya"
            onClick={onForward}
            className="group absolute right-0 top-0 flex h-full w-8 cursor-pointer items-end justify-end pb-6 pr-1"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b96a7d]/0 text-[#b96a7d]/0 transition-all group-hover:bg-[#b96a7d]/85 group-hover:text-[#faf6ee]">
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        )}
      </div>

      <div
        style={{
          ...faceBase,
          ...faceRect,
          ...(isCover ? {} : paperTexture),
          transform: 'rotateY(180deg)',
        }}
      >
        {isVisible ? back : null}
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: backShade }} />
        {isVisible && (
          <button
            aria-label="Halaman sebelumnya"
            onClick={onBackward}
            className="group absolute left-0 top-0 flex h-full w-8 cursor-pointer items-end justify-start pb-6 pl-1"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b96a7d]/0 text-[#b96a7d]/0 transition-all group-hover:bg-[#b96a7d]/85 group-hover:text-[#faf6ee]">
              <ChevronLeft className="h-4 w-4" />
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ==================================================================
   CSS section
================================================================== */
const CSS = `
.ps-lace-top, .ps-lace-bot {
  position: absolute; left: 0; right: 0; height: 22px; pointer-events: none;
  background: radial-gradient(circle at 11px 0, #fffdf8 10px, transparent 10.5px) 0 0 / 22px 22px repeat-x;
}
.ps-lace-top { top: 0; }
.ps-lace-bot { bottom: 0; transform: scaleY(-1); }
.ps-pearls {
  position: absolute; left: 0; right: 0; height: 6px; pointer-events: none; opacity: .9;
  background: radial-gradient(circle at 50% 50%, #fff 0 2px, #e9d9d6 2.6px, transparent 3.2px) 0 0 / 14px 6px repeat-x;
}
@keyframes ps-twinkle { from { opacity: .3; transform: scale(.85); } to { opacity: .95; transform: scale(1.1); } }
.ps-spark { animation: ps-twinkle 2.8s ease-in-out infinite alternate; }
@keyframes ps-float { from { transform: translateY(0) rotate(var(--r, 0deg)); } to { transform: translateY(-7px) rotate(var(--r, 0deg)); } }
.ps-bow { animation: ps-float 4.2s ease-in-out infinite alternate; }
.ps-scroll { scrollbar-width: thin; scrollbar-color: #e3a3b4 transparent; padding-right: 4px; }
.ps-scroll::-webkit-scrollbar { width: 5px; }
.ps-scroll::-webkit-scrollbar-track { background: transparent; }
.ps-scroll::-webkit-scrollbar-thumb { background: #e3a3b4; border-radius: 999px; }
@media (prefers-reduced-motion: reduce) { .ps-spark, .ps-bow { animation: none; } }
@media (max-width: 640px) { .ps-spark, .ps-bow { display: none; } }
`;

/* ==================================================================
   KOMPONEN UTAMA
================================================================== */
export default function PoeticScrapbook() {
  const chapters = BOOK_DATA.chapters;
  const n = chapters.length;

  /* Susun halaman: depan (buket + judul), tiap bab, penutup */
  const { pages, openers } = useMemo(() => {
    const pages = [];
    const openers = [];
    let pn = 0;
    const plate = (ci) => pages.push({ type: 'plate', n: pn++, ci });

    plate(0);
    pages.push({ type: 'title', ci: 0 });

    chapters.forEach((ch, ci) => {
      if (pages.length % 2 === 1) plate(Math.max(ci - 1, 0));
      openers[ci] = pages.length;
      pages.push({ type: 'opener', ci });
      const paras = [...(ch.preface || []), ...(ch.paragraphs || [])];
      const chunks = paginate(paras, 1200);
      chunks.forEach((chunk, k) =>
        pages.push({ type: 'text', ci, chunk, first: k === 0, last: k === chunks.length - 1 })
      );
      if (!chunks.length) plate(ci);
      if (ci < n - 1 && pages.length % 2 === 1) {
        plate(ci);
      }
    });
    if (pages.length % 2 === 1) plate(n - 1);
    pages.push({ type: 'end', ci: n - 1 });
    return { pages, openers };
  }, [chapters, n]);

  const K = (pages.length - 1) / 2;
  const L = K + 1;

  const renderPage = (p, i) => {
    const side = i % 2 === 0 ? 'left' : 'right';
    switch (p.type) {
      case 'opener':
        return <OpenerPage ch={chapters[p.ci]} ci={p.ci} side={side} />;
      case 'text':
        return <TextPage page={p} ch={chapters[p.ci]} side={side} no={i + 1} />;
      case 'title':
        return <TitlePage side={side} />;
      case 'end':
        return <EndPage side={side} />;
      default:
        return <PlatePage n={p.n} side={side} />;
    }
  };

  const leaves = [
    { isCover: true, front: null, back: <InsideCover>{renderPage(pages[0], 0)}</InsideCover> },
    ...Array.from({ length: K }, (_, j) => {
      const k = j + 1;
      return { isCover: false, front: renderPage(pages[2 * k - 1], 2 * k - 1), back: renderPage(pages[2 * k], 2 * k) };
    }),
  ];

  const [f, setF] = useState(0);
  const [topLeaf, setTopLeaf] = useState(null);
  const [coverHover, setCoverHover] = useState(false);
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [mSide, setMSide] = useState('left'); // mobile: halaman mana yang lagi dilihat

  const fRef = useRef(0);
  const timerRef = useRef(null);
  const sideRef = useRef('left');
  const sectionRef = useRef(null);
  const navRef = useRef({});

  const isMobile = vw < 640;
  const mobileRef = useRef(isMobile);
  mobileRef.current = isMobile;

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      clearInterval(timerRef.current);
    };
  }, []);

  const setSide = (s) => {
    sideRef.current = s;
    setMSide(s);
  };

  const stepTo = (target, side = 'left') => {
    clearInterval(timerRef.current);
    setSide(side);
    const t = Math.max(0, Math.min(L, target));
    if (fRef.current === t) return;
    const tick = () => {
      const cur = fRef.current;
      if (cur === t) {
        clearInterval(timerRef.current);
        return;
      }
      const nxt = cur + Math.sign(t - cur);
      const moving = nxt > cur ? cur : nxt;
      fRef.current = nxt;
      setF(nxt);
      setTopLeaf(moving);
      if (cur === 0 && nxt === 1) {
        playChime();
        // Signal the music player to switch to sketchbook queue
        window.dispatchEvent(new CustomEvent('aneska-open-sketchbook'));
      } else playPop();
    };
    tick();
    timerRef.current = setInterval(tick, 230);
  };

  /* Mobile: kiri -> kanan -> lembar berikutnya (kiri) -> ... */
  const next = () => {
    const cur = fRef.current;
    if (cur === L) return;
    if (mobileRef.current && cur > 0) {
      if (sideRef.current === 'left') {
        setSide('right');
        playPop();
        return;
      }
      stepTo(cur + 1, 'left');
      return;
    }
    stepTo(cur + 1);
  };

  const prev = () => {
    const cur = fRef.current;
    if (cur === 0) return;
    if (mobileRef.current) {
      if (sideRef.current === 'right') {
        setSide('left');
        playPop();
        return;
      }
      if (cur === 1) return stepTo(0);
      stepTo(cur - 1, 'right');
      return;
    }
    stepTo(cur - 1);
  };
  navRef.current = { next, prev };

  useEffect(() => {
    const onKey = (e) => {
      if (fRef.current === 0) return;
      if (e.key === 'ArrowRight') navRef.current.next();
      if (e.key === 'ArrowLeft') navRef.current.prev();
      if (e.key === 'Escape') stepTo(0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swipe: cuma di area section, cuma saat buku terbuka, cuma kalau gerakannya dominan horizontal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let sx = null;
    let sy = null;
    const onStart = (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const onEnd = (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      sx = sy = null;
      if (fRef.current === 0) return;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) navRef.current.next();
      else navRef.current.prev();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, []);

  const isClosed = f === 0;
  const isSpread = f > 0;

  /* ---- Layout responsif ----
     "Jendela" = bagian buku yang kelihatan.
     - tertutup / mobile : 1 halaman (PW)
     - desktop terbuka   : 2 halaman (2PW)
     Jendela selalu di-center, jadi nggak ada lagi geseran aneh. */
  const showOne = isClosed || isMobile;
  const winW = (showOne ? PW : 2 * PW) + 2 * PAD;
  const scale = Math.min(isClosed ? 1.05 : 1, (vw - (isMobile ? 16 : 24)) / winW);

  // Halaman kiri ada di x 0..PW, kanan di PW..2PW (di dalam motion.div)
  const shiftX = isClosed
    ? PAD - PW // tampilkan cover (kanan)
    : isMobile
    ? mSide === 'right' ? PAD - PW : PAD // satu halaman: kanan / kiri
    : PAD; // desktop: dua-duanya

  const leftIdx = 2 * f - 2;
  const nowChapter = f >= 1 && f < L ? pages[leftIdx]?.ci ?? 0 : n - 1;
  const statusLabel =
    f === L ? 'PENUTUP' : nowChapter === 0 ? 'PEMBUKA' : `BAB ${toRoman(nowChapter)} DARI ${toRoman(n - 1)}`;
  const pageLabel = isMobile ? leftIdx + (mSide === 'left' ? 1 : 2) : `${leftIdx + 1}–${leftIdx + 2}`;

  const statusText = isClosed
    ? 'Sebuah arsip kecil yang tumbuh di antara bunga lily. Klik sampul untuk membukanya.'
    : f === L
    ? 'Halaman terakhir · gunakan tombol kembali untuk membaca ulang.'
    : isMobile
    ? 'Geser layar atau pakai tombol di bawah untuk membalik halaman.'
    : 'Klik tepi halaman atau pakai tombol ← → untuk membalik lembar demi lembar.';

  return (
    <section
      ref={sectionRef}
      id="favorites-preview"
      className="relative w-full overflow-hidden py-12 md:py-24"
      style={{
        touchAction: 'pan-y',
        background: '#fbeef0',
        backgroundImage: `
          radial-gradient(circle at 50% 14%, rgba(255,255,255,0.9) 0%, transparent 58%),
          radial-gradient(circle at 8% 88%, rgba(246,211,219,0.7) 0%, transparent 48%),
          radial-gradient(circle at 94% 80%, rgba(232,169,186,0.4) 0%, transparent 48%)
        `,
      }}
    >
      <style>{CSS}</style>

      {/* renda + mutiara */}
      <div className="ps-lace-top" />
      <div className="ps-pearls" style={{ top: 26 }} />
      <div className="ps-lace-bot" />
      <div className="ps-pearls" style={{ bottom: 26 }} />

      {/* pita melayang */}
      <Bow className="ps-bow pointer-events-none absolute w-12 opacity-80" style={{ top: '9%', left: '7%', '--r': '-14deg' }} />
      <Bow className="ps-bow pointer-events-none absolute w-9 opacity-70" style={{ top: '16%', right: '9%', '--r': '12deg', animationDelay: '1s' }} />
      <Bow className="ps-bow pointer-events-none absolute w-10 opacity-70" style={{ top: '58%', left: '4%', '--r': '10deg', animationDelay: '2s' }} />
      <Bow className="ps-bow pointer-events-none absolute w-8 opacity-70" style={{ top: '64%', right: '5%', '--r': '-10deg', animationDelay: '.5s' }} />
      <Bow className="ps-bow pointer-events-none absolute w-10 opacity-80" style={{ top: '34%', left: '12%', '--r': '8deg', animationDelay: '1.5s' }} />
      <Bow className="ps-bow pointer-events-none absolute w-11 opacity-75" style={{ top: '80%', right: '14%', '--r': '-12deg', animationDelay: '2.4s' }} />

      {/* kilau */}
      <Sparkle style={{ top: '13%', left: '22%', fontSize: 16, color: '#e8a9ba' }}>✦</Sparkle>
      <Sparkle style={{ top: '27%', right: '20%', fontSize: 12, color: SAGE, animationDelay: '.8s' }}>✧</Sparkle>
      <Sparkle style={{ top: '46%', left: '9%', fontSize: 13, color: SAGE, animationDelay: '1.4s' }}>✧</Sparkle>
      <Sparkle style={{ top: '52%', right: '8%', fontSize: 17, color: '#e8a9ba', animationDelay: '.4s' }}>✦</Sparkle>
      <Sparkle style={{ bottom: '12%', left: '30%', fontSize: 12, color: '#e8a9ba', animationDelay: '1.1s' }}>✦</Sparkle>
      <Sparkle style={{ bottom: '10%', right: '28%', fontSize: 13, color: SAGE, animationDelay: '1.8s' }}>✧</Sparkle>

      {/* hati kecil */}
      <Sparkle style={{ top: '20%', left: '14%', fontSize: 18, color: '#e8a9ba' }}>♡</Sparkle>
      <Sparkle style={{ top: '38%', right: '14%', fontSize: 16, color: '#d17f95', animationDelay: '.6s' }}>♡</Sparkle>
      <Sparkle style={{ top: '70%', left: '16%', fontSize: 15, color: '#e8a9ba', animationDelay: '1.2s' }}>♡</Sparkle>
      <Sparkle style={{ top: '76%', right: '18%', fontSize: 19, color: '#d17f95', animationDelay: '.2s' }}>♡</Sparkle>

      {/* buket di kiri & kanan (layar lebar) */}
      <img
        src={getBouquetUrl(1)}
        alt=""
        draggable={false}
        className="pointer-events-none absolute bottom-6 left-0 hidden w-[170px] select-none lg:block xl:w-[220px]"
        style={{ transform: 'translateX(-16%) rotate(-8deg)', filter: 'drop-shadow(0 10px 14px rgba(130,60,85,0.25))' }}
      />
      <img
        src={getBouquetUrl(0)}
        alt=""
        draggable={false}
        className="pointer-events-none absolute bottom-6 right-0 hidden w-[170px] select-none lg:block xl:w-[220px]"
        style={{ transform: 'translateX(16%) rotate(8deg)', filter: 'drop-shadow(0 10px 14px rgba(130,60,85,0.25))' }}
      />
      <img
        src={getBouquetUrl(3)}
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-0 top-24 hidden w-[120px] select-none opacity-90 xl:block"
        style={{ transform: 'translateX(-26%) rotate(10deg)' }}
      />
      <img
        src={getBouquetUrl(2)}
        alt=""
        draggable={false}
        className="pointer-events-none absolute right-0 top-24 hidden w-[120px] select-none opacity-90 xl:block"
        style={{ transform: 'translateX(26%) rotate(-10deg)' }}
      />

      {/* Header */}
      <div className="relative mx-auto mb-10 max-w-5xl px-6 text-center md:mb-14">
        <span
          className="inline-flex items-center gap-2 rounded-full border bg-[#fffdf8]/80 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.24em] shadow-sm backdrop-blur"
          style={{ fontFamily: F_BODY, color: SAGE_DARK, borderColor: `${SAGE}55` }}
        >
          <Bow className="w-5" />
          Taman Catatan
          <Bow className="w-5" style={{ transform: 'scaleX(-1)' }} />
        </span>
        <h2 className="mt-3 text-[clamp(30px,4vw,46px)] font-normal italic tracking-tight" style={{ fontFamily: F_DISPLAY, color: SAGE_DARK }}>
          {BOOK_DATA.meta.title}
        </h2>
        <div className="mt-2 flex justify-center">
          <PearlDivider />
        </div>
        <p className="mx-auto mt-3 max-w-lg text-sm font-light" style={{ fontFamily: F_BODY, color: `${INK}99` }}>
          {statusText}
        </p>
      </div>

      {/* Panggung buku */}
      <div className="relative flex w-full justify-center px-2">
        <div
          className="relative"
          style={{
            width: winW * scale,
            height: (PH + 70) * scale,
            transition: 'width .6s ease, height .6s ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: winW,
              height: PH + 70,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              transition: 'transform .6s ease, width .6s ease',
              perspective: 2800,
              perspectiveOrigin: '50% 40%',
              overflow: isMobile && isSpread ? 'hidden' : 'visible', // potong halaman satunya di mobile
            }}
          >
            <motion.div
              animate={{ x: shiftX }}
              transition={{ duration: isMobile ? 0.7 : 1.0, ease: EASE }}
              style={{
                position: 'absolute',
                top: 30,
                left: 0,
                width: 2 * PW,
                height: PH,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* bayangan meja */}
              <div
                className="pointer-events-none absolute"
                style={{
                  left: isSpread ? 20 : PW + 10,
                  width: isSpread ? 2 * PW - 40 : PW - 10,
                  bottom: -30,
                  height: 36,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(130,60,85,0.38) 0%, rgba(130,60,85,0.13) 50%, transparent 75%)',
                  filter: 'blur(12px)',
                  transition: 'all .8s ease',
                }}
              />

              {/* papan sampul kiri */}
              <div
                className="pointer-events-none absolute rounded-l-[5px]"
                style={{
                  top: -OVERHANG,
                  bottom: -OVERHANG,
                  left: -OVERHANG,
                  width: PW + OVERHANG,
                  background: CLOTH,
                  opacity: isSpread ? 1 : 0,
                  transition: 'opacity .4s ease',
                  boxShadow: '0 12px 30px -10px rgba(130,60,85,0.45)',
                }}
              />
              {/* papan sampul kanan (dalam sampul belakang) */}
              <div
                className="pointer-events-none absolute rounded-r-[5px]"
                style={{
                  top: -OVERHANG,
                  bottom: -OVERHANG,
                  left: PW,
                  width: PW + OVERHANG,
                  background: CLOTH,
                  boxShadow: '0 12px 30px -10px rgba(130,60,85,0.45)',
                }}
              >
                <div
                  className="absolute flex items-center justify-center"
                  style={{ top: OVERHANG, bottom: OVERHANG, left: 0, right: OVERHANG, background: PAPER }}
                >
                  <Bow className="w-14 opacity-80" />
                </div>
              </div>

              {/* tepi tumpukan kertas (terlihat saat tertutup) */}
              <div
                className="pointer-events-none absolute"
                style={{
                  top: 4,
                  bottom: 4,
                  left: 2 * PW + OVERHANG - 2,
                  width: 8,
                  background: 'repeating-linear-gradient(to bottom, #f6f0e2 0px, #f6f0e2 1.5px, #ddd3be 1.5px, #ddd3be 3px)',
                  borderRadius: '0 2px 2px 0',
                  opacity: isClosed ? 1 : 0,
                  transition: 'opacity .3s ease',
                }}
              />

              {/* pita pembatas satin menjuntai */}
              <div
                className="pointer-events-none absolute"
                style={{
                  left: PW + PW * 0.56,
                  top: PH + OVERHANG - 3,
                  width: 14,
                  height: 38,
                  background: 'linear-gradient(180deg, #dba0af 0%, #e8b4c1 55%, #cf8697 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
                  filter: 'drop-shadow(0 3px 3px rgba(100,50,60,0.25))',
                  transform: 'rotate(2deg)',
                }}
              />

              {/* lembar-lembar kertas */}
              {leaves.map((leaf, i) => {
                const flipped = i < f;
                const z = topLeaf === i ? 200 : flipped ? i : L - i;
                let angle = flipped ? -180 : 0;
                if (i === 0 && isClosed && coverHover) angle = -15;
                const isVisible =
                  Math.abs(i - f) <= 2 ||
                  (topLeaf !== null && Math.abs(i - topLeaf) <= 2) ||
                  (isClosed && i === 0);

                return (
                  <Leaf
                    key={i}
                    index={i}
                    angle={angle}
                    z={z}
                    isVisible={isVisible}
                    front={
                      leaf.isCover ? (
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Buka buku"
                          className="h-full w-full cursor-pointer"
                          onMouseEnter={() => setCoverHover(true)}
                          onMouseLeave={() => setCoverHover(false)}
                          onClick={() => stepTo(1)}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && stepTo(1)}
                        >
                          <CoverFront src={COVER_SRC} hover={coverHover} />
                        </div>
                      ) : (
                        leaf.front
                      )
                    }
                    back={leaf.back}
                    isCover={leaf.isCover}
                    onForward={() => (isMobile ? next() : stepTo(i + 1))}
                    onBackward={() => (isMobile ? prev() : stepTo(i))}
                    onSettled={(idx) => setTopLeaf((t) => (t === idx ? null : t))}
                  />
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Kontrol bawah */}
      <div className="relative mx-auto mt-6 flex max-w-xl flex-col items-center gap-4 px-4">
        {isClosed ? (
          <button
            onClick={() => stepTo(1)}
            className="group flex cursor-pointer items-center gap-2 rounded-full border bg-[#fffdf8]/90 px-5 py-2.5 text-xs font-medium shadow-md backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-[#d17f95] hover:text-[#faf6ee]"
            style={{ color: SAGE_DARK, borderColor: `${SAGE}66`, fontFamily: F_BODY }}
          >
            <BookOpen className="h-4 w-4" />
            <span>Mulai Membaca</span>
            <span className="transition-transform group-hover:translate-x-1">➔</span>
          </button>
        ) : (
          <>
            <div className="flex w-full items-center justify-between gap-2">
              <button
                onClick={prev}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#d17f95] px-4 py-2 text-xs font-medium text-[#faf6ee] shadow transition-all hover:bg-[#b96a7d] sm:px-4 sm:py-2"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="min-w-0 text-center text-[10px] font-medium tracking-widest sm:text-[11px]" style={{ fontFamily: F_BODY, color: SAGE_DARK }}>
                {statusLabel}
                {f < L && <span className="ml-2 opacity-55">· HAL. {pageLabel}</span>}
              </div>

              <button
                onClick={next}
                disabled={f === L}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#d17f95] px-4 py-2 text-xs font-medium text-[#faf6ee] shadow transition-all hover:bg-[#b96a7d] disabled:pointer-events-none disabled:opacity-30"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id ?? idx}
                  onClick={() => stepTo(openers[idx] / 2 + 1)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    f >= 1 && f < L && nowChapter === idx
                      ? 'bg-[#b96a7d] text-[#faf6ee] shadow-sm'
                      : 'bg-[#e8a9b8]/25 text-[#8f4a5d] hover:bg-[#e8a9b8]/45'
                  }`}
                  style={{ fontFamily: F_BODY }}
                >
                  {idx === 0 ? 'Pembuka' : toRoman(idx)}
                </button>
              ))}
              <button
                onClick={() => stepTo(0)}
                className="ml-1 flex cursor-pointer items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-[11px] font-medium transition-colors hover:bg-black/20"
                style={{ color: INK, fontFamily: F_BODY }}
              >
                <X className="h-3 w-3" />
                Tutup Buku
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}