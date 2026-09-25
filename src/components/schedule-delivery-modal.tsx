import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { WULogo } from './wu-logo';
import { formatDate } from '../lib/format';

interface ScheduleDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onScheduledSuccess?: () => void;
}

export const ScheduleDeliveryModal: React.FC<ScheduleDeliveryModalProps> = ({
  isOpen,
  onClose,
  order,
  onScheduledSuccess,
}) => {
  const { t, scheduleDeliveryDate, settings } = useStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    order.scheduled_delivery_date || ''
  );
  const [selectedWindow, setSelectedWindow] = useState<string>(
    order.delivery_window || '10:00 - 14:00'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate available delivery dates (UNUSUAL controlled dates starting tomorrow, skipping past)
  // Ex: next 7 business delivery slots
  const availableSlots: { dateString: string; label: string; weekday: string }[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 1); // Earliest is tomorrow

  for (let i = 0; i < 14 && availableSlots.length < 8; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    // UNUSUAL delivers Mon-Sat (skip Sunday)
    if (dayOfWeek !== 0) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;
      const weekdayName = d.toLocaleDateString('pt-PT', { weekday: 'long' });
      const formattedLabel = d.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
      });
      availableSlots.push({
        dateString: isoDate,
        label: formattedLabel,
        weekday: weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1),
      });
    }
  }

  const timeWindows = [
    { id: '10:00 - 14:00', label: 'Manhã / Almoço (10h - 14h)' },
    { id: '14:00 - 18:00', label: 'Tarde (14h - 18h)' },
    { id: '18:00 - 20:00', label: 'Fim de Tarde (18h - 20h)' },
  ];

  const handleConfirm = async () => {
    if (!selectedDate) {
      setError(
        t('choose_delivery_date_error', 'Por favor escolha uma data para a entrega.')
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await scheduleDeliveryDate(order.id, selectedDate, selectedWindow);
      setIsSuccess(true);
      if (onScheduledSuccess) {
        onScheduledSuccess();
      }
    } catch {
      setError('Erro ao agendar a entrega. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  const formattedChosenDate = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-2xl p-6 sm:p-8 text-white space-y-6 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#181818] hover:bg-white hover:text-black text-[#888888] transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#1c1c1c] pb-4">
          <WULogo className="h-4 w-auto fill-white shrink-0" />
          <span className="text-[10px] text-[#888888] font-mono uppercase tracking-[0.25em]">
            WEARING UNUSUAL • PRE-ORDER DISPATCH
          </span>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display uppercase text-lg sm:text-2xl text-white tracking-wider">
                {t('delivery_scheduled_title', 'DELIVERY SCHEDULED ✓')}
              </h3>
              <p className="text-xs sm:text-sm text-[#aaaaaa] leading-relaxed max-w-sm mx-auto">
                {t('delivery_scheduled_message', 'Your order will be delivered on')}{' '}
                <strong className="text-white">{formattedChosenDate}</strong> (
                {selectedWindow}).
              </p>
              <p className="text-[11px] text-[#777777] font-mono pt-2">
                “
                {t(
                  'delivery_scheduled_submessage',
                  'Please keep your phone nearby on the delivery day.'
                )}
                ”
              </p>
            </div>

            <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-3 text-xs text-left text-[#999999] space-y-1">
              <div>
                Código de Rastreio:{' '}
                <strong className="text-white font-mono">{order.tracking_code}</strong>
              </div>
              <div>
                Destinatário:{' '}
                <strong className="text-white">{order.customer_name}</strong> ({order.customer_phone})
              </div>
              <div>
                Morada:{' '}
                <strong className="text-white">{order.customer_address || order.customer_city}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-8 py-3 bg-white text-black font-sans font-bold text-xs uppercase rounded tracking-widest hover:bg-[#eaeaea] transition-all"
            >
              CONCLUIR
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono tracking-widest uppercase">
                <Truck className="w-3 h-3" />
                <span>PRODUCTION COMPLETED / READY FOR DELIVERY</span>
              </div>

              <h2 className="font-display font-bold uppercase text-xl sm:text-2xl text-white tracking-wider leading-tight">
                {t('preorder_ready_title', 'YOUR PRE-ORDER IS READY 🖤')}
              </h2>

              <p className="text-xs sm:text-sm text-[#aaaaaa] leading-relaxed">
                {t(
                  'preorder_ready_desc',
                  'Delivery starts on October 18th. Please choose your preferred delivery date.'
                )}
              </p>
            </div>

            {/* Order Reference Pill */}
            <div className="p-3 bg-[#121212] border border-[#222222] rounded text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#777777]">ENCOMENDA:</span>
                <span className="font-mono text-white font-bold">{order.tracking_code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777777]">CLIENTE:</span>
                <span className="text-white">{order.customer_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777777]">PEÇAS:</span>
                <span className="text-white truncate max-w-[200px]">
                  {order.items.map((i) => `${i.name} (${i.size})`).join(', ')}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded text-red-300 text-xs">
                {error}
              </div>
            )}

            {/* Date Selector (UNUSUAL Allowed Delivery Slots) */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#888888] font-semibold flex items-center justify-between">
                <span>{t('choose_delivery_date_label', 'Please choose your preferred delivery date')}:</span>
                <CalendarIcon className="w-3.5 h-3.5 text-[#666666]" />
              </label>

              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 max-h-56 overflow-y-auto pr-1">
                {availableSlots.map((slot) => {
                  const isSelected = selectedDate === slot.dateString;
                  return (
                    <button
                      key={slot.dateString}
                      type="button"
                      onClick={() => setSelectedDate(slot.dateString)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-[#141414] text-[#cccccc] border-[#242424] hover:border-white'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono uppercase block ${
                          isSelected ? 'text-[#444444]' : 'text-[#777777]'
                        }`}
                      >
                        {slot.weekday}
                      </span>
                      <span className="text-xs sm:text-sm font-bold block mt-0.5">
                        {slot.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Window Selector */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#888888] font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#666666]" />
                <span>JANELA HORÁRIA PREFERENCIAL:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {timeWindows.map((tw) => (
                  <button
                    key={tw.id}
                    type="button"
                    onClick={() => setSelectedWindow(tw.id)}
                    className={`py-2 px-2.5 text-xs rounded border transition-all text-center ${
                      selectedWindow === tw.id
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-[#141414] text-[#888888] border-[#242424] hover:text-white'
                    }`}
                  >
                    {tw.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Advice notice */}
            <div className="p-3 bg-white/5 border border-white/10 rounded text-[11px] text-[#999999] leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                {t(
                  'delivery_warning_notice',
                  'O estafeta da UNUSUAL entrará em contacto consigo via WhatsApp no próprio dia da entrega para coordenar a entrega em mãos.'
                )}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting || !selectedDate}
              onClick={handleConfirm}
              className="w-full py-4 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs sm:text-sm tracking-[0.25em] uppercase rounded transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>{isSubmitting ? 'A AGENDAR...' : t('btn_confirm_delivery_date', 'CONFIRM DELIVERY DATE')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
