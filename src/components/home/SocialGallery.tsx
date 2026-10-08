import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <rect width="18" height="18" x="3" y="3" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.67 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.5" y1="6.5" y2="6.5" />
  </svg>
);

interface Post {
  id: string;
  image: string;
  video?: string;
  caption?: string;
  href?: string;
}

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e4b9a6f6c?auto=format&fit=crop&q=80&w=900',
    caption: 'Evening in the atelier',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    caption: 'Soft light, sharp silhouette',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1512690149745-4361f4a0f6b0?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=600',
    caption: 'Behind the campaign',
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1520813667622-9f82d6b4b9a3?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1483985988354-763728e3685b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '11',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '12',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '13',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c690?auto=format&fit=crop&q=80&w=900',
  },
  {
    id: '14',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
  },
];

const IG_PROFILE = 'https://www.instagram.com/kaytlynleonor/';

const SocialTile: React.FC<{ post: Post; tall?: boolean }> = ({ post, tall = false }) => {
  const Wrapper = post.href ? 'a' : 'div';
  const wrapperProps = post.href
    ? { href: post.href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative block w-full overflow-hidden rounded-2xl bg-[#E8E0D8] ${
        tall ? 'h-full min-h-[320px] md:min-h-0' : 'aspect-[4/5] md:aspect-square'
      }`}
    >
      {post.video ? (
        <video
          src={post.video}
          poster={post.image || undefined}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x500?text=KL';
          }}
        />
      )}

      <div className="absolute inset-0 bg-[#11100E]/0 transition-colors duration-300 group-hover:bg-[#11100E]/35" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <InstagramIcon size={24} className="text-white drop-shadow-md" />
      </div>

      {post.caption && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#11100E]/75 to-transparent px-3 pb-3 pt-10 text-center text-[11px] font-medium leading-snug text-white md:text-xs">
          {post.caption}
        </p>
      )}
    </Wrapper>
  );
};

/** One block: tall left tile + 3×2 grid on the right (reference “Shop our IG” layout). */
const IgFeatureBlock: React.FC<{ posts: Post[] }> = ({ posts }) => {
  if (posts.length < 7) return null;
  const [hero, ...rest] = posts;
  const gridPosts = rest.slice(0, 6);
  const withLink = (p: Post) => ({ ...p, href: IG_PROFILE });

  return (
    <>
      <div className="space-y-3 md:hidden">
        <SocialTile post={withLink(hero)} tall />
        <div className="grid grid-cols-2 gap-3">
          {gridPosts.map((post) => (
            <SocialTile key={post.id} post={withLink(post)} />
          ))}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-4 md:gap-4 md:auto-rows-[minmax(0,1fr)]">
        <div className="col-span-1 row-span-2 min-h-[520px]">
          <SocialTile post={withLink(hero)} tall />
        </div>
        {gridPosts.map((post) => (
          <div key={post.id} className="col-span-1">
            <SocialTile post={withLink(post)} />
          </div>
        ))}
      </div>
    </>
  );
};

export const SocialGallery: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  useEffect(() => {
    const fetchFromFirebase = async () => {
      try {
        const q = query(collection(db, 'instagramMedia'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            image: data.kind === 'video' ? '' : data.src,
            video: data.kind === 'video' ? data.src : undefined,
            caption: data.alt,
            href: data.href
          };
        });
        if (items.length > 0) {
          setPosts(items as Post[]);
        }
      } catch (e) {
        console.error('Error fetching instagram media:', e);
      }
    };
    fetchFromFirebase();
  }, []);

  const blocks: Post[][] = [];
  for (let i = 0; i < posts.length; i += 7) {
    blocks.push(posts.slice(i, i + 7));
  }

  const handleLoadMore = () => {
    const extra = INITIAL_POSTS.map((p) => ({
      ...p,
      id: `${p.id}-${Math.random().toString(36).slice(2, 9)}`,
    }));
    setPosts((prev) => [...prev, ...extra.slice(0, 7)]);
  };

  return (
    <section className="bg-[#FAF6F2] px-4 py-16 sm:px-6 md:py-24 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center md:mb-12">
          <a
            href={IG_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-sans text-xl font-bold uppercase tracking-[0.35em] text-[#A67C7C] transition-colors hover:text-[#11100E] md:text-2xl"
          >
            Shop our IG
          </a>
          <p className="mt-2 text-[10px] font-sans uppercase tracking-[0.3em] text-[#A99684]">
            @kaytlynleonor
          </p>
        </header>

        <div className="space-y-4 md:space-y-6">
          {blocks.map((chunk, index) => (
            <IgFeatureBlock key={chunk[0]?.id ?? index} posts={chunk} />
          ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-12">
          <button
            type="button"
            onClick={handleLoadMore}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#A99684] text-[#A99684] transition-colors hover:bg-[#A99684] hover:text-white"
            aria-label="Load more Instagram posts"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};
