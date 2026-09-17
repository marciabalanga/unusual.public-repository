import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Order,
  OrderStatus,
  CartItem,
  SiteBlock,
  DictionaryEntry,
  SiteSettings,
  Language,
  OrderTimelineEvent
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_BLOCKS,
  INITIAL_DICTIONARY,
  INITIAL_SETTINGS
} from '../data/initialData';
import { supabase, testSupabaseConnection, SupabaseHealth } from '../lib/supabase';
import { generateTrackingCode } from '../lib/format';
import { getStoredItem, setStoredItem, getPersistentLogo, setPersistentLogo } from '../lib/idb-storage';

interface StoreContextType {
  // Products (Motor 2)
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  activeDropProducts: Product[];
  timeCapsuleProducts: Product[];
  saveProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleProductLifecycle: (id: string, lifecycle: 'active_drop' | 'time_capsule') => Promise<void>;
  toggleProductVisibility: (id: string) => Promise<void>;

  // Blocks (Motor 1)
  blocks: SiteBlock[];
  saveBlock: (block: SiteBlock) => Promise<boolean>;
  toggleBlock: (id: string, isActive: boolean) => Promise<void>;
  reorderBlocks: (newBlocks: SiteBlock[]) => Promise<void>;

  // Dictionary (Motor 3)
  dictionary: Record<string, DictionaryEntry>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  saveDictionaryEntry: (entry: DictionaryEntry) => Promise<boolean>;

  // Settings & Business Rules (Motor 4)
  settings: SiteSettings;
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;

  // Orders & Tracking (Motor 5)
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'tracking_code' | 'created_at' | 'status' | 'status_timeline'> & { tracking_code?: string }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, timelineDesc?: string) => Promise<boolean>;
  getOrderByTrackingCode: (code: string) => Promise<Order | null>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  deliveryFee: number;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  amountUntilFreeShipping: number;
  shippingProgressPercentage: number;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];

  // Active View & Admin
  activeTab: 'store' | 'capsule' | 'track' | 'admin' | 'product_detail';
  setActiveTab: (tab: 'store' | 'capsule' | 'track' | 'admin' | 'product_detail') => void;
  selectedProductSlug: string | null;
  setSelectedProductSlug: (slug: string | null) => void;
  trackingInput: string;
  setTrackingInput: (code: string) => void;

  // Supabase Status
  supabaseStatus: SupabaseHealth;
  refreshSupabase: () => Promise<void>;
  isSyncing: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'wu_products_v1',
  BLOCKS: 'wu_blocks_v1',
  DICTIONARY: 'wu_dictionary_v1',
  SETTINGS: 'wu_settings_v1',
  ORDERS: 'wu_orders_v1',
  CART: 'wu_cart_v1',
  LANG: 'wu_lang_v1',
  WISHLIST: 'wu_wishlist_v1',
  BRAND_LOGO: 'wu_brand_logo_url',
  BRAND_BIO: 'wu_brand_bio_v1',
  LOCATION_TEXT: 'wu_location_text_v1',
  INSTAGRAM_HANDLE: 'wu_instagram_handle_v1',
  DELETED_PRODUCTS: 'wu_deleted_products_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state with LocalStorage caching
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [blocks, setBlocks] = useState<SiteBlock[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BLOCKS);
      return saved ? JSON.parse(saved) : INITIAL_BLOCKS;
    } catch {
      return INITIAL_BLOCKS;
    }
  });

  const [dictionary, setDictionary] = useState<Record<string, DictionaryEntry>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.DICTIONARY);
      if (saved) return JSON.parse(saved);
    } catch {}
    const map: Record<string, DictionaryEntry> = {};
    INITIAL_DICTIONARY.forEach((d) => (map[d.key] = d));
    return map;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cachedLogo = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.BRAND_LOGO) : null;
      const cachedBio = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.BRAND_BIO) : null;
      const cachedLocation = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.LOCATION_TEXT) : null;
      const cachedInsta = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.INSTAGRAM_HANDLE) : null;
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const resolvedLogo =
          cachedLogo ||
          parsed.site_logo_url ||
          parsed.logo_url ||
          INITIAL_SETTINGS.site_logo_url ||
          '/logo.png';
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          ...(cachedBio ? { brand_bio: cachedBio } : {}),
          ...(cachedLocation ? { location_text: cachedLocation } : {}),
          ...(cachedInsta ? { instagram_handle: cachedInsta } : {}),
          site_logo_url: resolvedLogo,
          logo_url: resolvedLogo,
        };
      }
      if (cachedLogo || cachedBio || cachedLocation || cachedInsta) {
        return {
          ...INITIAL_SETTINGS,
          ...(cachedBio ? { brand_bio: cachedBio } : {}),
          ...(cachedLocation ? { location_text: cachedLocation } : {}),
          ...(cachedInsta ? { instagram_handle: cachedInsta } : {}),
          ...(cachedLogo ? { site_logo_url: cachedLogo, logo_url: cachedLogo } : {}),
        };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LANG);
      return saved === 'en' ? 'en' : 'pt';
    } catch {
      return 'pt';
    }
  });

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'store' | 'capsule' | 'track' | 'admin' | 'product_detail'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        return 'admin';
      }
    }
    return 'store';
  });
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseHealth>({
    connected: false,
    url: 'https://tmryqhilyisbfdpnsiwo.supabase.co',
    hasTables: false,
    missingTables: [],
    availableTables: [],
  });

  const markTableMissing = useCallback((tableName: string) => {
    setSupabaseStatus((prev) => {
      if (prev.missingTables.includes(tableName)) return prev;
      return {
        ...prev,
        hasTables: false,
        missingTables: [...prev.missingTables, tableName],
        availableTables: prev.availableTables.filter((t) => t !== tableName),
      };
    });
  }, []);

  const [isIdbHydrated, setIsIdbHydrated] = useState(false);

  // Hydrate from IndexedDB for zero-quota limits and instant load of user customizations
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [idbBlocks, idbProducts, idbSettings, idbDict, idbOrders] = await Promise.all([
          getStoredItem<SiteBlock[]>(LOCAL_STORAGE_KEYS.BLOCKS),
          getStoredItem<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS),
          getStoredItem<SiteSettings>(LOCAL_STORAGE_KEYS.SETTINGS),
          getStoredItem<Record<string, DictionaryEntry>>(LOCAL_STORAGE_KEYS.DICTIONARY),
          getStoredItem<Order[]>(LOCAL_STORAGE_KEYS.ORDERS),
        ]);
        if (!active) return;
        if (idbBlocks && idbBlocks.length > 0) setBlocks(idbBlocks);
        if (idbProducts && idbProducts.length > 0) {
          setProducts((prev) => {
            const idbMap = new Map(idbProducts.map((p) => [p.id, p]));
            const merged = [...idbProducts];
            prev.forEach((p) => {
              if (!idbMap.has(p.id)) merged.push(p);
            });
            return merged;
          });
        }
        if (idbSettings) setSettings((prev) => ({ ...prev, ...idbSettings }));
        if (idbDict && Object.keys(idbDict).length > 0) setDictionary(idbDict);
        if (idbOrders && idbOrders.length > 0) setOrders(idbOrders);
      } catch (err) {
        console.warn('[IDB] Erro na hidratação de cache:', err);
      } finally {
        if (active) setIsIdbHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist to localStorage and resilient IndexedDB only AFTER hydration completes
  useEffect(() => {
    if (!isIdbHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {}
    setStoredItem(LOCAL_STORAGE_KEYS.PRODUCTS, products).catch(() => {});
  }, [products, isIdbHydrated]);

  useEffect(() => {
    if (!isIdbHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
    } catch {}
    setStoredItem(LOCAL_STORAGE_KEYS.BLOCKS, blocks).catch(() => {});
  }, [blocks, isIdbHydrated]);

  useEffect(() => {
    if (!isIdbHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DICTIONARY, JSON.stringify(dictionary));
    } catch {}
    setStoredItem(LOCAL_STORAGE_KEYS.DICTIONARY, dictionary).catch(() => {});
  }, [dictionary, isIdbHydrated]);

  useEffect(() => {
    if (!isIdbHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      const currentLogo = settings.site_logo_url || settings.logo_url;
      if (currentLogo && currentLogo !== '/logo.png') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.BRAND_LOGO, currentLogo);
      }
      if (settings.brand_bio) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.BRAND_BIO, settings.brand_bio);
      }
      if (settings.location_text) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.LOCATION_TEXT, settings.location_text);
      }
      if (settings.instagram_handle) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.INSTAGRAM_HANDLE, settings.instagram_handle);
      }
    } catch {}
    setStoredItem(LOCAL_STORAGE_KEYS.SETTINGS, settings).catch(() => {});
  }, [settings, isIdbHydrated]);

  useEffect(() => {
    if (!isIdbHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
    setStoredItem(LOCAL_STORAGE_KEYS.ORDERS, orders).catch(() => {});
  }, [orders, isIdbHydrated]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LANG, lang);
    } catch {}
  };

  const toSupabaseProduct = useCallback((p: Product) => {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price_aoa: Number(p.price_aoa) || 0,
      description: p.description || '',
      details: p.details || '',
      size_guide: p.size_guide || p.fit_guide || '',
      images: Array.isArray(p.images) ? p.images : [],
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      colors: Array.isArray(p.colors) ? p.colors : [],
      badge: p.badge || null,
      lifecycle: p.lifecycle || 'active_drop',
      is_visible: p.is_visible !== false,
      is_featured: Boolean(p.is_featured),
      order_index: typeof p.order_index === 'number' ? p.order_index : 0,
      created_at: p.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  // High-performance parallel sync with Supabase on mount
  const syncWithSupabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [prodRes, blockRes, dictRes, setRes, ordRes] = await Promise.all([
        supabase.from('products').select('*').order('order_index', { ascending: true }),
        supabase.from('site_blocks').select('*').order('order_index', { ascending: true }),
        supabase.from('site_dictionary').select('*'),
        supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle(),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const missing: string[] = [];
      const available: string[] = [];
      const checkResult = (table: string, res: { error: any }) => {
        if (res.error) {
          if (
            res.error.code === 'PGRST205' ||
            res.error.message?.includes('not find the table') ||
            res.error.message?.includes('schema cache')
          ) {
            missing.push(table);
          } else {
            available.push(table);
          }
        } else {
          available.push(table);
        }
      };

      checkResult('products', prodRes);
      checkResult('site_blocks', blockRes);
      checkResult('site_dictionary', dictRes);
      checkResult('site_settings', setRes);
      checkResult('orders', ordRes);

      setSupabaseStatus({
        connected: true,
        url: 'https://tmryqhilyisbfdpnsiwo.supabase.co',
        hasTables: !missing.includes('products') && !missing.includes('orders') && missing.length === 0,
        missingTables: missing,
        availableTables: available,
      });

      // 1. Process Products with resilient smart merge
      if (!prodRes.error && prodRes.data) {
        const remote = prodRes.data as Product[];
        setProducts((prev) => {
          if (remote.length === 0) {
            return prev.length > 0 ? prev : INITIAL_PRODUCTS;
          }
          const remoteMap = new Map(remote.map((p) => [p.id, p]));
          const merged: Product[] = [];
          const localToPush: Product[] = [];

          let deletedIds = new Set<string>();
          try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DELETED_PRODUCTS);
            if (stored) deletedIds = new Set(JSON.parse(stored));
          } catch {}

          // Retain all existing local products; local changes and unsynced creations are preserved
          for (const localProd of prev) {
            if (deletedIds.has(localProd.id)) continue;
            const remoteProd = remoteMap.get(localProd.id);
            if (!remoteProd) {
              // Local product created by the user not yet in remote: KEEP IT!
              merged.push(localProd);
              localToPush.push(localProd);
            } else {
              const localTime = new Date(localProd.updated_at || localProd.created_at || 0).getTime();
              const remoteTime = new Date(remoteProd.updated_at || remoteProd.created_at || 0).getTime();
              if (localTime > remoteTime) {
                // Local edit is newer than remote: KEEP IT and queue push
                merged.push(localProd);
                localToPush.push(localProd);
              } else {
                // Remote is current: adopt remote, preserving local fit_guide if absent remotely
                merged.push({
                  ...remoteProd,
                  fit_guide: remoteProd.fit_guide || localProd.fit_guide || remoteProd.size_guide,
                });
              }
              remoteMap.delete(localProd.id);
            }
          }

          // Add any remaining remote products that did not exist locally
          for (const remainingRemote of remoteMap.values()) {
            if (!deletedIds.has(remainingRemote.id)) {
              merged.push(remainingRemote);
            }
          }

          // Auto-sync any unsynced local products to Supabase in background
          if (localToPush.length > 0 && !missing.includes('products')) {
            setTimeout(async () => {
              for (const p of localToPush) {
                try {
                  const payload = toSupabaseProduct(p);
                  await supabase.from('products').upsert(payload);
                } catch {}
              }
            }, 60);
          }

          return merged.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        });
      }

      // 2. Process Blocks
      if (!blockRes.error && blockRes.data) {
        const loaded = blockRes.data as SiteBlock[];
        setBlocks((prev) => {
          if (loaded.length === 0) {
            return prev.length > 0 ? prev : INITIAL_BLOCKS;
          }
          const filteredRemote: SiteBlock[] = [];
          let seenTimeCapsule = false;
          for (const blk of loaded) {
            if (blk.block_type === 'time_capsule') {
              if (!seenTimeCapsule) {
                seenTimeCapsule = true;
                filteredRemote.push(blk);
              }
            } else {
              filteredRemote.push(blk);
            }
          }
          const remoteIds = new Set(filteredRemote.map((b) => b.id));
          const remoteTypes = new Set(filteredRemote.map((b) => b.block_type));
          const localKept = prev.filter(
            (b) => !remoteIds.has(b.id) && !remoteTypes.has(b.block_type) && !INITIAL_BLOCKS.some((ib) => ib.id === b.id)
          );
          const merged = [...filteredRemote, ...localKept];
          if (!merged.some((b) => b.block_type === 'time_capsule')) {
            const defaultCapsule = INITIAL_BLOCKS.find((b) => b.block_type === 'time_capsule');
            if (defaultCapsule) merged.push(defaultCapsule);
          }
          return merged.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        });
      }

      // 3. Process Dictionary
      let remoteLogoUrl: string | undefined = undefined;
      let remoteBrandBio: string | undefined = undefined;
      let remoteLocationText: string | undefined = undefined;
      let remoteInstagramHandle: string | undefined = undefined;
      if (!dictRes.error && dictRes.data && dictRes.data.length > 0) {
        const dictMap: Record<string, DictionaryEntry> = {};
        dictRes.data.forEach((item) => {
          dictMap[item.key] = item;
          if (
            (item.key === 'brand_logo_url' || item.key === 'site_logo_url' || item.key === 'logo_url') &&
            item.pt &&
            item.pt.trim() &&
            item.pt !== '/logo.png'
          ) {
            remoteLogoUrl = item.pt.trim();
          }
          if ((item.key === 'brand_bio' || item.key === 'site_brand_bio') && item.pt && item.pt.trim()) {
            remoteBrandBio = item.pt.trim();
          }
          if ((item.key === 'location_text' || item.key === 'brand_location') && item.pt && item.pt.trim()) {
            remoteLocationText = item.pt.trim();
          }
          if ((item.key === 'instagram_handle' || item.key === 'brand_instagram') && item.pt && item.pt.trim()) {
            remoteInstagramHandle = item.pt.trim();
          }
        });
        setDictionary(dictMap);
      }

      // 4. Process Settings
      if (!setRes.error && setRes.data) {
        const r = setRes.data as Record<string, unknown>;
        if (r.logo_url && typeof r.logo_url === 'string' && r.logo_url.trim() && r.logo_url !== '/logo.png') {
          remoteLogoUrl = (r.logo_url as string).trim();
        } else if (r.site_logo_url && typeof r.site_logo_url === 'string' && r.site_logo_url.trim() && r.site_logo_url !== '/logo.png') {
          remoteLogoUrl = (r.site_logo_url as string).trim();
        }

        setSettings((prev) => {
          const cached = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.BRAND_LOGO) : null;
          const cachedBio = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.BRAND_BIO) : null;
          const cachedLocation = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.LOCATION_TEXT) : null;
          const cachedInsta = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.INSTAGRAM_HANDLE) : null;

          const finalLogo =
            remoteLogoUrl ||
            prev.site_logo_url ||
            prev.logo_url ||
            (cached && cached !== '/logo.png' ? cached : undefined) ||
            '/logo.png';

          const finalBrandBio =
            (r.brand_bio && typeof r.brand_bio === 'string' && r.brand_bio.trim())
              ? (r.brand_bio as string).trim()
              : remoteBrandBio || cachedBio || prev.brand_bio || INITIAL_SETTINGS.brand_bio;

          const finalLocationText =
            (r.location_text && typeof r.location_text === 'string' && r.location_text.trim())
              ? (r.location_text as string).trim()
              : remoteLocationText || cachedLocation || prev.location_text || INITIAL_SETTINGS.location_text;

          const finalInstagram =
            (r.instagram_handle && typeof r.instagram_handle === 'string' && r.instagram_handle.trim())
              ? (r.instagram_handle as string).trim()
              : remoteInstagramHandle || cachedInsta || prev.instagram_handle || INITIAL_SETTINGS.instagram_handle;

          return {
            ...INITIAL_SETTINGS,
            ...prev,
            ...(setRes.data as SiteSettings),
            brand_bio: finalBrandBio,
            location_text: finalLocationText,
            instagram_handle: finalInstagram,
            site_logo_url: finalLogo,
            logo_url: finalLogo,
          };
        });
      }

      // 5. Process Orders
      if (!ordRes.error && ordRes.data) {
        const remoteOrders = (ordRes.data as Order[]).map((o) => {
          const activeEv = o.status_timeline?.find((ev) => ev.active);
          const noteEv = o.status_timeline?.find((ev) => ev.admin_note && ev.admin_note.trim() !== '');
          const isStandardDesc = (desc?: string) =>
            !desc ||
            desc.includes('vaga reservada no atelier') ||
            desc.includes('Peça embalada sob padrão') ||
            desc.includes('estafeta está a caminho') ||
            desc.includes('entregue em mãos') ||
            desc.includes('aguardar validação bancária');

          const hydratedNotes =
            o.admin_notes ||
            noteEv?.admin_note ||
            (activeEv && !isStandardDesc(activeEv.description) ? activeEv.description : undefined);

          return {
            ...o,
            admin_notes: hydratedNotes,
          };
        });

        setOrders((prevLocal) => {
          if (remoteOrders.length === 0) return prevLocal;
          const orderMap = new Map<string, Order>();
          prevLocal.forEach((o) => orderMap.set(o.tracking_code || o.id, o));
          remoteOrders.forEach((o) => orderMap.set(o.tracking_code || o.id, o));
          const combined = Array.from(orderMap.values());
          combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return combined;
        });
      }
    } catch (err) {
      console.warn('[Supabase Sync] Falha durante sincronização paralela:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Translation helper
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const entry = dictionary[key];
      if (entry) {
        return language === 'en' ? entry.en : entry.pt;
      }
      return fallback || key;
    },
    [dictionary, language]
  );

  // Active Drop vs Time Capsule memoization
  const activeDropProducts = useMemo(() => {
    return products.filter((p) => p.lifecycle === 'active_drop' && p.is_visible);
  }, [products]);

  const timeCapsuleProducts = useMemo(() => {
    return products.filter((p) => p.lifecycle === 'time_capsule' && p.is_visible);
  }, [products]);

  // Search filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.is_visible &&
        (p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.details.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Helper to ensure slug is clean and guaranteed unique across all products
  const generateUniqueSlug = async (productToSave: Product, currentProducts: Product[]): Promise<string> => {
    let base = (productToSave.slug || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!base) {
      base = (productToSave.name || 'peca')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `peca-${Date.now().toString(36)}`;
    }

    let candidate = base;

    // Check local collision with another product
    const localConflict = currentProducts.some(
      (p) => p.id !== productToSave.id && p.slug.toLowerCase() === candidate.toLowerCase()
    );
    if (localConflict) {
      candidate = `${base}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5)}`;
    }

    // Check remote collision in Supabase if connected
    if (supabaseStatus.connected && !supabaseStatus.missingTables.includes('products')) {
      try {
        const { data: existingRemote } = await supabase
          .from('products')
          .select('id, slug')
          .eq('slug', candidate)
          .maybeSingle();

        if (existingRemote && existingRemote.id !== productToSave.id) {
          candidate = `${base}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5)}`;
        }
      } catch {
        // Ignore remote check errors
      }
    }

    return candidate;
  };

  // Product CRUD
  const saveProduct = async (product: Product): Promise<boolean> => {
    const cleanSlug = await generateUniqueSlug(product, products);
    const resolvedProduct: Product = {
      ...product,
      slug: cleanSlug,
      updated_at: new Date().toISOString(),
    };

    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === resolvedProduct.id);
      let nextList: Product[];
      if (index >= 0) {
        nextList = [...prev];
        nextList[index] = resolvedProduct;
      } else {
        nextList = [{ ...resolvedProduct, created_at: resolvedProduct.created_at || new Date().toISOString() }, ...prev];
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(nextList));
      } catch {}
      setStoredItem(LOCAL_STORAGE_KEYS.PRODUCTS, nextList).catch(() => {});
      return nextList;
    });

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DELETED_PRODUCTS);
      if (stored) {
        const list: string[] = JSON.parse(stored);
        const filtered = list.filter((delId) => delId !== resolvedProduct.id);
        localStorage.setItem(LOCAL_STORAGE_KEYS.DELETED_PRODUCTS, JSON.stringify(filtered));
      }
    } catch {}

    const canSync = supabaseStatus.connected && !supabaseStatus.missingTables.includes('products');
    if (canSync) {
      try {
        const payload = toSupabaseProduct(resolvedProduct);
        let { error } = await supabase.from('products').upsert(payload);

        // Auto-handle duplicate key value violates unique constraint "products_slug_key" (Postgres 23505)
        if (
          error &&
          (error.code === '23505' ||
            error.message?.includes('products_slug_key') ||
            error.message?.includes('slug'))
        ) {
          console.warn('[Supabase] Conflito de slug detectado (23505). Gerando slug único e tentando novamente...');
          const fallbackSlug = `${cleanSlug.replace(/-[a-z0-9]{4,8}$/, '')}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
          const retriedProduct: Product = {
            ...resolvedProduct,
            slug: fallbackSlug,
            updated_at: new Date().toISOString(),
          };
          const retryPayload = toSupabaseProduct(retriedProduct);
          const retryRes = await supabase.from('products').upsert(retryPayload);
          if (!retryRes.error) {
            setProducts((prev) => prev.map((p) => (p.id === retriedProduct.id ? retriedProduct : p)));
            error = null;
          } else {
            error = retryRes.error;
          }
        }

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
            markTableMissing('products');
            console.warn('[Supabase] Tabela "products" ainda não criada. O produto foi salvo com sucesso localmente.');
          } else {
            console.error('Supabase saveProduct error:', error);
          }
        }
      } catch (err) {
        console.warn('Supabase saveProduct error (salvo localmente):', err);
      }
    }
    return true;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    // 1. Atualiza imediatamente o estado local de produtos para filtrar sem recarregar
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    setWishlist((prev) => prev.filter((pid) => pid !== id));

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DELETED_PRODUCTS);
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(LOCAL_STORAGE_KEYS.DELETED_PRODUCTS, JSON.stringify(list));
      }
    } catch {}

    // 2. Dispara a chamada assíncrona para o Supabase
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error && (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01')) {
        markTableMissing('products');
      }
    } catch (err) {
      console.warn('Erro ao apagar produto no Supabase:', err);
    }
    return true;
  };

  const toggleProductLifecycle = async (id: string, lifecycle: 'active_drop' | 'time_capsule') => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const updated: Product = {
      ...product,
      lifecycle,
      badge: lifecycle === 'time_capsule' ? 'ESGOTADO' : product.badge === 'ESGOTADO' ? 'NOVO' : product.badge,
      updated_at: new Date().toISOString(),
    };
    await saveProduct(updated);
  };

  const toggleProductVisibility = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const updated: Product = { ...product, is_visible: !product.is_visible, updated_at: new Date().toISOString() };
    await saveProduct(updated);
  };

  // Block CRUD (Page Builder)
  const saveBlock = async (block: SiteBlock): Promise<boolean> => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === block.id);
      let nextList: SiteBlock[];
      if (index >= 0) {
        nextList = [...prev];
        nextList[index] = { ...block, updated_at: new Date().toISOString() };
      } else {
        nextList = [...prev, { ...block, updated_at: new Date().toISOString() }];
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.BLOCKS, JSON.stringify(nextList));
      } catch {}
      setStoredItem(LOCAL_STORAGE_KEYS.BLOCKS, nextList).catch(() => {});
      return nextList;
    });

    // If saving the marquee block, synchronize its messages into settings as well
    if (block.block_type === 'marquee' && Array.isArray(block.content?.items)) {
      setSettings((prev) => {
        const next = { ...prev, marquee_messages: block.content.items };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(next));
        } catch {}
        setStoredItem(LOCAL_STORAGE_KEYS.SETTINGS, next).catch(() => {});
        return next;
      });
      if (supabaseStatus.connected && !supabaseStatus.missingTables.includes('site_settings')) {
        supabase
          .from('site_settings')
          .update({ marquee_messages: block.content.items, updated_at: new Date().toISOString() })
          .eq('id', 'global')
          .then(() => {}, () => {});
      }
    }

    const canSync = supabaseStatus.connected && !supabaseStatus.missingTables.includes('site_blocks');
    if (canSync) {
      try {
        const { error } = await supabase.from('site_blocks').upsert({
          ...block,
          updated_at: new Date().toISOString(),
        });
        if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
          markTableMissing('site_blocks');
        }
      } catch {}
    }
    return true;
  };

  const toggleBlock = async (id: string, isActive: boolean) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    await saveBlock({ ...block, is_active: isActive });
    if (block.block_type === 'marquee') {
      await saveSettings({ marquee_enabled: isActive });
    }
  };

  const reorderBlocks = async (newBlocks: SiteBlock[]) => {
    const withIndices = newBlocks.map((b, i) => ({ ...b, order_index: i + 1 }));
    setBlocks(withIndices);
    const canSync = supabaseStatus.connected && !supabaseStatus.missingTables.includes('site_blocks');
    if (canSync) {
      try {
        const { error } = await supabase.from('site_blocks').upsert(withIndices);
        if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
          markTableMissing('site_blocks');
        }
      } catch {}
    }
  };

  // Dictionary CRUD
  const saveDictionaryEntry = async (entry: DictionaryEntry): Promise<boolean> => {
    setDictionary((prev) => ({
      ...prev,
      [entry.key]: { ...entry, updated_at: new Date().toISOString() },
    }));

    const canSync = supabaseStatus.connected && !supabaseStatus.missingTables.includes('site_dictionary');
    if (canSync) {
      try {
        const { error } = await supabase.from('site_dictionary').upsert({
          ...entry,
          updated_at: new Date().toISOString(),
        });
        if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
          markTableMissing('site_dictionary');
        }
      } catch {}
    }
    return true;
  };

  // Settings CRUD
  const saveSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    const logoToUpdate = newSettings.site_logo_url || newSettings.logo_url;

    // 1. Immediately cache brand details to localStorage for instant responsiveness
    if (logoToUpdate && logoToUpdate !== '/logo.png') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.BRAND_LOGO, logoToUpdate);
      } catch {}
    }
    if (newSettings.brand_bio !== undefined) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.BRAND_BIO, newSettings.brand_bio);
      } catch {}
    }
    if (newSettings.location_text !== undefined) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.LOCATION_TEXT, newSettings.location_text);
      } catch {}
    }
    if (newSettings.instagram_handle !== undefined) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.INSTAGRAM_HANDLE, newSettings.instagram_handle);
      } catch {}
    }

    const merged: SiteSettings = {
      ...settings,
      ...newSettings,
      ...(logoToUpdate ? { site_logo_url: logoToUpdate, logo_url: logoToUpdate } : {}),
      updated_at: new Date().toISOString(),
    };
    setSettings(merged);
    setStoredItem(LOCAL_STORAGE_KEYS.SETTINGS, merged).catch(() => {});

    // Keep marquee block is_active in sync with settings.marquee_enabled
    if (newSettings.marquee_enabled !== undefined) {
      setBlocks((prev) => {
        const mb = prev.find((b) => b.block_type === 'marquee');
        if (mb && mb.is_active !== newSettings.marquee_enabled) {
          const updated = prev.map((b) =>
            b.block_type === 'marquee' ? { ...b, is_active: newSettings.marquee_enabled!, updated_at: new Date().toISOString() } : b
          );
          try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.BLOCKS, JSON.stringify(updated));
          } catch {}
          setStoredItem(LOCAL_STORAGE_KEYS.BLOCKS, updated).catch(() => {});
          if (supabaseStatus.connected && !supabaseStatus.missingTables.includes('site_blocks')) {
            supabase
              .from('site_blocks')
              .update({ is_active: newSettings.marquee_enabled, updated_at: new Date().toISOString() })
              .eq('id', mb.id)
              .then(() => {}, () => {});
          }
          return updated;
        }
        return prev;
      });
    }

    // 2. Persist to Supabase
    if (supabaseStatus.connected) {
      // 2a. Guaranteed database persistence in site_dictionary (safe for arbitrary text fields)
      if (!supabaseStatus.missingTables.includes('site_dictionary')) {
        const dictEntries: Array<{ key: string; pt: string; en: string; category: string; updated_at: string }> = [];
        if (logoToUpdate) {
          dictEntries.push(
            { key: 'brand_logo_url', pt: logoToUpdate, en: logoToUpdate, category: 'brand', updated_at: new Date().toISOString() },
            { key: 'site_logo_url', pt: logoToUpdate, en: logoToUpdate, category: 'brand', updated_at: new Date().toISOString() }
          );
        }
        if (merged.brand_bio) {
          dictEntries.push({
            key: 'brand_bio',
            pt: merged.brand_bio,
            en: merged.brand_bio,
            category: 'brand',
            updated_at: new Date().toISOString(),
          });
        }
        if (merged.location_text) {
          dictEntries.push({
            key: 'location_text',
            pt: merged.location_text,
            en: merged.location_text,
            category: 'brand',
            updated_at: new Date().toISOString(),
          });
        }
        if (merged.instagram_handle) {
          dictEntries.push({
            key: 'instagram_handle',
            pt: merged.instagram_handle,
            en: merged.instagram_handle,
            category: 'brand',
            updated_at: new Date().toISOString(),
          });
        }
        if (dictEntries.length > 0) {
          try {
            await supabase.from('site_dictionary').upsert(dictEntries);
          } catch (e) {
            console.warn('[Supabase] Falha ao gravar no site_dictionary:', e);
          }
        }
      }

      // 2b. Persist to site_settings
      if (!supabaseStatus.missingTables.includes('site_settings')) {
        try {
          const allSettingsColumns = [
            'id',
            'store_name',
            'maintenance_mode',
            'maintenance_message',
            'next_drop_mode',
            'next_drop_date',
            'next_drop_title',
            'checkout_locked',
            'checkout_lock_message',
            'require_payment_proof',
            'iban',
            'account_holder',
            'account_number',
            'multicaixa_express_phone',
            'whatsapp_number',
            'marquee_enabled',
            'marquee_messages',
            'footer_categories',
            'brand_bio',
            'location_text',
            'instagram_handle',
            'copyright_text',
            'contact_email',
            'updated_at',
            'site_logo_url',
            'logo_url',
          ];

          const payload: Record<string, unknown> = {
            id: 'global',
            updated_at: new Date().toISOString(),
          };

          const sourceRecord = merged as unknown as Record<string, unknown>;
          allSettingsColumns.forEach((col) => {
            if (sourceRecord[col] !== undefined) {
              payload[col] = sourceRecord[col];
            }
          });

          if (logoToUpdate) {
            payload.site_logo_url = logoToUpdate;
            payload.logo_url = logoToUpdate;
          }

          const { error } = await supabase.from('site_settings').upsert(payload);
          if (error) {
            // If error is due to an unmigrated column, fallback to base columns
            if (error.message?.includes('column') || error.code === 'PGRST204') {
              const minimalCols = [
                'id',
                'store_name',
                'maintenance_mode',
                'maintenance_message',
                'next_drop_mode',
                'next_drop_date',
                'next_drop_title',
                'checkout_locked',
                'checkout_lock_message',
                'require_payment_proof',
                'iban',
                'account_holder',
                'account_number',
                'multicaixa_express_phone',
                'whatsapp_number',
                'marquee_enabled',
                'marquee_messages',
                'footer_categories',
                'updated_at',
                'site_logo_url',
                'logo_url',
              ];
              const minimalPayload: Record<string, unknown> = { id: 'global', updated_at: new Date().toISOString() };
              minimalCols.forEach((col) => {
                if (sourceRecord[col] !== undefined) minimalPayload[col] = sourceRecord[col];
              });
              if (logoToUpdate) {
                minimalPayload.site_logo_url = logoToUpdate;
                minimalPayload.logo_url = logoToUpdate;
              }
              await supabase.from('site_settings').upsert(minimalPayload);
            } else if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
              markTableMissing('site_settings');
            }
          }
        } catch (err) {
          console.warn('[Supabase] Erro ao gravar site_settings:', err);
        }
      }
    }
    return true;
  };

  // Cart Management
  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, size, color, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateCartQuantity = (productId: string, size: string, color: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.size === size && item.color === color) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  const FREE_SHIPPING_THRESHOLD = 20000;
  const STANDARD_SHIPPING_FEE = 5000;

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price_aoa * item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [cartSubtotal, cart.length]);

  const cartTotal = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal + deliveryFee;
  }, [cartSubtotal, deliveryFee, cart.length]);

  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const shippingProgressPercentage = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Wishlist Handlers
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const wishlistCount = wishlist.length;

  // Order Creation (Checkout & Tracking Engine)
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'tracking_code' | 'created_at' | 'status' | 'status_timeline'> & { tracking_code?: string }
  ): Promise<Order> => {
    const code = orderData.tracking_code || generateTrackingCode();
    const now = new Date().toISOString();
    const orderId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    const initialTimeline: OrderTimelineEvent[] = [
      {
        step: 1,
        title: 'Pendente de Verificação',
        description: 'Comprovativo de pagamento submetido pelo cliente. A aguardar validação bancária.',
        timestamp: now,
        completed: true,
        active: true,
      },
      {
        step: 2,
        title: 'A sua encomenda saiu do local de produção',
        description: 'Peça embalada no atelier de Luanda e entregue à equipa de logística.',
        timestamp: '',
        completed: false,
        active: false,
      },
      {
        step: 3,
        title: 'A sua encomenda está prestes a chegar',
        description: 'O estafeta está a caminho do seu endereço. Certifique-se de se manter contactável.',
        timestamp: '',
        completed: false,
        active: false,
      },
      {
        step: 4,
        title: 'Entregue',
        description: 'Encomenda entregue com sucesso.',
        timestamp: '',
        completed: false,
        active: false,
      },
    ];

    const initialStatus = (orderData as { status?: OrderStatus }).status || 'Pendente de Verificação';

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      tracking_code: code,
      customer_address: orderData.customer_address || orderData.customer_city,
      customer_reference: orderData.customer_reference || orderData.customer_notes,
      status: initialStatus,
      status_timeline: initialTimeline,
      created_at: now,
      updated_at: now,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Persist to Supabase orders table with timeout protection (guarantees instantaneous order generation)
    if (supabaseStatus.connected && !supabaseStatus.missingTables.includes('orders')) {
      // Intact proof URL (never truncated or corrupted)
      const remoteProofUrl = orderData.payment_proof_url || null;

      // Note: Only transmit columns that exist in the Supabase 'orders' schema to avoid PGRST204
      const remotePayload = {
        id: orderId,
        tracking_code: code,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_city: orderData.customer_city || orderData.customer_address || 'Luanda',
        customer_notes: orderData.customer_notes || orderData.customer_reference || null,
        items: orderData.items,
        total_aoa: orderData.total_aoa,
        payment_method: orderData.payment_method || 'Multicaixa Express',
        payment_proof_url: remoteProofUrl,
        status: initialStatus,
        status_timeline: initialTimeline,
        created_at: now,
        updated_at: now,
      };

      // Wrap in Promise.race with 2.5s timeout so order generation is never blocked
      Promise.race([
        supabase.from('orders').insert([remotePayload]),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
      ])
        .then((res: unknown) => {
          const typedRes = res as { error?: { code?: string; message?: string } } | null;
          if (typedRes?.error) {
            if (typedRes.error.code === 'PGRST205' || typedRes.error.message?.includes('schema cache')) {
              markTableMissing('orders');
            }
            console.warn('[Supabase] Aviso ao gravar encomenda no servidor:', typedRes.error);
          } else {
            console.log('[Supabase] Encomenda sincronizada com sucesso:', code);
          }
        })
        .catch((err) => {
          console.warn('[Supabase] Encomenda registrada localmente com código garantido:', err);
        });
    }

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    customNote?: string
  ): Promise<boolean> => {
    const now = new Date().toISOString();

    let updatedOrderForRemote: Order | null = null;

    const statusMap: Record<string, number> = {
      'Pendente de Verificação': 1,
      Pendente: 1,
      Aprovado: 1,
      'Pedido Confirmado': 1,
      'Em Trânsito': 2,
      'Em Produção/Trânsito': 2,
      'Prestes a Chegar': 3,
      Entregue: 4,
      Cancelado: 0,
    };

    const currentStep = statusMap[newStatus] ?? 1;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const defaultTimelineBase: OrderTimelineEvent[] = [
          {
            step: 1,
            title: 'Pedido Confirmado',
            description: 'Comprovativo validado e vaga reservada no atelier.',
            timestamp: order.created_at || now,
            completed: currentStep >= 1,
            active: currentStep === 1,
          },
          {
            step: 2,
            title: 'Em Produção/Trânsito',
            description: 'Peça embalada sob padrão estrito e entregue à logística.',
            timestamp: now,
            completed: currentStep >= 2,
            active: currentStep === 2,
          },
          {
            step: 3,
            title: 'Prestes a Chegar',
            description: 'O estafeta está a caminho do seu endereço em Luanda.',
            timestamp: now,
            completed: currentStep >= 3,
            active: currentStep === 3,
          },
          {
            step: 4,
            title: 'Entregue',
            description: 'Encomenda entregue em mãos com sucesso.',
            timestamp: now,
            completed: currentStep >= 4,
            active: currentStep === 4,
          },
        ];

        const sourceTimeline =
          order.status_timeline && order.status_timeline.length >= 4
            ? order.status_timeline
            : defaultTimelineBase;

        const trimmedNote = customNote !== undefined ? customNote.trim() : undefined;

        const updatedTimeline: OrderTimelineEvent[] = sourceTimeline.map((ev) => {
          const isCurrent = ev.step === currentStep;
          const isCompleted = currentStep > 0 && ev.step <= currentStep;

          let stepDesc = ev.description;
          let stepNote = ev.admin_note;

          if (isCurrent) {
            if (trimmedNote !== undefined && trimmedNote !== '') {
              stepDesc = trimmedNote;
              stepNote = trimmedNote;
            }
          }

          return {
            ...ev,
            completed: isCompleted,
            active: isCurrent,
            timestamp: isCurrent ? now : ev.timestamp,
            description: stepDesc,
            admin_note: stepNote,
          };
        });

        const effectiveAdminNotes =
          trimmedNote !== undefined && trimmedNote !== ''
            ? trimmedNote
            : (order.admin_notes || updatedTimeline.find((e) => e.admin_note)?.admin_note);

        const finalOrder: Order = {
          ...order,
          status: newStatus,
          admin_notes: effectiveAdminNotes,
          status_timeline: updatedTimeline,
          updated_at: now,
        };
        updatedOrderForRemote = finalOrder;
        return finalOrder;
      })
    );

    const canSyncOrders = supabaseStatus.connected && !supabaseStatus.missingTables.includes('orders');
    if (canSyncOrders) {
      try {
        await supabase
          .from('orders')
          .update({
            status: newStatus,
            status_timeline: updatedOrderForRemote ? (updatedOrderForRemote as Order).status_timeline : undefined,
            updated_at: now,
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('[Supabase] Erro ao sincronizar estado da encomenda:', err);
      }
    }

    return true;
  };

  const getOrderByTrackingCode = async (code: string): Promise<Order | null> => {
    const formatted = code.trim().toUpperCase();

    // Check local memory first
    const local = orders.find(
      (o) => o.tracking_code.trim().toUpperCase() === formatted
    );

    // Also query Supabase directly for live real-time sync if table exists
    const canSyncOrders = supabaseStatus.connected && !supabaseStatus.missingTables.includes('orders');
    if (canSyncOrders) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('tracking_code', formatted)
          .maybeSingle();

        if (!error && data) {
          const rawOrder = data as Order;
          const activeEv = rawOrder.status_timeline?.find((ev) => ev.active);
          const noteEv = rawOrder.status_timeline?.find((ev) => ev.admin_note && ev.admin_note.trim() !== '');
          const isStandardDesc = (desc?: string) =>
            !desc ||
            desc.includes('vaga reservada no atelier') ||
            desc.includes('Peça embalada sob padrão') ||
            desc.includes('estafeta está a caminho') ||
            desc.includes('entregue em mãos') ||
            desc.includes('aguardar validação bancária');

          const hydratedNotes =
            rawOrder.admin_notes ||
            noteEv?.admin_note ||
            (activeEv && !isStandardDesc(activeEv.description) ? activeEv.description : undefined);

          const fullOrder: Order = {
            ...rawOrder,
            admin_notes: hydratedNotes,
          };

          // Update local state if remote was modified by admin
          setOrders((prev) => {
            const exists = prev.some((o) => o.id === fullOrder.id);
            if (exists) {
              return prev.map((o) => (o.id === fullOrder.id ? fullOrder : o));
            }
            return [fullOrder, ...prev];
          });
          return fullOrder;
        } else if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
          markTableMissing('orders');
        }
      } catch {}
    }

    return local || null;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        activeDropProducts,
        timeCapsuleProducts,
        saveProduct,
        deleteProduct,
        toggleProductLifecycle,
        toggleProductVisibility,
        blocks,
        saveBlock,
        toggleBlock,
        reorderBlocks,
        dictionary,
        language,
        setLanguage,
        t,
        saveDictionaryEntry,
        settings,
        saveSettings,
        orders,
        createOrder,
        updateOrderStatus,
        getOrderByTrackingCode,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        deliveryFee,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        isFreeShipping,
        amountUntilFreeShipping,
        shippingProgressPercentage,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        isWishlistOpen,
        setIsWishlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        filteredProducts,
        activeTab,
        setActiveTab,
        selectedProductSlug,
        setSelectedProductSlug,
        trackingInput,
        setTrackingInput,
        supabaseStatus,
        refreshSupabase: syncWithSupabase,
        isSyncing,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
