import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Sliders,
  Network,
  Table,
  Compass,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
} from 'lucide-react';
import { FullAnalysisResult, TaxonomyHistoryItem } from './types';
import { SAMPLE_ANALYSIS } from './data/initialSamples';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TopicSearchForm } from './components/TopicSearchForm';
import { TaxonomyTreeView } from './components/TaxonomyTreeView';
import { FacetsSimulatorView } from './components/FacetsSimulatorView';
import { SemanticGraphView } from './components/SemanticGraphView';
import { RelationsTableView } from './components/RelationsTableView';
import { SeoClustersView } from './components/SeoClustersView';
import { ExportModal } from './components/ExportModal';
import { NodeDrillDownModal } from './components/NodeDrillDownModal';
import { LoginModal } from './components/LoginModal';
import { AdminModal } from './components/AdminModal';
import { PaywallModal } from './components/PaywallModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { InfoModal, InfoModalType } from './components/InfoModal';
import { useAuth } from './hooks/useAuth';
import { incrementUsageCount } from './lib/authService';
import {
  getStoredHistory,
  saveHistoryItem,
  deleteHistoryItem,
} from './utils/authStorage';

export default function App() {
  const [analysis, setAnalysis] = useState<FullAnalysisResult>(SAMPLE_ANALYSIS);
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'facets' | 'graph' | 'table' | 'seo'>('taxonomy');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real-time Authentication & Access Control hook
  const {
    user,
    loading: isAuthLoading,
    isAdmin,
    isActive,
    isAuthenticated,
  } = useAuth();

  // History state
  const [history, setHistory] = useState<TaxonomyHistoryItem[]>(() => {
    const stored = getStoredHistory();
    if (stored.length === 0) {
      const initial = saveHistoryItem(SAMPLE_ANALYSIS);
      return initial;
    }
    return stored;
  });

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallActionName, setPaywallActionName] = useState('executar esta ação');
  const [infoModalType, setInfoModalType] = useState<InfoModalType | null>(null);

  // Drill Down Modal state
  const [drillDownNode, setDrillDownNode] = useState<{
    name: string;
    type: 'subcategory' | 'topic';
  } | null>(null);

  // Guard action: returns true if user is logged in with active subscription, otherwise opens Paywall
  const checkAccess = (actionName: string): boolean => {
    if (!isAuthenticated || !isActive) {
      setPaywallActionName(actionName);
      setIsPaywallOpen(true);
      return false;
    }
    return true;
  };

  const handleSearch = async (topic: string, domain: string, depth: string) => {
    if (!checkAccess('gerar novas taxonomias semânticas')) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-taxonomy-facets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          domain,
          depth,
          language: 'pt-BR',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.taxonomy && data.facets) {
        const newAnalysis: FullAnalysisResult = {
          topic: data.topic || topic,
          domain: data.domain || domain,
          language: data.language || 'pt-BR',
          taxonomy: data.taxonomy,
          facets: data.facets,
          generated_at: data.generated_at || new Date().toISOString(),
        };

        setAnalysis(newAnalysis);

        // Update history
        const updatedHistory = saveHistoryItem(newAnalysis);
        setHistory(updatedHistory);

        // Atomically increment user's usage count in Firestore
        if (user?.uid) {
          await incrementUsageCount(user.uid);
        }
      } else {
        throw new Error('Resposta do Gemini incompleta ou inválida.');
      }
    } catch (err: any) {
      console.error('Falha na geração:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao comunicar com a API do Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenExport = () => {
    if (!checkAccess('exportar os arquivos estruturados (CSV, JSON, Pandas)')) {
      return;
    }
    setIsExportOpen(true);
  };

  const handleOpenDrillDown = (nodeName: string, nodeType: 'subcategory' | 'topic') => {
    if (!checkAccess('aprofundar (drill-down) termos desta taxonomia')) {
      return;
    }
    setDrillDownNode({ name: nodeName, type: nodeType });
  };

  const handleNewTaxonomy = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const input = document.getElementById('input-topic-search');
    if (input) {
      input.focus();
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 bg-semantico-grid flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Navbar Header */}
      <Header
        user={user}
        activeTopic={analysis.taxonomy?.root_topic || analysis.topic}
        historyCount={history.length}
        onOpenExport={handleOpenExport}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenLogin={(mode = 'login') => {
          setLoginModalMode(mode);
          setIsLoginOpen(true);
        }}
        onOpenInfoModal={(type) => setInfoModalType(type)}
        onNewTaxonomy={handleNewTaxonomy}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner for Pending or Unauthenticated users */}
        {user && user.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <div className="text-xs">
                <strong>Status da Assinatura: Aguardando Liberação.</strong> Você pode explorar os exemplos livremente. Para gerar dados sob demanda, solicite liberação imediata.
              </div>
            </div>
            <button
              onClick={() => {
                setPaywallActionName('liberar seu acesso em tempo real');
                setIsPaywallOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              Ver Status & WhatsApp
            </button>
          </div>
        )}

        {/* Search & Configuration Bar */}
        <TopicSearchForm
          onSearch={handleSearch}
          isLoading={isLoading}
          currentTopic={analysis.taxonomy?.root_topic || analysis.topic}
        />

        {/* Loading Banner */}
        {isLoading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 text-amber-900 shadow-xs animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-950">
                ⚡ Gemini 3 Flash está processando e estruturando a taxonomia semântica...
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Calculando termos mais amplos (broader), subcategorias hierárquicas, atributos facetados e matriz relacional.
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-950">Falha no processamento:</span>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl gap-1 overflow-x-auto shadow-xs">
          <button
            id="tab-taxonomy"
            onClick={() => setActiveTab('taxonomy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'taxonomy'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>🌳 Taxonomia Hierárquica</span>
          </button>

          <button
            id="tab-facets"
            onClick={() => setActiveTab('facets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'facets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>💎 Facetas & Simulador</span>
          </button>

          <button
            id="tab-graph"
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>🕸️ Grafo Semântico</span>
          </button>

          <button
            id="tab-table"
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>📊 Matriz Pandas (CSV)</span>
          </button>

          <button
            id="tab-seo"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>🚀 SEO & Clusters</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all">
          {activeTab === 'taxonomy' && (
            <TaxonomyTreeView
              taxonomy={analysis.taxonomy}
              onDrillDown={handleOpenDrillDown}
            />
          )}

          {activeTab === 'facets' && (
            <FacetsSimulatorView
              facetsData={analysis.facets}
              rootTopic={analysis.taxonomy?.root_topic || analysis.topic}
            />
          )}

          {activeTab === 'graph' && (
            <SemanticGraphView
              taxonomy={analysis.taxonomy}
              facets={analysis.facets}
              onDrillDown={handleOpenDrillDown}
            />
          )}

          {activeTab === 'table' && (
            <RelationsTableView
              taxonomy={analysis.taxonomy}
              facets={analysis.facets}
            />
          )}

          {activeTab === 'seo' && (
            <SeoClustersView taxonomy={analysis.taxonomy} />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        user={user}
        actionName={paywallActionName}
        onOpenLogin={(mode = 'login') => {
          setIsPaywallOpen(false);
          setLoginModalMode(mode);
          setIsLoginOpen(true);
        }}
      />

      {/* Drill Down Modal */}
      {drillDownNode && (
        <NodeDrillDownModal
          isOpen={Boolean(drillDownNode)}
          onClose={() => setDrillDownNode(null)}
          nodeName={drillDownNode.name}
          nodeType={drillDownNode.type}
          parentTopic={analysis.taxonomy?.root_topic || analysis.topic}
        />
      )}

      {/* Export Modal */}
      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysis={analysis}
        />
      )}

      {/* Login & Register Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        initialMode={loginModalMode}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false);
        }}
      />

      {/* Admin Panel Modal (Strictly for admins) */}
      {isAdmin && user && (
        <AdminModal
          isOpen={isAdminOpen}
          currentUser={user}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistory={(itemData) => {
          setAnalysis(itemData);
          setIsHistoryOpen(false);
          setErrorMsg(null);
        }}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Info Modal */}
      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
}
