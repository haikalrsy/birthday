import { useEffect } from 'react';
import Lenis from 'lenis';
import Footer from './components/common/Footer';
import StorySection from './components/sections/StorySection';
import './App.css';

function App() {
  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#fffbfa] text-[#4a1525] selection:bg-[#ebe3d5] selection:text-[#580016]">
      <main className="w-full flex-1">
        <StorySection />
      </main>

      <Footer />
    </div>
  );
}

export default App;