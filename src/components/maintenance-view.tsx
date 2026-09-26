import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { WULogo } from './wu-logo';
import { Wrench, MessageSquare, Instagram, Search, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface MaintenanceViewProps {
  onOpenTrack?: () => void;
  onOpenAdmin?: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ onOpenTrack, onOpenAdmin }) => {
  const { settings, saveSettings, setActiveTab } = useStore();
  const { isAuthenticated } = useAuth();
  const [disabledSuccess, setDisabledSuccess] = React.useState(false);

  const handleDisableMaintenance = async () => {
    try {
      await saveSettings({ ...settings, maintenance_mode: false });
      setDisabledSuccess(true);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      // silent
    }
  };

  const handleTrackClick = () => {
    if (onOpenTrack) {
      onOpenTrack();
    } else {
      setActiveTab('track');
    }
  };

  const handleAdminClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#admin';
    }
  };

  const whatsappClean = (settings.whatsapp_number || '+244937765130').replace(/[^0-9]/g, '');
  const instaHandle = (settings.instagram_handle || '@wearingunusual').replace('@', '');

  return (
    <div className="min-h-screen bg-black text-[#f2f2f2] flex flex-col justify-between selection:bg-white selection:text-black relative overflow-hidden font-sans">
      {/* Background ambient aesthetic grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Banner if authenticated as Admin */}
      {isAuthenticated && (
        <div className="relative z-30 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono uppercase tracking-wider font-bold">
              MODO MANUTENÇÃO ATIVO — AVISO EXIBIDO AO PÚBLICO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDisableMaintenance}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-[10px] tracking-wider rounded transition-colors"
            >
              Desativar Agora
            </button>
            <button
              onClick={handleAdminClick}
              className="px-3 py-1 bg-[#1a1a1a] hover:bg-white hover:text-black text-white border border-[#333333] font-bold uppercase text-[10px] tracking-wider rounded transition-colors"
            >
              Painel Admin
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 py-6 border-b border-[#161616] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WULogo size="sm" imgClassName="h-6 sm:h-7 w-auto object-contain" />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#777777] hidden sm:inline-block">
            {settings.store_name || 'WEARING UNUSUAL'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTrackClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#262626] text-xs text-[#cccccc] hover:text-white transition-colors cursor-pointer"
            title="Consultar estado de uma encomenda existente"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider">Rastrear Pedido</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 max-w-2xl mx-auto text-center">
        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <Wrench className="w-3.5 h-3.5" />
          <span>MODO DE MANUTENÇÃO • ATUALIZAÇÃO EDITORIAL</span>
        </div>

        {/* Brand Logo Large Centerpiece */}
        <div className="mb-6 flex justify-center">
          <WULogo size="lg" imgClassName="h-16 sm:h-20 w-auto object-contain brightness-105 drop-shadow-2xl" />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-[0.2em] text-white font-bold mb-4">
          PLATAFORMA EM ATUALIZAÇÃO
        </h1>

        {/* Custom Message from Settings */}
        <div className="p-4 sm:p-6 bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl mb-8 max-w-lg shadow-2xl">
          <p className="text-xs sm:text-sm text-[#cccccc] font-sans leading-relaxed tracking-wide">
            {settings.maintenance_message ||
              'ESTAMOS A ATUALIZAR O NOSSO ESPAÇO PARA O PRÓXIMO LANÇAMENTO. RETORNAREMOS EM BREVE COM NOVAS PEÇAS E ATUALIZAÇÕES DO ATELIER.'}
          </p>
        </div>

        {/* Action Channels */}
        <div className="w-full max-w-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Direct */}
            <a
              href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent('Olá Wearing Unusual, gostaria de informações sobre encomendas ou próximas coleções.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-300 text-xs font-sans font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Suporte WhatsApp</span>
            </a>

            {/* Instagram */}
            <a
              href={`https://instagram.com/${instaHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#2a2a2a] text-white text-xs font-sans font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all group"
            >
              <Instagram className="w-4 h-4 text-[#ff5a87] group-hover:scale-110 transition-transform" />
              <span>{settings.instagram_handle || '@wearingunusual'}</span>
            </a>
          </div>

          {/* Track order card */}
          <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-left flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase text-white block">
                Já fez uma encomenda anteriormente?
              </span>
              <span className="text-[10px] text-[#777777] block mt-0.5">
                O nosso sistema de rastreio em tempo real continua 100% ativo.
              </span>
            </div>
            <button
              onClick={handleTrackClick}
              className="px-3 py-2 bg-white hover:bg-[#e0e0e0] text-black font-bold uppercase text-[10px] tracking-wider rounded transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Rastrear</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-6 border-t border-[#141414] text-center text-xs text-[#555555] font-mono space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-[#777777]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#888888]" />
            LUANDA, ANGOLA
          </span>
          <span>•</span>
          <button
            onClick={handleAdminClick}
            className="text-[#666666] hover:text-white transition-colors underline cursor-pointer"
          >
            Acesso de Gestão / Admin
          </button>
        </div>
        <p className="text-[10px] text-[#444444]">
          {settings.copyright_text || '© WEARING UNUSUAL. TODOS OS DIREITOS RESERVADOS.'}
        </p>
      </footer>
    </div>
  );
};
