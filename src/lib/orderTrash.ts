import { DocumentData } from 'firebase/firestore';

/**
 * Returns true if the given order document has been moved to the CMS trash.
 * An order is considered trashed when it has a non-null `trashedAt` timestamp.
 */
export function isOrderTrashed(order: DocumentData): boolean {
  return Boolean(order.trashedAt);
}

/**
 * Returns true if the trashed order has expired (older than `ttlDays`, default 30).
 */
export function isTrashedOrderExpired(order: DocumentData, ttlDays = 30): boolean {
  if (!order.trashedAt) return false;
  const trashedDate = new Date(order.trashedAt as string);
  const expiresAt   = new Date(trashedDate.getTime() + ttlDays * 24 * 60 * 60 * 1000);
  return new Date() >= expiresAt;
}
