import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { fetchInstagramPosts } from '../../../lib/instagramPosts';
import { uploadMediaFile } from '../../../lib/mediaUpload';
import { loadMediaLibrary, type MediaRow } from '../../../lib/mediaLibrary';
import { useStore } from '../../../context/StoreContext';
import { INITIAL_PRODUCTS } from '../../../data/products';
import { INITIAL_POSTS } from '../../home/SocialGallery';
import {
  Loader2, RefreshCw, Trash2, ExternalLink, ImageIcon,
  Upload, Link2, Library, ChevronDown, ChevronUp, Plus
} from 'lucide-react';

interface IgPost {
  _docId: string;
  src: string;
  href: string;
  alt?: string;
  kind?: 'image' | 'video';
  createdAt?: unknown;
}

type AddMode = 'url' | 'upload' | 'library' | null;

export const InstagramMediaTab: React.FC = () => {
  const { products } = useStore();

  /* ── Saved posts ─────────────────────────────────────── */
  const [posts, setPosts]       = useState<IgPost[]>([]);
  const [loading, setLoading]   = useState(false);

  /* ── Add-new panel ───────────────────────────────────── */
  const [addMode, setAddMode]   = useState<AddMode>(null);

  /* URL mode */
  const [urlSrc, setUrlSrc]     = useState('');
  const [urlHref, setUrlHref]   = useState('');
  const [urlAlt, setUrlAlt]     = useState('');
  const [urlSaving, setUrlSaving] = useState(false);

  /* Upload mode */
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  /* Library mode */
  const [libraryItems, setLibraryItems] = useState<MediaRow[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libSearch, setLibSearch] = useState('');

  /* Sync mode */
  const [syncing, setSyncing]   = useState(false);

  /* Status */
  const [msg, setMsg]           = useState('');
  const [msgErr, setMsgErr]     = useState(false);

  const flash = (text: string, err = false) => {
    setMsg(text); setMsgErr(err);
    setTimeout(() => setMsg(''), 4000);
  };

  /* ── Helpers ─────────────────────────────────────────── */
  const inp = 'w-full bg-[#F5F1EB] border border-[#EEE8DF] px-3 py-2.5 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E] placeholder:text-[#C5BDB0]';
  const lbl = 'block text-[10px] text-[#A99684] uppercase tracking-[0.2em] mb-1';

  /* ── Fetch saved posts ───────────────────────────────── */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, 'instagramMedia'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ _docId: d.id, ...d.data() } as IgPost)));
    } catch (e) {
      console.error(e);
      flash('Could not load posts from Firestore.', true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  /* ── Save a post doc ─────────────────────────────────── */
  const savePost = async (data: Omit<IgPost, '_docId'>) => {
    const docRef = await addDoc(collection(db, 'instagramMedia'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    const newPost: IgPost = { _docId: docRef.id, ...data };
    setPosts(prev => [newPost, ...prev]);
  };

  /* ── URL mode ────────────────────────────────────────── */
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlSrc.trim()) { flash('Please enter a media URL.', true); return; }
    setUrlSaving(true);
    try {
      await savePost({ src: urlSrc.trim(), href: urlHref.trim() || urlSrc.trim(), alt: urlAlt.trim(), kind: 'image' });
      setUrlSrc(''); setUrlHref(''); setUrlAlt('');
      flash('✓ Post added from URL.');
      setAddMode(null);
    } catch { flash('Failed to save post.', true); }
    setUrlSaving(false);
  };

  /* ── Local upload ────────────────────────────────────── */
  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (!validFiles.length) { flash('No supported image/video files selected.', true); return; }
    setUploading(true);
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(`${i + 1} / ${validFiles.length}`);
        // Upload to the shared media library, then also save a reference in instagramMedia
        const asset = await uploadMediaFile(file);
        const kind  = file.type.startsWith('video') ? 'video' as const : 'image' as const;
        await savePost({ src: asset.url, href: asset.url, alt: file.name, kind });
      }
      flash(`✓ ${validFiles.length} file(s) uploaded and added.`);
      setAddMode(null);
    } catch (e) {
      console.error(e);
      flash('Upload failed. Check Firebase Storage rules.', true);
    }
    setUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Media library picker ────────────────────────────── */
  const openLibrary = async () => {
    setAddMode('library');
    if (libraryItems.length) return;
    setLibraryLoading(true);
    try {
      const catalog = products.length ? products : INITIAL_PRODUCTS;
      const { items } = await loadMediaLibrary(catalog);
      setLibraryItems(items);
    } catch { flash('Could not load media library.', true); }
    setLibraryLoading(false);
  };

  const handlePickFromLibrary = async (row: MediaRow) => {
    try {
      await savePost({ src: row.url, href: row.url, alt: row.name, kind: row.kind === 'video' ? 'video' : 'image' });
      flash(`✓ "${row.name}" added to Instagram section.`);
    } catch { flash('Failed to save post.', true); }
  };

  /* ── Sync from Instagram API ─────────────────────────── */
  const handleSync = async () => {
    setSyncing(true);
    try {
      const fetched = await fetchInstagramPosts();
      if (!fetched.length) {
        flash('No posts returned from /api/instagram-posts. Check your token/proxy.', true);
        setSyncing(false);
        return;
      }
      const existingHrefs = new Set(posts.map(p => p.href));
      const toAdd = fetched.filter(p => !existingHrefs.has(p.href));
      for (const p of toAdd) {
        await savePost({ src: p.src, href: p.href, alt: p.alt ?? '', kind: 'image' });
      }
      flash(`✓ Synced ${toAdd.length} new post(s). ${fetched.length - toAdd.length} already saved.`);
    } catch (e) {
      console.error(e);
      flash('Sync failed. See console for details.', true);
    }
    setSyncing(false);
  };

  /* ── Delete ──────────────────────────────────────────── */
  const handleDelete = async (docId: string) => {
    if (!window.confirm('Remove this post from the Instagram section?')) return;
    try {
      await deleteDoc(doc(db, 'instagramMedia', docId));
      setPosts(prev => prev.filter(p => p._docId !== docId));
      flash('✓ Post removed.');
    } catch { flash('Delete failed.', true); }
  };

  const toggleMode = (mode: AddMode) => setAddMode(prev => prev === mode ? null : mode);

  const visibleLib = libraryItems.filter(r =>
    !libSearch || r.name.toLowerCase().includes(libSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg uppercase tracking-[0.2em]">📸 Instagram Media</h2>
          <p className="text-[10px] text-[#A99684] uppercase tracking-wider mt-0.5">
            {posts.length} post{posts.length !== 1 ? 's' : ''} · shown on Shop Our IG section
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button" onClick={fetchPosts} disabled={loading}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider border border-[#EEE8DF] bg-white px-3 py-2 hover:bg-[#F5F1EB] text-[#A99684] hover:text-[#11100E] disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            type="button" onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider bg-[#11100E] text-[#F5F1EB] px-4 py-2 hover:bg-[#A99684] transition-colors disabled:opacity-60"
          >
            {syncing ? <><Loader2 size={12} className="animate-spin" /> Syncing…</> : <><RefreshCw size={12} /> Sync from Instagram</>}
          </button>
        </div>
      </div>

      {/* ── Status ── */}
      {msg && (
        <p className={`text-[11px] px-3 py-2 border ${msgErr
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {msg}
        </p>
      )}

      {/* ── Add Panel ── */}
      <div className="bg-white border border-[#EEE8DF]">
        <div className="flex items-center gap-px border-b border-[#EEE8DF]">
          {([
            { mode: 'url'     as AddMode, icon: <Link2   size={13}/>, label: 'Add URL'       },
            { mode: 'upload'  as AddMode, icon: <Upload  size={13}/>, label: 'Upload File'   },
            { mode: 'library' as AddMode, icon: <Library size={13}/>, label: 'Media Library' },
          ] as const).map(tab => (
            <button
              key={tab.mode}
              type="button"
              onClick={() => tab.mode === 'library' ? openLibrary() : toggleMode(tab.mode)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] uppercase tracking-wider border-r border-[#EEE8DF] last:border-r-0 transition-colors ${
                addMode === tab.mode
                  ? 'bg-[#11100E] text-[#F5F1EB]'
                  : 'text-[#A99684] hover:text-[#11100E] hover:bg-[#F5F1EB]'
              }`}
            >
              {tab.icon} {tab.label}
              {addMode === tab.mode ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          ))}
        </div>

        {/* URL form */}
        {addMode === 'url' && (
          <form onSubmit={handleAddUrl} className="p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Image / Video URL *</label>
                <input type="url" required value={urlSrc} onChange={e => setUrlSrc(e.target.value)}
                  placeholder="https://…" className={inp} />
              </div>
              <div>
                <label className={lbl}>Instagram Post Link</label>
                <input type="url" value={urlHref} onChange={e => setUrlHref(e.target.value)}
                  placeholder="https://instagram.com/p/…" className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Alt Text / Caption</label>
              <input type="text" value={urlAlt} onChange={e => setUrlAlt(e.target.value)}
                placeholder="e.g. Summer look" className={inp} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={urlSaving}
                className="flex items-center gap-2 bg-[#11100E] text-[#F5F1EB] px-5 py-2 text-[11px] uppercase tracking-wider hover:bg-[#A99684] transition-colors disabled:opacity-60">
                {urlSaving && <Loader2 size={12} className="animate-spin" />}
                <Plus size={12} /> Add Post
              </button>
            </div>
          </form>
        )}

        {/* Upload form */}
        {addMode === 'upload' && (
          <div className="p-4">
            <div
              className="border-2 border-dashed border-[#A99684] bg-[#F5F1EB] p-8 text-center cursor-pointer hover:border-[#11100E] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
            >
              {uploading ? (
                <div className="space-y-2">
                  <Loader2 size={28} className="mx-auto animate-spin text-[#A99684]" />
                  <p className="text-xs text-[#A99684]">Uploading {uploadProgress}</p>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto text-[#A99684] mb-2" strokeWidth={1.2} />
                  <p className="text-sm font-serif uppercase tracking-wider text-[#11100E]">Drop files here or click</p>
                  <p className="text-[11px] text-[#A99684] mt-1">JPG, PNG, WebP, MP4, WebM</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
              onChange={e => handleUpload(e.target.files)} />
          </div>
        )}

        {/* Library picker */}
        {addMode === 'library' && (
          <div className="p-4 space-y-3">
            <input type="text" value={libSearch} onChange={e => setLibSearch(e.target.value)}
              placeholder="Search media library…" className={inp} />
            {libraryLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#A99684]" /></div>
            ) : visibleLib.length === 0 ? (
              <p className="text-center py-6 text-sm text-[#A99684]">No media found.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {visibleLib.map(row => (
                  <button
                    key={row._docId}
                    type="button"
                    onClick={() => handlePickFromLibrary(row)}
                    className="group relative aspect-square overflow-hidden bg-[#EEE8DF] border border-transparent hover:border-[#11100E] transition-all"
                    title={row.name}
                  >
                    {row.kind === 'video'
                      ? <video src={row.url} className="w-full h-full object-cover" muted playsInline />
                      : <img src={row.url} alt={row.name} className="w-full h-full object-cover" />
                    }
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus size={18} className="text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Saved posts grid ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684] mb-3">
          Saved Posts ({posts.length})
        </p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#A99684]" /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-[#EEE8DF] p-10 text-center space-y-2">
            <ImageIcon size={32} className="mx-auto text-[#A99684]" strokeWidth={1} />
            <p className="text-sm text-[#11100E] font-serif uppercase tracking-wider">No posts yet</p>
            <p className="text-[11px] text-[#A99684] mb-4">
              Add posts using the URL, Upload, or Library options above,<br />
              or click <strong>Sync from Instagram</strong> to pull from your API.
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  for (const p of INITIAL_POSTS) {
                    await addDoc(collection(db, 'instagramMedia'), {
                      src: p.image,
                      href: 'https://www.instagram.com/kaytlynleonor/',
                      alt: p.caption || '',
                      kind: 'image',
                      createdAt: serverTimestamp(),
                    });
                  }
                  await fetchPosts();
                  flash('✓ Demo posts loaded.');
                } catch {
                  flash('Failed to load demo posts.', true);
                }
              }}
              className="mt-4 mx-auto flex items-center gap-2 bg-[#11100E] text-[#F5F1EB] px-4 py-2 text-[11px] uppercase tracking-wider hover:bg-[#A99684] transition-colors"
            >
              <Plus size={12} /> Load Demo Posts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
            {posts.map(post => (
              <div key={post._docId} className="group relative aspect-square overflow-hidden bg-[#EEE8DF]">
                {post.kind === 'video'
                  ? <video src={post.src} className="w-full h-full object-cover" muted playsInline loop />
                  : <img src={post.src} alt={post.alt ?? ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                }
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a
                    href={post.href} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-2 bg-white/90 text-[#11100E] hover:bg-white rounded-sm" title="Open link"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button type="button" onClick={() => handleDelete(post._docId)}
                    className="p-2 bg-white/90 text-red-600 hover:bg-white rounded-sm" title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
                {post.alt && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.alt}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
