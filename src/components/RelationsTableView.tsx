import React, { useState, useMemo } from 'react';
import { Table, Download, Copy, Check, Search } from 'lucide-react';
import { TaxonomyData, FacetsData } from '../types';
import { buildRelationshipRows, convertRowsToCSV, downloadFile } from '../utils/exportHelpers';

interface RelationsTableViewProps {
  taxonomy: TaxonomyData;
  facets: FacetsData;
}

export const RelationsTableView: React.FC<RelationsTableViewProps> = ({ taxonomy, facets }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate relationship rows exactly like the Colab notebook
  const allRows = useMemo(() => {
    return buildRelationshipRows(taxonomy, facets);
  }, [taxonomy, facets]);

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (selectedType !== 'all' && r.Type !== selectedType) return false;
      if (filterQuery) {
        const q = filterQuery.toLowerCase();
        return (
          r.Source.toLowerCase().includes(q) ||
          r.Relation.toLowerCase().includes(q) ||
          r.Target.toLowerCase().includes(q) ||
          r.Type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRows, selectedType, filterQuery]);

  const handleDownloadCSV = () => {
    const csvContent = convertRowsToCSV(allRows);
    const filename = `relacoes_${(taxonomy.root_topic || facets.topic || 'dados')
      .toLowerCase()
      .replace(/\s+/g, '_')}.csv`;
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  const handleCopyCSV = () => {
    const csvContent = convertRowsToCSV(allRows);
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const types = ['all', 'Hierarchy', 'Association', 'Facet Category', 'Facet Option'];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Hierarchy':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Association':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Facet Category':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Facet Option':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Matriz Relacional (Dataframe Pandas)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabela tabular unificada <code className="text-amber-700 font-mono font-bold bg-amber-50 px-1 py-0.5 rounded">prepare_csv_dataframe</code> (Source, Relation, Target, Type)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shadow-2xs cursor-pointer"
            title="Copiar dados em CSV"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar CSV</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV (Pandas)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                selectedType === t
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-white'
              }`}
            >
              {t === 'all' ? 'Todos os Tipos' : t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar relações..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Source (Origem)</th>
                <th className="py-3 px-4">Relation (Relação)</th>
                <th className="py-3 px-4">Target (Destino)</th>
                <th className="py-3 px-4">Type (Classificação)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhum registro correspondente ao filtro.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-amber-50/20 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {row.Source}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-amber-700 font-medium">
                      {row.Relation}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800">
                      {row.Target}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTypeBadge(
                          row.Type
                        )}`}
                      >
                        {row.Type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Total: {filteredRows.length} de {allRows.length} relações computadas</span>
        <span>Exportável diretamente para pandas.DataFrame(df)</span>
      </div>
    </div>
  );
};
