import React from 'react';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA } from '../lib/format';
import { scrollToTop } from '../lib/scroll';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    products,
    toggleWishlist,
    addToCart,
    setSelectedProductSlug,
    setActiveTab,
  } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleProductClick = (slug: string) => {
    scrollToTop(true);
    setSelectedProductSlug(slug);
    setActiveTab('product_detail');
    setIsWishlistOpen(false);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const defaultSize = product.sizes.find((s: any) => s.in_stock)?.size || product.sizes[0]?.size || 'M';
    const defaultColor = product.colors[0]?.name || 'Preto';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0a0a] border-l border-[#1f1f1f] text-white flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#181818] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-white fill-white" />
              <h2 className="font-display uppercase tracking-[0.2em] text-sm font-semibold">
                FAVORITOS ({wishlistProducts.length})
              </h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full transition-colors"
              aria-label="Fechar lista de desejos"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-12 h-12 rounded-full border border-[#262626] flex items-center justify-center text-neutral-600">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-display text-sm tracking-wider uppercase text-neutral-300">
                    A sua lista de favoritos está vazia
                  </p>
                  <p className="text-xs text-neutral-500 font-sans max-w-xs">
                    Guarde as suas peças de arquivo preferidas clicando no ícone de coração.
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="mt-4 px-6 py-2.5 border border-white text-xs font-sans tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="group cursor-pointer flex gap-4 p-3 bg-[#111111] border border-[#1e1e1e] hover:border-[#333333] rounded transition-all"
                  >
                    <div className="w-20 h-24 bg-[#181818] rounded overflow-hidden shrink-0 relative flex items-center justify-center">
                      {product.images && product.images[0] && product.images[0].trim() !== '' ? (
                        <img
                          src={product.images[0].trim()}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-[#444444]" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display uppercase text-xs font-medium text-white tracking-wider line-clamp-1">
                            {product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className="text-neutral-500 hover:text-red-400 p-1"
                            title="Remover dos favoritos"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans mt-0.5">
                          {product.category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-mono text-white font-medium">
                          {formatAOA(product.price_aoa)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-[10px] font-sans font-bold tracking-[0.18em] uppercase rounded transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlistProducts.length > 0 && (
            <div className="p-6 border-t border-[#181818] bg-[#0c0c0c]">
              <button
                onClick={() => {
                  scrollToTop(true);
                  setIsWishlistOpen(false);
                  setActiveTab('store');
                }}
                className="w-full py-3.5 border border-white text-xs font-sans tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 font-bold"
              >
                <span>Continuar a Comprar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
