import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Sliders,
  Loader2,
  ArrowRight,
  Globe,
  Tag,
  Coffee,
  Shirt,
  Sun,
  Layers,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface TopicSearchFormProps {
  onSearch: (topic: string, domain: string, depth: string) => void;
  isLoading: boolean;
  currentTopic: string;
}

const PRESET_CARDS = [
  {
    category: 'E-commerce',
    label: 'Café Especial e Gourmet',
    domain: 'ecommerce',
    desc: 'Torra, pontuação SCA, métodos de extração, moagem e origens.',
    icon: Coffee,
  },
  {
    category: 'Varejo & Vestuário',
    label: 'Moda Feminina Sustentável',
    domain: 'ecommerce',
    desc: 'Materiais orgânicos, modelagens, ocasiões de uso e certificações.',
    icon: Shirt,
  },
  {
    category: 'Energia & Tecnologia',
    label: 'Energia Solar Fotovoltaica',
    domain: 'seo_content',
    desc: 'Painéis monocristalinos, inversores, baterias e eficiência.',
    icon: Sun,
  },
  {
    category: 'Software & B2B',
    label: 'SaaS de Gestão e CRM',
    domain: 'saas',
    desc: 'Pipelines de vendas, automações, integrações e planos.',
    icon: Layers,
  },
];

export const TopicSearchForm: React.FC<TopicSearchFormProps> = ({
  onSearch,
  isLoading,
  currentTopic,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'single' | 'advanced'>('single');
  const [topic, setTopic] = useState(currentTopic || '');
  const [domain, setDomain] = useState('ecommerce');
  const [language, setLanguage] = useState('pt-BR');
  const [depth, setDepth] = useState('standard');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onSearch(topic.trim(), domain, depth);
  };

  const handleSelectPreset = (presetTopic: string, presetDomain: string) => {
    setTopic(presetTopic);
    setDomain(presetDomain);
    onSearch(presetTopic, presetDomain, depth);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left Column: Primary Input & Presets */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Input Method Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveInputTab('single')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeInputTab === 'single'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Digitar Tópico / Palavra-Chave</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab('advanced')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeInputTab === 'advanced'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Inserir Tema Composto ou Nicho</span>
          </button>
        </div>

        {/* Dashed Input Container (Matching screenshot) */}
        <form onSubmit={handleSubmit}>
          <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/10 rounded-2xl p-6 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="input-topic" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Tema ou Produto Central para Taxonomia</span>
              </label>
              <span className="text-[11px] text-slate-400">Gemini 3 Flash • Raciocínio Semântico</span>
            </div>

            <div className="relative">
              <input
                id="input-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  activeInputTab === 'single'
                    ? 'Ex: Café Especial, Tênis de Corrida, Vinho Tinto, Moda Feminina...'
                    : 'Ex: Catálogo de Móveis de Escritório Ergonômicos para Home Office...'
                }
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-base font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="absolute right-2 top-2 p-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 transition-all cursor-pointer"
                title="Executar geração"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>
                Pressione <strong>Enter</strong> ou clique no botão lateral para construir a hierarquia e as facetas ortogonais.
              </span>
            </p>
          </div>
        </form>

        {/* Presets Header & 4 Cards (Matching screenshot) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ou teste com exemplos pré-selecionados (1 clique para carregar)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => handleSelectPreset(card.label, card.domain)}
                  disabled={isLoading}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/20 text-left transition-all shadow-2xs group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                      {card.category}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {card.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {card.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Parameters Sidebar (Matching screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Parâmetros da Taxonomia</h3>
            <p className="text-[11px] text-slate-500">Configurações de saída e semântica</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Output Language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Idioma de Saída
            </label>
            <div className="relative">
              <select
                id="select-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                <option value="en">🇺🇸 Inglês (English)</option>
                <option value="es">🇪🇸 Espanhol (Español)</option>
              </select>
            </div>
          </div>

          {/* Domain / Context */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Contexto / Domínio
            </label>
            <select
              id="select-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ecommerce">E-commerce & Catálogo de Produtos</option>
              <option value="seo_content">SEO Semântico & Clusters de Conteúdo</option>
              <option value="saas">SaaS, B2B & Software</option>
              <option value="general">Arquitetura da Informação & Geral</option>
            </select>
          </div>

          {/* Depth Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Profundidade da Taxonomia
            </label>
            <select
              id="select-depth"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="standard">Padrão Refinado (3 Níveis Hierárquicos)</option>
              <option value="deep">Exaustivo (4 Níveis + Microfacetas)</option>
            </select>
          </div>
        </div>

        {/* Action / Execution Card */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              EXECUÇÃO DA TAXONOMIA
            </span>
            <p className="text-xs text-slate-600 leading-snug">
              Clique abaixo para ativar o processamento com Gemini 3 Flash e construir a árvore e os filtros.
            </p>
          </div>

          <button
            id="btn-execute-taxonomy"
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading || !topic.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Gerando Taxonomia e Facetas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Taxonomia e Facetas -&gt;</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
