import React from 'react';
import { useStore } from '../context/StoreContext';
import { WULogo } from './wu-logo';
import { Instagram, ShieldCheck, MapPin } from 'lucide-react';
import { scrollToTop } from '../lib/scroll';

export const SiteFooter: React.FC = () => {
  const { setActiveTab, t, settings } = useStore();

  return (
    <footer className="border-t border-[#1a1a1a] bg-[#070707] text-[#888888] font-sans text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#181818]">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div
              onClick={() => {
                scrollToTop(true);
                setActiveTab('store');
              }}
              className="cursor-pointer inline-flex items-center gap-3 select-none hover:opacity-85 transition-opacity"
              title={settings.store_name || 'Wearing Unusual'}
            >
              <WULogo size="sm" imgClassName="h-7 sm:h-8 max-h-8 w-auto object-contain" />
            </div>
            <p className="text-xs text-[#777777] max-w-sm leading-relaxed">
              {settings.brand_bio || 'Wearing Unusual — Silhuetas brutalistas e rigor arquitetural desenhados e produzidos em Luanda, Angola. Edições limitadas sob demanda.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#666666]">
              <MapPin className="w-3.5 h-3.5 text-[#888888]" />
              <span>{settings.location_text || 'Luanda, Angola • Entregas em Toda a Cidade'}</span>
            </div>
            {settings.instagram_handle && (
              <div className="pt-1 text-[11px] text-[#777777]">
                <span>Instagram: </span>
                <span className="text-[#aaaaaa] font-mono">{settings.instagram_handle}</span>
              </div>
            )}
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <span className="text-[10px] text-white font-bold uppercase tracking-[0.25em] block">
              NAVEGAÇÃO
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    scrollToTop(true);
                    setActiveTab('store');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t('nav_drop', 'DROP ATUAL')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    scrollToTop(true);
                    setActiveTab('capsule');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t('nav_capsule', 'CÁPSULA DO TEMPO')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    scrollToTop(true);
                    setActiveTab('track');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t('nav_track', 'RASTREAR ENCOMENDA')}
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <span className="text-[10px] text-white font-bold uppercase tracking-[0.25em] block">
              PAGAMENTO SEGURO
            </span>
            <p className="text-xs text-[#777777] leading-relaxed">
              Transferências seguras via Multicaixa Express e IBAN com verificação rigorosa de comprovativo.
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-[#555555] uppercase block">IBAN:</span>
              <span className="font-mono text-xs text-[#aaaaaa] font-bold block">{settings.iban}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#555555]">
          <p>© {new Date().getFullYear()} {settings.store_name || 'WEARING UNUSUAL'}. {settings.copyright_text || t('footer_rights', 'TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA.')}</p>
          <div className="flex items-center gap-4">
            <span className="text-[#444444]">LUANDA • ANGOLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
