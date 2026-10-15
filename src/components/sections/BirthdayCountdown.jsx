import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useReveal } from '../story/kit';

// Tanggal ulang tahun: 17 Oktober 2026 (bulan 0-indexed: 9 = Oktober)
const BIRTH_YEAR = 2026;
const BIRTH_MONTH = 9;
const BIRTH_DAY = 17;

const pad = (v) => String(v).padStart(2, '0');

function getState(now) {
  const target = new Date(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
  const isBirthday = now >= target && now < new Date(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY + 1, 0, 0, 0);
  const diff = Math.max(0, target - now);
  const totalSec = Math.floor(diff / 1000);

  return {
    isBirthday,
    target,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-[#e3d8c6] bg-white shadow-md shadow-[#800020]/5 px-2 py-5 md:py-8">
      <span className="text-[clamp(2rem,9vw,5rem)]  font-bold leading-none tabular-nums tracking-tight text-[#580016]">
        {value}
      </span>
      <span className="mt-3 text-xs font-semibold tracking-wider text-[#800020] uppercase md:text-sm font-serif">{label}</span>
    </div>
  );
}

export default function BirthdayCountdown() {
  const ref = useRef(null);
  const [state, setState] = useState(() => getState(new Date()));
  useReveal(ref);

  useEffect(() => {
    const id = setInterval(() => setState(getState(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const dateText = state.target.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section
      id="countdown"
      ref={ref}
      className="bg-[#fbf9f5] px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-4xl text-center">
        {state.isBirthday ? (
          <>
            <Heart className="mx-auto mb-6 h-10 w-10 animate-pulse text-[#800020] fill-[#800020]" />
            <h2
              data-r
              className="mb-4 text-4xl font-semibold tracking-tight text-[#580016]  md:text-6xl"
            >
              Selamat Ulang Tahun
            </h2>
            <p data-r className="mx-auto max-w-md text-sm leading-relaxed text-[#7a2039] font-medium md:text-base">
              Hari ini hari kamu. Semoga semua yang kamu harapin pelan-pelan jadi nyata, dan
              aku masih jadi bagian dari harinya.
            </p>
          </>
        ) : (
          <>
            <h2
              data-r
              className="mb-3 text-3xl font-semibold tracking-tight text-[#580016]  md:text-5xl"
            >
              Hitung Mundur ke 17 Oktober 2026
            </h2>
            <p data-r className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-[#7a2039] font-medium md:text-base">
              Menuju hari spesial kita ke Walking Drums dan Bloom Moo Tea House pada {dateText}.
            </p>

            <div data-r className="grid grid-cols-4 gap-2 md:gap-5" role="timer" aria-live="off">
              <Unit value={state.days} label="hari" />
              <Unit value={pad(state.hours)} label="jam" />
              <Unit value={pad(state.minutes)} label="menit" />
              <Unit value={pad(state.seconds)} label="detik" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}