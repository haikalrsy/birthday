import { useLayoutEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { ArrowRight, BookOpen, ChevronDown, Heart } from 'lucide-react';
import MorphSlider from '../reactbits/MorphSlider';
import DriftWall from '../reactbits/DriftWall';
import FlexCarousel from '../reactbits/FlexCarousel';
import VideoPlayerModal from '../interactive/VideoPlayerModal';
import DynamicNotch from '../common/DynamicNotch';
import SideNotchMusic from '../common/SideNotchMusic';
import ReasonScene from './ReasonScene';
import NotesScene from './NotesScene';
import BirthdayCountdown from './BirthdayCountdown';
import { morphSliderItems } from '../../data/media';
import { playPop, playChime } from '../../utils/sound';
import {
  Curtain,
  hasPlayedCurtain,
  ProgressBar,
  SideNav,
  Magnetic,
  Line,
  Mask,
  useScene,
  useReveal,
  useMediaQuery,
  mix,
  seg,
  easeOut,
  easeInOut,
  prefersReduced,
  goTo,
} from '../story/kit';

import heroAnesk from '../../assets/images/anesk.jpeg';
import heroSekolah from '../../assets/images/sekolah.png';
import hero2 from '../../assets/images/2.png';
import closingPhoto from '../../assets/images/3.png'; // foto penutup, ganti file kalau mau foto lain

/*
  Palet putih tulang (bone white):
  #f4efe6  dasar section
  #f7f2e9  section selang-seling
  #faf6ee  kartu / tombol
  #efe8dc  panel / overlay
  #ebe3d5  hover
  #e3d8c6  border
  #d9cdb8  titik nonaktif
*/

/* ------------------------------------------------------------------ */
/* Scene 1: Hero                                                        */
/* ------------------------------------------------------------------ */

const HERO_POLAROIDS = [
  { cls: 'left-0 top-4 w-[150px]', rot: -8, cap: '', src: heroAnesk },
  { cls: 'right-0 top-0 w-[160px]', rot: 6, cap: '', src: heroSekolah },
  { cls: 'bottom-0 left-[70px] w-[170px]', rot: -2, cap: '', src: hero2 },
];

function HeroScene({ ready, onExploreFavorites }) {
  const sceneRef = useRef(null);

  // Intro: huruf naik satu per satu, sisanya fade-in bergantian
  useLayoutEffect(() => {
    const root = sceneRef.current;
    if (!root || prefersReduced()) return undefined;
    const letters = root.querySelectorAll('[data-l]');
    const fades = root.querySelectorAll('[data-fade]');

    const clear = () => {
      letters.forEach((el) => {
        el.style.transform = '';
      });
      fades.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
      });
    };

    letters.forEach((el) => {
      el.style.transform = 'translateY(115%)';
    });
    fades.forEach((el) => {
      el.style.opacity = 0;
    });
    if (!ready) return clear;

    const a = animate(letters, {
      translateY: ['115%', '0%'],
      duration: 1300,
      delay: stagger(55),
      ease: 'outExpo',
    });
    const b = animate(fades, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 1000,
      delay: stagger(120, { start: 500 }),
      ease: 'outExpo',
    });
    return () => {
      a.revert();
      b.revert();
      clear();
    };
  }, [ready]);

  // Panah scroll naik-turun pelan
  useLayoutEffect(() => {
    const el = sceneRef.current?.querySelector('[data-bob]');
    if (!el || prefersReduced()) return undefined;
    const a = animate(el, {
      translateY: [0, 8],
      duration: 900,
      ease: 'inOutSine',
      alternate: true,
      loop: true,
    });
    return () => a.revert();
  }, []);

  // Foto polaroid dan badge melayang pelan
  useLayoutEffect(() => {
    const els = sceneRef.current?.querySelectorAll('[data-float]');
    if (!els || !els.length || prefersReduced()) return undefined;
    const a = animate(els, {
      translateY: [0, -12],
      duration: 2600,
      ease: 'inOutSine',
      alternate: true,
      loop: true,
      delay: stagger(450),
    });
    return () => a.revert();
  }, []);

  // Dikendalikan scroll: foto zoom, teks naik dan memudar
  useScene(
    sceneRef,
    (scene) => {
      if (prefersReduced()) return { onProgress: () => {} };
      const bg = scene.querySelector('[data-bg]');
      const copy = scene.querySelector('[data-copy]');
      const aside = scene.querySelector('[data-aside]');
      const cue = scene.querySelector('[data-cue]');
      return {
        onProgress(p) {
          if (bg) bg.style.transform = `scale(${mix(1, 1.16, easeOut(p))})`;
          const fade = 1 - seg(p, 0.2, 0.65);
          if (copy) {
            copy.style.transform = `translate3d(0, ${-p * 140}px, 0)`;
            copy.style.opacity = fade;
            copy.style.visibility = fade < 0.02 ? 'hidden' : 'visible';
          }
          if (aside) aside.style.opacity = 1 - seg(p, 0.1, 0.4);
          if (cue) cue.style.opacity = 1 - seg(p, 0, 0.12);
        },
      };
    },
    []
  );

  return (
    <section
      id="hero"
      ref={sceneRef}
      className="relative h-[170svh] motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh min-h-[600px] overflow-hidden">
        {/* Foto latar: MorphSlider (bisa digeser) */}
        <div data-bg className="absolute inset-0 will-change-transform">
          <MorphSlider
            items={morphSliderItems}
            transition="melt"
            intensity={0.55}
            aberration={0.3}
            drift={0.35}
            autoplay
            autoplayDelay={5}
            duration={1.2}
            radius={0}
            overlayColor=""
            showCaptions={false}
            showControls={false}
          />
        </div>

        {/* Overlay gelap tipis supaya foto sedikit lebih gelap */}
        <div className="pointer-events-none absolute inset-0 bg-black/30" />

        {/* Teks: bawah di HP, tengah di desktop */}
        <div
          data-copy
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-24 pt-24 md:justify-center md:px-12 md:pb-0 lg:px-16"
        >
          <div className="max-w-5xl">
            <h1 className="text-[clamp(3rem,13vw,9.5rem)] font-['Cormorant_Garamond'] font-medium italic leading-[0.85] tracking-[-0.04em] text-[#faf7f2] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              <Line text="Aneska Malvi" />
              <Line text="Imtiyaz" className="text-[#ece6da]" />
            </h1>

            <p
              data-fade
              className="mb-8 max-w-md text-sm font-medium leading-relaxed text-[#7a2039] md:text-base"
            >
              Perempuan terlahir bernama Aneska Malvi Imtiyaz dan dari sekian banyak kemungkinan di semesta, aku beruntung hidup di garis waktu yang sama denganmu.
            </p>

            <div data-fade className="pointer-events-auto flex flex-wrap items-center gap-3">
              <Magnetic>
                <button
                  onClick={() => goTo('gallery')}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#800020] px-6 py-3 text-sm font-medium text-[#faf6ee] shadow-md shadow-[#800020]/20 transition-all hover:bg-[#600018] active:scale-95"
                >
                  <span>mulai ceritanya</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => {
                    playPop();
                    onExploreFavorites?.();
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#800020]/30 bg-[#faf6ee]/80 px-5 py-3 text-sm font-medium text-[#580016] shadow-sm backdrop-blur transition-all hover:bg-[#ebe3d5] active:scale-95"
                >
                  <BookOpen className="h-4 w-4 text-[#800020]" />
                  <span>Buka Sketchbook</span>
                </button>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Hiasan kanan: tumpukan polaroid (layar lebar) */}
        <div
          data-aside
          className="pointer-events-none absolute right-5 top-24 z-10 md:right-10 xl:right-16 xl:top-1/2 xl:-translate-y-1/2"
        >
          <div data-fade className="relative xl:h-[400px] xl:w-[300px]">
            {HERO_POLAROIDS.map((p, i) => (
              <div key={p.src || `hero-pol-${i}`} data-float className={`absolute hidden xl:block ${p.cls}`}>
                <div
                  className="rounded-[10px] bg-[#faf6ee] p-2 pb-1.5 shadow-[0_20px_44px_-14px_rgba(88,0,22,0.45)]"
                  style={{ transform: `rotate(${p.rot}deg)` }}
                >
                  <img
                    src={p.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="aspect-[4/5] w-full rounded-[6px] object-cover"
                  />
                  <span className="block pb-1 pt-2 text-center text-[11px] font-medium text-[#580016]/70">
                    {p.cap}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Petunjuk scroll */}
        <div
          data-cue
          className="pointer-events-none absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-xs font-medium text-[#800020]/70 md:bottom-6 md:left-auto md:right-8 md:translate-x-0"
        >
          <span>scroll</span>
          <span data-bob>
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 2: Galeri (jendela kecil melebar jadi full layar)              */
/* ------------------------------------------------------------------ */

/* ───────── Topeng bunga lily ───────── */
const LILY_CENTER_Y = 46; // pusat bunga (dalam %), jadi titik pusat zoom

// kelopak runcing: besar (long) atau kecil
const lilyPetal = (rot, long) => {
  const c = LILY_CENTER_Y;
  const d = long
    ? `M50 ${c} C37 ${c - 10} 38 ${c - 32} 50 ${c - 44} C62 ${c - 32} 63 ${c - 10} 50 ${c}Z`
    : `M50 ${c} C39 ${c - 8} 40 ${c - 25} 50 ${c - 34} C60 ${c - 25} 61 ${c - 8} 50 ${c}Z`;
  return `<path transform='rotate(${rot} 50 ${c})' d='${d}'/>`;
};

const LILY_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='#000'>` +
  // inti kecil
  `<circle cx='50' cy='${LILY_CENTER_Y}' r='7'/>` +
  // 3 kelopak besar (satu menghadap atas)
  lilyPetal(0, true) +
  lilyPetal(120, true) +
  lilyPetal(240, true) +
  // 3 kelopak kecil di sela-selanya
  lilyPetal(60, false) +
  lilyPetal(180, false) +
  lilyPetal(300, false) +
  // tangkai dan daun
  `<rect x='48.6' y='78' width='2.8' height='22' rx='1.4'/>` +
  `<ellipse cx='40' cy='91' rx='3' ry='9' transform='rotate(-40 40 91)'/>` +
  `<ellipse cx='60' cy='93' rx='3' ry='9' transform='rotate(40 60 93)'/>` +
  `</g></svg>`;

const LILY_MASK = `url("data:image/svg+xml,${encodeURIComponent(LILY_SVG)}")`;

const LILY_STYLE = {
  WebkitMaskImage: LILY_MASK,
  maskImage: LILY_MASK,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: `50% ${LILY_CENTER_Y}%`,
  maskPosition: `50% ${LILY_CENTER_Y}%`,
};

const LILY_OUTLINE =
  'drop-shadow(0 0 0.6px #800020) drop-shadow(0 0 0.6px #800020) drop-shadow(0 18px 26px rgba(128,0,32,0.25))';

function GalleryScene() {
  const sceneRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useScene(
    sceneRef,
    (scene) => {
      if (prefersReduced()) return { onProgress: () => {} };
      const lily = scene.querySelector('[data-lily]');
      const frame = scene.querySelector('[data-frame]');
      const wall = scene.querySelector('[data-wall]');
      const veil = scene.querySelector('[data-veil]');
      const copy = scene.querySelector('[data-copy]');
      const hint = scene.querySelector('[data-hint]');
      const lines = scene.querySelectorAll('[data-m]');

      return {
        onProgress(p) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;

          const startSize = Math.min(vh * 0.9, vw * 1.15);
          const cx = vw / 2;
          const cy = (LILY_CENTER_Y / 100) * vh;
          const farthest = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));

          const e = easeInOut(seg(p, 0, 0.5));

          if (frame) {
            frame.style.clipPath = 'none';

            if (e >= 1) {
              frame.style.webkitMaskImage = 'none';
              frame.style.maskImage = 'none';
              if (lily) lily.style.filter = 'none';
            } else {
              // bunga membesar sedikit, lalu lingkaran mengisi celah sampai layar penuh
              const size = startSize * (1 + 1.1 * e);
              const fill = Math.pow(seg(e, 0.3, 1), 2);
              const rc = farthest * 1.03 * fill;

              const img = `${LILY_MASK}, radial-gradient(circle at 50% ${LILY_CENTER_Y}%, #000 ${rc}px, transparent ${rc + 1.5}px)`;
              const sz = `${size}px ${size}px, 100% 100%`;
              const pos = `50% ${LILY_CENTER_Y}%, 0 0`;

              frame.style.webkitMaskImage = img;
              frame.style.maskImage = img;
              frame.style.webkitMaskSize = sz;
              frame.style.maskSize = sz;
              frame.style.webkitMaskPosition = pos;
              frame.style.maskPosition = pos;
              frame.style.webkitMaskRepeat = 'no-repeat, no-repeat';
              frame.style.maskRepeat = 'no-repeat, no-repeat';

              if (lily) lily.style.filter = e < 0.3 ? LILY_OUTLINE : 'none';
            }
          }
          if (wall) wall.style.transform = `scale(${mix(1.3, 1, e)})`;

          // Baris teks naik dari balik topeng
          lines.forEach((el, i) => {
            if (el) {
              const t = easeOut(seg(p, 0.2 + i * 0.12, 0.36 + i * 0.12));
              el.style.transform = `translate3d(0, ${(1 - t) * 115}%, 0)`;
            }
          });

          // Keluar: teks naik dan hilang, layar gelap terbuka
          const x = seg(p, 0.72, 0.92);
          if (copy) {
            copy.style.opacity = 1 - x;
            copy.style.transform = `translate3d(0, ${-x * 60}px, 0)`;
          }
          if (veil) veil.style.opacity = mix(0.25, 0.1, easeInOut(seg(p, 0.7, 0.95)));
          if (hint) hint.style.opacity = seg(p, 0.9, 1);
        },
      };
    },
    []
  );

  return (
    <section
      id="gallery"
      ref={sceneRef}
      className="relative h-[280svh] bg-[#f4efe6] motion-reduce:h-svh md:h-[320svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div data-lily className="absolute inset-0">
          <div data-frame className="absolute inset-0 bg-[#f4efe6]" style={LILY_STYLE}>
            <div data-wall className="absolute inset-0 will-change-transform">
              <DriftWall
                columns={isDesktop ? 5 : 3}
                tileWidth={isDesktop ? 240 : 150}
                tileHeight={isDesktop ? 180 : 200}
                gap={isDesktop ? 16 : 12}
                tilt={isDesktop ? 12 : 8}
                turn={isDesktop ? -10 : -6}
                speed={isDesktop ? 32 : 26}
                variance={0.35}
                parallax={0.4}
                lift={45}
                dim={0.9}
                overlayColor="#f4efe6"
              />
            </div>
            <div data-veil className="pointer-events-none absolute inset-0 bg-[#f4efe6]/25" />
          </div>
        </div>

        <div
          data-copy
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-28 md:justify-center md:px-16 md:pb-0"
        >
          <h2 className="font-display text-[clamp(2.4rem,9vw,5.5rem)] font-semibold leading-[1.05] tracking-tighter text-[#580016]">
            <Mask>Hello!</Mask>
            <Mask>I love You</Mask>
            <Mask className="text-[#800020]">Always, All ways.</Mask>
          </h2>
        </div>

        <p
          data-hint
          className="pointer-events-none absolute inset-x-0 bottom-10 z-10 px-6 text-center text-xs font-medium text-[#800020]/75 md:text-sm"
        >
          sentuh atau arahkan kursor ke foto, terus lanjut scroll
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 4: Momen                                                       */
/* ------------------------------------------------------------------ */

function MomentsScene() {
  const ref = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useReveal(ref);

  return (
    <section
      id="moments"
      ref={ref}
      className="flex min-h-svh flex-col bg-[#f7f2e9] pb-10 pt-20 md:pb-14 md:pt-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="mb-6 max-w-xl md:mb-8">
          <h2
            data-r
            className="mb-3 font-display text-3xl font-semibold tracking-tighter text-[#580016] md:text-5xl"
          >
            Hi Lily lover.
          </h2>
          <p data-r className="text-sm font-medium leading-relaxed text-[#7a2039] md:text-base">
            Look ur bouquet there and open the letter at the bouquet, i love u
          </p>
        </div>
      </div>

      {/* Bucket bunga: semua layar (HP & Desktop) */}
      <div
        data-r
        className="relative w-full overflow-hidden bg-[#efe8dc]"
        style={{ minHeight: 'min(82svh, max(460px, 60vw))' }}
      >
        <FlexCarousel />
      </div>

      <VideoPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoItem={selectedVideo}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 7: Penutup (foto terbuka dari lingkaran)                       */
/* ------------------------------------------------------------------ */

const CLOSING_PHOTO = closingPhoto;

function ClosingScene({ onExploreFavorites }) {
  const sceneRef = useRef(null);
  const burstRef = useRef(null);

  useScene(
    sceneRef,
    (scene) => {
      if (prefersReduced()) return { onProgress: () => {} };
      const reveal = scene.querySelector('[data-reveal]');
      const img = scene.querySelector('[data-img]');
      const lines = scene.querySelectorAll('[data-m]');
      const sub = scene.querySelector('[data-sub]');
      const cta = scene.querySelector('[data-cta]');

      return {
        onProgress(p) {
          const e = easeInOut(seg(p, 0, 0.5));
          if (reveal) reveal.style.clipPath = `circle(${mix(7, 78, e)}% at 50% 52%)`;
          if (img) img.style.transform = `scale(${mix(1.25, 1, e)})`;

          lines.forEach((el, i) => {
            if (el) {
              const t = easeOut(seg(p, 0.4 + i * 0.1, 0.62 + i * 0.1));
              el.style.transform = `translate3d(0, ${(1 - t) * 115}%, 0)`;
            }
          });

          const s = seg(p, 0.65, 0.82);
          if (sub) {
            sub.style.opacity = s;
            sub.style.transform = `translate3d(0, ${(1 - s) * 24}px, 0)`;
          }

          const c = seg(p, 0.78, 0.92);
          if (cta) {
            cta.style.opacity = c;
            cta.style.transform = `translate3d(0, ${(1 - c) * 24}px, 0)`;
            cta.style.pointerEvents = c > 0.6 ? 'auto' : 'none';
          }
        },
      };
    },
    []
  );

  const burst = (e) => {
    playChime();
    const layer = burstRef.current;
    if (!layer || prefersReduced()) return;

    const lr = layer.getBoundingClientRect();
    const br = e.currentTarget.getBoundingClientRect();
    const x = br.left + br.width / 2 - lr.left;
    const y = br.top - lr.top;

    for (let i = 0; i < 18; i++) {
      const h = document.createElement('span');
      h.textContent = '♥';
      h.className = 'pointer-events-none absolute text-[#b0304f]';
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.fontSize = `${14 + Math.random() * 22}px`;
      layer.appendChild(h);

      animate(h, {
        translateX: (Math.random() - 0.5) * 320,
        translateY: -(120 + Math.random() * 260),
        rotate: (Math.random() - 0.5) * 50,
        opacity: [1, 0],
        scale: [0.6, 1.2],
        duration: 1400 + Math.random() * 900,
        ease: 'outCubic',
        onComplete: () => h.remove(),
      });
    }
  };

  return (
    <section
      id="closing"
      ref={sceneRef}
      className="relative h-[240svh] bg-[#f4efe6] motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden">
        {/* Foto terbuka dari lingkaran */}
        <div data-reveal className="absolute inset-0">
          <img
            data-img
            src={CLOSING_PHOTO}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_30%] will-change-transform"
          />
          <div className="absolute inset-0 bg-[#efe8dc]/70 backdrop-blur-[1px]" />
        </div>

        <div ref={burstRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden" />

        <div className="absolute inset-0 z-10 flex items-center px-6 md:px-16">
          <div className="mx-auto w-full max-w-3xl text-center">
            <h2 className="pointer-events-none mb-5 font-display text-[clamp(2.5rem,9vw,5.5rem)] font-semibold leading-[1.05] tracking-tighter text-[#580016]">
              <Mask>Happy Birthday Aneska</Mask>
              <Mask className="text-[#800020]">Hidup lah lebih lama lagi, tolong.</Mask>
            </h2>

            <div data-cta className="flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <button
                  onClick={burst}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#800020] px-7 py-3.5 text-sm font-medium text-[#faf6ee] shadow-lg shadow-[#800020]/25 transition-all hover:bg-[#600018] active:scale-95"
                >
                  <Heart className="h-4 w-4 fill-[#faf6ee]" />
                  <span>i love u</span>
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => {
                    playPop();
                    onExploreFavorites?.();
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#800020]/30 bg-[#faf6ee]/90 px-6 py-3.5 text-sm font-medium text-[#580016] shadow-sm backdrop-blur transition-all hover:bg-[#ebe3d5] active:scale-95"
                >
                  <BookOpen className="h-4 w-4 text-[#800020]" />
                  <span>Re-read Sketchbook</span>
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function StorySection({ onExploreFavorites }) {
  const [ready, setReady] = useState(hasPlayedCurtain);

  return (
    <>
      <Curtain onLift={() => setReady(true)} />
      <ProgressBar />
      <SideNav />
      <DynamicNotch onExploreFavorites={onExploreFavorites} />
      <SideNotchMusic />

      <HeroScene ready={ready} onExploreFavorites={onExploreFavorites} />
      <GalleryScene />
      <ReasonScene />
      <MomentsScene />
      <NotesScene onGoToAllFavorites={onExploreFavorites} />
      <BirthdayCountdown />
      <ClosingScene onExploreFavorites={onExploreFavorites} />
    </>
  );
}