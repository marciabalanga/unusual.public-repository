import React, { useState, useEffect, useCallback } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteHeader } from './components/site-header';
import { SearchModal } from './components/search-modal';
import { CartDrawer } from './components/cart-drawer';
import { WishlistDrawer } from './components/wishlist-drawer';
import { SplashScreen } from './components/splash-screen';
import { CheckoutModal } from './components/checkout-modal';
import { OrderSuccessModal } from './components/order-success-modal';
import { PageBuilderRenderer } from './components/page-builder-renderer';
import { ProductDetailView } from './components/product-detail-modal';
import { TimeCapsuleView } from './components/time-capsule-view';
import { TrackOrderView } from './components/track-order-view';
import { AdminPanel } from './components/admin/admin-panel';
import { AdminLogin } from './components/admin/admin-login';
import { SiteFooter } from './components/site-footer';
import { Order, Product } from './types';
import { Wrench, Lock } from 'lucide-react';
import { scrollToTop } from './lib/scroll';
import { ScheduleDeliveryModal } from './components/schedule-delivery-modal';
import { MaintenanceView } from './components/maintenance-view';
import { ChooseDeliveryDateView } from './components/choose-delivery-date-view';
import { CustomContentView } from './components/custom-content-view';
import { PreviewTopBar } from './components/preview-top-bar';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedProductSlug,
    setSelectedProductSlug,
    selectedCustomSlug,
    setSelectedCustomSlug,
    products,
    setTrackingInput,
    settings,
    isCartOpen,
    setIsCartOpen,
    isSearchOpen,
    setIsSearchOpen,
    orders,
    addToCart,
    getOrderByTrackingCode,
    saveSettings,
    deliveryDateOrderCode,
    setDeliveryDateOrderCode,
    customContents,
    isPreviewMode,
    setIsPreviewMode,
    navigateTo,
  } = useStore();

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [deliveryScheduleOrder, setDeliveryScheduleOrder] = useState<Order | null>(null);
  const [isSplashActive, setIsSplashActive] = useState<boolean>(() => {
    // Skip splash screen if already navigating directly to admin, preview, or delivery choice
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      if (
        path === '/admin' ||
        hash === '#admin' ||
        hash === '#/admin' ||
        path === '/preview' ||
        hash === '#preview' ||
        path.startsWith('/choose-delivery-date') ||
        hash.includes('choose-delivery-date')
      ) {
        return false;
      }
      try {
        if (localStorage.getItem('wu_is_preview_mode_v1') === 'true') {
          return false;
        }
      } catch {}
    }
    return true;
  });

  // Redirect to public homepage / and reset view
  const redirectToPublicStore = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
    }
    setActiveTab('store');
    scrollToTop(true);
  }, [setActiveTab]);

  // Check URL pathname or hash for /admin, /choose-delivery-date/:code, product pages, capsule, and tracking
  useEffect(() => {
    const handleUrlCheck = async () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const scheduleCode = searchParams.get('schedule_delivery') || searchParams.get('schedule');
      const trackCode = searchParams.get('track') || searchParams.get('tracking');

      if (trackCode) {
        setTrackingInput(trackCode.toUpperCase());
        setSelectedProductSlug(null);
        setSelectedCustomSlug(null);
        setActiveTab('track');
        setIsSplashActive(false);
        return;
      }

      if (path === '/track' || hash === '#track' || hash === '#/track') {
        setSelectedProductSlug(null);
        setSelectedCustomSlug(null);
        setActiveTab('track');
        setIsSplashActive(false);
        return;
      }

      // Check /choose-delivery-date/:code
      const chooseMatch =
        window.location.pathname.match(/\/choose-delivery-date\/([^\/?#]+)/i) ||
        window.location.hash.match(/#\/?choose-delivery-date\/([^\/?#]+)/i);

      if (chooseMatch) {
        const extractedCode = decodeURIComponent(chooseMatch[1]).trim().toUpperCase();
        setDeliveryDateOrderCode(extractedCode);
        setSelectedProductSlug(null);
        setSelectedCustomSlug(null);
        setActiveTab('choose_delivery_date');
        setIsSplashActive(false);
        return;
      }

      if (scheduleCode) {
        setIsSplashActive(false);
        try {
          const ord = await getOrderByTrackingCode(scheduleCode.toUpperCase());
          if (ord) {
            setDeliveryScheduleOrder(ord);
          }
        } catch (e) {
          console.warn('Erro ao carregar pré-encomenda para agendamento:', e);
        }
      }

      const previewProduct = searchParams.get('product') || searchParams.get('peca');
      const isNavigatingToPreview = path === '/preview' || hash === '#preview' || hash === '#/preview';

      if (isNavigatingToPreview) {
        setIsPreviewMode(true);
        if (previewProduct) {
          const matched = products.find(
            (p) => p.slug?.toLowerCase() === previewProduct.toLowerCase()
          );
          if (matched) {
            setSelectedCustomSlug(null);
            setSelectedProductSlug(matched.slug);
            setActiveTab('product_detail');
            setIsSplashActive(false);
            return;
          }
        }
        if (activeTab !== 'product_detail') {
          setSelectedProductSlug(null);
          setSelectedCustomSlug(null);
          setActiveTab('store');
        }
        setIsSplashActive(false);
        return;
      }

      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        if (isPreviewMode) {
          if (activeTab !== 'product_detail') {
            setSelectedProductSlug(null);
            setSelectedCustomSlug(null);
            setActiveTab('store');
          }
          setIsSplashActive(false);
          return;
        }
        setSelectedProductSlug(null);
        setSelectedCustomSlug(null);
        setActiveTab('admin');
        setIsSplashActive(false);
        return;
      }

      if (path === '/capsule' || hash === '#capsule' || hash === '#/capsule') {
        setSelectedProductSlug(null);
        setSelectedCustomSlug(null);
        setActiveTab('capsule');
        setIsSplashActive(false);
        return;
      }

      if (
        path === '/lookbook' ||
        hash === '#lookbook' ||
        hash === '#/lookbook' ||
        hash === '#lookbook-section' ||
        path === '/lookbook-section'
      ) {
        setSelectedProductSlug(null);
        setSelectedCustomSlug(null);
        setActiveTab('store');
        setIsSplashActive(false);
        setTimeout(() => {
          const el = document.getElementById('lookbook-section') || document.getElementById('block_lookbook');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
        return;
      }

      if (
        path === '/manifesto' ||
        hash === '#manifesto' ||
        hash === '#/manifesto' ||
        hash === '#manifesto-section' ||
        path === '/manifesto-section'
      ) {
        setSelectedProductSlug(null);
        setSelectedCustomSlug(null);
        setActiveTab('store');
        setIsSplashActive(false);
        setTimeout(() => {
          const el = document.getElementById('manifesto-section') || document.getElementById('block_manifesto');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
        return;
      }

      // Check product direct route (/peca/:slug or /produto/:slug)
      if (path.startsWith('/peca/') || path.startsWith('/produto/')) {
        const rawSlug = path.replace(/^\/(peca|produto)\//i, '').replace(/\/+$/, '');
        let cleanProductSlug = rawSlug;
        try {
          cleanProductSlug = decodeURIComponent(rawSlug).trim();
        } catch {}
        if (cleanProductSlug) {
          const matched = products.find(
            (p) =>
              p.slug?.toLowerCase() === cleanProductSlug.toLowerCase() ||
              p.id?.toLowerCase() === cleanProductSlug.toLowerCase() ||
              p.id === cleanProductSlug
          );
          setSelectedCustomSlug(null);
          setSelectedProductSlug(matched ? matched.slug : cleanProductSlug);
          setActiveTab('product_detail');
          setIsSplashActive(false);
          return;
        }
      }

      // Check clean slug for custom contents or root
      const cleanSlug = path.replace(/^\/+|\/+$/g, '');
      const cleanHash = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
      const targetSlug = cleanSlug || cleanHash;

      if (
        targetSlug &&
        targetSlug !== 'store' &&
        targetSlug !== 'drop-atual' &&
        targetSlug !== 'preview' &&
        targetSlug !== 'lookbook' &&
        targetSlug !== 'lookbook-section' &&
        targetSlug !== 'manifesto' &&
        targetSlug !== 'manifesto-section'
      ) {
        // 1. Check Custom Content
        const matchedCustom = customContents.find(
          (c) =>
            c.slug?.toLowerCase() === targetSlug.toLowerCase() ||
            c.id?.toLowerCase() === targetSlug.toLowerCase()
        );
        if (matchedCustom) {
          setSelectedProductSlug(null);
          setSelectedCustomSlug(matchedCustom.slug);
          setActiveTab('custom_content');
          setIsSplashActive(false);
          return;
        }

        // 2. Check Product fallback if slug directly in root
        const matchedProduct = products.find(
          (p) => p.slug?.toLowerCase() === targetSlug.toLowerCase()
        );
        if (matchedProduct) {
          setSelectedCustomSlug(null);
          setSelectedProductSlug(matchedProduct.slug);
          setActiveTab('product_detail');
          setIsSplashActive(false);
          return;
        }
      }

      // Default root / homepage
setSelectedProductSlug(null);
setSelectedCustomSlug(null);
setActiveTab('store');
  }
}
    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, [setActiveTab, setSelectedProductSlug, setSelectedCustomSlug, getOrderByTrackingCode, setDeliveryDateOrderCode, isAuthenticated, isPreviewMode, products, customContents]);

  // Garantia Universal: sempre que a aba ou o produto selecionado mudar,
  // reposiciona imediatamente a janela no topo absoluto (Y = 0),
  // eliminando qualquer aterragem indesejada no rodapé da página.
  useEffect(() => {
    scrollToTop(true);
  }, [activeTab, selectedProductSlug]);

  // Sincronização Dinâmica do Ícone (Favicon / Apple Touch Icon) e Redes Sociais com o Logótipo da Marca
  useEffect(() => {
    const logoVersion = '20261003_v3';
    const svgIconUrl = `/brand-icon.svg?v=${logoVersion}`;
    const touchIconUrl = `${window.location.origin}/apple-touch-icon.png?v=${logoVersion}`;
    const faviconPngUrl = `${window.location.origin}/brand-favicon.png?v=${logoVersion}`;
    const faviconIcoUrl = `${window.location.origin}/favicon.ico?v=${logoVersion}`;

    // 1. Atualizar ou injetar favicons (<link rel="icon"> e <link rel="apple-touch-icon">)
    const updateOrCreateLink = (selector: string, rel: string, href: string, type?: string) => {
      let link = document.querySelector(selector) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
      if (type) link.type = type;
    };

    updateOrCreateLink('link[rel="icon"][type="image/svg+xml"]', 'icon', svgIconUrl, 'image/svg+xml');
    updateOrCreateLink('link[rel="apple-touch-icon"]', 'apple-touch-icon', touchIconUrl);
    updateOrCreateLink('link[rel="apple-touch-icon-precomposed"]', 'apple-touch-icon-precomposed', touchIconUrl);
    updateOrCreateLink('link[rel="icon"][type="image/png"]', 'icon', faviconPngUrl, 'image/png');
    updateOrCreateLink('link[rel="shortcut icon"]', 'shortcut icon', faviconIcoUrl);

    // 2. Definir título oficial e meta tags de partilha social (WhatsApp preview / OpenGraph / Twitter)
    document.title = 'UNUSUAL';

    const absoluteSocialPreviewUrl = `${window.location.origin}/og-preview.png`;

    const updateOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateOrCreateMeta('name', 'description', 'Wearing Unusual – Inspired by the fear of being average.');
    updateOrCreateMeta('property', 'og:site_name', 'UNUSUAL');
    updateOrCreateMeta('property', 'og:title', 'Wearing Unusual – Inspired by the fear of being average.');
    updateOrCreateMeta('property', 'og:description', 'Wearing Unusual – Inspired by the fear of being average.');
    updateOrCreateMeta('property', 'og:image', absoluteSocialPreviewUrl);
    updateOrCreateMeta('property', 'og:image:secure_url', absoluteSocialPreviewUrl);
    updateOrCreateMeta('name', 'twitter:title', 'Wearing Unusual – Inspired by the fear of being average.');
    updateOrCreateMeta('name', 'twitter:description', 'Wearing Unusual – Inspired by the fear of being average.');
    updateOrCreateMeta('name', 'twitter:image', absoluteSocialPreviewUrl);
  }, [settings.site_logo_url, settings.logo_url]);

  // Find selected product for detail view
  const selectedProduct = selectedProductSlug
    ? products.find(
        (p) =>
          p.slug?.toLowerCase() === selectedProductSlug.toLowerCase() ||
          p.id?.toLowerCase() === selectedProductSlug.toLowerCase() ||
          p.id === selectedProductSlug
      ) || products[0]
    : products[0];

  useEffect(() => {
    if (activeTab === 'product_detail' && isSplashActive) {
      setIsSplashActive(false);
    }
  }, [activeTab, isSplashActive]);

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setConfirmedOrder(order);
  };

  const handleViewTracking = (trackingCode: string) => {
    setConfirmedOrder(null);
    setTrackingInput(trackingCode);
    setActiveTab('track');
    scrollToTop(true);
  };

  // Se o utilizador tentar aceder à rota privada /admin:
  if (activeTab === 'admin') {
    // 1. Estado de verificação de sessão
    if (isAuthLoading) {
      return (
        <div className="min-h-screen bg-[#050505] text-[#888888] flex flex-col items-center justify-center font-mono text-xs gap-3">
          <div className="w-5 h-5 border-2 border-[#333333] border-t-white rounded-full animate-spin" />
          <p className="tracking-widest uppercase">WEARING UNUSUAL • A verificar credenciais...</p>
        </div>
      );
    }

    // 2. Utilizador não autenticado -> Tela de Login Segura (Supabase Auth)
    if (!isAuthenticated) {
      return <AdminLogin onCancel={redirectToPublicStore} />;
    }

    // 3. Utilizador autenticado -> Renderiza o Painel Administrativo
    return <AdminPanel />;
  }

  // 4. MODO MANUTENÇÃO: Se ativado e utilizador não for admin autenticado
  if (
    settings.maintenance_mode &&
    !isAuthenticated &&
    activeTab !== 'track' &&
    activeTab !== 'choose_delivery_date'
  ) {
    return (
      <MaintenanceView
        onOpenTrack={() => {
          scrollToTop(true);
          setActiveTab('track');
        }}
      />
    );
  }

  // 5. ROTA DIRETA DE ESCOLHA DA DATA DE ENTREGA (/choose-delivery-date/:orderCode)
  if (activeTab === 'choose_delivery_date') {
    return (
      <ChooseDeliveryDateView
        orderCode={deliveryDateOrderCode || 'WU-244950'}
        onBackToStore={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', '/');
          }
          setActiveTab('store');
        }}
        onOpenTrack={(code) => {
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', `/?track=${encodeURIComponent(code)}`);
          }
          setTrackingInput(code);
          setActiveTab('track');
          scrollToTop(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#f2f2f2] flex flex-col selection:bg-white selection:text-black">
      {/* 01 — TELA DE ENTRADA (SPLASH SCREEN) */}
      {isSplashActive && (
        <SplashScreen onComplete={() => setIsSplashActive(false)} />
      )}

      {/* 02 — HOME (REVELADA APÓS A ENTRADA) */}
      <div
        id="main-content"
        className={`min-h-screen flex flex-col justify-between ${
          isSplashActive ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        {/* Barra de Controlo do Modo Preview (apenas visível em Preview autenticado) */}
        {isPreviewMode && (
          <PreviewTopBar
            onReturnToAdmin={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/admin');
              }
              setIsPreviewMode(false);
              setActiveTab('admin');
              scrollToTop(true);
            }}
          />
        )}
        {/* Maintenance Mode Banner if active (apenas visível para administradores autenticados) */}
        {settings.maintenance_mode && isAuthenticated && (
          <div className="bg-amber-950/90 border-b border-amber-600 px-4 py-2.5 text-center text-xs font-sans text-amber-200 flex flex-wrap items-center justify-between gap-2 z-50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono uppercase font-bold text-[11px] text-amber-300">
                MODO MANUTENÇÃO ATIVO — Os visitantes comuns vêem a tela oficial de manutenção.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                }}
                className="px-2.5 py-1 rounded bg-[#181818] hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase border border-[#333333] transition-colors cursor-pointer"
              >
                Ir para o Admin
              </button>
            </div>
          </div>
        )}

        {/* Checkout Locked Banner (quando o checkout foi temporariamente suspenso) */}
        {settings.checkout_locked && (
          <div className="bg-red-950/90 border-b border-red-800 px-4 py-2 text-center text-xs font-sans text-red-200 flex items-center justify-center gap-2 z-40">
            <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {settings.checkout_lock_message ||
                'AVISO: O CHECKOUT ENCONTRA-SE TEMPORARIAMENTE SUSPENSO PARA CONTAGEM DE STOCK.'}
            </span>
          </div>
        )}

        {/* HEADER MINIMALISTA (100% limpo, sem botões de admin) */}
        <SiteHeader />

        {/* Main View Switcher */}
        <main className="flex-1">
          {activeTab === 'store' && <PageBuilderRenderer />}

          {activeTab === 'product_detail' && (
            selectedProduct ? (
              <ProductDetailView
                product={selectedProduct}
                onBack={() => {
                  if (selectedProduct.lifecycle === 'time_capsule') {
                    navigateTo({ tab: 'capsule' });
                  } else {
                    navigateTo({ tab: 'store' });
                  }
                }}
                onOpenPreOrderCheckout={(item) => {
                  addToCart(item.product, item.size, item.color, item.quantity);
                  setIsCheckoutOpen(true);
                }}
              />
            ) : (
              <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-xs text-[#888888] gap-3">
                <div className="w-5 h-5 border-2 border-[#333333] border-t-white rounded-full animate-spin" />
                <p className="tracking-widest uppercase">A carregar peça...</p>
              </div>
            )
          )}

          {activeTab === 'capsule' && <TimeCapsuleView />}

          {activeTab === 'custom_content' && (
            <CustomContentView
              slug={selectedCustomSlug || (customContents[0]?.slug ?? '')}
              onBack={() => {
                setSelectedCustomSlug(null);
                setActiveTab('store');
                scrollToTop(true);
              }}
            />
          )}

          {activeTab === 'track' && <TrackOrderView />}
        </main>

        {/* Footer */}
        <SiteFooter />
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal with Payment Proof Upload */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal with Unique WU-XXXX Code */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewTracking={handleViewTracking}
      />

      {/* Direct Pre-Order Delivery Scheduling Modal (opened via WhatsApp direct link) */}
      {deliveryScheduleOrder && (
        <ScheduleDeliveryModal
          isOpen={Boolean(deliveryScheduleOrder)}
          onClose={() => setDeliveryScheduleOrder(null)}
          order={deliveryScheduleOrder}
          onScheduledSuccess={() => {
            // After scheduling, redirect to track view
            handleViewTracking(deliveryScheduleOrder.tracking_code);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainContent />
      </StoreProvider>
    </AuthProvider>
  );
}
