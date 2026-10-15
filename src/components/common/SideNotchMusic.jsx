import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Music2,
  Heart,
} from 'lucide-react';
import { PLAYLIST_INITIAL, PLAYLIST_SKETCHBOOK } from '../../data/music';
import { playPop } from '../../utils/sound';

const AUTOPLAY = true; // putar otomatis saat web dibuka
const INITIAL_VOLUME = 0.85;
const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'click'];

// Pita coquette
function Bow({ className = '' }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <path d="M24 16 C31 25 33 28 34 30 L27.5 28 L24 22Z" fill="#f4b6c6" stroke="#d9768f" strokeWidth="1" strokeLinejoin="round" />
      <path d="M24 16 C17 25 15 28 14 30 L20.5 28 L24 22Z" fill="#f4b6c6" stroke="#d9768f" strokeWidth="1" strokeLinejoin="round" />
      <path d="M24 16 C16 2 3 2 2 9 C1 18 12 22 24 16Z" fill="#f7c6d3" stroke="#d9768f" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M24 16 C32 2 45 2 46 9 C47 18 36 22 24 16Z" fill="#f7c6d3" stroke="#d9768f" strokeWidth="1.2" strokeLinejoin="round" />
      <ellipse cx="24" cy="16" rx="4" ry="4.6" fill="#ec93aa" stroke="#d9768f" strokeWidth="1" />
    </svg>
  );
}

export default function SideNotchMusic() {
  const audioRef = useRef(null);
  const loadedIdRef = useRef(null); // id lagu yang sedang ter-load di elemen audio
  const userPausedRef = useRef(false); // true kalau user sendiri yang menjeda
  const playlistLenRef = useRef(PLAYLIST_INITIAL.length);

  const [playlist, setPlaylist] = useState(PLAYLIST_INITIAL);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(INITIAL_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const currentTrack = playlist[currentIndex] || playlist[0];

  const formatTime = (secs) => {
    if (!secs || Number.isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  playlistLenRef.current = playlist.length;

  // Buat audio sekali + autoplay
  useEffect(() => {
    if (!PLAYLIST_INITIAL.length) return undefined;

    const a = new Audio();
    a.preload = 'auto';
    a.src = PLAYLIST_INITIAL[0].url;
    a.volume = INITIAL_VOLUME;
    loadedIdRef.current = PLAYLIST_INITIAL[0].id;
    audioRef.current = a;

    const onTime = () => setCurrentTime(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setCurrentIndex((i) => (i + 1) % playlistLenRef.current);

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnded);

    // Kalau browser memblokir autoplay, mulai di interaksi pertama
    // (kecuali user sudah menjeda sendiri)
    const startOnInteraction = () => {
      UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, startOnInteraction));
      if (!userPausedRef.current && a.paused) a.play().catch(() => {});
    };

    if (AUTOPLAY) {
      a.play().catch(() => {
        UNLOCK_EVENTS.forEach((e) =>
          window.addEventListener(e, startOnInteraction, { passive: true })
        );
      });
    }

    return () => {
      UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, startOnInteraction));
      a.pause();
      a.removeAttribute('src');
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnded);
    };
  }, []);

  // Buku dibuka -> langsung drop dead, lalu purple, lalu Nadin
  useEffect(() => {
    const onOpenSketchbook = () => {
      const a = audioRef.current;
      const first = PLAYLIST_SKETCHBOOK[0];
      if (!a || !first) return;
      userPausedRef.current = false;
      setPlaylist(PLAYLIST_SKETCHBOOK);
      setCurrentIndex(0);
      loadedIdRef.current = first.id;
      a.src = first.url;
      a.currentTime = 0;
      a.play().catch(() => {});
    };
    window.addEventListener('aneska-open-sketchbook', onOpenSketchbook);
    return () => window.removeEventListener('aneska-open-sketchbook', onOpenSketchbook);
  }, []);

  // Ganti lagu (next / prev / pilih / habis)
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentTrack) return;
    if (loadedIdRef.current === currentTrack.id) return;
    loadedIdRef.current = currentTrack.id;
    a.src = currentTrack.url;
    a.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    a.play().catch(() => {});
  }, [currentTrack]);

  // Volume & mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    playPop();
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      userPausedRef.current = false;
      a.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      a.pause();
    }
  };

  const nextTrack = () => {
    playPop();
    userPausedRef.current = false;
    setCurrentIndex((i) => (i + 1) % playlist.length);
  };

  const prevTrack = () => {
    playPop();
    userPausedRef.current = false;
    setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
  };

  const handleSeek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setCurrentTime(a.currentTime);
  };

  if (!currentTrack) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed right-0 top-1/2 z-[85] -translate-y-1/2 select-none">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* ===== TERTUTUP: tab pita pink di sisi kanan ===== */
          <motion.button
            key="collapsed"
            type="button"
            aria-label="Buka pemutar musik"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={() => {
              playPop();
              setIsExpanded(true);
            }}
            className="group relative flex cursor-pointer flex-col items-center gap-2 rounded-l-[28px] border border-r-0 border-[#f0b8c6] bg-[#fff5f6]/95 px-2 pb-3 pt-2 shadow-[-4px_6px_18px_rgba(217,118,143,0.28)] backdrop-blur-md transition-all duration-300 hover:pr-3 hover:shadow-[-6px_8px_22px_rgba(217,118,143,0.4)]"
          >
            <Bow className={`h-5 w-8 ${isPlaying ? 'animate-pulse' : ''}`} />

            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-[0_0_0_1px_#f0b8c6]">
              <img
                src={currentTrack.artwork}
                alt=""
                className={`h-full w-full object-cover ${isPlaying ? 'animate-[spin_5s_linear_infinite]' : ''}`}
              />
              <span className="absolute inset-0 m-auto h-2 w-2 rounded-full border border-[#f0b8c6] bg-[#fff5f6]" />
            </div>

            <div className="flex h-4 items-end gap-[3px]">
              {[0.5, 1, 0.7].map((s, i) => (
                <span
                  key={i}
                  className={`w-[3px] rounded-full bg-[#e98aa4] ${isPlaying ? 'animate-pulse' : 'opacity-40'}`}
                  style={{
                    height: isPlaying ? `${s * 16}px` : '4px',
                    animationDuration: `${0.5 + i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <ChevronLeft className="h-3.5 w-3.5 text-[#c9627d] transition-transform group-hover:-translate-x-0.5" />
          </motion.button>
        ) : (
          /* ===== TERBUKA: kartu coquette ===== */
          <motion.div
            key="expanded"
            initial={{ x: 260, opacity: 0, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 280, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative mr-2 w-[300px] rounded-[28px] border border-[#f0b8c6] bg-[#fff5f6]/95 p-2 shadow-[-8px_12px_32px_rgba(217,118,143,0.3)] backdrop-blur-xl sm:w-[330px]"
          >
            {/* Pita di atas kartu */}
            <Bow className="absolute -top-4 left-1/2 z-10 h-8 w-12 -translate-x-1/2 drop-shadow-sm" />

            {/* Bingkai renda putus-putus */}
            <div className="rounded-[22px] border border-dashed border-[#f0b8c6] px-4 pb-4 pt-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className="flex items-center gap-1.5 text-[13px] italic text-[#c9627d]"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  <Heart className="h-3 w-3 fill-[#f4a3b8] text-[#f4a3b8]" />
                  
                </span>
                <button
                  type="button"
                  aria-label="Tutup pemutar"
                  onClick={() => {
                    playPop();
                    setIsExpanded(false);
                  }}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#fbdde5] text-[#c9627d] transition-colors hover:bg-[#f7c6d3]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Cover + judul */}
              <div className="my-4 flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <div
                    className={`absolute -right-3 top-1/2 h-[72px] w-[72px] -translate-y-1/2 rounded-full border border-[#f0b8c6] bg-[conic-gradient(from_0deg,#fbdde5,#f7c6d3,#fbdde5,#f7c6d3,#fbdde5)] ${
                      isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                    }`}
                  >
                    <div className="absolute inset-2 rounded-full border border-white/70" />
                    <div className="absolute inset-0 m-auto h-4 w-4 rounded-full border border-[#f0b8c6] bg-[#fff5f6]" />
                  </div>
                  <div className="relative z-10 h-20 w-20 overflow-hidden rounded-2xl border-2 border-white shadow-[0_4px_12px_rgba(217,118,143,0.35)]">
                    <img
                      src={currentTrack.artwork}
                      alt={currentTrack.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1 pl-2">
                  <h4
                    className="truncate text-xl italic leading-tight text-[#800020]"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </h4>
                  <p
                    className="mt-0.5 truncate text-xs text-[#a8566d]"
                    style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                  >
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Progress pita + hati */}
              <div className="space-y-1">
                <div
                  onClick={handleSeek}
                  className="relative h-3 w-full cursor-pointer rounded-full bg-[#fbdde5] shadow-inner"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f7c6d3] to-[#ec93aa]"
                    style={{ width: `${progress}%` }}
                  />
                  <Heart
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 fill-[#e98aa4] text-white"
                    style={{ left: `${Math.min(Math.max(progress, 3), 97)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] tabular-nums text-[#a8566d]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Kontrol */}
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setShowPlaylist((v) => !v);
                  }}
                  className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    showPlaylist
                      ? 'bg-[#ec93aa] text-white'
                      : 'bg-[#fbdde5] text-[#c9627d] hover:bg-[#f7c6d3]'
                  }`}
                >
                  <Music2 className="h-3 w-3" />
                  <span>Playlist</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevTrack}
                    title="Sebelumnya"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#c9627d] transition-colors hover:bg-[#fbdde5]"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    title={isPlaying ? 'Jeda' : 'Putar'}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#f4a3b8] to-[#e0708f] text-white shadow-[0_4px_12px_rgba(217,118,143,0.5)] transition-transform hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-white" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4 fill-white" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={nextTrack}
                    title="Selanjutnya"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#c9627d] transition-colors hover:bg-[#fbdde5]"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setIsMuted((v) => !v);
                  }}
                  title={isMuted ? 'Suara nyala' : 'Bisukan'}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#c9627d] transition-colors hover:bg-[#fbdde5]"
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Daftar lagu */}
              <AnimatePresence>
                {showPlaylist && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 overflow-hidden rounded-2xl border border-dashed border-[#f0b8c6] bg-white/60 p-1.5"
                  >
                    <div className="max-h-[160px] space-y-1 overflow-y-auto pr-1 text-xs">
                      {playlist.map((t, idx) => {
                        const active = idx === currentIndex;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              playPop();
                              userPausedRef.current = false;
                              setCurrentIndex(idx);
                            }}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition-colors ${
                              active ? 'bg-[#fbdde5] text-[#800020]' : 'text-[#a8566d] hover:bg-[#fff0f3]'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate text-xs font-medium">{t.title}</p>
                              <p className="truncate text-[10px] opacity-70">{t.artist}</p>
                            </div>
                            {active && <Heart className="h-3 w-3 flex-none fill-[#e98aa4] text-[#e98aa4]" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}