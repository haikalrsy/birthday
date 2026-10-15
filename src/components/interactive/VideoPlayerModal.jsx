import { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function VideoPlayerModal({ isOpen, onClose, videoItem }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay might be muted initially
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
      setIsPlaying(true);
    }
  }, [isOpen, videoItem]);

  if (!isOpen || !videoItem) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm md:max-w-md w-full bg-[#120d20] border border-purple-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl p-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 px-2">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-purple-400 font-medium">Spesial Buat Kamu! 🎬💖</span>
            <h4 className="text-sm md:text-base font-semibold text-white truncate max-w-[220px]">
              {videoItem.title || 'Momen Paling Seru! 🎉'}
            </h4>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Screen (iPhone vertical aspect) */}
        <div className="relative w-full aspect-[9/16] max-h-[65vh] bg-black rounded-3xl overflow-hidden group">
          <video
            ref={videoRef}
            src={videoItem.videoUrl}
            poster={videoItem.src}
            playsInline
            loop
            className="w-full h-full object-cover"
            onClick={togglePlay}
          />

          {/* Center Play Overlay when paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <Play className="w-6 h-6 ml-1" />
              </div>
            </div>
          )}

          {/* Quick Floating Controls Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 text-white">
            <button onClick={togglePlay} className="p-1 hover:text-purple-300 transition-colors">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-xs font-mono text-purple-200/80">{videoItem.subtitle || 'Memories'}</span>
            <button onClick={toggleMute} className="p-1 hover:text-purple-300 transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
