import React from 'react';
import { X, AlertTriangle, CheckCircle, Cpu, Zap, ArrowRight } from 'lucide-react';

export type InfoModalType = 'problem' | 'benefits' | 'how-it-works' | null;

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
  onNewTaxonomy?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose, onNewTaxonomy }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {type === 'problem' && (
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            {type === 'benefits' && (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
            {type === 'how-it-works' && (
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {type === 'problem' && 'O Problema: Por que a Taxonomia Falha?'}
                {type === 'benefits' && 'Benefícios: A Vantagem Semântica'}
                {type === 'how-it-works' && 'Como Funciona: Arquitetura & Gemini 3 Flash'}
              </h3>
              <p className="text-xs text-slate-500">
                Semântico • Metodologia de Arquitetura da Informação e SEO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed">
          {type === 'problem' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900">
                <p className="font-semibold mb-1">O caos das árvores de categorias tradicionais</p>
                <p className="text-xs text-amber-800">
                  Mais de 80% dos e-commerces e portais de conteúdo perdem até 40% do tráfego orgânico por canibalização de palavras-chave e navegações facetadas que geram URLs infinitas duplicadas.
                </p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-slate-900 font-semibold">Filtros Sem Propósito Semântico:</strong> Atributos aleatórios geram milhares de páginas vazias ou com conteúdo duplicado nos motores de busca.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-slate-900 font-semibold">Estrutura Rasa ou Fragmentada:</strong> Categorias genéricas que não acompanham a intenção real de busca do usuário (navegacional vs. transacional).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-slate-900 font-semibold">Orçamento de Rastreamento (Crawl Budget) Desperdiçado:</strong> Bots do Google se perdem em combinações de facetas desnecessárias sem canônicas corretas.
                  </div>
                </li>
              </ul>
            </div>
          )}

          {type === 'benefits' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
                <p className="font-semibold mb-1">Autoridade Temática e Conversão Superior</p>
                <p className="text-xs text-emerald-800">
                  Ao unificar taxonomia hierárquica e facetas ortogonais, seu site ganha relevância contextual máxima tanto para usuários quanto para os algoritmos de busca.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    SEO Semântico Estruturado
                  </div>
                  <p className="text-xs text-slate-600">
                    Definição clara de termos mais amplos (broader) e específicos (narrower), topic clusters e dados estruturados Schema.org.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Navegação Facetada Eficiente
                  </div>
                  <p className="text-xs text-slate-600">
                    Facetas com regras claras de indexação (canônicas automáticas), permitindo ao visitante encontrar o produto em menos de 3 cliques.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-sky-500" />
                    Interoperabilidade SKOS
                  </div>
                  <p className="text-xs text-slate-600">
                    Exportação de padrões semânticos internacionais (SKOS, CSV de relações, JSON e Markdown) compatíveis com qualquer CMS ou PIM.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Intenção de Busca Decodificada
                  </div>
                  <p className="text-xs text-slate-600">
                    Mapeamento automático entre consultas transacionais, informacionais e clusters de conteúdo recomendados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {type === 'how-it-works' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 text-sky-900">
                <p className="font-semibold mb-1">Pipeline de Inteligência Semântica com Gemini 3 Flash</p>
                <p className="text-xs text-sky-800">
                  Combinamos a ciência de Arquitetura da Informação com os modelos de raciocínio avançado do Google Gemini para mapear o conhecimento de qualquer nicho.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Entrada do Domínio ou Tópico</h4>
                    <p className="text-xs text-slate-600">
                      Você fornece o termo raiz (ex: "Café Especial" ou "Moda Feminina Sustentável") e define o contexto de aplicação (E-commerce, SEO ou SaaS).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Inferência Estruturada e Taxonomia SKOS</h4>
                    <p className="text-xs text-slate-600">
                      O Gemini 3 Flash decompõe a árvore semântica em categorias amplas, subcategorias exclusivas, entidades relacionadas e intenções de busca.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Engenharia de Facetas & Simulação de Catálogo</h4>
                    <p className="text-xs text-slate-600">
                      O sistema gera atributos multidimensionais ortogonais e cria um catálogo simulado interativo para você testar a experiência do usuário em tempo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Semântico Consultoria SEO & Arquitetura
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              Fechar
            </button>
            {onNewTaxonomy && (
              <button
                onClick={() => {
                  onClose();
                  onNewTaxonomy();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Criar Taxonomia</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
