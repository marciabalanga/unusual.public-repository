import React, { useState } from 'react';
import {
  X,
  Check,
  Image as ImageIcon,
  Sliders,
  Type,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  Code
} from 'lucide-react';
import { SiteBlock } from '../../types';
import { SingleImageUploader, MultiImageUploader } from './image-uploader';
import { ImageGalleryManager } from './image-gallery-manager';
import { supabase, uploadImageToSupabase } from '../../lib/supabase';

interface BlockEditorModalProps {
  block: SiteBlock;
  onSave: (updatedBlock: SiteBlock) => Promise<void> | void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const BlockEditorModal: React.FC<BlockEditorModalProps> = ({
  block,
  onSave,
  onClose,
  showToast,
}) => {
  const [editingBlock, setEditingBlock] = useState<SiteBlock>({
    ...block,
    content: { ...block.content },
  });

  const [activeTab, setActiveTab] = useState<'content' | 'raw'>('content');
  const [isSaving, setIsSaving] = useState(false);

  const updateContentField = (field: string, value: any) => {
    setEditingBlock((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      try {
        await supabase.from('site_blocks').upsert({
          ...editingBlock,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Erro ao atualizar Supabase site_blocks:', dbErr);
      }
      await onSave(editingBlock);
      showToast('Conteúdo do bloco guardado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao guardar alterações do bloco.');
    } finally {
      setIsSaving(false);
    }
  };

  const content = editingBlock.content || {};

  return (
    <div
      id="block-editor-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'block-editor-backdrop') {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl bg-[#0d0d0d] border border-[#242424] rounded-xl p-4 sm:p-8 space-y-6 shadow-2xl my-auto overflow-y-auto max-h-[90vh] overscroll-contain animate-in fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d0d]/95 backdrop-blur-md z-20 -mt-2 pt-2 pb-4 border-b border-[#1c1c1c] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-white text-black font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                AUTONOMIA TOTAL
              </span>
              <span className="text-[10px] bg-[#1a1a1a] text-[#888888] font-mono px-2 py-0.5 rounded uppercase">
                {editingBlock.block_type}
              </span>
            </div>
            <h3 className="font-display uppercase text-lg sm:text-xl text-white tracking-wider mt-1.5">
              Editar: {editingBlock.title}
            </h3>
            <p className="text-xs text-[#777777] font-sans mt-0.5">
              Altere os textos, slogans, fotografias e configurações deste bloco da homepage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'content' ? 'raw' : 'content')}
              className="p-1.5 text-[#666666] hover:text-white rounded bg-[#161616] text-[10px] font-mono flex items-center gap-1"
              title="Alternar entre formulário e JSON bruto"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{activeTab === 'content' ? 'JSON' : 'Formulário'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#777777] hover:text-white rounded bg-[#161616]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RAW JSON TAB */}
        {activeTab === 'raw' && (
          <div className="space-y-3 font-sans text-xs">
            <label className="block text-[#888888] uppercase text-[11px]">
              Estrutura JSON Bruta do Conteúdo
            </label>
            <textarea
              rows={12}
              defaultValue={JSON.stringify(editingBlock.content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setEditingBlock((prev) => ({ ...prev, content: parsed }));
                } catch {
                  // Wait for valid json
                }
              }}
              className="w-full p-3 bg-[#111111] border border-[#222222] rounded text-emerald-400 font-mono text-[11px]"
            />
          </div>
        )}

        {/* VISUAL FORM BUILDER TAB */}
        {activeTab === 'content' && (
          <div className="space-y-6 max-h-[68vh] overflow-y-auto pr-1">
            {/* 1. HERO BANNER EDITOR */}
            {editingBlock.block_type === 'hero_banner' && (
              <div className="space-y-6 text-xs font-sans">
                {/* Visual Banner Images Management */}
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display uppercase text-white tracking-wider text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>Fotografias do Banner Hero</span>
                      </span>
                      <p className="text-[11px] text-[#777777] mt-0.5">
                        Carregue uma ou várias fotos do seu telemóvel/computador ou cole URLs. Se adicionar mais de uma foto, o banner exibirá um carrossel automático elegante com controles.
                      </p>
                    </div>
                  </div>

                  <ImageGalleryManager
                    totalSlots={6}
                    sectionTitle="Galeria de Fotos do Banner Hero"
                    images={
                      Array.isArray(content.bg_images)
                        ? content.bg_images
                        : (content.bg_image ? [content.bg_image] : [])
                    }
                    onChange={async (newImgs) => {
                      const cleanImgs = newImgs.filter(Boolean);
                      const primary = cleanImgs.length > 0 ? cleanImgs[0] : '';

                      // Atualiza o estado local do bloco
                      setEditingBlock((prev) => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          bg_images: cleanImgs,
                          bg_image: primary,
                        },
                      }));

                      // Sincroniza diretamente no Supabase
                      try {
                        await supabase.from('site_blocks').upsert({
                          ...editingBlock,
                          content: {
                            ...editingBlock.content,
                            bg_images: cleanImgs,
                            bg_image: primary,
                          },
                          updated_at: new Date().toISOString(),
                        });
                      } catch (err) {
                        console.warn('Erro ao sincronizar galeria no Supabase:', err);
                      }
                    }}
                    onRemoveImmediate={async (removedUrl, remainingUrls) => {
                      const cleanRemaining = remainingUrls.filter(Boolean);
                      const primary = cleanRemaining.length > 0 ? cleanRemaining[0] : '';

                      // Salva nova lista no Supabase imediatamente, permitindo limpar slots com erro [?] ou links quebrados
                      try {
                        await supabase.from('site_blocks').upsert({
                          ...editingBlock,
                          content: {
                            ...editingBlock.content,
                            bg_images: cleanRemaining,
                            bg_image: primary,
                          },
                          updated_at: new Date().toISOString(),
                        });
                        showToast('Slot de imagem limpo e atualizado no Supabase.');
                      } catch (err) {
                        console.warn('Erro ao atualizar remoção no Supabase:', err);
                      }
                    }}
                  />

                  {/* Dark Overlay Opacity Slider */}
                  <div className="pt-3 border-t border-[#1c1c1c] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#999999] uppercase">
                        Escuridão do Véu / Vignette ({Math.round(((content.overlay_opacity !== undefined ? content.overlay_opacity : 0.55)) * 100)}%)
                      </span>
                      <span className="text-[#666666]">Garante legibilidade total das letras brancas</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.85"
                      step="0.05"
                      value={content.overlay_opacity !== undefined ? content.overlay_opacity : 0.55}
                      onChange={(e) => updateContentField('overlay_opacity', parseFloat(e.target.value))}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>

                  {/* Alignment Selector */}
                  <div className="pt-2 border-t border-[#1c1c1c] flex items-center justify-between gap-4">
                    <span className="text-[#999999] text-[11px] uppercase">Alinhamento do Texto:</span>
                    <div className="flex items-center gap-1.5">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateContentField('text_alignment', align)}
                          className={`px-3 py-1 rounded text-[10px] uppercase font-mono transition-colors ${
                            (content.text_alignment || 'left') === align
                              ? 'bg-white text-black font-bold'
                              : 'bg-[#181818] text-[#888888] hover:text-white'
                          }`}
                        >
                          {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Typography & Copywriting Fields */}
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <span className="font-display uppercase text-white tracking-wider text-xs flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-emerald-400" />
                    <span>Letras, Slogans & Títulos do Hero</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Tagline Superior (Drop Tag)
                      </label>
                      <input
                        type="text"
                        value={content.drop_tag || ''}
                        onChange={(e) => updateContentField('drop_tag', e.target.value)}
                        placeholder="Ex: DROP 01 — COLD ASHES"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Título Principal do Hero *
                      </label>
                      <input
                        type="text"
                        value={content.drop_title || ''}
                        onChange={(e) => updateContentField('drop_title', e.target.value)}
                        placeholder="Ex: WEARING UNUSUAL"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Slogan do Drop
                      </label>
                      <input
                        type="text"
                        value={content.drop_slogan || ''}
                        onChange={(e) => updateContentField('drop_slogan', e.target.value)}
                        placeholder="Ex: A NOVA VAGA"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Frase Descritiva / Subtexto (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={content.description || ''}
                        onChange={(e) => updateContentField('description', e.target.value)}
                        placeholder="Ex: Silhuetas brutalistas e rigor arquitetural desenhados e produzidos em Luanda."
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Call To Action Buttons */}
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <span className="font-display uppercase text-white tracking-wider text-xs flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Botões de Ação (CTAs)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Texto do Botão Principal (CTA 1)
                      </label>
                      <input
                        type="text"
                        value={content.cta_text || ''}
                        onChange={(e) => updateContentField('cta_text', e.target.value)}
                        placeholder="Ex: COMPRAR AGORA"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Destino do Link (CTA 1)
                      </label>
                      <input
                        type="text"
                        value={content.cta_link || ''}
                        onChange={(e) => updateContentField('cta_link', e.target.value)}
                        placeholder="Ex: #drop-atual"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Texto do Botão Secundário (CTA 2, Opcional)
                      </label>
                      <input
                        type="text"
                        value={content.secondary_cta_text || ''}
                        onChange={(e) => updateContentField('secondary_cta_text', e.target.value)}
                        placeholder="Ex: VER LOOKBOOK"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                        Destino do Link (CTA 2)
                      </label>
                      <input
                        type="text"
                        value={content.secondary_cta_link || ''}
                        onChange={(e) => updateContentField('secondary_cta_link', e.target.value)}
                        placeholder="Ex: #lookbook-section"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DROP GRID BLOCK EDITOR */}
            {editingBlock.block_type === 'drop_grid' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Título da Seção de Produtos</label>
                    <input
                      type="text"
                      value={content.heading || ''}
                      onChange={(e) => updateContentField('heading', e.target.value)}
                      placeholder="Ex: DROP ATUAL"
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Subtítulo / Descrição</label>
                    <input
                      type="text"
                      value={content.subheading || ''}
                      onChange={(e) => updateContentField('subheading', e.target.value)}
                      placeholder="Ex: Edição limitada. Produzido em Angola."
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#1c1c1c]">
                    <div>
                      <span className="text-white font-medium block">Exibir Filtros de Categoria</span>
                      <span className="text-[11px] text-[#666666] block">
                        Permite ao cliente filtrar por T-Shirts, Hoodies, Sweatshirts, Denim, etc.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateContentField(
                          'show_categories_filter',
                          content.show_categories_filter === false ? true : false
                        )
                      }
                      className={`px-3 py-1.5 rounded text-xs uppercase font-mono ${
                        content.show_categories_filter !== false
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-[#1a1a1a] text-[#777777]'
                      }`}
                    >
                      {content.show_categories_filter !== false ? 'Visível' : 'Oculto'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LOOKBOOK GALLERY BLOCK EDITOR */}
            {editingBlock.block_type === 'lookbook' && (
              <div className="space-y-6 text-xs font-sans">
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#888888] uppercase mb-1">Subtítulo Superior</label>
                      <input
                        type="text"
                        value={editingBlock.subtitle || ''}
                        onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                        placeholder="Ex: EDITORIAL VISUAL"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888888] uppercase mb-1">Título do Lookbook</label>
                      <input
                        type="text"
                        value={content.heading || ''}
                        onChange={(e) => updateContentField('heading', e.target.value)}
                        placeholder="Ex: LOOKBOOK 01"
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#888888] uppercase mb-1">Texto Descritivo</label>
                      <textarea
                        rows={2}
                        value={content.description || ''}
                        onChange={(e) => updateContentField('description', e.target.value)}
                        className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Lookbook Images with Captions */}
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display uppercase text-white tracking-wider text-xs">
                        Fotografias do Lookbook ({(content.images || []).length})
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Adicione imagens diretamente da galeria para o editorial.
                      </p>
                    </div>

                    <label className="px-3 py-1.5 bg-white text-black hover:bg-[#eaeaea] rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Foto (Galeria)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const newUrl = await uploadImageToSupabase(file, 'lookbook');
                            const nextImgs = [
                              ...(content.images || []),
                              {
                                url: newUrl,
                                caption: `LOOK 0${(content.images || []).length + 1}`,
                              },
                            ];
                            updateContentField('images', nextImgs);
                          } catch (err) {
                            console.warn('Erro ao carregar foto do lookbook:', err);
                          } finally {
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>

                  {(content.images || []).length === 0 ? (
                    <label className="w-full py-10 border-2 border-dashed border-[#292929] hover:border-[#444444] rounded-lg flex flex-col items-center justify-center cursor-pointer text-center p-4 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-[#181818] group-hover:bg-[#222222] flex items-center justify-center mb-2 transition-colors">
                        <Plus className="w-5 h-5 text-[#888888] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Nenhuma Foto no Lookbook
                      </span>
                      <span className="text-[11px] text-[#777777] mt-1">
                        Clique aqui para carregar a primeira fotografia diretamente da galeria
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const newUrl = await uploadImageToSupabase(file, 'lookbook');
                            updateContentField('images', [{ url: newUrl, caption: 'LOOK 01' }]);
                          } catch (err) {
                            console.warn('Erro ao carregar foto:', err);
                          } finally {
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className="space-y-3">
                      {(content.images || []).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#161616] border border-[#262626] rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3"
                        >
                          <div className="w-16 h-20 bg-[#222222] rounded overflow-hidden shrink-0 border border-[#333333] flex items-center justify-center">
                            {item.url && item.url.trim() !== '' ? (
                              <img src={item.url.trim()} alt={item.caption || 'Lookbook'} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-[#555555]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-2 w-full">
                            <SingleImageUploader
                              label={`Foto #${idx + 1}`}
                              value={item.url}
                              onChange={(newUrl) => {
                                const updated = [...content.images];
                                updated[idx].url = newUrl;
                                updateContentField('images', updated);
                              }}
                            />
                            <div>
                              <label className="block text-[10px] text-[#777777] uppercase">Legenda / Look</label>
                              <input
                                type="text"
                                value={item.caption || ''}
                                onChange={(e) => {
                                  const updated = [...content.images];
                                  updated[idx].caption = e.target.value;
                                  updateContentField('images', updated);
                                }}
                                className="w-full px-2.5 py-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded text-white text-[11px]"
                                placeholder="Ex: Void Boxy Tee — Luanda Street Edition"
                              />
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center gap-1 self-end sm:self-center">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const updated = [...content.images];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                updateContentField('images', updated);
                              }}
                              className="p-1.5 text-[#666666] hover:text-white disabled:opacity-20 bg-[#202020] rounded"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === content.images.length - 1}
                              onClick={() => {
                                const updated = [...content.images];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                updateContentField('images', updated);
                              }}
                              className="p-1.5 text-[#666666] hover:text-white disabled:opacity-20 bg-[#202020] rounded"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = content.images.filter((_: any, i: number) => i !== idx);
                                updateContentField('images', updated);
                              }}
                              className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 rounded"
                              title="Remover foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. MANIFESTO BLOCK EDITOR */}
            {editingBlock.block_type === 'manifesto' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Subtítulo Superior</label>
                    <input
                      type="text"
                      value={editingBlock.subtitle || ''}
                      onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                      placeholder="Ex: FILOSOFIA DA MARCA"
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Título do Manifesto</label>
                    <input
                      type="text"
                      value={content.heading || ''}
                      onChange={(e) => updateContentField('heading', e.target.value)}
                      placeholder="Ex: O MANIFESTO"
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Texto Principal do Manifesto *</label>
                    <textarea
                      rows={5}
                      value={content.text || ''}
                      onChange={(e) => updateContentField('text', e.target.value)}
                      placeholder="Escreva a declaração e alma da marca..."
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Subtexto / Frase de Encerramento</label>
                    <input
                      type="text"
                      value={content.subtext || ''}
                      onChange={(e) => updateContentField('subtext', e.target.value)}
                      placeholder="Ex: Menos ruído. Mais substância. Feito em Luanda."
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. CÁPSULA DO TEMPO BLOCK EDITOR */}
            {editingBlock.block_type === 'time_capsule' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Subtítulo Superior</label>
                    <input
                      type="text"
                      value={editingBlock.subtitle || ''}
                      onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                      placeholder="Ex: MUSEU DE PEÇAS ESGOTADAS"
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Título da Seção</label>
                    <input
                      type="text"
                      value={content.heading || ''}
                      onChange={(e) => updateContentField('heading', e.target.value)}
                      placeholder="Ex: CÁPSULA DO TEMPO"
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888888] uppercase mb-1">Descrição Explicativa</label>
                    <textarea
                      rows={2}
                      value={content.subheading || ''}
                      onChange={(e) => updateContentField('subheading', e.target.value)}
                      placeholder="Ex: Registo permanente das peças esgotadas que marcaram o início da nossa história."
                      className="w-full px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. MARQUEE BAR BLOCK EDITOR */}
            {editingBlock.block_type === 'marquee' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display uppercase text-white tracking-wider text-xs">
                        Mensagens do Letreiro Marquee
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Cada mensagem aparecerá em rotação contínua na barra.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const items = [...(content.items || []), 'NOVA MENSAGEM DO LETREIRO'];
                        updateContentField('items', items);
                      }}
                      className="px-3 py-1 bg-white text-black font-bold uppercase rounded text-[10px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Frase</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(content.items || []).map((msg: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={msg}
                          onChange={(e) => {
                            const items = [...content.items];
                            items[idx] = e.target.value;
                            updateContentField('items', items);
                          }}
                          className="flex-1 px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded text-white text-xs uppercase"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const items = content.items.filter((_: any, i: number) => i !== idx);
                            updateContentField('items', items);
                          }}
                          className="p-2 text-[#777777] hover:text-red-400 bg-[#1a1a1a] rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#1c1c1c]">
                    <label className="block text-[#888888] uppercase mb-1 text-[11px]">
                      Velocidade de Rolagem (Segundos por ciclo)
                    </label>
                    <input
                      type="number"
                      value={content.speed_seconds || 25}
                      onChange={(e) => updateContentField('speed_seconds', Number(e.target.value))}
                      className="w-32 px-3 py-1.5 bg-[#161616] border border-[#2a2a2a] rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1c1c1c] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#181818] text-[#888888] hover:text-white rounded text-xs uppercase font-medium transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-6 py-2.5 bg-white text-black font-bold text-xs tracking-wider uppercase rounded hover:bg-[#eaeaea] transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSaving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Guardar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
