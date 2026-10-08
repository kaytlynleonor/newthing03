import React, { useEffect, useState } from 'react';
import { uploadMediaFiles, acceptedMediaInput, mediaKindFromFile } from '../../lib/mediaUpload';
import { loadMediaLibrary, type MediaRow } from '../../lib/mediaLibrary';
import { useStore } from '../../context/StoreContext';
import { INITIAL_PRODUCTS } from '../../data/products';
import type { MediaAsset, MediaKind } from '../../types/ecommerce';
import { X, Loader2, Upload, Check, Film, Image as ImageIcon } from 'lucide-react';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  /** Only images can be attached to product galleries */
  imagesOnly?: boolean;
  multi?: boolean;
  selectedUrls?: string[];
  onConfirm: (urls: string[]) => void;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  open,
  onClose,
  imagesOnly = true,
  multi = true,
  selectedUrls = [],
  onConfirm,
}) => {
  const { products } = useStore();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | MediaKind>('all');
  const [picked, setPicked] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const catalog = products.length ? products : INITIAL_PRODUCTS;
      const { items: loaded } = await loadMediaLibrary(catalog);
      setItems(loaded);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    setPicked(selectedUrls);
    load();
  }, [open, selectedUrls.join('|')]);

  if (!open) return null;

  const visible = items.filter(row => {
    if (imagesOnly && row.kind !== 'image') return false;
    if (filter !== 'all' && row.kind !== filter) return false;
    return true;
  });

  const toggle = (url: string) => {
    if (multi) {
      setPicked(prev => (prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]));
    } else {
      setPicked([url]);
    }
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => mediaKindFromFile(f));
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadMediaFiles(files);
      setItems(prev => {
        const existing = new Set(prev.map(p => p.url));
        const unique = uploaded.filter(u => !existing.has(u.url));
        return [...unique, ...prev];
      });
      const newUrls = uploaded
        .filter(u => !imagesOnly || u.kind === 'image')
        .map(u => u.url);
      if (newUrls.length) {
        setPicked(prev => (multi ? [...prev, ...newUrls.filter(u => !prev.includes(u))] : [newUrls[0]]));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-[#F5F1EB] w-full sm:max-w-3xl max-h-[90vh] flex flex-col border border-[#EEE8DF] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEE8DF] bg-white">
          <h3 className="font-serif text-sm uppercase tracking-[0.15em]">Media Library</h3>
          <button type="button" onClick={onClose} className="p-1 text-[#A99684] hover:text-[#11100E]">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div
            className={`border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragOver ? 'border-[#11100E] bg-white' : 'border-[#A99684] bg-white/60'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            {uploading ? (
              <Loader2 size={24} className="mx-auto animate-spin text-[#A99684]" />
            ) : (
              <>
                <Upload size={22} className="mx-auto text-[#A99684] mb-2" />
                <p className="text-xs text-[#11100E]">Drop images or videos here</p>
                <label className="mt-3 inline-block cursor-pointer text-[10px] uppercase tracking-wider text-[#A99684] hover:text-[#11100E] underline">
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

          <div className="flex gap-2">
            {(['all', 'image', 'video'] as const).map(f => (
              <button
                key={f}
                type="button"
                disabled={imagesOnly && f === 'video'}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider border ${
                  filter === f ? 'bg-[#11100E] text-[#F5F1EB] border-[#11100E]' : 'bg-white border-[#EEE8DF] text-[#A99684]'
                } disabled:opacity-40`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#A99684]" />
            </div>
          ) : visible.length === 0 ? (
            <p className="text-center text-xs text-[#A99684] py-8">No media yet — upload above.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {visible.map(row => {
                const selected = picked.includes(row.url);
                return (
                  <button
                    key={row._docId}
                    type="button"
                    onClick={() => toggle(row.url)}
                    className={`relative aspect-[3/4] border overflow-hidden group text-left ${
                      selected ? 'border-[#11100E] ring-2 ring-[#11100E]' : 'border-[#EEE8DF] hover:border-[#A99684]'
                    }`}
                  >
                    {row.kind === 'video' ? (
                      <div className="w-full h-full bg-[#11100E] flex items-center justify-center">
                        <Film size={28} className="text-[#F5F1EB]/80" />
                      </div>
                    ) : (
                      <img src={row.url} alt={row.name} className="w-full h-full object-cover" />
                    )}
                    {selected && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-[#11100E] text-white flex items-center justify-center rounded-full">
                        <Check size={12} />
                      </span>
                    )}
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white truncate px-1 py-0.5 flex items-center gap-0.5">
                      {row.kind === 'video' ? <Film size={8} /> : <ImageIcon size={8} />}
                      {row.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEE8DF] bg-white">
          <span className="text-[10px] text-[#A99684] uppercase tracking-wider">{picked.length} selected</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="text-xs text-[#A99684] uppercase tracking-wider">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { onConfirm(picked); onClose(); }}
              className="bg-[#11100E] text-[#F5F1EB] px-5 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#A99684]"
            >
              Add to product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
