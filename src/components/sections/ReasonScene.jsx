import { useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { playPop } from '../../utils/sound';
import { useReveal, prefersReduced } from '../story/kit';
//import bunga from 'https://images.unsplash.com/vector-1738161857018-15d97f82e0cb?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';

// Foto tiap momen. Ganti nama file sesuai isi src/assets/images kamu.
import foto1 from '../../assets/images/8.jpeg';
import foto2 from '../../assets/images/10.jpeg';
import foto3 from '../../assets/images/3.png';
import foto4 from '../../assets/images/bunga1.png';
import foto5 from '../../assets/images/kadohaikal.png';
import foto6 from '../../assets/images/ultahanes1.png';
import foto7 from '../../assets/images/uks.jpeg';
import foto9 from '../../assets/images/callpertama.jpeg';
import foto10 from '../../assets/images/bunga3.jpeg';
import foto11 from '../../assets/images/9.jpeg';
import foto12 from '../../assets/images/31des.png';
import foto13 from '../../assets/images/sekertaiat.png';
import foto14 from '../../assets/images/bunga3.png';
import foto15 from '../../assets/images/bukber.png';
import foto16 from '../../assets/images/paparazibukbersekolah.png';
import foto17 from '../../assets/images/pertamakaliketemusetelahlebaran.png';
import foto18 from '../../assets/images/landscape1.png';
import foto19 from '../../assets/images/landscape2.png';
import foto20 from '../../assets/images/nyender.png';
import foto21 from '../../assets/images/koridur.jpeg';
import foto22 from '../../assets/images/landscape3.png';
import foto23 from '../../assets/images/masakan.png';
import foto24 from '../../assets/images/anesk.jpeg';
import foto25 from '../../assets/images/pertamakaliketemumamaayah.png';

import foto26 from '../../assets/images/bunga.png';

import foto27 from '../../assets/images/3.png';
import foto28 from '../../assets/images/keychain2.png';

import foto29 from '../../assets/images/ultahhaikal2.jpeg';


const FONT_STACK = "font-[-apple-system,BlinkMacSystemFont,'Inter',sans-serif]";
const FONT_TITLE = FONT_STACK;
const FONT_BODY = FONT_STACK;

const bunga =
  'https://static.vecteezy.com/system/resources/previews/051/338/322/non_2x/pink-lily-flower-on-a-transparent-background-free-png.png';

// Satu momen = satu foto + judul + teks pendek (sekitar 70 karakter).
// Satu momen = satu foto + judul + teks pendek (sekitar 70 karakter).
const MOMENTS = [
  { image: foto1, title: 'First time!', text: 'PAS ITU KITA DI PAKSA BUAT FOTBAR JUJUR AKU PENGEN SIH HEHE' },
  { image: foto2, title: 'Pas kita keragunan naik tj', text: 'Tanggal : 22 Feb 2025, Tempat : Ragunan Zoo , WKAKWAKW INI KITA PULANG NYA AGAK KEMALEMAN KAN TERUS' },
  { image: foto3, title: 'Nonton pertama kali.', text: 'WKAWKK INI DII KOKASS KITA NONTON DEMON SLAYERR DAN PULANG NYA MAM WINGSTOPP' },
  { image: foto4, title: 'First Flower', text: 'Inii kamuu pas abiss lombaa dan juaraa YEYEYEYYE DANN DISINI KAMU SHOCK BANGETT AKU KASI BUNGA TIBA TIBA DAN INI FIRST EXPERIENCE DAIR KITA BERDUA KARENA KAMU PERTAMA KALI DAPET BUNGA DAN AKU PERTAMA KALI NGASIH CEWE BUNGA' },
  { image: foto5, title: 'Ulang Tahun pertama aku bersama kamu', text: 'Cewe pertama yang ngerayain ulangtahun aku SUMPAH DISINI AKU KAYA GA EXPECT BANGETT DI KASII KADO SAYANGGG MAKASIHHHH AKU DI KASII KEYCHAIN' },
  { image: foto6, title: 'Ulang tahun kamu', text: 'DISINIII AWLA MULA KITA BISAA SERING NGOBROL DI SEKOLAHH AKU SENENG BANGET HARI ITU SEKALIGUSS BUNGA KE 2 DAN KEYCHAIN COUPLE PERTAMAA KITA' },
  { image: foto11, title: 'Waktu ke museum', text: 'AKU SENENGGG BANGET KITA BANYAK MOMEN BERDUA NYA PAS INIII DAN KITA MEWARNAIII GITU' },
  { image: foto7, title: 'foto bareng di sekolah', text: 'FOTBAR PERTAMAAA KITA DI SEKOLAHH DAN DISINI KITA BANYAK MOMENN BERDUA DI DEPAN UKS SAYANG' },
  { image: foto9, title: 'Pertama kali kita call an', text: 'PERTAMAA KALI KITAA CALL AN DAN INI NGEBAHASS MTK TAPI LANJUTTT SAMPEE SEBELUM BOBOO' },
  { image: foto10, title: 'Bunga ke 3', text: 'INI BENTUKK APRESIASII AKU KARENAA KAMU SUDA MENYELEESAIKAN UJIAN DENGANN BAIKK2' },
  { image: foto3, title: 'Nonton ke 2', text: 'INIII KITA NONTONN AVATAR DI KOKASSS PULANGG NYA MAMM RAMEEN YA TAPI KARENA KITA MASI LAPAR JADI KITA LANJUT MAM BEBEK DEKET RUMAH KAMU' }, // TODO: ganti ke foto nonton ke 2
  { image: foto12, title: 'Ketemu trakhir di 2025', text: 'INIII PAS KITA KETEMJUU TERAKHIRR DI 2025 DAN KAMU NGIRIM FOTO PERTAMA KALI TANPA SEKALI LIHAT FOTO NYA FOTO MATA KAMU DENGAN JARI KAMU' },
  { image: foto13, title: 'Pas kitaa ke setneg', text: 'DISINIII HUJAN GEDEE BANGETT DAN KITA PULANG NYAA MUTER MUTER DAERAH RUMAHH AKUU' },
  { image: foto14, title: 'Iniii valentine pertamaa kita', text: 'DISINII KAMU KASIII CHEESEE CAKEEE YAANG ENAKK ENAKK BANGET SEKALIGUSS INIII BUNGAA KE 4' },
  { image: foto15, title: 'Bukber berduaa pertamaa', text: 'DISINII KITA PERATAMAA KALI BUKBERR BERDUA' },
  { image: foto16, title: 'Bukber di sekolah', text: 'DISINII AKU PAPARAZI KAMU CANTIKKKKK' },
  { image: foto17, title: 'Pertama kali kita ketemuu setelah lebaran dan setelah kaki aku sembuh', text: 'PERTAMAA KALI KETEMUU SETELAHH LEBARAANN DAN INII SETELAH KAKI AKU SEMBUH' },
  { image: foto18, title: 'Foto landscapee ke 2', text: 'DISINII AKU SENNEG BANGET KAMU KIRIMM FOTO NO SEKALI LIAT DAN INI POSISI NYA KAMU LAGI PERGI' },
  { image: foto19, title: 'Foto landscape ke 3', text: 'DISINII KAMU LAGI PERGII JUGAA DAN AKU SENENG BGTT KM KIRIMM FOTO GEMEY' },
  { image: foto20, title: 'PERTAMA KALI KAMU SENDERAN KE AKU', text: 'WKWKWK AKU SENENGGG BNGTT DISIINII KAMU NYENDERAN KE AKUUU DISDBSAFAHADHASKJ' },
  { image: foto21, title: 'foto bareng di sekolah kee 2 paparazi', text: 'INIII FOTOOO DI KORIDORR SEKOLAHH GEMESS BANGET' },
  { image: foto22, title: 'Landscape ke 4', text: 'KAKWKAWKA INI SENENG BANGETT AKUUU KM CANTIKK BANGETT KAMU FOTO BACKGROUND NYA TALIWANG BALI' },
  { image: foto23, title: 'Pertama kali aku cobainn masakan mama', text: 'INII PAS MALEM TAKIBRANNN DAN MASAKAN MAMA ENAKKK BGTT' },
  { image: foto27, title: 'Foto gemess kita', text: 'FOTO NYA IINII BAGUSS DAN INII DEPAN MEJA RESEPSIONIS' },
  { image: foto25, title: 'Pertama kali anes ketemuu mama ayahh aku', text: 'DISINII KAMU GEMEESS BANGETT KWKAWKK MALU MALU' },
  { image: foto26, title: 'Bunga ke 5', text: 'BENTUKK APRESIASII AKUU JUGAA KAMU SUDAA BERUSAHAA UNTUK LOMBAA SAYANGGG' },
  { image: foto24, title: 'Nonton bareng keluarga anes', text: 'NDJSANDKJANDIS INI PERTAMAA KALI AKU KETEMU KELUARGAA BESARR KAMU DAN IKUT NONTON' },
  { image: foto28, title: 'Keychain ke dua kitaaa', text: 'INII LUCUU BANGET KITA BUAT VID UNBOXING KEYCHAIN SPIDERMANN' },
  { image: foto29, title: 'ULANGG TAHUN AKU YANG KE DUA BERSAMAA KAMU', text: 'KDNSAJKDSNKAJD DISINI AKU NANGISS BANGET AKU NGERASA DI RAYAINN BANGETT SAYANG DJKASKDAFAS SENENG BANGET MAKASIHH SAYANG AKU CINTA BANGET SAMA KAMUUUE' },
];

const ALL_OPENED = 'udah kebuka semua. momen kita masih bakal nambah terus.';

const pad = (v) => String(v).padStart(2, '0');

export default function ReasonsScene() {
  const ref = useRef(null);
  const [flipped, setFlipped] = useState(() => new Set());
  const [seen, setSeen] = useState(() => new Set());
  useReveal(ref);

  const toggle = (i) => {
    playPop();
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    setSeen((prev) => new Set(prev).add(i));
  };

  const flipTransition = prefersReduced() ? 'none' : 'transform 700ms cubic-bezier(0.16,1,0.3,1)';

  return (
    <section
      id="photos"
      ref={ref}
      className={`relative overflow-hidden bg-[#fffbfa] px-4 pb-24 pt-12 md:px-8 md:pb-32 ${FONT_BODY}`}
    >
      {/* Background bunga */}
      

{/* Background bunga */}

{/* Background bunga kecil di belakang objek */}
<div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0 z-20 bg-center bg-no-repeat"
  style={{
    backgroundImage: `url("${bunga}")`,
    backgroundSize: '700px auto',
    filter: 'grayscale(1) brightness(1.1) sepia(0.2) opacity(0.18)',
  }}
/>

{/* Overlay tipis agar teks tetap terbaca */}
{/* <div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fffbfa]/25 via-[#fffbfa]/10 to-[#fffbfa]/50"
/> */}



      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 max-w-xl">
          <h2
            data-r
            className={`mb-3 text-3xl font-semibold tracking-tight text-[#580016] md:text-5xl ${FONT_TITLE}`}
          >
            Us!
          </h2>
          <p data-r className="text-sm font-medium leading-relaxed text-[#7a2039] md:text-base">
            I remember every moment, every detail. If you want proof, just tap the card.
          </p>
        </div>

        <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-4 md:gap-6">
          {MOMENTS.map((r, i) => {
  const isFlipped = flipped.has(i);

  return (
    <div key={r.title} data-r className="even:mt-6 md:even:mt-10">
      <button
        type="button"
        onClick={() => toggle(i)}
        aria-pressed={isFlipped}
        aria-label={`Momen ${i + 1}: ${isFlipped ? r.title : 'Touch Me!'}`}
        className="group block w-full cursor-pointer rounded-2xl text-left transition-transform duration-300 [perspective:1000px] hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#800020]"
      >
        <span
          className="relative block aspect-[3/4] w-full [transform-style:preserve-3d]"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: flipTransition,
          }}
        >
          {/* Depan: foto */}
          <span
            className="absolute inset-0 block overflow-hidden rounded-2xl border border-[#e3d8c6] bg-white shadow-md shadow-[#800020]/5 [backface-visibility:hidden]"
            style={{ WebkitBackfaceVisibility: 'hidden' }}
          >
            {r.image && (
              <img
                src={r.image}
                alt={r.title}
                draggable={false}
                loading="eager"
                className="h-full w-full object-cover"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-[#580016]/80 via-transparent to-black/10" />
            <span
              className={`absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#580016] backdrop-blur ${FONT_TITLE}`}
            >
              {pad(i + 1)}
            </span>
            <span className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 text-xs font-medium text-white">
              <Heart className="h-3.5 w-3.5 fill-[#faf6ee]/50 text-[#faf6ee]" />
              <span>Touch Me!</span>
            </span>
          </span>

          {/* Belakang: momen */}
          <span
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e3d8c6] bg-[#faf6ee] p-3.5 shadow-md shadow-[#800020]/5 [backface-visibility:hidden] md:p-5"
            style={{ transform: 'rotateY(180deg)', WebkitBackfaceVisibility: 'hidden' }}
          >
            <span className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold tabular-nums text-[#800020] ${FONT_TITLE}`}>
                {pad(i + 1)}
              </span>
              <Heart className="h-3.5 w-3.5 fill-[#800020]/20 text-[#800020]" />
            </span>

            <span className="block">
              <span
                className={`mb-1.5 block text-base font-semibold tracking-tight text-[#580016] md:text-xl ${FONT_TITLE}`}
              >
                {r.title}
              </span>
              <span className="block text-xs font-medium leading-relaxed text-[#5a2030] md:text-sm">
                {r.text}
              </span>
            </span>

            <span className="hidden text-[11px] font-medium text-[#800020]/60 md:block">
              ketuk lagi buat tutup
            </span>
          </span>
        </span>
      </button>
    </div>
  );
})}
        </div>

        <p data-r className="mt-12 text-center text-xs font-medium text-[#800020]/80 md:text-sm">
          {seen.size < MOMENTS.length
            ? `${seen.size} / ${MOMENTS.length} momen udah kebuka`
            : ALL_OPENED}
        </p>
      </div>
    </section>
  );
}