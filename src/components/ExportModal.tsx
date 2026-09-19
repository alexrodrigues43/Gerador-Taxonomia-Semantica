import React, { useState, useMemo } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, FileCode, FileText, Share2 } from 'lucide-react';
import { FullAnalysisResult } from '../types';
import {
  buildRelationshipRows,
  convertRowsToCSV,
  downloadFile,
  generateMarkdownReport,
  generateSkosTurtle,
  generateSchemaJsonLd,
} from '../utils/exportHelpers';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FullAnalysisResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, analysis }) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json' | 'markdown' | 'skos' | 'schema'>('csv');
  const [copied, setCopied] = useState(false);

  const topicSlug = (analysis.taxonomy.root_topic || analysis.topic || 'taxonomia')
    .toLowerCase()
    .replace(/\s+/g, '_');

  // Prepare contents
  const csvContent = useMemo(() => {
    const rows = buildRelationshipRows(analysis.taxonomy, analysis.facets);
    return convertRowsToCSV(rows);
  }, [analysis]);

  const jsonContent = useMemo(() => {
    return JSON.stringify(analysis, null, 2);
  }, [analysis]);

  const markdownContent = useMemo(() => {
    return generateMarkdownReport(analysis.taxonomy, analysis.facets);
  }, [analysis]);

  const skosContent = useMemo(() => {
    return generateSkosTurtle(analysis.taxonomy);
  }, [analysis]);

  const schemaContent = useMemo(() => {
    return JSON.stringify(generateSchemaJsonLd(analysis.taxonomy), null, 2);
  }, [analysis]);

  if (!isOpen) return null;

  const currentContent = {
    csv: csvContent,
    json: jsonContent,
    markdown: markdownContent,
    skos: skosContent,
    schema: schemaContent,
  }[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    switch (activeTab) {
      case 'csv':
        downloadFile(csvContent, `taxonomia_${topicSlug}.csv`, 'text/csv;charset=utf-8;');
        break;
      case 'json':
        downloadFile(jsonContent, `taxonomia_${topicSlug}.json`, 'application/json;charset=utf-8;');
        break;
      case 'markdown':
        downloadFile(markdownContent, `relatorio_${topicSlug}.md`, 'text/markdown;charset=utf-8;');
        break;
      case 'skos':
        downloadFile(skosContent, `taxonomia_${topicSlug}.ttl`, 'text/turtle;charset=utf-8;');
        break;
      case 'schema':
        downloadFile(schemaContent, `schema_${topicSlug}.json`, 'application/ld+json;charset=utf-8;');
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Exportar Taxonomia & Facetas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha o formato desejado para download ou cópia imediata
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'csv'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV (Colab Pandas)</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'json'
                ? 'border-amber-500 text-amber-900 bg-amber-50/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON Estruturado</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'markdown'
                ? 'border-sky-600 text-sky-800 bg-sky-50/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown (Relatório)</span>
          </button>

          <button
            onClick={() => setActiveTab('skos')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'skos'
                ? 'border-purple-600 text-purple-800 bg-purple-50/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SKOS Taxonomia (Turtle)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-800 bg-indigo-50/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Schema.org JSON-LD</span>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950">
          <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed overflow-x-auto select-all">
            {currentContent}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            {currentContent.split('\n').length} linhas
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Conteúdo</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
