// ===== GAMBAR DARI src/assets/images (di-import, jadi aman di Vercel) =====
// Nama file harus persis sama, termasuk huruf besar-kecil dan ekstensi.
import sectionAwal from '../assets/images/SECTIONAWAL.jpg';
import aneskabayi from '../assets/images/aneskabayi.jpeg';
import bunga from '../assets/images/bunga.png';
import foto3 from '../assets/images/3.png';
import foto4 from '../assets/images/4.png';

// ===== DAFTAR GAMBAR =====
// Urutan di sini = urutan tampil.
// src dari import (tanpa "/"), atau path string kalau file ada di folder public/.
const IMAGE_LIST = [
  { src: sectionAwal, name: 'SECTIONAWAL' },
  { src: aneskabayi, name: 'aneskabayi' },
  { src: bunga, name: 'bunga' },
  { src: foto3, name: '3' },
  { src: foto4, name: '4' },
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