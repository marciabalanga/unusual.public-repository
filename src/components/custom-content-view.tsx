import React, { useEffect } from 'react';
import { ArrowLeft, ExternalLink, Instagram } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { scrollToTop } from '../lib/scroll';

interface CustomContentViewProps {
  slug: string;
  onBack: () => void;
}

export const CustomContentView: React.FC<CustomContentViewProps> = ({ slug, onBack }) => {
  const { customContents, settings } = useStore();

  useEffect(() => {
    scrollToTop(true);
  }, [slug]);

  const content = customContents.find(
    (c) => c.slug?.toLowerCase() === slug.toLowerCase() || c.id === slug
  ) || customContents[0];

  if (!content) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 font-mono text-sm uppercase">Conteúdo não encontrado.</p>
        <button
          onClick={onBack}
          className="mt-6 px-4 py-2 bg-white text-black font-mono text-xs uppercase font-bold rounded"
        >
          Voltar à Loja
        </button>
      </div>
    );
  }

  const models = content.items || [];
  const images = content.images || [];

  return (
    <div className="py-8 sm:py-16 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between border-b border-[#181818] pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Loja</span>
          </button>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-600">
            {settings.store_name || 'WEARING UNUSUAL'} • EDITORIAL
          </span>
        </div>

        {/* Hero / Header Section */}
        <div className="space-y-4 max-w-4xl">
          {content.subtitle && (
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400 block">
              {content.subtitle}
            </span>
          )}
          <h1 className="font-display uppercase text-3xl sm:text-5xl lg:text-6xl text-white tracking-wider font-extrabold leading-none">
            {content.title}
          </h1>
          {content.description && (
            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed pt-2 max-w-2xl">
              {content.description}
            </p>
          )}
        </div>

        {/* Models Grid (if items exist, e.g. for UNUSUAL MODELS portfolio) */}
        {models.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#181818] pb-3">
              <h2 className="font-display uppercase text-lg text-white tracking-wider">
                CASTING & PERFIS
              </h2>
              <span className="text-xs font-mono text-neutral-500">
                {models.length} {models.length === 1 ? 'REGISTO' : 'REGISTOS'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all duration-300 hover:border-neutral-700"
                >
                  <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden">
                    {model.image_url ? (
                      <img
                        src={model.image_url}
                        alt={model.name}
                        className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-xs uppercase">
                        Sem Foto
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      {model.role && (
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 block mb-0.5">
                          {model.role}
                        </span>
                      )}
                      <h3 className="font-display uppercase text-xl text-white tracking-wider">
                        {model.name}
                      </h3>
                    </div>
                  </div>

                  {(model.bio || model.instagram || model.social_link) && (
                    <div className="p-5 space-y-3 bg-[#0a0a0a]">
                      {model.bio && (
                        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                          {model.bio}
                        </p>
                      )}
                      {(model.instagram || model.social_link) && (
                        <div className="pt-3 border-t border-[#161616] flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-500">REDES</span>
                          <a
                            href={model.social_link || `https://instagram.com/${model.instagram?.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:underline flex items-center gap-1.5"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            <span>{model.instagram || 'Instagram'}</span>
                            <ExternalLink className="w-3 h-3 text-neutral-500" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {images.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between border-b border-[#181818] pb-3">
              <h2 className="font-display uppercase text-lg text-white tracking-wider">
                GALERIA EDITORIAL
              </h2>
              <span className="text-xs font-mono text-neutral-500">{images.length} FOTOS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-[4/5] bg-neutral-900 border border-[#1a1a1a] rounded overflow-hidden group"
                >
                  <img
                    src={img}
                    alt={`${content.title} - ${idx + 1}`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
