import { Product, SiteBlock, DictionaryEntry, SiteSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-void-tee',
    slug: 'void-boxy-tee',
    name: 'welcome to luanda censored t-shirt',
    category: 'T-Shirts & Tops',
    price_aoa: 18000,
    description: 'T-shirt boxy estruturada em algodão pesado 280 GSM. Caimento reto oversized contemporâneo com gola canelada grossa e costura reforçada nos ombros.',
    details: '100% Algodão Pesado Angolano 280 GSM. Corte Boxy drop-shoulder. Lavagem mineral em tom carbono desbotado. Fabricado e costurado artesanalmente em Luanda.',
    size_guide: 'O modelo tem 1,84m e veste tamanho L para um caimento relaxado. Para um caimento mais justo, escolha um tamanho abaixo do habitual.',
    images: [
      '/assets/product_prod-void-tee_0.png'
    ],
    sizes: [
      { size: 'S', in_stock: true },
      { size: 'M', in_stock: true },
      { size: 'L', in_stock: true },
      { size: 'XL', in_stock: true },
      { size: 'XXL', in_stock: false },
    ],
    colors: [
      { name: 'Bone White', hex: '#e3dfd8' }
    ],
    badge: 'NOVO',
    lifecycle: 'active_drop',
    is_visible: true,
    is_featured: true,
    order_index: 1,
  },
  {
    id: 'prod-1789321105460',
    slug: 'peca-mu03l54k-u79',
    name: 'welcome to luanda uncensored t-shirt',
    category: 'T-Shirts & Tops',
    price_aoa: 18000,
    description: 'Descrição técnica da peça em algodão pesado...',
    details: '100% Algodão 300 GSM. Feito em Luanda.',
    size_guide: 'Caimento oversized intencional. Punhos ajustados que assentam com precisão sobre o pulso.',
    images: [
      '/assets/product_prod-1789321105460_0.png'
    ],
    sizes: [
      { size: 'S', in_stock: true },
      { size: 'M', in_stock: true },
      { size: 'L', in_stock: true },
      { size: 'XL', in_stock: true }
    ],
    colors: [
      { name: 'Carbon Black', hex: '#141414' }
    ],
    badge: 'NOVO',
    lifecycle: 'active_drop',
    is_visible: true,
    is_featured: false,
    order_index: 2,
  }
];

export const INITIAL_BLOCKS: SiteBlock[] = [
  {
    id: 'block_marquee',
    block_type: 'marquee',
    title: 'Anúncio Superior',
    content: {
      items: [
        'EDIÇÃO LIMITADA • DROP 01 WELCOME TO LUANDA',
        'PRODUZIDO EM ANGOLA',
        'ENTREGAS EM LUANDA',
        'PAGAMENTO VIA MULTICAIXA EXPRESS',
        'WEARING UNUSUAL • HIGH-END MINIMALIST STREETWEAR'
      ],
      speed_seconds: 25,
      bg_color: '#000000',
      text_color: '#d4d4d4'
    },
    is_active: true,
    order_index: 1,
  },
  {
    id: 'block_hero',
    block_type: 'hero_banner',
    title: 'Banner Principal (Hero Section)',
    subtitle: 'DROP 01 — WELCOME TO LUANDA',
    content: {
      drop_tag: 'DROP 01 — WELCOME TO LUANDA',
      drop_title: 'Wearing Unusual',
      drop_slogan: '',
      description: '',
      cta_text: 'COMPRAR AGORA',
      cta_link: '#drop-atual',
      secondary_cta_text: 'VER LOOKBOOK',
      secondary_cta_link: '#lookbook-section',
      bg_image: '/assets/hero-banner.png',
      bg_images: ['/assets/hero-banner.png'],
      overlay_opacity: 0.55,
      text_alignment: 'left'
    },
    is_active: true,
    order_index: 2,
  },
  {
    id: 'block_drop_grid',
    block_type: 'drop_grid',
    title: 'Grelha do Drop Atual',
    subtitle: 'EDIÇÃO LIMITADA. PRODUZIDO EM ANGOLA.',
    content: {
      heading: 'DROP ATUAL',
      subheading: 'Edição limitada. Produzido em Angola.',
      show_categories_filter: true
    },
    is_active: true,
    order_index: 3,
  },
  {
    id: 'block_lookbook',
    block_type: 'lookbook',
    title: 'Galeria Lookbook',
    subtitle: 'EDITORIAL VISUAL',
    content: {
      heading: 'LOOKBOOK 01',
      description: 'Documentação visual das peças • \n\nSilhuetas, caimento das peças e a atmosfera urbana sob a perspectiva da Unusual.',
      columns: 3,
      images: [
        { url: '/assets/lookbook_1.jpg', caption: 'LOOK 01' },
        { url: '/assets/lookbook_2.jpg', caption: 'LOOK 02' },
        { url: '/assets/lookbook_3.jpg', caption: 'LOOK 03' }
      ]
    },
    is_active: true,
    order_index: 4,
  },
  {
    id: 'block_manifesto',
    block_type: 'manifesto',
    title: 'Bloco do Manifesto',
    subtitle: 'FILOSOFIA DA MARCA',
    content: {
      heading: 'O MANIFESTO',
      text: 'A Unusual é uma marca de streetwear minimalista que representa a arte em si, não sendo focada apenas em vender o produto.\nO que faz da Unusual aquilo que ela é, é a representação do universo artístico: DJs, músicos, fotógrafos e, principalmente, a vibe urbana.\n\nNão vendemos apenas roupa, mas também criamos um movimento cultural e autenticidade.',
      subtext: 'Inspired by the fear of being average.'
    },
    is_active: true,
    order_index: 5,
  },
  {
    id: 'block_time_capsule',
    block_type: 'time_capsule',
    title: 'Cápsula do Tempo (Arquivo Histórico)',
    subtitle: 'História e Memórias',
    content: {
      heading: 'CÁPSULA DO TEMPO',
      subheading: 'Arquivo de silhuetas e lançamentos esgotados.',
      notice: 'Peças em arquivo histórico. Não disponíveis para compra imediata.',
      items: []
    },
    is_active: true,
    order_index: 6,
  }
];

export const INITIAL_DICTIONARY: DictionaryEntry[] = [
  { key: 'nav_drop', pt: 'DROP ATUAL', en: 'CURRENT DROP', category: 'navigation' },
  { key: 'nav_capsule', pt: 'CÁPSULA DO TEMPO', en: 'TIME CAPSULE', category: 'navigation' },
  { key: 'nav_lookbook', pt: 'LOOKBOOK', en: 'LOOKBOOK', category: 'navigation' },
  { key: 'nav_manifesto', pt: 'MANIFESTO', en: 'MANIFESTO', category: 'navigation' },
  { key: 'nav_track', pt: 'RASTREAR ENCOMENDA', en: 'TRACK ORDER', category: 'navigation' },
  { key: 'nav_cart', pt: 'SACO', en: 'CART', category: 'navigation' },
  { key: 'nav_search', pt: 'PESQUISAR', en: 'SEARCH', category: 'navigation' },
  { key: 'btn_add_cart', pt: 'ADICIONAR AO SACO', en: 'ADD TO CART', category: 'buttons' },
  { key: 'btn_checkout', pt: 'FINALIZAR COMPRA', en: 'CHECKOUT', category: 'buttons' },
  { key: 'btn_track', pt: 'RASTREAR AGORA', en: 'TRACK NOW', category: 'buttons' },
  { key: 'btn_copy_iban', pt: 'COPIAR IBAN', en: 'COPY IBAN', category: 'buttons' },
  { key: 'btn_send_order', pt: 'CONFIRMAR E ENVIAR ENCOMENDA', en: 'CONFIRM & SUBMIT ORDER', category: 'buttons' },
  { key: 'btn_admin_save', pt: 'GUARDAR ALTERAÇÕES', en: 'SAVE CHANGES', category: 'buttons' },
  { key: 'btn_view_details', pt: 'VER DETALHES', en: 'VIEW DETAILS', category: 'buttons' },
  { key: 'btn_continue_shopping', pt: 'CONTINUAR A COMPRAR', en: 'CONTINUE SHOPPING', category: 'buttons' },
  { key: 'cart_empty_title', pt: 'O SEU SACO ESTÁ VAZIO', en: 'YOUR CART IS EMPTY', category: 'checkout' },
  { key: 'cart_empty_desc', pt: 'Explore o drop atual para selecionar peças de corte exclusivo.', en: 'Explore the current drop to select exclusive pieces.', category: 'checkout' },
  { key: 'cart_subtotal_label', pt: 'SUBTOTAL:', en: 'SUBTOTAL:', category: 'checkout' },
  { key: 'cart_delivery_free', pt: 'ENTREGA DIRETA EM LUANDA INCLUSA', en: 'DIRECT DELIVERY IN LUANDA INCLUDED', category: 'checkout' },
  { key: 'checkout_step_customer', pt: '1. DADOS DE ENTREGA', en: '1. SHIPPING DETAILS', category: 'checkout' },
  { key: 'checkout_step_payment', pt: '2. PAGAMENTO MULTICAIXA EXPRESS', en: '2. PAYMENT DETAILS', category: 'checkout' },
  { key: 'checkout_step_proof', pt: '3. COMPROVATIVO DE TRANSFERÊNCIA', en: '3. PROOF OF PAYMENT', category: 'checkout' },
  { key: 'checkout_iban_label', pt: 'IBAN DE DESTINO:', en: 'DESTINATION IBAN:', category: 'checkout' },
  { key: 'checkout_proof_required_note', pt: 'É obrigatório anexar a imagem ou captura do comprovativo do Multicaixa Express para validação imediata da vaga.', en: 'It is mandatory to attach proof of transfer for immediate order confirmation.', category: 'checkout' },
  { key: 'track_search_placeholder', pt: 'DIGITE O CÓDIGO (EX: WU-8492)', en: 'ENTER CODE (E.G. WU-8492)', category: 'tracking' },
  { key: 'track_step_1_title', pt: 'Pedido Confirmado', en: 'Order Confirmed', category: 'tracking' },
  { key: 'track_step_1_desc', pt: 'Comprovativo validado e vaga reservada com sucesso.', en: 'Proof verified and spot successfully reserved.', category: 'tracking' },
  { key: 'track_step_2_title', pt: 'A sua encomenda saiu do local de produção', en: 'Order left production atelier', category: 'tracking' },
  { key: 'track_step_2_desc', pt: 'Peça embalada sob padrão artesanal estrito e entregue à logística.', en: 'Garment packed under strict standards and dispatched to courier.', category: 'tracking' },
  { key: 'track_step_3_title', pt: 'A sua encomenda está prestes a chegar', en: 'Your order is arriving soon', category: 'tracking' },
  { key: 'track_step_3_desc', pt: 'O estafeta está a caminho do seu endereço em Luanda.', en: 'Courier is en route to your address in Luanda.', category: 'tracking' },
  { key: 'track_step_3_alert', pt: 'Certifique-se de se manter contactável.', en: 'Please make sure your phone remains reachable.', category: 'tracking' },
  { key: 'track_step_4_title', pt: 'Entregue', en: 'Delivered', category: 'tracking' },
  { key: 'track_step_4_desc', pt: 'Peça entregue em mãos com sucesso.', en: 'Garment successfully delivered in hands.', category: 'tracking' },
  { key: 'footer_rights', pt: 'TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA.', en: 'ALL RIGHTS RESERVED. LUANDA, ANGOLA.', category: 'footer' },

  // Pre-Order & Restock Universal Autonomous Dictionary
  { key: 'preorder_badge_sold_out', pt: 'SOLD OUT', en: 'SOLD OUT', category: 'headings' },
  { key: 'preorder_badge_coming_soon', pt: 'COMING BACK SOON', en: 'COMING BACK SOON', category: 'headings' },
  { key: 'preorder_btn_action', pt: 'PRE-ORDER', en: 'PRE-ORDER', category: 'buttons' },
  { key: 'preorder_btn_request_restock', pt: 'REQUEST RESTOCK', en: 'REQUEST RESTOCK', category: 'buttons' },
  { key: 'preorder_modal_title_suffix', pt: '— PRE-ORDER', en: '— PRE-ORDER', category: 'headings' },
  { key: 'preorder_modal_desc', pt: 'This is a pre-order item. Your piece will be produced specifically for this restock.', en: 'This is a pre-order item. Your piece will be produced specifically for this restock.', category: 'headings' },
  { key: 'preorder_estimated_delivery_label', pt: 'Estimated delivery:', en: 'Estimated delivery:', category: 'headings' },
  { key: 'preorder_price_label', pt: 'Price:', en: 'Price:', category: 'headings' },
  { key: 'preorder_whatsapp_label', pt: 'WhatsApp:', en: 'WhatsApp:', category: 'headings' },
  { key: 'preorder_confirm_btn', pt: 'CONFIRM PRE-ORDER', en: 'CONFIRM PRE-ORDER', category: 'buttons' },
  { key: 'preorder_confirmed_title', pt: 'PRE-ORDER CONFIRMED ✓', en: 'PRE-ORDER CONFIRMED ✓', category: 'headings' },
  { key: 'preorder_confirmed_tagline', pt: "You're in.", en: "You're in.", category: 'headings' },
  { key: 'preorder_confirmed_msg', pt: "We'll contact you on WhatsApp as soon as your piece is ready for delivery.", en: "We'll contact you on WhatsApp as soon as your piece is ready for delivery.", category: 'headings' },
  { key: 'preorder_ready_title', pt: 'YOUR PRE-ORDER IS READY 🖤', en: 'YOUR PRE-ORDER IS READY 🖤', category: 'headings' },
  { key: 'preorder_ready_delivery_starts', pt: 'Delivery starts on October 18th.', en: 'Delivery starts on October 18th.', category: 'headings' },
  { key: 'preorder_ready_choose_date', pt: 'Please choose your preferred delivery date.', en: 'Please choose your preferred delivery date.', category: 'headings' },
  { key: 'preorder_choose_date_btn', pt: 'CHOOSE DELIVERY DATE', en: 'CHOOSE DELIVERY DATE', category: 'buttons' },
  { key: 'preorder_date_selector_label', pt: 'SELECIONE A SUA DATA PREFERIDA DE ENTREGA', en: 'SELECT YOUR PREFERRED DELIVERY DATE', category: 'headings' },
  { key: 'preorder_confirm_date_btn', pt: 'CONFIRM DELIVERY DATE', en: 'CONFIRM DELIVERY DATE', category: 'buttons' },
  { key: 'preorder_delivery_scheduled_title', pt: 'DELIVERY SCHEDULED ✓', en: 'DELIVERY SCHEDULED ✓', category: 'headings' },
  { key: 'preorder_delivery_scheduled_msg', pt: 'Your order will be delivered on [DATE].', en: 'Your order will be delivered on [DATE].', category: 'headings' },
  { key: 'preorder_delivery_scheduled_sub', pt: 'Please keep your phone nearby on the delivery day.', en: 'Please keep your phone nearby on the delivery day.', category: 'headings' },
  { key: 'preorder_out_for_delivery_title', pt: 'YOUR ORDER IS ON ITS WAY 🖤', en: 'YOUR ORDER IS ON ITS WAY 🖤', category: 'headings' },
  { key: 'preorder_out_for_delivery_msg', pt: 'Please stay available and keep your phone nearby. Your order will arrive shortly.', en: 'Please stay available and keep your phone nearby. Your order will arrive shortly.', category: 'headings' },
  { key: 'preorder_delivered_title', pt: 'DELIVERED ✓', en: 'DELIVERED ✓', category: 'headings' },
  { key: 'preorder_delivered_msg', pt: 'Sua peça foi entregue em mãos. Obrigado por fazer parte da Wearing Unusual.', en: 'Your piece has been delivered. Thank you for being part of Wearing Unusual.', category: 'headings' },
  { key: 'preorder_restock_success_msg', pt: 'INTERESSE REGISTADO COM SUCESSO. AVISAREMOS NO WHATSAPP ASSIM QUE O ITEM ENTRAR EM PRÉ-VENDA.', en: 'INTEREST REGISTERED. WE WILL NOTIFY YOU ON WHATSAPP AS SOON AS PRE-ORDER OPENS.', category: 'headings' }
];

export const INITIAL_SETTINGS: SiteSettings = {
  id: 'global',
  store_name: 'WEARING UNUSUAL',
  site_logo_url: '/logo.png',
  brand_bio: 'Wearing Unusual — Silhuetas brutalistas e rigor arquitetural desenhados e produzidos em Luanda, Angola. Edições limitadas sob demanda.',
  location_text: 'Luanda, Angola • Entregas em Toda a Cidade',
  contact_email: 'contato@wearingunusual.com',
  instagram_handle: '@wearingunusual',
  copyright_text: 'TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA.',
  delivery_fee_aoa: 5000,
  maintenance_mode: false,
  maintenance_message: 'ESTAMOS A ATUALIZAR O NOSSO ESPAÇO PARA O PRÓXIMO LANÇAMENTO. RETORNAREMOS EM BREVE.',
  next_drop_mode: false,
  next_drop_date: '2026-10-31T20:00:00Z',
  next_drop_title: 'DROP 01 — WELCOME TO LUANDA',
  checkout_locked: false,
  checkout_lock_message: 'O CHECKOUT ENCONTRA-SE TEMPORARIAMENTE SUSPENSO PARA CONTAGEM DE STOCK.',
  require_payment_proof: true,
  iban: '0040 0000 67239118101 68',
  account_holder: ' ALDEMIR DOS SANTOS',
  account_number: '937765130',
  multicaixa_express_phone: '+244 923 000 000',
  whatsapp_number: '+244 937765130',
  marquee_enabled: true,
  marquee_messages: [
    'EDIÇÃO LIMITADA • DROP 01 WELCOME TO LUANDA',
    'PRODUZIDO EM ANGOLA',
    'ENTREGAS EM LUANDA',
    'WEARING UNUSUAL — HIGH-END MINIMALIST STREETWEAR',
    'PAGAMENTO DIRETO VIA MULTICAIXA EXPRESS'
  ],
  footer_categories: [
    'T-Shirts & Tops',
    'Hoodies',
    'Sweatshirts',
    'Denim',
    'Outerwear',
    'Acessórios'
  ],
  enable_pre_order_button: true,
  enable_request_restock_button: true,
  pre_order_button_text_pt: 'PRE-ORDER',
  pre_order_button_text_en: 'PRE-ORDER',
  request_restock_button_text_pt: 'REQUEST RESTOCK',
  request_restock_button_text_en: 'REQUEST RESTOCK',

  // Request Restock Content (Settings -> Request Restock Content)
  restock_title_pt: 'GOSTARIAS QUE ESTA COLEÇÃO VOLTASSE?',
  restock_title_en: 'WOULD YOU LIKE THIS COLLECTION TO RETURN?',
  restock_description_pt: 'Deixa-nos saber. O teu interesse ajuda-nos a decidir quais peças podem voltar.',
  restock_description_en: 'Let us know. Your interest helps us decide which pieces may return.',
  restock_badge_text_pt: 'CÁPSULA DO TEMPO • AVALIAÇÃO DE INTERESSE',
  restock_badge_text_en: 'TIME CAPSULE • INTEREST SURVEY',
  restock_name_label_pt: 'O SEU NOME (OPCIONAL)',
  restock_name_label_en: 'YOUR NAME (OPTIONAL)',
  restock_name_placeholder_pt: 'ex: Aldemir Santos',
  restock_name_placeholder_en: 'e.g. John Doe',
  restock_phone_label_pt: 'WHATSAPP / TELEFONE (OBRIGATÓRIO) *',
  restock_phone_label_en: 'WHATSAPP / PHONE (REQUIRED) *',
  restock_phone_placeholder_pt: '+244 9XX XXX XXX',
  restock_phone_placeholder_en: '+244 9XX XXX XXX',
  restock_submit_btn_pt: 'REQUEST RESTOCK',
  restock_submit_btn_en: 'REQUEST RESTOCK',
  restock_submitting_text_pt: 'A REGISTAR INTERESSE...',
  restock_submitting_text_en: 'REGISTERING INTEREST...',
  restock_success_title_pt: 'INTERESSE REGISTADO COM SUCESSO',
  restock_success_title_en: 'INTEREST REGISTERED SUCCESSFULLY',
  restock_success_message_pt: 'O teu interesse foi anotado pelo atelier. Se decidirmos reabrir a produção para pré-venda, contactamos-te em primeira mão via WhatsApp.',
  restock_success_message_en: 'Your interest has been noted by the atelier. If we decide to reopen production for pre-order, we will contact you first via WhatsApp.',
  restock_error_message_pt: 'Ocorreu um erro ao registar o seu interesse. Por favor tente novamente.',
  restock_error_message_en: 'An error occurred while registering your interest. Please try again.',
  restock_phone_required_error_pt: 'Por favor introduza o seu número de WhatsApp / Telefone.',
  restock_phone_required_error_en: 'Please enter your WhatsApp / Phone number.'
};

export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- WEARING UNUSUAL: SCHEMA RELACIONAL E TABELAS SUPABASE (AUTONOMIA TOTAL)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- URL: https://tmryqhilyisbfdpnsiwo.supabase.co
-- ==============================================================================

-- 1. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_aoa NUMERIC NOT NULL,
  description TEXT,
  details TEXT,
  size_guide TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  lifecycle TEXT DEFAULT 'active_drop',
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  enable_pre_order BOOLEAN DEFAULT false,
  pre_order_price_aoa NUMERIC,
  pre_order_estimated_delivery TEXT,
  pre_order_start_date TIMESTAMPTZ,
  pre_order_end_date TIMESTAMPTZ,
  pre_order_max_quantity INTEGER,
  pre_order_custom_notice TEXT,
  coming_soon_badge BOOLEAN DEFAULT false,
  enable_request_restock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE ENCOMENDAS (ORDERS) COM CÓDIGO DE RASTREIO ÚNICO
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  order_type TEXT DEFAULT 'regular',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_aoa NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'Multicaixa Express',
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  status_timeline JSONB DEFAULT '[]'::jsonb,
  is_pre_order BOOLEAN DEFAULT false,
  estimated_delivery_text TEXT,
  scheduled_delivery_date TIMESTAMPTZ,
  available_delivery_dates JSONB DEFAULT '[]'::jsonb,
  delivery_window TEXT,
  actual_delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2B. TABELA DE PEDIDOS DE RESTOCK (REQUEST RESTOCK - MEDIÇÃO DE PROCURA CÁPSULA DO TEMPO)
CREATE TABLE IF NOT EXISTS public.restock_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  collection_name TEXT,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  language TEXT DEFAULT 'pt',
  status TEXT DEFAULT 'Interesse Registado',
  notes TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE BLOCOS MODULARES DA HOMEPAGE (PAGE BUILDER)
CREATE TABLE IF NOT EXISTS public.site_blocks (
  id TEXT PRIMARY KEY,
  block_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA DE DICIONÁRIO E MICRO-COPY UNIVERSAL (PT / EN)
CREATE TABLE IF NOT EXISTS public.site_dictionary (
  key TEXT PRIMARY KEY,
  pt TEXT NOT NULL,
  en TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA DE REGRAS DE NEGÓCIO E DEFINIÇÕES GLOBAIS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  store_name TEXT DEFAULT 'WEARING UNUSUAL',
  site_logo_url TEXT DEFAULT '/logo.png',
  logo_url TEXT DEFAULT '/logo.png',
  brand_bio TEXT,
  location_text TEXT,
  instagram_handle TEXT,
  copyright_text TEXT,
  contact_email TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  next_drop_mode BOOLEAN DEFAULT false,
  next_drop_date TIMESTAMPTZ,
  next_drop_title TEXT,
  checkout_locked BOOLEAN DEFAULT false,
  checkout_lock_message TEXT,
  require_payment_proof BOOLEAN DEFAULT true,
  iban TEXT,
  account_holder TEXT,
  account_number TEXT,
  multicaixa_express_phone TEXT,
  whatsapp_number TEXT,
  marquee_enabled BOOLEAN DEFAULT true,
  marquee_messages JSONB DEFAULT '[]'::jsonb,
  footer_categories JSONB DEFAULT '[]'::jsonb,
  delivery_fee_aoa NUMERIC DEFAULT 5000,
  enable_pre_order_button BOOLEAN DEFAULT true,
  enable_request_restock_button BOOLEAN DEFAULT true,
  pre_order_button_text_pt TEXT DEFAULT 'PRE-ORDER',
  pre_order_button_text_en TEXT DEFAULT 'PRE-ORDER',
  request_restock_button_text_pt TEXT DEFAULT 'REQUEST RESTOCK',
  request_restock_button_text_en TEXT DEFAULT 'REQUEST RESTOCK',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- HABILITAR ROW LEVEL SECURITY (RLS) COM POLÍTICAS PÚBLICAS (ANON KEY)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. CONCESSÃO EXPLÍCITA DE ACESSO AO ESQUEMA PUBLIC (EVITA ERRO 403 / PERMISSION DENIED)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 2. LIMPEZA DINÂMICA DE TODAS AS POLÍTICAS ANTIGAS (EVITA ABORTAR POR "POLICY ALREADY EXISTS")
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('products', 'orders', 'restock_requests', 'site_blocks', 'site_dictionary', 'site_settings')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3. CRIAÇÃO LIMPA DAS POLÍTICAS DE SEGURANÇA (RLS ESTRITO COM SUPABASE AUTH)
-- Produtos: Leitura pública, mutações restritas a administradores autenticados
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin Insert Products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Products" ON public.products FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Products" ON public.products FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Blocos do Site (Page Builder - Cápsula do Tempo, Banners, Lookbook): Leitura pública, edição restrita
CREATE POLICY "Public Read Site Blocks" ON public.site_blocks FOR SELECT USING (true);
CREATE POLICY "Admin Insert Site Blocks" ON public.site_blocks FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Site Blocks" ON public.site_blocks FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Site Blocks" ON public.site_blocks FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Dicionário Multilíngue e Definições da Loja
CREATE POLICY "Public Read Dictionary" ON public.site_dictionary FOR SELECT USING (true);
CREATE POLICY "Admin Manage Dictionary" ON public.site_dictionary FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin Manage Settings" ON public.site_settings FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Encomendas: Clientes públicos podem criar (checkout) e consultar (rastreio); apenas admin pode alterar ou eliminar
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin Update Orders" ON public.orders FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Orders" ON public.orders FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Pedidos de Restock (Cápsula do Tempo): Clientes públicos manifestam interesse; consulta e gestão de dados pelo admin
CREATE POLICY "Public Insert Restock Requests" ON public.restock_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Restock Requests" ON public.restock_requests FOR SELECT USING (true);
CREATE POLICY "Admin Update Restock Requests" ON public.restock_requests FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Restock Requests" ON public.restock_requests FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- 4. Garante que o registo do bloco da Cápsula do Tempo existe em site_blocks
INSERT INTO public.site_blocks (id, block_type, title, subtitle, content, is_active, order_index)
VALUES (
  'time_capsule',
  'time_capsule',
  'Cápsula do Tempo',
  'História e Memórias',
  '{"items": []}'::jsonb,
  true,
  99
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_active = EXCLUDED.is_active;

-- 5. BUCKET DE STORAGE PARA COMPROVATIVOS ('receipts')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Limpeza e Recriação das Políticas de Storage para o bucket 'receipts'
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%Receipts%'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "Public Access Receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "Public Upload Receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Public Update Receipts" ON storage.objects
FOR UPDATE USING (bucket_id = 'receipts');

CREATE POLICY "Public Delete Receipts" ON storage.objects
FOR DELETE USING (bucket_id = 'receipts');
`;

export const SUPABASE_FIX_RLS_SQL = `-- ==============================================================================
-- WEARING UNUSUAL: REPARO RÁPIDO DE POLÍTICAS RLS E PERMISSÕES (EXECUÇÃO LIMPA)
-- Cole e execute este script no SQL Editor do seu projeto Supabase:
-- URL: https://tmryqhilyisbfdpnsiwo.supabase.co
-- ==============================================================================

-- 1. Garante permissões de acesso ao esquema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 2. Limpa dinamicamente TODAS as políticas antigas para evitar erros de duplicado
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('products', 'orders', 'restock_requests', 'site_blocks', 'site_dictionary', 'site_settings')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3. Habilita RLS e garante colunas atualizadas em todas as tabelas
CREATE TABLE IF NOT EXISTS public.restock_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  collection_name TEXT,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  language TEXT DEFAULT 'pt',
  status TEXT DEFAULT 'Interesse Registado',
  notes TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS enable_pre_order BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pre_order_price_aoa NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pre_order_estimated_delivery TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pre_order_custom_notice TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS coming_soon_badge BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS enable_request_restock BOOLEAN DEFAULT true;

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_logo_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_bio TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS copyright_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS delivery_fee_aoa NUMERIC DEFAULT 5000;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS enable_pre_order_button BOOLEAN DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS enable_request_restock_button BOOLEAN DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS pre_order_button_text_pt TEXT DEFAULT 'PRE-ORDER';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS pre_order_button_text_en TEXT DEFAULT 'PRE-ORDER';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS request_restock_button_text_pt TEXT DEFAULT 'REQUEST RESTOCK';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS request_restock_button_text_en TEXT DEFAULT 'REQUEST RESTOCK';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_title_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_title_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_description_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_description_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_badge_text_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_badge_text_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_name_label_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_name_label_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_name_placeholder_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_name_placeholder_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_phone_label_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_phone_label_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_phone_placeholder_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_phone_placeholder_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_submit_btn_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_submit_btn_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_submitting_text_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_submitting_text_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_success_title_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_success_title_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_success_message_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_success_message_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_error_message_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_error_message_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_phone_required_error_pt TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS restock_phone_required_error_en TEXT;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Criação das políticas de segurança estritas (RLS com Supabase Auth)
-- Produtos: Leitura pública, mutações apenas para administradores autenticados
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin Insert Products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Products" ON public.products FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Products" ON public.products FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Blocos do Site (Page Builder): Leitura pública, edição exclusiva de administradores
CREATE POLICY "Public Read Site Blocks" ON public.site_blocks FOR SELECT USING (true);
CREATE POLICY "Admin Insert Site Blocks" ON public.site_blocks FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Site Blocks" ON public.site_blocks FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Site Blocks" ON public.site_blocks FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Definições e Dicionário
CREATE POLICY "Public Read Dictionary" ON public.site_dictionary FOR SELECT USING (true);
CREATE POLICY "Admin Manage Dictionary" ON public.site_dictionary FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin Manage Settings" ON public.site_settings FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Encomendas: Inserção e Consulta públicas; Alteração e Eliminação exclusivas de administradores
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin Update Orders" ON public.orders FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Orders" ON public.orders FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Pedidos de Restock (Cápsula do Tempo): Inserção e Consulta públicas; Alteração e Eliminação por administradores
CREATE POLICY "Public Insert Restock Requests" ON public.restock_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Restock Requests" ON public.restock_requests FOR SELECT USING (true);
CREATE POLICY "Admin Update Restock Requests" ON public.restock_requests FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Restock Requests" ON public.restock_requests FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- 5. Garante a existência do bloco da Cápsula do Tempo
INSERT INTO public.site_blocks (id, block_type, title, subtitle, content, is_active, order_index)
VALUES (
  'time_capsule',
  'time_capsule',
  'Cápsula do Tempo',
  'História e Memórias',
  '{"items": []}'::jsonb,
  true,
  99
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_active = EXCLUDED.is_active;

-- 6. Garante o bucket de comprovativos e acesso público irrestrito a ficheiros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%Receipts%'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "Public Access Receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "Public Upload Receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Public Update Receipts" ON storage.objects
FOR UPDATE USING (bucket_id = 'receipts');

CREATE POLICY "Public Delete Receipts" ON storage.objects
FOR DELETE USING (bucket_id = 'receipts');
`;
