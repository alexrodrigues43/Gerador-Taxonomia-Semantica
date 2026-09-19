export interface Subcategory {
  name: string;
  slug?: string;
  description?: string;
  topics: string[];
}

export interface RelatedEntity {
  name: string;
  type?: string;
  description?: string;
}

export interface SearchIntentInfo {
  primary: 'Informacional' | 'Transacional' | 'Navegacional' | 'Comercial';
  secondary?: string[];
  rationale: string;
  user_query_examples: string[];
}

export interface TopicCluster {
  pillar_title: string;
  slug: string;
  cluster_keywords: string[];
  recommended_schema: string;
}

export interface TaxonomyData {
  root_topic: string;
  broader_category: string;
  subcategories: Subcategory[];
  related_entities: string[];
  search_intent?: SearchIntentInfo;
  topic_clusters?: TopicCluster[];
  breadcrumbs_path?: string[];
}

export interface FacetItem {
  attribute_name: string;
  slug?: string;
  facet_type?: 'categorical' | 'range' | 'boolean' | 'multiselect';
  options: string[];
  recommended_filter_ui?: 'checkbox' | 'radio' | 'slider' | 'badge_tag';
  search_priority?: 'Alta' | 'Média' | 'Baixa';
}

export interface SimulatedCatalogItem {
  id: string;
  title: string;
  subcategory: string;
  attributes: Record<string, string>;
  price_estimate?: string;
  sku?: string;
}

export interface FacetsData {
  topic: string;
  intent: string[];
  facets: FacetItem[];
  catalog_simulation?: SimulatedCatalogItem[];
  url_structure_recommendation?: {
    canonical_pattern: string;
    facet_indexing_rules: string;
  };
}

export interface FullAnalysisResult {
  topic: string;
  domain: string;
  language: string;
  taxonomy: TaxonomyData;
  facets: FacetsData;
  generated_at: string;
}

export interface GraphNode {
  id: string;
  name: string;
  group: 'root' | 'broader' | 'subcategory' | 'topic' | 'entity' | 'facet_attr' | 'facet_opt';
  level: number;
  count?: number;
  details?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
  type: 'Hierarchy' | 'Association' | 'Facet Category' | 'Facet Option';
}

export interface CSVRelationshipRow {
  Source: string;
  Relation: string;
  Target: string;
  Type: string;
}

export interface DrillDownRequest {
  parent_topic: string;
  selected_node: string;
  node_type: 'subcategory' | 'topic' | 'entity';
  domain: string;
  language: string;
}

export interface DrillDownResponse {
  node_name: string;
  broader_term: string;
  narrower_topics: string[];
  specific_facets: FacetItem[];
  semantic_synonyms: string[];
  search_intent: string;
}

export type UserRole = 'admin' | 'client';
export type UserStatus = 'pending' | 'active' | 'blocked' | 'expired';
export type UserPlan = 'trial' | 'monthly' | 'annual' | 'lifetime';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  usageCount: number;
  notes: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface TaxonomyHistoryItem {
  id: string;
  timestamp: string;
  topic: string;
  domain: string;
  subcategoriesCount: number;
  facetsCount: number;
  data: FullAnalysisResult;
}

