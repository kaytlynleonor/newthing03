import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Compass } from 'lucide-react';

export const Error404View: React.FC = () => {
  const { setActiveView } = useStore();

  return (
    <div className="py-32 px-6 max-w-xl mx-auto text-center space-y-6 bg-[#F5F1EB] min-h-[60vh] flex flex-col justify-center items-center">
      <Compass size={56} className="text-[#A99684]" strokeWidth={1} />
      <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
        404 ERROR
      </span>
      <h1 className="font-serif text-4xl md:text-6xl tracking-[0.2em] uppercase font-light text-[#11100E]">
        NOT FOUND
      </h1>
      <p className="text-xs md:text-sm font-sans text-[#2C2925] tracking-wider font-light max-w-md">
        The editorial piece or collection page you are seeking has been moved or is restricted.
      </p>
      <button
        onClick={() => setActiveView('home')}
        className="bg-[#11100E] text-[#F5F1EB] text-xs uppercase tracking-[0.25em] px-8 py-3.5 hover:bg-[#A99684] transition-colors mt-4"
      >
        RETURN HOME
      </button>
    </div>
  );
};
