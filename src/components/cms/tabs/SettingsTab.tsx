import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Save, Check } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { cmsConfig, updateCMSConfig } = useStore();
  const [saved, setSaved] = useState(false);

  const [storeName, setStoreName] = useState('KAYTLYN LEONOR');
  const [storeEmail, setStoreEmail] = useState('kaytlynleonor@gmail.com');
  const [storePhone, setStorePhone] = useState('+91 98200 12345');
  const [storeAddress, setStoreAddress] = useState('Mumbai, India');
  const [currency, setCurrency] = useState('INR');
  const [freeShipping, setFreeShipping] = useState(cmsConfig.freeShippingThreshold || 5000);
  const [shippingFee, setShippingFee] = useState(500);
  const [taxRate, setTaxRate] = useState(18);
  const [instagram, setInstagram] = useState('https://instagram.com/kaytlynleonor');
  const [facebook, setFacebook] = useState('https://facebook.com/kaytlynleonor');
  const [whatsapp, setWhatsapp] = useState('+91 98200 12345');
  const [announcement, setAnnouncement] = useState(cmsConfig.announcementMessage || '');
  const [announcementActive, setAnnouncementActive] = useState(cmsConfig.announcementActive);

  const handleSave = () => {
    updateCMSConfig({
      freeShippingThreshold: freeShipping,
      announcementMessage: announcement,
      announcementActive,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inp = "w-full bg-[#F5F1EB] border border-[#EEE8DF] px-3 py-2.5 text-sm text-[#11100E] focus:outline-none focus:border-[#11100E]";
  const lbl = "block text-[10px] font-sans uppercase tracking-[0.2em] text-[#A99684] mb-1.5";
  const section = "bg-white border border-[#EEE8DF] p-6 space-y-4";

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Store Info */}
      <div className={section}>
        <h3 className="font-serif text-sm uppercase tracking-[0.2em] border-b border-[#EEE8DF] pb-3">Store Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Store Name</label><input className={inp} value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
          <div><label className={lbl}>Email</label><input type="email" className={inp} value={storeEmail} onChange={e => setStoreEmail(e.target.value)} /></div>
          <div><label className={lbl}>Phone</label><input className={inp} value={storePhone} onChange={e => setStorePhone(e.target.value)} /></div>
          <div><label className={lbl}>Address</label><input className={inp} value={storeAddress} onChange={e => setStoreAddress(e.target.value)} /></div>
        </div>
      </div>

      {/* Commerce */}
      <div className={section}>
        <h3 className="font-serif text-sm uppercase tracking-[0.2em] border-b border-[#EEE8DF] pb-3">Commerce Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Currency</label>
            <select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div><label className={lbl}>Free Shipping Above (₹)</label><input type="number" className={inp} value={freeShipping} onChange={e => setFreeShipping(Number(e.target.value))} /></div>
          <div><label className={lbl}>Shipping Fee (₹)</label><input type="number" className={inp} value={shippingFee} onChange={e => setShippingFee(Number(e.target.value))} /></div>
          <div><label className={lbl}>Tax Rate (%)</label><input type="number" className={inp} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} /></div>
        </div>
      </div>

      {/* Announcement */}
      <div className={section}>
        <h3 className="font-serif text-sm uppercase tracking-[0.2em] border-b border-[#EEE8DF] pb-3">Announcement Bar</h3>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={announcementActive} onChange={e => setAnnouncementActive(e.target.checked)} className="accent-[#11100E]" />
          <label className="text-xs uppercase tracking-wider">Active</label>
        </div>
        <input className={inp} value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Announcement text..." />
      </div>

      {/* Social */}
      <div className={section}>
        <h3 className="font-serif text-sm uppercase tracking-[0.2em] border-b border-[#EEE8DF] pb-3">Social Media</h3>
        <div className="space-y-3">
          <div><label className={lbl}>Instagram</label><input className={inp} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." /></div>
          <div><label className={lbl}>Facebook</label><input className={inp} value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/..." /></div>
          <div><label className={lbl}>WhatsApp</label><input className={inp} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91..." /></div>
        </div>
      </div>

      <button onClick={handleSave}
        className="bg-[#11100E] text-[#F5F1EB] px-8 py-3 text-xs uppercase tracking-[0.3em] hover:bg-[#A99684] transition-colors flex items-center gap-2">
        {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
      </button>
    </div>
  );
};
