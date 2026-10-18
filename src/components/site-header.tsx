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
    settings,
    blocks,
    language,
    setLanguage,
    t,
    menuItems,
    customContents,
    navigateTo,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);

  // Marquee block content & activation state
  const marqueeBlock = blocks.find((b) => b.block_type === 'marquee');
  const isMarqueeActive =
    Boolean(settings.marquee_enabled !== false) &&
    Boolean(marqueeBlock ? marqueeBlock.is_active !== false : true);

  const blockItemsPt = Array.isArray(marqueeBlock?.content?.items)
    ? (marqueeBlock.content.items as string[]).filter(
        (msg) => typeof msg === 'string' && msg.trim().length > 0
      )
    : [];

  const blockItemsEn = Array.isArray(marqueeBlock?.content?.items_en)
    ? (marqueeBlock.content.items_en as string[]).filter(
        (msg) => typeof msg === 'string' && msg.trim().length > 0
      )
    : [];

  const settingsItemsPt = Array.isArray(settings.marquee_messages)
    ? (settings.marquee_messages as string[]).filter(
        (msg) => typeof msg === 'string' && msg.trim().length > 0
      )
    : [];

  const settingsItemsEn = Array.isArray(settings.marquee_messages_en)
    ? (settings.marquee_messages_en as string[]).filter(
        (msg) => typeof msg === 'string' && msg.trim().length > 0
      )
    : [];

  const defaultMessagesPt = [
    'EDIÇÃO LIMITADA • DROP 01 WELCOME TO LUANDA',
    'PRODUZIDO EM ANGOLA',
    'ENTREGAS DIRETAS EM LUANDA',
    'WEARING UNUSUAL — HIGH-END MINIMALIST STREETWEAR',
    'PAGAMENTO DIRETO VIA MULTICAIXA EXPRESS',
  ];

  const defaultMessagesEn = [
    'LIMITED EDITION • DROP 01 WELCOME TO LUANDA',
    'CRAFTED IN ANGOLA',
    'DIRECT DELIVERY IN LUANDA',
    'WEARING UNUSUAL — HIGH-END MINIMALIST STREETWEAR',
    'DIRECT PAYMENT VIA MULTICAIXA EXPRESS',
  ];

  const chosenBlockItems = language === 'en' && blockItemsEn.length > 0 ? blockItemsEn : blockItemsPt;
  const chosenSettingsItems = language === 'en' && settingsItemsEn.length > 0 ? settingsItemsEn : settingsItemsPt;
  const chosenDefaultMessages = language === 'en' ? defaultMessagesEn : defaultMessagesPt;

  // Block items take precedence because they are edited in the Visual Block Builder
  const rawMarqueeList: string[] =
    chosenBlockItems.length > 0
      ? chosenBlockItems
      : chosenSettingsItems.length > 0
      ? chosenSettingsItems
      : chosenDefaultMessages;

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
    setIsMobileMenuOpen(false);
    navigateTo({ tab, anchorId });
  };

  const handleMenuItemClick = (item: any) => {
    setIsMobileMenuOpen(false);
    switch (item.target_type) {
      case 'store':
        handleNavClick('store', item.target_id || 'drop-atual');
        break;
      case 'capsule':
        handleNavClick('capsule');
        break;
      case 'custom': {
        const found = customContents.find((c) => c.id === item.target_id || c.slug === item.target_id);
        const slug = found ? found.slug : item.target_id;
        if (slug) {
          navigateTo({ tab: 'custom_content', slug });
        } else {
          navigateTo({ tab: 'store' });
        }
        break;
      }
      case 'anchor':
        handleNavClick('store', item.target_id);
        break;
      case 'wishlist':
        setIsWishlistOpen(true);
        break;
      case 'track':
        handleNavClick('track');
        break;
      case 'external':
        if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
        break;
      default:
        handleNavClick('store');
    }
  };

  const getMenuItemLabel = (item: any) => {
    if (language === 'en') {
      if (item.label_en) return item.label_en;
      const upper = (item.label || '').toUpperCase().trim();
      if (upper === 'DROP ATUAL') return 'CURRENT DROP';
      if (upper === 'CÁPSULA DO TEMPO' || upper === 'CAPSULA DO TEMPO') return 'TIME CAPSULE';
      if (upper === 'LOOKBOOK') return 'LOOKBOOK';
      if (upper === 'MANIFESTO') return 'MANIFESTO';
      if (upper === 'FAVORITOS') return 'WISHLIST';
      if (upper === 'RASTREAR' || upper === 'RASTREAR ENCOMENDA') return 'TRACK ORDER';
      if (item.target_type === 'store') return 'CURRENT DROP';
      if (item.target_type === 'capsule') return 'TIME CAPSULE';
      if (item.target_type === 'wishlist') return 'WISHLIST';
      if (item.target_type === 'track') return 'TRACK ORDER';
    }
    return item.label;
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
            aria-label={t('nav_search', 'Pesquisar catálogo')}
            title={t('nav_search', 'Pesquisar catálogo')}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Icon with discrete corner badge */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 text-[#cccccc] hover:text-white transition-colors"
            aria-label={t('nav_wishlist', 'Favoritos')}
            title={t('nav_wishlist', 'Favoritos')}
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-white text-black text-[9px] font-mono font-bold flex items-center justify-center leading-none shadow-sm pointer-events-none">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon with discrete corner badge */}
          <button
            id="header-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#cccccc] hover:text-white transition-colors"
            aria-label={t('nav_cart', 'Saco de compras')}
            title={t('nav_cart', 'Saco de compras')}
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
            {menuItems && menuItems.length > 0 ? (
              menuItems
                .filter((item: any) => item.is_active !== false)
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMenuItemClick(item)}
                    className="block w-full text-left py-2 hover:text-white border-b border-[#181818] flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <span className="group-hover:text-white transition-colors">
                      {getMenuItemLabel(item)}
                    </span>
                    {item.target_type === 'wishlist' && (
                      <span className="text-white font-mono text-[11px]">({wishlistCount})</span>
                    )}
                  </button>
                ))
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('store', 'drop-atual')}
                  className="block w-full text-left py-2 hover:text-white border-b border-[#181818] cursor-pointer"
                >
                  {language === 'en' ? 'CURRENT DROP' : 'DROP ATUAL'}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('capsule')}
                  className="block w-full text-left py-2 hover:text-white border-b border-[#181818] cursor-pointer"
                >
                  {language === 'en' ? 'TIME CAPSULE' : 'CÁPSULA DO TEMPO'}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('store', 'lookbook-section')}
                  className="block w-full text-left py-2 hover:text-white border-b border-[#181818] cursor-pointer"
                >
                  LOOKBOOK
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('store', 'manifesto-section')}
                  className="block w-full text-left py-2 hover:text-white border-b border-[#181818] cursor-pointer"
                >
                  MANIFESTO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsWishlistOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:text-white border-b border-[#181818] flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>{language === 'en' ? 'WISHLIST' : 'FAVORITOS'}</span>
                  </div>
                  <span className="text-white font-mono text-[11px]">({wishlistCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('track')}
                  className="block w-full text-left py-2 hover:text-white border-b border-[#181818] flex items-center gap-2 cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  {language === 'en' ? 'TRACK ORDER' : 'RASTREAR ENCOMENDA'}
                </button>
              </>
            )}
          </div>

          {/* Persistent PT / EN Selector strictly in the menu drawer */}
          <div className="pt-4 flex items-center justify-between text-xs text-[#888888] border-t border-[#181818]">
            <span className="font-mono uppercase tracking-widest text-[11px]">
              {language === 'en' ? 'LANGUAGE' : 'IDIOMA'}:
            </span>
            <div
              id="menu-drawer-lang-selector"
              className="flex items-center rounded border border-[#2a2a2a] bg-[#111111] p-0.5 text-[10px] font-mono font-bold select-none"
              role="group"
              aria-label="Seletor de idioma / Language selector"
            >
              <button
                type="button"
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  language === 'pt'
                    ? 'bg-white text-black font-extrabold shadow-sm'
                    : 'text-[#888888] hover:text-white'
                }`}
                aria-label="Português (PT)"
                title="Mudar para Português"
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-black font-extrabold shadow-sm'
                    : 'text-[#888888] hover:text-white'
                }`}
                aria-label="English (EN)"
                title="Switch to English"
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
