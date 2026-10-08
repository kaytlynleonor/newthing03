import React, { useEffect, useState } from 'react';

export const LoadingScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F1EB] text-[#11100E] flex flex-col items-center justify-center space-y-4 animate-fade-out">
      <img 
        src="/Luxury%20Gold%20KL%20Monogram%20Logo.png" 
        alt="Kaytlyn Leonor Icon" 
        className="w-20 h-20 md:w-24 md:h-24 object-contain animate-pulse mb-1" 
      />
      <h1 className="font-serif text-3xl md:text-5xl tracking-[0.3em] font-light uppercase animate-pulse">
        KAYTLYN LEONOR
      </h1>
      <div className="w-16 h-[1px] bg-[#A99684]/50 animate-pulse mt-4" />
    </div>
  );
};
