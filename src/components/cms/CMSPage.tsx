import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Save, RotateCcw, Package, Loader2, ChevronDown, RefreshCw, Menu, X, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { DEFAULT_CMS_CONFIG } from '../../data/initialCMS';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, DocumentData } from 'firebase/firestore';
import { OrderEditModal, type OrderEditPayload } from './OrderEditModal';
import { isOrderTrashed } from '../../lib/orderTrash';
import { db } from '../../lib/firebase';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { MediaTab } from './tabs/MediaTab';
import { ProductAdminPanel } from './ProductAdminPanel';
import { DashboardTab } from './tabs/DashboardTab';
import { CustomersTab } from './tabs/CustomersTab';
import { CollectionsTab } from './tabs/CollectionsTab';
import { CouponsTab } from './tabs/CouponsTab';
import { InventoryTab } from './tabs/InventoryTab';
import { SettingsTab } from './tabs/SettingsTab';
import { TrashTab } from './tabs/TrashTab';
import { InstagramMediaTab } from './tabs/InstagramMediaTab';

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type CmsTab =
  | 'dashboard'
  | 'content'
  | 'orders'
  | 'products'
  | 'analytics'
  | 'media'
  | 'inventory'
  | 'customers'
  | 'collections'
  | 'coupons'
  | 'trash'
  | 'instagram-media'
  | 'settings';

const STATUS_COLORS: Record<OrderStatus, string> = {
  Processing: 'bg-amber-50 text-amber-700 border-amber-200',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

// At the end of NAV_ITEMS add analytics entry
const NAV_ITEMS: { key: CmsTab; icon: string; label: string }[] = [
  { key: 'dashboard',   icon: '📊', label: 'Dashboard' },
  { key: 'orders',      icon: '📦', label: 'Orders' },
  { key: 'products',    icon: '🛍',  label: 'Products' },
  { key: 'analytics',   icon: '📈',  label: 'Analytics' },
  { key: 'media',       icon: '🖼',  label: 'Media' },
  { key: 'inventory',   icon: '📋', label: 'Inventory' },
  { key: 'customers',   icon: '👥', label: 'Customers' },
  { key: 'collections', icon: '🎨', label: 'Collections' },
  { key: 'coupons',     icon: '🏷️',  label: 'Coupons' },
  { key: 'trash', icon: '🗑️', label: 'Trash' },
  { key: 'instagram-media', icon: '📸', label: 'Instagram' },
  { key: 'settings',    icon: '🔧', label: 'Settings' },
];

export const CMSPage: React.FC = () => {
  const { setActiveView, cmsConfig, updateCMSConfig } = useStore();

  const [announcementMessage, setAnnouncementMessage] = useState(cmsConfig.announcementMessage);
  const [announcementActive, setAnnouncementActive]   = useState(cmsConfig.announcementActive);
  const [heroHeadline, setHeroHeadline]               = useState(cmsConfig.heroHeadline);
  const [heroSubheadline, setHeroSubheadline]         = useState(cmsConfig.heroSubheadline);
  const [heroImage, setHeroImage]                     = useState(cmsConfig.heroImage);
  const [heroCtaText, setHeroCtaText]                 = useState(cmsConfig.heroCtaText);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(cmsConfig.freeShippingThreshold);

  const [tab, setTab]           = useState<CmsTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders]     = useState<DocumentData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [editingOrder, setEditingOrder] = useState<DocumentData | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
      setOrders(all.filter(o => !isOrderTrashed(o)));
    } catch (e) { console.error('Failed to fetch orders:', e); }
    setOrdersLoading(false);
  };

  useEffect(() => { if (tab === 'orders') fetchOrders(); }, [tab]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCMSConfig({ announcementMessage, announcementActive, heroHeadline, heroSubheadline, heroImage, heroCtaText, freeShippingThreshold: Number(freeShippingThreshold) });
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

  const handleMoveToTrash = async (docId: string, orderId: string) => {
    if (!window.confirm(`Move order ${orderId} to trash? It will auto-delete after 30 days unless restored.`)) return;
    setUpdatingId(docId);
    setStatusMsg('');
    try {
      const trashedAt = new Date().toISOString();
      await updateDoc(doc(db, 'orders', docId), { trashedAt, updatedAt: serverTimestamp() });
      setOrders(prev => prev.filter(o => o._docId !== docId));
      setExpandedId(prev => (prev === docId ? null : prev));
      setStatusMsg(`✓ Order ${orderId} moved to trash.`);
      setTimeout(() => setStatusMsg(''), 4000);
    } catch {
      setStatusMsg('✗ Could not move order to trash.');
    }
    setUpdatingId(null);
  };

  const handleSaveOrderEdit = async (docId: string, payload: OrderEditPayload) => {
    setEditSaving(true);
    try {
      await updateDoc(doc(db, 'orders', docId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setOrders(prev =>
        prev.map(o =>
          o._docId === docId
            ? { ...o, ...payload, shippingAddress: { ...(payload.shippingAddress ?? {}) } }
            : o
        )
      );
      setEditingOrder(null);
      setStatusMsg('✓ Order updated.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch {
      setStatusMsg('✗ Order update failed.');
    }
    setEditSaving(false);
  };

  const handleStatusUpdate = async (docId: string, orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(docId);
    setStatusMsg('');
    try {
      const order = orders.find(o => o._docId === docId);
      await updateDoc(doc(db, 'orders', docId), { status: newStatus, updatedAt: serverTimestamp() });
      setOrders(prev => prev.map(o => o._docId === docId ? { ...o, status: newStatus } : o));
      if (order) {
        fetch('/api/order-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, newStatus }),
        }).catch(() => {});
      }
      setStatusMsg(`✓ Order ${orderId} → ${newStatus}`);
      setTimeout(() => setStatusMsg(''), 4000);
    } catch { setStatusMsg('✗ Update failed.'); }
    setUpdatingId(null);
  };

  const selectTab = (t: CmsTab) => { setTab(t); setSidebarOpen(false); };

  const inp = "w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]";
  const lbl = "text-[10px] text-[#A99684] uppercase tracking-[0.2em]";
  const currentLabel = NAV_ITEMS.find(n => n.key === tab)?.label || '';

  return (
    <div className="min-h-screen bg-[#F5F1EB]">

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#EEE8DF] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button onClick={() => setSidebarOpen(o => !o)} className="lg:hidden p-1.5 text-[#11100E]">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#A99684]" />
            <span className="font-serif text-base uppercase tracking-[0.2em]">Admin</span>
            <span className="hidden sm:inline text-[#A99684] text-xs uppercase tracking-wider">· {currentLabel}</span>
          </div>
        </div>
        <button onClick={() => setActiveView('home')}
          className="flex items-center gap-1.5 text-[11px] font-sans uppercase tracking-[0.2em] text-[#A99684] hover:text-[#11100E] transition-colors border border-[#EEE8DF] px-3 py-1.5">
          <ArrowLeft size={12} /> Store
        </button>
      </div>

      <div className="flex relative">

        {/* ── SIDEBAR OVERLAY (mobile) ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`
          fixed top-0 left-0 h-full z-30 w-56 bg-white border-r border-[#EEE8DF] pt-16 pb-8 overflow-y-auto shadow-xl
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:pt-6 lg:h-auto lg:sticky lg:top-[57px] lg:max-h-[calc(100vh-57px)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="px-3 space-y-0.5">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-sans uppercase tracking-[0.12em] text-left transition-all rounded-sm ${
                  tab === item.key
                    ? 'bg-[#11100E] text-[#F5F1EB] font-semibold'
                    : 'text-[#A99684] hover:text-[#11100E] hover:bg-[#F5F1EB]'
                }`}>
                <span className="text-sm w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24">

          {tab === 'dashboard' && <DashboardTab />}

          {tab === 'content' && (
            <form onSubmit={handleSave} className="space-y-5 text-xs font-sans max-w-2xl">
              <h2 className="font-serif text-lg uppercase tracking-[0.2em]">Brand Content</h2>
              <div className="space-y-3 p-5 bg-white border border-[#EEE8DF]">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-xs uppercase font-semibold tracking-wider">Announcement Bar</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={announcementActive} onChange={e => setAnnouncementActive(e.target.checked)} className="accent-[#11100E]" />
                    <span className="text-[10px] uppercase">Active</span>
                  </label>
                </div>
                <input type="text" value={announcementMessage} onChange={e => setAnnouncementMessage(e.target.value)} className={inp} />
              </div>
              <div className="space-y-3 p-5 bg-white border border-[#EEE8DF]">
                <h4 className="font-serif text-xs uppercase font-semibold tracking-wider">Homepage Hero</h4>
                {[
                  { label: 'Headline', val: heroHeadline, set: setHeroHeadline },
                  { label: 'Subheadline', val: heroSubheadline, set: setHeroSubheadline },
                  { label: 'Image URL', val: heroImage, set: setHeroImage },
                  { label: 'CTA Text', val: heroCtaText, set: setHeroCtaText },
                ].map(f => (
                  <div key={f.label}>
                    <label className={lbl + ' block mb-1'}>{f.label}</label>
                    <input type="text" value={f.val} onChange={e => f.set(e.target.value)} className={inp} />
                  </div>
                ))}
              </div>
              <div className="p-5 bg-white border border-[#EEE8DF]">
                <h4 className="font-serif text-xs uppercase font-semibold tracking-wider mb-3">Free Shipping Threshold (₹)</h4>
                <input type="number" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(Number(e.target.value))} className={inp} />
              </div>
              <div className="flex items-center justify-between">
                <button type="button" onClick={handleResetCMS} className="flex items-center gap-1.5 text-xs text-[#A99684] hover:text-[#11100E] uppercase tracking-wider">
                  <RotateCcw size={13} /> Reset
                </button>
                <button type="submit" className="bg-[#11100E] text-[#F5F1EB] px-6 py-2.5 text-xs uppercase tracking-[0.25em] hover:bg-[#A99684] transition-colors flex items-center gap-2">
                  <Save size={13} /> Save
                </button>
              </div>
            </form>
          )}

          {tab === 'media' && <MediaTab />}
          {tab === 'inventory' && <InventoryTab />}
          {tab === 'customers' && <CustomersTab />}
          {tab === 'collections' && <CollectionsTab />}
          {tab === 'coupons' && <CouponsTab />}
          {tab === 'settings' && <SettingsTab />}
          {tab === 'trash' && <TrashTab />}
          {tab === 'instagram-media' && <InstagramMediaTab />}

          {tab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg uppercase tracking-[0.2em]">Orders <span className="text-[#A99684] text-sm">({orders.length})</span></h2>
                <button onClick={fetchOrders} className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#11100E] hover:text-[#A99684]">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              {statusMsg && <p className={`text-[11px] px-3 py-2 border ${statusMsg.startsWith('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{statusMsg}</p>}
              {ordersLoading ? (
                <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#A99684]" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20"><Package size={36} className="mx-auto text-[#A99684] mb-3" strokeWidth={1} /><p className="text-sm text-[#A99684]">No orders yet</p></div>
              ) : (
                <div className="space-y-2">
                  {orders.map(order => (
                    <div key={order._docId} className="bg-white border border-[#EEE8DF] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F5F1EB]"
                        onClick={() => setExpandedId(expandedId === order._docId ? null : order._docId)}>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-sm font-medium">{order.id}</p>
                          <p className="text-[10px] text-[#A99684] truncate">{order.customerEmail}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <p className="font-semibold text-sm">{fmt(order.totalAmount)}</p>
                          <span className={`text-[9px] uppercase tracking-wider border px-1.5 py-0.5 hidden md:inline ${STATUS_COLORS[order.status as OrderStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{order.status}</span>
                          <button
                            type="button"
                            title="Edit order"
                            onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }}
                            className="p-1.5 text-[#A99684] hover:text-[#11100E] hover:bg-white border border-transparent hover:border-[#EEE8DF] rounded-sm"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            title="Move to trash"
                            disabled={updatingId === order._docId}
                            onClick={(e) => { e.stopPropagation(); handleMoveToTrash(order._docId, order.id); }}
                            className="p-1.5 text-[#A99684] hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-sm disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronDown size={13} className={`text-[#A99684] transition-transform ${expandedId === order._docId ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {expandedId === order._docId && (
                        <div className="border-t border-[#EEE8DF] p-4 bg-[#F5F1EB] space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                              { label: 'Date', value: order.date },
                              { label: 'Status', value: order.status },
                              { label: 'Tracking', value: order.trackingNumber },
                              { label: 'Payment', value: order.paymentMethod },
                            ].map(f => (
                              <div key={f.label} className="bg-white p-2.5 border border-[#EEE8DF]">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-0.5">{f.label}</p>
                                <p className="text-[11px] text-[#11100E] break-all">{f.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="bg-white border border-[#EEE8DF] divide-y divide-[#EEE8DF]">
                            {(order.items || []).map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 px-3 py-2">
                                <img src={item.image} alt="" className="w-8 h-10 object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium truncate">{item.productName}</p>
                                  <p className="text-[10px] text-[#A99684]">{item.variantName} · {item.size} · ×{item.quantity}</p>
                                </div>
                                <p className="text-[11px] font-semibold shrink-0">{fmt(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-2">Change status</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(['Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => (
                                <button key={s} type="button" disabled={order.status === s || updatingId === order._docId}
                                  onClick={() => handleStatusUpdate(order._docId, order.id, s)}
                                  className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-all disabled:opacity-40 ${order.status === s ? STATUS_COLORS[s] + ' font-bold' : 'bg-white border-[#EEE8DF] text-[#11100E] hover:border-[#11100E]'}`}>
                                  {updatingId === order._docId && order.status !== s ? <Loader2 size={10} className="animate-spin inline" /> : s}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1 border-t border-[#EEE8DF]">
                            <button
                              type="button"
                              onClick={() => setEditingOrder(order)}
                              className="flex items-center gap-1.5 border border-[#11100E] bg-white px-3 py-2 text-[10px] uppercase tracking-wider hover:bg-[#11100E] hover:text-white"
                            >
                              <Pencil size={12} /> Edit order
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === order._docId}
                              onClick={() => handleMoveToTrash(order._docId, order.id)}
                              className="flex items-center gap-1.5 border border-red-300 bg-red-50 px-3 py-2 text-[10px] uppercase tracking-wider text-red-800 hover:bg-red-100 disabled:opacity-40"
                            >
                              <Trash2 size={12} /> Move to trash
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'analytics' && <AnalyticsTab />}
          {tab === 'products' && (
            <>
              <h2 className="font-serif text-lg uppercase tracking-[0.2em] mb-6">Products</h2>
              <ProductAdminPanel />
            </>
          )}

        </main>
      </div>
      <OrderEditModal
        order={editingOrder}
        saving={editSaving}
        onClose={() => setEditingOrder(null)}
        onSave={(payload) => handleSaveOrderEdit(editingOrder!._docId, payload)}
      />
    </div>
  );
};