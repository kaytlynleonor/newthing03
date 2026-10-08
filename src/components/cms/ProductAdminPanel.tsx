import React, { useState, useEffect } from 'react';
import {
  collection, getDocs, doc, addDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Product, CategoryType } from '../../types/ecommerce';
import {
  Plus, X, Save, Loader2, RefreshCw,
  Search, ChevronUp, ChevronDown, Star, Package, Images
} from 'lucide-react';
import { MediaPicker } from './MediaPicker';
import { uploadMediaFiles, mediaKindFromFile } from '../../lib/mediaUpload';

const CATEGORIES: CategoryType[] = [
  'NEW ARRIVALS', 'SIGNATURE', 'SHOES', 'BAGS', 'ACCESSORIES', 'BEAUTY', 'COLLECTIONS'
];

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '', slug: '', subtitle: '', price: 0, compareAtPrice: undefined,
  category: 'NEW ARRIVALS', collection: '', images: [],
  description: '', shortDescription: '', details: [],
  materials: '', careInstructions: '', shippingInfo: '',
  variants: [{ id: `v-${Date.now()}`, name: 'Default', colorHex: '#11100E', stock: 10 }],
  sizes: ['XS', 'S', 'M', 'L'], sku: '', rating: 0, reviewCount: 0,
  isBestseller: false, isNew: false, isLimitedEdition: false, tags: [],
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

type SortKey = 'name' | 'price' | 'category' | 'sku';

export const ProductAdminPanel: React.FC = () => {
  const { products: storeProducts, setProducts } = useStore();
  const [products, setLocal] = useState<(Product & { _docId?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'instock' | 'outofstock'>('ALL');
  const [flagFilter, setFlagFilter] = useState<'ALL' | 'new' | 'bestseller'>('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const sync = (list: (Product & { _docId?: string })[]) => {
    setLocal(list);
    setProducts(list);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('name')));
      if (!snap.empty) {
        const seen = new Set<string>();
        const unique: (Product & { _docId: string })[] = [];
        for (const d of snap.docs) {
          const data = d.data() as Product;
          const key = data.sku || data.id;
          if (seen.has(key)) {
            deleteDoc(doc(db, 'products', d.id)).catch(() => {});
          } else {
            seen.add(key);
            unique.push({ _docId: d.id, ...data });
          }
        }
        sync(unique);
      } else {
        // Firestore empty — seed from store products
        const seeded: (Product & { _docId: string })[] = [];
        for (const p of storeProducts) {
          const docRef = await addDoc(collection(db, 'products'), {
            ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          });
          seeded.push({ ...p, _docId: docRef.id });
        }
        sync(seeded);
        showMsg(`✓ ${seeded.length} products seeded.`);
      }
    } catch (e: any) {
      showMsg(`Failed to load: ${e.message} — showing local products`, 'error');
      // Fallback: use storeProducts
      sync(storeProducts.map(p => ({ ...p })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditingDocId(null);
    setForm({ ...EMPTY_PRODUCT, sku: `KL-${Date.now()}`, variants: [{ id: `v-${Date.now()}`, name: 'Default', colorHex: '#11100E', stock: 10 }] });
    setFormOpen(true);
  };

  const openEdit = (p: Product & { _docId?: string }) => {
    setEditingDocId(p._docId || null);
    const { id: _id, ...rest } = p as any;
    setForm({ ...EMPTY_PRODUCT, ...rest });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showMsg('Product name is required.', 'error'); return; }
    if (!form.price || form.price <= 0) { showMsg('Price must be greater than 0.', 'error'); return; }
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Remove undefined fields — Firestore doesn't accept them
      const clean = (obj: any) => JSON.parse(JSON.stringify(obj));
      const data = clean({ ...form, slug, updatedAt: serverTimestamp() });

      if (editingDocId) {
        await updateDoc(doc(db, 'products', editingDocId), data);
        const updated = products.map(p => p._docId === editingDocId ? { ...p, ...form, slug } : p);
        sync(updated);
        showMsg(`✓ "${form.name}" updated.`);
      } else {
        const newId = `kl-${Date.now()}`;
        const docRef = await addDoc(collection(db, 'products'), { ...data, id: newId, createdAt: serverTimestamp() });
        const newProduct = { ...form, id: newId, slug, _docId: docRef.id };
        sync([newProduct, ...products]);
        showMsg(`✓ "${form.name}" added.`);
      }
      setFormOpen(false);
    } catch (e: any) {
      showMsg(`✗ Save failed: ${e.message}`, 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (p: Product & { _docId?: string }) => {
    if (!p._docId) { showMsg('Cannot delete — missing ID.', 'error'); return; }
    setDeletingId(p._docId);
    try {
      await deleteDoc(doc(db, 'products', p._docId));
      sync(products.filter(lp => lp._docId !== p._docId));
      showMsg(`✓ "${p.name}" deleted.`);
    } catch (e: any) {
      showMsg(`✗ Delete failed: ${e.message}`, 'error');
    }
    setDeletingId(null);
    setDeleteConfirmId(null);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a); else { setSortKey(key); setSortAsc(true); }
  };

  const visible = products
    .filter(p => {
      const s = search.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(s) || (p.sku || '').toLowerCase().includes(s);
      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
      const matchStock = stockFilter === 'ALL' || (stockFilter === 'instock' ? totalStock > 0 : totalStock === 0);
      const matchFlag = flagFilter === 'ALL' || (flagFilter === 'new' ? !!p.isNew : !!p.isBestseller);
      return matchSearch && matchCat && matchStock && matchFlag;
    })
    .sort((a, b) => {
      let va: any = a[sortKey] ?? '', vb: any = b[sortKey] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
    : <ChevronDown size={11} className="opacity-20" />;

  const inp = "w-full bg-[#F5F1EB] border border-[#EEE8DF] px-3 py-2 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]";
  const lbl = "block text-[9px] font-sans uppercase tracking-[0.2em] text-[#A99684] mb-1";

  // ── FORM ─────────────────────────────────────────────────────────────────────
  if (formOpen) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-base uppercase tracking-[0.15em]">{editingDocId ? 'Edit Product' : 'Add New Product'}</h4>
        <button onClick={() => setFormOpen(false)} className="p-1 text-[#A99684] hover:text-[#11100E]"><X size={18} /></button>
      </div>

      {msg && <p className={`text-[11px] px-3 py-2 border ${msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="sm:col-span-2">
          <label className={lbl}>Product Name *</label>
          <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Silk Evening Gown" />
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Subtitle</label>
          <input className={inp} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
        </div>

        <div>
          <label className={lbl}>SKU *</label>
          <input className={inp} value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
        </div>

        <div>
          <label className={lbl}>Category *</label>
          <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as CategoryType }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={lbl}>Price (₹) *</label>
          <input type="number" min="1" className={inp} value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="e.g. 5000" />
        </div>

        <div>
          <label className={lbl}>Compare At Price (₹)</label>
          <input type="number" min="1" className={inp} value={form.compareAtPrice || ''} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Optional" />
        </div>

        <div>
          <label className={lbl}>Collection</label>
          <input className={inp} value={form.collection} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} />
        </div>

        <div>
          <label className={lbl}>Sizes (comma separated)</label>
          <input className={inp} value={form.sizes.join(', ')} onChange={e => setForm(f => ({ ...f, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
        </div>

        {/* Images */}
        <div className="sm:col-span-2">
          <label className={lbl}>Product Images</label>
          <div className="space-y-2">
            {form.images.filter(Boolean).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.filter(Boolean).map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-20 object-cover border border-[#EEE8DF]" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, ii) => ii !== i) }))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`px-4 py-5 border border-dashed text-center transition-colors ${
                imageDragOver ? 'border-[#11100E] bg-white' : 'border-[#A99684] bg-[#FAFAF8]'
              }`}
              onDragOver={e => { e.preventDefault(); setImageDragOver(true); }}
              onDragLeave={() => setImageDragOver(false)}
              onDrop={async e => {
                e.preventDefault();
                setImageDragOver(false);
                const files = Array.from(e.dataTransfer.files).filter(f => mediaKindFromFile(f) === 'image');
                if (!files.length) return;
                try {
                  const uploaded = await uploadMediaFiles(files);
                  const urls = uploaded.map(u => u.url);
                  setForm(f => ({ ...f, images: [...f.images.filter(Boolean), ...urls] }));
                  showMsg(`✓ ${urls.length} image(s) added from library upload.`);
                } catch (err: unknown) {
                  showMsg(err instanceof Error ? err.message : 'Upload failed', 'error');
                }
              }}
            >
              <p className="text-[10px] text-[#A99684] uppercase tracking-wider mb-2">Drop images here</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#11100E] text-[11px] uppercase tracking-wider text-[#11100E] hover:bg-[#11100E] hover:text-[#F5F1EB] transition-colors"
                >
                  <Images size={13} /> Choose from Media
                </button>
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-dashed border-[#A99684] text-[11px] uppercase tracking-wider text-[#A99684] hover:border-[#11100E] hover:text-[#11100E] transition-colors">
                  <Plus size={13} /> Upload
                  <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                    const files = Array.from(e.target.files || []).filter(f => mediaKindFromFile(f) === 'image');
                    if (files.length) {
                      try {
                        const uploaded = await uploadMediaFiles(files);
                        setForm(f => ({ ...f, images: [...f.images.filter(Boolean), ...uploaded.map(u => u.url)] }));
                      } catch {
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const url = ev.target?.result as string;
                            if (url) setForm(f => ({ ...f, images: [...f.images.filter(Boolean), url] }));
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }
                    e.target.value = '';
                  }} />
                </label>
              </div>
            </div>
            <input className={inp} placeholder="Or paste image URL here and press Enter"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) { setForm(f => ({ ...f, images: [...f.images.filter(Boolean), val] })); (e.target as HTMLInputElement).value = ''; }
                  e.preventDefault();
                }
              }} />
          </div>
          <MediaPicker
            open={mediaPickerOpen}
            onClose={() => setMediaPickerOpen(false)}
            imagesOnly
            multi
            selectedUrls={form.images.filter(Boolean)}
            onConfirm={urls => {
              setForm(f => ({
                ...f,
                images: [...new Set([...f.images.filter(Boolean), ...urls])],
              }));
            }}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Short Description</label>
          <input className={inp} value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Full Description</label>
          <textarea rows={3} className={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Details (one per line)</label>
          <textarea rows={3} className={inp} value={form.details.join('\n')} onChange={e => setForm(f => ({ ...f, details: e.target.value.split('\n').filter(Boolean) }))} />
        </div>

        <div>
          <label className={lbl}>Materials</label>
          <input className={inp} value={form.materials} onChange={e => setForm(f => ({ ...f, materials: e.target.value }))} />
        </div>

        <div>
          <label className={lbl}>Care Instructions</label>
          <input className={inp} value={form.careInstructions} onChange={e => setForm(f => ({ ...f, careInstructions: e.target.value }))} />
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Shipping Info</label>
          <input className={inp} value={form.shippingInfo} onChange={e => setForm(f => ({ ...f, shippingInfo: e.target.value }))} />
        </div>

        <div>
          <label className={lbl}>Tags (comma separated)</label>
          <input className={inp} value={form.tags.join(', ')} onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
        </div>

        {/* Variants */}
        <div className="sm:col-span-2">
          <label className={lbl}>Variants</label>
          <div className="space-y-2">
            {form.variants.map((v, i) => (
              <div key={v.id} className="flex items-center gap-2">
                <input className={inp + ' flex-1'} placeholder="Variant name e.g. White" value={v.name}
                  onChange={e => setForm(f => ({ ...f, variants: f.variants.map((vv, ii) => ii === i ? { ...vv, name: e.target.value } : vv) }))} />
                <input type="color" className="w-8 h-8 border border-[#EEE8DF] cursor-pointer rounded" value={v.colorHex || '#11100E'}
                  onChange={e => setForm(f => ({ ...f, variants: f.variants.map((vv, ii) => ii === i ? { ...vv, colorHex: e.target.value } : vv) }))} />
                <input type="number" min="0" className={inp + ' w-20'} placeholder="Stock" value={v.stock}
                  onChange={e => setForm(f => ({ ...f, variants: f.variants.map((vv, ii) => ii === i ? { ...vv, stock: Number(e.target.value) } : vv) }))} />
                <button type="button" onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, ii) => ii !== i) }))}
                  className="p-1 text-[#A99684] hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm(f => ({ ...f, variants: [...f.variants, { id: `v-${Date.now()}`, name: '', colorHex: '#11100E', stock: 10 }] }))}
              className="text-[10px] font-sans uppercase tracking-wider text-[#A99684] hover:text-[#11100E] flex items-center gap-1">
              <Plus size={12} /> Add Variant
            </button>
          </div>
        </div>

        {/* Flags */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={!!form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} className="accent-[#11100E]" />
            New Arrival
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={!!form.isBestseller} onChange={e => setForm(f => ({ ...f, isBestseller: e.target.checked }))} className="accent-[#11100E]" />
            Bestseller
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={!!form.isLimitedEdition} onChange={e => setForm(f => ({ ...f, isLimitedEdition: e.target.checked }))} className="accent-[#11100E]" />
            Limited Edition
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#EEE8DF]">
        <button type="button" onClick={() => setFormOpen(false)} className="text-xs text-[#A99684] uppercase tracking-wider hover:text-[#11100E]">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="bg-[#11100E] text-[#F5F1EB] px-6 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#A99684] transition-colors flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {editingDocId ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </div>
  );

  // ── TABLE ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A99684]" />
            <input className="w-full bg-white border border-[#EEE8DF] pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-[#11100E]"
              placeholder="Search name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={fetchProducts} className="p-2 border border-[#EEE8DF] bg-white text-[#A99684] hover:text-[#11100E]"><RefreshCw size={13} /></button>
        </div>
        <button onClick={openAdd} className="bg-[#11100E] text-[#F5F1EB] px-4 py-2 text-[11px] uppercase tracking-[0.2em] hover:bg-[#A99684] transition-colors flex items-center gap-1.5 shrink-0">
          <Plus size={13} /> Add Product
        </button>
      </div>

      {/* Filter bar — WooCommerce style */}
      <div className="flex flex-wrap items-center gap-2 py-2 border-y border-[#EEE8DF] bg-white px-3">
        <select className="border border-[#EEE8DF] px-2 py-1.5 text-xs focus:outline-none bg-white">
          <option>Bulk actions</option>
          <option>Delete</option>
        </select>
        <button className="border border-[#EEE8DF] px-3 py-1.5 text-xs bg-white hover:bg-[#F5F1EB]">Apply</button>
        <select className="border border-[#EEE8DF] px-2 py-1.5 text-xs focus:outline-none bg-white"
          value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as CategoryType | 'ALL')}>
          <option value="ALL">Select a category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="border border-[#EEE8DF] px-2 py-1.5 text-xs focus:outline-none bg-white"
          value={stockFilter} onChange={e => setStockFilter(e.target.value as 'ALL' | 'instock' | 'outofstock')}>
          <option value="ALL">Filter by stock status</option>
          <option value="instock">In stock</option>
          <option value="outofstock">Out of stock</option>
        </select>
        <select className="border border-[#EEE8DF] px-2 py-1.5 text-xs focus:outline-none bg-white"
          value={flagFilter} onChange={e => setFlagFilter(e.target.value as 'ALL' | 'new' | 'bestseller')}>
          <option value="ALL">Filter by type</option>
          <option value="new">New Arrivals</option>
          <option value="bestseller">Bestseller</option>
        </select>
        <button onClick={fetchProducts} className="border border-[#EEE8DF] px-3 py-1.5 text-xs bg-white hover:bg-[#F5F1EB]">Filter</button>
        <span className="ml-auto text-[11px] text-[#A99684]">{visible.length} items</span>
      </div>

      {msg && <p className={`text-[11px] px-3 py-2 border ${msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-[#A99684]" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-[#A99684] mb-3" strokeWidth={1} />
          <p className="text-sm text-[#A99684] uppercase tracking-wider">No products found</p>
        </div>
      ) : (
        <div className="border border-[#EEE8DF] overflow-x-auto">
          <table className="w-full text-xs font-sans min-w-[700px]">
            <thead>
              <tr className="bg-[#F5F1EB] border-b-2 border-[#EEE8DF] text-[#A99684]">
                <th className="w-8 p-3"><input type="checkbox" className="accent-[#11100E]" /></th>
                <th className="w-12 p-3"></th>
                <th className="p-3 text-left cursor-pointer select-none text-[10px] uppercase tracking-[0.2em]" onClick={() => toggleSort('name')}><span className="flex items-center gap-1">Name <SortIcon k="name" /></span></th>
                <th className="p-3 text-left cursor-pointer select-none text-[10px] uppercase tracking-[0.2em]" onClick={() => toggleSort('sku')}><span className="flex items-center gap-1">SKU <SortIcon k="sku" /></span></th>
                <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Stock</th>
                <th className="p-3 text-left cursor-pointer select-none text-[10px] uppercase tracking-[0.2em]" onClick={() => toggleSort('price')}><span className="flex items-center gap-1">Price <SortIcon k="price" /></span></th>
                <th className="p-3 text-left cursor-pointer select-none text-[10px] uppercase tracking-[0.2em]" onClick={() => toggleSort('category')}><span className="flex items-center gap-1">Category <SortIcon k="category" /></span></th>
                <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Tags</th>
                <th className="p-3 text-center text-[10px] uppercase tracking-[0.2em]">Views</th>
                <th className="p-3 text-center text-[10px] uppercase tracking-[0.2em]">★</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => {
                const totalStock = p.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0;
                return (
                  <tr key={p._docId || p.id || i} className={`border-b border-[#EEE8DF] transition-colors group ${deleteConfirmId === (p._docId || p.id) ? 'bg-red-50' : i % 2 === 0 ? 'bg-white hover:bg-[#F0EDE8]' : 'bg-[#FAFAF8] hover:bg-[#F0EDE8]'}`}>
                    <td className="p-3"><input type="checkbox" className="accent-[#11100E]" /></td>
                    <td className="p-2">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover border border-[#EEE8DF]" />
                        : <div className="w-10 h-12 bg-[#EEE8DF] flex items-center justify-center"><Package size={14} className="text-[#A99684]" /></div>}
                    </td>
                    <td className="p-3">
                      <p className="font-sans text-sm font-medium text-[#11100E]">{p.name}</p>
                      <p className="text-[10px] text-[#A99684] mt-0.5 mb-1.5">{p.subtitle}</p>
                      <div className="flex items-center gap-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="text-[#11100E] hover:text-[#A99684] underline">Edit</button>
                        <span className="text-[#D8C8B7]">|</span>
                        {deleteConfirmId === (p._docId || p.id) ? (
                          <div className="flex items-center gap-2 !opacity-100">
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(p); }} disabled={deletingId === (p._docId || p.id)} className="text-red-600 hover:text-red-800 underline font-semibold">
                              {deletingId === (p._docId || p.id) ? '...' : 'Confirm delete'}
                            </button>
                            <span className="text-[#D8C8B7]">|</span>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} className="text-[#A99684] hover:text-[#11100E] underline">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p._docId || p.id || ''); }} className="text-red-500 hover:text-red-700 underline">Trash</button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-[#A99684] font-mono text-[11px]">{p.sku || '—'}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-medium ${totalStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{totalStock > 0 ? 'In stock' : 'Out of stock'}</span>
                      {totalStock > 0 && <p className="text-[10px] text-[#A99684]">{totalStock} units</p>}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-[#11100E]">{fmt(p.price)}</p>
                      {p.compareAtPrice && <p className="text-[10px] text-[#A99684] line-through">{fmt(p.compareAtPrice)}</p>}
                    </td>
                    <td className="p-3 text-[11px] text-[#A99684]">{p.category}</td>
                    <td className="p-3 text-[11px] text-[#A99684]">{p.tags?.slice(0, 2).join(', ') || '—'}</td>
                    <td className="p-3 text-center">
                      <span className="text-[11px] font-medium text-[#2C2925]">{p.viewCount ?? 0}</span>
                      <p className="text-[9px] text-[#A99684] uppercase tracking-wider">views</p>
                    </td>
                    <td className="p-3 text-center"><Star size={14} className={p.isBestseller ? 'text-amber-400 fill-amber-400' : 'text-[#EEE8DF]'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
