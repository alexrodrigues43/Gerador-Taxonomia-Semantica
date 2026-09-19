import React, { useEffect } from 'react';
import { 
  X, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  MessageCircle, 
  LogOut,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types';
import { SemanticoLogo } from './SemanticoLogo';
import { loginWithGoogle, logoutUser } from '../lib/authService';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenLogin: (mode?: 'login' | 'register') => void;
  actionName?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenLogin,
  actionName = 'executar esta ação',
}) => {
  // Real-time automatic close: if the user's status becomes active (approved by admin), automatically close
  useEffect(() => {
    if (isOpen && user && user.status === 'active') {
      const timer = setTimeout(() => {
        onClose();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user, onClose]);

  if (!isOpen) return null;

  const handleGoogleQuickLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Erro no login com Google:', err);
    }
  };

  const supportWhatsappUrl = user 
    ? `https://wa.me/5511999999999?text=${encodeURIComponent(
        `Olá! Acabei de me cadastrar no Gerador de Taxonomia da Semântico com o e-mail ${user.email} e gostaria da liberação imediata do meu acesso.`
      )}`
    : `https://wa.me/5511999999999?text=${encodeURIComponent(
        `Olá! Gostaria de saber mais sobre a assinatura do Gerador de Taxonomia da Semântico.`
      )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Header Pattern */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <SemanticoLogo className="h-6 w-auto brightness-0 invert" />
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold border-l border-white/20 pl-2">
              Acesso Exclusivo
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            {user ? (
              user.status === 'pending' ? 'Aprovação de Acesso em Andamento' :
              user.status === 'blocked' ? 'Acesso Bloqueado' :
              user.status === 'expired' ? 'Assinatura Expirada' : 'Acesso Requerido'
            ) : (
              'Desbloqueie Todo o Poder da Semântico'
            )}
          </h2>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {user ? (
              user.status === 'pending' ? 'Sua solicitação de acesso está aguardando liberação do administrador.' :
              user.status === 'blocked' ? 'Sua conta está temporariamente suspensa.' :
              'Para continuar utilizando o gerador de taxonomia, ative sua assinatura.'
            ) : (
              `Para ${actionName}, faça login ou crie sua conta na plataforma Semântico.`
            )}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* CASE 1: USER IS NOT AUTHENTICATED */}
          {!user && (
            <div className="space-y-5">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Recursos Completos Inclusos
                    </h3>
                    <ul className="text-xs text-amber-800/90 mt-1.5 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Geração completa de taxonomias com IA Semântica
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Simulador de facetas de e-commerce e catálogo
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Grafos semânticos interativos com drill-down
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Exportação completa em CSV e JSON
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleGoogleQuickLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm shadow-xs transition-all hover:border-slate-400"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar com Google</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onOpenLogin('login')}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs text-center transition-colors"
                  >
                    Entrar com E-mail
                  </button>
                  <button
                    onClick={() => onOpenLogin('register')}
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-semibold text-xs text-center transition-colors"
                  >
                    Criar Nova Conta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 2: LOGGED IN WITH STATUS 'PENDING' */}
          {user && user.status === 'pending' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-900">Status da Conta:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 animate-pulse">
                    <Clock className="w-3 h-3" />
                    Aguardando Aprovação
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Olá, <strong>{user.displayName || user.email}</strong>! Seu cadastro foi recebido com sucesso. Novos acessos passam por uma validação rápida da equipe Semântico.
                </p>
              </div>

              {/* Real-time notice */}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-bounce" />
                <span>
                  <strong>Desbloqueio em tempo real:</strong> assim que aprovado pelo administrador, esta tela fechará sozinha sem necessidade de recarregar a página.
                </span>
              </div>

              {/* WhatsApp Support Button */}
              <a
                href={supportWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-colors group"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Solicitar Liberação Imediata no WhatsApp</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">Logado como {user.email}</span>
                <button
                  onClick={() => logoutUser()}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sair da conta
                </button>
              </div>
            </div>
          )}

          {/* CASE 3: LOGGED IN WITH STATUS 'BLOCKED' */}
          {user && user.status === 'blocked' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Acesso Temporariamente Suspenso
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  O acesso para o e-mail <strong>{user.email}</strong> foi suspenso pela administração. Se acredita que isto é um engano, entre em contato conosco.
                </p>
              </div>

              <a
                href={supportWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com o Suporte
              </a>

              <div className="text-center pt-2">
                <button
                  onClick={() => logoutUser()}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Fazer login com outro usuário
                </button>
              </div>
            </div>
          )}

          {/* CASE 4: LOGGED IN WITH STATUS 'EXPIRED' */}
          {user && user.status === 'expired' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Plano Expirado
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Seu período de acesso ({user.plan}) encerrou. Renove sua assinatura para continuar gerando taxonomias semânticas.
                </p>
              </div>

              <a
                href={supportWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-semibold text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Renovar Assinatura no WhatsApp
              </a>

              <div className="text-center pt-2">
                <button
                  onClick={() => logoutUser()}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
