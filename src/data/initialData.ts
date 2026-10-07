import { Product, SiteBlock, DictionaryEntry, SiteSettings, CustomContent, SiteMenuItem } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-void-tee",
    "slug": "welcome-to-luanda-censored-t-shirt-i2uw",
    "name": "welcome to luanda censored t-shirt",
    "name_en": "welcome to luanda censored t-shirt",
    "category": "T-Shirts & Tops",
    "category_en": "T-Shirts & Tops",
    "price_aoa": 18000,
    "description": "Um contraste na ilustração do tropical e do cultural urbano, que traz uma reinterpretação da essência da capital exibindo nas costas uma ilustração vintage da paisagem tropical.",
    "description_en": "A contrast in the illustration of tropical and urban culture, reinterpreting the essence of the capital with a vintage tropical landscape illustration on the back.",
    "details": "100% Algodão Pesado 240 GSM. Estampa serigráfica de alta precisão nas costas. Gola canelada de 3cm com reforço de ombro a ombro.",
    "details_en": "100% Heavyweight Cotton 240 GSM. High-precision silkscreen back print. 3cm ribbed collar with shoulder-to-shoulder taping.",
    "size_guide": "Modelagem Oversized boxy estruturada com ombros descaídos.",
    "size_guide_en": "Structured oversized boxy fit with dropped shoulders.",
    "fit_guide": "Modelagem Oversized boxy estruturada com ombros descaídos.",
    "fit_guide_en": "Structured oversized boxy fit with dropped shoulders.",
    "images": [
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789571217741_24y7a.jpeg"
    ],
    "sizes": [
      {
        "size": "S",
        "in_stock": false
      },
      {
        "size": "M",
        "in_stock": false
      },
      {
        "size": "L",
        "in_stock": false
      },
      {
        "size": "XL",
        "in_stock": false
      },
  
    ],
    "colors": [
      {
        "hex": "#ffffff",
        "name": "Pure White",
        "in_stock": false,
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789571217741_24y7a.jpeg"
      }
    ],
    "badge": "ESGOTADO",
    "lifecycle": "active_drop",
    "is_visible": true,
    "is_featured": true,
    "order_index": 1,
    "enable_pre_order": false,
    "pre_order_price_aoa": null,
    "pre_order_estimated_delivery": null,
    "pre_order_start_date": null,
    "pre_order_end_date": null,
    "pre_order_max_quantity": null,
    "pre_order_custom_notice": null,
    "coming_soon_badge": false,
    "return_date": null,
    "enable_request_restock": false
  },
  {
    "id": "prod-1789569730967",
    "slug": "on-the-map-t-shirt-mfns",
    "name": "”on the map” t-shirt",
    "name_en": "”on the map” t-shirt",
    "category": "T-Shirts & Tops",
    "category_en": "T-Shirts & Tops",
    "price_aoa": 0,
    "description": "tipografia com o monograma e o slogan \"INSPIRED BY THE FEAR OF BEING AVERAGE\", com a silhueta em outline do mapa de Angola na parte traseira, encimada pelo logo da marca.",
    "description_en": "Typography with monogram and slogan \"INSPIRED BY THE FEAR OF BEING AVERAGE\", featuring an outline silhouette of Angola on the back topped by the brand logo.",
    "details": "100% Algodão Pesado. Estampa frontal e traseira em serigrafia de alta densidade.",
    "details_en": "100% Heavyweight Cotton. Front and back high-density silkscreen print.",
    "size_guide": "Modelagem Oversized boxy estruturada com ombros descaídos.",
    "size_guide_en": "Structured oversized boxy fit with dropped shoulders.",
    "fit_guide": "Modelagem Oversized boxy estruturada com ombros descaídos.",
    "fit_guide_en": "Structured oversized boxy fit with dropped shoulders.",
    "images": [
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789569836974_w7soo.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789569863791_ygjqz.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789569882420_c6lvf.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789569892200_mfsjn.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789571057914_15785.jpeg"
    ],
    "sizes": [
      {
        "size": "S",
        "in_stock": true
      },
      {
        "size": "M",
        "in_stock": true
      },
      {
        "size": "L",
        "in_stock": true
      },
      {
        "size": "XL",
        "in_stock": true
      }
    ],
    "colors": [
      {
        "hex": "#141414",
        "name": "Carbon Black",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789569836974_w7soo.jpeg"
      },
      {
        "hex": "#ffffff",
        "name": "Pure White",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789569892200_mfsjn.jpeg"
      }
    ],
    "badge": "Aguardando Vaga",
    "lifecycle": "time_capsule",
    "is_visible": true,
    "is_featured": false,
    "order_index": 3,
    "enable_pre_order": false,
    "pre_order_price_aoa": null,
    "pre_order_estimated_delivery": "15–25 Outubro",
    "pre_order_estimated_delivery_en": "October 15–25",
    "pre_order_start_date": null,
    "pre_order_end_date": null,
    "pre_order_max_quantity": null,
    "pre_order_custom_notice": null,
    "coming_soon_badge": false,
    "return_date": null,
    "enable_request_restock": false
  },
  {
    "id": "prod-1789570314538",
    "slug": "paranoia-t-shirt-z8hf",
    "name": "“paranoia” t-shirt",
    "name_en": "“paranoia” t-shirt",
    "category": "T-Shirts & Tops",
    "category_en": "T-Shirts & Tops",
    "price_aoa": 0,
    "description": "Estética underground projectada através de uma tipografia fluída nas costas encimada pelo monograma.",
    "description_en": "Underground aesthetic projected through fluid typography across the back, topped by the brand monogram.",
    "details": "100% Algodão Pesado. Estampa serigráfica e acabamento de alta costura.",
    "details_en": "100% Heavyweight Cotton. Silkscreen print and high-fashion finish.",
    "size_guide": "Modelagem boxy estruturada com ombros descaídos.",
    "size_guide_en": "Structured boxy fit with dropped shoulders.",
    "fit_guide": "Modelagem boxy estruturada com ombros descaídos.",
    "fit_guide_en": "Structured boxy fit with dropped shoulders.",
    "images": [
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570418523_1fnc7.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570570141_o2hqn.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570582062_dcgpg.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570655974_czlw7.jpeg"
    ],
    "sizes": [
      {
        "size": "S",
        "in_stock": true
      },
      {
        "size": "M",
        "in_stock": true
      },
      {
        "size": "L",
        "in_stock": true
      },
      {
        "size": "XL",
        "in_stock": true
      }
    ],
    "colors": [
      {
        "hex": "#141414",
        "name": "Carbon Black",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570418523_1fnc7.jpeg"
      },
      {
        "hex": "#fff5d7",
        "name": "Bone White",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570570141_o2hqn.jpeg"
      }
    ],
    "badge": "Aguardando Vaga",
    "lifecycle": "time_capsule",
    "is_visible": true,
    "is_featured": false,
    "order_index": 4,
    "enable_pre_order": false,
    "pre_order_price_aoa": null,
    "pre_order_estimated_delivery": "15–25 Outubro",
    "pre_order_estimated_delivery_en": "October 15–25",
    "pre_order_start_date": null,
    "pre_order_end_date": null,
    "pre_order_max_quantity": null,
    "pre_order_custom_notice": null,
    "coming_soon_badge": false,
    "return_date": null,
    "enable_request_restock": false
  },
  {
    "id": "prod-1789570730155",
    "slug": "need-money-not-boys-cropped-shirt-baby-tee-al72",
    "name": "”need money not boys” cropped shirt/baby tee",
    "name_en": "”need money not boys” cropped shirt/baby tee",
    "category": "T-Shirts & Tops",
    "category_en": "T-Shirts & Tops",
    "price_aoa": 0,
    "description": "Need money not boys baby tee/cropped com estética Y2K, traseira Kiss Mark e um ajuste clássico e minimalista ao corpo.",
    "description_en": "Need money not boys baby tee/cropped with Y2K aesthetic, Kiss Mark back graphic, and a classic minimalist body fit.",
    "details": "Algodão canelado premium com elasticidade natural e estampa duradoura.",
    "details_en": "Premium ribbed cotton with natural stretch and durable print.",
    "size_guide": "Baby Tee ajustada/cropped ajustado ao corpo com caimento estruturado.",
    "size_guide_en": "Fitted Baby Tee / Cropped cut with structured silhouette.",
    "fit_guide": "Baby Tee ajustada/cropped ajustado ao corpo com caimento estruturado.",
    "fit_guide_en": "Fitted Baby Tee / Cropped cut with structured silhouette.",
    "images": [
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570820455_mps7u.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570829190_4khnv.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570858628_80a9a.jpeg",
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570870809_iigev.jpeg"
    ],
    "sizes": [
      {
        "size": "S",
        "in_stock": true
      },
      {
        "size": "M",
        "in_stock": true
      },
      {
        "size": "L",
        "in_stock": true
      },
      {
        "size": "XL",
        "in_stock": true
      }
    ],
    "colors": [
      {
        "hex": "#141414",
        "name": "Carbon Black",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570858628_80a9a.jpeg"
      },
      {
        "hex": "#513400",
        "name": "Espresso",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570820455_mps7u.jpeg"
      },
      {
        "hex": "#ffffff",
        "name": "Pure White",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789570870809_iigev.jpeg"
      }
    ],
    "badge": "EDIÇÃO LIMITADA",
    "lifecycle": "time_capsule",
    "is_visible": true,
    "is_featured": false,
    "order_index": 5,
    "enable_pre_order": false,
    "pre_order_price_aoa": null,
    "pre_order_estimated_delivery": null,
    "pre_order_start_date": null,
    "pre_order_end_date": null,
    "pre_order_max_quantity": null,
    "pre_order_custom_notice": null,
    "coming_soon_badge": false,
    "return_date": null,
    "enable_request_restock": true
  },
  {
    "id": "prod-1790698781209",
    "slug": "welcome-to-luanda-uncensored-t-shirt-362j",
    "name": "welcome to luanda uncensored t-shirt",
    "name_en": "welcome to luanda uncensored t-shirt",
    "category": "T-Shirts & Tops",
    "category_en": "T-Shirts & Tops",
    "price_aoa": 18000,
    "description": "Um contraste na ilustração do tropical e do cultural urbano, que traz uma reinterpretação da essência da capital exibindo nas costas uma ilustração vintage da paisagem tropical.",
    "description_en": "A contrast in the illustration of tropical and urban culture, reinterpreting the essence of the capital with a vintage tropical landscape illustration on the back.",
    "details": "100% Algodão Pesado 240 GSM. Estampa serigráfica uncensored nas costas.",
    "details_en": "100% Heavyweight Cotton 240 GSM. Silkscreen uncensored back graphic.",
    "size_guide": "Modelagem boxy estruturada com ombros descaídos.",
    "size_guide_en": "Structured boxy fit with dropped shoulders.",
    "fit_guide": "Modelagem boxy estruturada com ombros descaídos.",
    "fit_guide_en": "Structured boxy fit with dropped shoulders.",
    "images": [
      "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1790699014834_dzhi2.jpeg"
    ],
    "sizes": [
      {
        "size": "S",
        "in_stock": false
      },
      {
        "size": "M",
        "in_stock": false
      },
      {
        "size": "L",
        "in_stock": false
      },
      {
        "size": "XL",
        "in_stock": false
      }
    ],
    "colors": [
      {
        "hex": "#ffffff",
        "name": "Pure White",
        "image_url": "https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1790699014834_dzhi2.jpeg"
      }
    ],
    "badge": "ESGOTADO",
    "lifecycle": "active_drop",
    "is_visible": true,
    "is_featured": false,
    "order_index": 5,
    "enable_pre_order": false,
    "pre_order_price_aoa": null,
    "pre_order_estimated_delivery": null,
    "pre_order_start_date": null,
    "pre_order_end_date": null,
    "pre_order_max_quantity": null,
    "pre_order_custom_notice": null,
    "coming_soon_badge": false,
    "return_date": null,
    "enable_request_restock": false
  }
];

export const INITIAL_CUSTOM_CONTENTS: CustomContent[] = [];

export const INITIAL_MENU_ITEMS: SiteMenuItem[] = [
  { id: 'menu-1', label: 'DROP ATUAL', label_en: 'CURRENT DROP', target_type: 'store', target_id: 'drop-atual', order_index: 1, is_active: true },
  { id: 'menu-2', label: 'CÁPSULA DO TEMPO', label_en: 'TIME CAPSULE', target_type: 'capsule', order_index: 2, is_active: true },
  { id: 'menu-4', label: 'LOOKBOOK', label_en: 'LOOKBOOK', target_type: 'anchor', target_id: 'lookbook-section', order_index: 3, is_active: true },
  { id: 'menu-5', label: 'MANIFESTO', label_en: 'MANIFESTO', target_type: 'anchor', target_id: 'manifesto-section', order_index: 4, is_active: true },
  { id: 'menu-6', label: 'FAVORITOS', label_en: 'WISHLIST', target_type: 'wishlist', order_index: 5, is_active: true },
  { id: 'menu-7', label: 'RASTREAR', label_en: 'TRACK ORDER', target_type: 'track', order_index: 6, is_active: true },
];

export const INITIAL_BLOCKS: SiteBlock[] = [
  {
    id: 'block_marquee',
    block_type: 'marquee',
    title: 'Anúncio Superior',
    public_name: 'LETREIRO SUPERIOR',
    subtitle: 'Anúncios em Loop Contínuo',
    content_type: 'product',
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
    public_name: 'HERO BANNER',
    subtitle: 'DROP 01 — WELCOME TO LUANDA',
    content_type: 'product',
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
    public_name: 'DROP ATUAL',
    subtitle: 'EDIÇÃO LIMITADA. PRODUZIDO EM ANGOLA.',
    content_type: 'product',
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
    public_name: 'LOOKBOOK',
    subtitle: 'EDITORIAL VISUAL',
    content_type: 'custom',
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
    public_name: 'MANIFESTO',
    subtitle: 'FILOSOFIA DA MARCA',
    content_type: 'product',
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
    public_name: 'CÁPSULA DO TEMPO',
    subtitle: 'História e Memórias',
    content_type: 'product',
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
  // Navigation
  { key: 'nav_drop', pt: 'DROP ATUAL', en: 'CURRENT DROP', category: 'navigation' },
  { key: 'nav_capsule', pt: 'CÁPSULA DO TEMPO', en: 'TIME CAPSULE', category: 'navigation' },
  { key: 'nav_lookbook', pt: 'LOOKBOOK', en: 'LOOKBOOK', category: 'navigation' },
  { key: 'nav_manifesto', pt: 'MANIFESTO', en: 'MANIFESTO', category: 'navigation' },
  { key: 'nav_track', pt: 'RASTREAR ENCOMENDA', en: 'TRACK ORDER', category: 'navigation' },
  { key: 'nav_cart', pt: 'SACO DE COMPRAS', en: 'SHOPPING BAG', category: 'navigation' },
  { key: 'nav_search', pt: 'PESQUISAR', en: 'SEARCH', category: 'navigation' },
  { key: 'nav_wishlist', pt: 'FAVORITOS', en: 'WISHLIST', category: 'navigation' },
  { key: 'nav_admin', pt: 'ADMINISTRAÇÃO', en: 'ADMIN', category: 'navigation' },
  { key: 'nav_language', pt: 'IDIOMA', en: 'LANGUAGE', category: 'navigation' },

  // Buttons
  { key: 'btn_add_cart', pt: 'ADICIONAR AO SACO', en: 'ADD TO CART', category: 'buttons' },
  { key: 'btn_added_cart', pt: 'ADICIONADO AO SACO!', en: 'ADDED TO CART!', category: 'buttons' },
  { key: 'btn_checkout', pt: 'FINALIZAR COMPRA', en: 'CHECKOUT', category: 'buttons' },
  { key: 'btn_track', pt: 'RASTREAR AGORA', en: 'TRACK NOW', category: 'buttons' },
  { key: 'btn_copy_iban', pt: 'COPIAR IBAN', en: 'COPY IBAN', category: 'buttons' },
  { key: 'btn_copied', pt: 'COPIADO ✓', en: 'COPIED ✓', category: 'buttons' },
  { key: 'btn_copy', pt: 'COPIAR', en: 'COPY', category: 'buttons' },
  { key: 'btn_send_order', pt: 'CONFIRMAR E ENVIAR ENCOMENDA', en: 'CONFIRM & SUBMIT ORDER', category: 'buttons' },
  { key: 'btn_submitting', pt: 'A PROCESSAR ENCOMENDA...', en: 'PROCESSING ORDER...', category: 'buttons' },
  { key: 'btn_admin_save', pt: 'GUARDAR ALTERAÇÕES', en: 'SAVE CHANGES', category: 'buttons' },
  { key: 'btn_view_details', pt: 'VER DETALHES', en: 'VIEW DETAILS', category: 'buttons' },
  { key: 'btn_continue_shopping', pt: 'CONTINUAR A COMPRAR', en: 'CONTINUE SHOPPING', category: 'buttons' },
  { key: 'btn_back_catalog', pt: 'VOLTAR AO CATÁLOGO', en: 'BACK TO CATALOG', category: 'buttons' },
  { key: 'btn_back_capsule', pt: 'VOLTAR À CÁPSULA DO TEMPO', en: 'BACK TO TIME CAPSULE', category: 'buttons' },
  { key: 'btn_back_home', pt: 'VOLTAR AO INÍCIO', en: 'BACK TO HOME', category: 'buttons' },
  { key: 'btn_back_store', pt: 'VOLTAR À LOJA', en: 'RETURN TO STORE', category: 'buttons' },
  { key: 'btn_close', pt: 'FECHAR', en: 'CLOSE', category: 'buttons' },
  { key: 'btn_confirm_preorder', pt: 'CONFIRMAR PRÉ-ENCOMENDA', en: 'CONFIRM PRE-ORDER', category: 'buttons' },
  { key: 'btn_request_restock', pt: 'SOLICITAR REPOSIÇÃO', en: 'REQUEST RESTOCK', category: 'buttons' },
  { key: 'btn_choose_date', pt: 'ESCOLHER DATA DE ENTREGA', en: 'CHOOSE DELIVERY DATE', category: 'buttons' },
  { key: 'btn_confirm_date', pt: 'CONFIRMAR DATA DE ENTREGA', en: 'CONFIRM DELIVERY DATE', category: 'buttons' },
  { key: 'btn_change_date', pt: 'ALTERAR DATA', en: 'CHANGE DATE', category: 'buttons' },
  { key: 'btn_keep_date', pt: 'CANCELAR / MANTER DATA', en: 'KEEP CURRENT DATE', category: 'buttons' },
  { key: 'btn_explore_drop', pt: 'EXPLORAR DROP', en: 'EXPLORE DROP', category: 'buttons' },
  { key: 'btn_view_piece', pt: 'VER PEÇA', en: 'VIEW PIECE', category: 'buttons' },
  { key: 'btn_open_tracking', pt: 'ABRIR RASTREIO DA ENCOMENDA', en: 'OPEN ORDER TRACKING', category: 'buttons' },
  { key: 'btn_send_whatsapp', pt: 'ENVIAR COMPROVATIVO NO WHATSAPP', en: 'SEND RECEIPT ON WHATSAPP', category: 'buttons' },

  // Products & Details
  { key: 'product_selected_color', pt: 'COR SELECIONADA:', en: 'SELECTED COLOR:', category: 'products' },
  { key: 'product_available_sizes', pt: 'TAMANHO DISPONÍVEL:', en: 'AVAILABLE SIZES:', category: 'products' },
  { key: 'product_size_guide', pt: 'GUIA DE MEDIDAS', en: 'SIZE GUIDE', category: 'products' },
  { key: 'product_fit_guide_title', pt: 'Guia de Caimento da Peça:', en: 'Garment Fit Guide:', category: 'products' },
  { key: 'product_view_chart', pt: 'Ver Tabela', en: 'View Chart', category: 'products' },
  { key: 'product_payment_note', pt: 'PAGAMENTO POR TRANSFERÊNCIA / MULTICAIXA EXPRESS NO CHECKOUT', en: 'PAYMENT VIA BANK TRANSFER / MULTICAIXA EXPRESS AT CHECKOUT', category: 'products' },
  { key: 'product_tech_specs', pt: 'ESPECIFICAÇÕES TÉCNICAS & TECIDO', en: 'TECHNICAL SPECIFICATIONS & FABRIC', category: 'products' },
  { key: 'product_spec_cotton', pt: 'Algodão Pesado 100%', en: '100% Heavyweight Cotton', category: 'products' },
  { key: 'product_spec_delivery', pt: 'Entrega Rápida em Luanda', en: 'Fast Delivery in Luanda', category: 'products' },
  { key: 'product_size_modal_title', pt: 'GUIA DE CAIMENTO & MEDIDAS', en: 'FIT & SIZING GUIDE', category: 'products' },
  { key: 'product_size_modal_subtitle', pt: 'WEARING UNUSUAL • FIT & SIZING', en: 'WEARING UNUSUAL • FIT & SIZING', category: 'products' },
  { key: 'product_size_modal_garment_fit', pt: 'GUIA DE CAIMENTO E MEDIDAS DA PEÇA:', en: 'GARMENT FIT AND MEASUREMENTS:', category: 'products' },
  { key: 'product_size_modal_size', pt: 'Tamanho', en: 'Size', category: 'products' },
  { key: 'product_size_modal_chest', pt: 'Peito / Largura', en: 'Chest / Width', category: 'products' },
  { key: 'product_size_modal_length', pt: 'Comprimento', en: 'Length', category: 'products' },
  { key: 'product_size_modal_shoulders', pt: 'Ombro a Ombro', en: 'Shoulder to Shoulder', category: 'products' },
  { key: 'product_size_modal_close', pt: 'ENTENDIDO / FECHAR', en: 'UNDERSTOOD / CLOSE', category: 'products' },
  { key: 'product_favorite_added', pt: 'Item adicionado aos favoritos', en: 'Item added to wishlist', category: 'products' },
  { key: 'product_favorite_removed', pt: 'Item removido dos favoritos', en: 'Item removed from wishlist', category: 'products' },
  { key: 'product_out_of_stock', pt: 'SEM STOCK', en: 'OUT OF STOCK', category: 'products' },
  { key: 'product_unavailable_color', pt: 'Indisponível', en: 'Unavailable', category: 'products' },
  { key: 'product_drop_current', pt: 'DROP ATUAL', en: 'CURRENT DROP', category: 'products' },
  { key: 'product_archive_capsule', pt: 'ARQUIVO CÁPSULA', en: 'CAPSULE ARCHIVE', category: 'products' },
  { key: 'badge_new', pt: 'NOVO', en: 'NEW', category: 'products' },
  { key: 'badge_limited_edition', pt: 'EDIÇÃO LIMITADA', en: 'LIMITED EDITION', category: 'products' },
  { key: 'badge_sold_out', pt: 'ESGOTADO', en: 'SOLD OUT', category: 'products' },
  { key: 'badge_coming_soon', pt: 'AGUARDANDO VAGA', en: 'COMING BACK SOON', category: 'products' },
  { key: 'badge_preorder_stock', pt: 'PRE-ORDER RESTOCK', en: 'PRE-ORDER RESTOCK', category: 'products' },

  // Cart & Checkout
  { key: 'cart_title', pt: 'SACO DE COMPRAS', en: 'SHOPPING BAG', category: 'checkout' },
  { key: 'cart_empty_title', pt: 'O SEU SACO ESTÁ VAZIO', en: 'YOUR CART IS EMPTY', category: 'checkout' },
  { key: 'cart_empty_desc', pt: 'Explore o drop atual para selecionar peças de corte exclusivo.', en: 'Explore the current drop to select exclusive pieces.', category: 'checkout' },
  { key: 'cart_subtotal', pt: 'SUBTOTAL', en: 'SUBTOTAL', category: 'checkout' },
  { key: 'cart_subtotal_label', pt: 'SUBTOTAL:', en: 'SUBTOTAL:', category: 'checkout' },
  { key: 'cart_delivery_free', pt: 'ENTREGA DIRETA EM LUANDA INCLUSA', en: 'DIRECT DELIVERY IN LUANDA INCLUDED', category: 'checkout' },
  { key: 'cart_delivery_fee', pt: 'TAXA DE ENTREGA (LUANDA)', en: 'DELIVERY FEE (LUANDA)', category: 'checkout' },
  { key: 'cart_free', pt: 'GRÁTIS (0 AOA)', en: 'FREE (0 AOA)', category: 'checkout' },
  { key: 'cart_total', pt: 'TOTAL A PAGAR', en: 'TOTAL TO PAY', category: 'checkout' },
  { key: 'cart_free_shipping_earned', pt: 'Parabéns! Ganhou Entrega Grátis', en: 'Congratulations! You earned Free Delivery', category: 'checkout' },
  { key: 'cart_free_shipping_add', pt: 'Adicione mais', en: 'Add', category: 'checkout' },
  { key: 'cart_free_shipping_to_earn', pt: 'para ganhar Entrega Grátis!', en: 'more to get Free Delivery!', category: 'checkout' },
  { key: 'cart_free_shipping_over', pt: 'Entrega Grátis em compras a partir de', en: 'Free Delivery on orders over', category: 'checkout' },
  { key: 'cart_secure_payment', pt: 'PAGAMENTO SEGURO VIA MULTICAIXA EXPRESS', en: 'SECURE PAYMENT VIA MULTICAIXA EXPRESS', category: 'checkout' },
  { key: 'cart_item_size', pt: 'Tam:', en: 'Size:', category: 'checkout' },
  { key: 'cart_item_color', pt: 'Cor:', en: 'Color:', category: 'checkout' },
  { key: 'cart_remove_item', pt: 'Remover item', en: 'Remove item', category: 'checkout' },
  { key: 'checkout_title', pt: 'FINALIZAR ENCOMENDA', en: 'CHECKOUT', category: 'checkout' },
  { key: 'checkout_step_customer', pt: '1. DADOS DO CLIENTE & MORADA EM LUANDA', en: '1. CUSTOMER DETAILS & ADDRESS IN LUANDA', category: 'checkout' },
  { key: 'checkout_name_label', pt: 'Nome Completo', en: 'Full Name', category: 'checkout' },
  { key: 'checkout_name_placeholder', pt: 'Ex: Manuel dos Santos', en: 'e.g. Manuel dos Santos', category: 'checkout' },
  { key: 'checkout_name_error', pt: 'Por favor, introduza o seu Nome Completo.', en: 'Please enter your Full Name.', category: 'checkout' },
  { key: 'checkout_phone_label', pt: 'Telefone / WhatsApp', en: 'Phone / WhatsApp', category: 'checkout' },
  { key: 'checkout_phone_placeholder', pt: 'Ex: +244 923 111 222', en: 'e.g. +244 923 111 222', category: 'checkout' },
  { key: 'checkout_phone_error', pt: 'Por favor, introduza o seu Telefone / WhatsApp.', en: 'Please enter your Phone / WhatsApp.', category: 'checkout' },
  { key: 'checkout_city_label', pt: 'Endereço em Luanda / Bairro / Referência', en: 'Address in Luanda / Neighborhood / Reference', category: 'checkout' },
  { key: 'checkout_city_placeholder', pt: 'Ex: Maianga, Rua Rainha Ginga, Edifício X', en: 'e.g. Maianga, Rua Rainha Ginga, Building X', category: 'checkout' },
  { key: 'checkout_city_error', pt: 'Por favor, introduza o seu Endereço de Entrega em Luanda.', en: 'Please enter your Delivery Address in Luanda.', category: 'checkout' },
  { key: 'checkout_notes_label', pt: 'Instruções Especiais de Entrega (Opcional)', en: 'Special Delivery Instructions (Optional)', category: 'checkout' },
  { key: 'checkout_notes_placeholder', pt: 'Ex: Ligar ao chegar, portão cinzento...', en: 'e.g. Call on arrival, grey gate...', category: 'checkout' },
  { key: 'checkout_step_payment', pt: '2. PAGAMENTO DIRETO MULTICAIXA EXPRESS', en: '2. DIRECT PAYMENT VIA MULTICAIXA EXPRESS', category: 'checkout' },
  { key: 'checkout_iban_label', pt: 'IBAN DE DESTINO:', en: 'DESTINATION IBAN:', category: 'checkout' },
  { key: 'checkout_account_holder', pt: 'TITULAR:', en: 'ACCOUNT HOLDER:', category: 'checkout' },
  { key: 'checkout_account_number', pt: 'CONTA EXPRESS / TELEFONE:', en: 'EXPRESS ACCOUNT / PHONE:', category: 'checkout' },
  { key: 'checkout_step_proof', pt: '3. COMPROVATIVO DE TRANSFERÊNCIA (OBRIGATÓRIO)', en: '3. TRANSFER RECEIPT / PROOF (MANDATORY)', category: 'checkout' },
  { key: 'checkout_proof_required_note', pt: 'É obrigatório anexar a imagem ou captura do comprovativo do Multicaixa Express para validação imediata da vaga.', en: 'It is mandatory to attach proof of transfer for immediate order confirmation.', category: 'checkout' },
  { key: 'checkout_upload_cta', pt: 'CLIQUE PARA CARREGAR O COMPROVATIVO', en: 'CLICK TO UPLOAD RECEIPT', category: 'checkout' },
  { key: 'checkout_upload_formats', pt: 'Formatos aceites: JPG, PNG, PDF (Máx. 10MB)', en: 'Accepted formats: JPG, PNG, PDF (Max. 10MB)', category: 'checkout' },
  { key: 'checkout_proof_error', pt: 'O upload do comprovativo de pagamento é 100% obrigatório para confirmar o pedido.', en: 'Proof of payment upload is 100% mandatory to confirm the order.', category: 'checkout' },
  { key: 'checkout_summary', pt: 'RESUMO DA ENCOMENDA', en: 'ORDER SUMMARY', category: 'checkout' },
  { key: 'checkout_locked_msg', pt: 'O checkout encontra-se temporariamente suspenso para contagem de stock.', en: 'Checkout is temporarily suspended for inventory count.', category: 'checkout' },

  // Tracking & Orders
  { key: 'track_heading', pt: 'RASTREIO DE ENCOMENDA', en: 'ORDER TRACKING', category: 'tracking' },
  { key: 'track_subtitle', pt: 'Insira o seu código WU para verificar o estado da produção e entrega em tempo real.', en: 'Enter your WU code to check real-time production and delivery status.', category: 'tracking' },
  { key: 'track_search_placeholder', pt: 'DIGITE O CÓDIGO (EX: WU-8492)', en: 'ENTER CODE (E.G. WU-8492)', category: 'tracking' },
  { key: 'track_btn', pt: 'RASTREAR AGORA', en: 'TRACK NOW', category: 'tracking' },
  { key: 'track_searching', pt: 'A PESQUISAR...', en: 'SEARCHING...', category: 'tracking' },
  { key: 'track_not_found_title', pt: 'ENCOMENDA NÃO ENCONTRADA', en: 'ORDER NOT FOUND', category: 'tracking' },
  { key: 'track_not_found_desc', pt: 'Não encontramos nenhuma encomenda com o código indicado. Por favor verifique o código ou entre em contacto via WhatsApp.', en: 'We could not find any order with the provided code. Please verify the code or contact us via WhatsApp.', category: 'tracking' },
  { key: 'track_order_details', pt: 'DETALHES DA ENCOMENDA', en: 'ORDER DETAILS', category: 'tracking' },
  { key: 'track_status_label', pt: 'ESTADO ATUAL:', en: 'CURRENT STATUS:', category: 'tracking' },
  { key: 'track_customer_label', pt: 'CLIENTE:', en: 'CUSTOMER:', category: 'tracking' },
  { key: 'track_destination_label', pt: 'DESTINO:', en: 'DESTINATION:', category: 'tracking' },
  { key: 'track_total_label', pt: 'TOTAL PAGO:', en: 'TOTAL PAID:', category: 'tracking' },
  { key: 'track_delivery_date_label', pt: 'DATA DE ENTREGA:', en: 'DELIVERY DATE:', category: 'tracking' },
  { key: 'track_time_window_label', pt: 'TURNO:', en: 'TIME SLOT:', category: 'tracking' },
  { key: 'track_timeline_title', pt: 'LINHA DO TEMPO DA ENCOMENDA', en: 'ORDER TIMELINE', category: 'tracking' },
  { key: 'track_step_1_title', pt: 'Pedido Confirmado', en: 'Order Confirmed', category: 'tracking' },
  { key: 'track_step_1_desc', pt: 'Comprovativo validado e vaga reservada com sucesso no atelier.', en: 'Proof verified and spot successfully reserved at the atelier.', category: 'tracking' },
  { key: 'track_step_2_title', pt: 'A sua encomenda saiu do local de produção', en: 'Order left production atelier', category: 'tracking' },
  { key: 'track_step_2_desc', pt: 'Peça embalada sob padrão artesanal estrito e entregue à logística.', en: 'Garment packed under strict standards and dispatched to courier.', category: 'tracking' },
  { key: 'track_step_3_title', pt: 'A sua encomenda está prestes a chegar', en: 'Your order is arriving soon', category: 'tracking' },
  { key: 'track_step_3_desc', pt: 'O estafeta está a caminho do seu endereço em Luanda.', en: 'Courier is en route to your address in Luanda.', category: 'tracking' },
  { key: 'track_step_3_alert', pt: 'Certifique-se de se manter contactável no seu telefone.', en: 'Please make sure your phone remains reachable.', category: 'tracking' },
  { key: 'track_step_4_title', pt: 'Entregue', en: 'Delivered', category: 'tracking' },
  { key: 'track_step_4_desc', pt: 'Peça entregue em mãos com sucesso.', en: 'Garment successfully delivered in hands.', category: 'tracking' },
  { key: 'track_schedule_cta', pt: 'Peça pronta para entrega! Escolha a data de entrega desejada.', en: 'Piece ready for delivery! Choose your preferred delivery date.', category: 'tracking' },
  { key: 'track_schedule_btn', pt: 'ESCOLHER DATA DE ENTREGA', en: 'CHOOSE DELIVERY DATE', category: 'tracking' },

  // Pre-Order & Restock
  { key: 'preorder_badge_sold_out', pt: 'ESGOTADO', en: 'SOLD OUT', category: 'headings' },
  { key: 'preorder_badge_coming_soon', pt: 'AGUARDANDO VAGA', en: 'COMING BACK SOON', category: 'headings' },
  { key: 'preorder_btn_action', pt: 'PRÉ-ENCOMENDA', en: 'PRE-ORDER', category: 'buttons' },
  { key: 'preorder_btn_request_restock', pt: 'SOLICITAR REPOSIÇÃO', en: 'REQUEST RESTOCK', category: 'buttons' },
  { key: 'preorder_modal_title_suffix', pt: '— PRÉ-ENCOMENDA', en: '— PRE-ORDER', category: 'headings' },
  { key: 'preorder_modal_desc', pt: 'Esta é uma peça em pré-encomenda. A sua peça será produzida artesanalmente sob demanda com prioridade.', en: 'This is a pre-order item. Your piece will be produced specifically for this restock.', category: 'headings' },
  { key: 'preorder_estimated_delivery_label', pt: 'Previsão de entrega:', en: 'Estimated delivery:', category: 'headings' },
  { key: 'preorder_price_label', pt: 'Preço:', en: 'Price:', category: 'headings' },
  { key: 'preorder_whatsapp_label', pt: 'WhatsApp:', en: 'WhatsApp:', category: 'headings' },
  { key: 'preorder_confirm_btn', pt: 'CONFIRMAR PRÉ-ENCOMENDA', en: 'CONFIRM PRE-ORDER', category: 'buttons' },
  { key: 'preorder_confirmed_title', pt: 'PRE-ORDER CONFIRMADA ✓', en: 'PRE-ORDER CONFIRMED ✓', category: 'headings' },
  { key: 'preorder_confirmed_tagline', pt: 'Estás dentro.', en: "You're in.", category: 'headings' },
  { key: 'preorder_confirmed_msg', pt: 'Avisaremos no WhatsApp assim que a tua peça estiver pronta para entrega.', en: "We'll contact you on WhatsApp as soon as your piece is ready for delivery.", category: 'headings' },
  { key: 'preorder_ready_title', pt: 'A TUA PRÉ-ENCOMENDA ESTÁ PRONTA 🖤', en: 'YOUR PRE-ORDER IS READY 🖤', category: 'headings' },
  { key: 'preorder_ready_delivery_starts', pt: 'As entregas começam brevemente.', en: 'Delivery starts shortly.', category: 'headings' },
  { key: 'preorder_ready_choose_date', pt: 'Por favor escolhe a tua data preferida de entrega.', en: 'Please choose your preferred delivery date.', category: 'headings' },
  { key: 'preorder_choose_date_btn', pt: 'ESCOLHER DATA DE ENTREGA', en: 'CHOOSE DELIVERY DATE', category: 'buttons' },
  { key: 'preorder_date_selector_label', pt: 'SELECIONE A SUA DATA PREFERIDA DE ENTREGA', en: 'SELECT YOUR PREFERRED DELIVERY DATE', category: 'headings' },
  { key: 'preorder_confirm_date_btn', pt: 'CONFIRMAR DATA DE ENTREGA', en: 'CONFIRM DELIVERY DATE', category: 'buttons' },
  { key: 'preorder_delivery_scheduled_title', pt: 'ENTREGA AGENDADA ✓', en: 'DELIVERY SCHEDULED ✓', category: 'headings' },
  { key: 'preorder_delivery_scheduled_msg', pt: 'A sua encomenda será entregue no dia selecionado.', en: 'Your order will be delivered on the selected day.', category: 'headings' },
  { key: 'preorder_delivery_scheduled_sub', pt: 'Por favor mantenha o seu telefone por perto no dia da entrega.', en: 'Please keep your phone nearby on the delivery day.', category: 'headings' },
  { key: 'preorder_out_for_delivery_title', pt: 'A SUA ENCOMENDA ESTÁ A CAMINHO 🖤', en: 'YOUR ORDER IS ON ITS WAY 🖤', category: 'headings' },
  { key: 'preorder_out_for_delivery_msg', pt: 'O estafeta está a caminho do seu endereço em Luanda.', en: 'The courier is on the way to your address in Luanda.', category: 'headings' },
  { key: 'preorder_delivered_title', pt: 'ENTREGUE ✓', en: 'DELIVERED ✓', category: 'headings' },
  { key: 'preorder_delivered_msg', pt: 'A sua peça foi entregue em mãos com sucesso. Obrigado por fazer parte da Wearing Unusual.', en: 'Your piece has been delivered. Thank you for being part of Wearing Unusual.', category: 'headings' },
  { key: 'preorder_restock_success_msg', pt: 'INTERESSE REGISTADO COM SUCESSO. AVISAREMOS NO WHATSAPP ASSIM QUE O ITEM ENTRAR EM PRÉ-VENDA.', en: 'INTEREST REGISTERED. WE WILL NOTIFY YOU ON WHATSAPP AS SOON AS PRE-ORDER OPENS.', category: 'headings' },

  // Footer
  { key: 'footer_rights', pt: 'TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA.', en: 'ALL RIGHTS RESERVED. LUANDA, ANGOLA.', category: 'footer' },
  { key: 'footer_navigation', pt: 'NAVEGAÇÃO', en: 'NAVIGATION', category: 'footer' },
  { key: 'footer_secure_payment', pt: 'PAGAMENTO SEGURO', en: 'SECURE PAYMENT', category: 'footer' },
  { key: 'footer_secure_payment_desc', pt: 'Transferências seguras via Multicaixa Express e IBAN com verificação rigorosa de comprovativo.', en: 'Secure transfers via Multicaixa Express and IBAN with strict receipt verification.', category: 'footer' },
  { key: 'footer_location', pt: 'Luanda, Angola • Entregas em Toda a Cidade', en: 'Luanda, Angola • Citywide Delivery', category: 'footer' },

  // System & Views
  { key: 'preview_topbar_title', pt: 'MODO PREVIEW • DRAFT', en: 'PREVIEW MODE • DRAFT', category: 'system' },
  { key: 'preview_topbar_desc', pt: 'A ver rascunho com alterações do Admin. Os visitantes vêem apenas a versão publicada.', en: 'Viewing draft with Admin changes. Visitors see only the published version.', category: 'system' },
  { key: 'preview_topbar_safe', pt: 'Simulação Segura', en: 'Safe Simulation', category: 'system' },
  { key: 'preview_topbar_back', pt: 'Voltar ao Admin', en: 'Return to Admin', category: 'system' },
  { key: 'preview_topbar_publish', pt: 'Publicar Alterações', en: 'Publish Changes', category: 'system' },
  { key: 'preview_topbar_publishing', pt: 'A Publicar...', en: 'Publishing...', category: 'system' },
  { key: 'preview_topbar_published', pt: 'Publicado ✓', en: 'Published ✓', category: 'system' },
  { key: 'maintenance_banner_title', pt: 'MODO MANUTENÇÃO ATIVO — Os visitantes comuns vêem a tela oficial de manutenção.', en: 'MAINTENANCE MODE ACTIVE — Regular visitors see the official maintenance page.', category: 'system' },
  { key: 'maintenance_banner_btn', pt: 'Ir para o Admin', en: 'Go to Admin', category: 'system' },
  { key: 'lock_banner_title', pt: 'AVISO: O CHECKOUT ENCONTRA-SE TEMPORARIAMENTE SUSPENSO PARA CONTAGEM DE STOCK.', en: 'NOTICE: CHECKOUT IS TEMPORARILY SUSPENDED FOR INVENTORY COUNT.', category: 'system' },
  { key: 'search_input_placeholder', pt: 'Pesquisar por peça, categoria ou tecido (ex: Hoodie, Denim, Boxy)...', en: 'Search by piece, category, or fabric (e.g. Hoodie, Denim, Boxy)...', category: 'system' },
  { key: 'search_results_count', pt: 'resultados encontrados', en: 'results found', category: 'system' },
  { key: 'search_no_results_text', pt: 'Nenhum resultado encontrado para', en: 'No results found for', category: 'system' },
  { key: 'wishlist_header_title', pt: 'FAVORITOS', en: 'WISHLIST', category: 'system' },
  { key: 'wishlist_empty_header', pt: 'A sua lista de favoritos está vazia', en: 'Your wishlist is empty', category: 'system' },
  { key: 'wishlist_empty_sub', pt: 'Guarde as suas peças de arquivo preferidas clicando no ícone de coração.', en: 'Save your favorite pieces by clicking the heart icon.', category: 'system' },
  { key: 'wishlist_explore_btn', pt: 'EXPLORAR DROP', en: 'EXPLORE DROP', category: 'system' },
  { key: 'time_capsule_museum', pt: 'MUSEU ARQUIVAL', en: 'ARCHIVAL MUSEUM', category: 'system' },
  { key: 'time_capsule_hero_title', pt: 'CÁPSULA DO TEMPO', en: 'TIME CAPSULE', category: 'system' },
  { key: 'time_capsule_hero_desc', pt: 'As peças da Cápsula do Tempo representam edições esgotadas e arquivadas permanentemente. Mantemos o registo fotográfico e técnico destas silhuetas como tributo à nossa evolução arquitetural em Luanda.', en: 'Time Capsule pieces represent permanently archived, sold-out editions. We maintain photographic and technical records of these silhouettes as a tribute to our architectural evolution in Luanda.', category: 'system' },
  { key: 'time_capsule_return_drop', pt: 'VOLTAR AO DROP ATUAL', en: 'RETURN TO CURRENT DROP', category: 'system' },
  { key: 'choose_date_heading', pt: 'ESCOLHER DATA DE ENTREGA', en: 'CHOOSE DELIVERY DATE', category: 'system' },
  { key: 'choose_date_step1', pt: '1. ESCOLHE UMA DATA DISPONÍVEL', en: '1. SELECT AN AVAILABLE DATE', category: 'system' },
  { key: 'choose_date_step2', pt: '2. TURNO DE PREFERÊNCIA', en: '2. PREFERRED TIME SLOT', category: 'system' },
  { key: 'choose_date_selected_day', pt: 'Dia selecionado:', en: 'Selected day:', category: 'system' },
  { key: 'choose_date_dispatch_confirmed', pt: 'DESPACHO CONFIRMADO', en: 'DISPATCH CONFIRMED', category: 'system' },
  { key: 'choose_date_live_tracking', pt: 'Acompanhar no Rastreio', en: 'View Live Tracking', category: 'system' },
  { key: 'choose_date_change', pt: 'Alterar Data', en: 'Change Date', category: 'system' },
  { key: 'choose_date_production_in_progress', pt: 'PEÇA EM PRODUÇÃO', en: 'PRODUCTION IN PROGRESS', category: 'system' },
  { key: 'choose_date_production_sub', pt: 'A tua peça ainda se encontra em confeção no atelier.', en: 'Your piece is currently in production at the atelier.', category: 'system' },
  { key: 'choose_date_full_timeline', pt: 'Ver Linha do Tempo Completa', en: 'View Full Timeline', category: 'system' },
  { key: 'choose_date_ready_dispatch', pt: 'PEÇAS PRONTAS PARA DESPACHO', en: 'PIECES READY FOR DISPATCH', category: 'system' },
];

export const INITIAL_SETTINGS: SiteSettings = {
  id: 'global',
  store_name: 'WEARING UNUSUAL',
  site_logo_url: '/logo.png',
  brand_bio: 'Wearing Unusual — Silhuetas brutalistas e rigor arquitetural desenhados e produzidos em Luanda, Angola. Edições limitadas sob demanda.',
  brand_bio_en: 'Wearing Unusual — Brutalist silhouettes and architectural precision crafted and produced in Luanda, Angola. Limited on-demand editions.',
  location_text: 'Luanda, Angola • Entregas em Toda a Cidade',
  location_text_en: 'Luanda, Angola • Citywide Delivery',
  contact_email: 'contato@wearingunusual.com',
  instagram_handle: '@wearingunusual',
  copyright_text: 'TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA.',
  copyright_text_en: 'ALL RIGHTS RESERVED. LUANDA, ANGOLA.',
  delivery_fee_aoa: 5000,
  maintenance_mode: false,
  maintenance_message: 'ESTAMOS A ATUALIZAR O NOSSO ESPAÇO PARA O PRÓXIMO LANÇAMENTO. RETORNAREMOS EM BREVE.',
  maintenance_message_en: 'WE ARE CURRENTLY UPDATING OUR SPACE FOR THE UPCOMING DROP. RETURNING SOON.',
  next_drop_mode: false,
  next_drop_date: '2026-10-31T20:00:00Z',
  next_drop_title: 'DROP 01 — WELCOME TO LUANDA',
  next_drop_title_en: 'DROP 01 — WELCOME TO LUANDA',
  checkout_locked: false,
  checkout_lock_message: 'O CHECKOUT ENCONTRA-SE TEMPORARIAMENTE SUSPENSO PARA CONTAGEM DE STOCK.',
  checkout_lock_message_en: 'CHECKOUT IS TEMPORARILY SUSPENDED FOR INVENTORY COUNT.',
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
  marquee_messages_en: [
    'LIMITED EDITION • DROP 01 WELCOME TO LUANDA',
    'CRAFTED IN ANGOLA',
    'CITYWIDE DELIVERY IN LUANDA',
    'WEARING UNUSUAL — HIGH-END MINIMALIST STREETWEAR',
    'DIRECT PAYMENT VIA MULTICAIXA EXPRESS'
  ],
  footer_categories: [
    'T-Shirts & Tops',
    'Hoodies',
    'Sweatshirts',
    'Denim',
    'Outerwear',
    'Acessórios'
  ],
  default_language: 'pt',
  enable_pre_order_button: true,
  enable_request_restock_button: true,
  pre_order_button_text_pt: 'PRÉ-ENCOMENDA',
  pre_order_button_text_en: 'PRE-ORDER',
  request_restock_button_text_pt: 'SOLICITAR REPOSIÇÃO',
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
  restock_phone_required_error_en: 'Please enter your WhatsApp / Phone number.',

  // Settings -> Pre-Order Content -> WhatsApp & Delivery Dates
  pre_order_whatsapp_template_pt: `UNUSUAL —  ENCOMENDA PRONTA

A tua encomenda está pronta para entrega!

As entregas começam no dia [DATA].

Por favor, escolhe a data da tua entrega através do link abaixo:

[ ESCOLHER DATA DE ENTREGA ]`,
  pre_order_whatsapp_template_en: `UNUSUAL —  ORDER READY

Your order is ready for delivery!

Deliveries start on [DATA].

Please choose your delivery date using the link below:

[ CHOOSE DELIVERY DATE ]`,
  pre_order_deliveries_start_date: '2026-10-18',
  pre_order_available_delivery_dates: [
    '2026-10-18',
    '2026-10-19',
    '2026-10-20',
    '2026-10-21',
    '2026-10-22',
    '2026-10-23',
    '2026-10-24'
  ],
  pre_order_choose_date_title_pt: 'ESCOLHER DATA DE ENTREGA',
  pre_order_choose_date_title_en: 'CHOOSE DELIVERY DATE',
  pre_order_choose_date_desc_pt: 'A tua encomenda de pre-order está concluída pelo atelier e pronta para envio. Por favor, seleciona a tua data preferida de entrega.',
  pre_order_choose_date_desc_en: 'Your pre-order piece has been completed by the atelier and is ready for dispatch. Please select your preferred delivery date.',
  pre_order_choose_date_btn_pt: 'CONFIRMAR DATA DE ENTREGA',
  pre_order_choose_date_btn_en: 'CONFIRM DELIVERY DATE',
  pre_order_delivery_scheduled_msg_pt: 'A tua entrega foi agendada com sucesso. Entraremos em contacto no dia da entrega.',
  pre_order_delivery_scheduled_msg_en: 'Your delivery has been scheduled successfully. We will contact you on delivery day.',

  // Dynamic Navigation Menu and Custom Content Collections
  menu_items: INITIAL_MENU_ITEMS,
  custom_contents: INITIAL_CUSTOM_CONTENTS,

  updated_at: '2020-01-01T00:00:00.000Z',
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
  return_date TEXT,
  enable_request_restock BOOLEAN DEFAULT false,
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
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_date TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS enable_request_restock BOOLEAN DEFAULT false;

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
