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
import { db } from './firebase';
import { INITIAL_PRODUCTS } from '../data/products';
import type { MediaAsset, Product } from '../types/ecommerce';

export type MediaRow = MediaAsset & { _docId: string };

export function normalizeUrl(url: string): string {
  try {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    const decoded = decodeURIComponent(trimmed);
    return decoded.replace(/^\/+/, '/').split('?')[0];
  } catch {
    return (url || '').trim().replace(/^\/+/, '/').split('?')[0];
  }
}

function filenameFromUrl(url: string): string {
  try {
    const norm = normalizeUrl(url);
    if (norm.startsWith('/')) {
      return norm.split('/').pop() || 'catalog-image.jpg';
    }
    const u = new URL(norm);
    return u.pathname.split('/').pop() || 'catalog-image.jpg';
  } catch {
    return 'catalog-image.jpg';
  }
}

function mimeFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}

/** Unique image URLs from the product catalog, with linked product IDs. */
export function collectCatalogMediaEntries(products: Product[] = INITIAL_PRODUCTS) {
  const byUrl = new Map<string, { url: string; name: string; linkedProductIds: string[] }>();

  for (const p of products) {
    for (const url of p.images || []) {
      const trimmed = url?.trim();
      if (!trimmed) continue;
      const key = normalizeUrl(trimmed);
      if (!key) continue;

      const existing = byUrl.get(key);
      if (existing) {
        if (!existing.linkedProductIds.includes(p.id)) {
          existing.linkedProductIds.push(p.id);
        }
      } else {
        byUrl.set(key, {
          url: trimmed,
          name: filenameFromUrl(trimmed),
          linkedProductIds: [p.id],
        });
      }
    }
    for (const v of p.variants || []) {
      const vUrl = v.image?.trim();
      if (!vUrl) continue;
      const key = normalizeUrl(vUrl);
      if (!key) continue;

      const existing = byUrl.get(key);
      if (existing) {
        if (!existing.linkedProductIds.includes(p.id)) {
          existing.linkedProductIds.push(p.id);
        }
      } else {
        byUrl.set(key, {
          url: vUrl,
          name: filenameFromUrl(vUrl),
          linkedProductIds: [p.id],
        });
      }
    }
  }

  return Array.from(byUrl.values());
}

type DocumentDataLike = Record<string, unknown>;

async function readMediaDocs(): Promise<{ rows: MediaRow[]; duplicateDocIds: string[] }> {
  let docs: { id: string; data: () => DocumentDataLike }[] = [];
  try {
    const snap = await getDocs(query(collection(db, 'media'), orderBy('createdAt', 'desc')));
    docs = snap.docs;
  } catch {
    const snap = await getDocs(collection(db, 'media'));
    docs = snap.docs;
  }

  const seenUrls = new Map<string, MediaRow>();
  const duplicateDocIds: string[] = [];

  for (const d of docs) {
    const data = d.data() as Omit<MediaAsset, 'id'>;
    const row: MediaRow = { _docId: d.id, id: d.id, ...data };
    const norm = normalizeUrl(row.url || '');
    if (!norm) continue;

    if (!seenUrls.has(norm)) {
      seenUrls.set(norm, row);
    } else {
      duplicateDocIds.push(d.id);
      const existing = seenUrls.get(norm)!;
      const combined = new Set([
        ...(existing.linkedProductIds || []),
        ...(row.linkedProductIds || []),
      ]);
      existing.linkedProductIds = Array.from(combined);
    }
  }

  return {
    rows: Array.from(seenUrls.values()),
    duplicateDocIds,
  };
}

export async function cleanupDuplicateMediaDocs(): Promise<number> {
  try {
    const { duplicateDocIds } = await readMediaDocs();
    if (duplicateDocIds.length > 0) {
      await Promise.all(duplicateDocIds.map(id => deleteDoc(doc(db, 'media', id)).catch(() => {})));
    }
    return duplicateDocIds.length;
  } catch {
    return 0;
  }
}

export async function seedCatalogMediaIfMissing(
  products: Product[] = INITIAL_PRODUCTS
): Promise<number> {
  const { rows, duplicateDocIds } = await readMediaDocs();

  // Purge duplicate Firestore documents in background
  if (duplicateDocIds.length > 0) {
    Promise.all(duplicateDocIds.map(id => deleteDoc(doc(db, 'media', id)).catch(() => {}))).catch(() => {});
  }

  const existingNormalizedUrls = new Set(rows.map(r => normalizeUrl(r.url)));
  const toAdd = collectCatalogMediaEntries(products).filter(
    e => !existingNormalizedUrls.has(normalizeUrl(e.url))
  );

  for (const entry of toAdd) {
    const norm = normalizeUrl(entry.url);
    if (existingNormalizedUrls.has(norm)) continue;
    existingNormalizedUrls.add(norm);

    await addDoc(collection(db, 'media'), {
      url: entry.url,
      name: entry.name,
      kind: 'image',
      mimeType: mimeFromUrl(entry.url),
      size: 0,
      linkedProductIds: entry.linkedProductIds,
      source: 'catalog',
      createdAt: serverTimestamp(),
    });
  }

  return toAdd.length;
}

/** Load media library, ensure catalog product images exist, and remove duplicate entries. */
export async function loadMediaLibrary(
  products: Product[] = INITIAL_PRODUCTS
): Promise<{ items: MediaRow[]; seededCount: number; removedDuplicatesCount: number }> {
  try {
    const seededCount = await seedCatalogMediaIfMissing(products);
    const { rows, duplicateDocIds } = await readMediaDocs();

    if (duplicateDocIds.length > 0) {
      Promise.all(duplicateDocIds.map(id => deleteDoc(doc(db, 'media', id)).catch(() => {}))).catch(() => {});
    }

    return { items: rows, seededCount, removedDuplicatesCount: duplicateDocIds.length };
  } catch {
    const fallbackEntries = collectCatalogMediaEntries(products);
    const seen = new Set<string>();
    const fallback: MediaRow[] = [];

    fallbackEntries.forEach((e, i) => {
      const norm = normalizeUrl(e.url);
      if (!seen.has(norm)) {
        seen.add(norm);
        fallback.push({
          _docId: `catalog-${i}`,
          id: `catalog-${i}`,
          url: e.url,
          name: e.name,
          kind: 'image' as const,
          mimeType: mimeFromUrl(e.url),
          size: 0,
          linkedProductIds: e.linkedProductIds,
        });
      }
    });

    return { items: fallback, seededCount: 0, removedDuplicatesCount: 0 };
  }
}
