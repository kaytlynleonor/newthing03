import {
  collection,
  addDoc,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { MediaAsset, MediaKind } from '../types/ecommerce';

const ACCEPT = 'image/*,video/*';

export function mediaKindFromFile(file: File): MediaKind | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

export function acceptedMediaInput(): string {
  return ACCEPT;
}

async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function uploadMediaFile(file: File): Promise<MediaAsset & { _docId: string }> {
  const kind = mediaKindFromFile(file);
  if (!kind) {
    throw new Error(`Unsupported file type: ${file.type || file.name}`);
  }

  const safeName = file.name.replace(/[^\w.\-()+\s]/g, '_').slice(0, 120);
  let url: string;

  try {
    const path = `media/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type || undefined });
    url = await getDownloadURL(storageRef);
  } catch {
    url = await readAsDataUrl(file);
  }

  const payload = {
    url,
    name: safeName,
    kind,
    mimeType: file.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg'),
    size: file.size,
    linkedProductIds: [] as string[],
    createdAt: serverTimestamp(),
  };

  const docRef: DocumentReference = await addDoc(collection(db, 'media'), payload);

  return {
    _docId: docRef.id,
    id: docRef.id,
    ...payload,
    createdAt: payload.createdAt,
  };
}

export async function uploadMediaFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<(MediaAsset & { _docId: string })[]> {
  const results: (MediaAsset & { _docId: string })[] = [];
  let i = 0;
  for (const file of files) {
    const asset = await uploadMediaFile(file);
    results.push(asset);
    i += 1;
    onProgress?.(i, files.length);
  }
  return results;
}
