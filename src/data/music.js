/**
 * music.js
 * Lagu diambil dari file lokal di src/assets/musics.
 * File dicocokkan lewat kata kunci di nama file (huruf besar/kecil tidak ngaruh).
 */

const files = import.meta.glob('../assets/musics/*.{mp3,m4a,wav,ogg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const findUrl = (keyword) => {
  const hit = Object.entries(files).find(([path]) =>
    decodeURIComponent(path).toLowerCase().includes(keyword)
  );
  return hit ? hit[1] : null;
};

const ALL_TRACKS = {
  nadin: {
    id: 'semua-aku-dirayakan',
    title: 'Semua Aku Dirayakan',
    artist: 'Nadin Amizah',
    album: 'Selamat Ulang Tahun',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c1/b0/f7/c1b0f7fa-f141-7c53-9531-0b248b06e96c/cover.jpg/300x300bb.jpg',
    url: findUrl('nadin'),
  },
  purple: {
    id: 'purple',
    title: 'purple',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1d/1b/f9/1d1bf9b1-44c6-9a6c-6ffb-c158488c06ce/26UMGIM39303.rgb.jpg/300x300bb.jpg',
    url: findUrl('purple'),
  },
  dropdead: {
    id: 'drop-dead',
    title: 'drop dead',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1d/1b/f9/1d1bf9b1-44c6-9a6c-6ffb-c158488c06ce/26UMGIM39303.rgb.jpg/300x300bb.jpg',
    url: findUrl('drop dead'),
  },
};

const build = (order) => order.map((k) => ALL_TRACKS[k]).filter((t) => t && t.url);

// Saat web dibuka: Nadin -> purple -> drop dead
export const PLAYLIST_INITIAL = build(['nadin', 'purple', 'dropdead']);

// Saat buku dibuka: drop dead -> purple -> Nadin
export const PLAYLIST_SKETCHBOOK = build(['dropdead', 'purple', 'nadin']);