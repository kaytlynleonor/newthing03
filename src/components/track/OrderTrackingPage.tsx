import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Loader2, Package, ArrowLeft, MapPin, CreditCard, Truck } from 'lucide-react';
import { DocumentData } from 'firebase/firestore';

interface PrefillEvent extends CustomEvent {
  detail: { reference?: string; email?: string };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const STATUS_STEPS = ['Processing', 'Shipped', 'Delivered'];

export const OrderTrackingPage: React.FC = () => {
  const { setActiveView } = useStore();

  const [reference, setReference] = useState('');
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [order, setOrder]         = useState<DocumentData | null>(null);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);

  // Listen for prefill events from TrackingViewBridge
  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as PrefillEvent;
      if (detail.reference) setReference(detail.reference);
      if (detail.email)     setEmail(detail.email);
    };
    window.addEventListener('kl:tracking-prefill', handler);
    return () => window.removeEventListener('kl:tracking-prefill', handler);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() && !email.trim()) {
      setError('Please enter a tracking number or order reference.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);
    try {
      const q = reference.trim()
        ? query(collection(db, 'orders'), where('trackingNumber', '==', reference.trim()))
        : query(collection(db, 'orders'), where('customerEmail', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('No order found. Please check your tracking number or email.');
      } else {
        setOrder({ _docId: snap.docs[0].id, ...snap.docs[0].data() });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  const inp = 'w-full bg-white border border-[#EEE8DF] px-4 py-3 text-sm text-[#11100E] focus:outline-none focus:border-[#11100E] placeholder:text-[#C5BDB0]';

  return (
    <div className="min-h-screen bg-[#F5F1EB] px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-xl">
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[#A99684] hover:text-[#11100E] mb-10"
        >
          <ArrowLeft size={12} /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Package size={22} className="text-[#A99684]" />
          <h1 className="font-serif text-2xl uppercase tracking-[0.2em]">Track Your Order</h1>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="space-y-4 bg-white border border-[#EEE8DF] p-6 mb-8">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-1.5">
              Tracking Number / Order ID
            </label>
            <input
              id="tracking-reference"
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. KL-20261006-XXXX"
              className={inp}
            />
          </div>
          <div className="text-center text-[10px] uppercase tracking-wider text-[#A99684]">— or —</div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-1.5">
              Email Address
            </label>
            <input
              id="tracking-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className={inp}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#11100E] text-[#F5F1EB] py-3 text-xs uppercase tracking-[0.25em] hover:bg-[#A99684] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Track Order
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">{error}</p>
        )}

        {/* Result */}
        {order && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div className="bg-white border border-[#EEE8DF] px-5 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-serif text-lg">{order.id}</p>
                  <p className="text-[11px] text-[#A99684]">{order.date}</p>
                </div>
                <span className="text-xs uppercase tracking-wider font-medium text-[#11100E] border border-[#EEE8DF] px-2.5 py-1">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Progress stepper */}
            {currentStep >= 0 && (
              <div className="bg-white border border-[#EEE8DF] px-5 py-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-4">Order Progress</p>
                <div className="flex items-center">
                  {STATUS_STEPS.map((step, i) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                          i <= currentStep ? 'bg-[#11100E] border-[#11100E] text-white' : 'border-[#EEE8DF] text-[#C5BDB0]'
                        }`}>
                          {i < currentStep ? '✓' : i + 1}
                        </div>
                        <span className="text-[9px] uppercase tracking-wider mt-1 text-[#A99684]">{step}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentStep ? 'bg-[#11100E]' : 'bg-[#EEE8DF]'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="bg-white border border-[#EEE8DF] px-5 py-4 flex items-start gap-3">
                <Truck size={16} className="text-[#A99684] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-0.5">Tracking Number</p>
                  <p className="text-sm font-medium">{order.trackingNumber}</p>
                </div>
              </div>
            )}

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="bg-white border border-[#EEE8DF] px-5 py-4 flex items-start gap-3">
                <MapPin size={16} className="text-[#A99684] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Shipping To</p>
                  <p className="text-sm">{order.shippingAddress.fullName}</p>
                  <p className="text-xs text-[#A99684]">{order.shippingAddress.addressLine}</p>
                  <p className="text-xs text-[#A99684]">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-xs text-[#A99684]">{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white border border-[#EEE8DF] px-5 py-4 flex items-start gap-3">
              <CreditCard size={16} className="text-[#A99684] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-0.5">Payment</p>
                <p className="text-sm">{order.paymentMethod} · {fmt(order.totalAmount)}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-[#EEE8DF]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] px-5 pt-4 mb-3">Items</p>
              <div className="divide-y divide-[#EEE8DF]">
                {(order.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <img src={item.image} alt="" className="w-10 h-12 object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.productName}</p>
                      <p className="text-[10px] text-[#A99684]">{item.variantName} · {item.size} · ×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold shrink-0">{fmt(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {searched && !loading && !order && !error && (
          <p className="text-sm text-[#A99684] text-center py-8">No results.</p>
        )}
      </div>
    </div>
  );
};
