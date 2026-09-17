import React, { useState, useEffect } from 'react';
import {
  Search,
  Check,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA, formatDate } from '../lib/format';
import { Order, OrderStatus } from '../types';
import { scrollToTop } from '../lib/scroll';

export const TrackOrderView: React.FC = () => {
  const {
    getOrderByTrackingCode,
    trackingInput,
    setTrackingInput,
    settings,
    setActiveTab,
    t,
  } = useStore();

  const [searchedCode, setSearchedCode] = useState(trackingInput || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || searchedCode).trim().toUpperCase();
    if (!code) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const order = await getOrderByTrackingCode(code);
      setCurrentOrder(order);
    } catch {
      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToTop(true);
  }, []);

  useEffect(() => {
    if (trackingInput) {
      setSearchedCode(trackingInput);
      handleSearch(trackingInput);
    }
  }, [trackingInput]);

  // Stage mapping helper
  const getStageState = (orderStatus: OrderStatus) => {
    const map: Record<OrderStatus, number> = {
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
    return map[orderStatus] || 1;
  };

  const activeStage = currentOrder ? getStageState(currentOrder.status) : 1;

  const steps = [
    {
      step: 1,
      title: 'Pedido Confirmado',
      subtitle: 'Comprovativo validado e vaga reservada no atelier.',
      icon: Check,
      isAlert: false,
    },
    {
      step: 2,
      title: 'A sua encomenda saiu do local de produção',
      subtitle: 'Peça embalada sob padrão estrito e entregue à logística.',
      icon: Package,
      isAlert: false,
    },
    {
      step: 3,
      title: 'A sua encomenda está prestes a chegar',
      subtitle: 'O estafeta está a caminho do seu endereço em Luanda.',
      alertText: 'Certifique-se de se manter contactável.',
      icon: MapPin,
      isAlert: true,
    },
    {
      step: 4,
      title: 'Entregue',
      subtitle: 'Encomenda entregue em mãos com sucesso.',
      icon: CheckCircle2,
      isAlert: false,
    },
  ];

  return (
    <div id="track-top" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Title Header */}
      <div className="text-center space-y-3 mb-10">
        <span className="text-[10px] text-[#888888] font-sans tracking-[0.3em] uppercase">
          RASTREIO DINÂMICO EM TEMPO REAL • SUPABASE ENGINE
        </span>
        <h1 className="font-display uppercase text-2xl sm:text-4xl text-white tracking-[0.18em]">
          RASTREAR ENCOMENDA
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] font-sans max-w-xl mx-auto">
          Introduza o seu código de rastreio individual gerado no checkout (ex: <strong className="text-white">WU-XXXX</strong>) para acompanhar o progresso em tempo real.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 sm:p-6 mb-10 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#777777] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ex: WU-8492"
              value={searchedCode}
              onChange={(e) => setSearchedCode(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3.5 bg-[#0a0a0a] border border-[#2b2b2b] rounded text-white font-mono text-sm tracking-widest placeholder-[#555555] uppercase focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchedCode.trim()}
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs tracking-[0.25em] uppercase rounded transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isLoading ? <span>A CONSULTAR...</span> : <span>RASTREAR AGORA</span>}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {hasSearched && !isLoading && (
        <>
          {currentOrder ? (
            <div className="bg-[#0e0e0e] border border-[#222222] rounded-lg p-6 sm:p-10 shadow-2xl space-y-10 animate-in fade-in duration-300">
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1f1f1f] gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#888888] tracking-widest uppercase">
                      CÓDIGO ÚNICO:
                    </span>
                    <span className="font-mono text-lg font-bold text-white tracking-widest bg-[#181818] px-3 py-1 rounded border border-[#2c2c2c]">
                      {currentOrder.tracking_code}
                    </span>
                  </div>
                  <p className="text-xs text-[#777777] mt-1.5 font-sans">
                    Encomenda efetuada em: <span className="text-[#cccccc]">{formatDate(currentOrder.created_at)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#888888] font-sans uppercase">ESTADO ATUAL:</span>
                  <span className="px-3 py-1 bg-white text-black text-xs font-bold font-sans tracking-widest rounded uppercase">
                    {currentOrder.status}
                  </span>
                </div>
              </div>

              {/* INSTRUÇÕES OU NOTAS DA EQUIPA / ATELIER (SUBMETIDAS NO PAINEL ADMIN) */}
              {((currentOrder.admin_notes && currentOrder.admin_notes.trim() !== '') ||
                (currentOrder.status_timeline?.find((e) => e.active && e.admin_note)?.admin_note)) && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141414] to-[#1a1a1a] border border-[#333333] rounded-lg shadow-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-white">
                      INSTRUÇÕES & ATUALIZAÇÕES DA EQUIPA (WEARING UNUSUAL)
                    </span>
                    <span className="ml-auto text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                      AO VIVO
                    </span>
                  </div>
                  <div className="pl-6 border-l-2 border-emerald-500/60 my-1">
                    <p className="text-xs sm:text-sm text-[#e6e6e6] font-sans leading-relaxed whitespace-pre-line font-medium">
                      {currentOrder.admin_notes ||
                        currentOrder.status_timeline?.find((e) => e.active && e.admin_note)?.admin_note}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#777777] font-sans pt-1">
                    <span>Instruções oficiais submetidas pelo atelier & equipa de logística.</span>
                    {currentOrder.updated_at && (
                      <span>Atualizado em: {formatDate(currentOrder.updated_at)}</span>
                    )}
                  </div>
                </div>
              )}

              {/* VISUAL TIMELINE (LINHA DO TEMPO) */}
              <div className="space-y-6">
                <h3 className="text-xs font-sans tracking-[0.25em] text-[#aaaaaa] uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white" />
                  <span>LINHA DO TEMPO DA ENCOMENDA</span>
                </h3>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-[17px] sm:before:left-[21px] before:top-3 before:bottom-3 before:w-[2px] before:bg-[#222222]">
                  {steps.map((st) => {
                    const IconComponent = st.icon;
                    const isCompleted = activeStage >= st.step;
                    const isCurrent = activeStage === st.step;
                    const timelineEv = currentOrder.status_timeline?.find((e) => e.step === st.step);
                    const customStepDesc = timelineEv?.description && timelineEv.description.trim() !== '' ? timelineEv.description : st.subtitle;
                    const stepAdminNote = timelineEv?.admin_note;

                    return (
                      <div key={st.step} className="relative flex items-start gap-4 sm:gap-6 group">
                        {/* Step Circle Indicator */}
                        <div
                          className={`absolute -left-[30px] sm:-left-[36px] top-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-white text-black ring-4 ring-white/20'
                              : isCompleted
                              ? 'bg-[#222222] text-white border border-[#444444]'
                              : 'bg-[#121212] text-[#555555] border border-[#222222]'
                          }`}
                        >
                          <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </div>

                        {/* Step Description */}
                        <div className="flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={`text-sm sm:text-base font-display uppercase tracking-wider ${
                                isCompleted ? 'text-white font-semibold' : 'text-[#666666]'
                              }`}
                            >
                              Etapa {st.step}: {timelineEv?.title || st.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-sans tracking-widest uppercase font-semibold">
                                EM CURSO
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#a0a0a0] font-sans mt-1 leading-relaxed">
                            {customStepDesc}
                          </p>

                          {stepAdminNote && stepAdminNote !== customStepDesc && (
                            <div className="mt-2 p-2.5 bg-[#171717] border border-[#2b2b2b] rounded text-xs text-[#e0e0e0] font-sans flex items-start gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] text-[#888888] uppercase block font-semibold">Nota desta etapa:</span>
                                <span>{stepAdminNote}</span>
                              </div>
                            </div>
                          )}

                          {/* Highlight Alert Box for Step 3 */}
                          {st.isAlert && (isCurrent || isCompleted) && (
                            <div className="mt-3 p-3.5 bg-[#1a1712] border border-amber-800/60 rounded-md flex items-start gap-2.5 max-w-lg">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="text-xs font-sans">
                                <strong className="text-amber-300 uppercase tracking-wider block">
                                  {st.alertText}
                                </strong>
                                <span className="text-[#a5998a] text-[11px] mt-0.5 block">
                                  O nosso serviço de estafeta efetuará o contacto telefónico antes da entrega no seu endereço.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary & Customer Info */}
              <div className="pt-8 border-t border-[#1f1f1f] grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Items */}
                <div className="space-y-4">
                  <h4 className="text-xs font-sans tracking-[0.2em] text-[#aaaaaa] uppercase">
                    PEÇAS ENCOMENDADAS ({currentOrder.items.length})
                  </h4>
                  <div className="space-y-3">
                    {currentOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 bg-[#121212] border border-[#1c1c1c] rounded"
                      >
                        {item.image_url && item.image_url.trim() !== '' ? (
                          <div className="w-12 h-14 bg-[#1f1f1f] rounded overflow-hidden shrink-0">
                            <img src={item.image_url.trim()} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-14 bg-[#1f1f1f] rounded flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-[#555555]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-display uppercase text-xs text-white truncate">
                            {item.name}
                          </h5>
                          <p className="text-[11px] text-[#777777] font-sans mt-0.5">
                            Tam: <strong className="text-[#cccccc]">{item.size}</strong> • Cor: <strong className="text-[#cccccc]">{item.color}</strong> • Qtd: {item.quantity}
                          </p>
                        </div>
                        <span className="font-sans text-xs text-white font-medium">
                          {formatAOA(item.price_aoa * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-xs font-sans">
                    <span className="text-[#888888] uppercase">Total da Encomenda</span>
                    <span className="font-bold text-white text-sm">{formatAOA(currentOrder.total_aoa)}</span>
                  </div>
                </div>

                {/* Delivery & Proof */}
                <div className="space-y-4 font-sans text-xs">
                  <h4 className="tracking-[0.2em] text-[#aaaaaa] uppercase">
                    DETALHES DE ENTREGA & COMPROVATIVO
                  </h4>

                  <div className="bg-[#121212] border border-[#1c1c1c] rounded p-4 space-y-3">
                    <div>
                      <span className="text-[10px] text-[#666666] uppercase block">DESTINATÁRIO</span>
                      <span className="text-white font-medium">{currentOrder.customer_name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#666666] uppercase block">TELEFONE / WHATSAPP</span>
                      <span className="text-white font-medium">{currentOrder.customer_phone}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#666666] uppercase block">ENDEREÇO EM LUANDA</span>
                      <span className="text-white font-medium">{currentOrder.customer_city}</span>
                    </div>

                    {currentOrder.customer_notes && (
                      <div>
                        <span className="text-[10px] text-[#666666] uppercase block">OBSERVAÇÕES</span>
                        <span className="text-[#a0a0a0] italic">{currentOrder.customer_notes}</span>
                      </div>
                    )}

                    {currentOrder.payment_proof_url && (
                      <div className="pt-2 border-t border-[#1a1a1a]">
                        <span className="text-[10px] text-[#666666] uppercase block mb-1">
                          COMPROVATIVO ANEXADO
                        </span>
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Validado no sistema</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://wa.me/${(settings.whatsapp_number || '+244 937765130').replace(/\D/g, '') || '244937765130'}?text=${encodeURIComponent(
                      `Olá Wearing Unusual, gostaria de informações sobre a minha encomenda com código de rastreio ${currentOrder.tracking_code}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-[#181818] hover:bg-[#222222] text-white border border-[#2a2a2a] rounded text-center text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Falar com o Suporte no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-10 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
              <h3 className="font-display uppercase text-base text-white tracking-wider">
                NENHUMA ENCOMENDA ENCONTRADA
              </h3>
              <p className="text-xs text-[#777777] font-sans max-w-md mx-auto">
                Não encontramos nenhum registo com o código "<strong className="text-white">{searchedCode}</strong>". Verifique se digitou o código exatamente como gerado (ex: WU-8492).
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
