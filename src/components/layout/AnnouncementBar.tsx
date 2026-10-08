import React from 'react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { cmsConfig } = useStore();

  if (!cmsConfig.announcementActive || !cmsConfig.announcementMessage) {
    return null;
  }

  const message = cmsConfig.announcementMessage;
  // Repeat the message 8 times so the marquee never shows a gap
  const repeated = Array(8).fill(message);

  return (
    <div className="bg-[#11100E] text-[#F5F1EB] py-1 border-b border-[#2C2925] overflow-hidden select-none relative z-50">
      <div className="flex whitespace-nowrap animate-marquee items-center">
        {repeated.map((msg, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-sans uppercase tracking-[0.25em] px-6"
          >
            <span className="text-[#A99684] text-[8px]">✦</span>
            {msg}
            <span className="text-[#A99684] text-[8px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};
