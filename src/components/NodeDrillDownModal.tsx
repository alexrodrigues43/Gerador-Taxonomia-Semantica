import React, { useEffect, useState } from 'react';
import { X, Sparkles, Loader2, Tag, Sliders, Check, Copy } from 'lucide-react';
import { DrillDownResponse } from '../types';

interface NodeDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeName: string;
  nodeType: 'subcategory' | 'topic';
  parentTopic: string;
  onAppendToTaxonomy?: (details: DrillDownResponse) => void;
}

export const NodeDrillDownModal: React.FC<NodeDrillDownModalProps> = ({
  isOpen,
  onClose,
  nodeName,
  nodeType,
  parentTopic,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DrillDownResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !nodeName) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setData(null);

    fetch('/api/expand-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent_topic: parentTopic,
        selected_node: nodeName,
        node_type: nodeType,
        language: 'pt-BR',
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Falha ao detalhar nó');
        }
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, nodeName, nodeType, parentTopic]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-2xs">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                  Deep Dive com Gemini
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold">
                  {nodeType}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                {nodeName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-800 font-bold">
                ⚡ Gemini está aprofundando o nó <span className="text-amber-600">"{nodeName}"</span>...
              </p>
              <p className="text-xs text-slate-500">
                Gerando subtópicos específicos, sinônimos LSI e micro-facetas exclusivas.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <p className="font-bold">Erro ao processar nó:</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-5 text-xs">
              {/* Search Intent */}
              {data.search_intent && (
                <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    Intenção de Busca Específica:
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{data.search_intent}</p>
                </div>
              )}

              {/* Narrower Topics */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⬇️ Subtópicos & Variações Específicas (Nível 3/4):</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(data.narrower_topics || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specific Facets */}
              {data.specific_facets && data.specific_facets.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>Micro-Facetas Específicas para este Ramo:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.specific_facets.map((facet, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 shadow-2xs"
                      >
                        <span className="font-bold text-slate-900 block">
                          {facet.attribute_name}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {facet.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-medium"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Semantic Synonyms / LSI */}
              {data.semantic_synonyms && data.semantic_synonyms.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sinônimos Semânticos & LSI Keywords:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.semantic_synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-mono text-[11px] font-medium"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleCopyJson}
            disabled={!data}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">JSON Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Detalhes</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
