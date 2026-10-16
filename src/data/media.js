// ===== GAMBAR DARI public/ (URL string langsung, tidak masuk Vite bundle) =====
// Kalau foto ada di src/assets/, pindah ke public/photos/ atau public/images/ dan pakai URL string.
const IMAGE_LIST = [
  { src: '/photos/SECTIONAWAL.jpg', name: 'SECTIONAWAL' },
  { src: '/photos/aneskabayi.jpeg', name: 'aneskabayi' },
  { src: '/photos/bunga.png', name: 'bunga' },
  { src: '/photos/3.png', name: '3' },
  { src: '/photos/4.png', name: '4' },
  { src: '/images/foto6.jpg', name: 'foto6' }, // ada di public/images/
];

// ===== DAFTAR VIDEO (file di folder public/) =====
const VIDEO_LIST = [
  { video: '/videos/video1.mp4', thumb: '/video-thumbnails/video1.jpg' },
  { video: '/videos/video2.mp4', thumb: '/video-thumbnails/video2.jpg' },
];

// Satu item = satu gambar, tidak ada yang diulang
export const allImages = IMAGE_LIST.map((item, i) => ({
  id: `img-${i + 1}`,
  url: item.src,
  fileName: item.name,
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