import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Loader2, TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { DocumentData } from 'firebase/firestore';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export const AnalyticsTab: React.FC = () => {
  const [orders, setOrders]   = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    getDocs(q)
      .then(snap => setOrders(snap.docs.map(d => ({ _docId: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const revenue       = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const delivered     = orders.filter(o => o.status === 'Delivered').length;
  const uniqueEmails  = new Set(orders.map(o => o.customerEmail).filter(Boolean)).size;

  const stats: Stat[] = [
    { label: 'Total Revenue',  value: fmt(revenue),              icon: <DollarSign  size={18} className="text-emerald-500" /> },
    { label: 'Total Orders',   value: String(orders.length),     icon: <ShoppingBag size={18} className="text-blue-500"    /> },
    { label: 'Delivered',      value: String(delivered),         icon: <TrendingUp  size={18} className="text-purple-500"  /> },
    { label: 'Unique Customers', value: String(uniqueEmails),    icon: <Users       size={18} className="text-amber-500"   /> },
  ];

  // Group revenue by month
  const byMonth: Record<string, number> = {};
  orders.forEach(o => {
    if (!o.date) return;
    const month = o.date.slice(0, 7); // "YYYY-MM"
    byMonth[month] = (byMonth[month] || 0) + (o.totalAmount || 0);
  });
  const months = Object.keys(byMonth).sort().slice(-6);

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-lg uppercase tracking-[0.2em]">Analytics</h2>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#A99684]" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-white border border-[#EEE8DF] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#A99684]">{s.label}</span>
                </div>
                <p className="font-serif text-xl">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue by month */}
          {months.length > 0 && (
            <div className="bg-white border border-[#EEE8DF] p-5">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-4">Revenue (last 6 months)</h3>
              <div className="flex items-end gap-2 h-32">
                {months.map(m => {
                  const max = Math.max(...months.map(k => byMonth[k]));
                  const pct = max > 0 ? (byMonth[m] / max) * 100 : 0;
                  return (
                    <div key={m} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className="w-full bg-[#11100E] rounded-t-sm"
                        style={{ height: `${pct}%`, minHeight: 4 }}
                        title={fmt(byMonth[m])}
                      />
                      <span className="text-[9px] text-[#A99684] uppercase">{m.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status breakdown */}
          <div className="bg-white border border-[#EEE8DF] p-5">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-4">Order Status Breakdown</h3>
            <div className="space-y-2">
              {(['Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(status => {
                const count = orders.filter(o => o.status === status).length;
                const pct   = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-[10px] text-[#11100E] uppercase tracking-wider">{status}</span>
                    <div className="flex-1 bg-[#EEE8DF] h-1.5 rounded-full">
                      <div className="bg-[#11100E] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-[#A99684]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
