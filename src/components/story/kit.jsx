  import { useEffect, useLayoutEffect, useRef, useState } from 'react';
  import { animate, stagger } from 'animejs';
  import { playPop } from '../../utils/sound';

  /* ------------------------------------------------------------------ */
  /* Math & util                                                         */
  /* ------------------------------------------------------------------ */

  export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  export const mix = (a, b, t) => a + (b - a) * t;
  export const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  export const easeInOut = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  export const prefersReduced = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  export const goTo = (id) => {
    playPop();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  export function useMediaQuery(query) {
    const [matches, setMatches] = useState(
      () => typeof window !== 'undefined' && window.matchMedia(query).matches
    );
    useEffect(() => {
      const mq = window.matchMedia(query);
      const onChange = (e) => setMatches(e.matches);
      setMatches(mq.matches);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }, [query]);
    return matches;
  }

  /* ------------------------------------------------------------------ */
  /* Scroll engine                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Scene "pinned": wrapper tinggi + anak pertama sticky.
   * setup(scene) harus return { onProgress(p), cleanup?() }, p = 0..1.
   * Progress dihaluskan (lerp) dan loop cuma jalan saat scene dekat layar.
   */
  export function useScene(sceneRef, setup, deps) {
    useLayoutEffect(() => {
      const scene = sceneRef.current;
      if (!scene) return undefined;
      const pin = scene.firstElementChild;
      const api = setup(scene);
      const reduced = prefersReduced();

      const read = () => {
        const scrollable = Math.max(1, scene.offsetHeight - pin.offsetHeight);
        return clamp(-scene.getBoundingClientRect().top / scrollable, 0, 1);
      };

      let target = read();
      let cur = target;
      let raf = 0;
      api.onProgress(cur);

      const loop = () => {
        target = read();
        cur = reduced ? target : cur + (target - cur) * 0.16;
        if (Math.abs(target - cur) < 0.0004) cur = target;
        api.onProgress(cur);
        raf = requestAnimationFrame(loop);
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(loop);
          } else {
            if (raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            }
            target = read();
            cur = target;
            api.onProgress(cur);
          }
        },
        { rootMargin: '50% 0px 50% 0px' }
      );
      io.observe(scene);

      return () => {
        io.disconnect();
        if (raf) cancelAnimationFrame(raf);
        api.cleanup?.();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  }

  /** Loop rAF yang cuma jalan saat elemen dekat layar. */
  export function useFrameLoop(ref, cb, deps) {
    useEffect(() => {
      const el = ref.current;
      if (!el || prefersReduced()) return undefined;
      let raf = 0;
      const loop = () => {
        cb();
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(loop);
          } else if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        },
        { rootMargin: '50% 0px 50% 0px' }
      );
      io.observe(el);
      return () => {
        io.disconnect();
        if (raf) cancelAnimationFrame(raf);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  }

  /** Elemen yang cocok dengan selector muncul bergantian saat section masuk layar. */
  export function useReveal(ref, selector = '[data-r]') {
    useLayoutEffect(() => {
      const root = ref.current;
      if (!root || prefersReduced()) return undefined;
      const items = root.querySelectorAll(selector);
      items.forEach((el) => {
        el.style.opacity = 0;
      });

      let anim;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          anim = animate(items, {
            opacity: [0, 1],
            translateY: [40, 0],
            duration: 1100,
            delay: stagger(110),
            ease: 'outExpo',
          });
        },
        { threshold: 0.15 }
      );
      io.observe(root);

      return () => {
        io.disconnect();
        anim?.revert();
        items.forEach((el) => {
          el.style.opacity = '';
        });
      };
    }, [ref, selector]);
  }

  /* ------------------------------------------------------------------ */
  /* Teks bertopeng (mask reveal)                                        */
  /* ------------------------------------------------------------------ */

  /** Satu baris teks, tiap huruf punya data-l (untuk animasi huruf per huruf). */
  export function Line({ text, className = '' }) {
    return (
      <span className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${className}`}>
        {text.split('').map((c, i) => (
          <span key={i} data-l className="inline-block will-change-transform">
            {c === ' ' ? '\u00A0' : c}
          </span>
        ))}
      </span>
    );
  }

  /** Satu baris yang naik dari balik topeng. Isinya punya data-m. */
  export function Mask({ children, className = '' }) {
    return (
      <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
        <span data-m className={`block will-change-transform ${className}`}>
          {children}
        </span>
      </span>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Marquee raksasa yang digerakkan scroll                              */
  /* ------------------------------------------------------------------ */

  export function Marquee({ words, reverse = false }) {
    const rootRef = useRef(null);
    const trackRef = useRef(null);
    const curRef = useRef(null);

    useFrameLoop(
      rootRef,
      () => {
        const root = rootRef.current;
        const track = trackRef.current;
        if (!root || !track) return;
        const r = root.getBoundingClientRect();
        const t = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
        curRef.current = curRef.current === null ? t : curRef.current + (t - curRef.current) * 0.12;
        const x = reverse ? -35 + curRef.current * 35 : -curRef.current * 35;
        track.style.transform = `translate3d(${x}%, 0, 0)`;
      },
      [reverse]
    );

    const groups = [0, 1];
    return (
      <div
        ref={rootRef}
        aria-hidden="true"
        className="overflow-hidden bg-[#faf6ee] py-10 md:py-16 border-y border-[#e3d8c6]"
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {groups.map((g) => (
            <div
              key={g}
              className="flex flex-none items-center gap-[0.35em] pr-[0.35em] text-[clamp(4rem,14vw,11rem)] font-semibold leading-none tracking-tight font-serif italic"
            >
              {words.map((w, i) => (
                <span key={w} className="flex items-center gap-[0.35em]">
                  <span
                    className={
                      i % 2 === 0
                        ? 'text-transparent [-webkit-text-stroke:1.5px_#800020]'
                        : 'text-[#580016]'
                    }
                  >
                    {w}
                  </span>
                  <span className="text-[0.4em] text-[#800020]">🎀</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Tombol magnetik                                                     */
  /* ------------------------------------------------------------------ */

  export function Magnetic({ children, strength = 0.3, className = '' }) {
    const ref = useRef(null);

    useEffect(() => {
      const el = ref.current;
      if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      let raf = 0;

      const loop = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
          raf = requestAnimationFrame(loop);
        } else {
          raf = 0;
        }
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const move = (e) => {
        const r = el.getBoundingClientRect();
        const centerX = r.left - cx + r.width / 2;
        const centerY = r.top - cy + r.height / 2;
        tx = (e.clientX - centerX) * strength;
        ty = (e.clientY - centerY) * strength;
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
      };
    }, [strength]);

    return (
      <span ref={ref} className={`inline-block ${className}`}>
        {children}
      </span>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Kursor kustom (desktop aja)                                         */
  /* ------------------------------------------------------------------ */

  export function CustomCursor() {
    const [enabled, setEnabled] = useState(false);
    const posRef = useRef(null);
    const ringRef = useRef(null);
    const labelRef = useRef(null);

    useEffect(() => {
      setEnabled(
        window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced()
      );
    }, []);

    useEffect(() => {
      if (!enabled) return undefined;
      const pos = posRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;

      let tx = -100;
      let ty = -100;
      let x = -100;
      let y = -100;
      let raf = 0;

      const loop = () => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        pos.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        raf = requestAnimationFrame(loop);
      };

      const move = (e) => {
        tx = e.clientX;
        ty = e.clientY;
        const t = e.target instanceof Element ? e.target : null;
        const hit = t?.closest('a,button,[role="button"]');
        const tag = t?.closest('[data-cursor]');
        if (hit) {
          ring.dataset.state = 'link';
          label.textContent = '';
        } else if (tag) {
          ring.dataset.state = 'label';
          label.textContent = tag.getAttribute('data-cursor');
        } else {
          ring.dataset.state = 'idle';
          label.textContent = '';
        }
        pos.style.opacity = 1;
      };
      const out = (e) => {
        if (!e.relatedTarget) pos.style.opacity = 0;
      };

      window.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('mouseout', out);
      raf = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener('pointermove', move);
        document.removeEventListener('mouseout', out);
        cancelAnimationFrame(raf);
      };
    }, [enabled]);

    if (!enabled) return null;

    return (
      <div
        ref={posRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[80] opacity-0 transition-opacity duration-300"
      >
        <div
          ref={ringRef}
          data-state="idle"
          className="-ml-5 -mt-5 h-10 w-10 rounded-full border border-white/50 backdrop-blur-[2px] transition-[transform,background-color,border-color] duration-300 ease-out data-[state=label]:scale-[2.1] data-[state=label]:border-white/70 data-[state=label]:bg-white/10 data-[state=link]:scale-[1.6] data-[state=link]:border-purple-300"
        />
        <span
          ref={labelRef}
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-medium text-white"
        />
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Garis progres + navigasi bagian                                     */
  /* ------------------------------------------------------------------ */

  export function ProgressBar() {
    const barRef = useRef(null);
    useEffect(() => {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (barRef.current) barRef.current.style.transform = `scaleX(${clamp(p, 0, 1)})`;
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return (
      <div
        ref={barRef}
        className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-[#800020] via-[#a82441] to-[#580016]"
        style={{ transform: 'scaleX(0)' }}
      />
    );
  }

  const NAV = [
    ['hero', 'Sambutan'],
    ['gallery', 'Galeri'],
    ['photos', 'Foto'],
    ['moments', 'Momen'],
    ['favorites-preview', 'Sketchbook'],
    ['letters', 'Surat'],
    ['closing', 'Penutup'],
  ];

  export function SideNav() {
    const [active, setActive] = useState('hero');

    useEffect(() => {
      const els = NAV.map(([id]) => document.getElementById(id)).filter(Boolean);
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(e.target.id);
          });
        },
        { rootMargin: '-45% 0px -45% 0px' }
      );
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, []);

    return (
      <nav
        aria-label="Navigasi cerita"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      >
        {NAV.map(([id, label]) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            aria-label={label}
            className="group flex cursor-pointer items-center gap-3"
          >
            <span className="text-xs text-white/0 transition-colors duration-300 group-hover:text-white/80">
              {label}
            </span>
            <span
              className={`block w-1.5 rounded-full transition-all duration-500 ${
                active === id ? 'h-6 bg-purple-300' : 'h-1.5 bg-white/30'
              }`}
            />
          </button>
        ))}
      </nav>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Intro curtain (sekali per buka halaman)                              */
  /* ------------------------------------------------------------------ */

  let curtainPlayed = false;
  export const hasPlayedCurtain = () => curtainPlayed;

  export function Curtain({ onLift }) {
    const [gone, setGone] = useState(hasPlayedCurtain);
    const panelRef = useRef(null);
    const numRef = useRef(null);
    const wordRef = useRef(null);

    useEffect(() => {
      if (gone) return undefined;
      const reduced = prefersReduced();
      const total = reduced ? 300 : 1700;
      const t0 = performance.now();
      let raf = 0;
      let slide = null;

      const word = animate(wordRef.current, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 900,
        ease: 'outExpo',
      });

      const lift = () => {
        onLift();
        slide = animate(panelRef.current, {
          translateY: ['0%', '-100%'],
          duration: reduced ? 300 : 1100,
          ease: 'inOutExpo',
          onComplete: () => {
            curtainPlayed = true;
            setGone(true);
          },
        });
      };

      const tick = (now) => {
        const t = clamp((now - t0) / total, 0, 1);
        if (numRef.current) {
          numRef.current.textContent = String(Math.round(easeInOut(t) * 100)).padStart(3, '0');
        }
        if (t < 1) raf = requestAnimationFrame(tick);
        else lift();
      };
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        word.revert();
        slide?.revert();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (gone) return null;

    return (
      <div
        ref={panelRef}
        className="fixed inset-0 z-[90] flex flex-col justify-between bg-[#faf6ee] p-6 md:p-12 text-[#580016]"
      >
        <span ref={wordRef} className="text-sm font-medium tracking-wide text-[#800020]/70 opacity-0 font-serif italic">
          Aneska
        </span>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-serif italic font-semibold text-[#800020] md:text-4xl">Hi, Anes</span>
          <span
            ref={numRef}
            className="text-[clamp(4rem,16vw,11rem)] font-serif font-bold leading-none tabular-nums text-[#580016]"
          >
            000
          </span>
        </div>
      </div>
    );
  }