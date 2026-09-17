import React, { useState } from 'react';
import { Trash2, Plus, AlertTriangle, RefreshCw } from 'lucide-react';

export interface ImageSlotData {
  id: string;
  url: string;
  isCover?: boolean;
}

export interface ImageSlotProps {
  image: ImageSlotData | null;
  slotIndex: number;
  onRemove: (slotIndex: number) => void;
  onUpload: (slotIndex: number, file: File) => void;
  label?: string;
}

export const ImageSlot: React.FC<ImageSlotProps> = ({
  image,           // { id, url, isCover } ou null
  slotIndex,       // Índice da posição (0 para capa, 1, 2, etc.)
  onRemove,        // Função disparada ao clicar no lixo
  onUpload,        // Função para carregar/alterar imagem neste slot
  label,           // Rótulo opcional (ex: "Foto #1", "Capa")
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if image url changes
  React.useEffect(() => {
    setHasError(false);
  }, [image?.url]);

  return (
    <div className="relative w-full aspect-[3/4] sm:w-36 sm:h-48 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col justify-between p-2 group select-none">
      {/* SE EXISTIR IMAGEM COM URL VÁLIDO NO SLOT */}
      {image && image.url && image.url.trim() !== '' ? (
        <>
          {/* Badge de Capa */}
          {image.isCover && !hasError && (
            <span className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded shadow z-20 uppercase tracking-wider">
              CAPA
            </span>
          )}

          {/* Botão de Excluir Direto no Canto Superior Direito */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(slotIndex);
            }}
            className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-colors shadow-lg z-30"
            title="Remover / Limpar este slot"
            aria-label={`Remover imagem do espaço ${slotIndex + 1}`}
          >
            <Trash2 size={13} />
          </button>

          {/* Renderização da Imagem ou Tratamento de Erro [?] */}
          {hasError ? (
            <div className="absolute inset-0 bg-red-950/50 border border-red-800/80 flex flex-col items-center justify-center p-2 text-center z-10">
              <AlertTriangle className="w-6 h-6 text-red-400 mb-1" />
              <span className="text-[11px] font-bold text-red-300 font-mono">[?] Erro na Foto</span>
              <span className="text-[9px] text-zinc-400 mt-0.5 leading-tight">Link quebrado ou parasita</span>
              <div className="mt-2 flex items-center gap-1.5">
                <label className="px-2 py-1 bg-white hover:bg-zinc-200 text-black text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 shadow cursor-pointer">
                  <RefreshCw size={11} />
                  <span>Substituir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onUpload(slotIndex, e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onRemove(slotIndex)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 shadow"
                >
                  <Trash2 size={11} />
                  <span>Limpar</span>
                </button>
              </div>
            </div>
          ) : (
            <img
              src={image.url}
              alt={`Foto ${slotIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={() => setHasError(true)}
            />
          )}

          {/* Overlay com Ações de Substituição Direta e Lixo */}
          {!hasError && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20 p-2">
              <label className="px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-zinc-200 transition-colors uppercase tracking-wider">
                <RefreshCw size={13} />
                <span>Substituir</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onUpload(slotIndex, e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => onRemove(slotIndex)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-lg flex items-center gap-1 text-[11px]"
                title="Remover Imagem"
                aria-label={`Remover imagem do espaço ${slotIndex + 1}`}
              >
                <Trash2 size={14} />
                <span className="text-[10px] uppercase font-bold">Remover</span>
              </button>
            </div>
          )}

          {/* Informação inferior */}
          <div className="relative z-20 mt-auto flex justify-between items-center text-[10px] text-zinc-300 bg-black/75 backdrop-blur-xs px-2 py-1 rounded">
            <span className="truncate">{label || (slotIndex === 0 ? 'Espaço #1 (Capa)' : `Foto #${slotIndex + 1}`)}</span>
            {image.isCover && !hasError && <span className="text-emerald-400 font-semibold ml-1 shrink-0">Principal</span>}
          </div>
        </>
      ) : (
        /* SE O SLOT ESTIVER VAZIO / LIBERADO */
        <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-zinc-400 rounded-lg cursor-pointer transition-colors text-zinc-500 hover:text-zinc-200 p-2 text-center group/empty">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-1.5 group-hover/empty:bg-zinc-700 transition-colors">
            <Plus size={18} className="text-zinc-400 group-hover/empty:text-white transition-colors" />
          </div>
          <span className="text-xs font-bold text-zinc-300 group-hover/empty:text-white transition-colors">
            + Adicionar
          </span>
          <span className="text-[10px] text-zinc-500 group-hover/empty:text-zinc-400 mt-0.5 font-medium">
            {slotIndex === 0 ? 'Espaço #1 (Capa)' : `Espaço #${slotIndex + 1}`}
          </span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUpload(slotIndex, e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </label>
      )}
    </div>
  );
};

