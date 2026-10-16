/**
 * music.js
 * File lagu ada di public/musics -> diakses lewat /musics/<nama file>.
 *
 * !! PENTING: nama file harus PERSIS sama dengan di folder public/musics.
 * Dua nama di bawah terpotong di screenshot, jadi WAJIB dicek:
 *   - FILE_KEKAL
 *   - FILE_NADIN
 * Cara cek: klik file di Explorer -> F2 -> salin nama lengkapnya (termasuk .mp3).
 * Tes cepat: buka http://localhost:5173/musics/<nama file> di browser.
 */

const FILE_KEKAL = 'Kekal - Nadin Amizah Lirik Lagu.mp3'; // <-- GANTI sesuai nama asli
const FILE_NADIN = 'Nadin_Amizah_-_Semua_Aku_Dirayakan.mp3'; // <-- GANTI sesuai nama asli
const FILE_PURPLE = 'Olivia Rodrigo - purple.mp3';
const FILE_DROPDEAD = 'drop dead(MP3_160K).mp3';
const FILE_HONEYBEE = 'Olivia Rodrigo - honeybee (Lyrics).mp3';
const FILE_LOVER = 'Taylor Swift - Lover.mp3';

// encodeURI supaya spasi dan tanda kurung aman di URL
const pub = (filename) => encodeURI(`/musics/${filename}`);

// Cover cadangan (pink polos) kalau artwork kosong
const FALLBACK_ART =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="%23f7c6d3"/></svg>';

const OLIVIA_ART =
  'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1d/1b/f9/1d1bf9b1-44c6-9a6c-6ffb-c158488c06ce/26UMGIM39303.rgb.jpg/300x300bb.jpg';

const ALL_TRACKS = {
  kekal: {
    id: 'kekal',
    title: 'Kekal',
    artist: 'Nadin Amizah',
    album: 'Kekal',
    artwork: 'https://i.pinimg.com/736x/ff/59/fa/ff59fa5aaed2472b8ec44905460a00cc.jpg', // isi URL cover Kekal kalau mau
    url: pub(FILE_KEKAL),
  },
  nadin: {
    id: 'semua-aku-dirayakan',
    title: 'Semua Aku Dirayakan',
    artist: 'Nadin Amizah',
    album: 'Selamat Ulang Tahun',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c1/b0/f7/c1b0f7fa-f141-7c53-9531-0b248b06e96c/cover.jpg/300x300bb.jpg',
    url: pub(FILE_NADIN),
  },
  purple: {
    id: 'purple',
    title: 'purple',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork: OLIVIA_ART,
    url: pub(FILE_PURPLE),
  },
  dropdead: {
    id: 'drop-dead',
    title: 'drop dead',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork: OLIVIA_ART,
    url: pub(FILE_DROPDEAD),
  },
  honeybee: {
    id: 'honeybee',
    title: 'honeybee',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork: OLIVIA_ART,
    url: pub(FILE_HONEYBEE),
  },
  lover: {
    id: 'lover',
    title: 'Lover',
    artist: 'Taylor Swift',
    album: 'Lover',
    artwork: null, // isi URL cover Lover kalau mau
    url: pub(FILE_LOVER),
  },
};

// Pastikan artwork selalu ada supaya notch tidak error
const build = (order) =>
  order
    .map((k) => ALL_TRACKS[k])
    .filter(Boolean)
    .map((t) => ({ ...t, artwork: t.artwork || FALLBACK_ART }));

// Saat web dibuka: Kekal -> Nadin -> purple -> drop dead -> honeybee -> Lover
export const PLAYLIST_INITIAL = build(['kekal', 'nadin', 'purple', 'dropdead', 'honeybee', 'lover']);

// Saat buku dibuka: Kekal -> drop dead -> purple -> Nadin -> honeybee -> Lover
// Saat buku dibuka: drop dead -> purple -> Nadin -> Kekal -> honeybee -> Lover
export const PLAYLIST_SKETCHBOOK = build(['dropdead', 'purple', 'nadin', 'kekal', 'honeybee', 'lover']);