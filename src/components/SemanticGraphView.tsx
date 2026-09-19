import React, { useState, useMemo, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';
import { TaxonomyData, FacetsData, GraphNode, GraphLink } from '../types';

interface SemanticGraphViewProps {
  taxonomy: TaxonomyData;
  facets: FacetsData;
  onDrillDown: (nodeName: string, nodeType: 'subcategory' | 'topic') => void;
}

export const SemanticGraphView: React.FC<SemanticGraphViewProps> = ({
  taxonomy,
  facets,
  onDrillDown,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Generate nodes and edges with deterministic radial coordinates
  const { nodes, links } = useMemo(() => {
    const nList: GraphNode[] = [];
    const lList: GraphLink[] = [];

    const rootName = taxonomy.root_topic || facets.topic;
    const broaderName = taxonomy.broader_category;

    // 1. Root Node
    nList.push({
      id: 'root',
      name: rootName,
      group: 'root',
      level: 0,
      details: 'Tópico Central da Taxonomia',
    });

    // 2. Broader Node
    if (broaderName) {
      nList.push({
        id: 'broader',
        name: broaderName,
        group: 'broader',
        level: -1,
        details: 'Categoria Superior (Broader Term)',
      });
      lList.push({
        source: 'broader',
        target: 'root',
        relation: 'Parent Of',
        type: 'Hierarchy',
      });
    }

    // 3. Subcategories & Topics
    (taxonomy.subcategories || []).forEach((sub, sIdx) => {
      const subId = `sub_${sIdx}`;
      nList.push({
        id: subId,
        name: sub.name,
        group: 'subcategory',
        level: 1,
        details: sub.description || 'Subcategoria temática',
      });
      lList.push({
        source: 'root',
        target: subId,
        relation: 'Parent Of',
        type: 'Hierarchy',
      });

      (sub.topics || []).slice(0, 4).forEach((topic, tIdx) => {
        const topId = `top_${sIdx}_${tIdx}`;
        nList.push({
          id: topId,
          name: topic,
          group: 'topic',
          level: 2,
          details: `Tópico específico sob ${sub.name}`,
        });
        lList.push({
          source: subId,
          target: topId,
          relation: 'Parent Of',
          type: 'Hierarchy',
        });
      });
    });

    // 4. Related Entities
    (taxonomy.related_entities || []).slice(0, 5).forEach((ent, eIdx) => {
      const entId = `ent_${eIdx}`;
      nList.push({
        id: entId,
        name: ent,
        group: 'entity',
        level: 1,
        details: 'Entidade associativa / Conceito relacionado',
      });
      lList.push({
        source: 'root',
        target: entId,
        relation: 'Related To',
        type: 'Association',
      });
    });

    // 5. Facet Attributes
    (facets.facets || []).slice(0, 4).forEach((f, fIdx) => {
      const fId = `facet_${fIdx}`;
      nList.push({
        id: fId,
        name: f.attribute_name,
        group: 'facet_attr',
        level: 1,
        details: `Atributo de filtro (${f.facet_type || 'categórico'})`,
      });
      lList.push({
        source: 'root',
        target: fId,
        relation: 'Has Attribute',
        type: 'Facet Category',
      });

      (f.options || []).slice(0, 3).forEach((opt, oIdx) => {
        const optId = `fopt_${fIdx}_${oIdx}`;
        nList.push({
          id: optId,
          name: opt,
          group: 'facet_opt',
          level: 2,
          details: `Opção de valor para ${f.attribute_name}`,
        });
        lList.push({
          source: fId,
          target: optId,
          relation: 'Has Option',
          type: 'Facet Option',
        });
      });
    });

    return { nodes: nList, links: lList };
  }, [taxonomy, facets]);

  // Compute 2D Positions layout in a 1000x700 canvas
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const cx = 500;
    const cy = 350;

    pos['root'] = { x: cx, y: cy };
    if (pos['broader'] !== undefined || taxonomy.broader_category) {
      pos['broader'] = { x: cx, y: cy - 220 };
    }

    // Subcategories placed in right/top-right arc
    const subs = nodes.filter((n) => n.group === 'subcategory');
    subs.forEach((sub, i) => {
      const angle = -Math.PI / 4 + (i * Math.PI) / (subs.length > 1 ? subs.length - 0.5 : 1);
      const r = 160;
      const sx = cx + r * Math.cos(angle);
      const sy = cy + r * Math.sin(angle);
      pos[sub.id] = { x: sx, y: sy };

      const topics = nodes.filter((n) => n.id.startsWith(`top_${sub.id.split('_')[1]}_`));
      topics.forEach((top, ti) => {
        const tAngle = angle - 0.35 + (ti * 0.7) / Math.max(topics.length - 1, 1);
        const tr = 110;
        pos[top.id] = {
          x: sx + tr * Math.cos(tAngle),
          y: sy + tr * Math.sin(tAngle),
        };
      });
    });

    // Related Entities placed in bottom-left
    const entities = nodes.filter((n) => n.group === 'entity');
    entities.forEach((ent, i) => {
      const angle = Math.PI * 0.7 + (i * 0.5) / Math.max(entities.length - 1, 1);
      const r = 180;
      pos[ent.id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });

    // Facet Attributes placed in left / top-left
    const facetsList = nodes.filter((n) => n.group === 'facet_attr');
    facetsList.forEach((f, i) => {
      const angle = Math.PI * 1.1 + (i * 0.6) / Math.max(facetsList.length - 1, 1);
      const r = 170;
      const fx = cx + r * Math.cos(angle);
      const fy = cy + r * Math.sin(angle);
      pos[f.id] = { x: fx, y: fy };

      const options = nodes.filter((n) => n.id.startsWith(`fopt_${f.id.split('_')[1]}_`));
      options.forEach((opt, oi) => {
        const oAngle = angle - 0.3 + (oi * 0.6) / Math.max(options.length - 1, 1);
        const or = 95;
        pos[opt.id] = {
          x: fx + or * Math.cos(oAngle),
          y: fy + or * Math.sin(oAngle),
        };
      });
    });

    return pos;
  }, [nodes, taxonomy.broader_category]);

  const getNodeColor = (group: GraphNode['group']) => {
    switch (group) {
      case 'root':
        return '#f59e0b'; // Amber
      case 'broader':
        return '#10b981'; // Emerald
      case 'subcategory':
        return '#6366f1'; // Indigo
      case 'topic':
        return '#3b82f6'; // Blue
      case 'entity':
        return '#0284c7'; // Sky
      case 'facet_attr':
        return '#ea580c'; // Orange
      case 'facet_opt':
        return '#9333ea'; // Purple
      default:
        return '#64748b';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🕸️</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Grafo Semântico Conceitual
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeamento bidimensional de conexões hierárquicas, atributos e entidades
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Centralizar e Redefinir"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="text-slate-600 font-bold">Legenda:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-700 font-medium">Tópico Raiz</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-700 font-medium">Categoria Pai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-slate-700 font-medium">Subcategoria</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-700 font-medium">Tópico</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span className="text-slate-700 font-medium">Entidade</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-slate-700 font-medium">Faceta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-slate-700 font-medium">Opção</span>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className="relative h-[560px] w-full rounded-2xl overflow-hidden bg-slate-50/70 border border-slate-200 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} transform-origin="500 350">
            {/* Draw Links */}
            {links.map((link, idx) => {
              const p1 = nodePositions[link.source];
              const p2 = nodePositions[link.target];
              if (!p1 || !p2) return null;

              const isHighlighted =
                selectedNode &&
                (selectedNode.id === link.source || selectedNode.id === link.target);

              let strokeColor = '#cbd5e1';
              let strokeDash = '';
              if (link.type === 'Association') strokeDash = '4 3';
              if (isHighlighted) strokeColor = '#d97706';

              return (
                <g key={idx}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2.5 : 1.4}
                    strokeDasharray={strokeDash}
                    opacity={selectedNode && !isHighlighted ? 0.3 : 0.85}
                  />
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.group);
              const isRoot = node.group === 'root';
              const radius = isRoot ? 24 : node.level === 1 || node.level === -1 ? 16 : 10;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                >
                  {/* Node Circle */}
                  <circle
                    r={radius}
                    fill={color}
                    stroke={isSelected ? '#0f172a' : '#ffffff'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all hover:opacity-90"
                    filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
                  />

                  {/* Label */}
                  <text
                    y={radius + 13}
                    textAnchor="middle"
                    fill={isSelected ? '#000000' : '#334155'}
                    fontSize={isRoot ? 13 : 11}
                    fontWeight={isRoot || isSelected ? 'bold' : '500'}
                    className="pointer-events-none select-none font-sans"
                  >
                    {node.name.length > 20 ? `${node.name.slice(0, 18)}...` : node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Node Inspector */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 max-w-sm bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl space-y-2 z-10 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                {selectedNode.group}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-bold text-slate-900">{selectedNode.name}</h4>
            {selectedNode.details && (
              <p className="text-xs text-slate-600 leading-relaxed">{selectedNode.details}</p>
            )}

            {(selectedNode.group === 'subcategory' || selectedNode.group === 'topic') && (
              <button
                onClick={() =>
                  onDrillDown(
                    selectedNode.name,
                    selectedNode.group === 'subcategory' ? 'subcategory' : 'topic'
                  )
                }
                className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Detalhar "{selectedNode.name}" com Gemini</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
