import React, { useEffect } from 'react';
import { Clock, ArrowLeft, Eye, Archive } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA, isComingBackSoonBadge, getProductBadgeDisplay, getProductReturnDateDisplay } from '../lib/format';
import { Product } from '../types';
import { scrollToTop } from '../lib/scroll';

export const TimeCapsuleView: React.FC = () => {
  const {
    timeCapsuleProducts,
    setSelectedProductSlug,
    setActiveTab,
    settings,
    language,
    isPreviewMode,
    getLocalizedProduct,
  } = useStore();

  useEffect(() => {
    scrollToTop(true);
  }, []);

  const handleProductClick = (product: Product) => {
    scrollToTop(true);
    setSelectedProductSlug(product.slug);
    setActiveTab('product_detail');
    try {
      const url = isPreviewMode
        ? `/preview?product=${encodeURIComponent(product.slug)}`
        : `/peca/${encodeURIComponent(product.slug)}`;
      window.history.pushState({ productSlug: product.slug, tab: 'product_detail' }, '', url);
    } catch {}
  };

  return (
    <div id="time-capsule-top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Back button */}
      <button
        onClick={() => {
          scrollToTop(true);
          setActiveTab('store');
        }}
        className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.25em] text-[#888888] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === 'en' ? 'BACK TO CURRENT DROP' : 'VOLTAR AO DROP ATUAL'}</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#2b2b2b] rounded-sm text-[10px] font-sans tracking-[0.35em] text-[#888888] uppercase">
          <Archive className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'ARCHIVAL MUSEUM' : 'MUSEU ARQUIVAL'}</span>
        </div>
        <h1 className="font-display uppercase text-3xl sm:text-5xl text-white tracking-[0.16em]">
          {language === 'en' ? 'TIME CAPSULE' : 'CÁPSULA DO TEMPO'}
        </h1>
        <p className="text-xs sm:text-sm text-[#888888] font-sans leading-relaxed">
          {language === 'en'
            ? 'The pieces in the Time Capsule represent permanently archived sold-out editions. We maintain photographic and technical records of these silhouettes as a tribute to our architectural evolution in Luanda.'
            : 'As peças da Cápsula do Tempo representam edições esgotadas e arquivadas permanentemente. Mantemos o registo fotográfico e técnico destas silhuetas como tributo à nossa evolução arquitetural em Luanda.'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {timeCapsuleProducts.map((rawProduct) => {
          const product = getLocalizedProduct(rawProduct);
          return (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="group cursor-pointer bg-[#0d0d0d] border border-[#1f1f1f] hover:border-[#333333] rounded overflow-hidden p-4 transition-all"
          >
            <div className="relative aspect-[4/5] w-full bg-[#141414] rounded overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 flex items-center justify-center">
              {product.images && product.images[0] && product.images[0].trim() !== '' ? (
                <img
                  src={product.images[0].trim()}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <Archive className="w-8 h-8 text-[#333333]" />
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                {(() => {
                  const isSoldOut =
                    product.badge?.toUpperCase() === 'ESGOTADO' ||
                    (product.sizes && product.sizes.length > 0 && product.sizes.every((s) => !s.in_stock));
                  const effectiveBadge = isSoldOut ? 'ESGOTADO' : product.badge;

                  const badgeText = getProductBadgeDisplay(effectiveBadge, language);
                  const returnDate = getProductReturnDateDisplay(product);

                  if (!badgeText) return null;

                  return (
                    <span
                      className={`text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded uppercase shadow-md ${
                        effectiveBadge?.toUpperCase() === 'ESGOTADO'
                          ? 'bg-red-950/80 text-red-300 border border-red-800'
                          : effectiveBadge?.toUpperCase() === 'AGUARDANDO VAGA'
                          ? 'bg-black/80 text-amber-300 border border-amber-500/40 font-mono text-[8px] tracking-[0.18em]'
                          : 'bg-white text-black'
                      }`}
                    >
                      {returnDate ? `${badgeText} • ${returnDate}` : badgeText}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] text-[#666666] font-sans tracking-widest uppercase block">
                  {product.category}
                </span>
                <h3 className="font-display uppercase text-sm sm:text-base text-white tracking-wider mt-0.5">
                  {product.name}
                </h3>
              </div>
              <span className="font-sans text-xs text-[#888888]">
                {formatAOA(product.price_aoa)}
              </span>
            </div>

            <p className="text-[11px] text-[#777777] font-sans mt-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
        );
        })}
      </div>
    </div>
  );
};
