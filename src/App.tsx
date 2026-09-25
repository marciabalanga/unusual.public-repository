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
import { Wrench } from 'lucide-react';
import { scrollToTop } from './lib/scroll';
import { ScheduleDeliveryModal } from './components/schedule-delivery-modal';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedProductSlug,
    setSelectedProductSlug,
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
  } = useStore();

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [deliveryScheduleOrder, setDeliveryScheduleOrder] = useState<Order | null>(null);
  const [isSplashActive, setIsSplashActive] = useState<boolean>(() => {
    // Skip splash screen if already navigating directly to admin
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        return false;
      }
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

  // Check URL pathname or hash for /admin and pre-order schedule link
  useEffect(() => {
    const handleUrlCheck = async () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const scheduleCode = searchParams.get('schedule_delivery') || searchParams.get('schedule');

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

      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        setActiveTab('admin');
        setIsSplashActive(false);
      } else if (activeTab === 'admin') {
        setActiveTab('store');
      }
    };
    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, [activeTab, setActiveTab, getOrderByTrackingCode]);

  // Garantia Universal: sempre que a aba ou o produto selecionado mudar,
  // reposiciona imediatamente a janela no topo absoluto (Y = 0),
  // eliminando qualquer aterragem indesejada no rodapé da página.
  useEffect(() => {
    scrollToTop(true);
  }, [activeTab, selectedProductSlug]);

  // Sincronização Dinâmica do Ícone (Favicon / Apple Touch Icon) e Redes Sociais com o Logótipo da Marca
  useEffect(() => {
    const rawLogo = settings.site_logo_url || settings.logo_url;
    if (!rawLogo || rawLogo.trim() === '') return;

    const absoluteLogoUrl = rawLogo.startsWith('http')
      ? rawLogo
      : `${window.location.origin}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`;

    // 1. Atualizar ou injetar favicons (<link rel="icon"> e <link rel="apple-touch-icon">)
    const updateOrCreateLink = (rel: string, href: string, type?: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
      if (type) link.type = type;
    };

    updateOrCreateLink('icon', absoluteLogoUrl, 'image/png');
    updateOrCreateLink('apple-touch-icon', absoluteLogoUrl);
    updateOrCreateLink('shortcut icon', absoluteLogoUrl);

    // 2. Atualizar ou injetar meta tags de partilha social (og:image e twitter:image)
    const updateOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateOrCreateMeta('property', 'og:image', absoluteLogoUrl);
    updateOrCreateMeta('name', 'twitter:image', absoluteLogoUrl);
  }, [settings.site_logo_url, settings.logo_url]);

  // Find selected product for detail view
  const selectedProduct = selectedProductSlug
    ? products.find((p) => p.slug === selectedProductSlug) || products[0]
    : products[0];

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

  return (
    <div className="min-h-screen bg-black text-[#f2f2f2] flex flex-col selection:bg-white selection:text-black">
      {/* 01 — TELA DE ENTRADA (SPLASH SCREEN) */}
      {isSplashActive && (
        <SplashScreen onComplete={() => setIsSplashActive(false)} />
      )}

      {/* 02 — HOME (REVELADA APÓS A ENTRADA COM TRANSIÇÃO SUAVE DE OPACIDADE) */}
      <div
        id="main-content"
        className={`min-h-screen flex flex-col justify-between transition-opacity duration-1000 ${
          isSplashActive ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        {/* Maintenance Mode Banner if active */}
        {settings.maintenance_mode && (
          <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-center text-xs font-sans text-amber-200 flex items-center justify-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>
              A plataforma está em processo de atualização de inventário. Novas encomendas podem sofrer ligeiros atrasos.
            </span>
          </div>
        )}

        {/* HEADER MINIMALISTA (100% limpo, sem botões de admin) */}
        <SiteHeader />

        {/* Main View Switcher */}
        <main className="flex-1">
          {activeTab === 'store' && <PageBuilderRenderer />}

          {activeTab === 'product_detail' && selectedProduct && (
            <ProductDetailView
              product={selectedProduct}
              onBack={() => {
                scrollToTop(true);
                if (selectedProduct.lifecycle === 'time_capsule') {
                  setActiveTab('capsule');
                } else {
                  setActiveTab('store');
                }
              }}
              onOpenPreOrderCheckout={(item) => {
                addToCart(item.product, item.size, item.color, item.quantity);
                setIsCheckoutOpen(true);
              }}
            />
          )}

          {activeTab === 'capsule' && <TimeCapsuleView />}

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
