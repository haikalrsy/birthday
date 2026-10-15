import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#e3d8c6] bg-[#faf6ee]/90 backdrop-blur-xl py-6 px-4 md:px-12 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-row items-center justify-center gap-2">
        <Heart className="w-4 h-4 text-[#800020] fill-[#800020]/20" />
        <span className="text-xs md:text-sm font-medium text-[#580016] font-serif">
          Dedicated with love for Aneska
        </span>
      </div>
    </footer>
  );
}