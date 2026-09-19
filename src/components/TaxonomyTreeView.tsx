import React, { useState } from 'react';
import {
  FolderTree,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Tag,
  Link2,
} from 'lucide-react';
import { TaxonomyData } from '../types';

interface TaxonomyTreeViewProps {
  taxonomy: TaxonomyData;
  onDrillDown: (nodeName: string, nodeType: 'subcategory' | 'topic') => void;
}

export const TaxonomyTreeView: React.FC<TaxonomyTreeViewProps> = ({
  taxonomy,
  onDrillDown,
}) => {
  const [collapsedSubs, setCollapsedSubs] = useState<Record<string, boolean>>({});
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const toggleSubcategory = (name: string) => {
    setCollapsedSubs((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredSubcategories = (taxonomy.subcategories || []).filter((sub) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const matchName = sub.name.toLowerCase().includes(q);
    const matchTopics = sub.topics?.some((t) => t.toLowerCase().includes(q));
    return matchName || matchTopics;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header with Breadcrumb & Quick Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Taxonomia Hierárquica Semântica
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Estrutura baseada em SKOS (Termos Mais Amplos, Específicos e Associações)
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            id="input-filter-tree"
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar ramos e tópicos..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Broader Category -> Root Topic Banner */}
      <div className="relative pl-4 sm:pl-6 border-l-2 border-amber-400 space-y-3">
        {/* Broader category */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            Categoria Pai (Broader Term)
          </span>
          <span className="text-sm font-bold text-slate-800">
            {taxonomy.broader_category || 'Geral'}
          </span>
        </div>

        {/* Down indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
          <span>⬇️ Subordinação Hierárquica</span>
        </div>

        {/* Root Topic Node */}
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">
                  Tópico Raiz Principal
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-mono font-semibold">
                  Nível 1
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {taxonomy.root_topic}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => handleCopy(taxonomy.root_topic)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Copiar nome do tópico"
            >
              {copiedText === taxonomy.root_topic ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Tópico</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subcategories (Narrower Terms) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <span>⬇️ Subcategorias (Narrower Terms)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold">
              {filteredSubcategories.length} ramos
            </span>
          </h4>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={() => setCollapsedSubs({})}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Expandir todos
            </button>
            <span>•</span>
            <button
              onClick={() => {
                const all: Record<string, boolean> = {};
                (taxonomy.subcategories || []).forEach((s) => (all[s.name] = true));
                setCollapsedSubs(all);
              }}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Recolher todos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubcategories.map((sub, idx) => {
            const isCollapsed = Boolean(collapsedSubs[sub.name]);

            return (
              <div
                key={sub.name || idx}
                className="bg-slate-50/50 border border-slate-200 hover:border-amber-400/80 rounded-2xl overflow-hidden transition-all shadow-2xs flex flex-col"
              >
                {/* Subcategory Card Header */}
                <div
                  className="p-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => toggleSubcategory(sub.name)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button className="text-slate-400 hover:text-slate-800 transition-colors">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {sub.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono font-bold">
                          {sub.topics?.length || 0}
                        </span>
                      </div>
                      {sub.description && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {sub.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDown(sub.name, 'subcategory');
                    }}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all font-semibold whitespace-nowrap active:scale-95 cursor-pointer ml-2"
                    title="Aprofundar neste ramo com Gemini"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Detalhar ⚡</span>
                  </button>
                </div>

                {/* Subcategory Topics */}
                {!isCollapsed && (
                  <div className="p-3.5 space-y-2 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {(sub.topics || []).map((topicItem, tIdx) => (
                        <div
                          key={topicItem || tIdx}
                          className="group relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-xs text-slate-700 hover:text-slate-950 transition-all shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                          <span className="font-medium">{topicItem}</span>
                          <button
                            onClick={() => onDrillDown(topicItem, 'topic')}
                            className="opacity-0 group-hover:opacity-100 text-amber-600 hover:text-amber-700 ml-1 transition-opacity cursor-pointer"
                            title={`Detalhar "${topicItem}" com Gemini`}
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Related Entities (Associative Relations) */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-sky-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            🔗 Entidades Relacionadas (Associação Semântica)
          </h4>
        </div>
        <p className="text-xs text-slate-500">
          Conceitos correlatos, ferramentas, insumos e termos do ecossistema temático:
        </p>

        <div className="flex flex-wrap gap-2">
          {(taxonomy.related_entities || []).map((entity, idx) => (
            <span
              key={entity || idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold hover:bg-sky-100 transition-colors shadow-2xs"
            >
              <Tag className="w-3 h-3 text-sky-600" />
              <span>{entity}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
