import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  Clock,
  Plus,
  Download,
  ShieldCheck,
  User,
  LogOut,
  FolderTree,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { SemanticoLogo } from './SemanticoLogo';
import { UserProfile } from '../types';
import { InfoModalType } from './InfoModal';
import { logoutUser } from '../lib/authService';

interface HeaderProps {
  user: UserProfile | null;
  activeTopic: string;
  historyCount: number;
  onOpenExport: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onOpenLogin: (mode?: 'login' | 'register') => void;
  onOpenInfoModal: (type: InfoModalType) => void;
  onNewTaxonomy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTopic,
  historyCount,
  onOpenExport,
  onOpenHistory,
  onOpenAdmin,
  onOpenLogin,
  onOpenInfoModal,
  onNewTaxonomy,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.role === 'admin';
  const avatarLetter = user ? (user.displayName || user.email || 'U')[0].toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <a href="https://semantico.com.br" target="_blank" rel="noopener noreferrer">
              <SemanticoLogo height={34} />
            </a>

            {/* Main Menu Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
              <a
                href="https://semantico.com.br/#servicos"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 transition-colors"
              >
                Serviços
              </a>
              <a
                href="https://semantico.com.br/#ferramentas"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 transition-colors flex items-center gap-1"
              >
                <span>Ferramentas</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              </a>
              <a
                href="https://semantico.com.br/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 transition-colors"
              >
                Blog
              </a>
              <a
                href="https://semantico.com.br/podcast"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 transition-colors"
              >
                Podcasts
              </a>
              <a
                href="https://semantico.com.br/contato"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 transition-colors"
              >
                Contato
              </a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg select-none">
              <span>🇧🇷</span>
              <span>PT</span>
            </div>

            {/* Discreet Admin Button - Strictly visible when user is admin */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer select-none"
                title="Acessar Painel de Assinaturas e Usuários"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </button>
            )}

            {/* User Profile or Login Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {avatarLetter}
                    </div>
                    {/* Status Dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        user.status === 'active'
                          ? 'bg-emerald-500'
                          : user.status === 'pending'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>

                  <div className="hidden sm:block text-left text-xs">
                    <div className="font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                      {(user.displayName || user.email).split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {user.role === 'admin'
                        ? 'Admin'
                        : user.status === 'active'
                        ? 'Ativo'
                        : user.status === 'pending'
                        ? 'Pendente'
                        : 'Bloqueado'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">
                        {user.displayName || 'Usuário Semântico'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                          Plano: {user.plan.toUpperCase()}
                        </span>
                        {user.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ✓ Ativo
                          </span>
                        ) : user.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold animate-pulse">
                            ⏳ Aguardando Aprovação
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          <span>Painel Administrativo</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenHistory();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Histórico de Taxonomias ({historyCount})</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logoutUser();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLogin('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
                <button
                  onClick={() => onOpenLogin('register')}
                  className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-header / Secondary Navigation Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left sub-nav links */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onOpenInfoModal('problem')}
              className="hover:text-slate-950 transition-colors px-2 py-1 rounded-md hover:bg-white cursor-pointer"
            >
              O Problema
            </button>

            {/* Active app pill */}
            <div className="bg-white border border-slate-300 shadow-xs px-3 py-1.5 rounded-lg text-slate-900 font-bold flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-amber-500" />
              <span>Gerador de Taxonomia e Facetas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            </div>

            <button
              onClick={() => onOpenInfoModal('benefits')}
              className="hover:text-slate-950 transition-colors px-2 py-1 rounded-md hover:bg-white cursor-pointer"
            >
              Benefícios
            </button>

            <button
              onClick={() => onOpenInfoModal('how-it-works')}
              className="hover:text-slate-950 transition-colors px-2 py-1 rounded-md hover:bg-white cursor-pointer"
            >
              Como Funciona
            </button>

            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* History Button Pill */}
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-amber-400 transition-all shadow-2xs cursor-pointer"
            >
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Histórico</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                {historyCount}
              </span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {activeTopic && (
              <button
                onClick={onOpenExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            )}

            <button
              onClick={onNewTaxonomy}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Taxonomia</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
