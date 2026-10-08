import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';

export const Hero: React.FC = () => {
  const { cmsConfig, setActiveView, setActiveCategoryFilter } = useStore();
  const [scrollY, setScrollY] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    const play = () => video.play().catch(() => {});
    play();
    video.addEventListener('loadedmetadata', play);
    return () => video.removeEventListener('loadedmetadata', play);
  }, []);

  const handleCtaClick = () => {
    setActiveCategoryFilter('ALL');
    setActiveView('shop');
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !muted;
    videoRef.current.muted = next;
    setMuted(next);
  };

  const toggleFullscreen = () => {
    const el = sectionRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const parallaxOffset = Math.min(scrollY * 0.15, 40);

  return (
    <section ref={sectionRef} className="relative w-full h-[88vh] min-h-[620px] max-h-[1080px] overflow-hidden bg-[#11100E]">

      {/* Background Video */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ transform: `translateY(${parallaxOffset}px) scale(1.02)` }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/main-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11100E]/80 via-[#11100E]/30 to-[#11100E]/50" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-end pt-8 pb-14 md:pt-0 md:pb-28 text-[#F5F1EB]">
        <div className="max-w-2xl space-y-3 md:space-y-4">
          <p className="animate-fade-up text-[11px] md:text-xs font-sans uppercase tracking-[0.4em] text-[#D8C8B7] font-medium opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]">
            {cmsConfig.heroSubheadline}
          </p>
          <h2 className="animate-fade-up font-serif text-4xl md:text-6xl lg:text-7xl font-extralight tracking-[0.2em] leading-tight uppercase opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
            {cmsConfig.heroHeadline}
          </h2>
          <div className="animate-fade-up pt-4 opacity-0 [animation-delay:850ms] [animation-fill-mode:forwards]">
            <button
              onClick={handleCtaClick}
              className="group inline-flex items-center gap-4 bg-[#F5F1EB] text-[#11100E] px-8 py-4 text-xs font-sans uppercase tracking-[0.3em] font-medium hover:bg-[#EEE8DF] transition-all shadow-lg hover:shadow-xl"
            >
              <span>{cmsConfig.heroCtaText || 'SHOP COLLECTION'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-10 z-20 flex items-center gap-3">
        <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-[#F5F1EB]/30 bg-[#11100E]/40 backdrop-blur-md hover:border-[#A99684] transition-all duration-300">
          {isFullscreen ? <Minimize size={14} className="text-[#F5F1EB]/80" /> : <Maximize size={14} className="text-[#F5F1EB]/80" />}
        </button>
        <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-[#F5F1EB]/30 bg-[#11100E]/40 backdrop-blur-md hover:border-[#A99684] transition-all duration-300">
          {muted ? <VolumeX size={14} className="text-[#F5F1EB]/80" /> : <Volume2 size={14} className="text-[#F5F1EB]/80" />}
        </button>
        <span className="hidden md:block text-[9px] font-sans uppercase tracking-[0.3em] text-[#D8C8B7]/50 select-none">
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </span>
      </div>

    </section>
  );
};
