import React from 'react';
import { X, Clock, Trash2, ArrowRight, Layers, Tag, Database } from 'lucide-react';
import { TaxonomyHistoryItem, FullAnalysisResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: TaxonomyHistoryItem[];
  onSelectHistory: (item: FullAnalysisResult) => void;
  onDeleteItem: (id: string) => void;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onSelectHistory,
  onDeleteItem,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Histórico de Taxonomias</h3>
                <p className="text-xs text-slate-500">
                  {history.length} {history.length === 1 ? 'registro salvo' : 'registros salvos'}
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

          {/* Drawer Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Nenhuma taxonomia salva</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Gere sua primeira taxonomia e facetas para vê-la listada no histórico e acessá-la quando quiser.
                </p>
              </div>
            ) : (
              history.map((item) => {
                const dateStr = new Date(item.timestamp).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group relative space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                          {item.topic}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">{dateStr}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        title="Excluir do histórico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {item.subcategoriesCount} subcategorias
                      </span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {item.facetsCount} facetas
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectHistory(item.data);
                        onClose();
                      }}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Restaurar esta Taxonomia</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-center">
            <span className="text-xs text-slate-500">
              Histórico mantido localmente na sua sessão
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
