import React, { useState, useEffect } from 'react';
import {
  Layers,
  ShoppingBag,
  Type,
  Sliders,
  PackageCheck,
  Database,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  ExternalLink,
  Eye,
  RefreshCw,
  Clock,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Phone,
  Search,
  Filter,
  Sparkles,
  Save,
  Truck,
  Download,
  MessageSquare,
  LogOut,
  BellRing,
  Users,
  TrendingUp,
  CheckCheck,
  Send,
  Archive,
  Calendar,
  Compass,
  UploadCloud
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatAOA, formatDate } from '../../lib/format';
import { Product, Order, OrderStatus, SiteBlock, DictionaryEntry, SiteSettings, BlockType, RestockRequest, CustomContent, CustomContentItem, SiteMenuItem } from '../../types';
import { SUPABASE_SCHEMA_SQL, SUPABASE_FIX_RLS_SQL } from '../../data/initialData';
import { BlockEditorModal } from './block-editor-modal';
import { CustomContentEditorModal } from './custom-content-editor-modal';
import { MenuEditorModal } from './menu-editor-modal';
import { MultiImageUploader } from './image-uploader';
import { ImageGalleryManager } from './image-gallery-manager';
import { BrandLogoManager } from './brand-logo-manager';
import { WULogo } from '../wu-logo';
import { supabase, uploadImageToSupabase } from '../../lib/supabase';
import { scrollToTop } from '../../lib/scroll';

export const AdminPanel: React.FC = () => {
  const {
    products,
    setProducts,
    saveProduct,
    deleteProduct,
    toggleProductLifecycle,
    toggleProductVisibility,
    blocks,
    saveBlock,
    deleteBlock,
    toggleBlock,
    reorderBlocks,
    customContents,
    saveCustomContent,
    deleteCustomContent,
    menuItems,
    saveMenuItem,
    deleteMenuItem,
    reorderMenuItems,
    dictionary,
    saveDictionaryEntry,
    settings,
    saveSettings,
    orders,
    updateOrderStatus,
    deleteOrder,
    scheduleDeliveryDate,
    markWhatsAppNotificationSent,
    restockRequests,
    updateRestockStatus,
    deleteRestockRequest,
    supabaseStatus,
    refreshSupabase,
    isSyncing,
    setActiveTab,
    isPreviewMode,
    setIsPreviewMode,
    hasUnpublishedChanges,
    publishDraft,
    isPublishing,
    lastPublishedAt,
  } = useStore();

  const { user, signOut } = useAuth();

  const handlePublishDraft = async () => {
    const success = await publishDraft();
    if (success) {
      showToast('Alterações publicadas com sucesso na loja oficial de clientes!');
    } else {
      showToast('Erro ao publicar alterações.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
    }
    setActiveTab('store');
    scrollToTop(true);
  };

  const [activeEngine, setActiveEngine] = useState<
    'orders' | 'catalog' | 'blocks' | 'dictionary' | 'brand' | 'settings' | 'supabase'
  >('orders');

  // Sub-categories within Orders Engine (1. PRE-ORDERS | 2. ORDERS | 3. RESTOCK REQUESTS)
  const [ordersCategory, setOrdersCategory] = useState<'pre_orders' | 'regular_orders' | 'restock_requests'>('pre_orders');
  const [restockSearch, setRestockSearch] = useState('');
  const [restockStatusFilter, setRestockStatusFilter] = useState<string>('all');

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedFixSql, setCopiedFixSql] = useState(false);

  // Manual settings form state (ensures edits are only committed when the admin clicks Save)
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);

  useEffect(() => {
    if (!isSettingsDirty) {
      setSettingsForm(settings);
    }
  }, [settings, isSettingsDirty]);

  const handleSaveSettingsForm = async () => {
    setIsSavingSettings(true);
    try {
      await saveSettings(settingsForm);
      setIsSettingsDirty(false);
      showToast('Configurações e dados de pagamento guardados com sucesso!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Erro ao guardar configurações');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Search & Filters for orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [selectedStatusForInspector, setSelectedStatusForInspector] = useState<OrderStatus>('ORDER CONFIRMED');
  const [isSavingOrderStatus, setIsSavingOrderStatus] = useState(false);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [viewingProofTitle, setViewingProofTitle] = useState<string>('');

  useEffect(() => {
    if (selectedOrder) {
      setSelectedStatusForInspector(selectedOrder.status as OrderStatus);
      const activeTimelineEvent = selectedOrder.status_timeline?.find((e) => e.active);
      const existingNote =
        selectedOrder.admin_notes ||
        activeTimelineEvent?.admin_note ||
        '';
      setStatusUpdateNote(existingNote);
    } else {
      setStatusUpdateNote('');
    }
  }, [selectedOrder]);

  const handleOpenProof = (url?: string | null, title?: string) => {
    if (!url || url.trim() === '') {
      showToast('Nenhum comprovativo fotográfico foi anexado para esta encomenda.');
      return;
    }
    setViewingProofUrl(url.trim());
    setViewingProofTitle(title || 'Comprovativo de Pagamento');
  };

  const openInNewTabSafely = (rawUrl: string) => {
    try {
      if (rawUrl.startsWith('data:')) {
        const parts = rawUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(rawUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(rawUrl, '_blank');
    }
  };

  const downloadProof = (url: string, title?: string) => {
    try {
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = (title ? title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'comprovativo') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Download do comprovativo concluído!');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = (title ? title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'comprovativo') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Download solicitado!');
      }
    } catch {
      showToast('Erro ao transferir comprovativo');
    }
  };

  const PRE_ORDER_STATUSES: OrderStatus[] = [
    'ORDER CONFIRMED',
    'PAYMENT VERIFIED',
    'IN PRODUCTION',
    'PRODUCTION COMPLETED / READY FOR DELIVERY',
    'DELIVERY SCHEDULED',
    'OUT FOR DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  const REGULAR_ORDER_STATUSES: OrderStatus[] = [
    'ORDER CONFIRMED',
    'PAYMENT VERIFIED',
    'READY FOR DELIVERY',
    'DELIVERY SCHEDULED',
    'OUT FOR DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  const handleSendWhatsAppNotification = async (order: Order) => {
    if (order.whatsapp_notification_sent) {
      const confirmResend = window.confirm(
        `A notificação WhatsApp já foi enviada em ${formatDate(order.whatsapp_notification_sent_at || '')}. Deseja reenviar a notificação para o cliente?`
      );
      if (!confirmResend) return;
    }

    const template =
      settings.pre_order_whatsapp_template_pt ||
      `UNUSUAL —  ENCOMENDA PRONTA\n\nA tua encomenda está pronta para entrega!\n\nAs entregas começam no dia [DATA].\n\nPor favor, escolhe a data da tua entrega através do link abaixo:\n\n[ ESCOLHER DATA DE ENTREGA ]`;

    const deliveriesStartDate =
      settings.pre_order_deliveries_start_date ||
      new Date().toLocaleDateString('pt-PT');

    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://wearingunusual.com';
    const directLink = `${origin}/choose-delivery-date/${order.tracking_code}`;

    let messageText = template
      .replace(/\[DATA\]/gi, deliveriesStartDate)
      .replace(/\{DATA\}/gi, deliveriesStartDate)
      .replace(/\[ ESCOLHER DATA DE ENTREGA \]/gi, directLink)
      .replace(/\[ESCOLHER DATA DE ENTREGA\]/gi, directLink)
      .replace(/\[LINK\]/gi, directLink)
      .replace(/\{LINK\}/gi, directLink);

    if (!messageText.includes(directLink)) {
      messageText += `\n\n${directLink}`;
    }

    const cleanPhone = order.customer_phone.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Mark as sent
    await markWhatsAppNotificationSent(order.id);
    showToast(`WhatsApp preparado e registado para ${order.customer_name} (${order.tracking_code})!`);
  };

  // Editing states for Products & Custom Contents
  const [catalogTab, setCatalogTab] = useState<'products' | 'custom_contents'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingCustomContent, setEditingCustomContent] = useState<CustomContent | null>(null);
  const [contentToDelete, setContentToDelete] = useState<CustomContent | null>(null);

  // Editing states for Blocks & Navigation Menu
  const [pageBuilderTab, setPageBuilderTab] = useState<'blocks' | 'menu'>('blocks');
  const [editingBlock, setEditingBlock] = useState<SiteBlock | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<SiteBlock | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<SiteMenuItem | null>(null);
  const [menuItemToDelete, setMenuItemToDelete] = useState<SiteMenuItem | null>(null);
  const [isAddingBlockPickerOpen, setIsAddingBlockPickerOpen] = useState(false);

  // Dictionary Search, Filter and New Key State
  const [dictSearch, setDictSearch] = useState('');
  const [dictCategoryFilter, setDictCategoryFilter] = useState<string>('all');
  const [isAddingDictKey, setIsAddingDictKey] = useState(false);
  const [newDictEntry, setNewDictEntry] = useState<{
    key: string;
    pt: string;
    en: string;
    category: DictionaryEntry['category'];
  }>({
    key: '',
    pt: '',
    en: '',
    category: 'headings',
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredDictionaryEntries = Object.values(dictionary).filter((entry) => {
    const matchesSearch =
      !dictSearch ||
      entry.key.toLowerCase().includes(dictSearch.toLowerCase()) ||
      entry.pt.toLowerCase().includes(dictSearch.toLowerCase()) ||
      entry.en.toLowerCase().includes(dictSearch.toLowerCase());
    const matchesCat = dictCategoryFilter === 'all' || entry.category === dictCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    showToast('Script SQL copiado para a área de transferência!');
  };

  const handleCopyFixSql = () => {
    navigator.clipboard.writeText(SUPABASE_FIX_RLS_SQL);
    setCopiedFixSql(true);
    setTimeout(() => setCopiedFixSql(false), 2500);
    showToast('Script de Reparo RLS copiado para a área de transferência!');
  };

  const handleQuickActivatePreOrder = async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      showToast('Produto não encontrado no catálogo.');
      return;
    }
    const updated: Product = {
      ...prod,
      enable_pre_order: true,
      pre_order_estimated_delivery: prod.pre_order_estimated_delivery || '15–25 Outubro',
    };
    await saveProduct(updated);
    showToast(`Pre-Order ATIVADO para "${prod.name}"! O botão [ PRE-ORDER ] já está visível na loja pública.`);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#e0e0e0] pb-24">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-black px-4 py-2.5 rounded shadow-2xl text-xs font-sans font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="border-b border-[#1c1c1c] bg-[#0c0c0c] sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <WULogo size="sm" imgClassName="h-7 w-auto object-contain" />
            <div className="h-6 w-px bg-[#262626]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display uppercase text-sm sm:text-base text-white tracking-[0.2em]">
                  CENTRO DE CONTROLO • WEARING UNUSUAL
                </h1>
                <span className="text-[9px] bg-[#1f1f1f] text-[#aaaaaa] px-2 py-0.5 rounded border border-[#2a2a2a] font-mono">
                  SUPABASE LIVE
                </span>
              </div>
              <p className="text-[10px] text-[#777777] font-sans mt-0.5">
                Wearing Unusual Architecture • Todas as alterações refletem instantaneamente no site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase Status Pill */}
            <button
              onClick={() => setActiveEngine('supabase')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-sans border transition-colors ${
                supabaseStatus.connected && supabaseStatus.hasTables
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {supabaseStatus.connected && supabaseStatus.hasTables
                  ? 'Supabase Conectado'
                  : 'Supabase: Requer SQL'}
              </span>
            </button>

            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#222222] rounded text-[11px] font-mono text-[#888888]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span className="truncate max-w-[150px] text-white">{user.email}</span>
              </div>
            )}

            {/* Botão PREVIEW (Abre o rascunho em modo de cliente seguro) */}
            <button
              type="button"
              onClick={() => {
                setIsPreviewMode(true);
                scrollToTop(true);
                setActiveTab('store');
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', '/preview');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#181818] hover:bg-white hover:text-black text-white text-xs font-sans tracking-wider uppercase rounded border border-[#2c2c2c] transition-all font-semibold shadow-md"
              title="Abrir versão de PREVIEW da loja com as alterações em rascunho (navegar como cliente)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
              {hasUnpublishedChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Botão PUBLICAR (Promove DRAFT -> PUBLISHED oficial) */}
            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublishDraft}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-sans tracking-wider uppercase transition-all font-bold shadow-md ${
                hasUnpublishedChanges
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                  : 'bg-[#181818] hover:bg-[#252525] text-neutral-300 border border-[#2c2c2c]'
              }`}
              title={
                hasUnpublishedChanges
                  ? 'Existem alterações em rascunho. Clique para publicar na loja oficial de clientes'
                  : 'A versão pública está sincronizada com o rascunho'
              }
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'A Publicar...' : hasUnpublishedChanges ? 'Publicar' : 'Publicado ✓'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/80 rounded text-xs font-sans tracking-wider uppercase transition-colors"
              title="Terminar sessão de administrador e voltar à loja pública"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminar Sessão</span>
            </button>
          </div>
        </div>

        {/* Engine Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[#181818]">
          <button
            onClick={() => setActiveEngine('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all ${
              activeEngine === 'orders'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white hover:bg-[#151515]'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>5. Encomendas & Produção ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveEngine('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all ${
              activeEngine === 'catalog'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white hover:bg-[#151515]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>2. Conteúdos & Produtos ({products.length} Produtos • {customContents.length} Personalizados)</span>
          </button>

          <button
            onClick={() => setActiveEngine('blocks')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all ${
              activeEngine === 'blocks'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Page Builder & Menu ({blocks.length} Blocos • {menuItems.length} Itens Menu)</span>
          </button>

          <button
            onClick={() => setActiveEngine('dictionary')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all ${
              activeEngine === 'dictionary'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>3. Dicionário & Micro-Copy</span>
          </button>

          <button
            onClick={() => setActiveEngine('brand')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all ${
              activeEngine === 'brand'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Configurações da Marca</span>
          </button>

          <button
            onClick={() => setActiveEngine('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all ${
              activeEngine === 'settings'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>4. Regras & Pagamentos</span>
          </button>

          <button
            onClick={() => setActiveEngine('supabase')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all ${
              activeEngine === 'supabase'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>SQL Supabase</span>
          </button>
        </div>
      </div>

      {/* Main Engine Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Supabase Pending Tables Notice Banner (if any tables are not yet created in Supabase) */}
        {(!supabaseStatus.hasTables || supabaseStatus.missingTables.length > 0) && (
          <div className="p-4 sm:p-5 rounded-lg bg-[#141208] border border-amber-500/40 text-xs font-sans text-amber-200/90 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-white text-sm font-semibold tracking-wide uppercase">
                      Supabase Conectado • Execução do SQL Pendente
                    </strong>
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-[10px] text-amber-300 font-mono uppercase">
                      Armazenamento Local Ativo (100% Funcional)
                    </span>
                  </div>
                  <p className="text-amber-300/80 leading-relaxed text-[11px] max-w-3xl">
                    O seu projeto Supabase (<code className="font-mono text-white">tmryqhilyisbfdpnsiwo</code>) está conectado, mas as tabelas ainda não foram criadas no banco de dados. Todas as suas alterações e encomendas estão a ser salvas com segurança no navegador. Para ativar a nuvem, basta copiar o script SQL e executá-lo no editor do Supabase.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-2 bg-white text-black hover:bg-neutral-200 font-bold rounded text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                </button>

                <a
                  href="https://supabase.com/dashboard/project/tmryqhilyisbfdpnsiwo/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-[#221c0e] hover:bg-[#2d2513] border border-amber-600/50 text-amber-200 font-bold rounded text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                >
                  <span>Abrir SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={refreshSupabase}
                  disabled={isSyncing}
                  className="px-3 py-2 bg-[#1b1b1b] hover:bg-[#282828] text-white rounded text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  title="Verificar se as tabelas já foram criadas"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Verificar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* MOTOR 5: GESTÃO DE ENCOMENDAS & RASTREIO DINÂMICO */}
        {/* ============================================================================== */}
        {activeEngine === 'orders' && (
          <div className="space-y-6">
            {/* Header & Synchronization */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-lg border border-[#1f1f1f]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display uppercase text-lg text-white tracking-wider">
                    5. BASE DE DADOS: PEDIDOS & ESTUDO DE PROCURA
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono">
                    {orders.length + restockRequests.length} Registos Totais
                  </span>
                </div>
                <p className="text-xs text-[#777777] font-sans mt-0.5">
                  Organização rigorosa: 1. Pre-Orders (Prioritário) • 2. Orders (Vendas Regulares) • 3. Restock Requests (Interesse Cápsula do Tempo).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await refreshSupabase();
                    showToast('Base de dados sincronizada com o Supabase!');
                  }}
                  className="px-3.5 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333333] text-white rounded text-xs font-sans flex items-center gap-1.5 transition-colors"
                  title="Atualizar lista de encomendas e pedidos de restock da nuvem"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#aaaaaa]" />
                  <span>Sincronizar Supabase</span>
                </button>
              </div>
            </div>

            {/* 3 CATEGORIAS OBRIGATÓRIAS (ORDEM ESTRITA): 1. PRE-ORDERS | 2. ORDERS | 3. RESTOCK REQUESTS */}
            {(() => {
              const preOrdersCount = orders.filter(
                (o) => o.order_type === 'pre_order' || o.is_pre_order || (o.items && o.items.some((i) => i.is_pre_order))
              ).length;
              const regularOrdersCount = orders.filter(
                (o) => !o.is_pre_order && o.order_type !== 'pre_order' && (!o.items || !o.items.some((i) => i.is_pre_order))
              ).length;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                  {/* 1. PRE-ORDERS */}
                  <button
                    type="button"
                    onClick={() => setOrdersCategory('pre_orders')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      ordersCategory === 'pre_orders'
                        ? 'bg-amber-500/10 border-amber-400 text-white shadow-xl ring-1 ring-amber-400/50'
                        : 'bg-[#0e0e0e] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-amber-400 text-black font-bold">
                        PRIORIDADE 1
                      </span>
                      <Clock className={`w-4 h-4 ${ordersCategory === 'pre_orders' ? 'text-amber-400' : 'text-[#666666]'}`} />
                    </div>
                    <div className="font-display uppercase text-sm sm:text-base font-bold text-white tracking-wider">
                      1. PRE-ORDERS
                    </div>
                    <div className="text-xs text-[#888888] mt-1 leading-snug">
                      {preOrdersCount} {preOrdersCount === 1 ? 'encomenda real' : 'encomendas reais'} (produção confirmada)
                    </div>
                  </button>

                  {/* 2. ORDERS */}
                  <button
                    type="button"
                    onClick={() => setOrdersCategory('regular_orders')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      ordersCategory === 'regular_orders'
                        ? 'bg-white/10 border-white text-white shadow-xl ring-1 ring-white/50'
                        : 'bg-[#0e0e0e] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#222222] text-[#cccccc] font-bold">
                        VENDAS LOJA
                      </span>
                      <PackageCheck className={`w-4 h-4 ${ordersCategory === 'regular_orders' ? 'text-white' : 'text-[#666666]'}`} />
                    </div>
                    <div className="font-display uppercase text-sm sm:text-base font-bold text-white tracking-wider">
                      2. ORDERS
                    </div>
                    <div className="text-xs text-[#888888] mt-1 leading-snug">
                      {regularOrdersCount} {regularOrdersCount === 1 ? 'pedido regular' : 'pedidos regulares'} (stock normal)
                    </div>
                  </button>

                  {/* 3. RESTOCK REQUESTS */}
                  <button
                    type="button"
                    onClick={() => setOrdersCategory('restock_requests')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      ordersCategory === 'restock_requests'
                        ? 'bg-amber-400/10 border-amber-300 text-white shadow-xl ring-1 ring-amber-300/50'
                        : 'bg-[#0e0e0e] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#1e1e1e] text-amber-300 border border-amber-500/30 font-bold">
                        CÁPSULA DO TEMPO
                      </span>
                      <BellRing className={`w-4 h-4 ${ordersCategory === 'restock_requests' ? 'text-amber-300' : 'text-[#666666]'}`} />
                    </div>
                    <div className="font-display uppercase text-sm sm:text-base font-bold text-white tracking-wider">
                      3. RESTOCK REQUESTS
                    </div>
                    <div className="text-xs text-[#888888] mt-1 leading-snug">
                      {restockRequests.length} {restockRequests.length === 1 ? 'manifestação' : 'manifestações'} de interesse
                    </div>
                  </button>
                </div>
              );
            })()}

            {/* Actions & Filters for Orders (Pre-Orders or Regular Orders) */}
            {ordersCategory !== 'restock_requests' && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0d0d] p-3 rounded-lg border border-[#1f1f1f]">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={
                      ordersCategory === 'pre_orders'
                        ? 'Pesquisar pre-orders por código, cliente ou telefone...'
                        : 'Pesquisar pedidos regulares por código, cliente ou telefone...'
                    }
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white placeholder-[#555555] font-sans w-full"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white font-sans"
                >
                  <option value="all">Todos os Estados</option>
                  {(ordersCategory === 'pre_orders' ? PRE_ORDER_STATUSES : REGULAR_ORDER_STATUSES).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Orders Management: 1. PRE-ORDERS | 2. ORDERS | 3. RESTOCK REQUESTS */}
            {ordersCategory === 'restock_requests' ? (
              <div className="space-y-6 font-sans">
                {/* Banner Cápsula do Tempo */}
                <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <BellRing className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-white font-bold block uppercase tracking-wider text-xs">
                        3. RESTOCK REQUESTS — MEDIÇÃO DE PROCURA (CÁPSULA DO TEMPO)
                      </span>
                      <p className="text-[#999999] text-[11px] mt-0.5 leading-relaxed">
                        Manifestações de interesse de clientes em peças arquivadas da Cápsula do Tempo. NÃO são compras nem reservas (sem recolha de tamanhos nem de pagamento). O objetivo é estudar a procura antes de decidir produzir novamente. Se decidir produzir, ative o botão Pre-Order no produto correspondente.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/80 shrink-0">
                    {restockRequests.length} Interessados
                  </span>
                </div>

                {/* Resumo de Procura por Peça / Coleção (Estudo de Mercado) */}
                {(() => {
                  const demandByProduct = restockRequests.reduce((acc, req) => {
                    const key = req.product_id || req.product_name;
                    if (!acc[key]) {
                      acc[key] = {
                        product_id: req.product_id,
                        product_name: req.product_name,
                        collection_name: req.collection_name || 'Cápsula do Tempo',
                        count: 0,
                        requests: [] as RestockRequest[],
                      };
                    }
                    acc[key].count += 1;
                    acc[key].requests.push(req);
                    return acc;
                  }, {} as Record<string, { product_id: string; product_name: string; collection_name: string; count: number; requests: RestockRequest[] }>);

                  const sortedDemand = Object.values(demandByProduct).sort((a, b) => b.count - a.count);

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs uppercase font-display tracking-wider text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-400" />
                          <span>Estudo de Procura por Peça ({sortedDemand.length} Peças com Interesse Mapeado)</span>
                        </h3>
                        <span className="text-[10px] text-[#777777]">
                          Utilize estes dados para decidir quando abrir Pre-Order
                        </span>
                      </div>

                      {sortedDemand.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#777777] bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg">
                          Nenhuma manifestação de interesse registada até ao momento na Cápsula do Tempo.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sortedDemand.map((item) => {
                            const matchedProduct = products.find(
                              (p) => p.id === item.product_id || p.name.toLowerCase() === item.product_name.toLowerCase()
                            );

                            return (
                              <div
                                key={item.product_id || item.product_name}
                                className="p-4 bg-[#0e0e0e] border border-[#222222] rounded-xl space-y-3 shadow-lg"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-14 bg-[#141414] rounded overflow-hidden shrink-0 border border-[#262626] flex items-center justify-center">
                                    {matchedProduct && matchedProduct.images && matchedProduct.images[0] ? (
                                      <img
                                        src={matchedProduct.images[0]}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Archive className="w-5 h-5 text-[#555555]" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#666666] block truncate">
                                      {item.collection_name}
                                    </span>
                                    <h4 className="font-display uppercase text-sm text-white font-bold tracking-wider truncate mt-0.5">
                                      {item.product_name}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-1.5">
                                      <span className="text-amber-400 font-mono font-bold text-xs">
                                        {item.count} {item.count === 1 ? 'pessoa interessada' : 'pessoas demonstraram interesse'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-[#1c1c1c] flex items-center justify-between gap-2">
                                  {matchedProduct && matchedProduct.enable_pre_order ? (
                                    <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded">
                                      PRE-ORDER JÁ ATIVO
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (matchedProduct) {
                                          handleQuickActivatePreOrder(matchedProduct.id);
                                        } else {
                                          showToast('Peça não encontrada no catálogo para ativar pre-order.');
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase rounded text-[10px] tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                                    >
                                      <Clock className="w-3 h-3 text-black" />
                                      <span>Ativar Pre-Order</span>
                                    </button>
                                  )}

                                  {matchedProduct && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingProduct(matchedProduct)}
                                      className="text-[10px] text-[#888888] hover:text-white underline font-mono cursor-pointer"
                                    >
                                      Editar Ficha
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Filtros para Registos de Restock */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0d0d] p-3 rounded-lg border border-[#1f1f1f]">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome, telefone, peça ou coleção..."
                      value={restockSearch}
                      onChange={(e) => setRestockSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white placeholder-[#555555] font-sans"
                    />
                  </div>

                  <select
                    value={restockStatusFilter}
                    onChange={(e) => setRestockStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white font-sans"
                  >
                    <option value="all">Todos os Estados</option>
                    <option value="Interesse Registado">Interesse Registado</option>
                    <option value="Pendente de Avaliação">Pendente de Avaliação</option>
                    <option value="Aprovado para Produção">Aprovado para Produção</option>
                    <option value="Contactado">Contactado via WhatsApp</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>

                {/* Tabela e Cards Móveis de Restock */}
                {(() => {
                  const filteredRestock = restockRequests.filter((r) => {
                    const matchQ =
                      !restockSearch ||
                      (r.customer_name && r.customer_name.toLowerCase().includes(restockSearch.toLowerCase())) ||
                      r.customer_phone.toLowerCase().includes(restockSearch.toLowerCase()) ||
                      r.product_name.toLowerCase().includes(restockSearch.toLowerCase()) ||
                      (r.collection_name && r.collection_name.toLowerCase().includes(restockSearch.toLowerCase()));
                    const matchS = restockStatusFilter === 'all' || r.status === restockStatusFilter;
                    return matchQ && matchS;
                  });

                  return (
                    <div className="space-y-4">
                      {/* Mobile Cards */}
                      <div className="block md:hidden space-y-3">
                        {filteredRestock.length === 0 ? (
                          <div className="p-8 text-center text-xs text-[#777777] bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg">
                            Nenhum pedido de restock encontrado.
                          </div>
                        ) : (
                          filteredRestock.map((req) => {
                            const cleanPhone = req.customer_phone.replace(/\D/g, '');
                            const msg = encodeURIComponent(
                              `Olá ${req.customer_name || ''}! Estamos a entrar em contacto da Wearing Unusual sobre o teu interesse na reposição da peça "${req.product_name}". Já estamos a planear a reabertura de produção!`
                            );

                            return (
                              <div
                                key={req.id}
                                className="p-4 bg-[#0e0e0e] border border-[#222222] rounded-lg space-y-3"
                              >
                                <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#1c1c1c]">
                                  <div>
                                    <span className="text-[10px] text-[#666666] uppercase block font-mono">
                                      {req.collection_name || 'Cápsula do Tempo'}
                                    </span>
                                    <span className="font-display uppercase text-sm font-bold text-white block mt-0.5">
                                      {req.product_name}
                                    </span>
                                    <span className="text-[10px] text-[#777777] block mt-0.5">
                                      {formatDate(req.created_at)} • {req.language ? req.language.toUpperCase() : 'PT'}
                                    </span>
                                  </div>

                                  <select
                                    value={req.status || 'Interesse Registado'}
                                    onChange={async (e) => {
                                      await updateRestockStatus(req.id, e.target.value);
                                      showToast('Estado atualizado!');
                                    }}
                                    className="text-[10px] px-2 py-1 bg-[#161616] border border-[#2c2c2c] text-amber-300 rounded font-sans"
                                  >
                                    <option value="Interesse Registado">Interesse Registado</option>
                                    <option value="Pendente de Avaliação">Pendente de Avaliação</option>
                                    <option value="Aprovado para Produção">Aprovado para Produção</option>
                                    <option value="Contactado">Contactado</option>
                                    <option value="Arquivado">Arquivado</option>
                                  </select>
                                </div>

                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[#888888] uppercase text-[10px]">Cliente:</span>
                                    <span className="text-white font-medium">{req.customer_name || 'Anónimo'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[#888888] uppercase text-[10px]">WhatsApp:</span>
                                    <a
                                      href={`https://wa.me/${cleanPhone}?text=${msg}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 hover:underline font-mono inline-flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{req.customer_phone}</span>
                                    </a>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-[#1c1c1c] flex items-center justify-between gap-2">
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${msg}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-1.5 bg-[#181818] hover:bg-emerald-950 text-emerald-400 border border-emerald-900/60 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm('Eliminar esta manifestação de interesse?')) {
                                        await deleteRestockRequest(req.id);
                                        showToast('Registo eliminado!');
                                      }
                                    }}
                                    className="p-1.5 text-[#666666] hover:text-red-400 rounded bg-[#141414] border border-[#222222]"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden md:block bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg overflow-hidden shadow-xl">
                        <table className="w-full text-left font-sans text-xs">
                          <thead className="bg-[#141414] text-[#888888] uppercase text-[10px] tracking-wider border-b border-[#222222]">
                            <tr>
                              <th className="py-3.5 px-4">DATA & IDIOMA</th>
                              <th className="py-3.5 px-4">CLIENTE & WHATSAPP</th>
                              <th className="py-3.5 px-4">PEÇA ARQUIVADA & COLEÇÃO</th>
                              <th className="py-3.5 px-4">ESTADO</th>
                              <th className="py-3.5 px-4 text-right">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#181818]">
                            {filteredRestock.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-xs text-[#777777]">
                                  Nenhum pedido de restock registado com estes filtros.
                                </td>
                              </tr>
                            ) : (
                              filteredRestock.map((req) => {
                                const cleanPhone = req.customer_phone.replace(/\D/g, '');
                                const msg = encodeURIComponent(
                                  `Olá ${req.customer_name || ''}! Estamos a entrar em contacto da Wearing Unusual sobre o teu interesse na reposição da peça "${req.product_name}". Já estamos a planear a reabertura de produção!`
                                );

                                return (
                                  <tr key={req.id} className="hover:bg-[#141414] transition-colors">
                                    <td className="py-4 px-4 align-top">
                                      <span className="text-white block font-mono text-xs">
                                        {formatDate(req.created_at)}
                                      </span>
                                      <span className="text-[10px] text-[#777777] block mt-0.5 font-mono">
                                        Idioma: {req.language ? req.language.toUpperCase() : 'PT'}
                                      </span>
                                    </td>

                                    <td className="py-4 px-4 align-top">
                                      <span className="text-white font-semibold block text-xs">
                                        {req.customer_name || 'Anónimo / Não informado'}
                                      </span>
                                      <a
                                        href={`https://wa.me/${cleanPhone}?text=${msg}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-400 hover:underline text-[11px] inline-flex items-center gap-1 font-mono mt-0.5"
                                        title="Abrir WhatsApp com mensagem automática"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>{req.customer_phone}</span>
                                      </a>
                                    </td>

                                    <td className="py-4 px-4 align-top">
                                      <span className="text-[10px] text-[#777777] uppercase block font-mono">
                                        {req.collection_name || 'Cápsula do Tempo'}
                                      </span>
                                      <span className="text-white font-display uppercase tracking-wider block font-bold text-xs mt-0.5">
                                        {req.product_name}
                                      </span>
                                    </td>

                                    <td className="py-4 px-4 align-top">
                                      <select
                                        value={req.status || 'Interesse Registado'}
                                        onChange={async (e) => {
                                          await updateRestockStatus(req.id, e.target.value);
                                          showToast('Estado do pedido de reposição atualizado!');
                                        }}
                                        className="px-2.5 py-1.5 bg-[#161616] hover:bg-[#202020] border border-[#2e2e2e] rounded text-xs font-semibold text-amber-300 cursor-pointer focus:outline-none"
                                      >
                                        <option value="Interesse Registado">Interesse Registado</option>
                                        <option value="Pendente de Avaliação">Pendente de Avaliação</option>
                                        <option value="Aprovado para Produção">Aprovado para Produção</option>
                                        <option value="Contactado">Contactado</option>
                                        <option value="Arquivado">Arquivado</option>
                                      </select>
                                    </td>

                                    <td className="py-4 px-4 align-top text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <a
                                          href={`https://wa.me/${cleanPhone}?text=${msg}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-emerald-950 text-emerald-400 border border-emerald-900/60 rounded text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
                                          title="Contactar no WhatsApp"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>WhatsApp</span>
                                        </a>

                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (window.confirm(`Eliminar pedido de interesse de "${req.customer_name || req.customer_phone}"?`)) {
                                              await deleteRestockRequest(req.id);
                                              showToast('Registo de interesse eliminado!');
                                            }
                                          }}
                                          className="p-1.5 bg-[#1a1414] hover:bg-red-900/80 border border-red-900/40 text-red-400 hover:text-white rounded transition-colors"
                                          title="Eliminar registo"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              (() => {
                const targetOrders = ordersCategory === 'pre_orders'
                  ? orders.filter((o) => o.order_type === 'pre_order' || o.is_pre_order || (o.items && o.items.some((i) => i.is_pre_order)))
                  : orders.filter((o) => !o.is_pre_order && o.order_type !== 'pre_order' && (!o.items || !o.items.some((i) => i.is_pre_order)));

                const filteredOrders = targetOrders.filter((o) => {
                  const matchQ =
                    !orderSearch ||
                    o.tracking_code.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.customer_phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    (o.customer_city && o.customer_city.toLowerCase().includes(orderSearch.toLowerCase()));
                  const normalizedStatus =
                    o.status === 'Pedido Confirmado' || o.status === 'Pendente de Verificação'
                      ? 'Pendente'
                      : o.status === 'Em Produção/Trânsito'
                      ? 'Em Trânsito'
                      : o.status;
                  const matchS =
                    orderStatusFilter === 'all' ||
                    o.status === orderStatusFilter ||
                    normalizedStatus === orderStatusFilter;
                  return matchQ && matchS;
                });

                return (
                  <div className="space-y-4">
                    {/* Category Informational Banner */}
                    {ordersCategory === 'pre_orders' ? (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <span className="font-bold text-amber-300 uppercase tracking-wider block">
                              1. PRE-ORDERS — ENCOMENDAS REAIS (PRODUÇÃO CONFIRMADA)
                            </span>
                            <span className="text-[#999999] text-[11px]">
                              Peças que o administrador decidiu produzir. Encomendas reais com pagamento Multicaixa Express e prioridade de despacho.
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-amber-300 text-xs font-bold px-2 py-0.5 rounded bg-black/60 border border-amber-500/30 shrink-0">
                          {filteredOrders.length} {filteredOrders.length === 1 ? 'Encomenda' : 'Encomendas'}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-[#141414] border border-[#262626] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
                        <div className="flex items-center gap-2.5">
                          <PackageCheck className="w-4 h-4 text-white shrink-0" />
                          <div>
                            <span className="font-bold text-white uppercase tracking-wider block">
                              2. ORDERS — VENDAS REGULARES DA LOJA
                            </span>
                            <span className="text-[#888888] text-[11px]">
                              Pedidos normais de peças disponíveis em stock da loja pública.
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-white text-xs font-bold px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#333333] shrink-0">
                          {filteredOrders.length} {filteredOrders.length === 1 ? 'Pedido' : 'Pedidos'}
                        </span>
                      </div>
                    )}
                  {/* MOBILE CARDS VIEW */}
                  <div className="block md:hidden space-y-3 font-sans">
                    {filteredOrders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#777777] bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg">
                        Nenhuma encomenda encontrada com os filtros selecionados.
                      </div>
                    ) : (
                      filteredOrders.map((order) => {
                        const isThisPreOrder =
                          order.order_type === 'pre_order' ||
                          order.is_pre_order ||
                          Boolean(order.items && order.items.some((i) => i.is_pre_order));

                        const statusOptions = isThisPreOrder ? PRE_ORDER_STATUSES : REGULAR_ORDER_STATUSES;

                        const isPaymentVerified =
                          order.status === 'PAYMENT VERIFIED' ||
                          order.status === 'Aprovado' ||
                          order.status === 'IN PRODUCTION' ||
                          order.status === 'READY FOR DELIVERY' ||
                          order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY' ||
                          order.status === 'DELIVERY SCHEDULED' ||
                          order.status === 'OUT FOR DELIVERY' ||
                          order.status === 'DELIVERED';

                        return (
                          <div
                            key={order.id}
                            className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-4 space-y-3.5 shadow-lg"
                          >
                            {/* Card Header: Order Type + Order Number + Status + Date */}
                            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#1c1c1c]">
                              <div>
                                <span
                                  className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-1 ${
                                    isThisPreOrder
                                      ? 'bg-amber-400 text-black'
                                      : 'bg-white text-black'
                                  }`}
                                >
                                  {isThisPreOrder ? 'PRE-ORDER' : 'REGULAR ORDER'}
                                </span>
                                <span className="text-[10px] text-[#666666] uppercase tracking-wider block">
                                  ORDER NUMBER
                                </span>
                                <span className="font-mono font-bold text-white text-base tracking-wider block">
                                  {order.tracking_code}
                                </span>
                                <span className="text-[10px] text-[#777777] block mt-0.5">
                                  {formatDate(order.created_at)}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-center shrink-0 ${
                                  order.status === 'DELIVERED' || order.status === 'Entregue'
                                    ? 'bg-white text-black'
                                    : order.status === 'OUT FOR DELIVERY' || order.status === 'Em Trânsito'
                                    ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                    : order.status === 'DELIVERY SCHEDULED'
                                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                    : order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY' || order.status === 'READY FOR DELIVERY'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse'
                                    : order.status === 'IN PRODUCTION'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : order.status === 'PAYMENT VERIFIED' || order.status === 'Aprovado'
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                                    : order.status === 'CANCELLED' || order.status === 'Cancelado'
                                    ? 'bg-red-950 text-red-300 border border-red-800'
                                    : 'bg-[#181818] text-[#cccccc] border border-[#333333]'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>

                            {/* Customer details */}
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[#888888] uppercase text-[10px]">Cliente:</span>
                                <span className="text-white font-semibold">{order.customer_name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[#888888] uppercase text-[10px]">Contacto:</span>
                                <a
                                  href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:underline text-xs inline-flex items-center gap-1 font-mono font-medium"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{order.customer_phone}</span>
                                </a>
                              </div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[#888888] uppercase text-[10px] shrink-0">Entrega:</span>
                                <span className="text-[#cccccc] text-right leading-snug">
                                  {order.customer_city || order.customer_address}
                                </span>
                              </div>
                            </div>

                            {/* Payment Status & Delivery Date Section */}
                            <div className="p-2.5 bg-[#121212] border border-[#222222] rounded space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-[#888888] uppercase">Payment Status:</span>
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                    isPaymentVerified
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : order.payment_proof_url
                                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                      : 'bg-[#1a1a1a] text-[#888888]'
                                  }`}
                                >
                                  {isPaymentVerified
                                    ? 'VERIFICADO ✓'
                                    : order.payment_proof_url
                                    ? 'COMPROVATIVO ANEXADO'
                                    : 'PENDENTE'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-[#888888] uppercase">Delivery Date:</span>
                                <span className="font-mono text-[11px] text-white font-semibold">
                                  {order.scheduled_delivery_date ? (
                                    <span className="text-emerald-300 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-emerald-400" />
                                      <span>
                                        {order.scheduled_delivery_date}
                                        {order.delivery_window ? ` (${order.delivery_window})` : ''}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-[#777777] italic">
                                      {order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY'
                                        ? 'Pronto para agendamento'
                                        : 'Aguardando agendamento'}
                                    </span>
                                  )}
                                </span>
                              </div>

                              {/* Pre-Order WhatsApp Notification Status & Trigger */}
                              {isThisPreOrder && (
                                <div className="pt-2 border-t border-[#1c1c1c] space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-[#888888] uppercase">WhatsApp Status:</span>
                                    {order.whatsapp_notification_sent ? (
                                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-bold flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        <span>Enviado ({formatDate(order.whatsapp_notification_sent_at || '')})</span>
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-mono text-[#777777] bg-[#1a1a1a] px-2 py-0.5 rounded">
                                        Não enviado
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSendWhatsAppNotification(order)}
                                    className={`w-full py-2 px-3 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                                      order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY'
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                                        : 'bg-[#181818] hover:bg-[#222222] text-[#cccccc] hover:text-white border border-[#333333]'
                                    }`}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>ENVIAR WHATSAPP</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Items & Total */}
                            <div className="bg-[#141414] border border-[#222222] rounded p-2.5 space-y-1 text-xs">
                              <div className="text-[#999999] text-[11px] space-y-1">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="truncate pr-2 text-white">
                                      {it.name} <span className="text-[#777777]">({it.size})</span>
                                    </span>
                                    <span className="text-[#888888] shrink-0 font-mono">x{it.quantity || 1}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-[#1f1f1f] flex justify-between items-center text-xs">
                                <span className="text-[#888888] uppercase font-semibold">Total a Pagar:</span>
                                <span className="text-white font-mono font-bold text-sm">
                                  {formatAOA(order.total_aoa)}
                                </span>
                              </div>
                            </div>

                            {/* Quick Status Selector & Proof Button */}
                            <div className="space-y-2 pt-1">
                              <div>
                                <label className="block text-[10px] text-[#777777] uppercase mb-1">
                                  Alterar Estado:
                                </label>
                                <select
                                  value={order.status}
                                  onChange={async (e) => {
                                    const nextStatus = e.target.value as OrderStatus;
                                    await updateOrderStatus(order.id, nextStatus);
                                    showToast(`Estado de ${order.tracking_code} atualizado para ${nextStatus}!`);
                                  }}
                                  className="w-full px-3 py-2.5 bg-[#161616] border border-[#2e2e2e] rounded text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white"
                                >
                                  {statusOptions.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {order.payment_proof_url && order.payment_proof_url.trim() !== '' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenProof(order.payment_proof_url, `Comprovativo — ${order.tracking_code}`)}
                                    className="py-2.5 px-3 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Comprovativo</span>
                                  </button>
                                ) : (
                                  <span className="py-2.5 px-3 text-[11px] text-[#666666] bg-[#141414] border border-[#222222] rounded flex items-center justify-center">
                                    Sem Anexo
                                  </span>
                                )}

                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex-1 py-2.5 px-3 bg-[#1f1f1f] hover:bg-white hover:text-black rounded text-[11px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Inspecionar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const confirmed = window.confirm(
                                        `Tem a certeza que deseja eliminar a encomenda ${order.tracking_code}?`
                                      );
                                      if (!confirmed) return;
                                      await deleteOrder(order.id);
                                      showToast(`Encomenda ${order.tracking_code} eliminada!`);
                                    }}
                                    title="Eliminar Encomenda"
                                    className="p-2.5 bg-[#1a1414] hover:bg-red-900/80 border border-red-900/40 hover:border-red-600 text-red-400 hover:text-white rounded transition-colors flex items-center justify-center cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs">
                        <thead className="bg-[#141414] text-[#888888] uppercase text-[10px] tracking-wider border-b border-[#222222]">
                          <tr>
                            <th className="py-3.5 px-4">ORDER TYPE & NUMBER</th>
                            <th className="py-3.5 px-4">CLIENTE & CONTACTO</th>
                            <th className="py-3.5 px-4">CURRENT STATUS</th>
                            <th className="py-3.5 px-4">PAYMENT STATUS</th>
                            <th className="py-3.5 px-4">DELIVERY DATE</th>
                            {ordersCategory === 'pre_orders' ? (
                              <th className="py-3.5 px-4">WHATSAPP NOTIFICATION</th>
                            ) : (
                              <th className="py-3.5 px-4">ITENS & TOTAL</th>
                            )}
                            <th className="py-3.5 px-4 text-right">AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#181818]">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-xs text-[#777777]">
                                Nenhuma encomenda encontrada com os filtros selecionados.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => {
                              const isThisPreOrder =
                                order.order_type === 'pre_order' ||
                                order.is_pre_order ||
                                Boolean(order.items && order.items.some((i) => i.is_pre_order));

                              const statusOptions = isThisPreOrder ? PRE_ORDER_STATUSES : REGULAR_ORDER_STATUSES;

                              const isPaymentVerified =
                                order.status === 'PAYMENT VERIFIED' ||
                                order.status === 'Aprovado' ||
                                order.status === 'IN PRODUCTION' ||
                                order.status === 'READY FOR DELIVERY' ||
                                order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY' ||
                                order.status === 'DELIVERY SCHEDULED' ||
                                order.status === 'OUT FOR DELIVERY' ||
                                order.status === 'DELIVERED';

                              return (
                                <tr
                                  key={order.id}
                                  onClick={() => setSelectedOrder(order)}
                                  className="hover:bg-[#141414] cursor-pointer transition-colors"
                                >
                                  {/* 1. ORDER TYPE & NUMBER */}
                                  <td className="py-4 px-4 align-top">
                                    <span
                                      className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1 ${
                                        isThisPreOrder
                                          ? 'bg-amber-400 text-black'
                                          : 'bg-white text-black'
                                      }`}
                                    >
                                      {isThisPreOrder ? 'PRE-ORDER' : 'REGULAR'}
                                    </span>
                                    <span className="font-mono font-bold text-white text-sm tracking-wider block">
                                      {order.tracking_code}
                                    </span>
                                    <span className="text-[10px] text-[#777777] block mt-0.5">
                                      {formatDate(order.created_at)}
                                    </span>
                                  </td>

                                  {/* 2. CLIENTE & CONTACTO */}
                                  <td className="py-4 px-4 align-top max-w-xs">
                                    <span className="text-white font-semibold block text-xs">{order.customer_name}</span>
                                    <a
                                      href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-emerald-400 hover:underline text-[11px] inline-flex items-center gap-1 font-mono mt-0.5"
                                      title="Abrir conversa no WhatsApp"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{order.customer_phone}</span>
                                    </a>
                                    <span className="text-[#888888] text-[11px] block mt-1 leading-snug">
                                      {order.customer_address || order.customer_city}
                                    </span>
                                    {(order.customer_reference || order.customer_notes) && (
                                      <span className="text-[#666666] text-[10px] italic block mt-0.5">
                                        Ref: {order.customer_reference || order.customer_notes}
                                      </span>
                                    )}
                                  </td>

                                  {/* 3. CURRENT STATUS */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="flex flex-col gap-1.5">
                                      <select
                                        value={order.status}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={async (e) => {
                                          e.stopPropagation();
                                          const nextStatus = e.target.value as OrderStatus;
                                          await updateOrderStatus(order.id, nextStatus);
                                          showToast(`Estado de ${order.tracking_code} atualizado para ${nextStatus}!`);
                                        }}
                                        className="px-2.5 py-1.5 bg-[#161616] hover:bg-[#202020] border border-[#2e2e2e] rounded text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                                      >
                                        {statusOptions.map((st) => (
                                          <option key={st} value={st}>
                                            {st}
                                          </option>
                                        ))}
                                      </select>
                                      <span
                                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-center ${
                                          order.status === 'DELIVERED' || order.status === 'Entregue'
                                            ? 'bg-white text-black'
                                            : order.status === 'OUT FOR DELIVERY' || order.status === 'Em Trânsito'
                                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                            : order.status === 'DELIVERY SCHEDULED'
                                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                            : order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY' || order.status === 'READY FOR DELIVERY'
                                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                            : order.status === 'IN PRODUCTION'
                                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                            : order.status === 'PAYMENT VERIFIED' || order.status === 'Aprovado'
                                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                                            : order.status === 'CANCELLED' || order.status === 'Cancelado'
                                            ? 'bg-red-950 text-red-300 border border-red-800'
                                            : 'bg-[#181818] text-[#cccccc] border border-[#333333]'
                                        }`}
                                      >
                                        {order.status}
                                      </span>
                                    </div>
                                  </td>

                                  {/* 4. PAYMENT STATUS */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="space-y-1.5">
                                      <span
                                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded inline-block ${
                                          isPaymentVerified
                                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                            : order.payment_proof_url
                                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                            : 'bg-[#1a1a1a] text-[#888888]'
                                        }`}
                                      >
                                        {isPaymentVerified
                                          ? 'VERIFICADO ✓'
                                          : order.payment_proof_url
                                          ? 'COMPROVATIVO ANEXADO'
                                          : 'PENDENTE'}
                                      </span>

                                      {order.payment_proof_url && order.payment_proof_url.trim() !== '' ? (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenProof(order.payment_proof_url, `Comprovativo — ${order.tracking_code}`);
                                          }}
                                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/80 px-2 py-1 rounded transition-colors shadow-sm cursor-pointer block"
                                          title="Abrir comprovativo em tamanho real"
                                        >
                                          <FileCheck className="w-3 h-3 text-emerald-400" />
                                          <span>COMPROVATIVO</span>
                                        </button>
                                      ) : null}
                                    </div>
                                  </td>

                                  {/* 5. DELIVERY DATE */}
                                  <td className="py-4 px-4 align-top">
                                    {order.scheduled_delivery_date ? (
                                      <div className="space-y-0.5">
                                        <span className="font-mono text-xs font-bold text-white flex items-center gap-1">
                                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>{order.scheduled_delivery_date}</span>
                                        </span>
                                        {order.delivery_window && (
                                          <span className="text-[10px] text-[#888888] font-mono block">
                                            {order.delivery_window}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-[#666666] italic">
                                        {order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY'
                                          ? 'Pronto para agendamento'
                                          : 'Aguardando agendamento'}
                                      </span>
                                    )}
                                  </td>

                                  {/* 6. WHATSAPP NOTIFICATION (PRE-ORDERS) / ITENS (REGULAR) */}
                                  {ordersCategory === 'pre_orders' ? (
                                    <td className="py-4 px-4 align-top">
                                      <div className="space-y-1.5">
                                        {order.whatsapp_notification_sent ? (
                                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-bold inline-flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            <span>Enviado ({formatDate(order.whatsapp_notification_sent_at || '')})</span>
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-mono text-[#777777] bg-[#181818] px-2 py-0.5 rounded block w-fit">
                                            Não enviado
                                          </span>
                                        )}

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSendWhatsAppNotification(order);
                                          }}
                                          className={`py-1.5 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow cursor-pointer ${
                                            order.status === 'PRODUCTION COMPLETED / READY FOR DELIVERY'
                                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                                              : 'bg-[#181818] hover:bg-[#252525] text-[#cccccc] hover:text-white border border-[#333333]'
                                          }`}
                                          title="Enviar notificação oficial no WhatsApp"
                                        >
                                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                                          <span>ENVIAR WHATSAPP</span>
                                        </button>
                                      </div>
                                    </td>
                                  ) : (
                                    <td className="py-4 px-4 align-top">
                                      <div className="text-[#aaaaaa] text-[11px] space-y-0.5">
                                        {order.items.map((it, idx) => (
                                          <div key={idx} className="truncate max-w-[180px]">
                                            {it.name} <span className="text-[#777777]">({it.size}) x{it.quantity || 1}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <span className="font-mono font-bold text-white block mt-1 text-xs">
                                        {formatAOA(order.total_aoa)}
                                      </span>
                                    </td>
                                  )}

                                  {/* 7. AÇÕES */}
                                  <td className="py-4 px-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedOrder(order);
                                        }}
                                        className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-white hover:text-black rounded text-[11px] uppercase tracking-wider font-semibold transition-colors shadow-sm cursor-pointer"
                                      >
                                        Inspecionar
                                      </button>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const confirmed = window.confirm(
                                            `Tem a certeza que deseja eliminar a encomenda ${order.tracking_code}?`
                                          );
                                          if (!confirmed) return;
                                          await deleteOrder(order.id);
                                          showToast(`Encomenda ${order.tracking_code} eliminada!`);
                                        }}
                                        title="Eliminar Encomenda"
                                        className="p-1.5 bg-[#1a1414] hover:bg-red-900/80 border border-red-900/40 hover:border-red-600 text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })())}

            {/* Order Inspection Modal */}
            {selectedOrder && (
              <div
                id="order-inspector-backdrop"
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                onClick={(e) => {
                  if ((e.target as HTMLElement).id === 'order-inspector-backdrop') {
                    setSelectedOrder(null);
                  }
                }}
              >
                <div className="w-full max-w-2xl bg-[#0c0c0c] border border-[#222222] rounded-xl p-4 sm:p-6 space-y-6 shadow-2xl my-auto overflow-y-auto max-h-[90vh] overscroll-contain">
                  {/* Top */}
                  <div className="sticky top-0 bg-[#0c0c0c]/95 backdrop-blur-md z-20 -mt-2 pt-2 pb-4 border-b border-[#1c1c1c] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase tracking-widest block">
                        INSPEÇÃO DE ENCOMENDA
                      </span>
                      <h3 className="font-mono text-lg sm:text-xl font-bold text-white tracking-widest mt-0.5">
                        {selectedOrder.tracking_code}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1.5 text-[#777777] hover:text-white rounded bg-[#161616]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Status Changer Motor */}
                  <div className="bg-[#121212] border border-[#222222] rounded-lg p-4 space-y-3 font-sans text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#aaaaaa] uppercase tracking-wider font-semibold block">
                        ESTADO DA ENCOMENDA & INSTRUÇÕES DA LINHA DO TEMPO
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        REFLETE AO VIVO NO CLIENTE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(selectedOrder.order_type === 'pre_order' || selectedOrder.is_pre_order
                        ? PRE_ORDER_STATUSES
                        : REGULAR_ORDER_STATUSES
                      ).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStatusForInspector(st)}
                          className={`py-2 px-2 text-[10px] font-bold uppercase rounded border transition-all ${
                            selectedStatusForInspector === st
                              ? 'bg-white text-black border-white shadow-md ring-2 ring-white/30'
                              : 'bg-[#181818] text-[#888888] border-[#292929] hover:text-white hover:bg-[#202020]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#cccccc] mb-1 font-semibold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Instruções ou Notas a Submeter (Aparecem no Rastreamento do Cliente):</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ex: Encomenda em trânsito com estafeta João (Carro Toyota Preto, LD-22-33). Entraremos em contacto antes da entrega."
                        value={statusUpdateNote}
                        onChange={(e) => setStatusUpdateNote(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2e2e2e] rounded text-white text-xs font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none leading-relaxed"
                      />
                      <span className="text-[10px] text-[#777777] block mt-1">
                        Depois de preencher as instruções ou selecionar o estado, clique em <strong>Salvar</strong> para gravar e refletir imediatamente no ecrã de rastreamento do cliente.
                      </span>
                    </div>

                    {/* BOTÃO SALVAR SOLICITADO PELO UTILIZADOR */}
                    <div className="pt-3 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-[#888888]">
                        Estado selecionado: <strong className="text-white px-2 py-0.5 bg-[#1b1b1b] border border-[#333] rounded">{selectedStatusForInspector}</strong>
                      </div>

                      <button
                        type="button"
                        disabled={isSavingOrderStatus}
                        onClick={async () => {
                          setIsSavingOrderStatus(true);
                          try {
                            await updateOrderStatus(selectedOrder.id, selectedStatusForInspector, statusUpdateNote);
                            setSelectedOrder((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    status: selectedStatusForInspector,
                                    admin_notes: statusUpdateNote,
                                  }
                                : null
                            );
                            showToast(`Instrução e estado (${selectedStatusForInspector}) guardados com sucesso!`);
                          } catch {
                            showToast('Erro ao guardar alterações.');
                          } finally {
                            setIsSavingOrderStatus(false);
                          }
                        }}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingOrderStatus ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Proof Viewer */}
                  {selectedOrder.payment_proof_url && selectedOrder.payment_proof_url.trim() !== '' ? (
                    <div className="space-y-2 font-sans">
                      <span className="text-[10px] text-[#888888] uppercase tracking-widest block">
                        COMPROVATIVO DE PAGAMENTO ANEXADO:
                      </span>
                      <div className="p-4 bg-[#111111] border border-[#222222] rounded-lg flex flex-col sm:flex-row items-center gap-4">
                        <div
                          onClick={() => handleOpenProof(selectedOrder.payment_proof_url, `Comprovativo — ${selectedOrder.tracking_code}`)}
                          className="w-32 h-36 bg-black rounded border border-[#333333] overflow-hidden shrink-0 flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
                          title="Clique para ampliar"
                        >
                          {selectedOrder.payment_proof_url.startsWith('data:application/pdf') || selectedOrder.payment_proof_url.toLowerCase().includes('.pdf') ? (
                            <div className="flex flex-col items-center justify-center text-red-400 gap-1 p-2 text-center">
                              <FileCheck className="w-8 h-8" />
                              <span className="text-[10px] font-mono">Ficheiro PDF</span>
                            </div>
                          ) : (
                            <img
                              src={selectedOrder.payment_proof_url}
                              alt="Comprovativo"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="space-y-2.5 text-xs font-sans flex-1 w-full">
                          <p className="text-[#a0a0a0] text-xs leading-relaxed">
                            Comprovativo de transferência Multicaixa Express anexado pelo cliente no checkout.
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenProof(selectedOrder.payment_proof_url, `Comprovativo — ${selectedOrder.tracking_code}`)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold uppercase tracking-wider transition-colors shadow cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Abrir Comprovativo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadProof(selectedOrder.payment_proof_url, `comprovativo_${selectedOrder.tracking_code}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#cccccc] rounded text-[11px] font-medium transition-colors border border-[#333333] cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descarregar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedOrder.payment_proof_url || '');
                                showToast('Link do comprovativo copiado!');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#cccccc] rounded text-[11px] font-medium transition-colors border border-[#333333] cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Link</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#141414] border border-[#222222] rounded text-xs text-[#777777] font-sans">
                      Nenhum comprovativo fotográfico foi anexado para esta encomenda.
                    </div>
                  )}

                  {/* Ordered Items Breakdown */}
                  <div className="space-y-2.5 font-sans">
                    <span className="text-[10px] text-[#888888] uppercase tracking-widest block font-sans">
                      ARTIGOS ENCOMENDADOS ({selectedOrder.items.length}):
                    </span>
                    <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-3 divide-y divide-[#1c1c1c] text-xs">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {item.image_url && item.image_url.trim() !== '' ? (
                              <img
                                src={item.image_url.trim()}
                                alt={item.name}
                                className="w-10 h-12 object-cover rounded bg-black shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-12 bg-black rounded flex items-center justify-center shrink-0 border border-[#222]">
                                <PackageCheck className="w-4 h-4 text-[#555]" />
                              </div>
                            )}
                            <div>
                              <span className="text-white font-semibold block">{item.name}</span>
                              <span className="text-[#777777] text-[11px]">
                                Tam: <strong className="text-[#ccc]">{item.size}</strong> • Cor: <strong className="text-[#ccc]">{item.color}</strong> • Qtd: {item.quantity || 1}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-white text-xs whitespace-nowrap">
                            {formatAOA(item.price_aoa * (item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                      <div className="pt-3 flex items-center justify-between text-xs">
                        <span className="text-[#888888] uppercase font-semibold">TOTAL GERAL:</span>
                        <span className="text-white font-mono font-bold text-sm">
                          {formatAOA(selectedOrder.total_aoa)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans bg-[#111111] p-4 rounded-lg border border-[#1f1f1f]">
                    <div>
                      <span className="text-[#666666] text-[10px] uppercase block">CLIENTE</span>
                      <span className="text-white font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] text-[10px] uppercase block">TELEFONE / WHATSAPP</span>
                      <a
                        href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 font-medium hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{selectedOrder.customer_phone}</span>
                      </a>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#666666] text-[10px] uppercase block">ENDEREÇO EM LUANDA</span>
                      <span className="text-white font-medium">{selectedOrder.customer_city}</span>
                    </div>
                    {selectedOrder.customer_notes && (
                      <div className="sm:col-span-2">
                        <span className="text-[#666666] text-[10px] uppercase block">OBSERVAÇÕES DO CLIENTE</span>
                        <span className="text-[#aaaaaa] italic">{selectedOrder.customer_notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-3 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Tem a certeza que deseja eliminar permanentemente a encomenda ${selectedOrder.tracking_code}? Esta ação removerá o código de rastreio e libertará espaço.`
                        );
                        if (!confirmed) return;
                        const code = selectedOrder.tracking_code;
                        await deleteOrder(selectedOrder.id);
                        setSelectedOrder(null);
                        showToast(`Encomenda ${code} eliminada com sucesso!`);
                      }}
                      className="w-full sm:w-auto px-4 py-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white rounded text-xs uppercase font-sans font-bold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span>Excluir Encomenda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 w-full py-3 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded text-xs uppercase font-sans font-bold tracking-wider transition-colors text-center"
                    >
                      Fechar Inspeção
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* In-App Proof Lightbox Modal (Eliminates 404s and Pop-up Blocks) */}
            {viewingProofUrl && (
              <div
                id="proof-lightbox-backdrop"
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
                onClick={(e) => {
                  if ((e.target as HTMLElement).id === 'proof-lightbox-backdrop') {
                    setViewingProofUrl(null);
                  }
                }}
              >
                <div className="w-full max-w-3xl bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                  <div className="p-4 bg-[#141414] border-b border-[#222222] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-sans text-xs font-bold uppercase text-white tracking-wider">
                        {viewingProofTitle || 'Comprovativo de Pagamento'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadProof(viewingProofUrl, viewingProofTitle)}
                        className="px-3 py-1.5 bg-[#222222] hover:bg-[#333333] text-white rounded text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Descarregar ficheiro original"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Descarregar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openInNewTabSafely(viewingProofUrl)}
                        className="px-3 py-1.5 bg-[#222222] hover:bg-[#333333] text-white rounded text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Abrir ficheiro em nova aba"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Nova Aba</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewingProofUrl(null)}
                        className="p-1.5 text-[#888888] hover:text-white rounded bg-[#1c1c1c] transition-colors cursor-pointer"
                        title="Fechar visualizador"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex-1 overflow-auto flex items-center justify-center bg-[#070707] min-h-[300px]">
                    {viewingProofUrl.startsWith('data:application/pdf') || viewingProofUrl.toLowerCase().includes('.pdf') ? (
                      <iframe
                        src={viewingProofUrl}
                        title="PDF Comprovativo"
                        className="w-full h-[550px] rounded border border-[#222222]"
                      />
                    ) : (
                      <img
                        src={viewingProofUrl}
                        alt="Comprovativo de pagamento"
                        className="max-w-full max-h-[72vh] object-contain rounded shadow-lg border border-[#1f1f1f]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            const errBox = document.createElement('div');
                            errBox.className = 'text-center p-8 space-y-3 text-amber-400 font-sans';
                            errBox.innerHTML = '<p class="text-xs font-mono font-bold">O ficheiro de imagem não pôde ser carregado diretamente pela URL externa.</p><p class="text-[11px] text-[#888888]">Tente clicar em "Descarregar" acima para inspecionar no computador.</p>';
                            parent.appendChild(errBox);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================================== */}
        {/* MOTOR 2: CONTEÚDOS & PRODUTOS (PRODUTOS & CONTEÚDO PERSONALIZADO) */}
        {/* ============================================================================== */}
        {activeEngine === 'catalog' && (
          <div className="space-y-6">
            {/* Seletor Estrutural de Tipo de Conteúdo: PRODUTOS vs CONTEÚDO PERSONALIZADO */}
            <div className="flex items-center gap-2 border-b border-[#1c1c1c] pb-3 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setCatalogTab('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase transition-all whitespace-nowrap ${
                  catalogTab === 'products'
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tipo A: PRODUTOS ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogTab('custom_contents')}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase transition-all whitespace-nowrap ${
                  catalogTab === 'custom_contents'
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Tipo B: CONTEÚDO PERSONALIZADO ({customContents.length})</span>
              </button>
            </div>

            {/* SEÇÃO A: PRODUTOS (VESTUÁRIO COM FICHA TÉCNICA E CICLO DE VIDA) */}
            {catalogTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-lg border border-[#1f1f1f]">
              <div>
                <h2 className="font-display uppercase text-lg text-white tracking-wider">
                  MOTOR DE CATÁLOGO & CICLO DE VIDA
                </h2>
                <p className="text-xs text-[#777777] font-sans">
                  Alterne peças entre "Drop Ativo" e "Cápsula do Tempo", edite preços em AOA, fotos e tamanhos em stock.
                </p>
              </div>

              <button
                onClick={() => {
                  const uniqueId = `prod-${Date.now()}`;
                  const uniqueSlug = `peca-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
                  setEditingProduct({
                    id: uniqueId,
                    slug: uniqueSlug,
                    name: 'Nova Peça Wearing Unusual',
                    category: 'T-Shirts & Tops',
                    price_aoa: 25000,
                    description: 'Descrição técnica da peça em algodão pesado...',
                    details: '100% Algodão 300 GSM. Feito em Luanda.',
                    images: [],
                    sizes: [
                      { size: 'S', in_stock: true },
                      { size: 'M', in_stock: true },
                      { size: 'L', in_stock: true },
                      { size: 'XL', in_stock: true },
                    ],
                    colors: [{ name: 'Carbon Black', hex: '#141414', image_url: '' }],
                    badge: 'NOVO',
                    lifecycle: 'active_drop',
                    fit_guide: 'O modelo tem 1,85m e veste L. Modelagem boxy estruturada com ombros descaídos.',
                    size_guide: 'O modelo tem 1,85m e veste L. Modelagem boxy estruturada com ombros descaídos.',
                    is_visible: true,
                    is_featured: false,
                    order_index: products.length + 1,
                  });
                  setIsCreatingProduct(true);
                }}
                className="px-4 py-2 bg-white text-black font-sans font-bold text-xs tracking-wider uppercase rounded hover:bg-[#eaeaea] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Produto</span>
              </button>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-lg p-4 flex flex-col justify-between space-y-4 hover:border-[#333333] transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-24 bg-[#181818] rounded overflow-hidden shrink-0 border border-[#262626] flex items-center justify-center">
                      {product.images && product.images[0] && product.images[0].trim() !== '' ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-[#444444]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded uppercase ${
                            product.lifecycle === 'time_capsule'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {product.lifecycle === 'time_capsule' ? 'Cápsula do Tempo' : 'Drop Ativo'}
                        </span>
                        {product.badge && (
                          <span className="text-[9px] bg-[#222222] text-[#cccccc] px-1.5 py-0.5 rounded uppercase">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display uppercase text-sm text-white truncate tracking-wider mt-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#888888] font-sans mt-0.5 font-semibold">
                        {formatAOA(product.price_aoa)}
                      </p>
                      <p className="text-[10px] text-[#666666] font-sans mt-0.5">
                        {product.category}
                      </p>
                    </div>
                  </div>

                  {/* Quick Toggles */}
                  <div className="pt-3 border-t border-[#181818] space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[#777777] text-[11px]">Ciclo de Vida:</span>
                      <button
                        onClick={async () => {
                          const next = product.lifecycle === 'active_drop' ? 'time_capsule' : 'active_drop';
                          await toggleProductLifecycle(product.id, next);
                          showToast(`Peça movida para: ${next === 'time_capsule' ? 'Cápsula do Tempo' : 'Drop Ativo'}`);
                        }}
                        className="px-2.5 py-1 bg-[#1a1a1a] hover:bg-[#262626] rounded text-[10px] font-medium text-white border border-[#2a2a2a] transition-colors"
                      >
                        Mover p/ {product.lifecycle === 'active_drop' ? 'Cápsula' : 'Drop Ativo'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#777777] text-[11px]">Visibilidade:</span>
                      <button
                        onClick={async () => {
                          await toggleProductVisibility(product.id);
                          showToast(`Visibilidade alterada!`);
                        }}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-medium ${
                          product.is_visible ? 'text-emerald-400 bg-emerald-950/40' : 'text-red-400 bg-red-950/40'
                        }`}
                      >
                        {product.is_visible ? 'Visível na Loja' : 'Oculto'}
                      </button>
                    </div>

                    {/* Pre-Order Quick Toggle (Apenas permitido para peças com badge NOVO) */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#777777] text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Pre-Order:</span>
                      </span>
                      {product.badge?.toUpperCase() === 'NOVO' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            const nextState = !product.enable_pre_order;
                            const updated = { ...product, enable_pre_order: nextState };
                            await saveProduct(updated);
                            showToast(`Pre-Order ${nextState ? 'ATIVADO' : 'DESATIVADO'} para "${product.name}"`);
                          }}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                            product.enable_pre_order
                              ? 'bg-amber-400 text-black font-bold'
                              : 'bg-[#1a1a1a] text-[#777777] hover:text-white border border-[#262626]'
                          }`}
                        >
                          {product.enable_pre_order ? 'Pre-Order ON' : 'Pre-Order OFF'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#555555] font-mono" title="Apenas permitido para peças com badge NOVO">
                          Requer NOVO
                        </span>
                      )}
                    </div>

                    {/* Request Restock Quick Toggle (Totalmente independente de badge ou cápsula) */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#777777] text-[11px] flex items-center gap-1">
                        <BellRing className="w-3 h-3 text-amber-300" />
                        <span>Restock:</span>
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const nextState = !product.enable_request_restock;
                          const updated = { ...product, enable_request_restock: nextState };
                          await saveProduct(updated);
                          showToast(`Request Restock ${nextState ? 'ATIVADO' : 'DESATIVADO'} para "${product.name}"`);
                        }}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                          product.enable_request_restock
                            ? 'bg-white text-black font-bold'
                            : 'bg-[#1a1a1a] text-[#777777] hover:text-white border border-[#262626]'
                        }`}
                      >
                        {product.enable_request_restock ? 'Restock ON' : 'Restock OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 py-2 bg-[#1f1f1f] hover:bg-white hover:text-black rounded text-xs font-sans tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Ficha</span>
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        // 1. Dispara a chamada assíncrona para o Supabase:
                        try {
                          await supabase.from('products').delete().eq('id', product.id);
                        } catch (err) {
                          console.warn('Erro ao eliminar no Supabase:', err);
                        }
                        // 2. Atualiza imediatamente o estado local de produtos (setProducts) para filtrar e remover sem recarregar a página:
                        setProducts((prev) => prev.filter((p) => p.id !== product.id));
                        showToast(`Ficha de "${product.name}" eliminada.`);
                      }}
                      className="p-2 text-[#666666] hover:text-red-400 hover:bg-red-950/40 rounded bg-[#141414] border border-[#222222] hover:border-red-900/50 transition-colors flex items-center justify-center shrink-0"
                      title={`Eliminar ficha de "${product.name}"`}
                      aria-label={`Eliminar ficha de "${product.name}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEÇÃO B: CONTEÚDO PERSONALIZADO (EDITORIAL, LOOKBOOKS, PORTFÓLIOS, UNUSUAL MODELS) */}
        {catalogTab === 'custom_contents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-lg border border-[#1f1f1f]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display uppercase text-lg text-white tracking-wider">
                    CONTEÚDOS PERSONALIZADOS (EDITORIAL & PORTFÓLIO)
                  </h2>
                  <span className="text-[10px] bg-amber-400 text-black font-bold uppercase px-2 py-0.5 rounded font-mono">
                    REUTILIZÁVEL
                  </span>
                </div>
                <p className="text-xs text-[#777777] font-sans mt-0.5">
                  Crie livremente páginas como UNUSUAL MODELS, Lookbooks, Campanhas e Fotografias. Sem restrições nem campos de roupa.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCustomContent({
                    id: `custom-${Date.now()}`,
                    title: 'NOVO CONTEÚDO',
                    internal_name: 'Novo Editorial',
                    slug: `conteudo-${Date.now().toString(36)}`,
                    subtitle: 'PORTFOLIO & CASTING EDITORIAL',
                    description: '',
                    images: [],
                    items: [],
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
                }}
                className="px-4 py-2 bg-white text-black font-sans font-bold text-xs tracking-wider uppercase rounded hover:bg-[#eaeaea] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Conteúdo Personalizado</span>
              </button>
            </div>

            {/* Custom Contents Grid */}
            {customContents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customContents.map((item) => {
                  const isLinkedAsBlock = blocks.some((b) => b.custom_content_id === item.id || b.slug === item.slug);
                  const isLinkedInMenu = menuItems.some((m) => m.target_id === item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-[#333333] transition-colors group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] bg-white text-black font-bold px-2 py-0.5 rounded uppercase">
                            CONTEÚDO PERSONALIZADO
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isLinkedAsBlock && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                                Na Homepage
                              </span>
                            )}
                            {isLinkedInMenu && (
                              <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded font-mono">
                                No Menu
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">
                            {item.subtitle || 'PORTFOLIO / EDITORIAL'}
                          </span>
                          <h3 className="font-display uppercase text-lg text-white tracking-wider mt-0.5 group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h3>
                          {item.internal_name && item.internal_name !== item.title && (
                            <p className="text-[11px] text-[#777777] font-sans">
                              Nome interno: <strong className="text-neutral-400">{item.internal_name}</strong>
                            </p>
                          )}
                          <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                            URL: /{item.slug}
                          </p>
                        </div>

                        {item.description && (
                          <p className="text-xs text-[#888888] font-sans line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Preview thumbnails */}
                        <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                          {item.images && item.images.length > 0 ? (
                            item.images.slice(0, 4).map((img, idx) => (
                              <div key={idx} className="w-12 h-14 rounded bg-[#181818] overflow-hidden border border-[#262626] shrink-0">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-neutral-600 font-mono">Sem fotografias</div>
                          )}
                          {item.items && item.items.length > 0 && (
                            <span className="text-[10px] font-mono text-neutral-400 pl-1 shrink-0">
                              +{item.items.length} {item.items.length === 1 ? 'modelo' : 'modelos'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-[#181818] space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCustomContent(item)}
                            className="flex-1 py-2 bg-[#1f1f1f] hover:bg-white hover:text-black rounded text-xs font-sans tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 font-bold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar Conteúdo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setContentToDelete(item)}
                            className="p-2 text-[#666666] hover:text-red-400 hover:bg-red-950/40 rounded bg-[#141414] border border-[#222222] hover:border-red-900/50 transition-colors flex items-center justify-center shrink-0"
                            title={`Eliminar "${item.title}"`}
                            aria-label={`Eliminar "${item.title}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
                          {isLinkedAsBlock ? (
                            <button
                              type="button"
                              onClick={() => {
                                const linked = blocks.find((b) => b.custom_content_id === item.id || b.slug === item.slug);
                                if (linked) {
                                  setEditingBlock(linked);
                                } else {
                                  setActiveEngine('blocks');
                                  setPageBuilderTab('blocks');
                                }
                              }}
                              className="py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded border border-emerald-800/80 truncate transition-colors flex items-center justify-center gap-1 font-semibold"
                              title="Configurar bloco no Page Builder"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>✓ No Page Builder</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                const newBlock: SiteBlock = {
                                  id: `block_${item.slug.replace(/[^a-z0-9_]/gi, '_') || Date.now()}`,
                                  block_type: 'custom_content',
                                  title: item.internal_name || item.title,
                                  public_name: item.title,
                                  subtitle: item.subtitle || 'Portfolio / Conteúdo Personalizado',
                                  content_type: 'custom',
                                  custom_content_id: item.id,
                                  slug: item.slug,
                                  content: {
                                    custom_content_id: item.id,
                                    heading: item.title,
                                    subheading: item.subtitle,
                                    description: item.description,
                                    images: item.images,
                                    items: item.items,
                                  },
                                  is_active: true,
                                  order_index: blocks.length + 1,
                                };
                                await saveBlock(newBlock);
                                showToast(`Bloco "${item.title}" adicionado à homepage!`);
                              }}
                              className="py-1.5 px-2 bg-[#141414] hover:bg-[#202020] text-neutral-300 rounded border border-[#222222] truncate transition-colors flex items-center justify-center gap-1"
                              title="Adicionar como bloco na homepage"
                            >
                              <Layers className="w-3 h-3 text-emerald-400" />
                              <span>+ No Page Builder</span>
                            </button>
                          )}

                          {isLinkedInMenu ? (
                            <button
                              type="button"
                              onClick={() => {
                                const linked = menuItems.find((m) => m.target_id === item.id || m.target_id === item.slug);
                                if (linked) {
                                  setEditingMenuItem(linked);
                                } else {
                                  setActiveEngine('blocks');
                                  setPageBuilderTab('menu');
                                }
                              }}
                              className="py-1.5 px-2 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 rounded border border-blue-800/80 truncate transition-colors flex items-center justify-center gap-1 font-semibold"
                              title="Editar este link no menu"
                            >
                              <Check className="w-3 h-3 text-blue-400" />
                              <span>✓ No Menu</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMenuItem({
                                  id: `menu-${Date.now()}`,
                                  label: item.title,
                                  target_type: 'custom',
                                  target_id: item.id,
                                  order_index: menuItems.length + 1,
                                  is_active: true,
                                });
                              }}
                              className="py-1.5 px-2 bg-[#141414] hover:bg-[#202020] text-neutral-300 rounded border border-[#222222] truncate transition-colors flex items-center justify-center gap-1"
                              title="Adicionar ligação no menu do site"
                            >
                              <Compass className="w-3 h-3 text-blue-400" />
                              <span>+ No Menu</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#0d0d0d] border border-dashed border-[#242424] rounded-xl space-y-4">
                <Sparkles className="w-10 h-10 text-neutral-600 mx-auto" />
                <div>
                  <h4 className="font-display uppercase text-white text-base tracking-wider">
                    Nenhum Conteúdo Personalizado Criado
                  </h4>
                  <p className="text-xs text-[#777777] font-sans mt-1 max-w-md mx-auto">
                    Crie páginas e portfólios editoriais reutilizáveis como o UNUSUAL MODELS com fotos, casting e narrativa própria.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCustomContent({
                      id: `custom-${Date.now()}`,
                      title: 'UNUSUAL MODELS',
                      internal_name: 'Model Portfolio',
                      slug: 'unusual-models',
                      subtitle: 'PORTFOLIO & CASTING EDITORIAL',
                      description: 'Apresentação visual dos modelos e personalidades que dão vida ao movimento Wearing Unusual em Luanda.',
                      images: [],
                      items: [],
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  }}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase rounded hover:bg-[#eaeaea] transition-all"
                >
                  Criar Primeiro Conteúdo (UNUSUAL MODELS)
                </button>
              </div>
            )}
          </div>
        )}

            {/* Product Editor Modal */}
            {editingProduct && (
              <div
                id="product-editor-backdrop"
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                onClick={(e) => {
                  if ((e.target as HTMLElement).id === 'product-editor-backdrop') {
                    setEditingProduct(null);
                  }
                }}
              >
                <div className="w-full max-w-3xl bg-[#0c0c0c] border border-[#222222] rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
                    <div>
                      <span className="text-[10px] text-[#888888] uppercase tracking-widest block">
                        EDITOR DE FICHA TÉCNICA
                      </span>
                      <h3 className="font-display uppercase text-lg text-white tracking-wider mt-0.5">
                        {editingProduct.name}
                      </h3>
                    </div>
                    <button onClick={() => setEditingProduct(null)} className="p-1.5 text-[#777777] hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                    <div>
                      <label className="block uppercase text-[#888888] mb-1">Nome da Peça *</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setEditingProduct({
                            ...editingProduct,
                            name: newName,
                            // If user is typing and slug was empty or auto-generated, keep slug synchronized
                            slug: editingProduct.slug || newName.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white"
                      />
                    </div>

                    <div>
                      <label className="block uppercase text-[#888888] mb-1">Slug / Identificador URL (Único)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingProduct.slug || ''}
                          onChange={(e) => {
                            const clean = e.target.value
                              .toLowerCase()
                              .trim()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/[^a-z0-9-]+/g, '-');
                            setEditingProduct({ ...editingProduct, slug: clean });
                          }}
                          placeholder="ex: void-heavy-tee"
                          className="flex-1 px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const base = (editingProduct.name || 'peca')
                              .toLowerCase()
                              .trim()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, '');
                            const unique = `${base}-${Date.now().toString(36).slice(-4)}`;
                            setEditingProduct({ ...editingProduct, slug: unique });
                          }}
                          className="px-2.5 py-1.5 bg-[#1f1f1f] hover:bg-[#2c2c2c] text-[#cccccc] hover:text-white rounded text-[11px] font-mono shrink-0 transition-colors"
                          title="Gerar identificador único a partir do nome"
                        >
                          Auto
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase text-[#888888] mb-1">Preço em AOA (Kwanzas) *</label>
                      <input
                        type="number"
                        value={editingProduct.price_aoa}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price_aoa: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block uppercase text-[#888888] mb-1">Categoria *</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white"
                      >
                        <option value="T-Shirts & Tops">T-Shirts & Tops</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Sweatshirts">Sweatshirts</option>
                        <option value="Denim">Denim</option>
                        <option value="Outerwear">Outerwear</option>
                        <option value="Acessórios">Acessórios</option>
                      </select>
                    </div>

                    <div>
                      <label className="block uppercase text-[#888888] mb-1">Badge Visual</label>
                      <select
                        value={
                          editingProduct.badge
                            ? editingProduct.badge.toUpperCase() === 'AGUARDANDO VAGA'
                              ? 'AGUARDANDO VAGA'
                              : editingProduct.badge
                            : ''
                        }
                        onChange={(e) => {
                          const nextBadge = e.target.value || null;
                          const isNovo = nextBadge?.toUpperCase() === 'NOVO';
                          setEditingProduct({
                            ...editingProduct,
                            badge: nextBadge,
                            // Pré-order é permitido EXCLUSIVAMENTE para peças com badge NOVO
                            enable_pre_order: isNovo ? editingProduct.enable_pre_order : false,
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white"
                      >
                        <option value="">Sem Badge</option>
                        <option value="NOVO">NOVO</option>
                        <option value="EDIÇÃO LIMITADA">EDIÇÃO LIMITADA</option>
                        <option value="ESGOTADO">ESGOTADO</option>
                        <option value="AGUARDANDO VAGA">AGUARDANDO VAGA</option>
                      </select>
                      <span className="text-[10px] text-[#666666] block mt-1">
                        Em inglês, "AGUARDANDO VAGA" é apresentado como "COMING BACK SOON".
                      </span>
                    </div>

                    {/* CONFIGURAÇÃO ESPECÍFICA DE DATA DE RETORNO: Apenas desbloqueada quando badge = AGUARDANDO VAGA */}
                    {editingProduct.badge?.toUpperCase() === 'AGUARDANDO VAGA' && (
                      <div className="sm:col-span-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1.5 animate-in fade-in">
                        <label className="block uppercase text-amber-300 text-xs font-bold tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>DATA DE RETORNO (OPCIONAL)</span>
                        </label>
                        <p className="text-[11px] text-[#999999] leading-relaxed">
                          A data NÃO é obrigatória. Se definida (ex: "15–25 Outubro"), a loja pública mostrará "COMING BACK SOON / AGUARDANDO VAGA" acompanhado da data. Se deixada em branco, mostrará apenas "COMING BACK SOON / AGUARDANDO VAGA".
                        </p>
                        <input
                          type="text"
                          value={editingProduct.return_date || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              return_date: e.target.value,
                            })
                          }
                          placeholder="ex: 15–25 Outubro"
                          className="w-full px-3 py-2 bg-[#0d0d0d] border border-amber-500/40 rounded text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block uppercase text-[#888888] mb-1">Ciclo de Vida</label>
                      <select
                        value={editingProduct.lifecycle}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            lifecycle: e.target.value as 'active_drop' | 'time_capsule',
                          })
                        }
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white"
                      >
                        <option value="active_drop">Drop Ativo (Vitrine Principal)</option>
                        <option value="time_capsule">Cápsula do Tempo (Arquivo Histórico)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <ImageGalleryManager
                        totalSlots={6}
                        sectionTitle="Fotografias da Peça"
                        images={editingProduct.images || []}
                        onChange={(imgs) => setEditingProduct({ ...editingProduct, images: imgs })}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block uppercase text-[#888888] mb-1">Descrição Comercial</label>
                      <textarea
                        rows={2}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block uppercase text-[#888888] mb-1">Especificações Técnicas & Tecido (GSM, Corte)</label>
                      <textarea
                        rows={2}
                        value={editingProduct.details}
                        onChange={(e) => setEditingProduct({ ...editingProduct, details: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block uppercase text-white font-semibold text-xs tracking-wider mb-1">
                        GUIA DE CAIMENTO E MEDIDAS DA PEÇA
                      </label>
                      <p className="text-[11px] text-[#666666] mb-2 font-sans">
                        Texto descritivo de caimento exibido individualmente na página e no modal do produto (ex: "O modelo tem 1,85m e veste L...").
                      </p>
                      <textarea
                        rows={3}
                        value={editingProduct.fit_guide || editingProduct.size_guide || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            fit_guide: e.target.value,
                            size_guide: e.target.value,
                          })
                        }
                        placeholder="ex: O modelo tem 1,85m e veste L. Modelagem boxy estruturada com ombros descaídos e acabamento reforçado na gola."
                        className="w-full px-3 py-2 bg-[#141414] border border-[#292929] rounded text-white text-xs font-sans placeholder-[#444444] focus:border-white focus:outline-none"
                      />
                    </div>

                    {/* Stock Sizes Editor */}
                    <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[#1c1c1c]">
                      <span className="block uppercase text-[#888888] text-[10px] tracking-wider font-semibold">
                        Tamanhos em Stock (Clique para alternar disponibilidade)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {editingProduct.sizes.map((s, idx) => (
                          <button
                            key={s.size}
                            type="button"
                            onClick={() => {
                              const nextSizes = [...editingProduct.sizes];
                              nextSizes[idx].in_stock = !nextSizes[idx].in_stock;
                              setEditingProduct({ ...editingProduct, sizes: nextSizes });
                            }}
                            className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${
                              s.in_stock
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-[#181818] text-[#555555] border-[#292929] line-through'
                            }`}
                          >
                            {s.size} {s.in_stock ? '(Em Stock)' : '(Esgotado)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CONTROLOS EDITORIAIS: PRE-ORDER & REQUEST RESTOCK */}
                    <div className="sm:col-span-2 space-y-4 pt-4 border-t border-[#1c1c1c] bg-[#0f0f0f] p-4 rounded-lg border border-[#222222]">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block uppercase text-white text-xs tracking-wider font-bold flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-amber-400" />
                            <span>CONTROLOS EDITORIAIS DE BOTÕES (PRE-ORDER & RESTOCK)</span>
                          </span>
                          <span className="text-[11px] text-[#777777] block mt-0.5">
                            Controlo total independente do administrador sobre os botões de pré-encomenda e reposição.
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* 1. ENABLE PRE-ORDER BUTTON (Apenas permitido para peças com badge NOVO) */}
                        {editingProduct.badge?.toUpperCase() === 'NOVO' ? (
                          <div className={`p-3.5 rounded-lg border transition-all ${
                            editingProduct.enable_pre_order
                              ? 'bg-amber-500/10 border-amber-400/60'
                              : 'bg-[#141414] border-[#262626]'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className={`w-4 h-4 ${editingProduct.enable_pre_order ? 'text-amber-400' : 'text-[#666666]'}`} />
                                <div>
                                  <span className="text-white text-xs font-bold uppercase tracking-wider block">
                                    PRÉ-ORDER
                                  </span>
                                  <span className="text-[10px] text-[#888888] block">
                                    {editingProduct.enable_pre_order ? 'ATIVADO' : 'DESATIVADO'}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct({
                                    ...editingProduct,
                                    enable_pre_order: !editingProduct.enable_pre_order,
                                  });
                                }}
                                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                                  editingProduct.enable_pre_order
                                    ? 'bg-amber-400 text-black shadow-md'
                                    : 'bg-[#1f1f1f] text-[#777777] hover:text-white border border-[#2e2e2e]'
                                }`}
                              >
                                {editingProduct.enable_pre_order ? 'Ativado' : 'Desativado'}
                              </button>
                            </div>

                            <p className="text-[11px] text-[#888888] mt-2 leading-relaxed">
                              Quando ativado, a loja pública apresenta o botão <strong className="text-white">[ PRE-ORDER ]</strong>. O badge permanece "NOVO" e não é alterado pelo Pré-order.
                            </p>

                            {editingProduct.enable_pre_order && (
                              <div className="space-y-2.5 mt-3 pt-3 border-t border-amber-500/20">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-wider text-amber-300/80 mb-1 font-mono">
                                    Previsão de Entrega
                                  </label>
                                  <input
                                    type="text"
                                    value={editingProduct.pre_order_estimated_delivery || ''}
                                    onChange={(e) =>
                                      setEditingProduct({
                                        ...editingProduct,
                                        pre_order_estimated_delivery: e.target.value,
                                      })
                                    }
                                    placeholder="ex: 15–25 Outubro"
                                    className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-amber-500/30 rounded text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] uppercase tracking-wider text-amber-300/80 mb-1 font-mono">
                                    Aviso Personalizado de Produção (Opcional)
                                  </label>
                                  <input
                                    type="text"
                                    value={editingProduct.pre_order_custom_notice || ''}
                                    onChange={(e) =>
                                      setEditingProduct({
                                        ...editingProduct,
                                        pre_order_custom_notice: e.target.value,
                                      })
                                    }
                                    placeholder="ex: Peça produzida sob encomenda no atelier"
                                    className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-amber-500/30 rounded text-white text-xs font-sans focus:border-amber-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-lg border bg-[#121212] border-[#222222] flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-[#777777]">
                              <Clock className="w-4 h-4 text-[#555555]" />
                              <div>
                                <span className="text-[#888888] text-xs font-bold uppercase tracking-wider block">
                                  PRÉ-ORDER (BLOQUEADO)
                                </span>
                                <span className="text-[10px] text-[#555555] block">
                                  Requer Badge "NOVO"
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-[#666666] mt-2 leading-relaxed">
                              O Pré-order só pode ser ativado em peças com o badge <strong>NOVO</strong>. Não é permitido para Esgotado, Edição Limitada, Aguardando Vaga ou Sem Badge.
                            </p>
                          </div>
                        )}

                        {/* 2. ENABLE REQUEST RESTOCK BUTTON (Totalmente independente de badge e Time Capsule) */}
                        <div className={`p-3.5 rounded-lg border transition-all ${
                          editingProduct.enable_request_restock
                            ? 'bg-amber-500/10 border-amber-400/60'
                            : 'bg-[#141414] border-[#262626]'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BellRing className={`w-4 h-4 ${editingProduct.enable_request_restock ? 'text-amber-300' : 'text-[#666666]'}`} />
                              <div>
                                <span className="text-white text-xs font-bold uppercase tracking-wider block">
                                  REQUEST RESTOCK
                                </span>
                                <span className="text-[10px] text-[#888888] block">
                                  {editingProduct.enable_request_restock ? 'ATIVADO (ON)' : 'DESATIVADO (OFF)'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct({
                                  ...editingProduct,
                                  enable_request_restock: !editingProduct.enable_request_restock,
                                });
                              }}
                              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                                editingProduct.enable_request_restock
                                  ? 'bg-amber-400 text-black shadow-md'
                                  : 'bg-[#1f1f1f] text-[#777777] hover:text-white border border-[#2e2e2e]'
                              }`}
                            >
                              {editingProduct.enable_request_restock ? 'Ativado' : 'Desativado'}
                            </button>
                          </div>

                          <p className="text-[11px] text-[#888888] mt-2 leading-relaxed">
                            Configuração manual independente. Quando <strong>ATIVADO</strong>, exibe na loja pública a secção de apelo ("Would you like this collection to return?") e o botão de registo de interesse.
                          </p>

                          <div className="mt-3 pt-2 border-t border-[#222222] text-[10px] font-sans">
                            {editingProduct.enable_request_restock ? (
                              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>
                                  <strong>ATIVO:</strong> O bloco e botão [ REQUEST RESTOCK ] serão apresentados na página desta peça.
                                </span>
                              </div>
                            ) : (
                              <div className="p-2 rounded bg-[#181818] border border-[#292929] text-[#777777] flex items-start gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>
                                  <strong>DESATIVADO:</strong> Nenhum bloco ou botão de Request Restock será apresentado na loja pública para esta peça.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Variations Section */}
                    <div className="sm:col-span-2 space-y-3 pt-4 border-t border-[#1c1c1c]">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block uppercase text-[#888888] text-[10px] tracking-wider font-semibold">
                            VARIAÇÕES DE COR ({(editingProduct.colors || []).length})
                          </span>
                          <span className="text-[11px] text-[#666666]">
                            Defina o nome da cor, a amostra visual e a foto vinculada que muda dinamicamente na página do produto.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = [
                              ...(editingProduct.colors || []),
                              { name: 'Nova Cor', hex: '#222222', image_url: '' },
                            ];
                            setEditingProduct({ ...editingProduct, colors: newColors });
                          }}
                          className="px-2.5 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#333333] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar Cor</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(editingProduct.colors || []).map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 bg-[#121212] border border-[#222222] rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            {/* Color sample & Inputs */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <label
                                className="relative w-7 h-7 rounded-full border border-[#444444] cursor-pointer shrink-0 shadow-inner flex items-center justify-center overflow-hidden"
                                style={{ backgroundColor: c.hex || '#141414' }}
                                title="Clique para escolher a cor visual"
                              >
                                <input
                                  type="color"
                                  value={c.hex && c.hex.startsWith('#') && c.hex.length === 7 ? c.hex : '#141414'}
                                  onChange={(e) => {
                                    const nextColors = [...editingProduct.colors];
                                    nextColors[cIdx] = { ...nextColors[cIdx], hex: e.target.value };
                                    setEditingProduct({ ...editingProduct, colors: nextColors });
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </label>

                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={c.name}
                                  placeholder="Nome da cor (ex: Carbon Black)"
                                  onChange={(e) => {
                                    const nextColors = [...editingProduct.colors];
                                    nextColors[cIdx] = { ...nextColors[cIdx], name: e.target.value };
                                    setEditingProduct({ ...editingProduct, colors: nextColors });
                                  }}
                                  className="px-2.5 py-1.5 bg-[#181818] border border-[#2a2a2a] rounded text-white text-xs"
                                />
                                <input
                                  type="text"
                                  value={c.hex}
                                  placeholder="Hex (ex: #141414)"
                                  onChange={(e) => {
                                    const nextColors = [...editingProduct.colors];
                                    nextColors[cIdx] = { ...nextColors[cIdx], hex: e.target.value };
                                    setEditingProduct({ ...editingProduct, colors: nextColors });
                                  }}
                                  className="px-2.5 py-1.5 bg-[#181818] border border-[#2a2a2a] rounded text-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            {/* Linked Image */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              {c.image_url && c.image_url.trim() !== '' ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-9 h-11 bg-[#1a1a1a] rounded overflow-hidden border border-[#333333] shrink-0">
                                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                                  </div>
                                  <label className="px-2 py-1 bg-[#1e1e1e] hover:bg-[#282828] text-[#cccccc] hover:text-white rounded text-[10px] font-bold uppercase cursor-pointer border border-[#333333]">
                                    Trocar
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const url = await uploadImageToSupabase(file, 'products');
                                          const nextColors = [...editingProduct.colors];
                                          nextColors[cIdx] = { ...nextColors[cIdx], image_url: url };
                                          setEditingProduct({ ...editingProduct, colors: nextColors });
                                        } finally {
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextColors = [...editingProduct.colors];
                                      nextColors[cIdx] = { ...nextColors[cIdx], image_url: '' };
                                      setEditingProduct({ ...editingProduct, colors: nextColors });
                                    }}
                                    className="p-1 text-[#666666] hover:text-red-400"
                                    title="Remover foto vinculada"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {editingProduct.images && editingProduct.images.filter((img) => img && img.trim() !== '').length > 0 && (
                                    <select
                                      value={c.image_url || ''}
                                      onChange={(e) => {
                                        const nextColors = [...editingProduct.colors];
                                        nextColors[cIdx] = { ...nextColors[cIdx], image_url: e.target.value };
                                        setEditingProduct({ ...editingProduct, colors: nextColors });
                                      }}
                                      className="px-2 py-1 bg-[#181818] border border-[#2a2a2a] rounded text-white text-[10px] font-sans focus:outline-none"
                                    >
                                      <option value="">Vincular foto de slot...</option>
                                      {editingProduct.images.map((imgUrl, imgIdx) => {
                                        if (!imgUrl || imgUrl.trim() === '') return null;
                                        return (
                                          <option key={imgIdx} value={imgUrl}>
                                            Espaço #{imgIdx + 1} {imgIdx === 0 ? '(Capa)' : ''}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  )}
                                  <label className="px-2.5 py-1 bg-[#181818] hover:bg-[#222222] text-[#888888] hover:text-white rounded text-[10px] font-bold uppercase cursor-pointer border border-dashed border-[#333333] flex items-center gap-1 transition-colors">
                                    <Plus className="w-3 h-3" />
                                    <span>Upload Foto</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const url = await uploadImageToSupabase(file, 'products');
                                          const nextColors = [...editingProduct.colors];
                                          nextColors[cIdx] = { ...nextColors[cIdx], image_url: url };
                                          setEditingProduct({ ...editingProduct, colors: nextColors });
                                        } finally {
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const nextColors = editingProduct.colors.filter((_, idx) => idx !== cIdx);
                                  setEditingProduct({ ...editingProduct, colors: nextColors });
                                }}
                                className="p-1.5 text-[#555555] hover:text-red-400 rounded transition-colors"
                                title="Remover cor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1c1c1c] flex items-center justify-between gap-3">
                    {!isCreatingProduct ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await supabase.from('products').delete().eq('id', editingProduct.id);
                          } catch (err) {
                            console.warn('Erro ao eliminar no Supabase:', err);
                          }
                          setProducts((prev) => prev.filter((p) => p.id !== editingProduct.id));
                          setEditingProduct(null);
                          showToast(`Ficha de "${editingProduct.name}" eliminada.`);
                        }}
                        className="px-3.5 py-2 bg-red-950/40 border border-red-900/60 text-red-300 hover:bg-red-900 hover:text-white rounded text-xs uppercase flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Ficha</span>
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 bg-[#181818] text-[#888888] hover:text-white rounded text-xs uppercase"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          await saveProduct(editingProduct);
                          setEditingProduct(null);
                          showToast('Ficha do produto guardada com sucesso!');
                        }}
                        className="px-6 py-2.5 bg-white text-black font-bold text-xs tracking-wider uppercase rounded hover:bg-[#eaeaea]"
                      >
                        Guardar Produto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================================== */}
        {/* MOTOR 1: PAGE BUILDER & MENU DO SITE */}
        {/* ============================================================================== */}
        {activeEngine === 'blocks' && (
          <div className="space-y-6">
            {/* Sub-Tabs: 1. BLOCOS DA HOMEPAGE vs 2. MENU DO SITE */}
            <div className="flex items-center gap-2 border-b border-[#1c1c1c] pb-3 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setPageBuilderTab('blocks')}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase transition-all whitespace-nowrap ${
                  pageBuilderTab === 'blocks'
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>1. Blocos da Homepage ({blocks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPageBuilderTab('menu')}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-sans tracking-wider uppercase transition-all whitespace-nowrap ${
                  pageBuilderTab === 'menu'
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-400" />
                <span>2. Menu do Site ({menuItems.length})</span>
              </button>
            </div>

            {/* SUB-SEÇÃO 1: BLOCOS DA HOMEPAGE */}
            {pageBuilderTab === 'blocks' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-lg border border-[#1f1f1f]">
                  <div>
                    <h2 className="font-display uppercase text-lg text-white tracking-wider">
                      MOTOR DE ESTRUTURA E BLOCOS (PAGE BUILDER)
                    </h2>
                    <p className="text-xs text-[#777777] font-sans">
                      Ative, desative, reordene, edite e elimine blocos da homepage com total autonomia.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingBlockPickerOpen(true)}
                    className="px-4 py-2 bg-white text-black font-sans font-bold text-xs tracking-wider uppercase rounded hover:bg-[#eaeaea] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Bloco</span>
                  </button>
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                  {[...blocks]
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((block, idx) => {
                      const linkedCustom = customContents.find(
                        (c) => c.id === block.custom_content_id || c.slug === block.slug
                      );
                      const displayTitle = linkedCustom?.title || block.public_name || block.title;
                      const displaySubtitle =
                        block.subtitle ||
                        (block.block_type === 'custom_content' ? 'Portfolio / Conteúdo Personalizado' : '');

                      return (
                        <div
                          key={block.id}
                          className="p-4 bg-[#0e0e0e] border border-[#1f1f1f] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2f2f2f] transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="flex flex-col gap-1">
                              <button
                                disabled={idx === 0}
                                onClick={async () => {
                                  const sorted = [...blocks].sort((a, b) => a.order_index - b.order_index);
                                  const temp = sorted[idx];
                                  sorted[idx] = sorted[idx - 1];
                                  sorted[idx - 1] = temp;
                                  await reorderBlocks(sorted);
                                  showToast('Ordem dos blocos atualizada!');
                                }}
                                className="p-1 text-[#666666] hover:text-white disabled:opacity-20 transition-colors"
                                title="Mover bloco para cima"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={idx === blocks.length - 1}
                                onClick={async () => {
                                  const sorted = [...blocks].sort((a, b) => a.order_index - b.order_index);
                                  const temp = sorted[idx];
                                  sorted[idx] = sorted[idx + 1];
                                  sorted[idx + 1] = temp;
                                  await reorderBlocks(sorted);
                                  showToast('Ordem dos blocos atualizada!');
                                }}
                                className="p-1 text-[#666666] hover:text-white disabled:opacity-20 transition-colors"
                                title="Mover bloco para baixo"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-[#888888]">#{block.order_index}</span>
                                <h3 className="font-display uppercase text-sm sm:text-base text-white tracking-wider truncate">
                                  {displayTitle}
                                </h3>
                                <span className="text-[10px] bg-[#1a1a1a] text-[#888888] px-2 py-0.5 rounded font-mono uppercase">
                                  {block.block_type === 'custom_content' ? 'CONTEÚDO PERSONALIZADO' : block.block_type}
                                </span>
                              </div>

                              {displaySubtitle && (
                                <p className="text-xs text-[#777777] font-sans mt-0.5 truncate">
                                  {displaySubtitle}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#555555]">
                                <span>ID técnico: <strong className="text-neutral-400">{block.id}</strong></span>
                                {block.title && block.title !== displayTitle && (
                                  <span>• Nome interno: <strong className="text-neutral-400">{block.title}</strong></span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                            {/* Ativar / Desativar */}
                            <button
                              onClick={async () => {
                                await toggleBlock(block.id, !block.is_active);
                                showToast(`Bloco "${displayTitle}" ${!block.is_active ? 'ativado' : 'desativado'} na homepage.`);
                              }}
                              className={`px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors ${
                                block.is_active
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-red-950/50 text-red-400 border border-red-900/50'
                              }`}
                            >
                              {block.is_active ? 'Ativo na Loja' : 'Desativado'}
                            </button>

                            {/* Botão EDITAR */}
                            <button
                              onClick={() => setEditingBlock(block)}
                              className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-white hover:text-black rounded text-xs font-sans tracking-wider uppercase transition-colors flex items-center gap-1 font-semibold"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            {/* Ícone pequeno de lixo/trash para ELIMINAR */}
                            <button
                              onClick={() => setBlockToDelete(block)}
                              className="p-2 text-[#666666] hover:text-red-400 hover:bg-red-950/40 rounded bg-[#141414] border border-[#222222] hover:border-red-900/50 transition-colors flex items-center justify-center shrink-0"
                              title={`Eliminar bloco "${displayTitle}"`}
                              aria-label={`Eliminar bloco "${displayTitle}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SUB-SEÇÃO 2: MENU DE NAVEGAÇÃO DO SITE */}
            {pageBuilderTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-lg border border-[#1f1f1f]">
                  <div>
                    <h2 className="font-display uppercase text-lg text-white tracking-wider">
                      MENU DE NAVEGAÇÃO DO SITE
                    </h2>
                    <p className="text-xs text-[#777777] font-sans">
                      Controle a ordem, os nomes e os destinos de cada item do menu do site. Pode ligar itens à loja, arquivos ou conteúdos personalizados.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingMenuItem({
                        id: `menu-${Date.now()}`,
                        label: 'NOVO ITEM',
                        target_type: 'store',
                        target_id: 'drop-atual',
                        order_index: menuItems.length + 1,
                        is_active: true,
                      });
                    }}
                    className="px-4 py-2 bg-white text-black font-sans font-bold text-xs tracking-wider uppercase rounded hover:bg-[#eaeaea] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Item ao Menu</span>
                  </button>
                </div>

                {/* Menu Items List */}
                <div className="space-y-3">
                  {[...menuItems]
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((item, idx) => {
                      let targetBadge = 'LOJA / DROP';
                      let targetDetail = '';

                      if (item.target_type === 'custom') {
                        const linked = customContents.find((c) => c.id === item.target_id || c.slug === item.target_id);
                        targetBadge = 'CONTEÚDO PERSONALIZADO';
                        targetDetail = linked ? linked.title : item.target_id || '';
                      } else if (item.target_type === 'capsule') {
                        targetBadge = 'CÁPSULA DO TEMPO';
                      } else if (item.target_type === 'anchor') {
                        targetBadge = 'ÂNCORA NA PÁGINA';
                        targetDetail = `#${item.target_id || ''}`;
                      } else if (item.target_type === 'wishlist') {
                        targetBadge = 'FAVORITOS';
                      } else if (item.target_type === 'track') {
                        targetBadge = 'RASTREIO';
                      } else if (item.target_type === 'external') {
                        targetBadge = 'LINK EXTERNO';
                        targetDetail = item.url || '';
                      }

                      return (
                        <div
                          key={item.id}
                          className="p-4 bg-[#0e0e0e] border border-[#1f1f1f] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2a2a2a] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <button
                                disabled={idx === 0}
                                onClick={async () => {
                                  const sorted = [...menuItems].sort((a, b) => a.order_index - b.order_index);
                                  const temp = sorted[idx];
                                  sorted[idx] = sorted[idx - 1];
                                  sorted[idx - 1] = temp;
                                  await reorderMenuItems(sorted);
                                  showToast('Ordem do menu atualizada!');
                                }}
                                className="p-1 text-[#666666] hover:text-white disabled:opacity-20 transition-colors"
                                title="Subir item no menu"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={idx === menuItems.length - 1}
                                onClick={async () => {
                                  const sorted = [...menuItems].sort((a, b) => a.order_index - b.order_index);
                                  const temp = sorted[idx];
                                  sorted[idx] = sorted[idx + 1];
                                  sorted[idx + 1] = temp;
                                  await reorderMenuItems(sorted);
                                  showToast('Ordem do menu atualizada!');
                                }}
                                className="p-1 text-[#666666] hover:text-white disabled:opacity-20 transition-colors"
                                title="Descer item no menu"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-[#888888]">#{idx + 1}</span>
                                <h3 className="font-display uppercase text-sm sm:text-base text-white tracking-wider">
                                  {item.label}
                                </h3>
                                <span className="text-[10px] bg-[#1a1a1a] text-neutral-300 border border-[#2a2a2a] px-2 py-0.5 rounded font-mono">
                                  {targetBadge}
                                </span>
                              </div>

                              {targetDetail && (
                                <p className="text-xs text-[#777777] font-sans mt-0.5">
                                  Destino: <strong className="text-neutral-400">{targetDetail}</strong>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                            {/* Ativar / Desativar */}
                            <button
                              onClick={async () => {
                                const nextState = item.is_active === false ? true : false;
                                await saveMenuItem({ ...item, is_active: nextState });
                                showToast(`Item "${item.label}" ${nextState ? 'ativado' : 'desativado'} no menu.`);
                              }}
                              className={`px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors ${
                                item.is_active !== false
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-red-950/50 text-red-400 border border-red-900/50'
                              }`}
                            >
                              {item.is_active !== false ? 'Ativo no Menu' : 'Desativado'}
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => setEditingMenuItem(item)}
                              className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-white hover:text-black rounded text-xs font-sans tracking-wider uppercase transition-colors flex items-center gap-1 font-semibold"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => setMenuItemToDelete(item)}
                              className="p-2 text-[#666666] hover:text-red-400 hover:bg-red-950/40 rounded bg-[#141414] border border-[#222222] hover:border-red-900/50 transition-colors flex items-center justify-center shrink-0"
                              title={`Eliminar item "${item.label}" do menu`}
                              aria-label={`Eliminar item "${item.label}" do menu`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Modal de Escolha ao Adicionar Novo Bloco no Page Builder */}
            {isAddingBlockPickerOpen && (
              <div
                id="block-picker-backdrop"
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                onClick={(e) => {
                  if ((e.target as HTMLElement).id === 'block-picker-backdrop') {
                    setIsAddingBlockPickerOpen(false);
                  }
                }}
              >
                <div className="w-full max-w-xl bg-[#0c0c0c] border border-[#242424] rounded-xl p-6 space-y-5 shadow-2xl animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
                    <div>
                      <span className="text-[10px] bg-white text-black font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                        PAGE BUILDER
                      </span>
                      <h3 className="font-display uppercase text-lg text-white tracking-wider mt-1">
                        Escolha o Tipo de Bloco
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsAddingBlockPickerOpen(false)}
                      className="p-1.5 text-[#777777] hover:text-white rounded bg-[#161616]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#888888] font-sans">
                    Selecione o tipo de conteúdo ou secção que deseja posicionar na homepage do site:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
                    {/* 1. Conteúdo Personalizado (UNUSUAL MODELS, Portfólio, etc.) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBlockPickerOpen(false);
                        const firstCustom = customContents[0];
                        const newBlock: SiteBlock = {
                          id: `block_${firstCustom ? firstCustom.slug : 'custom'}_${Date.now()}`,
                          block_type: 'custom_content',
                          title: firstCustom?.internal_name || 'UNUSUAL MODELS',
                          public_name: firstCustom?.title || 'UNUSUAL MODELS',
                          subtitle: firstCustom?.subtitle || 'Portfolio / Conteúdo Personalizado',
                          content_type: 'custom',
                          custom_content_id: firstCustom?.id,
                          slug: firstCustom?.slug || 'unusual-models',
                          content: {
                            custom_content_id: firstCustom?.id,
                            heading: firstCustom?.title || 'UNUSUAL MODELS',
                            subheading: firstCustom?.subtitle || 'Portfolio / Conteúdo Personalizado',
                            description: firstCustom?.description || '',
                            images: firstCustom?.images || [],
                            items: firstCustom?.items || [],
                          },
                          is_active: true,
                          order_index: blocks.length + 1,
                        };
                        setEditingBlock(newBlock);
                      }}
                      className="p-4 bg-[#141414] hover:bg-[#1f1f1f] border border-amber-500/40 rounded-lg text-left space-y-1 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <strong className="text-white text-xs uppercase tracking-wider group-hover:text-amber-300">
                          Conteúdo Personalizado
                        </strong>
                      </div>
                      <p className="text-[11px] text-[#777777]">
                        UNUSUAL MODELS, Portfólio de Modelos, Lookbooks ou Campanhas editoriais.
                      </p>
                    </button>

                    {/* 2. Grelha do Drop Atual (Produtos) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBlockPickerOpen(false);
                        const newBlock: SiteBlock = {
                          id: `block_drop_${Date.now()}`,
                          block_type: 'drop_grid',
                          title: 'Grelha do Drop Atual',
                          public_name: 'DROP ATUAL',
                          subtitle: 'EDIÇÃO LIMITADA. PRODUZIDO EM ANGOLA.',
                          content_type: 'product',
                          content: {
                            heading: 'DROP ATUAL',
                            subheading: 'Edição limitada. Produzido em Angola.',
                            show_categories_filter: true,
                          },
                          is_active: true,
                          order_index: blocks.length + 1,
                        };
                        setEditingBlock(newBlock);
                      }}
                      className="p-4 bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] rounded-lg text-left space-y-1 transition-all group"
                    >
                      <strong className="text-white text-xs uppercase tracking-wider group-hover:text-white block">
                        Grelha do Drop (Produtos)
                      </strong>
                      <p className="text-[11px] text-[#777777]">
                        Apresentação das peças de vestuário ativas com preços, badges e filtros.
                      </p>
                    </button>

                    {/* 3. Hero Banner */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBlockPickerOpen(false);
                        const newBlock: SiteBlock = {
                          id: `block_hero_${Date.now()}`,
                          block_type: 'hero_banner',
                          title: 'Banner Principal (Hero)',
                          public_name: 'HERO BANNER',
                          subtitle: 'DESTAQUE PRINCIPAL',
                          content_type: 'product',
                          content: {
                            drop_tag: 'NOVA COLEÇÃO',
                            drop_title: 'Wearing Unusual',
                            cta_text: 'COMPRAR AGORA',
                            cta_link: '#drop-atual',
                            bg_image: '/assets/hero-banner.png',
                            bg_images: ['/assets/hero-banner.png'],
                            overlay_opacity: 0.55,
                            text_alignment: 'left',
                          },
                          is_active: true,
                          order_index: blocks.length + 1,
                        };
                        setEditingBlock(newBlock);
                      }}
                      className="p-4 bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] rounded-lg text-left space-y-1 transition-all group"
                    >
                      <strong className="text-white text-xs uppercase tracking-wider group-hover:text-white block">
                        Banner Hero Principal
                      </strong>
                      <p className="text-[11px] text-[#777777]">
                        Banner visual imersivo com carrossel de fotos e botões de chamada.
                      </p>
                    </button>

                    {/* 4. Letreiro Superior (Marquee) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBlockPickerOpen(false);
                        const newBlock: SiteBlock = {
                          id: `block_marquee_${Date.now()}`,
                          block_type: 'marquee',
                          title: 'Letreiro Superior',
                          public_name: 'LETREIRO ANÚNCIOS',
                          subtitle: 'Mensagens em Loop',
                          content_type: 'product',
                          content: {
                            items: [
                              'WEARING UNUSUAL • HIGH-END STREETWEAR',
                              'ENTREGAS EM LUANDA',
                              'PAGAMENTO MULTICAIXA EXPRESS',
                            ],
                            speed_seconds: 25,
                            bg_color: '#000000',
                            text_color: '#d4d4d4',
                          },
                          is_active: true,
                          order_index: blocks.length + 1,
                        };
                        setEditingBlock(newBlock);
                      }}
                      className="p-4 bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] rounded-lg text-left space-y-1 transition-all group"
                    >
                      <strong className="text-white text-xs uppercase tracking-wider group-hover:text-white block">
                        Letreiro Marquee
                      </strong>
                      <p className="text-[11px] text-[#777777]">
                        Faixa de anúncios com animação infinita de texto no topo.
                      </p>
                    </button>

                    {/* 5. Galeria Lookbook */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBlockPickerOpen(false);
                        const newBlock: SiteBlock = {
                          id: `block_lookbook_${Date.now()}`,
                          block_type: 'lookbook',
                          title: 'Galeria Lookbook',
                          public_name: 'LOOKBOOK',
                          subtitle: 'EDITORIAL VISUAL',
                          content_type: 'custom',
                          content: {
                            heading: 'LOOKBOOK',
                            description: 'Documentação visual das silhuetas e caimentos.',
                            columns: 3,
                            images: [],
                          },
                          is_active: true,
                          order_index: blocks.length + 1,
                        };
                        setEditingBlock(newBlock);
                      }}
                      className="p-4 bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] rounded-lg text-left space-y-1 transition-all group"
                    >
                      <strong className="text-white text-xs uppercase tracking-wider group-hover:text-white block">
                        Galeria Lookbook
                      </strong>
                      <p className="text-[11px] text-[#777777]">
                        Mosaico visual fotográfico com legendas para editorial de moda.
                      </p>
                    </button>

                    {/* 6. Manifesto da Marca */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBlockPickerOpen(false);
                        const newBlock: SiteBlock = {
                          id: `block_manifesto_${Date.now()}`,
                          block_type: 'manifesto',
                          title: 'Manifesto da Marca',
                          public_name: 'MANIFESTO',
                          subtitle: 'FILOSOFIA DA MARCA',
                          content_type: 'product',
                          content: {
                            heading: 'O MANIFESTO',
                            text: 'A Unusual é uma marca de streetwear minimalista focada na representação do universo artístico.',
                            subtext: 'Inspired by the fear of being average.',
                          },
                          is_active: true,
                          order_index: blocks.length + 1,
                        };
                        setEditingBlock(newBlock);
                      }}
                      className="p-4 bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] rounded-lg text-left space-y-1 transition-all group"
                    >
                      <strong className="text-white text-xs uppercase tracking-wider group-hover:text-white block">
                        Manifesto da Marca
                      </strong>
                      <p className="text-[11px] text-[#777777]">
                        Declaração cultural e artística da Wearing Unusual.
                      </p>
                    </button>

                    {/* 7. Cápsula do Tempo */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBlockPickerOpen(false);
                        const newBlock: SiteBlock = {
                          id: `block_capsule_${Date.now()}`,
                          block_type: 'time_capsule',
                          title: 'Cápsula do Tempo (Arquivo Histórico)',
                          public_name: 'CÁPSULA DO TEMPO',
                          subtitle: 'HISTÓRIA E MEMÓRIAS',
                          content_type: 'product',
                          content: {
                            heading: 'CÁPSULA DO TEMPO',
                            subheading: 'Arquivo de silhuetas e lançamentos esgotados.',
                            notice: 'Peças em arquivo histórico. Não disponíveis para compra imediata.',
                          },
                          is_active: true,
                          order_index: blocks.length + 1,
                        };
                        setEditingBlock(newBlock);
                      }}
                      className="p-4 bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] rounded-lg text-left space-y-1 transition-all group sm:col-span-2"
                    >
                      <strong className="text-white text-xs uppercase tracking-wider group-hover:text-white block">
                        Cápsula do Tempo (Arquivo Histórico)
                      </strong>
                      <p className="text-[11px] text-[#777777]">
                        Acesso ao acervo histórico com recolha de interesse para relançamento das coleções.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================================== */}
        {/* MOTOR 3: DICIONÁRIO E MICRO-COPY UNIVERSAL */}
        {/* ============================================================================== */}
        {activeEngine === 'dictionary' && (
          <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-lg border border-[#1f1f1f]">
                <div>
                  <h2 className="font-display uppercase text-lg text-white tracking-wider">
                    MOTOR DE DICIONÁRIO E MICRO-COPY UNIVERSAL
                  </h2>
                  <p className="text-xs text-[#777777] font-sans">
                    Nenhum texto do site está fixo no código. Modifique qualquer frase em Português e Inglês com salvamento em tempo real.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingDictKey(true)}
                  className="px-4 py-2 bg-white text-black font-sans font-bold text-xs tracking-wider uppercase rounded hover:bg-[#eaeaea] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Frase / Chave</span>
                </button>
              </div>

              {/* Add New Key Form Modal/Card */}
              {isAddingDictKey && (
                <div className="p-5 bg-[#101010] border border-[#2a2a2a] rounded-lg space-y-4 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                    <span className="font-display uppercase text-white tracking-wider text-sm">
                      ADICIONAR NOVA FRASE OU TEXTO AO DICIONÁRIO
                    </span>
                    <button
                      onClick={() => setIsAddingDictKey(false)}
                      className="text-[#777777] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Chave do Sistema (Identificador Único) *
                      </label>
                      <input
                        type="text"
                        value={newDictEntry.key}
                        onChange={(e) =>
                          setNewDictEntry({
                            ...newDictEntry,
                            key: e.target.value.toLowerCase().replace(/\s+/g, '.'),
                          })
                        }
                        placeholder="Ex: header.tagline ou checkout.disclaimer"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">Categoria</label>
                      <select
                        value={newDictEntry.category}
                        onChange={(e) =>
                          setNewDictEntry({
                            ...newDictEntry,
                            category: e.target.value as DictionaryEntry['category'],
                          })
                        }
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                      >
                        <option value="navigation">Navegação & Menus</option>
                        <option value="buttons">Botões de Ação</option>
                        <option value="headings">Títulos & Cabeçalhos</option>
                        <option value="checkout">Checkout & Pagamento</option>
                        <option value="footer">Rodapé</option>
                        <option value="manifesto">Manifesto</option>
                        <option value="tracking">Rastreio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Texto em Português (PT) *
                      </label>
                      <input
                        type="text"
                        value={newDictEntry.pt}
                        onChange={(e) => setNewDictEntry({ ...newDictEntry, pt: e.target.value })}
                        placeholder="Ex: Nova Coleção Disponível"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Texto em Inglês (EN) *
                      </label>
                      <input
                        type="text"
                        value={newDictEntry.en}
                        onChange={(e) => setNewDictEntry({ ...newDictEntry, en: e.target.value })}
                        placeholder="Ex: New Collection Available"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingDictKey(false)}
                      className="px-4 py-2 bg-[#1b1b1b] text-[#888888] hover:text-white rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        if (!newDictEntry.key.trim() || !newDictEntry.pt.trim()) {
                          showToast('Preencha a chave e o texto em português.');
                          return;
                        }
                        await saveDictionaryEntry({
                          key: newDictEntry.key.trim(),
                          pt: newDictEntry.pt.trim(),
                          en: (newDictEntry.en || newDictEntry.pt).trim(),
                          category: newDictEntry.category,
                        });
                        setIsAddingDictKey(false);
                        setNewDictEntry({ key: '', pt: '', en: '', category: 'headings' });
                        showToast(`Chave "${newDictEntry.key}" adicionada com sucesso!`);
                      }}
                      className="px-5 py-2 bg-white text-black font-bold uppercase rounded hover:bg-[#e0e0e0]"
                    >
                      Adicionar ao Dicionário
                    </button>
                  </div>
                </div>
              )}

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dictSearch}
                    onChange={(e) => setDictSearch(e.target.value)}
                    placeholder="Pesquisar frase ou chave..."
                    className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#242424] rounded text-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'navigation', label: 'Menu' },
                    { id: 'buttons', label: 'Botões' },
                    { id: 'headings', label: 'Títulos' },
                    { id: 'checkout', label: 'Checkout' },
                    { id: 'footer', label: 'Rodapé' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDictCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-wider font-mono transition-colors whitespace-nowrap ${
                        dictCategoryFilter === cat.id
                          ? 'bg-white text-black font-bold'
                          : 'bg-[#151515] text-[#888888] hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entries Table */}
              <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg overflow-hidden">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#141414] text-[#888888] uppercase text-[10px] tracking-wider border-b border-[#222222]">
                    <tr>
                      <th className="py-3.5 px-4">CHAVE DO SISTEMA</th>
                      <th className="py-3.5 px-4">PORTUGUÊS (PT)</th>
                      <th className="py-3.5 px-4">INGLÊS (EN)</th>
                      <th className="py-3.5 px-4 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181818]">
                    {filteredDictionaryEntries.map((entry) => (
                      <tr key={entry.key} className="hover:bg-[#141414] transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-[#888888]">
                          <span className="text-white font-medium block">{entry.key}</span>
                          <span className="text-[9px] text-[#555555] uppercase">{entry.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            defaultValue={entry.pt}
                            onBlur={async (e) => {
                              if (e.target.value !== entry.pt) {
                                await saveDictionaryEntry({ ...entry, pt: e.target.value });
                                showToast(`Texto PT atualizado para "${entry.key}"`);
                              }
                            }}
                            className="w-full bg-[#141414] px-2.5 py-1.5 rounded border border-transparent focus:border-[#444444] text-white focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            defaultValue={entry.en}
                            onBlur={async (e) => {
                              if (e.target.value !== entry.en) {
                                await saveDictionaryEntry({ ...entry, en: e.target.value });
                                showToast(`Texto EN atualizado para "${entry.key}"`);
                              }
                            }}
                            className="w-full bg-[#141414] px-2.5 py-1.5 rounded border border-transparent focus:border-[#444444] text-[#cccccc] focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                            Auto-salvo
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredDictionaryEntries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#666666]">
                          Nenhuma frase encontrada para a busca atual.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {/* ============================================================================== */}
        {/* MOTOR 4: CONFIGURAÇÕES DA MARCA & LOGÓTIPO GLOBAL (SUPABASE) */}
        {/* ============================================================================== */}
        {activeEngine === 'brand' && (
          <BrandLogoManager onSuccessToast={showToast} />
        )}

        {/* ============================================================================== */}
        {/* MOTOR 5: REGRAS DE NEGÓCIO E CHECKOUT */}
        {/* ============================================================================== */}
        {activeEngine === 'settings' && (
          <div className="space-y-6">
            {/* Header with Save Button */}
            <div className="bg-[#0d0d0d] p-4 sm:p-5 rounded-lg border border-[#1f1f1f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display uppercase text-base sm:text-lg text-white tracking-wider">
                  MOTOR DE REGRAS DE NEGÓCIO & CHECKOUT
                </h2>
                <p className="text-xs text-[#777777] font-sans mt-0.5">
                  Dados de pagamento Multicaixa Express, regras de envio em Luanda, interruptores globais e identidade.
                </p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {isSettingsDirty && (
                  <span className="text-[10px] text-amber-400 font-mono font-medium px-2 py-1 bg-amber-950/60 border border-amber-800/80 rounded whitespace-nowrap">
                    Alterações pendentes
                  </span>
                )}
                {isSettingsDirty && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsForm(settings);
                      setIsSettingsDirty(false);
                      showToast('Alterações canceladas');
                    }}
                    className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] text-[#999999] hover:text-white rounded text-xs font-sans uppercase tracking-wider transition-colors whitespace-nowrap"
                  >
                    Reverter
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveSettingsForm}
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white text-black hover:bg-[#ececec] rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'A GUARDAR...' : 'GUARDAR ALTERAÇÕES'}</span>
                </button>
              </div>
            </div>

            {/* Shipping Notice Card */}
            <div className="bg-[#121212] border border-[#262626] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs font-sans space-y-1">
                <span className="text-white font-bold block uppercase tracking-wider text-xs">
                  Regra Dinâmica de Entrega Automática (Luanda)
                </span>
                <p className="text-[#a0a0a0] leading-relaxed">
                  • Subtotal das compras <strong className="text-white">igual ou superior a 20.000 AOA</strong>: Taxa de entrega é <strong className="text-emerald-400 uppercase">GRÁTIS (0 AOA)</strong> com barra de progresso visual no checkout.<br />
                  • Subtotal das compras <strong className="text-white">inferior a 20.000 AOA</strong>: Taxa de entrega fixa configurada em <strong className="text-white font-mono">{formatAOA(settingsForm.delivery_fee_aoa !== undefined ? settingsForm.delivery_fee_aoa : 5000)}</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Settings */}
              <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-4 font-sans text-xs">
                <h3 className="font-display uppercase text-sm text-white tracking-wider pb-3 border-b border-[#1c1c1c]">
                  GESTOR DE PAGAMENTOS MULTICAIXA EXPRESS
                </h3>

                <div>
                  <label className="block text-[#888888] uppercase mb-1">IBAN de Destino *</label>
                  <input
                    type="text"
                    value={settingsForm.iban}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, iban: e.target.value }));
                      setIsSettingsDirty(true);
                    }}
                    placeholder="AO06 0000 0000 0000 0000 0"
                    className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] uppercase mb-1">Titular da Conta *</label>
                  <input
                    type="text"
                    value={settingsForm.account_holder}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, account_holder: e.target.value }));
                      setIsSettingsDirty(true);
                    }}
                    placeholder="Nome do Beneficiário"
                    className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] uppercase mb-1">Nº do Express *</label>
                  <input
                    type="text"
                    value={settingsForm.account_number}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, account_number: e.target.value }));
                      setIsSettingsDirty(true);
                    }}
                    placeholder="Ex: 923 000 000 ou Nº do Express"
                    className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono"
                  />
                  <span className="text-[10px] text-[#666666] mt-1 block">
                    Apresentado no checkout como &quot;Nº do Express&quot; para os clientes efetuarem o pagamento direto.
                  </span>
                </div>

                <div>
                  <label className="block text-[#888888] uppercase mb-1">Taxa de Entrega Padrão (&lt; 20.000 AOA) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={settingsForm.delivery_fee_aoa !== undefined ? settingsForm.delivery_fee_aoa : 5000}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, delivery_fee_aoa: Number(e.target.value) }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="5000"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-[#777777]">AOA</span>
                  </div>
                  <span className="text-[10px] text-[#666666] mt-1 block">
                    Valor cobrado automaticamente no checkout se o subtotal for inferior a 20.000 AOA (acima disso o frete é Grátis).
                  </span>
                </div>

                {/* Require Proof Toggle */}
                <div className="pt-3 border-t border-[#1c1c1c] flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium block">Exigir Comprovativo Obrigatório</span>
                    <span className="text-[11px] text-[#666666] block">
                      Bloqueia a submissão de encomendas sem ficheiro de comprovativo anexado.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsForm((prev) => ({
                        ...prev,
                        require_payment_proof: !prev.require_payment_proof,
                      }));
                      setIsSettingsDirty(true);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settingsForm.require_payment_proof ? 'bg-white' : 'bg-[#222222]'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                        settingsForm.require_payment_proof ? 'right-1 bg-black' : 'left-1 bg-[#888888]'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Global Switches */}
              <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-4 font-sans text-xs">
                <h3 className="font-display uppercase text-sm text-white tracking-wider pb-3 border-b border-[#1c1c1c]">
                  INTERRUPTORES GLOBAIS DE ESTADO
                </h3>

                {/* Checkout Lock */}
                <div className={`p-4 rounded-lg border transition-all space-y-3 ${
                  settingsForm.checkout_locked ? 'bg-red-950/20 border-red-800/80' : 'bg-[#141414] border-[#222222]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${settingsForm.checkout_locked ? 'bg-red-400 animate-pulse' : 'bg-[#555555]'}`} />
                        <span className="text-white font-medium block">Bloqueio Temporário de Checkout</span>
                      </div>
                      <span className="text-[11px] text-[#777777] block mt-0.5">
                        {settingsForm.checkout_locked
                          ? 'CHECKOUT SUSPENSO: Nenhuma compra ou pre-order pode ser finalizada.'
                          : 'CHECKOUT ATIVO: Clientes podem finalizar compras e pre-orders normalmente.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const nextVal = !settingsForm.checkout_locked;
                        const updated = { ...settingsForm, checkout_locked: nextVal };
                        setSettingsForm(updated);
                        setIsSettingsDirty(true);
                        try {
                          await saveSettings(updated);
                          showToast(
                            nextVal
                              ? 'Bloqueio de Checkout ATIVADO (compras suspensas na loja pública)'
                              : 'Checkout LIBERADO para compras!'
                          );
                        } catch {
                          showToast('Erro ao atualizar bloqueio de checkout');
                        }
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        settingsForm.checkout_locked ? 'bg-red-500' : 'bg-[#222222]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                          settingsForm.checkout_locked ? 'right-1 bg-white' : 'left-1 bg-[#888888]'
                        }`}
                      />
                    </button>
                  </div>

                  {settingsForm.checkout_locked && (
                    <div className="pt-2 border-t border-red-900/40 space-y-1.5 animate-in fade-in">
                      <label className="text-[10px] text-red-300 uppercase tracking-wider block font-mono">
                        Mensagem de Bloqueio Exibida no Frontend
                      </label>
                      <textarea
                        rows={2}
                        value={settingsForm.checkout_lock_message || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, checkout_lock_message: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="O CHECKOUT ENCONTRA-SE TEMPORARIAMENTE SUSPENSO PARA CONTAGEM DE STOCK."
                        className="w-full px-3 py-2 bg-[#0c0c0c] border border-red-900/60 rounded text-xs text-white placeholder-red-400/50 outline-none focus:border-red-400 font-sans"
                      />
                      <span className="text-[10px] text-[#888888] block">
                        Esta mensagem aparece no topo da loja, no saco de compras e no modal de checkout.
                      </span>
                    </div>
                  )}
                </div>

                {/* Maintenance Mode */}
                <div className={`p-4 rounded-lg border transition-all space-y-3 ${
                  settingsForm.maintenance_mode ? 'bg-amber-950/25 border-amber-500/80 shadow-lg' : 'bg-[#141414] border-[#222222]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${settingsForm.maintenance_mode ? 'bg-amber-400 animate-pulse' : 'bg-[#555555]'}`} />
                        <span className="text-white font-medium block">Modo Manutenção (Loja Pública)</span>
                      </div>
                      <span className="text-[11px] text-[#777777] block mt-0.5">
                        {settingsForm.maintenance_mode
                          ? 'MANUTENÇÃO ATIVA: A loja pública exibe a tela oficial de manutenção Wearing Unusual.'
                          : 'LOJA ONLINE: Catálogo público 100% acessível aos clientes.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const nextVal = !settingsForm.maintenance_mode;
                        const updated = { ...settingsForm, maintenance_mode: nextVal };
                        setSettingsForm(updated);
                        setIsSettingsDirty(true);
                        try {
                          await saveSettings(updated);
                          showToast(
                            nextVal
                              ? 'Modo de Manutenção ATIVADO na loja pública!'
                              : 'Modo de Manutenção DESATIVADO. Loja online!'
                          );
                        } catch {
                          showToast('Erro ao atualizar modo de manutenção');
                        }
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        settingsForm.maintenance_mode ? 'bg-amber-500 shadow-md' : 'bg-[#222222]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                          settingsForm.maintenance_mode ? 'right-1 bg-black' : 'left-1 bg-[#888888]'
                        }`}
                      />
                    </button>
                  </div>

                  {settingsForm.maintenance_mode && (
                    <div className="pt-2 border-t border-amber-500/30 space-y-2 animate-in fade-in">
                      <div>
                        <label className="text-[10px] text-amber-300 uppercase tracking-wider block font-mono mb-1">
                          Mensagem Editorial de Manutenção
                        </label>
                        <textarea
                          rows={3}
                          value={settingsForm.maintenance_message || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, maintenance_message: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="ESTAMOS A ATUALIZAR O NOSSO ESPAÇO PARA O PRÓXIMO LANÇAMENTO. RETORNAREMOS EM BREVE."
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-amber-500/40 rounded text-xs text-white placeholder-[#777777] outline-none focus:border-amber-400 font-sans"
                        />
                      </div>
                      <div className="p-2.5 rounded bg-black/50 border border-[#2a2a2a] text-[11px] text-[#aaaaaa] flex items-center justify-between">
                        <span>A tela de manutenção mantém suporte via WhatsApp e rastreio de encomendas ativos.</span>
                        <a
                          href="/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline uppercase font-mono text-[10px] shrink-0 ml-2"
                        >
                          Ver Loja &rarr;
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Marquee Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-[#141414] rounded-lg border border-[#222222]">
                  <div>
                    <span className="text-white font-medium block">Barra de Notificações no Topo</span>
                    <span className="text-[11px] text-[#666666] block">
                      Ativa o letreiro marquee contínuo no cabeçalho.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const nextVal = !settingsForm.marquee_enabled;
                      const updated = { ...settingsForm, marquee_enabled: nextVal };
                      setSettingsForm(updated);
                      setIsSettingsDirty(true);
                      try {
                        await saveSettings(updated);
                        showToast(nextVal ? 'Barra de Notificações ATIVADA' : 'Barra de Notificações DESATIVADA');
                      } catch {}
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settingsForm.marquee_enabled ? 'bg-white' : 'bg-[#222222]'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                        settingsForm.marquee_enabled ? 'right-1 bg-black' : 'left-1 bg-[#888888]'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Global Button Toggles & Micro-copy Configuration */}
              <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-5 font-sans text-xs md:col-span-2">
                <div className="pb-3 border-b border-[#1c1c1c] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display uppercase text-sm text-white tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-white" />
                      <span>AUTONOMIA DE BOTÕES & MICRO-COPY (PRE-ORDER & REPOSIÇÃO)</span>
                    </h3>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Controlo dinâmico da visibilidade e dos rótulos dos botões na montra pública sem necessidade de alterar código.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161616] text-[#888888] border border-[#262626] self-start sm:self-auto">
                    AUTONOMIA TOTAL
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* PRE-ORDER BUTTON CONFIG */}
                  <div className="p-4 bg-[#141414] border border-[#222222] rounded space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-white font-medium block">Botão de Pre-Order Global</span>
                          <span className="text-[11px] text-[#777777] block">
                            Ativa o botão de pré-venda nas peças com pre-order configurada.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsForm((prev) => ({
                            ...prev,
                            enable_pre_order_button: prev.enable_pre_order_button !== false ? false : true,
                          }));
                          setIsSettingsDirty(true);
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                          settingsForm.enable_pre_order_button !== false ? 'bg-amber-400' : 'bg-[#222222]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                            settingsForm.enable_pre_order_button !== false ? 'right-1 bg-black' : 'left-1 bg-[#888888]'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1f1f1f]">
                      <div>
                        <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">
                          Texto do Botão (PT)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.pre_order_button_text_pt || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({
                              ...prev,
                              pre_order_button_text_pt: e.target.value,
                            }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="PRE-ORDER"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">
                          Texto do Botão (EN)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.pre_order_button_text_en || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({
                              ...prev,
                              pre_order_button_text_en: e.target.value,
                            }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="PRE-ORDER"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Button Live Preview */}
                    <div className="pt-2 border-t border-[#1f1f1f]">
                      <div className="text-[10px] text-[#666666] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Pré-visualização do Botão</span>
                        <span className="font-mono text-[9px] text-amber-400">
                          {settingsForm.enable_pre_order_button !== false ? 'ATIVO NA LOJA' : 'DESATIVADO'}
                        </span>
                      </div>
                      <div
                        className={`w-full py-2.5 px-4 rounded text-center text-xs font-sans font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 border ${
                          settingsForm.enable_pre_order_button !== false
                            ? 'bg-white text-black border-white shadow'
                            : 'bg-[#181818] text-[#555555] border-[#262626] opacity-60'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{settingsForm.pre_order_button_text_pt || 'PRE-ORDER'}</span>
                      </div>
                    </div>
                  </div>

                  {/* SETTINGS → PRE-ORDER CONTENT → WHATSAPP & DELIVERY DATES */}
                  <div className="p-4 bg-[#141414] border border-amber-500/30 rounded space-y-4 md:col-span-2 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#222222]">
                      <div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-bold font-display uppercase tracking-wider text-xs">
                            SETTINGS → PRE-ORDER CONTENT → WHATSAPP & DATAS DE ENTREGA
                          </span>
                        </div>
                        <p className="text-[11px] text-[#777777] mt-0.5">
                          Edite os textos oficiais da notificação de pré-encomenda pronta, link direto de agendamento e calendário de entrega.
                        </p>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 self-start sm:self-auto">
                        WHATSAPP BUSINESS READY
                      </span>
                    </div>

                    {/* WhatsApp Template PT & EN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1 font-mono font-bold flex items-center justify-between">
                          <span>Template WhatsApp Mensagem (PT) *</span>
                          <span className="text-[9px] text-[#666666] font-normal">[DATA] e [LINK] substituídos auto</span>
                        </label>
                        <textarea
                          rows={6}
                          value={settingsForm.pre_order_whatsapp_template_pt || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, pre_order_whatsapp_template_pt: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder={`UNUSUAL —  ENCOMENDA PRONTA\n\nA tua encomenda está pronta para entrega!\n\nAs entregas começam no dia [DATA].\n\nPor favor, escolhe a data da tua entrega através do link abaixo:\n\n[ ESCOLHER DATA DE ENTREGA ]`}
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-emerald-400 outline-none leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1 font-mono font-bold flex items-center justify-between">
                          <span>Template WhatsApp Mensagem (EN) *</span>
                          <span className="text-[9px] text-[#666666] font-normal">[DATA] and [LINK] replaced auto</span>
                        </label>
                        <textarea
                          rows={6}
                          value={settingsForm.pre_order_whatsapp_template_en || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, pre_order_whatsapp_template_en: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder={`UNUSUAL — ORDER READY\n\nYour order is ready for delivery!\n\nDeliveries start on [DATA].\n\nPlease select your preferred delivery date through the link below:\n\n[ CHOOSE DELIVERY DATE ]`}
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-emerald-400 outline-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Deliveries Start Date and Available Delivery Dates for Calendar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1f1f1f]">
                      <div>
                        <label className="text-[10px] text-amber-300 uppercase tracking-wider block mb-1 font-mono font-bold">
                          Data de Início das Entregas (exibida no WhatsApp)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.pre_order_deliveries_start_date || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, pre_order_deliveries_start_date: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="Ex: 15 de Outubro de 2026"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-amber-300 uppercase tracking-wider block mb-1 font-mono font-bold">
                          Datas Autorizadas para Entrega (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          value={
                            Array.isArray(settingsForm.pre_order_available_dates)
                              ? settingsForm.pre_order_available_dates.join(', ')
                              : (settingsForm.pre_order_available_dates as any) || ''
                          }
                          onChange={(e) => {
                            const rawArr = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            setSettingsForm((prev) => ({ ...prev, pre_order_available_dates: rawArr }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="2026-10-15, 2026-10-16, 2026-10-17, 2026-10-18"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                        <span className="text-[10px] text-[#666666] block mt-1">
                          Apenas estas datas estarão ativas para seleção no calendário do cliente.
                        </span>
                      </div>
                    </div>

                    {/* Pre-Order Date Selection Page Micro-copy */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1f1f1f]">
                      <div>
                        <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                          Título da Página de Escolha de Data (PT)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.choose_date_title_pt || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, choose_date_title_pt: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="ESCOLHER DATA DE ENTREGA"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                          Título da Página de Escolha de Data (EN)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.choose_date_title_en || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, choose_date_title_en: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="CHOOSE DELIVERY DATE"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                          Texto do Botão de Confirmação (PT)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.choose_date_submit_btn_pt || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, choose_date_submit_btn_pt: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="CONFIRMAR DATA DE ENTREGA"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                          Texto do Botão de Confirmação (EN)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.choose_date_submit_btn_en || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({ ...prev, choose_date_submit_btn_en: e.target.value }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="CONFIRM DELIVERY DATE"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RESTOCK REQUEST BUTTON CONFIG */}
                  <div className="p-4 bg-[#141414] border border-[#222222] rounded space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-white" />
                        <div>
                          <span className="text-white font-medium block">Botão de Pedir Reposição</span>
                          <span className="text-[11px] text-[#777777] block">
                            Exibe botão de lista de espera quando a peça estiver esgotada.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsForm((prev) => ({
                            ...prev,
                            enable_request_restock_button: prev.enable_request_restock_button !== false ? false : true,
                          }));
                          setIsSettingsDirty(true);
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                          settingsForm.enable_request_restock_button !== false ? 'bg-white' : 'bg-[#222222]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                            settingsForm.enable_request_restock_button !== false ? 'right-1 bg-black' : 'left-1 bg-[#888888]'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1f1f1f]">
                      <div>
                        <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">
                          Texto do Botão (PT)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.request_restock_button_text_pt || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({
                              ...prev,
                              request_restock_button_text_pt: e.target.value,
                            }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="REQUEST RESTOCK"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">
                          Texto do Botão (EN)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.request_restock_button_text_en || ''}
                          onChange={(e) => {
                            setSettingsForm((prev) => ({
                              ...prev,
                              request_restock_button_text_en: e.target.value,
                            }));
                            setIsSettingsDirty(true);
                          }}
                          placeholder="REQUEST RESTOCK"
                          className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#262626] rounded text-white font-mono text-xs focus:border-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Button Live Preview */}
                    <div className="pt-2 border-t border-[#1f1f1f]">
                      <div className="text-[10px] text-[#666666] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Pré-visualização do Botão</span>
                        <span className="font-mono text-[9px] text-[#aaaaaa]">
                          {settingsForm.enable_request_restock_button !== false ? 'ATIVO NA LOJA' : 'DESATIVADO'}
                        </span>
                      </div>
                      <div
                        className={`w-full py-2.5 px-4 rounded text-center text-xs font-sans font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2 border ${
                          settingsForm.enable_request_restock_button !== false
                            ? 'bg-[#181818] hover:bg-[#202020] text-white border-[#333333]'
                            : 'bg-[#141414] text-[#555555] border-[#222222] opacity-60'
                        }`}
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-400" />
                        <span>{settingsForm.request_restock_button_text_pt || 'REQUEST RESTOCK'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SETTINGS → REQUEST RESTOCK CONTENT (CÁPSULA DO TEMPO) */}
              <div className="bg-[#0e0e0e] border border-amber-500/30 rounded-lg p-6 space-y-5 font-sans text-xs md:col-span-2 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1c1c1c]">
                  <div>
                    <h3 className="font-display uppercase text-sm text-white tracking-wider flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-amber-400" />
                      <span>SETTINGS → REQUEST RESTOCK CONTENT (CÁPSULA DO TEMPO)</span>
                    </h3>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Personalize todos os textos, títulos, descrições, labels, placeholders e mensagens do fluxo de medição de interesse da Cápsula do Tempo.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80 shrink-0">
                    SEM TEXTOS HARDCODED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Título Principal */}
                  <div>
                    <label className="text-[10px] text-amber-300 uppercase tracking-wider block mb-1 font-mono">
                      Título do Apelo (PT)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.restock_title_pt || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_title_pt: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="GOSTARIAS QUE ESTA COLEÇÃO VOLTASSE?"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-amber-300 uppercase tracking-wider block mb-1 font-mono">
                      Título do Apelo (EN)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.restock_title_en || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_title_en: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="WOULD YOU LIKE THIS COLLECTION TO RETURN?"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Descrição / Comunicação Natural */}
                  <div>
                    <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                      Descrição / Subtítulo (PT)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.restock_description_pt || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_description_pt: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Deixa-nos saber. O teu interesse ajuda-nos a decidir quais peças podem voltar."
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white text-xs focus:border-amber-400 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                      Descrição / Subtítulo (EN)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.restock_description_en || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_description_en: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Let us know. Your interest helps us decide which pieces may return."
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white text-xs focus:border-amber-400 outline-none font-sans"
                    />
                  </div>

                  {/* Nome do Botão de Ação */}
                  <div>
                    <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                      Texto do Botão no Produto (PT)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.request_restock_button_text_pt || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, request_restock_button_text_pt: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="REQUEST RESTOCK"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                      Texto do Botão no Produto (EN)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.request_restock_button_text_en || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, request_restock_button_text_en: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="REQUEST RESTOCK"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Botão de Submissão do Formulário */}
                  <div>
                    <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                      Texto Botão do Modal (PT)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.restock_submit_btn_pt || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_submit_btn_pt: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="REGISTAR INTERESSE • REQUEST RESTOCK"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#aaaaaa] uppercase tracking-wider block mb-1 font-mono">
                      Texto Botão do Modal (EN)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.restock_submit_btn_en || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_submit_btn_en: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="SUBMIT INTEREST • REQUEST RESTOCK"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Mensagem de Sucesso */}
                  <div>
                    <label className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1 font-mono">
                      Mensagem de Sucesso (PT)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.restock_success_message_pt || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_success_message_pt: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Interesse registado! Iremos avaliar a procura desta peça no atelier e avisar-te por WhatsApp assim que decidirmos reabrir produção."
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white text-xs focus:border-emerald-400 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1 font-mono">
                      Mensagem de Sucesso (EN)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.restock_success_message_en || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_success_message_en: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Interest recorded! We will assess demand for this piece and inform you via WhatsApp as soon as production reopens."
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white text-xs focus:border-emerald-400 outline-none font-sans"
                    />
                  </div>

                  {/* Labels e Placeholders dos Campos */}
                  <div>
                    <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1 font-mono">
                      Label / Placeholder Nome (PT)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={settingsForm.restock_name_label_pt || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_name_label_pt: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="O teu nome (opcional)"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs"
                      />
                      <input
                        type="text"
                        value={settingsForm.restock_name_placeholder_pt || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_name_placeholder_pt: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="Ex: Aldemir Santos"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1 font-mono">
                      Label / Placeholder Nome (EN)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={settingsForm.restock_name_label_en || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_name_label_en: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="Your name (optional)"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs"
                      />
                      <input
                        type="text"
                        value={settingsForm.restock_name_placeholder_en || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_name_placeholder_en: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="e.g. John Doe"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1 font-mono">
                      Label / Placeholder WhatsApp (PT)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={settingsForm.restock_phone_label_pt || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_phone_label_pt: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="WhatsApp / Telefone *"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs"
                      />
                      <input
                        type="text"
                        value={settingsForm.restock_phone_placeholder_pt || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_phone_placeholder_pt: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="+244 923 000 000"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1 font-mono">
                      Label / Placeholder WhatsApp (EN)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={settingsForm.restock_phone_label_en || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_phone_label_en: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="WhatsApp / Phone *"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs"
                      />
                      <input
                        type="text"
                        value={settingsForm.restock_phone_placeholder_en || ''}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({ ...prev, restock_phone_placeholder_en: e.target.value }));
                          setIsSettingsDirty(true);
                        }}
                        placeholder="+244 923 000 000"
                        className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#262626] rounded text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Mensagem de Erro */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-red-300 uppercase tracking-wider block mb-1 font-mono">
                      Mensagem de Erro de Validação de Telefone (PT)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.restock_phone_required_error_pt || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, restock_phone_required_error_pt: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Por favor, insere o teu número de WhatsApp ou telefone."
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white text-xs focus:border-red-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Identity & Public Footer Copy */}
              <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-4 font-sans text-xs md:col-span-2">
                <h3 className="font-display uppercase text-sm text-white tracking-wider pb-3 border-b border-[#1c1c1c] flex items-center justify-between">
                  <span>IDENTIDADE DA MARCA & TEXTOS DO RODAPÉ</span>
                  <span className="text-[10px] text-[#777777] font-sans">Sem textos estáticos</span>
                </h3>

                {/* Quick Logo Management Card */}
                <div className="p-4 bg-[#141414] border border-[#222222] rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <WULogo size="sm" imgClassName="h-7 w-auto object-contain" />
                    <div className="overflow-hidden">
                      <span className="text-white font-medium block">Logótipo Oficial da Marca</span>
                      <span className="text-[11px] text-[#777777] block font-mono truncate max-w-xs sm:max-w-md">
                        {settingsForm.site_logo_url || '/logo.png'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveEngine('brand')}
                    className="w-full sm:w-auto px-4 py-2 bg-white text-black hover:bg-neutral-200 font-sans font-bold text-xs uppercase tracking-wider rounded transition-colors whitespace-nowrap text-center"
                  >
                    Gerir Logótipo & Upload
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Nome da Marca / Loja</label>
                    <input
                      type="text"
                      value={settingsForm.store_name}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, store_name: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Localização & Entregas</label>
                    <input
                      type="text"
                      value={settingsForm.location_text || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, location_text: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Ex: Luanda, Angola • Entregas em Toda a Cidade"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Taxa Base de Encomendas &lt; 20.000 AOA</label>
                    <input
                      type="number"
                      value={settingsForm.delivery_fee_aoa !== undefined ? settingsForm.delivery_fee_aoa : 5000}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, delivery_fee_aoa: Number(e.target.value) }));
                        setIsSettingsDirty(true);
                      }}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">WhatsApp de Suporte</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp_number || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, whatsapp_number: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Ex: +244 923 000 000"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Instagram (@handle)</label>
                    <input
                      type="text"
                      value={settingsForm.instagram_handle || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, instagram_handle: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Ex: @wearingunusual"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      value={settingsForm.contact_email || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, contact_email: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Ex: contact@wearingunusual.com"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[#888888] uppercase mb-1">Biografia Editorial da Marca</label>
                    <textarea
                      rows={2}
                      value={settingsForm.brand_bio || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, brand_bio: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Ex: Wearing Unusual — Silhuetas brutas, estética de arquivo e vestuário conceptual..."
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[#888888] uppercase mb-1">Linha de Copyright (Rodapé)</label>
                    <input
                      type="text"
                      value={settingsForm.copyright_text || ''}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, copyright_text: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Ex: TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA."
                      className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded text-white"
                    />
                  </div>
                </div>

                {/* Bottom Save Bar */}
                <div className="pt-4 border-t border-[#1c1c1c] flex items-center justify-end gap-3">
                  {isSettingsDirty && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsForm(settings);
                        setIsSettingsDirty(false);
                        showToast('Alterações canceladas');
                      }}
                      className="px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] text-[#999999] hover:text-white rounded text-xs font-sans uppercase tracking-wider transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveSettingsForm}
                    disabled={isSavingSettings}
                    className="px-6 py-2.5 bg-white text-black hover:bg-[#ececec] rounded font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSettings ? 'A GUARDAR...' : 'GUARDAR CONFIGURAÇÕES'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* TAB: CONFIGURAÇÃO & DIAGNÓSTICO DO SUPABASE */}
        {/* ============================================================================== */}
        {activeEngine === 'supabase' && (
          <div className="space-y-6">
            <div className="bg-[#0d0d0d] p-6 rounded-lg border border-[#1f1f1f] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase block">
                    PROJECT ID: tmryqhilyisbfdpnsiwo
                  </span>
                  <h2 className="font-display uppercase text-lg sm:text-xl text-white tracking-wider mt-0.5">
                    CONEXÃO & ATIVAÇÃO DE TABELAS SUPABASE
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshSupabase}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-[#181818] hover:bg-white hover:text-black rounded text-xs font-sans uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Verificar Tabelas Agora</span>
                  </button>
                </div>
              </div>

              {/* Status Report */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 bg-[#121212] border border-[#222222] rounded text-xs font-sans">
                  <span className="text-[#777777] text-[10px] uppercase block">SUPABASE URL</span>
                  <span className="text-white font-mono truncate block mt-0.5">
                    {supabaseStatus.url}
                  </span>
                </div>

                <div className="p-3.5 bg-[#121212] border border-[#222222] rounded text-xs font-sans">
                  <span className="text-[#777777] text-[10px] uppercase block">STATUS DE CONEXÃO</span>
                  <span className="text-emerald-400 font-bold block mt-0.5">
                    Ativo & Autenticado
                  </span>
                </div>

                <div className="p-3.5 bg-[#121212] border border-[#222222] rounded text-xs font-sans">
                  <span className="text-[#777777] text-[10px] uppercase block">TABELAS NO BANCO</span>
                  <span
                    className={`font-bold block mt-0.5 ${
                      supabaseStatus.hasTables ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {supabaseStatus.hasTables
                      ? 'Todas as 5 Tabelas Criadas'
                      : `${supabaseStatus.missingTables.length} Tabelas Aguardando SQL`}
                  </span>
                </div>
              </div>

              {/* Table breakdown */}
              <div className="p-4 bg-[#121212] border border-[#222222] rounded-lg">
                <span className="text-[10px] text-[#777777] uppercase font-mono tracking-wider block mb-3">
                  DIAGNÓSTICO ESPECÍFICO DE CADA TABELA:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {[
                    { name: 'products', label: '1. Produtos' },
                    { name: 'orders', label: '2. Encomendas' },
                    { name: 'site_blocks', label: '3. Page Builder' },
                    { name: 'site_dictionary', label: '4. Dicionário' },
                    { name: 'site_settings', label: '5. Definições' },
                  ].map((tbl) => {
                    const isMissing = supabaseStatus.missingTables.includes(tbl.name);
                    return (
                      <div
                        key={tbl.name}
                        className={`p-2.5 rounded border text-xs font-sans ${
                          !isMissing
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                            : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-semibold">{tbl.name}</span>
                          {!isMissing ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="text-[9px] uppercase px-1 py-0.2 bg-amber-900/60 rounded text-amber-200">
                              Pendente
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#888888] block mt-0.5">{tbl.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick RLS & Permissions Repair Card */}
              <div className="bg-[#121212] border-2 border-emerald-900/60 rounded-lg p-5 space-y-3 font-sans text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <strong className="text-white text-sm uppercase tracking-wider font-display">
                        REPARO RÁPIDO DE POLÍTICAS RLS & CÁPSULA DO TEMPO (SEM CONFLITOS)
                      </strong>
                    </div>
                    <p className="text-[#999999] text-[11px] mt-1">
                      Resolve imediatamente erros de "policy already exists", ativa a permissão de leitura (SELECT) e impede que itens desapareçam visualmente do painel.
                    </p>
                  </div>

                  <button
                    onClick={handleCopyFixSql}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors shrink-0 shadow-lg shadow-emerald-950/50"
                  >
                    {copiedFixSql ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                    <span>{copiedFixSql ? 'SCRIPT DE REPARO COPIADO!' : 'COPIAR SCRIPT DE REPARO RLS'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#1c1c1c]">
                  <span className="text-[10px] text-[#666666] uppercase block mb-1">
                    CÓDIGO DE REPARO RÁPIDO (LIMPA POLÍTICAS DUPLICADAS E ATIVA LEITURA TOTAL):
                  </span>
                  <pre className="p-3 bg-black rounded border border-[#222222] font-mono text-[10px] text-emerald-400/90 overflow-x-auto max-h-36 leading-relaxed">
                    {SUPABASE_FIX_RLS_SQL}
                  </pre>
                </div>
              </div>

              {/* Step by step guide */}
              <div className="bg-[#121212] border border-[#262626] rounded-lg p-5 space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <span>Como ativar as tabelas no seu Supabase (Passo Único):</span>
                  </strong>

                  <button
                    onClick={handleCopySql}
                    className="px-4 py-2 bg-white text-black hover:bg-[#eaeaea] font-bold rounded text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                  >
                    {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSql ? 'CÓDIGO COPIADO!' : 'COPIAR SCRIPT SQL COMPLETO'}</span>
                  </button>
                </div>

                <ol className="list-decimal pl-5 space-y-2 text-[#a0a0a0] leading-relaxed">
                  <li>
                    Aceda ao seu painel Supabase:{' '}
                    <a
                      href="https://supabase.com/dashboard/project/tmryqhilyisbfdpnsiwo/sql"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white underline underline-offset-4 hover:text-emerald-300 inline-flex items-center gap-1"
                    >
                      <span>Abrir SQL Editor do Projeto (tmryqhilyisbfdpnsiwo)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Clique no botão acima <strong className="text-white">"COPIAR SCRIPT SQL COMPLETO"</strong>.</li>
                  <li>Cole no editor do Supabase e clique no botão verde <strong className="text-white">"RUN"</strong>.</li>
                  <li>Pronto! Todas as tabelas e políticas RLS públicas estarão criadas instantaneamente.</li>
                </ol>

                <div className="pt-3 border-t border-[#1c1c1c]">
                  <span className="text-[10px] text-[#666666] uppercase block mb-1">
                    PRÉ-VISUALIZAÇÃO DO SCRIPT SQL GERADO:
                  </span>
                  <pre className="p-3 bg-black rounded border border-[#222222] font-mono text-[10px] text-[#888888] overflow-x-auto max-h-48 leading-relaxed">
                    {SUPABASE_SCHEMA_SQL}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* MODAIS GLOBAIS DO SISTEMA (ACESSÍVEIS EM QUALQUER MOTOR / ABA) */}
        {/* ============================================================================== */}

        {/* Modal de Confirmação Segura para Eliminar Bloco do Page Builder */}
        {blockToDelete && (
          <div
            id="delete-block-backdrop"
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => {
              if ((e.target as HTMLElement).id === 'delete-block-backdrop') {
                setBlockToDelete(null);
              }
            }}
          >
            <div className="w-full max-w-md bg-[#0e0e0e] border border-red-900/50 rounded-xl p-6 space-y-4 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-3 text-red-400">
                <Trash2 className="w-5 h-5 shrink-0" />
                <h3 className="font-display uppercase text-base text-white tracking-wider">
                  Eliminar Bloco da Homepage?
                </h3>
              </div>

              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Tens a certeza que desejas eliminar o bloco{' '}
                <strong className="text-white font-bold">
                  "{blockToDelete.public_name || blockToDelete.title}"
                </strong>{' '}
                da estrutura da homepage?
              </p>

              <div className="p-3 bg-[#141414] border border-[#262626] rounded text-[11px] text-neutral-400 font-sans space-y-1">
                <p className="text-emerald-400 font-semibold uppercase text-[10px]">
                  ✓ Eliminação Segura (Sem Efeito Cascata)
                </p>
                <p>
                  Apenas o bloco do Page Builder será removido. Peças de roupa, fotografias, conteúdos personalizados e histórico NÃO serão apagados.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBlockToDelete(null)}
                  className="px-4 py-2 bg-[#181818] hover:bg-[#222222] text-neutral-300 rounded text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const targetId = blockToDelete.id;
                    const blockTitle = blockToDelete.public_name || blockToDelete.title;
                    setBlockToDelete(null);
                    await deleteBlock(targetId);
                    showToast(`Bloco "${blockTitle}" eliminado da homepage com sucesso.`);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded transition-colors shadow-lg"
                >
                  Confirmar Eliminação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação Segura para Eliminar Item do Menu */}
        {menuItemToDelete && (
          <div
            id="delete-menu-backdrop"
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => {
              if ((e.target as HTMLElement).id === 'delete-menu-backdrop') {
                setMenuItemToDelete(null);
              }
            }}
          >
            <div className="w-full max-w-md bg-[#0e0e0e] border border-red-900/50 rounded-xl p-6 space-y-4 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-3 text-red-400">
                <Trash2 className="w-5 h-5 shrink-0" />
                <h3 className="font-display uppercase text-base text-white tracking-wider">
                  Eliminar Item do Menu?
                </h3>
              </div>

              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Desejas eliminar o item{' '}
                <strong className="text-white font-bold">"{menuItemToDelete.label}"</strong> do menu de navegação?
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMenuItemToDelete(null)}
                  className="px-4 py-2 bg-[#181818] hover:bg-[#222222] text-neutral-300 rounded text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const targetId = menuItemToDelete.id;
                    const label = menuItemToDelete.label;
                    setMenuItemToDelete(null);
                    await deleteMenuItem(targetId);
                    showToast(`Item "${label}" eliminado do menu.`);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded transition-colors shadow-lg"
                >
                  Confirmar Eliminação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação Segura para Eliminar Conteúdo Personalizado */}
        {contentToDelete && (
          <div
            id="delete-content-backdrop"
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => {
              if ((e.target as HTMLElement).id === 'delete-content-backdrop') {
                setContentToDelete(null);
              }
            }}
          >
            <div className="w-full max-w-md bg-[#0e0e0e] border border-red-900/50 rounded-xl p-6 space-y-4 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-3 text-red-400">
                <Trash2 className="w-5 h-5 shrink-0" />
                <h3 className="font-display uppercase text-base text-white tracking-wider">
                  Eliminar Conteúdo Personalizado?
                </h3>
              </div>

              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Desejas eliminar o conteúdo{' '}
                <strong className="text-white font-bold">"{contentToDelete.title}"</strong>?
              </p>

              <p className="text-[11px] text-neutral-400 font-sans">
                Os produtos da loja e o arquivo da Cápsula do Tempo permanecerão intactos.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setContentToDelete(null)}
                  className="px-4 py-2 bg-[#181818] hover:bg-[#222222] text-neutral-300 rounded text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const targetId = contentToDelete.id;
                    const title = contentToDelete.title;
                    setContentToDelete(null);
                    await deleteCustomContent(targetId);
                    showToast(`Conteúdo "${title}" eliminado.`);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded transition-colors shadow-lg"
                >
                  Confirmar Eliminação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Bloco do Page Builder */}
        {editingBlock && (
          <BlockEditorModal
            block={editingBlock}
            customContents={customContents}
            onSaveCustomContent={saveCustomContent}
            onSave={async (updated) => {
              await saveBlock(updated);
              setEditingBlock(null);
            }}
            onClose={() => setEditingBlock(null)}
            showToast={showToast}
          />
        )}

        {/* Modal de Edição de Item do Menu */}
        {editingMenuItem && (
          <MenuEditorModal
            item={editingMenuItem}
            customContents={customContents}
            onSave={async (updatedItem) => {
              await saveMenuItem(updatedItem);
              setEditingMenuItem(null);
            }}
            onClose={() => setEditingMenuItem(null)}
            showToast={showToast}
          />
        )}

        {/* Modal de Edição de Conteúdo Personalizado */}
        {editingCustomContent && (
          <CustomContentEditorModal
            content={editingCustomContent}
            onSave={async (savedContent, options) => {
              await saveCustomContent(savedContent);

              // Opcional: Adicionar automaticamente como Bloco no Page Builder
              if (options?.addToPageBuilder) {
                const existingBlock = blocks.find((b) => b.custom_content_id === savedContent.id || b.slug === savedContent.slug);
                if (!existingBlock) {
                  const newBlock: SiteBlock = {
                    id: `block_${savedContent.slug.replace(/[^a-z0-9_]/gi, '_') || Date.now()}`,
                    block_type: 'custom_content',
                    title: savedContent.internal_name || savedContent.title,
                    public_name: savedContent.title,
                    subtitle: savedContent.subtitle || 'Portfolio / Conteúdo Personalizado',
                    content_type: 'custom',
                    custom_content_id: savedContent.id,
                    slug: savedContent.slug,
                    content: {
                      custom_content_id: savedContent.id,
                      heading: savedContent.title,
                      subheading: savedContent.subtitle,
                      description: savedContent.description,
                      images: savedContent.images,
                      items: savedContent.items,
                    },
                    is_active: true,
                    order_index: blocks.length + 1,
                  };
                  await saveBlock(newBlock);
                }
              }

              // Opcional: Adicionar ao Menu de Navegação do Site
              if (options?.addToMenu) {
                const existingMenu = menuItems.find((m) => m.target_id === savedContent.id);
                if (!existingMenu) {
                  await saveMenuItem({
                    id: `menu-${Date.now()}`,
                    label: options.menuLabel || savedContent.title,
                    target_type: 'custom',
                    target_id: savedContent.id,
                    order_index: menuItems.length + 1,
                    is_active: true,
                  });
                }
              }

              setEditingCustomContent(null);
            }}
            onDelete={async (id) => {
              await deleteCustomContent(id);
              setEditingCustomContent(null);
            }}
            onClose={() => setEditingCustomContent(null)}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
};
