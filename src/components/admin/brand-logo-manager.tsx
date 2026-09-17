import React, { useRef, useState } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { WULogo } from '../wu-logo';
import { supabase } from '../../lib/supabase';

interface BrandLogoManagerProps {
  onSuccessToast?: (msg: string) => void;
}

export const BrandLogoManager: React.FC<BrandLogoManagerProps> = ({ onSuccessToast }) => {
  const { settings, saveSettings, supabaseStatus } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputUrl, setInputUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewBg, setPreviewBg] = useState<'black' | 'checker' | 'white'>('checker');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const currentLogo =
    settings.site_logo_url && settings.site_logo_url.trim() !== ''
      ? settings.site_logo_url.trim()
      : '/logo.png';

  const notify = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3500);
    if (onSuccessToast) onSuccessToast(msg);
  };

  /**
   * Reads an uploaded image file (PNG, SVG, WEBP, JPG) preserving full transparency.
   * If Supabase Storage is configured with a 'brand' bucket, uploads to it;
   * otherwise encodes as lossless Data URL so it syncs immediately via site_settings.
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB for logos)
    if (file.size > 5 * 1024 * 1024) {
      alert('O ficheiro é demasiado grande. Por favor escolha um logo com menos de 5MB.');
      return;
    }

    setIsProcessing(true);

    try {
      let resolvedUrl = '';

      // Try uploading to Supabase Storage if connected
      if (supabaseStatus.connected) {
        try {
          const fileExt = file.name.split('.').pop() || 'png';
          const fileName = `site-logo-${Date.now()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('brand')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError && uploadData) {
            const { data: publicData } = supabase.storage.from('brand').getPublicUrl(uploadData.path);
            if (publicData?.publicUrl) {
              resolvedUrl = publicData.publicUrl;
            }
          }
        } catch {
          // Fall back to direct lossless data URL
        }
      }

      // If storage upload didn't produce a URL, read as optimized lossless Data URL
      if (!resolvedUrl) {
        const rawDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Falha ao ler o ficheiro local.'));
          reader.readAsDataURL(file);
        });

        // Optimize raster images (PNG, JPEG, WebP) using Canvas to keep payload compact & crisp
        if (file.type.startsWith('image/') && !file.type.includes('svg')) {
          try {
            const optimized = await new Promise<string>((resolve) => {
              const img = new Image();
              img.onload = () => {
                const maxWidth = 1200;
                const maxHeight = 400;
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                  const ratio = Math.min(maxWidth / width, maxHeight / height);
                  width = Math.round(width * ratio);
                  height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/png'));
                } else {
                  resolve(rawDataUrl);
                }
              };
              img.onerror = () => resolve(rawDataUrl);
              img.src = rawDataUrl;
            });
            resolvedUrl = optimized;
          } catch {
            resolvedUrl = rawDataUrl;
          }
        } else {
          resolvedUrl = rawDataUrl;
        }
      }

      await saveSettings({ site_logo_url: resolvedUrl, logo_url: resolvedUrl });
      notify('Novo logótipo carregado e sincronizado globalmente!');
    } catch (err: unknown) {
      console.error('Erro no upload do logótipo:', err);
      alert('Erro ao carregar logótipo. Tente outro ficheiro ou use o campo de URL.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = async () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    try {
      await saveSettings({ site_logo_url: trimmed, logo_url: trimmed });
      setInputUrl('');
      notify('URL do logótipo atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar o URL do logótipo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDefault = async (url: string, label: string) => {
    setIsProcessing(true);
    try {
      await saveSettings({ site_logo_url: url, logo_url: url });
      notify(`Logótipo restaurado para: ${label}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display uppercase text-base text-white tracking-wider">
                CONFIGURAÇÕES DA MARCA & LOGÓTIPO GLOBAL
              </h2>
              <p className="text-xs text-[#777777] font-sans">
                Gestão centralizada do logótipo oficial. Todas as alterações refletem instantaneamente no Cabeçalho, Rodapé, Splash Screen, Checkout e Admin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronização Ativa
            </span>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Grid: Upload Controls + Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & URL Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Direct File Upload */}
          <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-white" />
                <h3 className="font-display uppercase text-xs sm:text-sm text-white tracking-wider">
                  1. UPLOAD DIRETO DO DISPOSITIVO
                </h3>
              </div>
              <span className="text-[10px] text-[#777777] font-mono uppercase">PNG (Transparente) ou SVG</span>
            </div>

            <p className="text-xs text-[#888888] font-sans leading-relaxed">
              Carregue o logótipo oficial da marca a partir do seu telemóvel ou computador. O formato recomendado é <strong>PNG com fundo transparente</strong> ou <strong>SVG vetorial</strong> para máxima nitidez em ecrãs Retina.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/webp,image/jpeg"
              onChange={handleFileUpload}
              className="hidden"
              id="brand-logo-file-input"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isProcessing
                  ? 'border-neutral-700 bg-neutral-900/40 pointer-events-none'
                  : 'border-[#2c2c2c] hover:border-neutral-500 hover:bg-[#121212]'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center mb-3 text-neutral-300">
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Upload className="w-5 h-5 text-white" />
                )}
              </div>
              <p className="text-xs font-sans text-white font-medium mb-1">
                {isProcessing ? 'A processar imagem...' : 'Clique para selecionar ficheiro ou arraste aqui'}
              </p>
              <p className="text-[11px] text-[#666666]">
                PNG transparente, SVG, WebP ou JPEG (Máx. 5MB)
              </p>
            </div>
          </div>

          {/* Card 2: Manual URL Input */}
          <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-white" />
                <h3 className="font-display uppercase text-xs sm:text-sm text-white tracking-wider">
                  2. CAMPO ALTERNATIVO DE URL
                </h3>
              </div>
              <span className="text-[10px] text-[#777777] font-mono uppercase">Link Público</span>
            </div>

            <p className="text-xs text-[#888888] font-sans">
              Se já tiver o logótipo alojado no Supabase Storage, CDN ou qualquer servidor externo, cole o endereço direto da imagem abaixo:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Ex: https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/brand/logo.png"
                className="flex-1 px-3 py-2.5 bg-[#141414] border border-[#262626] rounded text-white text-xs font-mono placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!inputUrl.trim() || isProcessing}
                className="px-5 py-2.5 bg-white text-black font-sans font-bold text-xs uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Aplicar URL
              </button>
            </div>

            <div className="pt-2 text-[11px] text-[#777777] flex items-center gap-2">
              <span className="text-neutral-500 font-mono">URL Atual em vigor:</span>
              <span className="text-neutral-300 font-mono truncate max-w-md bg-[#121212] px-2 py-0.5 rounded border border-[#222]">
                {currentLogo}
              </span>
            </div>
          </div>

          {/* Card 3: Quick Brand Presets */}
          <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-3">
            <h3 className="font-display uppercase text-xs text-white tracking-wider">
              PRESETS RÁPIDOS DA MARCA (RESTAURAÇÃO)
            </h3>
            <p className="text-[11px] text-[#777777] font-sans">
              Volte a qualquer momento para os ficheiros originais da marca:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleResetToDefault('/logo.png', 'Logo PNG Transparente (/logo.png)')}
                className="px-3 py-2 bg-[#161616] hover:bg-[#222222] border border-[#2c2c2c] rounded text-xs text-neutral-300 font-sans flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                <span>Logo PNG Oficial (/logo.png)</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetToDefault('/brand/wu-logo.svg', 'Logo SVG Vetorial (/brand/wu-logo.svg)')}
                className="px-3 py-2 bg-[#161616] hover:bg-[#222222] border border-[#2c2c2c] rounded text-xs text-neutral-300 font-sans flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                <span>Vetor SVG (/brand/wu-logo.svg)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-white" />
                <h3 className="font-display uppercase text-xs sm:text-sm text-white tracking-wider">
                  PRÉ-VISUALIZAÇÃO AO VIVO
                </h3>
              </div>

              {/* Background preview switcher */}
              <div className="flex items-center gap-1 bg-[#161616] p-0.5 rounded border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setPreviewBg('checker')}
                  title="Fundo quadriculado (ver transparência)"
                  className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                    previewBg === 'checker' ? 'bg-[#2a2a2a] text-white font-bold' : 'text-[#777]'
                  }`}
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('black')}
                  title="Fundo Preto Real"
                  className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                    previewBg === 'black' ? 'bg-[#2a2a2a] text-white font-bold' : 'text-[#777]'
                  }`}
                >
                  Preto
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('white')}
                  title="Fundo Branco de Contraste"
                  className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                    previewBg === 'white' ? 'bg-[#2a2a2a] text-white font-bold' : 'text-[#777]'
                  }`}
                >
                  Branco
                </button>
              </div>
            </div>

            {/* Preview Canvas Box */}
            <div
              className={`w-full min-h-[160px] flex items-center justify-center p-6 rounded-lg border border-[#222222] transition-colors relative overflow-hidden ${
                previewBg === 'checker'
                  ? 'bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:12px_12px] bg-[#0c0c0c]'
                  : previewBg === 'black'
                  ? 'bg-[#000000]'
                  : 'bg-neutral-100'
              }`}
            >
              <img
                src={currentLogo}
                alt="Pré-visualização do Logótipo"
                className="max-h-24 max-w-full w-auto object-contain transition-all"
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + '/logo.png') {
                    e.currentTarget.src = '/logo.png';
                  }
                }}
              />
            </div>

            {/* Context Mockup 1: In Header */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#666666] block">
                Simulação: Cabeçalho da Loja (Centralizado)
              </span>
              <div className="h-14 bg-black border border-[#222222] rounded px-4 flex items-center justify-between relative overflow-hidden">
                <span className="text-[11px] text-neutral-500 font-mono">☰ Menu</span>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <WULogo size="md" imgClassName="h-6 sm:h-8 max-h-8 w-auto object-contain" />
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">PT | Bag (0)</span>
              </div>
            </div>

            {/* Context Mockup 2: In Splash / Hero */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#666666] block">
                Simulação: Ecrã de Entrada (Splash)
              </span>
              <div className="h-24 bg-black border border-[#222222] rounded px-4 flex flex-col items-center justify-center space-y-1 overflow-hidden">
                <WULogo size="lg" imgClassName="h-10 max-h-10 w-auto object-contain" />
                <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-neutral-400">
                  WEARING UNUSUAL
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#121212] border border-[#222222] rounded text-[11px] text-[#888888] space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Propagação Reativa Imediata</span>
              </div>
              <p className="text-[10px] text-[#666666]">
                Qualquer atualização nesta página guarda instantaneamente no Supabase e no cache local, atualizando imediatamente todas as vistas ativas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
