import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Ruler } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useStore();
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  if (!isSizeGuideOpen) return null;

  const APPAREL_SIZES = [
    { size: 'XS', bust: unit === 'cm' ? '80-84' : '31-33', waist: unit === 'cm' ? '60-64' : '23-25', hips: unit === 'cm' ? '86-90' : '34-35' },
    { size: 'S', bust: unit === 'cm' ? '85-89' : '33-35', waist: unit === 'cm' ? '65-69' : '25-27', hips: unit === 'cm' ? '91-95' : '36-37' },
    { size: 'M', bust: unit === 'cm' ? '90-94' : '35-37', waist: unit === 'cm' ? '70-74' : '27-29', hips: unit === 'cm' ? '96-100' : '38-39' },
    { size: 'L', bust: unit === 'cm' ? '95-99' : '37-39', waist: unit === 'cm' ? '75-79' : '29-31', hips: unit === 'cm' ? '101-105' : '40-41' },
    { size: 'XL', bust: unit === 'cm' ? '100-104' : '39-41', waist: unit === 'cm' ? '80-84' : '31-33', hips: unit === 'cm' ? '106-110' : '42-43' }
  ];

  const FOOTWEAR_SIZES = [
    { eu: 'EU 36', us: 'US 6', uk: 'UK 3.5', length: unit === 'cm' ? '23.0' : '9.0' },
    { eu: 'EU 37', us: 'US 6.5', uk: 'UK 4', length: unit === 'cm' ? '23.5' : '9.2' },
    { eu: 'EU 38', us: 'US 7.5', uk: 'UK 5', length: unit === 'cm' ? '24.2' : '9.5' },
    { eu: 'EU 39', us: 'US 8.5', uk: 'UK 6', length: unit === 'cm' ? '25.0' : '9.8' },
    { eu: 'EU 40', us: 'US 9', uk: 'UK 6.5', length: unit === 'cm' ? '25.7' : '10.1' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#11100E]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F5F1EB] text-[#11100E] w-full max-w-2xl p-8 border border-[#EEE8DF] shadow-2xl relative animate-fade-in-scale">
        <button
          onClick={() => setIsSizeGuideOpen(false)}
          className="absolute top-6 right-6 p-2 text-[#11100E] hover:text-[#A99684]"
          aria-label="Close size guide"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EEE8DF]">
          <Ruler className="text-[#A99684]" size={24} />
          <div>
            <h3 className="font-serif text-2xl tracking-[0.2em] font-light uppercase">
              MASTER ATELIER SIZE GUIDE
            </h3>
            <p className="text-[11px] font-sans text-[#A99684] uppercase tracking-wider">
              PRECISION MEASUREMENTS FOR APPAREL & FOOTWEAR
            </p>
          </div>
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-[#EEE8DF] p-1 rounded-full text-xs font-sans uppercase flex gap-1">
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-full transition-colors ${
                unit === 'cm' ? 'bg-[#11100E] text-[#F5F1EB]' : 'text-[#A99684]'
              }`}
            >
              CENTIMETERS (CM)
            </button>
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 rounded-full transition-colors ${
                unit === 'in' ? 'bg-[#11100E] text-[#F5F1EB]' : 'text-[#A99684]'
              }`}
            >
              INCHES (IN)
            </button>
          </div>
        </div>

        {/* Apparel Section */}
        <div className="space-y-3 mb-8">
          <h4 className="font-serif text-sm uppercase tracking-wider text-[#A99684] font-semibold">
            WOMEN'S APPAREL & TAILORING
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left border-collapse">
              <thead>
                <tr className="bg-[#EEE8DF] text-[#11100E] uppercase tracking-wider">
                  <th className="p-2.5">SIZE</th>
                  <th className="p-2.5">BUST ({unit})</th>
                  <th className="p-2.5">WAIST ({unit})</th>
                  <th className="p-2.5">HIPS ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8DF]">
                {APPAREL_SIZES.map((row) => (
                  <tr key={row.size} className="hover:bg-white/50">
                    <td className="p-2.5 font-bold">{row.size}</td>
                    <td className="p-2.5">{row.bust}</td>
                    <td className="p-2.5">{row.waist}</td>
                    <td className="p-2.5">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footwear Section */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm uppercase tracking-wider text-[#A99684] font-semibold">
            FINE FOOTWEAR SIZING
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left border-collapse">
              <thead>
                <tr className="bg-[#EEE8DF] text-[#11100E] uppercase tracking-wider">
                  <th className="p-2.5">EU</th>
                  <th className="p-2.5">US</th>
                  <th className="p-2.5">UK</th>
                  <th className="p-2.5">FOOT LENGTH ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8DF]">
                {FOOTWEAR_SIZES.map((row) => (
                  <tr key={row.eu} className="hover:bg-white/50">
                    <td className="p-2.5 font-bold">{row.eu}</td>
                    <td className="p-2.5">{row.us}</td>
                    <td className="p-2.5">{row.uk}</td>
                    <td className="p-2.5">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
