import React, { useEffect } from 'react';
import { Clock, ArrowLeft, Eye, Archive } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA } from '../lib/format';
import { Product } from '../types';
import { scrollToTop } from '../lib/scroll';

export const TimeCapsuleView: React.FC = () => {
  const { timeCapsuleProducts, setSelectedProductSlug, setActiveTab, settings } = useStore();

  useEffect(() => {
    scrollToTop(true);
  }, []);

  const handleProductClick = (product: Product) => {
    scrollToTop(true);
    setSelectedProductSlug(product.slug);
    setActiveTab('product_detail');
  };

  return (
    <div id="time-capsule-top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Back button */}
      <button
        onClick={() => {
          scrollToTop(true);
          setActiveTab('store');
        }}
        className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.25em] text-[#888888] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>VOLTAR AO DROP ATUAL</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#2b2b2b] rounded-sm text-[10px] font-sans tracking-[0.35em] text-[#888888] uppercase">
          <Archive className="w-3.5 h-3.5" />
          <span>MUSEU ARQUIVAL</span>
        </div>
        <h1 className="font-display uppercase text-3xl sm:text-5xl text-white tracking-[0.16em]">
          CÁPSULA DO TEMPO
        </h1>
        <p className="text-xs sm:text-sm text-[#888888] font-sans leading-relaxed">
          As peças da Cápsula do Tempo representam edições esgotadas e arquivadas permanentemente. Mantemos o registo fotográfico e técnico destas silhuetas como tributo à nossa evolução arquitetural em Luanda.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {timeCapsuleProducts.map((product) => (
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
                {product.enable_pre_order && settings.enable_pre_order_button !== false ? (
                  <>
                    <span className="text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded bg-amber-400 text-black uppercase shadow-lg">
                      PRE-ORDER
                    </span>
                    <span className="text-[8px] font-mono font-bold tracking-[0.18em] px-2 py-0.5 rounded bg-black/80 text-amber-300 border border-amber-500/40 uppercase">
                      COMING BACK SOON
                    </span>
                  </>
                ) : product.enable_request_restock !== false && settings.enable_request_restock_button !== false ? (
                  <span className="text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded bg-[#161616] text-amber-300 border border-amber-500/30 uppercase flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    REQUEST RESTOCK
                  </span>
                ) : (
                  <span className="text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded bg-red-950/80 text-red-300 border border-red-800 uppercase">
                    ARQUIVADO • ESGOTADO
                  </span>
                )}
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
        ))}
      </div>
    </div>
  );
};
