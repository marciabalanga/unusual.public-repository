import React, { useState } from 'react';
import { Eye, ArrowLeft, UploadCloud, CheckCircle2, ShieldCheck, X, Sparkles, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { scrollToTop } from '../lib/scroll';

interface PreviewTopBarProps {
  onReturnToAdmin: () => void;
}

export const PreviewTopBar: React.FC<PreviewTopBarProps> = ({ onReturnToAdmin }) => {
  const {
    isPreviewMode,
    setIsPreviewMode,
    hasUnpublishedChanges,
    publishDraft,
    isPublishing,
    lastPublishedAt,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
  } = useStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isPreviewMode) return null;

  const handlePublish = async () => {
    const success = await publishDraft();
    if (success) {
      setToastMessage(
        language === 'en'
          ? 'Changes published successfully to the official store!'
          : 'Alterações publicadas com sucesso na loja oficial!'
      );
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage(
        language === 'en' ? 'Error publishing changes.' : 'Erro ao publicar alterações.'
      );
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <aside aria-label="Barra de Controlo do Modo Preview" className="sticky top-0 z-[100] w-full bg-neutral-950/95 border-b border-amber-500/60 backdrop-blur-md text-white shadow-2xl transition-all select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Badge & Description */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/60 px-2.5 py-1 rounded text-amber-300 font-mono text-[10px] font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Eye className="w-3 h-3 text-amber-400" />
            <span>{language === 'en' ? 'PREVIEW MODE • DRAFT' : 'MODO PREVIEW • DRAFT'}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-300 font-sans">
            <span className="text-neutral-400">
              {language === 'en'
                ? 'Viewing draft with Admin changes. Visitors only see the published version.'
                : 'A ver rascunho com alterações do Admin. Os visitantes vêem apenas a versão publicada.'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{language === 'en' ? 'Safe Simulation' : 'Simulação Segura'}</span>
            </span>
          </div>
        </div>

        {/* Center Navigation Shortcuts */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('store');
              scrollToTop(true);
            }}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'store'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white bg-[#141414]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('capsule');
              scrollToTop(true);
            }}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'capsule'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white bg-[#141414]'
            }`}
          >
            {language === 'en' ? 'Time Capsule' : 'Cápsula do Tempo'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('track');
              scrollToTop(true);
            }}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'track'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white bg-[#141414]'
            }`}
          >
            {language === 'en' ? 'Tracking' : 'Rastreio'}
          </button>
        </div>

        {/* Right Actions: PT/EN Selector, Return to Admin & Publish Button */}
        <div className="flex items-center gap-2">
          {/* Global PT / EN Selector for preview testing */}
          <div
            className="flex items-center rounded border border-[#333333] bg-[#111111] p-0.5 text-[10px] font-mono font-bold"
            title={language === 'en' ? 'Switch Preview Language' : 'Mudar Idioma do Preview'}
          >
            <button
              type="button"
              onClick={() => setLanguage('pt')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                language === 'pt' ? 'bg-white text-black font-bold' : 'text-[#888888] hover:text-white'
              }`}
            >
              PT
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                language === 'en' ? 'bg-white text-black font-bold' : 'text-[#888888] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Voltar ao Admin */}
          <button
            type="button"
            onClick={onReturnToAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded text-xs font-sans uppercase font-bold tracking-wider transition-all cursor-pointer"
            title={language === 'en' ? 'Exit Preview and return to Admin' : 'Sair do Preview e voltar ao Painel Administrativo'}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-300" />
            <span>{language === 'en' ? 'Back to Admin' : 'Voltar ao Admin'}</span>
          </button>

          {/* Publicar Rascunho */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-sans tracking-wider uppercase font-bold transition-all shadow-lg cursor-pointer ${
              hasUnpublishedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
            }`}
            title={language === 'en' ? 'Publish current draft to official live store' : 'Publicar o rascunho atual diretamente para a loja oficial de clientes'}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>
              {isPublishing
                ? (language === 'en' ? 'Publishing...' : 'A Publicar...')
                : hasUnpublishedChanges
                ? (language === 'en' ? 'Publish Changes' : 'Publicar Alterações')
                : (language === 'en' ? 'Published ✓' : 'Publicado ✓')}
            </span>
          </button>

          {/* Sair do Modo Preview */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className="p-1.5 text-neutral-500 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            title={language === 'en' ? 'Close Preview bar' : 'Fechar barra de Preview'}
            aria-label={language === 'en' ? 'Close Preview bar' : 'Fechar barra de Preview'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-sans font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}
    </aside>
  );
};
