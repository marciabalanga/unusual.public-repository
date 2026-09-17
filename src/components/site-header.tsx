import React, { useState } from 'react';
import { Search, ShoppingBag, Menu, X, PackageCheck, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WULogo } from './wu-logo';
import { scrollToTop } from '../lib/scroll';

export const SiteHeader: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    wishlistCount,
    setIsWishlistOpen,
    setIsSearchOpen,
    activeTab,
    setActiveTab,
    settings,
    blocks,
    language,
    setLanguage,
    t,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);

  // Marquee block content & activation state
  const marqueeBlock = blocks.find((b) => b.block_type === 'marquee');
  const isMarqueeActive =
    Boolean(settings.marquee_enabled !== false) &&
    Boolean(marqueeBlock ? marqueeBlock.is_active !== false : true);

  const blockItems = Array.isArray(marqueeBlock?.content?.items)
    ? (marqueeBlock.content.items as string[]).filter(
        (msg) => typeof msg === 'string' && msg.trim().length > 0
      )
    : [];

  const settingsItems = Array.isArray(settings.marquee_messages)
    ? (settings.marquee_messages as string[]).filter(
        (msg) => typeof msg === 'string' && msg.trim().length > 0
      )
    : [];

  // Block items take precedence because they are edited in the Visual Block Builder
  const rawMarqueeList: string[] =
    blockItems.length > 0
      ? blockItems
      : settingsItems.length > 0
      ? settingsItems
      : [
          'EDIÇÃO LIMITADA • DROP 01 WELCOME TO LUANDA',
          'PRODUZIDO EM ANGOLA',
          'ENTREGAS DIRETAS EM LUANDA',
          'WEARING UNUSUAL — HIGH-END MINIMALIST STREETWEAR',
          'PAGAMENTO DIRETO VIA MULTICAIXA EXPRESS',
        ];

  // Guarantee at least 1 base item to strictly avoid any infinite while loops
  const baseItems = rawMarqueeList.length > 0 ? rawMarqueeList : ['WEARING UNUSUAL • HIGH-END STREETWEAR'];
  let repeatedItems: string[] = [...baseItems];
  while (repeatedItems.length < 8 && repeatedItems.length < 48) {
    repeatedItems = [...repeatedItems, ...baseItems];
  }

  const speedSeconds = Math.max(8, Math.min(120, Number(marqueeBlock?.content?.speed_seconds) || 24));
  const bgColor = marqueeBlock?.content?.bg_color || '#000000';
  const textColor = marqueeBlock?.content?.text_color || '#a3a3a3';

  const handleNavClick = (tab: 'store' | 'capsule' | 'track', anchorId?: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      scrollToTop(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080808]/95 backdrop-blur-md border-b border-[#1c1c1c]">
      {/* 1. TOP ANNOUNCEMENT MARQUEE */}
      {isMarqueeActive && (
        <div
          className="w-full overflow-hidden text-[10px] tracking-[0.25em] uppercase font-sans select-none border-b border-[#181818]"
          style={{ backgroundColor: bgColor }}
          onMouseEnter={() => setIsMarqueePaused(true)}
          onMouseLeave={() => setIsMarqueePaused(false)}
          onTouchCancel={() => setIsMarqueePaused(false)}
          onClick={() => setIsMarqueePaused((prev) => !prev)}
          role="region"
          aria-label="Letreiro de anúncios"
          title="Clique para pausar ou continuar o letreiro"
        >
          <div
            className={`animate-marquee flex items-center whitespace-nowrap py-2 ${isMarqueePaused ? 'is-paused' : ''}`}
            style={{ animationDuration: `${speedSeconds}s` }}
          >
            {/* Track 1 */}
            <div className="flex shrink-0 items-center whitespace-nowrap">
              {repeatedItems.map((msg, index) => (
                <span key={`t1-${index}`} className="mx-6 flex items-center gap-3 whitespace-nowrap">
                  <span style={{ color: textColor }} className="hover:text-white transition-colors">
                    {msg}
                  </span>
                  <span className="text-[#444444] select-none">•</span>
                </span>
              ))}
            </div>
            {/* Track 2 (exact duplicate for mathematically seamless infinite loop) */}
            <div className="flex shrink-0 items-center whitespace-nowrap" aria-hidden="true">
              {repeatedItems.map((msg, index) => (
                <span key={`t2-${index}`} className="mx-6 flex items-center gap-3 whitespace-nowrap">
                  <span style={{ color: textColor }} className="hover:text-white transition-colors">
                    {msg}
                  </span>
                  <span className="text-[#444444] select-none">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Hamburger + Logo "wu" immediately next to it */}
        <div className="flex items-center gap-3 sm:gap-4 z-10">
          <button
            id="mobile-menu-trigger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-[#e5e5e5] hover:text-white transition-colors focus:outline-none"
            aria-label="Menu Principal"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <div
            id="brand-logo-button"
            onClick={() => handleNavClick('store')}
            className="cursor-pointer flex items-center group select-none transition-transform duration-200 hover:scale-[1.02]"
            title="Wearing Unusual"
          >
            <WULogo
              size="md"
              imgClassName="h-6 sm:h-8 md:h-9 max-h-9 w-auto object-contain"
              className="group-hover:opacity-90 transition-opacity"
            />
          </div>
        </div>

        {/* Right: Actions (Search 🔍, Wishlist ♡ with badge, Cart 🛍️ with badge) */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-neutral-400 z-10">
          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-[#cccccc] hover:text-white transition-colors"
            aria-label="Pesquisar catálogo"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Icon with discrete corner badge */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 text-[#cccccc] hover:text-white transition-colors"
            aria-label="Favoritos"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-white text-black text-[9px] font-mono font-bold flex items-center justify-center leading-none shadow-sm pointer-events-none">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon with discrete corner badge (no 'BAG' or '(0)' text) */}
          <button
            id="header-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#cccccc] hover:text-white transition-colors"
            aria-label="Saco de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-white text-black text-[9px] font-mono font-bold flex items-center justify-center leading-none shadow-sm pointer-events-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-[#1a1a1a] bg-[#0c0c0c] px-6 py-8 space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="max-w-7xl mx-auto space-y-4 text-xs tracking-[0.25em] uppercase text-[#a0a0a0]">
            <button
              onClick={() => handleNavClick('store', 'drop-atual')}
              className="block w-full text-left py-2 hover:text-white border-b border-[#181818]"
            >
              {t('nav_drop', 'DROP ATUAL')}
            </button>
            <button
              onClick={() => handleNavClick('capsule')}
              className="block w-full text-left py-2 hover:text-white border-b border-[#181818]"
            >
              {t('nav_capsule', 'CÁPSULA DO TEMPO')}
            </button>
            <button
              onClick={() => handleNavClick('store', 'lookbook-section')}
              className="block w-full text-left py-2 hover:text-white border-b border-[#181818]"
            >
              {t('nav_lookbook', 'LOOKBOOK')}
            </button>
            <button
              onClick={() => handleNavClick('store', 'manifesto-section')}
              className="block w-full text-left py-2 hover:text-white border-b border-[#181818]"
            >
              {t('nav_manifesto', 'MANIFESTO')}
            </button>
            <button
              onClick={() => {
                setIsWishlistOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-white border-b border-[#181818] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>FAVORITOS</span>
              </div>
              <span className="text-white font-mono text-[11px]">({wishlistCount})</span>
            </button>
            <button
              onClick={() => handleNavClick('track')}
              className="block w-full text-left py-2 hover:text-white border-b border-[#181818] flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              {t('nav_track', 'RASTREAR ENCOMENDA')}
            </button>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-[#777777]">
            <span>IDIOMA:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 rounded text-xs ${
                  language === 'pt' ? 'bg-white text-black font-bold' : 'bg-[#181818] text-white'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-xs ${
                  language === 'en' ? 'bg-white text-black font-bold' : 'bg-[#181818] text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
