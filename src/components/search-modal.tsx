import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA } from '../lib/format';
import { Product } from '../types';
import { scrollToTop } from '../lib/scroll';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    products,
    setSelectedProductSlug,
    setActiveTab,
    t,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const categories = ['all', 'T-Shirts & Tops', 'Hoodies', 'Sweatshirts', 'Denim', 'Outerwear', 'time_capsule'];

  const results = products.filter((p) => {
    if (!p.is_visible) return false;
    const matchesQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.badge && p.badge.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'time_capsule'
        ? p.lifecycle === 'time_capsule'
        : p.category === selectedCategory && p.lifecycle === 'active_drop';

    return matchesQuery && matchesCategory;
  });

  const handleSelectProduct = (product: Product) => {
    scrollToTop(true);
    setSelectedProductSlug(product.slug);
    setActiveTab('product_detail');
    setIsSearchOpen(false);
  };

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'search-modal-backdrop') {
          setIsSearchOpen(false);
        }
      }}
    >
      <div
        id="search-modal-container"
        className="w-full max-w-3xl bg-[#0d0d0d] border border-[#222222] rounded-lg p-6 sm:p-8 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4 mb-6">
          <div className="flex items-center gap-3 w-full">
            <Search className="w-5 h-5 text-[#888888] shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar por peça, categoria ou tecido (ex: Hoodie, Denim, Boxy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-white placeholder-[#555555] text-base sm:text-lg focus:outline-none font-sans"
            />
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 text-[#777777] hover:text-white transition-colors"
            aria-label="Fechar pesquisa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors tracking-widest uppercase ${
                selectedCategory === cat
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#181818] text-[#999999] hover:text-white border border-[#262626]'
              }`}
            >
              {cat === 'all'
                ? 'TODOS'
                : cat === 'time_capsule'
                ? 'CÁPSULA DO TEMPO'
                : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-[#666666]">
              <Tag className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="font-sans text-sm">Nenhuma peça encontrada para "{searchQuery}".</p>
              <p className="text-xs text-[#555555] mt-1">Tente pesquisar por 'Hoodie', 'Tee', 'Denim' ou 'Jacket'.</p>
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="group flex items-center justify-between p-3 rounded bg-[#121212] hover:bg-[#181818] border border-[#1f1f1f] hover:border-[#333333] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-16 bg-[#1f1f1f] rounded overflow-hidden shrink-0 border border-[#262626] flex items-center justify-center">
                    {product.images && product.images[0] && product.images[0].trim() !== '' ? (
                      <img
                        src={product.images[0].trim()}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-[#444444]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display uppercase text-sm text-white tracking-wider group-hover:text-[#ffffff]">
                        {product.name}
                      </h4>
                      {product.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${
                            product.badge === 'ESGOTADO'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-white text-black'
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#777777] font-sans mt-0.5">
                      {product.category} • {product.lifecycle === 'time_capsule' ? 'Arquivo Cápsula' : 'Drop Ativo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-sans text-sm font-semibold text-[#dddddd]">
                    {formatAOA(product.price_aoa)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#555555] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
