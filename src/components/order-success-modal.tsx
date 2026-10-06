import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, Phone, Clock, Package } from 'lucide-react';
import { Order } from '../types';
import { formatAOA } from '../lib/format';
import { useStore } from '../context/StoreContext';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewTracking: (trackingCode: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewTracking,
}) => {
  const { settings, language } = useStore();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.tracking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreOrder = order.is_pre_order || order.order_type === 'pre_order';

  const itemsSummary = order.items
    .map((it) => `${it.name} (${it.size} - ${it.color}) x${it.quantity}`)
    .join(', ');

  const whatsappTarget = (settings.whatsapp_number || '+244 937765130').replace(/\D/g, '') || '244937765130';

  const regularWhatsappMessagePt = encodeURIComponent(
    `Olá Wearing Unusual! Acabei de efetuar uma encomenda com o código de rastreio *${order.tracking_code}*.\n\n` +
    `*Itens:* ${itemsSummary}\n` +
    `*Total:* ${formatAOA(order.total_aoa)}\n` +
    `*Cliente:* ${order.customer_name}\n` +
    `*Morada em Luanda:* ${order.customer_city}\n\n` +
    `Envio o comprovativo de pagamento em anexo para validação.`
  );

  const preOrderWhatsappMessagePt = encodeURIComponent(
    `Olá Wearing Unusual! Acabei de confirmar uma PRE-ORDER com o código de rastreio *${order.tracking_code}*.\n\n` +
    `*Peça em Pré-encomenda:* ${itemsSummary}\n` +
    `*Total:* ${formatAOA(order.total_aoa)}\n` +
    `*Cliente:* ${order.customer_name}\n` +
    `*Endereço:* ${order.customer_city}\n\n` +
    `Envio o comprovativo para validação da minha vaga no lote de produção.`
  );

  const regularWhatsappMessageEn = encodeURIComponent(
    `Hello Wearing Unusual! I just placed an order with tracking code *${order.tracking_code}*.\n\n` +
    `*Items:* ${itemsSummary}\n` +
    `*Total:* ${formatAOA(order.total_aoa)}\n` +
    `*Customer:* ${order.customer_name}\n` +
    `*Address:* ${order.customer_city}\n\n` +
    `Attached is the payment receipt for validation.`
  );

  const preOrderWhatsappMessageEn = encodeURIComponent(
    `Hello Wearing Unusual! I just confirmed a PRE-ORDER with tracking code *${order.tracking_code}*.\n\n` +
    `*Pre-order Item:* ${itemsSummary}\n` +
    `*Total:* ${formatAOA(order.total_aoa)}\n` +
    `*Customer:* ${order.customer_name}\n` +
    `*Address:* ${order.customer_city}\n\n` +
    `Attached is the payment receipt to secure my spot in the production batch.`
  );

  const whatsappMessage = language === 'en'
    ? (isPreOrder ? preOrderWhatsappMessageEn : regularWhatsappMessageEn)
    : (isPreOrder ? preOrderWhatsappMessagePt : regularWhatsappMessagePt);

  return (
    <div
      id="order-success-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-[#0c0c0c] border border-[#262626] rounded-xl p-5 sm:p-8 space-y-6 shadow-2xl text-center my-auto overflow-y-auto max-h-[90vh] overscroll-contain">
        <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] text-[#888888] font-sans tracking-[0.3em] uppercase block">
            {isPreOrder
              ? (language === 'en' ? 'PRE-ORDER CONFIRMED ✓' : 'PRÉ-ENCOMENDA CONFIRMADA ✓')
              : (language === 'en' ? 'ORDER REGISTERED SUCCESSFULLY ✓' : 'PEDIDO REGISTADO COM SUCESSO ✓')}
          </span>
          <h2 className="font-display uppercase text-2xl sm:text-3xl text-white tracking-[0.15em]">
            {isPreOrder
              ? (language === 'en' ? "YOU'RE IN." : 'ESTÁS DENTRO.')
              : (language === 'en' ? 'UNIQUE TRACKING CODE' : 'CÓDIGO DE RASTREIO ÚNICO')}
          </h2>
          <p className="text-xs text-[#777777] font-sans">
            {isPreOrder
              ? (language === 'en'
                  ? 'We will contact you on WhatsApp as soon as your piece is ready for delivery.'
                  : 'Entraremos em contacto pelo WhatsApp assim que a sua peça estiver pronta para entrega.')
              : (language === 'en'
                  ? 'Save your exclusive code to track your order in real time on our Timeline.'
                  : 'Guarde o seu código exclusivo para acompanhar o estado da sua encomenda em tempo real na nossa Linha do Tempo.')}
          </p>
        </div>

        {/* Unique Tracking Code Box */}
        <div className="p-4 bg-[#141414] border border-[#2b2b2b] rounded-lg flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-sans">
              {language === 'en' ? 'YOUR UNIQUE CODE' : 'O SEU CÓDIGO INDIVIDUAL'}
            </span>
            <span className="font-mono text-2xl font-bold text-white tracking-widest">
              {order.tracking_code}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 bg-white text-black hover:bg-[#eaeaea] rounded text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (language === 'en' ? 'COPIED' : 'COPIADO') : (language === 'en' ? 'COPY' : 'COPIAR')}</span>
          </button>
        </div>

        {/* Summary Info */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded p-4 text-xs font-sans text-left space-y-2 text-[#999999]">
          <div className="flex justify-between">
            <span className="text-[#666666] uppercase">{language === 'en' ? 'Recipient:' : 'Destinatário:'}</span>
            <span className="text-white font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666] uppercase">{language === 'en' ? 'Contact:' : 'Contacto:'}</span>
            <span className="text-white font-medium">{order.customer_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666] uppercase">{language === 'en' ? 'Address in Luanda:' : 'Endereço em Luanda:'}</span>
            <span className="text-white font-medium">{order.customer_city}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#1a1a1a]">
            <span className="text-[#666666] uppercase">{language === 'en' ? 'Total Paid:' : 'Total Pago:'}</span>
            <span className="text-white font-bold text-sm">{formatAOA(order.total_aoa)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              onViewTracking(order.tracking_code);
            }}
            className="w-full py-3.5 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{language === 'en' ? 'TRACK ON TIMELINE' : 'ACOMPANHAR NA LINHA DO TEMPO'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={`https://wa.me/${whatsappTarget}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-[#181818] hover:bg-[#222222] text-white border border-[#2b2b2b] font-sans text-xs tracking-[0.2em] uppercase rounded transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'CONFIRM ON WHATSAPP' : 'CONFIRMAR NO WHATSAPP'}</span>
          </a>

          <button
            onClick={onClose}
            className="text-xs text-[#777777] hover:text-white font-sans uppercase tracking-wider py-1 cursor-pointer"
          >
            {language === 'en' ? 'Close and Continue Browsing' : 'Fechar e Continuar a Navegar'}
          </button>
        </div>
      </div>
    </div>
  );
};
