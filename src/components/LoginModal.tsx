import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Key, 
  ArrowRight, 
  User, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle, SUPER_ADMIN_EMAIL } from '../lib/firebase';
import { SemanticoLogo } from './SemanticoLogo';

export interface AuthModalProps {
  isOpen?: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const copyDomain = () => {
    if (navigator.clipboard && currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setErrorCode(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const code = err.code || '';
      setErrorCode(code);

      if (code === 'auth/popup-closed-by-user') {
        setError(
          currentHost && currentHost !== 'localhost'
            ? `A janela do Google foi fechada antes de concluir. No domínio publicado (${currentHost}), certifique-se de que o domínio "${currentHost}" foi adicionado aos "Domínios Autorizados" no Firebase Console. Para entrar agora sem depender dessa configuração, utilize o formulário de E-mail e Senha abaixo.`
            : 'A janela de autenticação do Google foi fechada antes de concluir. Tente novamente ou entre com e-mail e senha abaixo.'
        );
      } else if (code === 'auth/popup-blocked') {
        setError('O navegador bloqueou o popup do Google. Permita popups para este site ou utilize o login por E-mail e Senha.');
      } else if (code === 'auth/unauthorized-domain') {
        setError(
          `O domínio "${currentHost}" não está nos domínios autorizados do Firebase Console (Authentication > Configurações > Domínios Autorizados).`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setError('O provedor de login do Google não está ativado no Firebase Console (Authentication > Sign-in method).');
      } else {
        setError(`Não foi possível autenticar com o Google (${code || 'erro'}): ${err.message || 'Tente novamente ou use e-mail e senha.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);

    if (!email || !email.includes('@')) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Auth Error:', err);
      const code = err.code || '';
      setErrorCode(code);

      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        if (mode === 'login' && email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          setError(
            'E-mail ou senha incorretos. Se você ainda não definiu sua senha para este e-mail, clique na aba "Criar Conta" acima para registrar sua senha de acesso!'
          );
        } else {
          setError('E-mail ou senha incorretos. Se ainda não possui cadastro, alterne para a aba "Criar Conta".');
        }
      } else if (code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado! Alterne para a aba "Fazer Login" e informe sua senha.');
      } else if (code === 'auth/weak-password') {
        setError('A senha informada é fraca. Crie uma senha com letras e números (mínimo 6 caracteres).');
      } else if (code === 'auth/invalid-email') {
        setError('O endereço de e-mail é inválido.');
      } else {
        setError(err.message || 'Erro ao processar autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillSuperAdminEmail = () => {
    setEmail(SUPER_ADMIN_EMAIL);
    if (mode === 'register') {
      setName('Alex Rodrigues');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <SemanticoLogo className="h-6 w-auto brightness-0 invert" />
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold border-l border-white/20 pl-2">
              Autenticação
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Fazer Login' : 'Criar Conta'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Acesse para gerar taxonomias, facetas e silos semânticos.'
              : 'Cadastre-se para solicitar acesso às ferramentas avançadas.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-800/90 rounded-lg p-1 mt-4 border border-slate-700/50">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setErrorCode(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Fazer Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setErrorCode(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>

              {/* Action buttons depending on error type */}
              <div className="pt-2 border-t border-red-200/60 flex flex-wrap gap-2 text-[11px]">
                {isInIframe && (
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir em Nova Aba
                  </a>
                )}

                {currentHost && (errorCode === 'auth/unauthorized-domain' || errorCode === 'auth/popup-closed-by-user') && (
                  <>
                    <button
                      type="button"
                      onClick={copyDomain}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-red-300 hover:bg-red-50 text-red-800 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedDomain ? 'Domínio Copiado!' : `Copiar Domínio (${currentHost})`}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        fillSuperAdminEmail();
                        setError(null);
                        setErrorCode(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Entrar com E-mail e Senha
                    </button>
                  </>
                )}

                {mode === 'login' && (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') && (
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Cadastrar Minha Senha Agora
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Google Button 1-Click */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-semibold text-xs shadow-xs transition-all hover:border-slate-400 disabled:opacity-60 mb-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
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
            )}
            <span>Entrar com Google 1-Click</span>
          </button>

          {/* Helper hint for iframe environment */}
          {isInIframe && (
            <p className="text-[10px] text-slate-400 text-center mb-3">
              💡 No preview embutido, se o popup do Google fechar, use o formulário de e-mail/senha abaixo ou abra em nova aba.
            </p>
          )}

          <div className="relative flex items-center justify-center my-3.5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              ou com e-mail e senha
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  E-mail
                </label>
                <button
                  type="button"
                  onClick={fillSuperAdminEmail}
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-medium hover:underline inline-flex items-center gap-1"
                  title="Preencher Alex Rodrigues"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Super Admin
                </button>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@semantico.com.br"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no Sistema' : 'Criar Conta / Solicitar Acesso'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice for Super Admin */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed text-center">
            Super Admin <strong className="text-slate-700">{SUPER_ADMIN_EMAIL}</strong> possui reconhecimento automático com acesso vitalício ilimitado.
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuthModal = LoginModal;
