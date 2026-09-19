import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 text-sm text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Name */}
        <div className="flex items-center gap-2 font-medium text-slate-800">
          <span className="font-bold text-slate-900">Semântico</span>
          <span className="text-slate-400">•</span>
          <span>Gerador de Taxonomia e Facetas</span>
        </div>

        {/* Links requested by the user */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <a
            href="https://semantico.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-amber-600 font-medium transition-colors inline-flex items-center gap-1"
          >
            <span>Consultoria Semântico SEO</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href="https://semantico.com.br/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-amber-600 font-medium transition-colors inline-flex items-center gap-1"
          >
            <span>Blog</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href="https://semantico.com.br/contato"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-amber-600 font-medium transition-colors inline-flex items-center gap-1"
          >
            <span>Fale com um Especialista</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </footer>
  );
};
