import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Plus, X, Save, Loader2, Trash2, Copy, Check } from 'lucide-react';

interface Coupon { _id?: string; code: string; type: 'percent' | 'fixed'; value: number; minOrder: number; expiry: string; active: boolean; usageCount?: number; }

export const CouponsTab: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<Omit<Coupon, '_id'>>({ code: '', type: 'percent', value: 10, minOrder: 0, expiry: '', active: true, usageCount: 0 });

  const showMsg = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        setCoupons(snap.docs.map(d => ({ _id: d.id, ...d.data() } as Coupon)));
      } catch { setCoupons([]); }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!form.code.trim() || !form.value) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'coupons'), { ...form, code: form.code.toUpperCase(), createdAt: serverTimestamp() });
      setCoupons(prev => [...prev, { _id: docRef.id, ...form, code: form.code.toUpperCase() }]);
      showMsg('✓ Coupon created.');
      setFormOpen(false);
      setForm({ code: '', type: 'percent', value: 10, minOrder: 0, expiry: '', active: true, usageCount: 0 });
    } catch (e: any) { showMsg(`✗ ${e.message}`); }
    setSaving(false);
  };

  const handleDelete = async (c: Coupon) => {
    if (!c._id) return;
    await deleteDoc(doc(db, 'coupons', c._id)).catch(() => {});
    setCoupons(prev => prev.filter(x => x._id !== c._id));
    showMsg('✓ Coupon deleted.');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = 'KL' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(f => ({ ...f, code }));
  };

  const inp = "w-full bg-[#F5F1EB] border border-[#EEE8DF] px-3 py-2 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684]">{coupons.length} coupons</p>
        <button onClick={() => setFormOpen(true)} className="bg-[#11100E] text-[#F5F1EB] px-4 py-2 text-[11px] uppercase tracking-[0.2em] hover:bg-[#A99684] transition-colors flex items-center gap-1.5">
          <Plus size={13} /> Create Coupon
        </button>
      </div>

      {msg && <p className="text-[11px] px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700">{msg}</p>}

      {formOpen && (
        <div className="bg-white border border-[#EEE8DF] p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-sm uppercase">Create Coupon</h4>
            <button onClick={() => setFormOpen(false)}><X size={16} className="text-[#A99684]" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Coupon Code *</label>
              <div className="flex gap-2">
                <input className={inp + ' flex-1 uppercase'} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" />
                <button onClick={generateCode} className="px-3 py-2 border border-[#EEE8DF] text-[10px] text-[#A99684] hover:text-[#11100E] uppercase whitespace-nowrap">Generate</button>
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Discount Type</label>
              <select className={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Value {form.type === 'percent' ? '(%)' : '(₹)'} *</label>
              <input type="number" min="1" className={inp} value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Min Order (₹)</label>
              <input type="number" min="0" className={inp} value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Expiry Date</label>
              <input type="date" className={inp} value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-[#11100E]" />
              <label className="text-xs">Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setFormOpen(false)} className="text-xs text-[#A99684] uppercase tracking-wider">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="bg-[#11100E] text-[#F5F1EB] px-5 py-2 text-xs uppercase tracking-[0.2em] flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Create
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#A99684]" /></div> : (
        <div className="border border-[#EEE8DF] overflow-x-auto">
          <table className="w-full text-xs font-sans">
            <thead><tr className="bg-[#F5F1EB] border-b border-[#EEE8DF] text-[#A99684]">
              {['Code', 'Discount', 'Min Order', 'Expiry', 'Status', ''].map(h => (
                <th key={h} className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#A99684]">No coupons yet</td></tr>
              ) : coupons.map((c, i) => (
                <tr key={c._id} className={`border-b border-[#EEE8DF] hover:bg-[#F5F1EB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#11100E] bg-[#F5F1EB] px-2 py-0.5 border border-[#EEE8DF]">{c.code}</span>
                      <button onClick={() => handleCopy(c.code)} className="text-[#A99684] hover:text-[#11100E]">
                        {copied === c.code ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} off</td>
                  <td className="p-3 text-[#A99684]">{c.minOrder ? `₹${c.minOrder}` : 'None'}</td>
                  <td className="p-3 text-[#A99684]">{c.expiry || 'No expiry'}</td>
                  <td className="p-3"><span className={`text-[10px] uppercase px-2 py-0.5 border ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-3"><button onClick={() => handleDelete(c)} className="text-[#A99684] hover:text-red-500"><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
