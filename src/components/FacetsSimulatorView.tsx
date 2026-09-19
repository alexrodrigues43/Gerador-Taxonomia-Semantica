import React, { useState, useMemo } from 'react';
import {
  Filter,
  RotateCcw,
  Globe,
  Check,
  ShoppingBag,
  Info,
  Search,
} from 'lucide-react';
import { FacetsData } from '../types';

interface FacetsSimulatorViewProps {
  facetsData: FacetsData;
  rootTopic: string;
}

export const FacetsSimulatorView: React.FC<FacetsSimulatorViewProps> = ({
  facetsData,
  rootTopic,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleOption = (attributeName: string, option: string) => {
    setSelectedFilters((prev) => {
      const current = prev[attributeName] || [];
      const exists = current.includes(option);
      let updated: string[];
      if (exists) {
        updated = current.filter((o) => o !== option);
      } else {
        updated = [...current, option];
      }

      const next = { ...prev };
      if (updated.length === 0) {
        delete next[attributeName];
      } else {
        next[attributeName] = updated;
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchQuery('');
  };

  const totalActiveFilters = Object.values(selectedFilters).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  // Compute canonical URL preview
  const simulatedUrl = useMemo(() => {
    const baseSlug = (facetsData.topic || rootTopic || 'catalogo')
      .toLowerCase()
      .replace(/\s+/g, '-');
    const params = new URLSearchParams();

    Object.entries(selectedFilters).forEach(([attr, opts]) => {
      const key = attr
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_');
      params.set(key, opts.map((o) => o.toLowerCase().replace(/\s+/g, '-')).join(','));
    });

    const queryString = params.toString();
    return `https://seusite.com/categoria/${baseSlug}${queryString ? `?${queryString}` : ''}`;
  }, [facetsData.topic, rootTopic, selectedFilters]);

  // Filter the simulated items
  const filteredProducts = useMemo(() => {
    const items = facetsData.catalog_simulation || [];
    return items.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSub = item.subcategory?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub) return false;
      }

      for (const [attrName, selectedOpts] of Object.entries(selectedFilters)) {
        if (selectedOpts.length === 0) continue;
        const itemVal = item.attributes?.[attrName];
        if (!itemVal) continue;
        const matches = selectedOpts.some((opt) =>
          itemVal.toLowerCase().includes(opt.toLowerCase())
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [facetsData.catalog_simulation, selectedFilters, searchQuery]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Facetas & Simulador de Navegação E-commerce
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Teste interativo dos atributos gerados pelo Gemini: veja o catálogo reagir aos filtros em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          {totalActiveFilters > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 transition-all font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Limpar Filtros ({totalActiveFilters})</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="text-slate-500">Intenções:</span>
            <span className="font-bold text-amber-700">
              {(facetsData.intent || []).join(', ') || 'Transacional'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Canonical URL bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-slate-500 shrink-0 font-mono font-medium">URL Canônica Dinâmica:</span>
          <span className="text-emerald-700 font-mono font-semibold truncate select-all">
            {simulatedUrl}
          </span>
        </div>
        <div className="text-[11px] font-semibold text-slate-500 shrink-0">
          SEO Facetado • {totalActiveFilters > 1 ? 'noindex,follow sugerido' : 'index,follow'}
        </div>
      </div>

      {/* Grid: Left Filters Sidebar + Right Simulated Catalog Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Facets Filter Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Atributos Facetados ({facetsData.facets?.length || 0})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Clique para filtrar</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {(facetsData.facets || []).map((facet) => {
              const selectedCount = selectedFilters[facet.attribute_name]?.length || 0;

              return (
                <div
                  key={facet.attribute_name}
                  className="bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {facet.attribute_name}
                      </span>
                      {selectedCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                          {selectedCount}
                        </span>
                      )}
                    </div>
                    {facet.search_priority && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          facet.search_priority === 'Alta'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Prioridade {facet.search_priority}
                      </span>
                    )}
                  </div>

                  {/* Options Tags / Checkboxes */}
                  <div className="flex flex-wrap gap-1.5">
                    {(facet.options || []).map((opt) => {
                      const isSelected =
                        selectedFilters[facet.attribute_name]?.includes(opt) || false;

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleOption(facet.attribute_name, opt)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs'
                              : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-amber-400 shadow-2xs'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Simulated Products Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Catálogo Simulado ({filteredProducts.length} itens)
              </h3>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar item..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-200/70 flex items-center justify-center mx-auto text-slate-500">
                <Filter className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Nenhum item simulado corresponde aos filtros selecionados.
              </p>
              <button
                onClick={clearAllFilters}
                className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold transition-colors cursor-pointer"
              >
                Redefinir Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-2xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {prod.subcategory || 'Produto'}
                      </span>
                      {prod.price_estimate && (
                        <span className="text-xs font-bold text-emerald-700 font-mono">
                          {prod.price_estimate}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {prod.title}
                    </h4>

                    {/* Attribute values */}
                    <div className="space-y-1 pt-1">
                      {Object.entries(prod.attributes || {}).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-[11px] text-slate-600"
                        >
                          <span className="text-slate-400 truncate mr-2">{key}:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">ID: {prod.id}</span>
                    <span className="text-emerald-700 font-semibold">Compatível com Facetas ✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SEO recommendation note */}
          {facetsData.url_structure_recommendation && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-800">Recomendação de SEO para Facetas:</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {facetsData.url_structure_recommendation.facet_indexing_rules}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
