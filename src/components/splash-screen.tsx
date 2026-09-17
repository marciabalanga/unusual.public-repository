import React, { useEffect, useState } from 'react';
import { WULogo } from './wu-logo';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2400,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Start exit transition after durationMs
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs]);

  useEffect(() => {
    if (isExiting) {
      // Allow 1.5s fade-exit transition to complete before removing from DOM
      const exitTimer = setTimeout(() => {
        setIsRendered(false);
        onComplete();
      }, 1500);

      return () => clearTimeout(exitTimer);
    }
  }, [isExiting, onComplete]);

  const handleSkip = () => {
    if (!isExiting) {
      setIsExiting(true);
    }
  };

  if (!isRendered) return null;

  return (
    <div
      id="splash-screen"
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-pointer select-none transition-opacity duration-[1500ms] ${
        isExiting ? 'fade-exit' : 'opacity-100'
      }`}
      aria-label="Wearing Unusual Splash Screen"
    >
      <div className="flex flex-col items-center text-center space-y-8 animate-[fadeIn_1.5s_ease-in-out]">
        {/* Exact Gothic WU Logo Mark */}
        <div className="px-6 py-4 flex items-center justify-center">
          <WULogo
            size="hero"
            imgClassName="h-24 sm:h-32 md:h-36 max-h-36 max-w-[80vw] w-auto object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.12)]"
          />
        </div>

        {/* Brand Identity & Official Slogan */}
        <div className="space-y-3 pt-1 text-center max-w-lg px-4">
          <h1 className="text-xs sm:text-sm font-sans tracking-[0.45em] sm:tracking-[0.5em] uppercase text-neutral-200 font-light pl-[0.45em]">
            WEARING UNUSUAL
          </h1>
          <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] sm:tracking-[0.3em] uppercase text-neutral-500 font-normal pl-[0.25em] leading-relaxed">
            INSPIRED BY THE FEAR OF BEING AVERAGE
          </p>
        </div>
      </div>
    </div>
  );
};
