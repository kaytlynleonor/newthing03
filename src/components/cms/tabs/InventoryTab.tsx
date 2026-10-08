import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useStore } from '../../../context/StoreContext';
import { AlertTriangle, Package, Save, RefreshCw } from 'lucide-react';

export const InventoryTab: React.FC = () => {
  const { products, setProducts } = useStore();
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const showMsg = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  const allVariants = products.flatMap(p =>
    (p.variants || []).map(v => ({ product: p, variant: v, key: `${p.id}-${v.id}` }))
  );

  const visible = allVariants.filter(({ variant }) => {
    if (filter === 'low') return variant.stock > 0 && variant.stock <= 5;
    if (filter === 'out') return variant.stock === 0;
    return true;
  });

  const handleStockUpdate = async (productId: string, variantId: string, newStock: number) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    setSaving(`${productId}-${variantId}`);
    try {
      const updatedVariants = p.variants.map(v => v.id === variantId ? { ...v, stock: newStock } : v);
      const docId = (p as any)._docId;
      if (docId) await updateDoc(doc(db, 'products', docId), { variants: updatedVariants });
      setProducts(products.map(x => x.id === productId ? { ...x, variants: updatedVariants } : x));
      showMsg('✓ Stock updated.');
    } catch (e: any) { showMsg(`✗ ${e.message}`); }
    setSaving(null);
  };

  const lowCount = allVariants.filter(({ variant }) => variant.stock > 0 && variant.stock <= 5).length;
  const outCount = allVariants.filter(({ variant }) => variant.stock === 0).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#EEE8DF] p-4 text-center cursor-pointer hover:bg-[#F5F1EB]" onClick={() => setFilter('all')}>
          <p className="font-serif text-2xl">{allVariants.length}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mt-1">Total Variants</p>
        </div>
        <div className={`border p-4 text-center cursor-pointer ${lowCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#EEE8DF]'}`} onClick={() => setFilter('low')}>
          <p className={`font-serif text-2xl ${lowCount > 0 ? 'text-amber-700' : ''}`}>{lowCount}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mt-1 flex items-center justify-center gap-1">
            {lowCount > 0 && <AlertTriangle size={10} className="text-amber-500" />} Low Stock
          </p>
        </div>
        <div className={`border p-4 text-center cursor-pointer ${outCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-[#EEE8DF]'}`} onClick={() => setFilter('out')}>
          <p className={`font-serif text-2xl ${outCount > 0 ? 'text-red-600' : ''}`}>{outCount}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mt-1">Out of Stock</p>
        </div>
      </div>

      {msg && <p className="text-[11px] px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700">{msg}</p>}

      <div className="flex items-center gap-2">
        {(['all', 'low', 'out'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-colors ${filter === f ? 'bg-[#11100E] text-[#F5F1EB] border-[#11100E]' : 'bg-white border-[#EEE8DF] text-[#A99684] hover:text-[#11100E]'}`}>
            {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#A99684] uppercase tracking-wider">{visible.length} variants</span>
      </div>

      <div className="border border-[#EEE8DF] overflow-x-auto">
        <table className="w-full text-xs font-sans">
          <thead><tr className="bg-[#F5F1EB] border-b border-[#EEE8DF] text-[#A99684]">
            <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Product</th>
            <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Variant</th>
            <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">SKU</th>
            <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Status</th>
            <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Stock</th>
            <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Update</th>
          </tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-[#A99684]">No variants match the filter</td></tr>
            ) : visible.map(({ product: p, variant: v, key }) => {
              const editKey = key;
              const currentStock = stockEdits[editKey] !== undefined ? stockEdits[editKey] : v.stock;
              return (
                <tr key={key} className={`border-b border-[#EEE8DF] hover:bg-[#F5F1EB] ${v.stock === 0 ? 'bg-red-50' : v.stock <= 5 ? 'bg-amber-50/50' : 'bg-white'}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-7 h-9 object-cover shrink-0" />}
                      <span className="font-medium text-[#11100E] text-[11px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: v.colorHex || '#11100E' }} />
                      {v.name}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[#A99684]">{p.sku}</td>
                  <td className="p-3">
                    <span className={`text-[10px] uppercase px-2 py-0.5 border ${v.stock === 0 ? 'bg-red-50 text-red-600 border-red-200' : v.stock <= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {v.stock === 0 ? 'Out of stock' : v.stock <= 5 ? 'Low stock' : 'In stock'}
                    </span>
                  </td>
                  <td className="p-3">
                    <input type="number" min="0" value={currentStock}
                      onChange={e => setStockEdits(prev => ({ ...prev, [editKey]: Number(e.target.value) }))}
                      className="w-16 bg-white border border-[#EEE8DF] px-2 py-1 text-xs focus:outline-none focus:border-[#11100E]" />
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleStockUpdate(p.id, v.id, currentStock)} disabled={saving === key}
                      className="flex items-center gap-1 px-3 py-1 bg-[#11100E] text-[#F5F1EB] text-[10px] uppercase hover:bg-[#A99684] transition-colors disabled:opacity-50">
                      {saving === key ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />} Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
