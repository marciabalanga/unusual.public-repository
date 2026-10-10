import React from 'react';
import { useStore } from '../context/StoreContext';
import { WULogo } from './wu-logo';
import {
  Instagram,
  MapPin,
  Music2,
} from 'lucide-react';
import { scrollToTop } from '../lib/scroll';
export const SiteFooter: React.FC = () => {
  const { navigateTo, t, settings, language } = useStore();
  const brandBio =
    language === 'en'
      ? settings.brand_bio_en ||
        'Wearing Unusual — Brutalist silhouettes and architectural precision crafted and produced in Luanda, Angola. Limited on-demand editions.'
      : settings.brand_bio ||
        'Wearing Unusual — Silhuetas brutalistas e rigor arquitetural desenhados e produzidos em Luanda, Angola. Edições limitadas sob demanda.';
  const locationText =
    language === 'en'
      ? settings.location_text_en ||
        'Luanda, Angola • Citywide Delivery'
      : settings.location_text ||
        'Luanda, Angola • Entregas em Toda a Cidade';
  const copyrightText =
    (language === 'en'
      ? settings.copyright_text_en
      : settings.copyright_text) ||
    t('footer_rights', 'TODOS OS DIREITOS RESERVADOS. LUANDA, ANGOLA.');
  // Normaliza o endereço dos perfis sociais.
  const getSocialUrl = (
    value?: string | null,
    platform?: 'instagram' | 'tiktok'
  ) => {
    if (!value?.trim()) return null;
    const handle = value.trim();
    if (/^https?:\/\//i.test(handle)) {
      return handle;
    }
    const username = handle
      .replace(/^@/, '')
      .replace(/^instagram\.com\//i, '')
      .replace(/^tiktok\.com\/@?/i, '')
      .replace(/^www\./i, '');
    if (!username) return null;
    return platform === 'instagram'
      ? `https://www.instagram.com/${username.replace(/\/$/, '')}/`
      : `https://www.tiktok.com/@${username.replace(/\/$/, '')}`;
  };
  const instagramUrl = getSocialUrl(
    settings.instagram_handle,
    'instagram'
  );
  const tiktokUrl = getSocialUrl(
    (settings as typeof settings & {
      tiktok_handle?: string | null;
    }).tiktok_handle,
    'tiktok'
  );
  const navigateTo = (tab: 'store' | 'capsule' | 'track') => {
    setActiveTab(tab);
    scrollToTop(true);
  };
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#070707] text-[#888888] font-sans text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#181818]">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <button
              type="button"
              onClick={() => navigateTo('store')}
              className="inline-flex items-center gap-3 select-none hover:opacity-85 transition-opacity"
              title={settings.store_name || 'Wearing Unusual'}
              aria-label="Voltar à loja"
            >
              <WULogo
                size="sm"
                imgClassName="h-7 sm:h-8 max-h-8 w-auto object-contain"
              />
            </button>
            <p className="text-xs text-[#777777] max-w-sm leading-relaxed">
              {brandBio}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#666666]">
              <MapPin className="w-3.5 h-3.5 text-[#888888]" />
              <span>{locationText}</span>
            </div>
            {/* Redes sociais */}
            <div className="flex items-center gap-4 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da Wearing Unusual"
                  title="Instagram"
                  className="text-[#777777] hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok da Wearing Unusual"
                  title="TikTok"
                  className="text-[#777777] hover:text-white transition-colors"
                >
                  <Music2 className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          {/* Navegação */}
          <div className="space-y-3">
            <span className="text-[10px] text-white font-bold uppercase tracking-[0.25em] block">
              {t('footer_navigation', 'NAVEGAÇÃO')}
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo({ tab: 'store', anchorId: 'drop-atual' })}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav_drop', 'DROP ATUAL')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo({ tab: 'capsule' })}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav_capsule', 'CÁPSULA DO TEMPO')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo({ tab: 'track' })}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav_track', 'RASTREAR ENCOMENDA')}
                </button>
              </li>
            </ul>
          </div>
          {/* Pagamento e segurança */}
          <div className="space-y-3">
            <span className="text-[10px] text-white font-bold uppercase tracking-[0.25em] block">
              {t('footer_secure_payment', 'PAGAMENTO SEGURO')}
            </span>
            <p className="text-xs text-[#777777] leading-relaxed">
              {t(
                'footer_secure_payment_desc',
                'Transferências seguras via Multicaixa Express e IBAN com verificação rigorosa de comprovativo.'
              )}
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-[#555555] uppercase block">
                IBAN:
              </span>
              <span className="font-mono text-xs text-[#aaaaaa] font-bold block">
                {settings.iban}
              </span>
            </div>
          </div>
        </div>
        {/* Barra inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#555555]">
          <p>
            © {new Date().getFullYear()}{' '}
            {settings.store_name || 'WEARING UNUSUAL'}.{' '}
            {copyrightText}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[#444444]">
              LUANDA • ANGOLA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}; 
