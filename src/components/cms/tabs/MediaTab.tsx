import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import { useStore } from '../../../context/StoreContext';
import { uploadMediaFiles, acceptedMediaInput, mediaKindFromFile } from '../../../lib/mediaUpload';
import { loadMediaLibrary, cleanupDuplicateMediaDocs, normalizeUrl, type MediaRow } from '../../../lib/mediaLibrary';
import { INITIAL_PRODUCTS } from '../../../data/products';
import type { MediaKind } from '../../../types/ecommerce';
import {
  Loader2,
  Upload,
  Trash2,
  Film,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';

export const MediaTab: React.FC = () => {
  const { products, setProducts } = useStore();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState<'all' | MediaKind>('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const catalog = products.length ? products : INITIAL_PRODUCTS;
      const { items, seededCount, removedDuplicatesCount } = await loadMediaLibrary(catalog);
      
      // Ensure local state is strictly deduplicated
      const seen = new Set<string>();
      const deduped: MediaRow[] = [];
      for (const item of items) {
        const norm = normalizeUrl(item.url);
        if (!seen.has(norm)) {
          seen.add(norm);
          deduped.push(item);
        }
      }
      setItems(deduped);
      
      if (removedDuplicatesCount > 0) {
        showMsg(`✓ Removed ${removedDuplicatesCount} duplicate media entries.`);
      } else if (seededCount > 0) {
        showMsg(`✓ Added ${seededCount} catalog image(s) from products.`);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load media';
      showMsg(message, 'error');
    }
    setLoading(false);
  };

  const handleCleanDuplicates = async () => {
    setLoading(true);
    try {
      const count = await cleanupDuplicateMediaDocs();
      await fetchMedia();
      showMsg(`✓ Successfully purged duplicate images (${count} removed).`);
    } catch {
      showMsg('Could not clean duplicates', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => mediaKindFromFile(f));
    if (!files.length) {
      showMsg('No supported images or videos in selection.', 'error');
      return;
    }
    setUploading(true);
    setUploadProgress(`0 / ${files.length}`);
    try {
      const uploaded = await uploadMediaFiles(files, (done, total) => {
        setUploadProgress(`${done} / ${total}`);
      });
      setItems(prev => [...uploaded, ...prev]);
      showMsg(`✓ ${uploaded.length} file(s) uploaded.`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      showMsg(message, 'error');
    }
    setUploading(false);
    setUploadProgress('');
  };

  const handleDelete = async (row: MediaRow) => {
    if (row._docId.startsWith('catalog-')) {
      showMsg('Connect Firebase to manage the library.', 'error');
      return;
    }
    if (!window.confirm(`Delete "${row.name}" from the library?`)) return;
    setDeletingId(row._docId);
    try {
      if (row.url.includes('firebasestorage.googleapis.com')) {
        try {
          const pathMatch = row.url.match(/\/o\/(.+?)\?/);
          if (pathMatch) {
            const path = decodeURIComponent(pathMatch[1]);
            await deleteObject(ref(storage, path));
          }
        } catch {
          /* storage object may already be gone */
        }
      }
      await deleteDoc(doc(db, 'media', row._docId));
      setItems(prev => prev.filter(i => i._docId !== row._docId));
      showMsg('✓ Media deleted.');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Delete failed';
      showMsg(message, 'error');
    }
    setDeletingId(null);
  };

  const assignToProduct = async (row: MediaRow, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (row.kind !== 'image') {
      showMsg('Only images can be added to product galleries.', 'error');
      return;
    }
    setAssigningId(row._docId);
    try {
      const images = product.images?.includes(row.url)
        ? product.images
        : [...(product.images || []).filter(Boolean), row.url];

      const productSnap = await getDocs(query(collection(db, 'products')));
      const match = productSnap.docs.find(d => (d.data() as { id?: string }).id === productId);
      if (match) {
        await updateDoc(doc(db, 'products', match.id), { images });
      }
      setProducts(prev => prev.map(p => (p.id === productId ? { ...p, images } : p)));

      await updateDoc(doc(db, 'media', row._docId), {
        linkedProductIds: arrayUnion(productId),
      });

      setItems(prev =>
        prev.map(i =>
          i._docId === row._docId
            ? {
                ...i,
                linkedProductIds: [...new Set([...(i.linkedProductIds || []), productId])],
              }
            : i
        )
      );
      showMsg(`✓ Added to "${product.name}".`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not assign to product';
      showMsg(message, 'error');
    }
    setAssigningId(null);
  };

  const visible = items.filter(row => {
    if (filter !== 'all' && row.kind !== filter) return false;
    const q = search.toLowerCase();
    if (q && !row.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const fmtSize = (n: number) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684]">
          {items.length} assets · drag & drop to upload
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCleanDuplicates}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider border border-[#EEE8DF] bg-white px-3 py-2 hover:bg-[#F5F1EB] text-[#11100E]"
            title="Remove duplicate images"
          >
            <Sparkles size={12} className="text-[#A99684]" /> Clean Duplicates
          </button>
          <button
            type="button"
            onClick={fetchMedia}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider border border-[#EEE8DF] bg-white px-3 py-2 hover:bg-[#F5F1EB]"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {msg && (
        <p
          className={`text-[11px] px-3 py-2 border ${
            msgType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {msg}
        </p>
      )}

      <div
        className={`border-2 border-dashed bg-white px-6 py-12 text-center transition-colors ${
          dragOver ? 'border-[#11100E] bg-[#F5F1EB]' : 'border-[#A99684]'
        }`}
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <div className="space-y-2">
            <Loader2 size={28} className="mx-auto animate-spin text-[#A99684]" />
            <p className="text-xs text-[#A99684]">Uploading {uploadProgress}</p>
          </div>
        ) : (
          <>
            <Upload size={32} className="mx-auto text-[#A99684] mb-3" strokeWidth={1.2} />
            <p className="font-serif text-sm uppercase tracking-[0.12em] text-[#11100E]">
              Drop images & videos here
            </p>
            <p className="text-[11px] text-[#A99684] mt-1 mb-4">PNG, JPG, WebP, MP4, WebM and more</p>
            <label className="inline-flex cursor-pointer items-center gap-2 bg-[#11100E] text-[#F5F1EB] px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] hover:bg-[#A99684] transition-colors">
              Browse files
              <input
                type="file"
                accept={acceptedMediaInput()}
                multiple
                className="hidden"
                onChange={e => {
                  if (e.target.files) handleFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A99684]" />
          <input
            className="w-full bg-white border border-[#EEE8DF] pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-[#11100E]"
            placeholder="Search filename..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {(['all', 'image', 'video'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-[10px] uppercase tracking-wider border ${
              filter === f
                ? 'bg-[#11100E] text-[#F5F1EB] border-[#11100E]'
                : 'bg-white border-[#EEE8DF] text-[#A99684] hover:border-[#11100E]'
            }`}
          >
            {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#A99684]" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-center text-sm text-[#A99684] py-16">No media matches your filters.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {visible.map(row => (
            <div
              key={row._docId}
              className="bg-white border border-[#EEE8DF] overflow-hidden group flex flex-col"
            >
              <div className="relative aspect-[3/4] bg-[#F5F1EB]">
                {row.kind === 'video' ? (
                  <video src={row.url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={row.url} alt={row.name} className="w-full h-full object-cover" />
                )}
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[8px] uppercase tracking-wider px-1.5 py-0.5 flex items-center gap-1">
                  {row.kind === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                  {row.kind}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  disabled={deletingId === row._docId}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === row._docId ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
              <div className="p-2 space-y-2 flex-1 flex flex-col">
                <p className="text-[10px] font-medium text-[#11100E] truncate" title={row.name}>
                  {row.name}
                </p>
                <p className="text-[9px] text-[#A99684]">{fmtSize(row.size)}</p>
                {row.kind === 'image' && (
                  <div className="mt-auto">
                    <label className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#A99684] mb-1">
                      <Link2 size={10} /> Assign to product
                    </label>
                    <select
                      className="w-full border border-[#EEE8DF] text-[10px] py-1.5 px-1 bg-[#F5F1EB] focus:outline-none focus:border-[#11100E]"
                      defaultValue=""
                      disabled={assigningId === row._docId}
                      onChange={e => {
                        const id = e.target.value;
                        if (id) assignToProduct(row, id);
                        e.target.value = '';
                      }}
                    >
                      <option value="">Select product…</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {(row.linkedProductIds?.length ?? 0) > 0 && (
                  <p className="text-[9px] text-emerald-700">
                    Linked to {row.linkedProductIds!.length} product(s)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
