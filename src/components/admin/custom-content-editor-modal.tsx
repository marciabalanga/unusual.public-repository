import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, Image as ImageIcon, Link as LinkIcon, Instagram, Layers, Compass, ArrowUp, ArrowDown, Copy, AlertTriangle } from 'lucide-react';
import { CustomContent, CustomContentItem } from '../../types';
import { ImageGalleryManager } from './image-gallery-manager';
import { SingleImageUploader } from './image-uploader';

interface CustomContentEditorModalProps {
  content: CustomContent;
  onSave: (savedContent: CustomContent, options?: { addToPageBuilder?: boolean; addToMenu?: boolean; menuLabel?: string }) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const CustomContentEditorModal: React.FC<CustomContentEditorModalProps> = ({
  content,
  onSave,
  onDelete,
  onClose,
  showToast,
}) => {
  const [formData, setFormData] = useState<CustomContent>({
    ...content,
    images: Array.isArray(content.images) ? [...content.images] : [],
    items: Array.isArray(content.items) ? [...content.items] : [],
  });

  const [addToPageBuilder, setAddToPageBuilder] = useState(false);
  const [addToMenu, setAddToMenu] = useState(false);
  const [menuLabel, setMenuLabel] = useState(content.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateItem = (index: number, field: keyof CustomContentItem, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.items || [])];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, items: updated };
    });
  };

  const addItem = () => {
    const newItem: CustomContentItem = {
      id: `item-${Date.now()}`,
      name: 'Novo Modelo / Ficha',
      role: 'Editorial Model',
      bio: '',
      image_url: '',
      instagram: '@wearingunusual',
      social_link: 'https://instagram.com/wearingunusual',
    };
    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const duplicateItem = (index: number) => {
    setFormData((prev) => {
      const current = [...(prev.items || [])];
      const target = current[index];
      if (!target) return prev;
      const clone: CustomContentItem = {
        ...target,
        id: `item-${Date.now()}`,
        name: `${target.name || 'Modelo'} (Cópia)`,
      };
      current.splice(index + 1, 0, clone);
      return { ...prev, items: current };
    });
    showToast('Ficha de modelo duplicada.');
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const current = [...(prev.items || [])];
      const temp = current[index];
      current[index] = current[index - 1];
      current[index - 1] = temp;
      return { ...prev, items: current };
    });
  };

  const moveItemDown = (index: number) => {
    setFormData((prev) => {
      const current = [...(prev.items || [])];
      if (index >= current.length - 1) return prev;
      const temp = current[index];
      current[index] = current[index + 1];
      current[index + 1] = temp;
      return { ...prev, items: current };
    });
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
    showToast('Ficha de modelo removida.');
  };

  const handleDeleteContent = async () => {
    if (!content.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(content.id);
      showToast(`Conteúdo "${formData.title}" eliminado com sucesso.`);
      onClose();
    } catch (e) {
      console.error(e);
      showToast('Erro ao eliminar conteúdo.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || formData.title.trim() === '') {
      showToast('O Nome do Conteúdo é obrigatório.');
      return;
    }

    let finalSlug = (formData.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!finalSlug) {
      finalSlug = formData.title.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    }

    setIsSaving(true);
    try {
      await onSave(
        {
          ...formData,
          slug: finalSlug,
          updated_at: new Date().toISOString(),
        },
        {
          addToPageBuilder,
          addToMenu,
          menuLabel: menuLabel.trim() || formData.title.trim(),
        }
      );
      showToast(`Conteúdo "${formData.title}" guardado com sucesso!`);
      onClose();
    } catch (e) {
      console.error(e);
      showToast('Erro ao guardar conteúdo personalizado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="custom-content-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'custom-content-backdrop') {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl bg-[#0c0c0c] border border-[#222222] rounded-xl p-4 sm:p-8 space-y-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto animate-in fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#0c0c0c]/95 backdrop-blur-md z-20 -mt-2 pt-2 pb-4 border-b border-[#1c1c1c] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-white text-black font-bold uppercase tracking-widest px-2.5 py-0.5 rounded">
                TIPO: CONTEÚDO PERSONALIZADO
              </span>
              <span className="text-[10px] bg-[#1a1a1a] text-neutral-400 font-mono px-2 py-0.5 rounded uppercase">
                REUTILIZÁVEL • EDITORIAL & PORTFOLIO
              </span>
            </div>
            <h3 className="font-display uppercase text-xl sm:text-2xl text-white tracking-wider mt-1.5">
              {formData.title || 'Novo Conteúdo Editorial'}
            </h3>
            <p className="text-xs text-[#777777] font-sans mt-0.5">
              Defina livremente o nome, fotos, perfis e narrativa sem as restrições da ficha técnica de vestuário.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#777777] hover:text-white rounded bg-[#161616] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 font-sans text-xs">
          {/* Identidade Principal */}
          <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
            <span className="font-display uppercase text-white tracking-wider text-xs block">
              1. Identidade e Acesso Público
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase text-[#888888] text-[10px] font-mono mb-1">
                  Nome do Conteúdo * (Apresentado no site e painel)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: prev.slug || newTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                    }));
                    if (!menuLabel || menuLabel === formData.title) {
                      setMenuLabel(newTitle);
                    }
                  }}
                  placeholder="Ex: UNUSUAL MODELS, LOOKBOOK, CAMPAIGN 01"
                  className="w-full px-3 py-2.5 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold text-sm tracking-wider"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Este nome será exibido publicamente no site e no Page Builder.
                </span>
              </div>

              <div>
                <label className="block uppercase text-[#888888] text-[10px] font-mono mb-1">
                  Nome Interno (Identificação Administrativa)
                </label>
                <input
                  type="text"
                  value={formData.internal_name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, internal_name: e.target.value }))}
                  placeholder="Ex: Model Portfolio, Editorial Verão"
                  className="w-full px-3 py-2.5 bg-[#161616] border border-[#2a2a2a] rounded text-neutral-300"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Identificador para organização interna.
                </span>
              </div>

              <div>
                <label className="block uppercase text-[#888888] text-[10px] font-mono mb-1">
                  Slug / Identificador URL *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-[#141414] border border-r-0 border-[#2a2a2a] rounded-l text-neutral-500 font-mono text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                      setFormData((prev) => ({ ...prev, slug: clean }));
                    }}
                    placeholder="unusual-models"
                    className="w-full px-3 py-2.5 bg-[#161616] border border-[#2a2a2a] rounded-r text-amber-300 font-mono text-xs"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  URL pública segura. Ex: /{formData.slug || 'unusual-models'}
                </span>
              </div>

              <div>
                <label className="block uppercase text-[#888888] text-[10px] font-mono mb-1">
                  Subtítulo / Categoria Editorial
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Ex: PORTFOLIO & CASTING EDITORIAL"
                  className="w-full px-3 py-2.5 bg-[#161616] border border-[#2a2a2a] rounded text-neutral-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase text-[#888888] text-[10px] font-mono mb-1">
                  Descrição / Manifesto Editorial
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Escreva a descrição conceptual, propósito do casting ou narrativa das peças..."
                  className="w-full px-3 py-2.5 bg-[#161616] border border-[#2a2a2a] rounded text-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Fotografias / Galeria de Media */}
          <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-3">
            <span className="font-display uppercase text-white tracking-wider text-xs block">
              2. Fotografias / Media (Galeria com Carregamento Direto)
            </span>
            <p className="text-[11px] text-[#777777]">
              Adicione fotos do seu dispositivo ou links. Estas fotos compõem a galeria visual deste conteúdo editorial.
            </p>
            <ImageGalleryManager
              totalSlots={8}
              sectionTitle="Galeria de Media do Conteúdo"
              images={formData.images || []}
              onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs.filter(Boolean) }))}
            />
          </div>

          {/* Perfis de Modelos / Fichas de Conteúdo (UNUSUAL MODELS & Portfólios) */}
          <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display uppercase text-white tracking-wider text-xs block">
                  3. Fichas de Modelos / Perfis de Portfolio
                </span>
                <p className="text-[11px] text-[#777777] mt-0.5">
                  Adicione modelos individuais com foto, nome, bio e links de redes sociais.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 bg-white text-black font-sans font-bold text-xs uppercase rounded hover:bg-[#eaeaea] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Modelo</span>
              </button>
            </div>

            {formData.items && formData.items.length > 0 ? (
              <div className="space-y-4">
                {formData.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 bg-[#0a0a0a] border border-[#222222] rounded-lg space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
                        #{idx + 1} — {item.name || 'Modelo Sem Nome'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveItemUp(idx)}
                          disabled={idx === 0}
                          className="p-1.5 bg-[#141414] hover:bg-[#222222] border border-[#262626] rounded text-[#888888] hover:text-white disabled:opacity-20 transition-colors"
                          title="Mover para cima"
                          aria-label="Mover modelo para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItemDown(idx)}
                          disabled={idx === (formData.items?.length || 0) - 1}
                          className="p-1.5 bg-[#141414] hover:bg-[#222222] border border-[#262626] rounded text-[#888888] hover:text-white disabled:opacity-20 transition-colors"
                          title="Mover para baixo"
                          aria-label="Mover modelo para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateItem(idx)}
                          className="p-1.5 bg-[#141414] hover:bg-[#222222] border border-[#262626] rounded text-[#888888] hover:text-amber-300 transition-colors"
                          title="Duplicar modelo"
                          aria-label="Duplicar ficha de modelo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 bg-[#141414] hover:bg-red-950/60 border border-[#262626] hover:border-red-900/60 rounded text-[#888888] hover:text-red-400 transition-colors"
                          title="Remover modelo"
                          aria-label="Remover ficha de modelo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[#888888] uppercase text-[10px] mb-1">
                          Fotografia do Modelo
                        </label>
                        <SingleImageUploader
                          label="Foto do Modelo"
                          value={item.image_url || ''}
                          onChange={(url) => updateItem(idx, 'image_url', url)}
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[#888888] uppercase text-[10px] mb-1">
                              Nome da Modelo / Rosto *
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(idx, 'name', e.target.value)}
                              placeholder="Ex: Nelson & Edson"
                              className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#262626] rounded text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[#888888] uppercase text-[10px] mb-1">
                              Papel / Informação Editorial
                            </label>
                            <input
                              type="text"
                              value={item.role || ''}
                              onChange={(e) => updateItem(idx, 'role', e.target.value)}
                              placeholder="Ex: Editorial Duo • Drop 04"
                              className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#262626] rounded text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#888888] uppercase text-[10px] mb-1">
                            Bio / Informações do Modelo
                          </label>
                          <textarea
                            rows={2}
                            value={item.bio || ''}
                            onChange={(e) => updateItem(idx, 'bio', e.target.value)}
                            placeholder="Informações sobre o modelo, estilo, referências..."
                            className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#262626] rounded text-white text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[#888888] uppercase text-[10px] mb-1">
                              Instagram Handle
                            </label>
                            <div className="flex items-center">
                              <span className="px-2 py-1.5 bg-[#141414] border border-r-0 border-[#262626] rounded-l text-[#666666]">
                                @
                              </span>
                              <input
                                type="text"
                                value={(item.instagram || '').replace(/^@/, '')}
                                onChange={(e) => updateItem(idx, 'instagram', `@${e.target.value.replace(/^@/, '')}`)}
                                placeholder="wearingunusual"
                                className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#262626] rounded-r text-white text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[#888888] uppercase text-[10px] mb-1">
                              Link Social / Portfolio
                            </label>
                            <input
                              type="text"
                              value={item.social_link || ''}
                              onChange={(e) => updateItem(idx, 'social_link', e.target.value)}
                              placeholder="https://instagram.com/..."
                              className="w-full px-2.5 py-1.5 bg-[#161616] border border-[#262626] rounded text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-[#262626] rounded-lg space-y-2">
                <p className="text-[#666666] text-xs">
                  Nenhum modelo ou perfil adicionado a este conteúdo ainda.
                </p>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 bg-[#181818] hover:bg-white hover:text-black rounded text-white text-xs font-mono transition-colors"
                >
                  + Adicionar Primeira Ficha
                </button>
              </div>
            )}
          </div>

          {/* Ações Rápidas de Integração */}
          <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-3">
            <span className="font-display uppercase text-white tracking-wider text-xs block">
              4. Integração no Site (Automação Opcional)
            </span>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addToPageBuilder}
                  onChange={(e) => setAddToPageBuilder(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#161616] border-[#333333] text-white"
                />
                <div>
                  <span className="text-white font-medium block">
                    Adicionar como Bloco no Page Builder
                  </span>
                  <span className="text-[#777777] text-[11px] block">
                    Cria automaticamente um bloco na homepage com o nome "{formData.title || 'Conteúdo'}"
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addToMenu}
                  onChange={(e) => setAddToMenu(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#161616] border-[#333333] text-white"
                />
                <div>
                  <span className="text-white font-medium block">
                    Adicionar ao Menu de Navegação do Site
                  </span>
                  <span className="text-[#777777] text-[11px] block">
                    Cria uma ligação no menu do site para este conteúdo
                  </span>
                </div>
              </label>

              {addToMenu && (
                <div className="pl-7 pt-1">
                  <label className="block text-[#888888] uppercase text-[10px] mb-1 font-mono">
                    Nome a apresentar no Menu (independente do nome do conteúdo):
                  </label>
                  <input
                    type="text"
                    value={menuLabel}
                    onChange={(e) => setMenuLabel(e.target.value)}
                    placeholder="Ex: MODELS ou FACES"
                    className="w-full max-w-sm px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1c1c1c] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#181818] hover:bg-[#252525] text-neutral-300 rounded font-mono text-xs uppercase"
            >
              Cancelar
            </button>

            {content.id && onDelete && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 bg-red-950/40 hover:bg-red-950/80 text-red-300 border border-red-900/60 rounded text-xs font-sans uppercase transition-colors flex items-center gap-1.5"
                    title="Eliminar este conteúdo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Ficha</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-950/80 border border-red-800 px-3 py-1.5 rounded animate-in fade-in">
                    <span className="text-[11px] text-red-200 font-sans font-medium">
                      Eliminar definitivamente?
                    </span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDeleteContent}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded transition-colors"
                    >
                      {isDeleting ? 'A eliminar...' : 'Sim, Eliminar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 text-neutral-400 hover:text-white text-xs uppercase"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-6 py-2.5 bg-white text-black font-sans font-bold text-xs uppercase tracking-wider rounded hover:bg-[#eaeaea] transition-all shadow-xl disabled:opacity-50"
          >
            {isSaving ? 'A guardar...' : 'Guardar Conteúdo'}
          </button>
        </div>
      </div>
    </div>
  );
};
