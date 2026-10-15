import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

// Ambil semua file musik dari src/assets/music. Format nama: "Artis - Judul.mp3"
const files = import.meta.glob('../../assets/music/*.{mp3,m4a,wav,ogg,flac}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const TRACKS = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, url]) => {
    const raw = decodeURIComponent(path.split('/').pop())
      .replace(/\.[^.]+$/, '')
      .replace(/_+/g, ' ')
      .replace(/^\d+\s*[-.]\s*/, '')
      .trim();
    const [first, ...rest] = raw.split(' - ');
    return rest.length
      ? { url, artist: first.trim(), title: rest.join(' - ').trim() }
      : { url, artist: '', title: raw };
  });

const PEEK = 34; // tinggi gagang yang kelihatan saat tertutup (px)

const fmt = (s) => {
  if (!s || !Number.isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function MusicDrawer() {
  const audioRef = useRef(null);
  const sheetRef = useRef(null);
  const wantPlay = useRef(false);
  const startRef = useRef({ y: 0, base: 0, H: 0, moved: false });

  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(null); // posisi (px) saat ditarik
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  const track = TRACKS[index];

  // Buat elemen audio sekali
  useEffect(() => {
    const a = new Audio();
    a.preload = 'metadata';
    audioRef.current = a;

    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDur(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      wantPlay.current = true;
      if (TRACKS.length < 2) {
        a.currentTime = 0;
        a.play().catch(() => {});
      } else {
        setIndex((i) => (i + 1) % TRACKS.length);
      }
    };

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnd);
    return () => {
      a.pause();
      a.removeAttribute('src');
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  // Ganti lagu
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !TRACKS.length) return;
    a.src = TRACKS[index].url;
    setTime(0);
    setDur(0);
    if (wantPlay.current) a.play().catch(() => setPlaying(false));
  }, [index]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !TRACKS.length) return;
    if (a.paused) {
      wantPlay.current = true;
      a.play().catch(() => {});
    } else {
      wantPlay.current = false;
      a.pause();
    }
  };

  const go = (dir) => {
    if (!TRACKS.length) return;
    wantPlay.current = true;
    setIndex((i) => (i + dir + TRACKS.length) % TRACKS.length);
  };

  const pick = (i) => {
    if (i === index) {
      toggle();
      return;
    }
    wantPlay.current = true;
    setIndex(i);
  };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Number(e.target.value);
    setTime(a.currentTime);
  };

  // Tarikan: geser gagang ke atas buat buka, ke bawah buat tutup. Ketuk = buka/tutup.
  const onDown = (e) => {
    const H = sheetRef.current?.offsetHeight ?? 0;
    startRef.current = { y: e.clientY, base: open ? 0 : H - PEEK, H, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(startRef.current.base);
  };
  const onMove = (e) => {
    if (drag === null) return;
    const s = startRef.current;
    const dy = e.clientY - s.y;
    if (Math.abs(dy) > 4) s.moved = true;
    setDrag(Math.max(0, Math.min(s.H - PEEK, s.base + dy)));
  };
  const onUp = () => {
    if (drag === null) return;
    const s = startRef.current;
    if (!s.moved) setOpen((o) => !o);
    else setOpen(drag < (s.H - PEEK) / 2);
    setDrag(null);
  };

  const transform =
    drag !== null
      ? `translate3d(0, ${drag}px, 0)`
      : open
        ? 'translate3d(0, 0, 0)'
        : `translate3d(0, calc(100% - ${PEEK}px), 0)`;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[64] bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[65] flex justify-center">
        <div
          ref={sheetRef}
          className="pointer-events-auto flex h-[min(520px,76svh)] w-full max-w-md flex-col rounded-t-3xl border border-b-0 border-[#e3d8c6] bg-[#faf6ee]/95 backdrop-blur-xl"
          style={{
            transform,
            transition: drag === null ? 'transform 500ms cubic-bezier(0.16,1,0.3,1)' : 'none',
          }}
        >
          {/* Gagang tarikan */}
          <div
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="flex flex-none cursor-grab touch-none select-none flex-col items-center active:cursor-grabbing"
            style={{ height: PEEK }}
          >
            <span className="mt-2 h-1 w-9 rounded-full bg-white/40" />
            <span className="mt-1.5 flex max-w-[80%] items-center gap-1.5 truncate text-[11px] leading-none text-[#7a2039] font-medium">
              <Music2 className="h-3 w-3 flex-none text-[#800020]" />
              <span className="truncate">
                {playing && track ? track.title : 'tarik buat putar lagu'}
              </span>
            </span>
          </div>

          {/* Isi pemutar */}
          <div className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-3">
            {TRACKS.length === 0 ? (
              <p className="m-auto max-w-[16rem] text-center text-sm leading-relaxed text-[#7a2039] font-medium">
                Belum ada lagu. Taruh file .mp3 di folder src/assets/music, lalu refresh halaman.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div
                    className="relative h-20 w-20 flex-none animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#1a1030,#2b1b4d,#1a1030,#2b1b4d,#1a1030)] ring-1 ring-white/15"
                    style={{ animationPlayState: playing ? 'running' : 'paused' }}
                  >
                    <span className="absolute inset-[30%] rounded-full bg-[#800020]" />
                    <span className="absolute inset-[45%] rounded-full bg-[#0d0917]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-[#580016]">{track.title}</p>
                    <p className="truncate text-sm text-[#7a2039]">
                      {track.artist || 'Playlist favoritmu'}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <input
                    type="range"
                    min={0}
                    max={dur || 0}
                    step="0.1"
                    value={Math.min(time, dur || 0)}
                    onChange={seek}
                    aria-label="Posisi lagu"
                    className="w-full cursor-pointer accent-[#800020]"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-[#800020]/70">
                    <span>{fmt(time)}</span>
                    <span>{fmt(dur)}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Lagu sebelumnya"
                    className="cursor-pointer text-[#580016] transition-colors hover:text-[#580016]"
                  >
                    <SkipBack className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={playing ? 'Jeda' : 'Putar'}
                    className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#800020] text-[#580016] transition-transform hover:bg-[#600018] active:scale-95"
                  >
                    {playing ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Lagu berikutnya"
                    className="cursor-pointer text-[#580016] transition-colors hover:text-[#580016]"
                  >
                    <SkipForward className="h-6 w-6" />
                  </button>
                </div>

                <ul className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                  {TRACKS.map((t, i) => (
                    <li key={t.url}>
                      <button
                        type="button"
                        onClick={() => pick(i)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                          i === index ? 'bg-white/10 text-[#580016]' : 'text-[#7a2039] font-medium hover:bg-white/5'
                        }`}
                      >
                        <span className="w-5 flex-none text-xs text-[#580016]/50">{i + 1}</span>
                        <span className="min-w-0 flex-1 truncate">{t.title}</span>
                        {i === index && playing && (
                          <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#800020]" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}