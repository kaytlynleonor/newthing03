import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useStore } from '../../../context/StoreContext';
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const DashboardTab: React.FC = () => {
  const { products } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordSnap, usrSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50))),
          getDocs(collection(db, 'users')),
        ]);
        setOrders(ordSnap.docs.map(d => d.data()));
        setCustomers(usrSnap.size);
      } catch (e) { console.warn(e); }
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const recentOrders = orders.slice(0, 5);
  const lowStock = products.filter(p => p.variants?.some(v => v.stock <= 3));
  const topProducts = [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 5);

  const stats = [
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: <TrendingUp size={20} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={20} />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Products', value: products.length, icon: <Package size={20} />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Customers', value: customers, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#11100E]" /></div>;

  return (
    <div className="space-y-8">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`border rounded-lg p-5 flex items-center gap-4 ${s.color}`}>
            <div className="opacity-70">{s.icon}</div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-sans">{s.label}</p>
              <p className="font-serif text-2xl font-semibold mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white border border-[#EEE8DF] p-5">
          <h3 className="font-serif text-sm uppercase tracking-[0.2em] mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-[#A99684] text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-[#EEE8DF] pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-[#11100E]">{o.id}</p>
                    <p className="text-[#A99684]">{o.customerEmail || o.shippingAddress?.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{fmt(o.totalAmount)}</p>
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                      o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                      o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                      o.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-700'
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white border border-[#EEE8DF] p-5">
          <h3 className="font-serif text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" /> Low Stock
          </h3>
          {lowStock.length === 0 ? (
            <p className="text-xs text-emerald-600 text-center py-6">✓ All products have good stock levels</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-[#EEE8DF] pb-3 last:border-0">
                  {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-8 h-10 object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-[#A99684]">{p.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {p.variants.filter(v => v.stock <= 3).map(v => (
                      <p key={v.id} className="text-[10px] text-amber-600 font-semibold">{v.name}: {v.stock} left</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-[#EEE8DF] p-5">
          <h3 className="font-serif text-sm uppercase tracking-[0.2em] mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-[#EEE8DF] pb-3 last:border-0">
                <span className="text-[11px] font-bold text-[#A99684] w-5">#{i + 1}</span>
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-8 h-10 object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-[#A99684]">★ {p.rating} ({p.reviewCount} reviews)</p>
                </div>
                <p className="text-xs font-semibold shrink-0">{fmt(p.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by category */}
        <div className="bg-white border border-[#EEE8DF] p-5">
          <h3 className="font-serif text-sm uppercase tracking-[0.2em] mb-4">Products by Category</h3>
          <div className="space-y-2">
            {Array.from(new Set(products.map(p => p.category))).map(cat => {
              const count = products.filter(p => p.category === cat).length;
              const pct = Math.round((count / products.length) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#11100E]">{cat}</span>
                    <span className="text-[#A99684]">{count} products ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-[#F5F1EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#11100E] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
