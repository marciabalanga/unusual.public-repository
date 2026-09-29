import React, { useState } from 'react';
import { X, Check, Compass, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { SiteMenuItem, CustomContent } from '../../types';

interface MenuEditorModalProps {
  item: SiteMenuItem;
  customContents: CustomContent[];
  onSave: (updatedItem: SiteMenuItem) => Promise<void> | void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const MenuEditorModal: React.FC<MenuEditorModalProps> = ({
  item,
  customContents,
  onSave,
  onClose,
  showToast,
}) => {
  const [formData, setFormData] = useState<SiteMenuItem>({
    ...item,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.label || formData.label.trim() === '') {
      showToast('O nome apresentado no menu é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        label: formData.label.trim(),
      });
      showToast('Item do menu guardado com sucesso!');
      onClose();
    } catch (e) {
      console.error(e);
      showToast('Erro ao guardar item do menu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="menu-editor-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'menu-editor-backdrop') {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#242424] rounded-xl p-5 sm:p-7 space-y-6 shadow-2xl my-auto animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-4">
          <div>
            <span className="text-[10px] bg-white text-black font-bold uppercase tracking-widest px-2 py-0.5 rounded">
              MENU DO SITE
            </span>
            <h3 className="font-display uppercase text-lg text-white tracking-wider mt-1">
              {formData.label ? `Editar: ${formData.label}` : 'Novo Item do Menu'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#777777] hover:text-white rounded bg-[#161616]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 font-sans text-xs">
          {/* Nome no Menu */}
          <div>
            <label className="block text-[#888888] uppercase text-[10px] font-mono mb-1">
              Nome Apresentado no Menu *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Ex: SHOP, MODELS, FACES, ARCHIVE, CONTACT"
              className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold text-sm tracking-wider"
            />
            <p className="text-[11px] text-[#777777] mt-1">
              Este nome é independente do nome interno ou do conteúdo associado.
            </p>
          </div>

          {/* Tipo de Destino */}
          <div>
            <label className="block text-[#888888] uppercase text-[10px] font-mono mb-1">
              Tipo de Destino / Ação
            </label>
            <select
              value={formData.target_type}
              onChange={(e) => {
                const newType = e.target.value as any;
                let defaultTargetId = formData.target_id;
                if (newType === 'custom' && customContents.length > 0) {
                  defaultTargetId = customContents[0].id;
                } else if (newType === 'store') {
                  defaultTargetId = 'drop-atual';
                }
                setFormData((prev) => ({
                  ...prev,
                  target_type: newType,
                  target_id: defaultTargetId,
                }));
              }}
              className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white text-xs"
            >
              <option value="custom">Conteúdo Personalizado (ex: UNUSUAL MODELS, Portfólio)</option>
              <option value="store">Loja / Drop Atual</option>
              <option value="capsule">Cápsula do Tempo (Arquivo Histórico)</option>
              <option value="anchor">Âncora na Página (Ex: #manifesto-section)</option>
              <option value="wishlist">Gaveta de Favoritos</option>
              <option value="track">Rastrear Encomenda</option>
              <option value="external">Link Externo</option>
            </select>
          </div>

          {/* Seletor quando for Conteúdo Personalizado */}
          {formData.target_type === 'custom' && (
            <div className="p-3 bg-[#111111] border border-[#222222] rounded-lg space-y-2">
              <label className="block text-[#888888] uppercase text-[10px] font-mono">
                Selecione o Conteúdo Personalizado Associado
              </label>
              {customContents.length > 0 ? (
                <select
                  value={formData.target_id || customContents[0]?.id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, target_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white text-xs font-semibold"
                >
                  {customContents.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.internal_name ? `(${c.internal_name})` : ''} — /{c.slug}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-amber-400 text-xs">
                  Nenhum conteúdo personalizado criado ainda. Crie um no motor de Conteúdo Personalizado.
                </p>
              )}
              <p className="text-[10px] text-[#777777]">
                Mesmo que o nome no menu seja "MODELS" ou "FACES", o clique abrirá o conteúdo selecionado.
              </p>
            </div>
          )}

          {/* Âncora na Página */}
          {formData.target_type === 'anchor' && (
            <div>
              <label className="block text-[#888888] uppercase text-[10px] font-mono mb-1">
                ID da Âncora na Página (#)
              </label>
              <select
                value={formData.target_id || 'drop-atual'}
                onChange={(e) => setFormData((prev) => ({ ...prev, target_id: e.target.value }))}
                className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white text-xs"
              >
                <option value="drop-atual">drop-atual (Grelha de Produtos)</option>
                <option value="lookbook-section">lookbook-section (Galeria Lookbook)</option>
                <option value="manifesto-section">manifesto-section (Manifesto da Marca)</option>
                <option value="unusual-models">unusual-models (UNUSUAL MODELS)</option>
              </select>
            </div>
          )}

          {/* Link Externo */}
          {formData.target_type === 'external' && (
            <div>
              <label className="block text-[#888888] uppercase text-[10px] font-mono mb-1">
                URL de Destino
              </label>
              <input
                type="text"
                value={formData.url || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://instagram.com/wearingunusual"
                className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-mono text-xs"
              />
            </div>
          )}

          {/* Status Ativo */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 rounded bg-[#161616] border-[#333333] text-white"
              />
              <span className="text-white">Ativo no Menu Público do Site</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1c1c1c] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#161616] hover:bg-[#222222] text-neutral-400 rounded text-xs uppercase"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 bg-white text-black font-sans font-bold text-xs uppercase rounded hover:bg-[#eaeaea] transition-all"
          >
            {isSaving ? 'A guardar...' : 'Guardar Item'}
          </button>
        </div>
      </div>
    </div>
  );
};
