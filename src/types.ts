export type Language = 'pt' | 'en';

export type ProductLifecycle = 'active_drop' | 'time_capsule';

export type ProductBadge = 'NOVO' | 'ESGOTADO' | 'EDIÇÃO LIMITADA' | 'Aguardando Vaga' | string;

export interface ProductSize {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  in_stock: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  image_url?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_aoa: number;
  description: string;
  details: string;
  size_guide?: string;
  fit_guide?: string;
  images: string[];
  sizes: ProductSize[];
  colors: ProductColor[];
  badge: ProductBadge | null;
  lifecycle: ProductLifecycle;
  is_visible: boolean;
  is_featured: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'Pendente de Verificação'
  | 'Pendente'
  | 'Aprovado'
  | 'Pedido Confirmado'
  | 'Em Trânsito'
  | 'Em Produção/Trânsito'
  | 'Prestes a Chegar'
  | 'Entregue'
  | 'Cancelado';

export interface OrderItem {
  product_id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price_aoa: number;
  image_url: string;
}

export interface OrderTimelineEvent {
  step: number;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active: boolean;
  admin_note?: string;
}

export interface Order {
  id: string;
  tracking_code: string; // e.g. WU-849201
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address?: string;
  customer_reference?: string;
  customer_notes?: string;
  admin_notes?: string; // Instruções / notas do suporte e atelier para o cliente
  items: OrderItem[];
  total_aoa: number;
  payment_method: string;
  payment_proof_url?: string;
  status: OrderStatus;
  status_timeline?: OrderTimelineEvent[];
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export type BlockType =
  | 'hero_banner'
  | 'marquee'
  | 'drop_grid'
  | 'time_capsule'
  | 'lookbook'
  | 'manifesto'
  | 'editorial_highlight';

export interface SiteBlock {
  id: string;
  block_type: BlockType;
  title: string;
  subtitle?: string;
  content: Record<string, any>;
  is_active: boolean;
  order_index: number;
  updated_at?: string;
}

export interface DictionaryEntry {
  key: string;
  pt: string;
  en: string;
  category: 'navigation' | 'buttons' | 'headings' | 'checkout' | 'footer' | 'manifesto' | 'tracking';
  updated_at?: string;
}

export interface SiteSettings {
  id: string;
  store_name: string;
  site_logo_url?: string;
  logo_url?: string;
  brand_bio?: string;
  location_text?: string;
  contact_email?: string;
  instagram_handle?: string;
  copyright_text?: string;
  delivery_fee_aoa?: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  next_drop_mode: boolean;
  next_drop_date: string;
  next_drop_title: string;
  checkout_locked: boolean;
  checkout_lock_message: string;
  require_payment_proof: boolean;
  iban: string;
  account_holder: string;
  account_number: string;
  multicaixa_express_phone: string;
  whatsapp_number: string;
  marquee_enabled: boolean;
  marquee_messages: string[];
  footer_categories: string[];
  updated_at?: string;
}
