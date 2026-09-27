import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Phone,
  AlertCircle,
  Package,
  Sparkles,
  ChevronLeft,
  CalendarCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { WULogo } from './wu-logo';
import { formatAOA, formatDate } from '../lib/format';
import { scrollToTop } from '../lib/scroll';

interface ChooseDeliveryDateViewProps {
  orderCode: string;
  onBackToStore?: () => void;
  onOpenTrack?: (code: string) => void;
}

export const ChooseDeliveryDateView: React.FC<ChooseDeliveryDateViewProps> = ({
  orderCode,
  onBackToStore,
  onOpenTrack,
}) => {
  const {
    getOrderByTrackingCode,
    scheduleDeliveryDate,
    settings,
    t,
    language,
    setLanguage,
    setActiveTab,
    setTrackingInput,
  } = useStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedWindow, setSelectedWindow] = useState<string>('10:00 - 14:00');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scrollToTop(true);
    let isMounted = true;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const found = await getOrderByTrackingCode(orderCode.trim().toUpperCase());
        if (isMounted) {
          setOrder(found);
          if (found?.scheduled_delivery_date) {
            setSelectedDate(found.scheduled_delivery_date);
          }
          if (found?.delivery_window) {
            setSelectedWindow(found.delivery_window);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar encomenda:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderCode, getOrderByTrackingCode]);

  // Compute available delivery dates:
  // Admin configured dates take absolute priority!
  const configuredDates = settings.pre_order_available_delivery_dates || [];

  interface AvailableSlot {
    dateString: string;
    dayNum: string;
    monthName: string;
    weekdayName: string;
    isRecommended?: boolean;
  }

  const availableSlots: AvailableSlot[] = [];

  if (configuredDates.length > 0) {
    configuredDates.forEach((dateStr, idx) => {
      try {
        const d = new Date(dateStr + 'T12:00:00');
        if (!isNaN(d.getTime())) {
          const dayNum = String(d.getDate()).padStart(2, '0');
          const monthName = d.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', { month: 'short' }).toUpperCase();
          const weekdayName = d.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', { weekday: 'short' }).toUpperCase();
          availableSlots.push({
            dateString: dateStr,
            dayNum,
            monthName,
            weekdayName,
            isRecommended: idx === 0,
          });
        }
      } catch {}
    });
  }

  // Fallback: Generate upcoming slots starting tomorrow or configured start date
  if (availableSlots.length === 0) {
    const baseDate = settings.pre_order_deliveries_start_date
      ? new Date(settings.pre_order_deliveries_start_date + 'T12:00:00')
      : new Date();
    
    // If base date is in the past, start tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = !isNaN(baseDate.getTime()) && baseDate > tomorrow ? baseDate : tomorrow;

    for (let i = 0; i < 14 && availableSlots.length < 8; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      // Skip Sundays (UNUSUAL deliveries Mon-Sat)
      if (d.getDay() !== 0) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;
        const dayNum = String(d.getDate()).padStart(2, '0');
        const monthName = d.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', { month: 'short' }).toUpperCase();
        const weekdayName = d.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', { weekday: 'short' }).toUpperCase();
        availableSlots.push({
          dateString: iso,
          dayNum,
          monthName,
          weekdayName,
          isRecommended: availableSlots.length === 0,
        });
      }
    }
  }

  const timeWindows = [
    { id: '10:00 - 14:00', labelPt: 'Manhã / Almoço (10h - 14h)', labelEn: 'Morning / Lunch (10am - 2pm)' },
    { id: '14:00 - 18:00', labelPt: 'Tarde (14h - 18h)', labelEn: 'Afternoon (2pm - 6pm)' },
    { id: '18:00 - 20:00', labelPt: 'Fim de Tarde (18h - 20h)', labelEn: 'Early Evening (6pm - 8pm)' },
  ];

  const handleConfirmDate = async () => {
    if (!order) return;
    if (!selectedDate) {
      setError(
        language === 'en'
          ? 'Please select a delivery date from the available options.'
          : 'Por favor seleciona uma das datas disponíveis para a entrega.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await scheduleDeliveryDate(order.id, selectedDate, selectedWindow);
      // Refresh local order state
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'DELIVERY SCHEDULED',
              scheduled_delivery_date: selectedDate,
              delivery_window: selectedWindow,
            }
          : null
      );
      setIsSuccess(true);
      scrollToTop(true);
    } catch {
      setError(
        language === 'en'
          ? 'Failed to confirm delivery date. Please try again.'
          : 'Erro ao confirmar a data de entrega. Por favor tenta novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackDirect = () => {
    if (onOpenTrack && order) {
      onOpenTrack(order.tracking_code);
    } else {
      if (order) setTrackingInput(order.tracking_code);
      setActiveTab('track');
    }
    scrollToTop(true);
  };

  const titleText =
    language === 'en'
      ? settings.pre_order_choose_date_title_en || 'CHOOSE DELIVERY DATE'
      : settings.pre_order_choose_date_title_pt || 'ESCOLHER DATA DE ENTREGA';

  const descText =
    language === 'en'
      ? settings.pre_order_choose_date_desc_en ||
        'Your pre-order piece has been completed by the atelier and is ready for dispatch. Please select your preferred delivery date.'
      : settings.pre_order_choose_date_desc_pt ||
        'A tua encomenda de pre-order está concluída pelo atelier e pronta para envio. Por favor, seleciona a tua data preferida de entrega.';

  const btnText =
    language === 'en'
      ? settings.pre_order_choose_date_btn_en || 'CONFIRM DELIVERY DATE'
      : settings.pre_order_choose_date_btn_pt || 'CONFIRMAR DATA DE ENTREGA';

  const successMsg =
    language === 'en'
      ? settings.pre_order_delivery_scheduled_msg_en ||
        'Your delivery has been scheduled successfully. We will contact you on delivery day.'
      : settings.pre_order_delivery_scheduled_msg_pt ||
        'A tua entrega foi agendada com sucesso. Entraremos em contacto no dia da entrega.';

  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString(
        language === 'en' ? 'en-US' : 'pt-PT',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    : '';

  return (
    <div className="min-h-screen bg-black text-[#f2f2f2] flex flex-col justify-between selection:bg-white selection:text-black font-sans relative">
      {/* Background ambient aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header Bar */}
      <header className="relative z-20 px-4 sm:px-6 py-4 sm:py-5 border-b border-[#181818] flex items-center justify-between bg-black/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStore || (() => setActiveTab('store'))}
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#262626] text-[#888888] hover:text-white transition-colors cursor-pointer"
            title="Voltar à loja"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            onClick={onBackToStore || (() => setActiveTab('store'))}
            className="cursor-pointer flex items-center gap-2 select-none"
          >
            <WULogo size="sm" imgClassName="h-6 sm:h-7 w-auto object-contain" />
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#777777] hidden sm:inline-block">
              {settings.store_name || 'WEARING UNUSUAL'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="px-2.5 py-1 rounded bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] text-[11px] font-mono font-bold text-[#aaaaaa] hover:text-white uppercase transition-colors"
            title="Mudar Idioma / Switch Language"
          >
            {language === 'pt' ? 'EN' : 'PT'}
          </button>

          {order && (
            <button
              type="button"
              onClick={handleTrackDirect}
              className="px-3 py-1.5 rounded bg-[#161616] hover:bg-white hover:text-black border border-[#2c2c2c] text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer text-[#cccccc]"
            >
              <span>{language === 'en' ? 'Track' : 'Rastrear'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#888888]">
              {language === 'en' ? 'Loading order details...' : 'A carregar detalhes da encomenda...'}
            </p>
          </div>
        ) : !order ? (
          <div className="py-16 text-center space-y-5 bg-[#0d0d0d] border border-[#202020] rounded-xl p-6 sm:p-8 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display uppercase text-lg sm:text-xl text-white tracking-wider">
                {language === 'en' ? 'ORDER NOT FOUND' : 'ENCOMENDA NÃO ENCONTRADA'}
              </h2>
              <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
                {language === 'en'
                  ? `We could not locate order "${orderCode.toUpperCase()}". Please verify the link or track manually.`
                  : `Não conseguimos localizar a encomenda "${orderCode.toUpperCase()}". Por favor verifica o link recebido ou pesquisa manualmente.`}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className="px-5 py-2.5 bg-white text-black hover:bg-[#eaeaea] font-bold text-xs uppercase tracking-wider rounded transition-colors"
              >
                {language === 'en' ? 'Open Order Tracking' : 'Pesquisar Encomenda'}
              </button>
              <button
                type="button"
                onClick={onBackToStore || (() => setActiveTab('store'))}
                className="px-5 py-2.5 bg-[#161616] hover:bg-[#222222] text-[#aaaaaa] hover:text-white border border-[#2e2e2e] text-xs uppercase tracking-wider rounded transition-colors"
              >
                {language === 'en' ? 'Return to Store' : 'Voltar à Loja'}
              </button>
            </div>
          </div>
        ) : isSuccess || order.status === 'DELIVERY SCHEDULED' ? (
          /* SUCCESS STATE / ALREADY SCHEDULED */
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 bg-[#0a0a0a] border border-emerald-500/30 rounded-xl text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold block">
                  {language === 'en' ? 'DISPATCH CONFIRMED' : 'DESPACHO CONFIRMADO'}
                </span>
                <h2 className="font-display uppercase text-xl sm:text-2xl text-white tracking-wider font-bold">
                  DELIVERY SCHEDULED ✓
                </h2>
                <p className="text-xs sm:text-sm text-[#aaaaaa] max-w-md mx-auto leading-relaxed">
                  {successMsg}
                </p>
              </div>

              {/* Scheduled Date Highlight Box */}
              <div className="p-4 rounded-lg bg-[#111111] border border-[#222222] text-left space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#777777] border-b border-[#1c1c1c] pb-2 text-[11px]">
                  <span className="uppercase">CÓDIGO DE ENCOMENDA</span>
                  <span className="text-white font-bold">{order.tracking_code}</span>
                </div>
                <div className="flex items-center justify-between text-[#777777] border-b border-[#1c1c1c] pb-2 text-[11px]">
                  <span className="uppercase">{language === 'en' ? 'DELIVERY DATE' : 'DATA DE ENTREGA'}</span>
                  <span className="text-emerald-300 font-bold uppercase">
                    {order.scheduled_delivery_date || selectedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#777777] text-[11px]">
                  <span className="uppercase">{language === 'en' ? 'TIME WINDOW' : 'TURNO'}</span>
                  <span className="text-white font-bold">
                    {order.delivery_window || selectedWindow}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-200/90 leading-relaxed text-left flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'en'
                    ? 'Please keep your phone reachable on delivery day. Our courier will call when approaching.'
                    : 'Certifica-te de manter o teu telefone contactável no dia da entrega. O estafeta entrará em contacto quando estiver próximo.'}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleTrackDirect}
                  className="flex-1 py-3 px-4 bg-white text-black hover:bg-[#ececec] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>{language === 'en' ? 'View Live Tracking' : 'Acompanhar no Rastreio'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="py-3 px-4 bg-[#141414] hover:bg-[#202020] text-[#888888] hover:text-white border border-[#262626] font-mono text-xs uppercase tracking-wider rounded transition-colors"
                >
                  {language === 'en' ? 'Change Date' : 'Alterar Data'}
                </button>
              </div>
            </div>
          </div>
        ) : order.status !== 'PRODUCTION COMPLETED / READY FOR DELIVERY' &&
          order.status !== 'READY FOR DELIVERY' ? (
          /* NOT YET READY STATE */
          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-[#0a0a0a] border border-[#202020] rounded-xl text-center space-y-5 shadow-2xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block">
                  {order.status}
                </span>
                <h2 className="font-display uppercase text-lg sm:text-xl text-white tracking-wider">
                  {language === 'en' ? 'PRODUCTION IN PROGRESS' : 'PEÇA EM PRODUÇÃO'}
                </h2>
                <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'Your piece is currently in production at the atelier. Once finished, you will receive a notification and this page will unlock for choosing your delivery date.'
                    : 'A tua peça está atualmente em produção no atelier. Assim que a produção for concluída, receberás uma notificação e esta página será desbloqueada para escolheres a data de entrega.'}
                </p>
              </div>

              {/* Order Info Badge */}
              <div className="p-4 bg-[#121212] border border-[#222222] rounded-lg text-left text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-[#777777]">
                  <span>ENCOMENDA:</span>
                  <span className="text-white font-bold">{order.tracking_code}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>CLIENTE:</span>
                  <span className="text-white">{order.customer_name}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>ESTADO:</span>
                  <span className="text-amber-300 font-bold">{order.status}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTrackDirect}
                className="w-full py-3 px-4 bg-white text-black hover:bg-[#eaeaea] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'en' ? 'Check Full Timeline' : 'Ver Linha do Tempo Completa'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE DATE SELECTION FORM */
          <div className="space-y-6 animate-fade-in">
            {/* Top Brand Notification Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#141414] to-[#141414] border border-amber-500/40 shadow-xl space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>UNUSUAL • PRE-ORDER DISPATCH</span>
              </div>
              <h1 className="font-display uppercase text-lg sm:text-xl text-white font-bold tracking-wider">
                {titleText}
              </h1>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                {descText}
              </p>
            </div>

            {/* Order Summary Snapshot */}
            <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1a1a1a]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                    CÓDIGO DE ENCOMENDA
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider">
                    {order.tracking_code}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-black inline-block">
                    PRE-ORDER
                  </span>
                  <span className="text-[10px] font-mono text-[#888888] block mt-1">
                    {order.customer_name}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#777777] block">
                  {language === 'en' ? 'PIECES READY FOR DISPATCH' : 'PEÇAS PRONTAS PARA DESPACHO'}
                </span>
                <div className="space-y-1.5">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#222222] text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt={it.name}
                            className="w-8 h-8 rounded object-cover border border-[#2a2a2a] shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-[#222222] flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-[#666666]" />
                          </div>
                        )}
                        <span className="text-white font-medium truncate">
                          {it.name} <span className="text-[#888888]">({it.size})</span>
                        </span>
                      </div>
                      <span className="font-mono text-[#888888] shrink-0 pl-2">x{it.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-[#888888]">
                <MapPin className="w-3.5 h-3.5 text-[#aaaaaa] shrink-0" />
                <span className="truncate">{order.customer_city || order.customer_address}</span>
              </div>
            </div>

            {/* STEP 1: Date Picker Grid */}
            <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-4 sm:p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {language === 'en' ? '1. SELECT AVAILABLE DATE' : '1. ESCOLHE UMA DATA DISPONÍVEL'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#777777]">LUANDA</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedDate === slot.dateString;

                  return (
                    <button
                      key={slot.dateString}
                      type="button"
                      onClick={() => {
                        setSelectedDate(slot.dateString);
                        setError(null);
                      }}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-xl scale-[1.02]'
                          : 'bg-[#121212] hover:bg-[#1a1a1a] text-[#aaaaaa] hover:text-white border-[#242424]'
                      }`}
                    >
                      {slot.isRecommended && !isSelected && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider block ${
                          isSelected ? 'text-black/70 font-bold' : 'text-[#777777]'
                        }`}
                      >
                        {slot.weekdayName}
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-mono font-bold leading-none block ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}
                      >
                        {slot.dayNum}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider block ${
                          isSelected ? 'text-black/80 font-semibold' : 'text-[#888888]'
                        }`}
                      >
                        {slot.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="p-2.5 rounded bg-black/50 border border-[#222222] text-xs text-[#cccccc] flex items-center justify-between font-mono text-[11px]">
                  <span>{language === 'en' ? 'Selected day:' : 'Dia selecionado:'}</span>
                  <span className="text-amber-300 font-bold capitalize">
                    {formattedSelectedDate}
                  </span>
                </div>
              )}
            </div>

            {/* STEP 2: Time Window Selector */}
            <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-4 sm:p-5 space-y-3.5 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {language === 'en' ? '2. PREFERRED TIME SLOT' : '2. TURNO DE PREFERÊNCIA'}
                </span>
              </div>

              <div className="space-y-2">
                {timeWindows.map((tw) => {
                  const isSelected = selectedWindow === tw.id;

                  return (
                    <button
                      key={tw.id}
                      type="button"
                      onClick={() => setSelectedWindow(tw.id)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#181818] border-white text-white font-semibold'
                          : 'bg-[#121212] hover:bg-[#161616] border-[#222222] text-[#888888] hover:text-white'
                      }`}
                    >
                      <span className="font-sans">
                        {language === 'en' ? tw.labelEn : tw.labelPt}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-white bg-white text-black' : 'border-[#444444]'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Confirmation Action Button */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleConfirmDate}
                disabled={isSubmitting || !selectedDate}
                className="w-full py-4 px-6 bg-white hover:bg-[#eaeaea] text-black font-display font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>{language === 'en' ? 'SCHEDULING...' : 'A AGENDAR...'}</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>{btnText}</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#666666] font-mono">
                {language === 'en'
                  ? 'Your order will update to DELIVERY SCHEDULED upon confirmation.'
                  : 'A tua encomenda transitará automaticamente para DELIVERY SCHEDULED.'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-6 border-t border-[#141414] text-center text-xs text-[#555555] font-mono space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
          <span className="flex items-center gap-1 text-[#777777]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#888888]" />
            LUANDA, ANGOLA
          </span>
          <span>•</span>
          <span className="text-[#888888] uppercase tracking-wider font-sans font-medium">
            wearing unusual ©
          </span>
        </div>
        <p className="text-[10px] text-[#444444]">
          {settings.copyright_text || 'TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA.'}
        </p>
      </footer>
    </div>
  );
};
