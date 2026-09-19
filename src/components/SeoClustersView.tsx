import React, { useState } from 'react';
import { Compass, Code2, Copy, Check, Search, Layers } from 'lucide-react';
import { TaxonomyData } from '../types';
import { generateSchemaJsonLd } from '../utils/exportHelpers';

interface SeoClustersViewProps {
  taxonomy: TaxonomyData;
}

export const SeoClustersView: React.FC<SeoClustersViewProps> = ({ taxonomy }) => {
  const [copiedSchema, setCopiedSchema] = useState(false);

  const schemaObj = generateSchemaJsonLd(taxonomy);
  const schemaString = JSON.stringify(schemaObj, null, 2);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaString);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const intent = taxonomy.search_intent;
  const clusters = taxonomy.topic_clusters || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Arquitetura de SEO Semântico & Clusters de Conteúdo
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Estratégia de autoridade tópica, intenção de busca, silos de conteúdo e Schema.org
        </p>
      </div>

      {/* Search Intent Card */}
      {intent && (
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Classificação da Intenção de Busca
              </h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold self-start sm:self-auto shadow-2xs">
              {intent.primary}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            {intent.rationale}
          </p>

          {intent.user_query_examples && intent.user_query_examples.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Consultas Típicas de Usuário (Search Queries):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {intent.user_query_examples.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-900 font-medium">"{q}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topic Clusters (Pillar Pages & Cluster Pages) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Silos de Conteúdo & Pillar Pages ({clusters.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusters.map((cluster, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                    Pillar Page
                  </span>
                  <span className="text-[10px] font-mono font-medium text-slate-500">
                    /{cluster.slug}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  {cluster.pillar_title}
                </h4>

                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Artigos / Keywords do Cluster:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.cluster_keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Schema Recomendado:</span>
                <span className="font-mono text-indigo-700 font-bold">
                  {cluster.recommended_schema}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schema.org DefinedTermSet / BreadcrumbList JSON-LD */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Marcação Estruturada Schema.org (JSON-LD)
            </h3>
          </div>

          <button
            onClick={handleCopySchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            {copiedSchema ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar JSON-LD</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed shadow-inner">
          {schemaString}
        </pre>
      </div>
    </div>
  );
};
