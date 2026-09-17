import React, { useRef, useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Plus, Check, Star } from 'lucide-react';
import { uploadImageToSupabase } from '../../lib/supabase';

/**
 * Optimizes an image file locally in the browser using an HTML Canvas.
 * Downscales images larger than 1600px and converts to high quality JPEG/WebP (quality 0.85).
 * Keeps files light (< 250KB) while maintaining crisp high-fashion detail.
 */
export async function optimizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Try webp or jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', 0.86);
          resolve(dataUrl);
        } catch {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
          resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error('Erro ao carregar a imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler o ficheiro.'));
    reader.readAsDataURL(file);
  });
}

interface SingleImageUploaderProps {
  label?: string;
  helperText?: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  presets?: { name: string; url: string }[];
}

export const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({
  label = 'Imagem',
  helperText,
  value,
  onChange,
  aspectRatio = 'aspect-[16/9]',
  presets = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [mode, setMode] = useState<'upload' | 'url' | 'presets'>('upload');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      let finalUrl = '';
      try {
        finalUrl = await uploadImageToSupabase(file, 'media');
      } catch {
        finalUrl = await optimizeImageFile(file);
      }
      onChange(finalUrl);
    } catch (err) {
      alert('Não foi possível processar a imagem. Tente outro ficheiro.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    onChange(inputUrl.trim());
    setInputUrl('');
  };

  return (
    <div className="space-y-2.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[#888888] uppercase text-[10px] font-sans tracking-wider font-semibold">
            {label}
          </label>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                fileInputRef.current?.click();
              }}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                mode === 'upload' ? 'bg-white text-black font-bold' : 'text-[#777777] hover:text-white'
              }`}
              title="Abrir galeria de fotos do dispositivo"
            >
              <Upload className="w-2.5 h-2.5" />
              <span>Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-2 py-0.5 rounded transition-colors ${
                mode === 'url' ? 'bg-white text-black font-bold' : 'text-[#777777] hover:text-white'
              }`}
            >
              Link / URL
            </button>
            {presets.length > 0 && (
              <button
                type="button"
                onClick={() => setMode('presets')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  mode === 'presets' ? 'bg-white text-black font-bold' : 'text-[#777777] hover:text-white'
                }`}
              >
                Acervo WU
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preview Card */}
      <div className="relative group bg-[#111111] border border-[#222222] rounded-md overflow-hidden">
        {value && value.trim() !== '' ? (
          <div className={`relative w-full ${aspectRatio} bg-[#0c0c0c] flex items-center justify-center`}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-black text-[11px] font-bold tracking-wider uppercase rounded hover:bg-neutral-200 transition-colors"
              >
                Substituir
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-1.5 bg-red-950/80 text-red-300 border border-red-800 text-[11px] font-bold tracking-wider uppercase rounded hover:bg-red-900 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full ${aspectRatio} border-2 border-dashed border-[#2a2a2a] hover:border-[#444444] rounded-md flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-colors`}
          >
            <Upload className="w-6 h-6 text-[#666666] mb-2" />
            <span className="text-xs font-medium text-white block">
              {isUploading ? 'A processar imagem...' : 'Clique para carregar foto do telemóvel ou PC'}
            </span>
            <span className="text-[10px] text-[#666666] block mt-1">
              JPG, PNG ou WebP de alta resolução
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mode Details */}
      {mode === 'url' && (
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Cole aqui o link direto da imagem (https://...)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded text-white text-xs font-mono placeholder:text-[#555555]"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-neutral-200"
          >
            Aplicar
          </button>
        </div>
      )}

      {mode === 'presets' && presets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {presets
            .filter((p) => p && p.url && p.url.trim() !== '')
            .map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(preset.url.trim())}
                className="p-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] rounded text-left flex items-center gap-2 group transition-colors"
              >
                <img src={preset.url.trim()} alt={preset.name} className="w-8 h-8 rounded object-cover shrink-0" />
                <span className="text-[10px] text-[#aaaaaa] group-hover:text-white truncate">
                  {preset.name}
                </span>
              </button>
            ))}
        </div>
      )}

      {helperText && <p className="text-[10px] text-[#666666] font-sans">{helperText}</p>}
    </div>
  );
};

interface MultiImageUploaderProps {
  label?: string;
  helperText?: string;
  images: string[];
  onChange: (newImages: string[]) => void;
  aspectRatio?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  label = 'Galeria de Imagens',
  helperText,
  images = [],
  onChange,
  aspectRatio = 'aspect-[3/4]',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        let finalUrl = '';
        try {
          finalUrl = await uploadImageToSupabase(files[i], 'products');
        } catch {
          finalUrl = await optimizeImageFile(files[i]);
        }
        newUrls.push(finalUrl);
      }
      onChange([...images, ...newUrls]);
    } catch (err) {
      alert('Erro ao carregar uma ou mais imagens.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange(next);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const item = next.splice(index, 1)[0];
    next.unshift(item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-[#888888] uppercase text-[10px] font-sans tracking-wider font-semibold">
            {label} ({images.length} {images.length === 1 ? 'foto' : 'fotos'})
          </label>
          {helperText && <p className="text-[10px] text-[#666666] font-sans">{helperText}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-2.5 py-1 bg-white text-black hover:bg-neutral-200 text-[10px] font-bold tracking-wider uppercase rounded flex items-center gap-1 transition-colors"
          >
            <Upload className="w-3 h-3" />
            <span>{isUploading ? 'A carregar...' : '+ Upload Foto'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-2.5 py-1 bg-[#1a1a1a] hover:bg-[#252525] text-[#cccccc] hover:text-white border border-[#2a2a2a] text-[10px] font-medium tracking-wider uppercase rounded flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Colar URL</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        className="hidden"
      />

      {showUrlInput && (
        <div className="flex gap-2 p-2 bg-[#121212] border border-[#262626] rounded">
          <input
            type="text"
            placeholder="Cole o link direto da foto (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-[#181818] border border-[#333333] rounded text-white text-xs font-mono placeholder:text-[#555555]"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-neutral-200"
          >
            Adicionar
          </button>
        </div>
      )}

      {/* Grid of Images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <MultiImageCard
              key={`${idx}-${img}`}
              img={img}
              idx={idx}
              total={images.length}
              aspectRatio={aspectRatio}
              onSetPrimary={handleSetPrimary}
              onMove={handleMove}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#262626] hover:border-[#444444] rounded-lg p-6 text-center cursor-pointer transition-colors bg-[#0e0e0e]"
        >
          <ImageIcon className="w-7 h-7 text-[#555555] mx-auto mb-2" />
          <p className="text-xs font-medium text-white">Nenhuma imagem adicionada ainda</p>
          <p className="text-[10px] text-[#666666] mt-0.5">
            Clique para fazer upload de fotografias ou cole links diretos.
          </p>
        </div>
      )}
    </div>
  );
};

const MultiImageCard: React.FC<{
  img: string;
  idx: number;
  total: number;
  aspectRatio: string;
  onSetPrimary: (idx: number) => void;
  onMove: (idx: number, dir: 'up' | 'down') => void;
  onRemove: (idx: number) => void;
}> = ({ img, idx, total, aspectRatio, onSetPrimary, onMove, onRemove }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [img]);

  return (
    <div className="relative group bg-[#111111] border border-[#242424] rounded-md overflow-hidden flex flex-col justify-between">
      <div className={`relative w-full ${aspectRatio} bg-[#0c0c0c]`}>
        {hasError || !img || img.trim() === '' ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/40 border border-red-900/60 p-2 text-center text-red-300">
            <span className="text-[10px] font-mono font-bold leading-tight">[?] Link Quebrado</span>
            <span className="text-[8px] text-zinc-400 mt-0.5">Imagem parasita</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="mt-1.5 px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold rounded uppercase flex items-center gap-1 shadow"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Limpar</span>
            </button>
          </div>
        ) : (
          <img
            src={img.trim()}
            alt={`Foto ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        )}

        {/* Badge: Principal */}
        {idx === 0 && !hasError ? (
          <span className="absolute top-1.5 left-1.5 bg-white text-black text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded uppercase shadow z-10">
            CAPA
          </span>
        ) : !hasError ? (
          <button
            type="button"
            onClick={() => onSetPrimary(idx)}
            title="Definir como foto principal"
            className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-white hover:text-black text-[#888888] text-[9px] font-medium tracking-wider px-1.5 py-0.5 rounded uppercase opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            Tornar Capa
          </button>
        ) : null}

        {/* Action Controls Overlay */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMove(idx, 'up')}
            className="p-1 bg-black/80 hover:bg-white hover:text-black text-white rounded disabled:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Mover para a esquerda/cima"
          >
            <ArrowUp className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            disabled={idx === total - 1}
            onClick={() => onMove(idx, 'down')}
            className="p-1 bg-black/80 hover:bg-white hover:text-black text-white rounded disabled:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Mover para a direita/baixo"
          >
            <ArrowDown className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="p-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors shadow"
            title="Remover esta foto"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      <div className="p-1.5 bg-[#141414] border-t border-[#1f1f1f] text-[9px] text-[#777777] font-mono flex items-center justify-between">
        <span>Foto #{idx + 1}</span>
        {idx === 0 && !hasError && <span className="text-emerald-400 font-semibold">Principal</span>}
      </div>
    </div>
  );
};
