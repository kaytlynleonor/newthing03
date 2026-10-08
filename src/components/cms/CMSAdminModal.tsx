import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Sparkles, Save, RotateCcw, Package, Loader2, ChevronDown, RefreshCw } from 'lucide-react';
import { DEFAULT_CMS_CONFIG } from '../../data/initialCMS';
import {
  collection, getDocs, doc, updateDoc, query,
  orderBy, serverTimestamp, DocumentData
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductAdminPanel } from './ProductAdminPanel';

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type CmsTab = 'content' | 'orders' | 'products';

const STATUS_COLORS: Record<OrderStatus, string> = {
  Processing: 'bg-amber-50 text-amber-700 border-amber-200',
  Shipped:    'bg-blue-50 text-blue-700 border-blue-200',
  Delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:  'bg-red-50 text-red-700 border-red-200',
};

export const CMSAdminModal: React.FC = () => {
  const { isCMSOpen, setIsCMSOpen, cmsConfig, updateCMSConfig } = useStore();

  // ── CMS Content state ──
  const [announcementMessage, setAnnouncementMessage] = useState(cmsConfig.announcementMessage);
  const [announcementActive, setAnnouncementActive]   = useState(cmsConfig.announcementActive);
  const [heroHeadline, setHeroHeadline]               = useState(cmsConfig.heroHeadline);
  const [heroSubheadline, setHeroSubheadline]         = useState(cmsConfig.heroSubheadline);
  const [heroImage, setHeroImage]                     = useState(cmsConfig.heroImage);
  const [heroCtaText, setHeroCtaText]                 = useState(cmsConfig.heroCtaText);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(cmsConfig.freeShippingThreshold);

  // ── Orders state ──
  const [tab, setTab]                     = useState<CmsTab>('content');
  const [orders, setOrders]               = useState<DocumentData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingId, setUpdatingId]       = useState<string | null>(null);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [statusMsg, setStatusMsg]         = useState('');

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ _docId: d.id, ...d.data() })));
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (isCMSOpen && tab === 'orders') fetchOrders();
  }, [isCMSOpen, tab]);

  if (!isCMSOpen) return null;

  // ── Handlers ──
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCMSConfig({ announcementMessage, announcementActive, heroHeadline, heroSubheadline, heroImage, heroCtaText, freeShippingThreshold: Number(freeShippingThreshold) });
    setIsCMSOpen(false);
  };

  const handleResetCMS = () => {
    updateCMSConfig(DEFAULT_CMS_CONFIG);
    setAnnouncementMessage(DEFAULT_CMS_CONFIG.announcementMessage);
    setAnnouncementActive(DEFAULT_CMS_CONFIG.announcementActive);
    setHeroHeadline(DEFAULT_CMS_CONFIG.heroHeadline);
    setHeroSubheadline(DEFAULT_CMS_CONFIG.heroSubheadline);
    setHeroImage(DEFAULT_CMS_CONFIG.heroImage);
    setHeroCtaText(DEFAULT_CMS_CONFIG.heroCtaText);
    setFreeShippingThreshold(DEFAULT_CMS_CONFIG.freeShippingThreshold);
  };

  const handleStatusUpdate = async (docId: string, orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(docId);
    setStatusMsg('');
    try {
      const order = orders.find(o => o._docId === docId);
      await updateDoc(doc(db, 'orders', docId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setOrders(prev => prev.map(o => o._docId === docId ? { ...o, status: newStatus } : o));

      // Send status update email via Vercel API
      if (order) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const apiUrl = `${apiBaseUrl}/api/order-status`;
        fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, newStatus }),
        }).catch(e => console.error('Status email failed:', e));
      }

      setStatusMsg(`✓ Order ${orderId} updated to ${newStatus}`);
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (e) {
      console.error('Status update failed:', e);
      setStatusMsg('✗ Update failed. Try again.');
    }
    setUpdatingId(null);
  };

  const inputClass = "w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]";
  const labelClass = "text-[10px] text-[#A99684] uppercase";

  return (
    <div className="fixed inset-0 z-50 bg-[#11100E]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#F5F1EB] text-[#11100E] w-full max-w-3xl max-h-[90vh] flex flex-col border border-[#EEE8DF] shadow-2xl relative">

        {/* Close */}
        <button onClick={() => setIsCMSOpen(false)} className="absolute top-5 right-5 p-2 text-[#11100E] hover:text-[#A99684] z-10">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-4 border-b border-[#EEE8DF] shrink-0">
          <Sparkles className="text-[#A99684]" size={22} />
          <div>
            <h3 className="font-serif text-xl tracking-[0.2em] font-light uppercase">KAYTLYN LEONOR ADMIN</h3>
            <p className="text-[10px] font-sans text-[#A99684] uppercase tracking-wider">Brand CMS & Order Management</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EEE8DF] shrink-0 px-8">
          {(['content', 'orders', 'products'] as CmsTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 px-4 text-[11px] font-sans uppercase tracking-[0.2em] border-b-2 transition-colors ${tab === t ? 'border-[#11100E] text-[#11100E] font-semibold' : 'border-transparent text-[#A99684] hover:text-[#11100E]'}`}>
              {t === 'content' ? '⚙ Brand Content' : t === 'orders' ? `📦 Orders${orders.length > 0 ? ` (${orders.length})` : ''}` : '🛍 Products'}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-8 py-6">

          {/* ── CONTENT TAB ── */}
          {tab === 'content' && (
            <form onSubmit={handleSave} className="space-y-5 text-xs font-sans">

              <div className="space-y-3 p-4 bg-white border border-[#EEE8DF]">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-xs uppercase font-semibold tracking-wider">1. ANNOUNCEMENT BAR</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={announcementActive} onChange={e => setAnnouncementActive(e.target.checked)} className="accent-[#11100E]" />
                    <span className="text-[10px] uppercase font-semibold">ACTIVE</span>
                  </label>
                </div>
                <input type="text" value={announcementMessage} onChange={e => setAnnouncementMessage(e.target.value)} placeholder="Announcement text..." className={inputClass} />
              </div>

              <div className="space-y-3 p-4 bg-white border border-[#EEE8DF]">
                <h4 className="font-serif text-xs uppercase font-semibold tracking-wider">2. HOMEPAGE HERO</h4>
                {[
                  { label: 'MAIN HEADLINE', val: heroHeadline, set: setHeroHeadline },
                  { label: 'SUBHEADLINE', val: heroSubheadline, set: setHeroSubheadline },
                  { label: 'HERO IMAGE URL', val: heroImage, set: setHeroImage },
                  { label: 'CTA BUTTON TEXT', val: heroCtaText, set: setHeroCtaText },
                ].map(f => (
                  <div key={f.label} className="space-y-1">
                    <label className={labelClass}>{f.label}</label>
                    <input type="text" value={f.val} onChange={e => f.set(e.target.value)} className={inputClass} />
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-4 bg-white border border-[#EEE8DF]">
                <h4 className="font-serif text-xs uppercase font-semibold tracking-wider">3. FREE SHIPPING THRESHOLD (INR)</h4>
                <input type="number" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(Number(e.target.value))} className={inputClass} />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <button type="button" onClick={handleResetCMS} className="flex items-center gap-1.5 text-xs text-[#A99684] hover:text-[#11100E] uppercase tracking-wider">
                  <RotateCcw size={14} /> RESET
                </button>
                <button type="submit" className="bg-[#11100E] text-[#F5F1EB] px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-[#A99684] transition-colors flex items-center gap-2">
                  <Save size={15} /> SAVE & APPLY
                </button>
              </div>
            </form>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && (
            <div className="space-y-4">

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684]">{orders.length} orders in Firestore</p>
                <button onClick={fetchOrders} className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#11100E] hover:text-[#A99684] transition-colors">
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {/* Status message */}
              {statusMsg && (
                <p className={`text-[11px] px-3 py-2 border ${statusMsg.startsWith('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {statusMsg}
                </p>
              )}

              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[#A99684]" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={36} className="mx-auto text-[#A99684] mb-3" strokeWidth={1} />
                  <p className="text-sm text-[#A99684] uppercase tracking-wider">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order._docId} className="bg-white border border-[#EEE8DF]">

                      {/* Order row header */}
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F5F1EB] transition-colors"
                        onClick={() => setExpandedId(expandedId === order._docId ? null : order._docId)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-serif text-sm font-medium shrink-0">{order.id}</span>
                          <span className="text-[11px] text-[#A99684] truncate hidden sm:block">{order.customerEmail}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-sans text-sm font-semibold">{fmt(order.totalAmount)}</span>
                          <span className={`text-[10px] font-sans uppercase tracking-wider border px-2 py-0.5 ${STATUS_COLORS[order.status as OrderStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {order.status}
                          </span>
                          <ChevronDown size={14} className={`text-[#A99684] transition-transform ${expandedId === order._docId ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded order details */}
                      {expandedId === order._docId && (
                        <div className="border-t border-[#EEE8DF] px-4 py-4 space-y-4 bg-[#F5F1EB]">

                          {/* Info grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            {[
                              { label: 'Date', value: order.date },
                              { label: 'Tracking', value: order.trackingNumber },
                              { label: 'Phone', value: order.customerPhone || '—' },
                              { label: 'Payment', value: order.paymentMethod },
                            ].map(f => (
                              <div key={f.label} className="bg-white p-3 border border-[#EEE8DF]">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">{f.label}</p>
                                <p className="font-sans text-[11px] text-[#11100E] break-all">{f.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Shipping address */}
                          <div className="bg-white p-3 border border-[#EEE8DF] text-xs">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Shipping Address</p>
                            <p className="text-[#11100E]">
                              {order.shippingAddress?.fullName} · {order.shippingAddress?.addressLine}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                            </p>
                          </div>

                          {/* Items */}
                          <div className="bg-white border border-[#EEE8DF] divide-y divide-[#EEE8DF]">
                            {(order.items || []).map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 px-3 py-2">
                                <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium truncate">{item.productName}</p>
                                  <p className="text-[10px] text-[#A99684]">{item.variantName} · {item.size} · Qty {item.quantity}</p>
                                </div>
                                <p className="text-[11px] font-semibold shrink-0">{fmt(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Status update */}
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] shrink-0">Update Status:</p>
                            <div className="flex flex-wrap gap-2">
                              {(['Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => (
                                <button
                                  key={s}
                                  disabled={order.status === s || updatingId === order._docId}
                                  onClick={() => handleStatusUpdate(order._docId, order.id, s)}
                                  className={`px-3 py-1.5 text-[10px] font-sans uppercase tracking-wider border transition-all disabled:opacity-40 ${
                                    order.status === s
                                      ? STATUS_COLORS[s] + ' font-bold'
                                      : 'bg-white border-[#EEE8DF] text-[#11100E] hover:border-[#11100E]'
                                  }`}
                                >
                                  {updatingId === order._docId && order.status !== s ? <Loader2 size={11} className="animate-spin inline" /> : s}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* ── PRODUCTS TAB ── */}
          {tab === 'products' && <ProductAdminPanel />}

        </div>
      </div>
    </div>
  );
};
