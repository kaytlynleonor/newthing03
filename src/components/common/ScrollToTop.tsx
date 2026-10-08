import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-20 right-5 lg:bottom-6 lg:right-6 z-50 w-12 h-12 rounded-full border border-[#F5F1EB]/30 bg-[#11100E]/60 backdrop-blur-md flex items-center justify-center text-[#F5F1EB] hover:border-[#A99684] hover:bg-[#A99684]/20 transition-all duration-300 shadow-lg opacity-0 animate-fade-up"
      style={{ animationFillMode: 'forwards' }}
    >
      <ChevronUp size={20} />
    </button>
  );
};