import React from 'react';
import { useStore } from '../../context/StoreContext';
import { JOURNAL_ARTICLES } from '../../data/journal';
import { X, Clock, Calendar, Bookmark, Share2 } from 'lucide-react';

export const ArticleModal: React.FC = () => {
  const { selectedArticleId, closeArticle, showToast, setActiveView, setActiveCategoryFilter } = useStore();

  const article = selectedArticleId ? JOURNAL_ARTICLES.find((a) => a.id === selectedArticleId) : null;

  if (!article) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Article link copied to clipboard', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11100E]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F5F1EB] text-[#11100E] w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#EEE8DF] shadow-2xl relative animate-fade-in-scale my-auto p-6 md:p-12">
        
        {/* Close Button */}
        <button
          onClick={closeArticle}
          className="absolute top-6 right-6 p-2 text-[#11100E] hover:text-[#A99684]"
          aria-label="Close article"
        >
          <X size={22} />
        </button>

        {/* Category & Meta */}
        <div className="flex items-center gap-4 text-[11px] font-sans uppercase tracking-[0.3em] text-[#A99684] mb-3">
          <span>{article.category}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-5xl tracking-[0.1em] uppercase font-light leading-tight mb-6">
          {article.title}
        </h1>

        {/* Hero Article Image */}
        <div className="aspect-[16/9] w-full overflow-hidden bg-[#EEE8DF] mb-8">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <nav aria-label="Breadcrumb" className="mb-8 border-y border-[#EEE8DF] py-3 text-sm font-sans text-[#2C2925]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <button
                type="button"
                onClick={() => {
                  closeArticle();
                  setActiveCategoryFilter('ALL');
                  setActiveView('home');
                }}
                className="lowercase hover:underline"
              >
                home
              </button>
            </li>
            <li aria-hidden="true" className="text-[#A99684]">/</li>
            <li>
              <button type="button" onClick={closeArticle} className="lowercase hover:underline">
                journal
              </button>
            </li>
            <li aria-hidden="true" className="text-[#A99684]">/</li>
            <li aria-current="page" className="lowercase">
              {article.slug === 'about-kaytlyn-leonor' ? 'about us' : article.title}
            </li>
          </ol>
        </nav>

        {/* Featured Quote Block */}
        {article.quote && (
          <blockquote className="my-8 p-6 bg-[#EEE8DF] border-l-4 border-[#11100E] font-serif text-lg md:text-xl italic text-[#11100E] leading-relaxed">
            {article.quote}
          </blockquote>
        )}

        {/* Body Paragraphs */}
        <div className="space-y-6 text-sm font-sans text-[#2C2925] tracking-wider leading-relaxed font-light">
          {article.content.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#EEE8DF] flex items-center justify-between text-xs font-sans uppercase tracking-wider text-[#A99684]">
          <span>KAYTLYN LEONOR EDITORIAL JOURNAL</span>
          <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-[#11100E] transition-colors">
            <Share2 size={14} /> SHARE ARTICLE
          </button>
        </div>

      </div>
    </div>
  );
};
