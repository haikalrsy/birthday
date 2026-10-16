import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Scissors, Clock, Key } from 'lucide-react';
import { playTear, playPop } from '../../utils/sound';

// Target Unlock: 17 Oktober 2026, 09:00:00 WIB (UTC+7)
const TARGET_TIMESTAMP = new Date('2026-10-17T09:00:00+07:00').getTime();

export default function TearTicketGate({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isTorn, setIsTorn] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef(null);

  // Check URL bypass & unlock condition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasBypassParam =
      params.has('preview') ||
      params.has('pass') ||
      params.has('admin') ||
      params.get('unlock') === '1' ||
      window.location.hash.includes('preview');

    const hasStoredBypass = sessionStorage.getItem('aneska_preview_bypass') === 'true';

    const checkNow = () => {
      const now = Date.now();
      const diff = TARGET_TIMESTAMP - now;
      if (diff <= 0 || hasBypassParam || hasStoredBypass) {
        setIsUnlocked(true);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, total: diff });
      }
    };

    checkNow();
    const interval = setInterval(checkNow, 1000);

    // Check if ticket already torn before
    if (localStorage.getItem('aneska_ticket_torn') === 'true') {
      setIsTorn(true);
    }

    return () => clearInterval(interval);
  }, []);

  // Secret 3-tap bypass for previewing
  const handleSecretTap = () => {
    setTapCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        sessionStorage.setItem('aneska_preview_bypass', 'true');
        playPop(650);
        setIsUnlocked(true);
        return 0;
      }
      playPop(420 + next * 40);
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => setTapCount(0), 1800);
      return next;
    });
  };

  const handleTear = () => {
    if (isTorn) return;
    playTear();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 60]);
      } catch {}
    }
    setIsTorn(true);
    try {
      localStorage.setItem('aneska_ticket_torn', 'true');
    } catch {}
  };

  // If already unlocked (or bypassed), render the full website
  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#faf4ef] text-[#4a1525] flex flex-col items-center justify-center p-4 selection:bg-[#f6d0da]">
      {/* Background aesthetic textures & ambient blush glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#fde5eb] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#ebd1d8] blur-3xl opacity-50" />

      {/* Secret admin bypass hint button */}
      <button
        onClick={handleSecretTap}
        className="fixed top-4 right-4 z-50 p-2 text-[#a8546b]/40 hover:text-[#a8546b] transition-colors"
        title="Secret Bypass: tap 3x"
        aria-label="Secret Bypass"
      >
        <Key className="h-4 w-4 opacity-50" />
      </button>

      <main className="relative z-10 w-full max-w-md flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!isTorn ? (
            /* ==============================================================
               PHASE 1: TEAR TICKET SCREEN
               ============================================================== */
            <motion.div
              key="ticket-card"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center"
            >
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[#f6d5de] text-[#8e3952]">
                  <Sparkles className="h-3 w-3" /> Special Invitation
                </span>
                <h1 className="mt-3 text-2xl sm:text-3xl font-serif text-[#3e121e] tracking-tight">
                  Ada Hadiah Buat Kamu
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#7c4856]">
                  Sobek tiket di bawah ini untuk membuka undangan
                </p>
              </div>

              {/* Vintage Ticket Card */}
              <div className="relative w-full rounded-2xl bg-[#fffdfb] shadow-xl border border-[#ecd5dc] overflow-hidden flex flex-col select-none">
                {/* Upper / Left Main Body of Ticket */}
                <div className="p-6 pb-5 relative bg-gradient-to-b from-[#fffefe] to-[#faf3f4]">
                  {/* Watermark ornament */}
                  <div className="absolute right-4 top-4 text-[#eec7d2]/30 pointer-events-none">
                    <Heart className="h-28 w-28 -rotate-12 fill-current" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] tracking-[0.25em] text-[#a8546b] uppercase font-mono">
                    <span>BIRTHDAY TICKET</span>
                    <span>NO. 1710-ANE</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-widest text-[#9c6a77] font-sans">ADMIT ONE SPECIAL PERSON</p>
                    <p className="text-3xl font-serif italic text-[#4a1525] mt-0.5">Aneska</p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#f1dce2] pt-4 text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-[#9c6a77] tracking-wider">TANGGAL</p>
                      <p className="font-medium text-[#4a1525]">17 Oktober 2026</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[#9c6a77] tracking-wider">LOKASI</p>
                      <p className="font-medium text-[#4a1525]">Sebuah Ruang Kecil</p>
                    </div>
                  </div>
                </div>

                {/* Perforated Tear Line with Cutout Notches */}
                <div className="relative flex items-center justify-between py-1 bg-[#fffdfb]">
                  {/* Left semicircle cutout */}
                  <div className="absolute -left-3 h-6 w-6 rounded-full bg-[#faf4ef] border-r border-[#ecd5dc]" />
                  {/* Dashed cut line */}
                  <div className="w-full border-t-2 border-dashed border-[#e6b9c6] mx-4" />
                  {/* Right semicircle cutout */}
                  <div className="absolute -right-3 h-6 w-6 rounded-full bg-[#faf4ef] border-l border-[#ecd5dc]" />
                </div>

                {/* Lower / Right Stub to Tear */}
                <motion.div
                  className="p-5 pt-4 bg-[#fcf5f6] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#faeff1] active:scale-[0.99] transition-colors"
                  onClick={handleTear}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8e3952] tracking-wider uppercase">
                    <Scissors className="h-3.5 w-3.5 rotate-90 text-[#a8546b]" />
                    <span>Ketuk di Sini untuk Menyobek</span>
                  </div>
                  <p className="text-[11px] text-[#9c6a77] mt-1">
                    atau tekan tombol sobek di bawah
                  </p>
                </motion.div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleTear}
                className="mt-6 w-full py-3.5 px-6 rounded-full bg-[#8e3952] text-[#fff6f8] text-sm font-medium tracking-wide shadow-md hover:bg-[#7b2f44] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scissors className="h-4 w-4" />
                <span>Sobek Tiket Sekarang</span>
              </button>
            </motion.div>
          ) : (
            /* ==============================================================
               PHASE 2: COUNTDOWN GATE SCREEN
               ============================================================== */
            <motion.div
              key="countdown-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#f6d5de] text-[#8e3952] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-[#8e3952] animate-ping" />
                <span>Tiket Berhasil Divalidasi</span>
              </div>

              {/* Header with Secret 3-Tap Bypass on title */}
              <h1
                onClick={handleSecretTap}
                className="text-2xl sm:text-3xl font-serif text-[#3e121e] tracking-tight cursor-default select-none"
              >
                Tersedia Sebentar Lagi
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#7c4856] max-w-xs">
                Sesuatu yang spesial sedang dipersiapkan untuk merayakan hari ulang tahunmu.
              </p>

              {/* Countdown Timer Grid */}
              <div className="mt-8 w-full rounded-2xl bg-[#fffdfb] shadow-lg border border-[#ecd5dc] p-6">
                <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-[#a8546b] font-medium mb-5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Hitung Mundur Pembukaan</span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: 'Hari', value: timeLeft.days },
                    { label: 'Jam', value: timeLeft.hours },
                    { label: 'Menit', value: timeLeft.minutes },
                    { label: 'Detik', value: timeLeft.seconds },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center rounded-xl bg-[#faf3f4] p-3 sm:p-4 border border-[#f1dce2]"
                    >
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-[#4a1525] tabular-nums">
                        {String(item.value).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#9c6a77] mt-1 font-sans">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-[#f4e2e6] text-[11px] text-[#9c6a77] flex items-center justify-center gap-1">
                  <span>Mulai dapat dibuka:</span>
                  <strong className="text-[#8e3952] font-semibold">17 Oktober 2026 • 09:00 WIB</strong>
                </div>
              </div>

              {/* Sweet Note */}
              <div className="mt-6 px-4 py-3 rounded-xl bg-[#fff9fa]/80 border border-[#f4e0e5] max-w-sm">
                <p className="text-xs italic text-[#7c4856]">
                  "Be patient, beautiful things take a little time to bloom." 🌸
                </p>
                <p className="text-[10px] text-[#a8546b] mt-1">
                  Simpan link ini dan buka kembali besok pagi jam 9 ya!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer watermark */}
      <footer className="mt-12 text-center text-[10px] text-[#a8546b]/60 tracking-widest uppercase">
        Special for Aneska • 2026
      </footer>
    </div>
  );
}
