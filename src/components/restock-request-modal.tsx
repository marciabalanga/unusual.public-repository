import React, { useState } from 'react';
import {
  X,
  BellRing,
  CheckCircle2,
  Send,
  Phone,
  User,
  Sparkles,
  Archive
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { WULogo } from './wu-logo';

interface RestockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const RestockRequestModal: React.FC<RestockRequestModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { settings, language, requestRestock } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Texts dynamically resolved from Settings (with graceful fallbacks)
  const isEn = language === 'en';

  const modalTitle = isEn
    ? settings.restock_title_en || 'WOULD YOU LIKE THIS COLLECTION TO RETURN?'
    : settings.restock_title_pt || 'GOSTARIAS QUE ESTA COLEÇÃO VOLTASSE?';

  const modalDesc = isEn
    ? settings.restock_description_en || 'Let us know. Your interest helps us decide which pieces may return.'
    : settings.restock_description_pt || 'Deixa-nos saber. O teu interesse ajuda-nos a decidir quais peças podem voltar.';

  const badgeText = isEn
    ? settings.restock_badge_text_en || 'TIME CAPSULE • INTEREST SURVEY'
    : settings.restock_badge_text_pt || 'CÁPSULA DO TEMPO • AVALIAÇÃO DE INTERESSE';

  const nameLabel = isEn
    ? settings.restock_name_label_en || 'YOUR NAME (OPTIONAL)'
    : settings.restock_name_label_pt || 'O SEU NOME (OPCIONAL)';

  const namePlaceholder = isEn
    ? settings.restock_name_placeholder_en || 'e.g. John Doe'
    : settings.restock_name_placeholder_pt || 'ex: Aldemir Santos';

  const phoneLabel = isEn
    ? settings.restock_phone_label_en || 'WHATSAPP / PHONE (REQUIRED) *'
    : settings.restock_phone_label_pt || 'WHATSAPP / TELEFONE (OBRIGATÓRIO) *';

  const phonePlaceholder = isEn
    ? settings.restock_phone_placeholder_en || '+244 9XX XXX XXX'
    : settings.restock_phone_placeholder_pt || '+244 9XX XXX XXX';

  const submitButtonText = isEn
    ? settings.restock_submit_btn_en || settings.request_restock_button_text_en || 'REQUEST RESTOCK'
    : settings.restock_submit_btn_pt || settings.request_restock_button_text_pt || 'REQUEST RESTOCK';

  const submittingText = isEn
    ? settings.restock_submitting_text_en || 'REGISTERING INTEREST...'
    : settings.restock_submitting_text_pt || 'A REGISTAR INTERESSE...';

  const successTitle = isEn
    ? settings.restock_success_title_en || 'INTEREST REGISTERED SUCCESSFULLY'
    : settings.restock_success_title_pt || 'INTERESSE REGISTADO COM SUCESSO';

  const successMessage = isEn
    ? settings.restock_success_message_en ||
      'Your interest has been noted by the atelier. If we decide to reopen production for pre-order, you will be contacted first via WhatsApp.'
    : settings.restock_success_message_pt ||
      'O teu interesse foi anotado pelo atelier. Se decidirmos reabrir a produção para pré-venda, contactamos-te em primeira mão via WhatsApp.';

  const phoneRequiredError = isEn
    ? settings.restock_phone_required_error_en || 'Please enter your WhatsApp / Phone number.'
    : settings.restock_phone_required_error_pt || 'Por favor introduza o seu número de WhatsApp / Telefone.';

  const generalError = isEn
    ? settings.restock_error_message_en || 'An error occurred while registering your interest. Please try again.'
    : settings.restock_error_message_pt || 'Ocorreu um erro ao registar o seu interesse. Por favor tente novamente.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError(phoneRequiredError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const collectionName = product.category || 'Cápsula do Tempo';
      await requestRestock(
        product.id,
        product.name,
        phone.trim(),
        customerName.trim() || undefined,
        collectionName,
        language
      );
      setIsSuccess(true);
    } catch {
      setError(generalError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setCustomerName('');
    setPhone('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-2xl p-6 sm:p-8 text-white space-y-6">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#181818] hover:bg-white hover:text-black text-[#888888] transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#1c1c1c] pb-4">
          <WULogo className="h-4 w-auto fill-white shrink-0" />
          <span className="text-[10px] text-[#888888] font-mono uppercase tracking-[0.25em]">
            WEARING UNUSUAL • ARCHIVE RESTOCK
          </span>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display uppercase text-lg sm:text-xl text-white tracking-wider">
                {successTitle}
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-[#121212] border border-[#1f1f1f] rounded text-[11px] text-[#aaaaaa] font-mono">
                <span className="text-[#666666] block text-[9px] uppercase tracking-wider mb-0.5">
                  PEÇA REGISTADA
                </span>
                <span className="text-white font-bold">{product.name}</span>
                <span className="text-[#777777] block mt-0.5 text-[10px]">
                  WhatsApp: {phone}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase rounded tracking-widest hover:bg-[#eaeaea] transition-all cursor-pointer"
            >
              {isEn ? 'CLOSE' : 'FECHAR'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#161616] border border-[#262626] text-amber-300 text-[10px] font-mono tracking-widest uppercase">
                <BellRing className="w-3 h-3 text-amber-400" />
                <span>{badgeText}</span>
              </div>

              <h2 className="font-display font-bold uppercase text-lg sm:text-xl text-white tracking-wider leading-tight">
                {modalTitle}
              </h2>

              <p className="text-xs text-[#888888] leading-relaxed">
                {modalDesc}
              </p>

              {/* Product Badge summary */}
              <div className="flex items-center gap-3 p-2.5 bg-[#121212] border border-[#1c1c1c] rounded">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-10 h-12 object-cover rounded bg-[#181818]"
                  />
                ) : (
                  <div className="w-10 h-12 rounded bg-[#181818] flex items-center justify-center">
                    <Archive className="w-4 h-4 text-[#555555]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] text-[#666666] font-mono uppercase tracking-wider block">
                    {product.category || 'Cápsula do Tempo'}
                  </span>
                  <span className="text-xs font-display text-white uppercase tracking-wide truncate block">
                    {product.name}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded text-red-300 text-xs">
                {error}
              </div>
            )}

            {/* Simple Form without Sizes or Purchase Details */}
            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-[#888888] mb-1.5">
                  {nameLabel}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#555555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={namePlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#222222] rounded text-white text-xs placeholder-[#555555] focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-[#888888] mb-1.5">
                  {phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#555555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder={phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#222222] rounded text-white text-xs placeholder-[#555555] focus:border-white focus:outline-none font-mono transition-colors"
                  />
                </div>
                <p className="text-[10px] text-[#666666] font-sans mt-1">
                  {isEn
                    ? 'Only used to gauge interest and inform if restock is approved.'
                    : 'Apenas para medir o interesse e avisar se a produção for aprovada.'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shadow-lg"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>{isSubmitting ? submittingText : submitButtonText}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
