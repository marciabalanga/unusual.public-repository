import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Plus } from 'lucide-react';
import { ImageSlot, ImageSlotData } from './image-slot';
import { optimizeImageFile } from './image-uploader';
import { uploadImageToSupabase } from '../../lib/supabase';

export interface ImageGalleryManagerProps {
  totalSlots?: number;
  sectionTitle?: string;
  images?: string[];
  onChange?: (urls: string[]) => void;
  onRemoveImmediate?: (removedUrl: string, remainingUrls: string[]) => Promise<void> | void;
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  totalSlots = 6,
  sectionTitle = "Fotografias da Peça",
  images = [],
  onChange,
  onRemoveImmediate,
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  // Inicializa o estado com a quantidade especificada de slots
  const [slots, setSlots] = useState<(ImageSlotData | null)[]>(() => {
    const initial: (ImageSlotData | null)[] = [];
    for (let i = 0; i < totalSlots; i++) {
      if (images && images[i] && images[i].trim() !== '') {
        initial.push({
          id: `img-${i}-${i}`,
          url: images[i].trim(),
          isCover: i === 0,
        });
      } else {
        initial.push(null);
      }
    }
    return initial;
  });

  // Chave estável para sincronizar com as imagens externas
  const imagesKey = (images || []).join('||');

  useEffect(() => {
    setSlots((prev) => {
      const currentUrls = prev.filter((s): s is ImageSlotData => s !== null && Boolean(s.url && s.url.trim() !== '')).map((s) => s.url);
      const incomingUrls = (images || []).filter((u) => Boolean(u && u.trim() !== ''));
      const isIdentical =
        currentUrls.length === incomingUrls.length &&
        currentUrls.every((url, idx) => url === incomingUrls[idx]);

      if (isIdentical) return prev;

      const newSlots: (ImageSlotData | null)[] = [];
      for (let i = 0; i < totalSlots; i++) {
        if (incomingUrls[i] && incomingUrls[i].trim() !== '') {
          newSlots.push({
            id: prev[i]?.id || `img-${i}-${Date.now()}`,
            url: incomingUrls[i].trim(),
            isCover: i === 0,
          });
        } else {
          newSlots.push(null);
        }
      }
      return newSlots;
    });
  }, [imagesKey, totalSlots]);

  // Extrai lista limpa e ordenada de URLs dos slots
  const getOrderedUrls = (targetSlots: (ImageSlotData | null)[]): string[] => {
    const nonNull = targetSlots.filter((s): s is ImageSlotData => s !== null && Boolean(s.url && s.url.trim() !== ''));
    const cover = nonNull.find((s) => s.isCover);
    const rest = nonNull.filter((s) => !s.isCover);
    const ordered = cover ? [cover, ...rest] : rest;
    return ordered.map((s) => s.url).filter((url) => Boolean(url && url.trim() !== ''));
  };

  // Função para Remover Imagem (Esvazia a posição sem alterar as outras)
  const handleRemoveImage = (indexToRemove: number) => {
    const targetSlot = slots[indexToRemove];
    const removedUrl = targetSlot?.url || '';
    const wasCover = targetSlot?.isCover;

    const newSlots = [...slots];
    newSlots[indexToRemove] = null; // Esvazia o slot exato

    // Se removeu a capa, define automaticamente o próximo slot preenchido como capa
    if (wasCover) {
      const nextFilledIndex = newSlots.findIndex((s) => s !== null);
      if (nextFilledIndex !== -1 && newSlots[nextFilledIndex]) {
        newSlots[nextFilledIndex] = { ...newSlots[nextFilledIndex]!, isCover: true };
      }
    }

    setSlots(newSlots);
    const remainingUrls = getOrderedUrls(newSlots);

    if (onChange) {
      onChange(remainingUrls);
    }
    if (onRemoveImmediate && removedUrl) {
      onRemoveImmediate(removedUrl, remainingUrls);
    }
  };

  // Função para Fazer Upload/Substituir num slot específico
  const handleUploadImage = async (indexTarget: number, file: File) => {
    let imageUrl = '';
    try {
      imageUrl = await uploadImageToSupabase(file, 'products');
    } catch {
      try {
        imageUrl = await optimizeImageFile(file);
      } catch {
        imageUrl = URL.createObjectURL(file);
      }
    }

    const newSlots = [...slots];
    const hasCover = newSlots.some((s, idx) => s?.isCover && idx !== indexTarget);
    const isFirst = !newSlots.some((s) => s !== null);

    newSlots[indexTarget] = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: imageUrl,
      isCover: isFirst || indexTarget === 0 || !hasCover,
    };

    setSlots(newSlots);
    if (onChange) {
      onChange(getOrderedUrls(newSlots));
    }
  };

  // Função para Inserir Imagem por URL
  const handleAddByUrl = () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;

    // Encontra o primeiro slot vazio ou substitui o último
    let targetIndex = slots.findIndex((s) => s === null);
    if (targetIndex === -1) {
      targetIndex = 0; // se todos cheios, substitui o primeiro
    }

    const newSlots = [...slots];
    const hasCover = newSlots.some((s, idx) => s?.isCover && idx !== targetIndex);
    const isFirst = !newSlots.some((s) => s !== null);

    newSlots[targetIndex] = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: trimmed,
      isCover: isFirst || targetIndex === 0 || !hasCover,
    };

    setSlots(newSlots);
    setUrlInputValue('');
    setShowUrlInput(false);

    if (onChange) {
      onChange(getOrderedUrls(newSlots));
    }
  };

  const filledCount = slots.filter(Boolean).length;

  return (
    <div className="p-4 bg-zinc-950 text-white rounded-xl border border-zinc-900 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            {sectionTitle} ({filledCount} / {totalSlots} fotos)
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Clique no ícone de lixo para esvaziar o slot ou eliminar imagens com erro [?].
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-medium tracking-wider uppercase rounded flex items-center gap-1 transition-colors"
        >
          <LinkIcon size={12} />
          <span>{showUrlInput ? 'Fechar Link' : 'Colar Link URL'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          <input
            type="url"
            placeholder="Cole o endereço HTTPS da imagem..."
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddByUrl();
              }
            }}
            className="flex-1 px-3 py-1.5 bg-black border border-zinc-700 rounded text-white text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-white"
          />
          <button
            type="button"
            onClick={handleAddByUrl}
            className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Inserir</span>
          </button>
        </div>
      )}

      {/* Grid Flexível/Responsive para os Blocos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {slots.map((image, index) => (
          <ImageSlot
            key={index}
            slotIndex={index}
            image={image}
            onRemove={handleRemoveImage}
            onUpload={handleUploadImage}
            label={index === 0 ? "Capa" : `Foto #${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
