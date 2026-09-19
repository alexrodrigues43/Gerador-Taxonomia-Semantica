import { TaxonomyData, FacetsData, CSVRelationshipRow } from '../types';

/**
 * Replicates the prepare_csv_dataframe logic from the Colab notebook:
 * - Taxonomy: Broader -> Root (Parent Of, Hierarchy)
 *             Root -> Subcategory (Parent Of, Hierarchy)
 *             Subcategory -> Topic (Parent Of, Hierarchy)
 *             Root -> Entity (Related To, Association)
 * - Facets:   Root -> Attribute (Has Attribute, Facet Category)
 *             Attribute -> Option (Has Option, Facet Option)
 */
export function buildRelationshipRows(
  taxonomy: TaxonomyData,
  facets: FacetsData
): CSVRelationshipRow[] {
  const rows: CSVRelationshipRow[] = [];

  const root = taxonomy.root_topic || facets.topic;
  const broader = taxonomy.broader_category;

  if (broader && root) {
    rows.push({
      Source: broader,
      Relation: 'Parent Of',
      Target: root,
      Type: 'Hierarchy',
    });
  }

  // Subcategories & Topics
  if (taxonomy.subcategories && Array.isArray(taxonomy.subcategories)) {
    for (const sub of taxonomy.subcategories) {
      if (!sub?.name) continue;
      rows.push({
        Source: root,
        Relation: 'Parent Of',
        Target: sub.name,
        Type: 'Hierarchy',
      });

      if (sub.topics && Array.isArray(sub.topics)) {
        for (const topic of sub.topics) {
          rows.push({
            Source: sub.name,
            Relation: 'Parent Of',
            Target: topic,
            Type: 'Hierarchy',
          });
        }
      }
    }
  }

  // Related Entities
  if (taxonomy.related_entities && Array.isArray(taxonomy.related_entities)) {
    for (const ent of taxonomy.related_entities) {
      rows.push({
        Source: root,
        Relation: 'Related To',
        Target: ent,
        Type: 'Association',
      });
    }
  }

  // Facets
  if (facets.facets && Array.isArray(facets.facets)) {
    for (const facet of facets.facets) {
      const attr = facet.attribute_name;
      rows.push({
        Source: root,
        Relation: 'Has Attribute',
        Target: attr,
        Type: 'Facet Category',
      });

      if (facet.options && Array.isArray(facet.options)) {
        for (const opt of facet.options) {
          rows.push({
            Source: attr,
            Relation: 'Has Option',
            Target: opt,
            Type: 'Facet Option',
          });
        }
      }
    }
  }

  return rows;
}

export function convertRowsToCSV(rows: CSVRelationshipRow[]): string {
  const header = ['Source', 'Relation', 'Target', 'Type'];
  const escapeCell = (val: string) => {
    if (!val) return '""';
    const clean = String(val).replace(/"/g, '""');
    return clean.includes(',') || clean.includes('"') || clean.includes('\n')
      ? `"${clean}"`
      : clean;
  };

  const csvLines = [
    header.join(','),
    ...rows.map((r) =>
      [escapeCell(r.Source), escapeCell(r.Relation), escapeCell(r.Target), escapeCell(r.Type)].join(
        ','
      )
    ),
  ];

  return csvLines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Replicates the Colab's json_to_markdown_tax and json_to_markdown_facets
 */
export function generateMarkdownReport(taxonomy: TaxonomyData, facets: FacetsData): string {
  let md = `# Relatório Semântico & Facetas: ${taxonomy.root_topic || facets.topic}\n\n`;

  md += `## 📂 Categoria Mãe: ${taxonomy.broader_category || 'N/A'}\n`;
  md += `### 📍 Tópico Central: ${taxonomy.root_topic}\n\n`;

  if (taxonomy.search_intent) {
    md += `> **Intenção de Busca Principal:** ${taxonomy.search_intent.primary}\n`;
    md += `> ${taxonomy.search_intent.rationale}\n\n`;
  }

  md += `#### ⬇️ Subcategorias (Narrower Terms):\n`;
  for (const sub of taxonomy.subcategories || []) {
    md += `* **${sub.name}**\n`;
    for (const topic of sub.topics || []) {
      md += `    * ${topic}\n`;
    }
  }

  md += `\n---\n\n🔗 **Entidades Relacionadas:** ${(taxonomy.related_entities || []).join(', ')}\n\n`;

  md += `## 💎 Facetas para: ${facets.topic}\n\n`;
  for (const facet of facets.facets || []) {
    md += `**🏷️ Por ${facet.attribute_name}** ${facet.search_priority ? `*(Prioridade: ${facet.search_priority})*` : ''}\n`;
    for (const opt of facet.options || []) {
      md += `* ${opt}\n`;
    }
    md += '\n';
  }

  md += `**🧠 Intenção Sugerida:** ${(facets.intent || []).join(', ')}\n\n`;

  if (taxonomy.topic_clusters && taxonomy.topic_clusters.length > 0) {
    md += `## 🚀 Clusters de Conteúdo (SEO Silos):\n\n`;
    for (const cluster of taxonomy.topic_clusters) {
      md += `### 📄 Pillar: ${cluster.pillar_title}\n`;
      md += `* **Slug Sugerido:** /${cluster.slug}\n`;
      md += `* **Keywords do Cluster:** ${cluster.cluster_keywords.join(', ')}\n`;
      md += `* **Schema Recomendado:** ${cluster.recommended_schema}\n\n`;
    }
  }

  return md;
}

/**
 * Generates standard SKOS (Simple Knowledge Organization System) in Turtle format
 */
export function generateSkosTurtle(taxonomy: TaxonomyData): string {
  const sanitizeUri = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  const rootUri = sanitizeUri(taxonomy.root_topic);
  const broaderUri = sanitizeUri(taxonomy.broader_category);

  let turtle = `@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n`;
  turtle += `@prefix tax: <http://example.org/taxonomy/> .\n`;
  turtle += `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n`;

  turtle += `tax:${broaderUri} a skos:Concept ;\n`;
  turtle += `    skos:prefLabel "${taxonomy.broader_category}"@pt ;\n`;
  turtle += `    skos:narrower tax:${rootUri} .\n\n`;

  turtle += `tax:${rootUri} a skos:Concept ;\n`;
  turtle += `    skos:prefLabel "${taxonomy.root_topic}"@pt ;\n`;
  turtle += `    skos:broader tax:${broaderUri} ;\n`;

  const subUris: string[] = [];
  for (const sub of taxonomy.subcategories || []) {
    const subUri = sanitizeUri(sub.name);
    subUris.push(`tax:${subUri}`);
  }

  if (subUris.length > 0) {
    turtle += `    skos:narrower ${subUris.join(', ')} ;\n`;
  }

  const relUris: string[] = [];
  for (const ent of taxonomy.related_entities || []) {
    const entUri = sanitizeUri(ent);
    relUris.push(`tax:${entUri}`);
  }

  if (relUris.length > 0) {
    turtle += `    skos:related ${relUris.join(', ')} .\n\n`;
  } else {
    turtle += `    .\n\n`;
  }

  for (const sub of taxonomy.subcategories || []) {
    const sUri = sanitizeUri(sub.name);
    turtle += `tax:${sUri} a skos:Concept ;\n`;
    turtle += `    skos:prefLabel "${sub.name}"@pt ;\n`;
    turtle += `    skos:broader tax:${rootUri} .\n\n`;
  }

  return turtle;
}

/**
 * Generates Schema.org JSON-LD for DefinedTermSet / Breadcrumbs
 */
export function generateSchemaJsonLd(taxonomy: TaxonomyData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: `Taxonomia de ${taxonomy.root_topic}`,
    description: `Taxonomia hierárquica e estrutura semântica categorizada sob ${taxonomy.broader_category}`,
    hasDefinedTerm: [
      {
        '@type': 'DefinedTerm',
        name: taxonomy.root_topic,
        termCode: taxonomy.root_topic.toLowerCase().replace(/\s+/g, '-'),
      },
      ...(taxonomy.subcategories || []).map((sub) => ({
        '@type': 'DefinedTerm',
        name: sub.name,
        termCode: sub.name.toLowerCase().replace(/\s+/g, '-'),
        inDefinedTermSet: `https://schema.org/category/${taxonomy.root_topic.toLowerCase().replace(/\s+/g, '-')}`,
      })),
    ],
  };
}
