import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export interface WULogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  imgClassName?: string;
  alt?: string;
  src?: string;
}

export const WULogo: React.FC<WULogoProps> = ({
  size = 'md',
  className = '',
  imgClassName = '',
  alt,
  src,
}) => {
  const { settings } = useStore();
  const [imgError, setImgError] = useState(false);

  // Reset imgError whenever the configured logo URL changes
  useEffect(() => {
    setImgError(false);
  }, [settings.site_logo_url, settings.logo_url, src]);

  // Read dynamically from prop -> global Supabase settings -> localStorage cache -> /logo.png
  const cachedLogo = typeof window !== 'undefined' ? localStorage.getItem('wu_brand_logo_url') : null;
  const sanitize = (val?: string | null) => (val && typeof val === 'string' && val.trim() !== '' ? val.trim() : null);
  const activeSrc =
    sanitize(src) ||
    (imgError
      ? '/logo.png'
      : sanitize(settings.site_logo_url) ||
        sanitize(settings.logo_url) ||
        sanitize(cachedLogo !== '/logo.png' ? cachedLogo : null) ||
        '/logo.png');

  // Strict editorial responsive sizing with aspect-ratio preservation
  const sizeClasses: Record<string, string> = {
    xs: 'h-4 max-h-4',
    sm: 'h-6 max-h-6 sm:h-7 sm:max-h-7',
    md: 'h-6 sm:h-8 md:h-10 max-h-6 sm:max-h-8 md:max-h-10',
    lg: 'h-10 max-h-10 sm:h-12 sm:max-h-12',
    xl: 'h-14 max-h-14 sm:h-16 sm:max-h-16',
    '2xl': 'h-20 max-h-20 sm:h-24 sm:max-h-24',
    hero: 'h-20 sm:h-28 md:h-36 max-h-36',
  };

  const chosenSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      title={settings.store_name || 'Wearing Unusual'}
    >
      {/* Real image element reading dynamically from global Supabase settings */}
      <img
        src={activeSrc}
        alt={alt || settings.store_name || 'Wearing Unusual'}
        className={`w-auto object-contain transition-opacity duration-200 ${chosenSize} ${imgClassName}`}
        onError={() => {
          if (!imgError) {
            setImgError(true);
          }
        }}
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};

