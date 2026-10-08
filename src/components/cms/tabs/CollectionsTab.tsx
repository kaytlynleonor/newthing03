import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Plus, X, Save, Pencil, Trash2 } from 'lucide-react';

interface Collection { id: string; name: string; subtitle: string; image: string; itemCount?: number; }

export const CollectionsTab: React.FC = () => {
  const { products } = useStore();
  const [collections, setCollections] = useState<Collection[]>(() => {
    const names = Array.from(new Set(products.map(p => p.collection).filter(Boolean)));
    return names.map(n => ({
      id: n.toLowerCase().replace(/\s+/g, '-'),
      name: n,
      subtitle: '',
      image: products.find(p => p.collection === n)?.images[0] || '',
      itemCount: products.filter(p => p.collection === n).length,
    }));
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subtitle: '', image: '' });
  const [msg, setMsg] = useState('');

  const showMsg = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  const openAdd = () => { setEditId(null); setForm({ name: '', subtitle: '', image: '' }); setFormOpen(true); };
  const openEdit = (c: Collection) => { setEditId(c.id); setForm({ name: c.name, subtitle: c.subtitle, image: c.image }); setFormOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setCollections(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
      showMsg('✓ Collection updated.');
    } else {
      const id = form.name.toLowerCase().replace(/\s+/g, '-');
      setCollections(prev => [...prev, { id, ...form, itemCount: 0 }]);
      showMsg('✓ Collection added.');
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    showMsg('✓ Collection deleted.');
  };

  const inp = "w-full bg-[#F5F1EB] border border-[#EEE8DF] px-3 py-2 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684]">{collections.length} collections</p>
        <button onClick={openAdd} className="bg-[#11100E] text-[#F5F1EB] px-4 py-2 text-[11px] uppercase tracking-[0.2em] hover:bg-[#A99684] transition-colors flex items-center gap-1.5">
          <Plus size={13} /> Add Collection
        </button>
      </div>

      {msg && <p className="text-[11px] px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700">{msg}</p>}

      {formOpen && (
        <div className="bg-white border border-[#EEE8DF] p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-sm uppercase">{editId ? 'Edit Collection' : 'Add Collection'}</h4>
            <button onClick={() => setFormOpen(false)}><X size={16} className="text-[#A99684]" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Name *</label><input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Subtitle</label><input className={inp} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} /></div>
            <div className="sm:col-span-2"><label className="block text-[9px] uppercase tracking-[0.2em] text-[#A99684] mb-1">Image URL</label><input className={inp} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setFormOpen(false)} className="text-xs text-[#A99684] uppercase tracking-wider">Cancel</button>
            <button onClick={handleSave} className="bg-[#11100E] text-[#F5F1EB] px-5 py-2 text-xs uppercase tracking-[0.2em] flex items-center gap-1.5"><Save size={13} /> Save</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map(c => (
          <div key={c.id} className="bg-white border border-[#EEE8DF] overflow-hidden group">
            <div className="aspect-[4/3] bg-[#F5F1EB] relative overflow-hidden">
              {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-[#A99684] text-xs uppercase">No image</div>}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-serif text-sm uppercase tracking-wider">{c.name}</p>
                <p className="text-[10px] text-[#A99684] mt-0.5">{c.itemCount ?? 0} products</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 border border-[#EEE8DF] hover:bg-[#F5F1EB]"><Pencil size={12} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 border border-[#EEE8DF] hover:bg-red-50 hover:text-red-500 hover:border-red-200"><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
