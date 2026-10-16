/**
 * music.js
 * Lagu diambil dari folder public/musics/ — tidak masuk Vite bundle,
 * hanya di-fetch browser saat audio pertama diplay.
 *
 * File yang ada:
 *   drop dead(MP3_160K).mp3
 *   Nadin_Amizah_-_Semua_Aku_Dirayakan_CeeNaija.com_.mp3
 *   Olivia Rodrigo - honeybee (Lyrics).mp3
 *   Olivia Rodrigo - purple.mp3
 *   Taylor Swift - Lover.mp3
 */

const OLIVIA_ART =
  'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1d/1b/f9/1d1bf9b1-44c6-9a6c-6ffb-c158488c06ce/26UMGIM39303.rgb.jpg/300x300bb.jpg';

const ALL_TRACKS = {
  nadin: {
    id: 'semua-aku-dirayakan',
    title: 'Semua Aku Dirayakan',
    artist: 'Nadin Amizah',
    album: 'Selamat Ulang Tahun',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c1/b0/f7/c1b0f7fa-f141-7c53-9531-0b248b06e96c/cover.jpg/300x300bb.jpg',
    url: '/musics/Nadin_Amizah_-_Semua_Aku_Dirayakan_CeeNaija.com_.mp3',
  },
  purple: {
    id: 'purple',
    title: 'purple',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork: OLIVIA_ART,
    url: '/musics/Olivia Rodrigo - purple.mp3',
  },
  dropdead: {
    id: 'drop-dead',
    title: 'drop dead',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork: OLIVIA_ART,
    url: '/musics/drop dead(MP3_160K).mp3',
  },
  honeybee: {
    id: 'honeybee',
    title: 'honeybee',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork: OLIVIA_ART,
    url: '/musics/Olivia Rodrigo - honeybee (Lyrics).mp3',
  },
  lover: {
    id: 'lover',
    title: 'Lover',
    artist: 'Taylor Swift',
    album: 'Lover',
    artwork: null,
    url: '/musics/Taylor Swift - Lover.mp3',
  },
};

const build = (order) => order.map((k) => ALL_TRACKS[k]).filter((t) => t && t.url);

// Saat web dibuka: Nadin -> purple -> drop dead -> honeybee -> Lover
export const PLAYLIST_INITIAL = build(['nadin', 'purple', 'dropdead', 'honeybee', 'lover']);

// Saat buku dibuka: drop dead -> honeybee
export const PLAYLIST_SKETCHBOOK = build(['dropdead', 'honeybee']);