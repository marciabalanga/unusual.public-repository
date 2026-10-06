import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { WULogo } from '../wu-logo';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';
import { scrollToTop } from '../../lib/scroll';

interface AdminLoginProps {
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onCancel }) => {
  const { signIn } = useAuth();
  const { language, setLanguage } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEn = language === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(
        isEn
          ? 'Please enter your email and password.'
          : 'Por favor, introduza o seu e-mail e palavra-passe.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        isEn
          ? 'Password must be at least 6 characters.'
          : 'A palavra-passe deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        scrollToTop(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        msg ||
          (isEn
            ? 'An error occurred during authentication.'
            : 'Ocorreu um erro durante a autenticação.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f2f2f2] flex flex-col justify-center items-center px-4 py-12 selection:bg-white selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.03)_0%,transparent_60%)]" />

      <div className="relative w-full max-w-md bg-[#0b0b0b] border border-[#1e1e1e] p-8 sm:p-10 shadow-2xl rounded-sm">
        {/* Top Language selector */}
        <div className="flex justify-end mb-2">
          <div
            className="flex items-center rounded border border-[#2a2a2a] bg-[#111111] p-0.5 text-[10px] font-mono font-bold select-none"
            role="group"
            aria-label="Language selector"
          >
            <button
              type="button"
              onClick={() => setLanguage('pt')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                language === 'pt'
                  ? 'bg-white text-black shadow-sm font-extrabold'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              PT
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-black shadow-sm font-extrabold'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Top brand mark */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <WULogo size="lg" imgClassName="h-10 w-auto object-contain" />
          </div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#141414] border border-[#222222] rounded text-[10px] font-mono uppercase tracking-[0.25em] text-[#888888] mb-3">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>{isEn ? 'RESTRICTED AREA • SUPABASE AUTH' : 'ÁREA RESTRITA • SUPABASE AUTH'}</span>
          </div>
          <h1 className="text-xl font-display uppercase tracking-[0.15em] text-white">
            {isEn ? 'Admin Panel' : 'Painel de Administração'}
          </h1>
          <p className="text-xs text-[#777777] font-sans mt-1 leading-relaxed max-w-xs">
            {isEn
              ? 'Restricted access for the Wearing Unusual editorial & sales team.'
              : 'Acesso reservado à equipa editorial e de vendas da Wearing Unusual.'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800/80 rounded text-xs text-rose-200 flex items-start gap-2.5 leading-relaxed animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#999999] mb-2">
              {isEn ? 'Administrator Email' : 'E-mail de Administrador'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wearingunusual.com"
                className="w-full bg-[#121212] border border-[#262626] focus:border-white focus:outline-none pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#444444] rounded transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#999999] mb-2">
              {isEn ? 'Password' : 'Palavra-passe'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#121212] border border-[#262626] focus:border-white focus:outline-none pl-4 pr-10 py-2.5 text-xs text-white placeholder:text-[#444444] rounded transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                tabIndex={-1}
                aria-label={
                  showPassword
                    ? isEn
                      ? 'Hide password'
                      : 'Ocultar palavra-passe'
                    : isEn
                    ? 'Show password'
                    : 'Mostrar palavra-passe'
                }
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-white hover:bg-[#e5e5e5] text-black font-semibold text-xs tracking-wider uppercase rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-block animate-pulse">
                {isEn ? 'Verifying credentials...' : 'A verificar credenciais...'}
              </span>
            ) : (
              isEn ? 'Enter Panel' : 'Aceder ao Painel'
            )}
          </button>
        </form>

        {/* Back to Public Store button */}
        <div className="mt-8 pt-6 border-t border-[#181818] text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-xs text-[#777777] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? 'Return to Public Store' : 'Voltar à Loja Pública'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
