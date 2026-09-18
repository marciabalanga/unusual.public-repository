import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch((err) => {
      console.warn('[Supabase Auth] Erro ao recuperar sessão:', err);
      setIsLoading(false);
    });

    // 2. Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let friendlyMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Credenciais inválidas. Verifique o seu e-mail e palavra-passe.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'E-mail não confirmado. Verifique a sua caixa de entrada no Supabase.';
        }
        return { error: friendlyMessage };
      }

      setSession(data.session);
      setUser(data.user);
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: msg || 'Ocorreu um erro ao tentar iniciar sessão.' };
    }
  };

  // Registration of new administrators is strictly disabled on client-side.
  // Admins must be provisioned directly via Supabase Console.
  const signUp = async (
    _email: string,
    _password: string
  ): Promise<{ error?: string; message?: string }> => {
    return {
      error:
        'A criação de novas contas de administrador está desativada na aplicação. Contacte a administração da Wearing Unusual.',
    };
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[Supabase Auth] Erro ao terminar sessão:', e);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
