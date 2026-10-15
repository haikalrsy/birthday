import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { goTo } from '../story/kit';

// Link navigasi yang tampil di dalam pill notch
const LINKS = [
  { id: 'hero', label: 'Beranda' },
  { id: 'moments', label: 'Momen' },
  { id: 'favorites-preview', label: 'Sketchbook' },
  { id: 'letters', label: 'Surat' },
];

const EASE = 'cubic-bezier(0.16,1,0.3,1)';

export default function DynamicNotch({ onExploreFavorites }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('hero');
  const wrapRef = useRef(null);

  // Tandai menu aktif sesuai section yang sedang terlihat
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let cur = LINKS[0].id;
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= line) cur = l.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tutup pill saat tap di luar (mobile)
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const tab = open ? 0 : -1;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex justify-center px-3">
      <div
        ref={wrapRef}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
        onClick={() => !open && setOpen(true)}
        className="pointer-events-auto relative cursor-pointer overflow-hidden bg-[#faf6ee] text-[#580016] shadow-lg shadow-[#800020]/15 ring-1 ring-[#e3d8c6]"
        style={{
          width: open ? 'min(94vw, 680px)' : '104px',
          height: open ? '56px' : '34px',
          borderRadius: open ? '28px' : '17px',
          transition: `width 600ms ${EASE}, height 600ms ${EASE}, border-radius 600ms ${EASE}`,
        }}
      >
        {/* Label kecil saat tertutup */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center gap-1 text-xs font-medium tracking-wide text-white/80 transition-opacity duration-300 ${
            open ? 'opacity-0' : 'opacity-100 delay-200'
          }`}
        />

        {/* Menu navigasi saat terbuka */}
        <nav
          aria-label="Menu utama"
          className={`absolute inset-0 flex items-center justify-between gap-2 px-4 transition-opacity duration-300 sm:px-5 ${
            open ? 'opacity-100 delay-200' : 'pointer-events-none opacity-0'
          }`}
        >
          <button
            type="button"
            tabIndex={tab}
            onClick={() => {
              goTo('hero');
              setOpen(false);
            }}
            className="flex flex-none cursor-pointer items-center gap-2"
          >
            <Heart className="h-4 w-4 text-[#800020]" />
            <span className="hidden font-display text-lg sm:inline">For Aneska</span>
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                tabIndex={tab}
                onClick={() => {
                  goTo(l.id);
                  setOpen(false);
                }}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition-colors sm:text-sm ${
                  active === l.id ? 'bg-[#800020] text-white shadow-sm' : 'text-[#7a2039] hover:text-[#580016] hover:bg-[#ebe3d5]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
