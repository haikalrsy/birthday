// ===== DAFTAR FILE MANUAL =====
// Tulis path-nya satu per satu. Urutan di sini = urutan tampil.
// Path mulai dari "/" karena file ada di folder public/
// GANTI nama file di bawah dengan nama file aslimu (huruf besar-kecil & ekstensi harus persis).
const IMAGE_PATHS = [
  'src/assets/images/SECTIONAWAL.jpg',
  'src/assets/images/aneskabayi.jpeg',
  'src/assets/images/bunga.png',
  'src/assets/images/3.png',
  'src/assets/images/4.png  ',
  '/images/foto6.jpg',
  
];

const VIDEO_LIST = [
  { video: '/videos/video1.mp4', thumb: '/video-thumbnails/video1.jpg' },
  { video: '/videos/video2.mp4', thumb: '/video-thumbnails/video2.jpg' },
  
];

// Satu path = satu item, tidak ada yang diulang
export const allImages = IMAGE_PATHS.map((url, i) => ({
  id: `img-${i + 1}`,
  url,
  fileName: url.split('/').pop().replace(/\.[^/.]+$/, ''),
  title: ' ',
}));

export const allVideos = VIDEO_LIST.map((item, i) => ({
  id: `vid-${i + 1}`,
  url: item.video,
  fileName: item.video.split('/').pop().replace(/\.[^/.]+$/, ''),
  poster: item.thumb,
  title: ' ',
}));

// 5 foto pertama untuk MorphSlider di Hero
export const morphSliderItems = allImages.slice(0, 5).map((img, i) => ({
  image: img.url,
  caption: ' ',
  alt: `Foto ${i + 1}`,
}));

// Galeri DriftWall: sisa foto setelah Hero.
// Kalau fotonya <= 5, pakai semua foto supaya galeri tidak kosong (tanpa duplikat).
const wallSource = allImages.length > 5 ? allImages.slice(5) : allImages;

export const driftWallItems = wallSource.map((img) => ({
  image: img.url,
  title: ' ',
  subtitle: ' ',
  id: img.id,
}));

// Item untuk FlexCarousel: semua video
export const carouselItems = allVideos.map((video, i) => ({
  id: video.id,
  src: video.poster,
  poster: video.poster,
  videoUrl: video.url,
  alt: `Video ${i + 1}`,
  title: ' ',
  subtitle: ' ',
  index: i,
}));