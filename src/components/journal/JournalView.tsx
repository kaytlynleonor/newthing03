import React from 'react';
import { useStore } from '../../context/StoreContext';
import { JOURNAL_ARTICLES } from '../../data/journal';
import { ArrowUpRight, Clock } from 'lucide-react';

export const JournalView: React.FC = () => {
  const { openArticle, setActiveView, setActiveCategoryFilter } = useStore();

  const featuredArticle = JOURNAL_ARTICLES[0];
  const secondaryArticles = JOURNAL_ARTICLES.slice(1);

  return (
    <div className="bg-[#F5F1EB] min-h-screen pb-24">
      
      {/* Full-width Page Header with 3D Background */}
      <div className="relative w-full h-[60vh] min-h-[400px] flex flex-col items-center justify-center text-center overflow-hidden mb-0">
        <img 
          src="/assets/images/journal_3d_hero.jpg" 
          alt="The Journal Atelier Library"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11100E]/60 via-[#11100E]/20 to-transparent" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-4 px-6 pt-32">
          <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#F5F1EB] font-semibold">
            EDITORIAL STORIES & ATELIER NOTES
          </span>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.2em] uppercase font-light text-[#F5F1EB]">
            THE JOURNAL
          </h1>
          <p className="text-xs md:text-sm font-sans text-[#F5F1EB]/80 tracking-wider font-medium max-w-xl mx-auto">
            An editorial publication documenting fashion, craftsmanship, campaign archives, and modern luxury philosophy.
          </p>
        </div>
      </div>

      <nav aria-label="Breadcrumb" className="mb-4 min-h-[44px] bg-[#F5F1EB] px-6 text-sm font-sans text-[#2C2925] lg:px-12">
        <ol className="mx-auto flex min-h-[44px] max-w-7xl items-center gap-2 whitespace-nowrap">
          <li>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('ALL');
                setActiveView('home');
              }}
              className="lowercase hover:underline"
            >
              home
            </button>
          </li>
          <li aria-hidden="true" className="text-[#A99684]">/</li>
          <li aria-current="page" className="lowercase">journal</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16">

        {/* Featured Main Story */}
        {featuredArticle && (
          <div
            onClick={() => openArticle(featuredArticle.id)}
            className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-[#EEE8DF] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500"
          >
            <div className="lg:col-span-7 aspect-[16/10] bg-[#EEE8DF] overflow-hidden">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-sans uppercase tracking-[0.3em] text-[#A99684]">
                  <span>FEATURED • {featuredArticle.category}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime}</span>
                </div>

                <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] uppercase text-[#11100E] font-light leading-tight group-hover:text-[#A99684] transition-colors">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs md:text-sm font-sans text-[#2C2925] tracking-wider leading-relaxed font-light">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-6">
                <span className="editorial-link text-xs font-sans uppercase tracking-[0.25em] text-[#11100E] font-medium inline-flex items-center gap-2">
                  <span>READ FEATURED STORY</span>
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {secondaryArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => openArticle(art.id)}
              className="group cursor-pointer bg-white border border-[#EEE8DF] p-6 space-y-4 hover:shadow-lg transition-all"
            >
              <div className="aspect-[16/10] bg-[#EEE8DF] overflow-hidden">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="flex items-center gap-3 text-[10px] font-sans uppercase tracking-[0.3em] text-[#A99684]">
                <span>{art.category}</span>
                <span>•</span>
                <span>{art.readTime}</span>
              </div>

              <h3 className="font-serif text-xl md:text-2xl tracking-[0.1em] uppercase text-[#11100E] font-light group-hover:text-[#A99684] transition-colors">
                {art.title}
              </h3>

              <p className="text-xs font-sans text-[#2C2925] tracking-wider leading-relaxed font-light line-clamp-2">
                {art.excerpt}
              </p>

              <div className="pt-2">
                <span className="editorial-link text-xs font-sans uppercase tracking-[0.2em] text-[#11100E] font-medium">
                  READ STORY →
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
