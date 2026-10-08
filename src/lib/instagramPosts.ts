export interface InstagramPost {
  id: string;
  src: string;
  href: string;
  alt?: string;
}

/**
 * Fetch live Instagram posts via a backend proxy / token endpoint.
 * Returns an empty array if unavailable so the gallery falls back to
 * the static INITIAL_POSTS defined in SocialGallery.tsx.
 */
export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  try {
    const res = await fetch('/api/instagram-posts');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
