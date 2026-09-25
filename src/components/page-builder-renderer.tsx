import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Clock, Eye, ShieldCheck, ChevronRight, ChevronLeft, ShoppingBag, Archive, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA } from '../lib/format';
import { Product } from '../types';
import { scrollToTop } from '../lib/scroll';
import heroMobileImg from '../assets/images/hero_hoodie_model_1789188901010.jpg';
import heroDesktopImg from '../assets/images/hero_desktop_model_1789188912929.jpg';

export const PageBuilderRenderer: React.FC = () => {
  const {
    blocks,
    activeDropProducts,
    timeCapsuleProducts,
    setSelectedProductSlug,
    setActiveTab,
    isInWishlist,
    toggleWishlist,
    settings,
    t,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Sorted active blocks
  const activeBlocks = [...blocks]
    .filter((b) => b.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  const handleProductClick = (product: Product) => {
    scrollToTop(true);
    setSelectedProductSlug(product.slug);
    setActiveTab('product_detail');
  };

  const categories = ['all', 'T-Shirts & Tops', 'Hoodies', 'Sweatshirts', 'Denim', 'Outerwear'];

  const displayedDropProducts = activeDropProducts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  // Hero multi-image auto-advance
  const heroBlock = activeBlocks.find((b) => b.block_type === 'hero_banner');
  const heroImages: string[] = (
    heroBlock?.content?.bg_images && heroBlock.content.bg_images.length > 0
      ? heroBlock.content.bg_images
      : [heroBlock?.content?.bg_image || heroMobileImg]
  ).filter(Boolean);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div id="store-top" className="space-y-20 sm:space-y-28 pb-24 bg-black">
      {activeBlocks.map((block) => {
        switch (block.block_type) {
          // 1. HERO BANNER BLOCK - MATCHING REFERENCE AESTHETIC WITH COMPLETE AUTONOMY
          case 'hero_banner': {
            const content = block.content;
            const rawBgImages = Array.isArray(content.bg_images)
              ? content.bg_images
              : content.bg_image ? [content.bg_image] : [];
            const validImagesList: string[] = rawBgImages
              .filter((u: any) => typeof u === 'string' && u.trim() !== '')
              .map((u: string) => u.trim());
            const imagesList: string[] = validImagesList.length > 0 ? validImagesList : [heroMobileImg];

            const activeImg = imagesList[currentHeroSlide % imagesList.length] || heroMobileImg;
            const alignment = content.text_alignment || 'left';
            const alignClasses =
              alignment === 'center'
                ? 'items-center text-center mx-auto'
                : alignment === 'right'
                ? 'items-end text-right ml-auto'
                : 'items-start text-left';

            return (
              <section
                key={block.id}
                id="hero-banner"
                className="relative min-h-[92vh] sm:min-h-screen flex items-end justify-start px-5 sm:px-8 lg:px-16 pb-12 sm:pb-20 overflow-hidden bg-black border-b border-[#141414] group/hero"
              >
                {/* Background Image / Slider: Editorial Dark Brutalist Streetwear Model */}
                <div
                  key={activeImg}
                  className="absolute inset-0 bg-cover bg-[center_top_10%] sm:bg-center bg-no-repeat transition-all duration-1000 ease-out"
                  style={{
                    backgroundImage: `url(${activeImg})`,
                  }}
                />

                {/* Seamless dark vignette fading to pure pitch black at the bottom */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20"
                  style={{ opacity: content.overlay_opacity !== undefined ? content.overlay_opacity : 0.55 }}
                />

                {/* Bottom transition blur/gradient into pure black page */}
                <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-black to-transparent pointer-events-none" />

                {/* Multi-image navigation controls if more than 1 image */}
                {imagesList.length > 1 && (
                  <>
                    <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20 pointer-events-none">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentHeroSlide((prev) => (prev - 1 + imagesList.length) % imagesList.length)
                        }
                        className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black text-white pointer-events-auto backdrop-blur-sm border border-white/10 transition-colors"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentHeroSlide((prev) => (prev + 1) % imagesList.length)
                        }
                        className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black text-white pointer-events-auto backdrop-blur-sm border border-white/10 transition-colors"
                        aria-label="Próxima foto"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-20 flex items-center gap-1.5">
                      {imagesList.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentHeroSlide(idx)}
                          className={`h-1.5 transition-all duration-300 rounded-full ${
                            (currentHeroSlide % imagesList.length) === idx
                              ? 'w-7 bg-white'
                              : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Ir para foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Hero Foreground Content - Exactly matching IMG_2169 layout with full autonomy */}
                <div className={`relative z-10 max-w-2xl space-y-4 sm:space-y-5 flex flex-col ${alignClasses}`}>
                  {/* Tagline: DROP 01 — COLD ASHES */}
                  {content.drop_tag && (
                    <p className="text-[11px] sm:text-xs font-sans tracking-[0.3em] sm:tracking-[0.35em] text-[#a0a0a0] uppercase font-medium">
                      {content.drop_tag}
                    </p>
                  )}

                  {/* Brand Title: Wearing Unusual */}
                  <h1 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-[0.03em] sm:tracking-[0.05em] leading-[1.02]">
                    {content.drop_title || 'WEARING UNUSUAL'}
                  </h1>

                  {/* Slogan: A NOVA VAGA */}
                  {content.drop_slogan && (
                    <p className="font-sans text-xs sm:text-sm font-medium text-[#cccccc] tracking-[0.25em] sm:tracking-[0.3em] uppercase">
                      {content.drop_slogan}
                    </p>
                  )}

                  {/* Optional Description / Subtext */}
                  {content.description && (
                    <p className="font-sans text-xs sm:text-sm text-[#999999] tracking-wider max-w-lg leading-relaxed">
                      {content.description}
                    </p>
                  )}

                  {/* CTA Buttons Row */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      id="hero-cta-btn"
                      href={content.cta_link || '#drop-atual'}
                      className="inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs sm:text-sm tracking-[0.25em] uppercase transition-all group shadow-2xl"
                    >
                      <span>{content.cta_text || 'COMPRAR AGORA'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </a>

                    {content.secondary_cta_text && (
                      <a
                        href={content.secondary_cta_link || '#lookbook-section'}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 bg-black/60 hover:bg-black text-white hover:text-white border border-[#444444] hover:border-white font-sans font-medium text-xs sm:text-sm tracking-[0.2em] uppercase transition-all backdrop-blur-sm"
                      >
                        <span>{content.secondary_cta_text}</span>
                      </a>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          // 2. DROP ATUAL (CATALOG GRID) - MATCHING REFERENCE AESTHETIC (IMG_2169)
          case 'drop_grid': {
            const content = block.content;
            return (
              <section key={block.id} id="drop-atual" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header: DROP ATUAL & Edição limitada. Produzido em Angola. */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#181818] pb-6 mb-8 sm:mb-10 gap-3">
                  <div>
                    <h2 className="font-display font-bold uppercase text-3xl sm:text-5xl text-white tracking-[0.06em]">
                      {content.heading || 'DROP ATUAL'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#888888] font-sans tracking-wider mt-1.5">
                      {content.subheading || 'Edição limitada. Produzido em Angola.'}
                    </p>
                  </div>
                </div>

                {/* Category Filter Pills */}
                {content.show_categories_filter && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-6 mb-8 text-xs font-sans no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-sm whitespace-nowrap transition-colors tracking-[0.2em] uppercase ${
                          selectedCategory === cat
                            ? 'bg-white text-black font-semibold'
                            : 'bg-[#121212] text-[#888888] hover:text-white border border-[#222222]'
                        }`}
                      >
                        {cat === 'all' ? 'TODAS AS PEÇAS' : cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                  {displayedDropProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/5] w-full bg-[#121212] border border-[#1f1f1f] group-hover:border-[#333333] rounded overflow-hidden transition-all duration-300 flex items-center justify-center">
                        {product.images && product.images[0] && product.images[0].trim() !== '' ? (
                          <img
                            src={product.images[0].trim()}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                        ) : (
                          <ShoppingBag className="w-12 h-12 text-[#333333]" />
                        )}
                        {/* Dynamic Badge & Pre-Order Status Badge */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          {product.enable_pre_order && settings.enable_pre_order_button !== false ? (
                            <>
                              <span className="text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded uppercase bg-amber-400 text-black shadow-lg">
                                {t('badge_pre_order', 'PRE-ORDER')}
                              </span>
                              <span className="text-[8px] font-mono font-bold tracking-[0.18em] px-2 py-0.5 rounded uppercase bg-black/80 text-amber-300 border border-amber-500/40 backdrop-blur-sm">
                                {t('badge_coming_back_soon', 'COMING BACK SOON')}
                              </span>
                            </>
                          ) : product.badge ? (
                            <span
                              className={`text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded uppercase ${
                                product.badge === 'ESGOTADO'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-white text-black'
                              }`}
                            >
                              {product.badge}
                            </span>
                          ) : null}
                        </div>

                        {/* Botão de Favoritos com Ícone de Coração em Destaque */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          aria-label={isInWishlist(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          title={isInWishlist(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 backdrop-blur-md border border-white/30 hover:border-white/60 flex items-center justify-center transition-all duration-200 shadow-xl active:scale-95 group/fav"
                        >
                          <Heart
                            strokeWidth={2.4}
                            className={`w-4.5 h-4.5 transition-all duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                              isInWishlist(product.id)
                                ? 'fill-red-500 text-red-500 scale-110'
                                : 'text-white fill-white/10 group-hover/fav:text-red-400 group-hover/fav:fill-red-500/20 group-hover/fav:scale-110'
                            }`}
                          />
                        </button>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-4 py-2 bg-white text-black text-[11px] font-sans tracking-[0.2em] uppercase font-bold rounded shadow-lg flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>VER DETALHES</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-[#777777] font-sans tracking-widest uppercase block">
                            {product.category}
                          </span>
                          <h3 className="font-display uppercase text-sm sm:text-base text-white tracking-wider mt-0.5 group-hover:text-white">
                            {product.name}
                          </h3>
                        </div>

                        <span className="font-sans text-xs sm:text-sm font-semibold text-white shrink-0 mt-0.5">
                          {formatAOA(product.price_aoa)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // 3. LOOKBOOK GALLERY BLOCK
          case 'lookbook': {
            const content = block.content;
            const images = content.images || [];
            const validImages = (images || []).filter(
              (img: any) => Boolean(img && img.url && typeof img.url === 'string' && img.url.trim() !== '')
            );
            return (
              <section
                key={block.id}
                id="lookbook-section"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1c1c1c] pt-20"
              >
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                  <span className="text-[10px] text-[#777777] font-sans tracking-[0.3em] uppercase">
                    {block.subtitle || 'EDITORIAL VISUAL'}
                  </span>
                  <h2 className="font-display uppercase text-2xl sm:text-4xl text-white tracking-[0.16em]">
                    {content.heading || 'LOOKBOOK 01'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#888888] font-sans leading-relaxed">
                    {content.description || 'Documentação visual das peças nas ruas noturnas e no concreto de Luanda.'}
                  </p>
                </div>

                {validImages.length > 0 ? (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${
                      content.columns || 3
                    } gap-6`}
                  >
                    {validImages.map((img: any, idx: number) => (
                      <div
                        key={idx}
                        className="group relative aspect-[3/4] bg-[#111111] border border-[#222222] rounded overflow-hidden"
                      >
                        <img
                          src={img.url.trim()}
                          alt={img.caption || 'Lookbook'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                          <span className="font-sans text-xs text-[#dddddd] tracking-wider uppercase">
                            {img.caption}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-[#222222] rounded-lg py-16 px-4 text-center max-w-xl mx-auto">
                    <span className="text-xs uppercase tracking-[0.25em] text-[#555555] block">
                      EDITORIAL EM PREPARAÇÃO
                    </span>
                    <p className="text-[11px] text-[#444444] mt-2">
                      Fotografias e novos visuais da coleção estarão disponíveis brevemente.
                    </p>
                  </div>
                )}
              </section>
            );
          }

          // 4. MANIFESTO SECTION
          case 'manifesto': {
            const content = block.content;
            return (
              <section
                key={block.id}
                id="manifesto-section"
                className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-center space-y-6 my-12"
              >
                <span className="text-[10px] text-[#777777] font-sans tracking-[0.35em] uppercase">
                  {block.subtitle || 'FILOSOFIA DA MARCA'}
                </span>
                <h2 className="font-display uppercase text-2xl sm:text-4xl text-white tracking-[0.2em]">
                  {content.heading || 'O MANIFESTO'}
                </h2>
                <div className="w-12 h-0.5 bg-white mx-auto my-4" />
                <p className="font-display text-sm sm:text-lg text-[#d4d4d4] max-w-3xl mx-auto leading-loose tracking-[0.08em] uppercase">
                  {content.text}
                </p>
                {content.subtext && (
                  <p className="font-sans text-xs sm:text-sm text-[#777777] tracking-widest uppercase mt-4">
                    {content.subtext}
                  </p>
                )}
              </section>
            );
          }

          // 5. CÁPSULA DO TEMPO (ARCHIVED TIME CAPSULE)
          case 'time_capsule': {
            const content = block.content || {};
            const sectionTitle = content.heading || block.title || 'CÁPSULA DO TEMPO';
            const sectionSubtitle = block.subtitle || 'História e Memórias';
            const sectionDesc = content.subheading || (block.subtitle && block.subtitle !== sectionSubtitle ? block.subtitle : 'Registo permanente das peças esgotadas que marcaram o início da nossa história.');
            const customItems = Array.isArray(content.items) ? content.items : [];

            return (
              <section
                key={block.id}
                id="capsula-do-tempo"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1c1c1c] pt-20"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1c1c1c] pb-6 mb-10 gap-4">
                  <div>
                    <span className="text-[10px] text-[#777777] font-sans tracking-[0.3em] uppercase block mb-1">
                      {sectionSubtitle}
                    </span>
                    <h2 className="font-display uppercase text-2xl sm:text-4xl text-white tracking-[0.16em] flex items-center gap-3">
                      <span>{sectionTitle}</span>
                      <Clock className="w-5 h-5 text-[#888888]" />
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#888888] font-sans max-w-md">
                    {sectionDesc}
                  </p>
                </div>

                {/* Custom Memory Items if present in content.items */}
                {customItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {customItems.map((item: any, idx: number) => {
                      const itemTitle = typeof item === 'string' ? item : item.title || item.name || `Memória #${idx + 1}`;
                      const itemDesc = typeof item === 'object' ? item.description || item.subtitle || '' : '';
                      const itemImg = typeof item === 'object' ? item.image || item.imageUrl || '' : '';

                      return (
                        <div key={idx} className="p-4 bg-[#0d0d0d] border border-[#1c1c1c] rounded">
                          {itemImg && (
                            <div className="aspect-[4/5] w-full bg-[#141414] rounded overflow-hidden mb-3">
                              <img src={itemImg} alt={itemTitle} className="w-full h-full object-cover grayscale" />
                            </div>
                          )}
                          <h4 className="font-display uppercase text-sm text-white tracking-wider">{itemTitle}</h4>
                          {itemDesc && <p className="text-xs text-[#888888] font-sans mt-1">{itemDesc}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Archived Products Grid */}
                {timeCapsuleProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {timeCapsuleProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="group cursor-pointer p-4 bg-[#0d0d0d] border border-[#1c1c1c] rounded hover:border-[#333333] transition-all"
                      >
                        <div className="relative aspect-[4/5] w-full bg-[#141414] rounded overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 flex items-center justify-center">
                          {product.images && product.images[0] && product.images[0].trim() !== '' ? (
                            <img
                              src={product.images[0].trim()}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Archive className="w-10 h-10 text-[#333333]" />
                          )}
                          {product.enable_pre_order && settings.enable_pre_order_button !== false ? (
                            <span className="absolute top-3 left-3 text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded bg-amber-400 text-black uppercase shadow-lg">
                              PRE-ORDER
                            </span>
                          ) : product.enable_request_restock !== false && settings.enable_request_restock_button !== false ? (
                            <span className="absolute top-3 left-3 text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded bg-[#161616] text-amber-300 border border-amber-500/30 uppercase flex items-center gap-1.5 shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              REQUEST RESTOCK
                            </span>
                          ) : (
                            <span className="absolute top-3 left-3 text-[9px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded bg-red-950/80 text-red-300 border border-red-800 uppercase">
                              ARQUIVADO • ESGOTADO
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#666666] font-sans uppercase">
                              {product.category}
                            </span>
                            <h3 className="font-display uppercase text-sm text-[#cccccc] tracking-wider mt-0.5">
                              {product.name}
                            </h3>
                          </div>

                          <span className="font-sans text-xs text-[#888888]">
                            {formatAOA(product.price_aoa)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : customItems.length === 0 ? (
                  <div className="py-12 px-6 border border-dashed border-[#1f1f1f] rounded text-center">
                    <Archive className="w-8 h-8 text-[#444444] mx-auto mb-3" />
                    <p className="text-xs uppercase tracking-widest text-[#888888] font-sans font-bold">
                      {sectionTitle} • {sectionSubtitle}
                    </p>
                    <p className="text-xs text-[#555555] font-sans mt-2 max-w-md mx-auto">
                      As peças esgotadas de drops anteriores e registos históricos ficam preservados aqui permanentemente.
                    </p>
                  </div>
                ) : null}
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
