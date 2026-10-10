import React from 'react';
import { useStore } from '../context/StoreContext';
import { WULogo } from './wu-logo';
import {
  Instagram,
  MapPin,
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
const tiktokUrl = 'https://www.tiktok.com/@wearingunusual';

const whatsappUrl =
  'https://wa.me/244937765130';
  const tiktokUrl = getSocialUrl(
    (settings as typeof settings & {
      tiktok_handle?: string | null;
    }).tiktok_handle,
    'tiktok'
  );
  
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

              <a
                href="https://www.tiktok.com/@wearingunusual"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok da Wearing Unusual"
                title="TikTok"
                className="text-[#777777] hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M19.321 5.562a5.124 5.124 0 0 1-3.02-3.167A5.16 5.16 0 0 1 16.02 1h-3.92v14.47a3.05 3.05 0 1 1-2.19-2.92V8.56a7.02 7.02 0 1 0 6.11 6.95V8.13a8.98 8.98 0 0 0 5.25 1.69V5.9a5.1 5.1 0 0 1-1.95-.338Z" />
                </svg>
              </a>

              <a
                href="https://wa.me/244937765130"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da Wearing Unusual"
                title="WhatsApp"
                className="text-[#777777] hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.48A11.78 11.78 0 0 0 12.12 0C5.6 0 .3 5.3.3 11.82c0 2.08.54 4.11 1.57 5.91L.2 24l6.42-1.68a11.8 11.8 0 0 0 5.5 1.4h.01c6.52 0 11.82-5.3 11.82-11.82a11.75 11.75 0 0 0-3.43-8.42ZM12.13 21.7h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.81 1 1.02-3.72-.23-.38a9.82 9.82 0 1 1 8.4 4.68Zm5.39-7.36c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
                </svg>
              </a>
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
