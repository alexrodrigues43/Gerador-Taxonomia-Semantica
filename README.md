O Gerador de Taxonomia Semântica (da Semântico) é uma plataforma profissional de Arquitetura de Informação e SEO Semântico para E-commerce, projetada para planejar, estruturar e otimizar catálogos de produtos de qualquer nicho de mercado.
A plataforma utiliza o modelo Gemini 3.8 Flash integrado a algoritmos de modelagem taxonômica para transformar um termo, segmento ou URL em uma estrutura completa de navegação, facetas de busca, autoridade tópica e especificações técnicas de produto.
Principais Pilares e Funcionalidades

1. Modelagem Taxonômica Avançada
Hierarquia Profunda (L1 a L4): Mapeamento lógico de departamentos, categorias raiz, subcategorias e nichos específicos.
Simulador de Facetas de Navegação: Definição de filtros técnicos e atributos de catálogo (ex.: Tipo de Pisada, Processador, Voltagem, Safra, Resolução), separando o que deve ser categoria indexável do que deve ser filtro facetado para evitar canibalização de SEO.
Matriz Relacional de Atributos: Tabela completa relacionando cada nó aos atributos obrigatórios, recomendados e variações de SKU.
Aprofundamento Contínuo (Drill-Down): Capacidade de selecionar qualquer nó da árvore e expandir sua granularidade com um clique.

2. Visualizações Interativas de Dados
Grafo Semântico Interativo (D3.js): Mapa visual de nós e conexões de relacionamento entre categorias e entidades.
Árvore de Decisão: Visualização estruturada e expansível da árvore de navegação com métricas de profundidade.
Silos Temáticos e Autoridade Tópica (Topical Authority): Agrupamento semântico que orienta a distribuição de PageRank interno, links contextuais e arquitetura de URLs canônicas.

3. Exportações Prontas para Operação
Plataformas de E-commerce: Exportação em CSV nos padrões exigidos por VTEX, Shopify, Magento, WooCommerce e Google Merchant Center.
Dados Estruturados (JSON-LD): Geração automática de Schema.org (BreadcrumbList e ItemPage).
Documentação Técnica: Exportação em Markdown estruturado para manuais de catalogação e equipes de cadastro.

4. Motor de IA e Segurança no Backend
Backend próprio em Node.js/Express que orquestra as chamadas ao Gemini 3.8 Flash via SDK @google/genai.
Chaves de API protegidas no servidor, sem exposição ao navegador do cliente.

5. Gestão de Acesso e Assinaturas (Firebase Auth & Firestore)
Autenticação: Login em 1 clique com Google ou E-mail/Senha.
Paywall Gracioso: Visitantes podem explorar exemplos e navegar pela interface; a geração de novas taxonomias e exportações requer conta ativa.
Desbloqueio em Tempo Real: Escuta via Firestore (onSnapshot) que libera o acesso instantaneamente assim que aprovado no painel, sem necessidade de atualizar a página.
Painel Administrativo: Área restrita para o Super Admin gerenciar assinantes, aprovar solicitações pendentes, alternar planos e acompanhar métricas de uso.
