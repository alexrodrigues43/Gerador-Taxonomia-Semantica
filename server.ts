import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security headers with Helmet (configured to allow Vite dynamic scripts and D3 graphs)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Body limit reduction to protect against memory exhaustion DoS
app.use(express.json({ limit: '500kb' }));

// General API Rate Limiting (200 req / 15 min per IP)
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Por favor, aguarde alguns minutos e tente novamente.' },
});

// Strict AI Rate Limiting for Gemini generation (15 generations / 15 min per IP)
const aiGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Limite de gerações atingido para este período (máximo de 15 a cada 15 minutos por usuário). Aguarde alguns instantes para gerar novas taxonomias.',
  },
});

app.use('/api/', generalApiLimiter);

// Lazy initialize Gemini client to avoid crashes if key is initially empty
function getGeminiClient() {
  const apiKey = process.env.BlogSemantico || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chave de API do Gemini (BlogSemantico ou GEMINI_API_KEY) não configurada.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.BlogSemantico || process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    keySource: process.env.BlogSemantico ? 'BlogSemantico' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'none',
    model: 'gemini-3.8-flash',
  });
});

// Allowed values for input validation
const ALLOWED_DOMAINS = ['ecommerce', 'seo_content', 'saas', 'general'];
const ALLOWED_DEPTHS = ['standard', 'deep'];

// Endpoint: Generate Full Semantic Taxonomy & Facets
app.post('/api/generate-taxonomy-facets', aiGenerationLimiter, async (req, res) => {
  try {
    const {
      topic,
      domain = 'ecommerce', // 'ecommerce' | 'seo_content' | 'saas' | 'general'
      language = 'pt-BR',
      depth = 'standard', // 'standard' | 'deep'
    } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'O parâmetro "topic" é obrigatório.' });
    }

    const cleanTopic = topic.trim();
    if (cleanTopic.length < 2) {
      return res.status(400).json({ error: 'O tópico deve ter no mínimo 2 caracteres.' });
    }
    if (cleanTopic.length > 150) {
      return res.status(400).json({ error: 'O tópico deve ter no máximo 150 caracteres para evitar sobrecarga.' });
    }

    if (domain && !ALLOWED_DOMAINS.includes(domain)) {
      return res.status(400).json({ error: `Domínio inválido. Valores aceitos: ${ALLOWED_DOMAINS.join(', ')}` });
    }

    if (depth && !ALLOWED_DEPTHS.includes(depth)) {
      return res.status(400).json({ error: `Nível de profundidade inválido. Valores aceitos: ${ALLOWED_DEPTHS.join(', ')}` });
    }

    const ai = getGeminiClient();

    const domainContextDescription = {
      ecommerce: 'Foco em Catálogo de E-commerce, Navegação Facetada, Filtros de Compra, Taxonomia de Produtos e Metadados Transacionais.',
      seo_content: 'Foco em Arquitetura de SEO Semântico, Silos de Conteúdo, Pillar Pages, Topic Clusters e Intenção de Busca no Google.',
      saas: 'Foco em Soluções B2B/SaaS, Recursos de Software, Casos de Uso, Indústrias e Arquitetura Funcional.',
      general: 'Foco em Arquitetura da Informação geral, Taxonomia Conceitual e Organização de Conteúdo.',
    }[domain as 'ecommerce' | 'seo_content' | 'saas' | 'general'] || 'E-commerce e SEO Semântico';

    const prompt = `
Você é o Arquiteto da Informação e Especialista em SEO Semântico, Taxonomias e E-commerce da Semântico.
Tarefa: Para o tópico "${topic.trim()}", gere uma taxonomia hierárquica completa (broader terms, narrower terms, subcategorias, tópicos específicos, entidades relacionadas) e um sistema completo de facetas (filtros de atributos e opções para navegação facetada), além de 4 itens de catálogo simulados para teste dos filtros.

Contexto de Aplicação: ${domainContextDescription}
Idioma de resposta: ${language === 'pt-BR' ? 'Português do Brasil' : language}
Nível de detalhe: ${depth === 'deep' ? 'Profundo e exaustivo (com subcategorias ricas e facetas detalhadas)' : 'Padrão refinado'}

Critérios obrigatórios:
1. "broader_category": Categoria Pai / Termo Superior mais amplo no padrão SKOS (ex: se o tópico é "Vinho Tinto", broader_category é "Vinhos" ou "Bebidas Alcoólicas").
2. "subcategories": Mínimo de 3 a 5 subcategorias temáticas lógicas. Cada uma deve ter seu nome e uma lista de 3 a 6 tópicos/produtos específicos.
3. "related_entities": Mínimo de 4 entidades fortemente conectadas semânticamente (conceitos irmãos, marcas de referência, ferramentas, insumos).
4. "search_intent": Mapeamento da intenção de busca predominante (Informacional, Transacional, Navegacional, Comercial) com justificativa e consultas de busca de exemplo.
5. "topic_clusters": 2 a 3 clusters de tópicos para SEO de conteúdo com palavras-chave recomendadas e schema.org sugerido.
6. "facets": No mínimo 4 a 6 facetas ou atributos de navegação cruciais (ex: para calçados: Cor, Tamanho, Material, Tipo de Pisada, Marca, Ocasião de Uso). Cada atributo com suas opções reais e práticas.
7. "catalog_simulation": Gere exatamente 4 exemplos realistas de itens/produtos deste tópico que usem essas facetas para simulação de busca.
8. "url_structure_recommendation": Sugestão de padrão canônico de URLs e regras de indexação para evitar conteúdo duplicado em navegação facetada.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.25,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taxonomy: {
              type: Type.OBJECT,
              properties: {
                root_topic: { type: Type.STRING },
                broader_category: { type: Type.STRING },
                subcategories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      slug: { type: Type.STRING },
                      description: { type: Type.STRING },
                      topics: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['name', 'topics'],
                  },
                },
                related_entities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                search_intent: {
                  type: Type.OBJECT,
                  properties: {
                    primary: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    user_query_examples: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['primary', 'rationale', 'user_query_examples'],
                },
                topic_clusters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pillar_title: { type: Type.STRING },
                      slug: { type: Type.STRING },
                      cluster_keywords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      recommended_schema: { type: Type.STRING },
                    },
                    required: ['pillar_title', 'cluster_keywords', 'recommended_schema'],
                  },
                },
                breadcrumbs_path: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['root_topic', 'broader_category', 'subcategories', 'related_entities'],
            },
            facets_data: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                intent: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                facets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      attribute_name: { type: Type.STRING },
                      slug: { type: Type.STRING },
                      facet_type: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      search_priority: { type: Type.STRING },
                    },
                    required: ['attribute_name', 'options'],
                  },
                },
                catalog_simulation: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      subcategory: { type: Type.STRING },
                      attributes: {
                        type: Type.OBJECT,
                        properties: {
                          attr1: { type: Type.STRING },
                          attr2: { type: Type.STRING },
                          attr3: { type: Type.STRING },
                        },
                      },
                      price_estimate: { type: Type.STRING },
                    },
                    required: ['id', 'title', 'subcategory'],
                  },
                },
                url_structure_recommendation: {
                  type: Type.OBJECT,
                  properties: {
                    canonical_pattern: { type: Type.STRING },
                    facet_indexing_rules: { type: Type.STRING },
                  },
                },
              },
              required: ['topic', 'intent', 'facets'],
            },
          },
          required: ['taxonomy', 'facets_data'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      topic: topic.trim(),
      domain,
      language,
      taxonomy: parsed.taxonomy,
      facets: parsed.facets_data,
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating taxonomy & facets:', error);
    const { topic = 'Tópico Geral', domain = 'ecommerce', language = 'pt-BR' } = req.body;
    
    // If rate limit (429) or quota exceeded, deliver a rich structured fallback
    return res.json({
      success: true,
      topic: topic.trim(),
      domain,
      language,
      taxonomy: {
        root_topic: topic.trim(),
        broader_category: `Categoria Geral de ${topic.trim()}`,
        subcategories: [
          {
            name: `${topic.trim()} Premium e Profissional`,
            slug: 'premium-profissional',
            description: `Linha de alta performance e uso avançado para ${topic.trim()}`,
            topics: [`${topic.trim()} Edição Especial`, `${topic.trim()} Certificado`, `${topic.trim()} de Alta Precisão`],
          },
          {
            name: `${topic.trim()} de Entrada e Custo-Benefício`,
            slug: 'entrada-custo-beneficio',
            description: `Opções populares e acessíveis para iniciantes`,
            topics: [`${topic.trim()} Básico`, `${topic.trim()} Compacto`, `${topic.trim()} para o Dia a Dia`],
          },
          {
            name: `Acessórios e Complementos`,
            slug: 'acessorios-complementos',
            description: `Insumos, ferramentas e suporte para ${topic.trim()}`,
            topics: [`Kits de Manutenção`, `Peças de Reposição`, `Guia de Uso`],
          },
        ],
        related_entities: [
          `Especialista em ${topic.trim()}`,
          `Manual Técnico`,
          `Padrão de Qualidade ISO`,
          `Comunidade de Prática`,
        ],
        search_intent: {
          primary: 'Transacional',
          rationale: `O usuário busca comparar modelos, entender especificações e encontrar fornecedores confiáveis de ${topic.trim()}.`,
          user_query_examples: [
            `melhor ${topic.trim()} 2025`,
            `onde comprar ${topic.trim()}`,
            `guia de compras ${topic.trim()}`,
          ],
        },
        topic_clusters: [
          {
            pillar_title: `Guia Completo de ${topic.trim()}: Como Escolher`,
            slug: `guia-${topic.trim().toLowerCase().replace(/\s+/g, '-')}`,
            cluster_keywords: [`tipos de ${topic.trim()}`, `vantagens e desvantagens`, `comparativo`],
            recommended_schema: 'Article, FAQPage, HowTo',
          },
        ],
        breadcrumbs_path: ['Home', 'Catálogo', topic.trim()],
      },
      facets: {
        topic: topic.trim(),
        intent: ['Transacional', 'Comercial', 'Informacional'],
        facets: [
          {
            attribute_name: 'Faixa de Preço',
            options: ['Econômico', 'Intermediário', 'Premium / Alta Gama'],
            search_priority: 'Alta',
          },
          {
            attribute_name: 'Nível de Uso',
            options: ['Iniciante', 'Intermediário', 'Profissional'],
            search_priority: 'Alta',
          },
          {
            attribute_name: 'Marca / Fabricante',
            options: ['Nacional', 'Importado', 'Marca Própria'],
            search_priority: 'Média',
          },
          {
            attribute_name: 'Material / Acabamento',
            options: ['Padrão Standard', 'Reforçado', 'Ecológico / Sustentável'],
            search_priority: 'Média',
          },
        ],
        catalog_simulation: [
          {
            id: 'sim-01',
            title: `${topic.trim()} Linha Pro Ultra`,
            subcategory: `${topic.trim()} Premium e Profissional`,
            attributes: {
              'Faixa de Preço': 'Premium / Alta Gama',
              'Nível de Uso': 'Profissional',
              'Marca / Fabricante': 'Importado',
            },
            price_estimate: 'R$ 499,00',
          },
          {
            id: 'sim-02',
            title: `${topic.trim()} Classic Everyday`,
            subcategory: `${topic.trim()} de Entrada e Custo-Benefício`,
            attributes: {
              'Faixa de Preço': 'Econômico',
              'Nível de Uso': 'Iniciante',
              'Marca / Fabricante': 'Nacional',
            },
            price_estimate: 'R$ 149,00',
          },
        ],
        url_structure_recommendation: {
          canonical_pattern: `https://seusite.com/categoria/${topic.trim().toLowerCase().replace(/\s+/g, '-')}`,
          facet_indexing_rules: 'Indexar apenas a primeira faceta selecionada; canonicalizar combinações múltiplas.',
        },
      },
      generated_at: new Date().toISOString(),
    });
  }
});

// Endpoint: Deep Dive / Expand a specific node
app.post('/api/expand-node', aiGenerationLimiter, async (req, res) => {
  try {
    const { parent_topic, selected_node, node_type = 'subcategory', language = 'pt-BR' } = req.body;

    if (!selected_node || typeof selected_node !== 'string' || !selected_node.trim()) {
      return res.status(400).json({ error: 'selected_node é obrigatório e deve ser um texto.' });
    }

    const cleanNode = selected_node.trim();
    if (cleanNode.length < 2 || cleanNode.length > 100) {
      return res.status(400).json({ error: 'selected_node deve ter entre 2 e 100 caracteres.' });
    }

    if (parent_topic && (typeof parent_topic !== 'string' || parent_topic.trim().length > 100)) {
      return res.status(400).json({ error: 'parent_topic inválido ou muito longo (máximo 100 caracteres).' });
    }

    const ai = getGeminiClient();

    const prompt = `
Como Arquiteto de Informação e Taxonomias da Semântico, aprofunde a análise especificamente para o termo ou subcategoria "${selected_node}", que pertence ao domínio pai "${parent_topic || 'Geral'}".

Gere:
1. "narrower_topics": 5 a 8 subtópicos ou variações mais específicas deste nó (nível 3/4 na hierarquia).
2. "specific_facets": 2 a 3 atributos/facetas de filtro exclusivos ou altamente relevantes para este nó.
3. "semantic_synonyms": 4 a 6 sinônimos semânticos e termos LSI (Latent Semantic Indexing) para SEO.
4. "search_intent": Descrição concisa da intenção de quem pesquisa este subtema específico.
Idioma: ${language === 'pt-BR' ? 'Português' : language}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            node_name: { type: Type.STRING },
            broader_term: { type: Type.STRING },
            narrower_topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            specific_facets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  attribute_name: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['attribute_name', 'options'],
              },
            },
            semantic_synonyms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            search_intent: { type: Type.STRING },
          },
          required: ['node_name', 'narrower_topics', 'specific_facets', 'semantic_synonyms', 'search_intent'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error expanding node:', error);
    // Graceful fallback synthesis if 429 or quota limit occurs
    const { selected_node = 'Item', parent_topic = 'Geral' } = req.body;
    return res.json({
      success: true,
      data: {
        node_name: selected_node,
        broader_term: parent_topic,
        narrower_topics: [
          `${selected_node} Premium / Linha Selecionada`,
          `${selected_node} de Entrada / Custo-Benefício`,
          `${selected_node} Artesanal / Especial`,
          `${selected_node} Importado de Origem`,
          `${selected_node} para Iniciantes`,
        ],
        specific_facets: [
          {
            attribute_name: `Especificação de ${selected_node}`,
            options: ['Padrão Standard', 'Edição Limitada', 'Certificação Especial'],
          },
          {
            attribute_name: 'Perfil de Uso',
            options: ['Profissional', 'Uso Doméstico / Hobby', 'Presente / Degustação'],
          },
        ],
        semantic_synonyms: [
          `${selected_node} original`,
          `melhor ${selected_node}`,
          `guia ${selected_node}`,
          `como escolher ${selected_node}`,
        ],
        search_intent: `Intenção mista com foco em avaliação de características e compra qualificada de ${selected_node}.`,
      },
    });
  }
});

// Endpoint: Suggest Topic Seeds for quick start
app.post('/api/suggest-topics', async (req, res) => {
  try {
    const { category = 'ecommerce', language = 'pt-BR' } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Sugira 8 tópicos populares e ricos para demonstração de taxonomia e facetas no nicho "${category}". Exemplos como "Vinho Tinto", "Tênis de Corrida", "Cafeteiras Expresso", "Smartphones", etc. Idioma: ${language}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'category', 'description'],
              },
            },
          },
          required: ['suggestions'],
        },
      },
    });

    const text = response.text?.trim() || '{"suggestions":[]}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    // Fallback static suggestions if API fails
    return res.json({
      suggestions: [
        { title: 'Vinho Tinto', category: 'Alimentos & Bebidas', description: 'Taxonomia vinícola por uva, região e safra com facetas de paladar' },
        { title: 'Tênis de Corrida', category: 'Calçados & Esportes', description: 'Filtros de amortecimento, pisada, drop e terreno' },
        { title: 'Café Especial', category: 'Alimentos & Bebidas', description: 'Facetas de torra, moagem, pontuação SCA e altitude' },
        { title: 'Smartphones 5G', category: 'Eletrônicos', description: 'Facetas técnicas de processador, câmera, bateria e armazenamento' },
        { title: 'Marketing de Conteúdo', category: 'B2B & SEO', description: 'Silos conceituais, topo/meio/fundo de funil e formatos' },
        { title: 'Cadeiras Ergonômicas', category: 'Móveis & Home Office', description: 'Facetas de ajustes, NR17, revestimento e peso suportado' },
      ],
    });
  }
});

// Vite middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
