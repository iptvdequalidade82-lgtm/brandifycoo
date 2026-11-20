# Auditoria SEO + GEO — Brandify (84 tópicos)

**Branch exclusiva:** `brandify-creative-rebuild-v3` · **Data:** 20/11/2026  
**Escopo:** código React/Vite, conteúdo institucional e documentação oficial do Google. **Não há acesso autenticado ao Google Search Console, Google Business Profile, Analytics ou logs da hospedagem.** O domínio `brandifycoo.br` aparece como canônico no código, mas sua disponibilidade externa não pôde ser confirmada pela ferramenta de consulta.

## O que foi efetivamente implementado

- Metadados específicos nas **7 rotas públicas**: início, sites institucionais, landing pages, lojas virtuais, privacidade, termos e cookies.
- Geração de HTML de entrada com **title, description, Open Graph e canonical** próprio para cada rota no build (`scripts/build-seo.mjs`). **A interface React ainda depende de JavaScript; isto não equivale a SSR completo.**
- **Sitemap XML** com 7 URLs gerado no build e `robots.txt` com o endereço do sitemap.
- Página própria para cada serviço, com **H1**, subtítulos, informações de escopo, dúvidas e contato. A página Store explica claramente que o cliente cadastra produtos e administra pagamento e frete.
- Links internos reais na homepage, nas páginas de serviço e no rodapé; URLs descritivas.
- Dados estruturados `Organization` e `WebSite` na home; `Organization`, `Service` e `BreadcrumbList` nas páginas de serviço após renderização. **Sem inventar avaliações, preços, endereço completo ou resultados comerciais.**
- `noindex` client-side em rotas não públicas / desconhecidas; página 404 em português. **Status HTTP real e cabeçalhos precisam ser testados na hospedagem.**
- Carregamento separado (lazy loading) das páginas administrativas, pagamentos, páginas legais e serviços para diminuir o pacote inicial.
- Remoção do meta `keywords`, ignorado pelo Google.
- Preservada a homepage, o design editorial, as animações e as condições comerciais reais.

**Legenda:** C = coberto no código; P = parcialmente coberto; E = exige ferramenta/dados externos; R = trabalho recorrente; N = não prioritário ou não aplicável. **C não significa resultado de ranqueamento.**

## Matriz dos 84 itens recebidos

| Nº | Assunto | Situação e evidência |
|---:|---|---|
| 01 | Intenção de busca | P — serviços mapeados por necessidade; validar consultas reais |
| 02 | Palavra-chave | P — temas dos três serviços, sem volume inventado |
| 03 | Volume de busca | E — Search Console/planejador |
| 04 | Cauda longa | P — páginas específicas por serviço; pesquisa pendente |
| 05 | Dificuldade de palavra-chave | E — SERP e ferramentas de concorrência |
| 06 | Busca local | P — Jacarezinho/PR no conteúdo e metadados |
| 07 | Busca de marca | P — Brandify e entidade definidos; volume externo |
| 08 | Concorrente de SERP | E — comparação real pendente |
| 09 | Gap de palavras-chave | E — precisa de dados de concorrentes |
| 10 | Mapa de palavras-chave | C — home + três páginas de intenção definida |
| 11 | Pergunta do cliente | P — FAQ de serviços; validar dúvidas por atendimento real |
| 12 | Sazonalidade | R — acompanhar campanhas e dados |
| 13 | Googlebot | E — cobertura de rastreamento em Search Console |
| 14 | Rastreamento (crawl) | E — requer teste de URL e logs |
| 15 | Sitemap XML | C — gerado no build, 7 URLs |
| 16 | Robots.txt | C — indica sitemap e permite rastreamento público |
| 17 | Link interno | C — links contextuais entre home, serviços e rodapé |
| 18 | Página órfã | P — sete rotas públicas conectadas; validar crawl após publicar |
| 19 | Crawl budget | N — sete URLs públicas; sem evidência de problema |
| 20 | Código de status | E — verificar HTTP 200/301/404 em produção |
| 21 | Redirecionamento 301 | E — checar www, HTTP→HTTPS e URLs antigas na hospedagem |
| 22 | Erro 404 | P — página própria e noindex client-side; verificar HTTP 404 |
| 23 | Renderização de JavaScript | P — metadados iniciais gerados; conteúdo React ainda renderizado no cliente |
| 24 | Estatísticas de rastreamento | E — Search Console/logs |
| 25 | Indexação | E — não é possível confirmar sem Search Console |
| 26 | Noindex | P — rotas privadas/desconhecidas no cliente; validar cabeçalhos de servidor |
| 27 | Tag canonical | C — canônico único para 7 rotas; **confirmar domínio principal** |
| 28 | Conteúdo duplicado | P — metadados e conteúdo por serviço; auditar URL final |
| 29 | Inspeção de URL | E — Search Console |
| 30 | Detectada, mas não indexada | E — relatório Search Console |
| 31 | Rastreada, mas não indexada | E — relatório Search Console |
| 32 | Indexação mobile-first | P — layout responsivo; testar render mobile Google |
| 33 | Hreflang | N — site somente em pt-BR |
| 34 | Estrutura de URL | C — caminhos diretos por serviço |
| 35 | Slug | C — slugs legíveis e descritivos |
| 36 | Arquitetura do site | C — home → serviço → contato; páginas legais conectadas |
| 37 | Title tag | C — únicos nas 7 rotas |
| 38 | Meta description | C — únicas, sem resultados inventados |
| 39 | H1 | C — H1 próprio na home, serviços e páginas legais |
| 40 | H2 e H3 | C — hierarquia de seções nas páginas comerciais |
| 41 | Texto âncora | C — rótulos de serviços descritivos |
| 42 | Texto alternativo | P — imagens informativas existentes; revisar visual final |
| 43 | Conteúdo útil | C — escopo, entregas, processo, dúvidas e limitações reais |
| 44 | Ganho de informação | P — diferenciação por escopo; provas originais dependem de clientes |
| 45 | Página de serviço | C — três novas rotas comerciais |
| 46 | Página pilar | P — home apresenta serviços e distribui links |
| 47 | Cluster de conteúdo | P — interligações iniciais; não criar blog vazio |
| 48 | Autoridade de tópico | R — depende de conteúdo, evidências e confiança ao longo do tempo |
| 49 | Canibalização | E — reavaliar após dados de queries |
| 50 | Conteúdo raso | P — novas páginas substantivas; revisar engajamento real |
| 51 | Atualização de conteúdo | R — revisar conforme oferta e política comercial mudarem |
| 52 | Decaimento de conteúdo | R — monitorar desempenho ao longo do tempo |
| 53 | E-E-A-T | P — escopo transparente; equipe/cases/reputação precisam de provas reais |
| 54 | Backlink | E — análise externa |
| 55 | Domínio de referência | E — análise externa |
| 56 | Link nofollow | N — sem links pagos identificados que exijam marcação |
| 57 | Menção de marca | E — análise externa |
| 58 | Autor identificado | P — marca identificada; não inventar autores ou credenciais |
| 59 | Página Sobre | P — seção Estúdio na home; dados de responsáveis pendentes |
| 60 | Avaliações | E — publicar apenas avaliações autênticas autorizadas |
| 61 | NAP | P — cidade, telefone e email; endereço físico não verificado |
| 62 | Link building | R — parcerias e menções legítimas |
| 63 | Link comprado | N — não recomendado como técnica de manipulação |
| 64 | HTTPS | E — canônicos usam HTTPS, mas certificado e redirecionamento não verificados |
| 65 | SERP | E — auditoria de resultados atuais |
| 66 | Resultado orgânico | E — precisa de dados reais de impressões e cliques |
| 67 | Featured snippet | R — respostas diretas podem ajudar; sem garantia |
| 68 | People Also Ask | P — FAQ útil; consultas reais não verificadas |
| 69 | Rich results | P — schema válido deve ser testado; exibição não é garantida |
| 70 | Dados estruturados | C — Organization, WebSite, Service e BreadcrumbList |
| 71 | Perfil da Empresa no Google | E — verificar/criar perfil legítimo conforme elegibilidade |
| 72 | Local Pack | E — depende de dados locais, perfil e relevância |
| 73 | Zero clique | N — fenômeno de SERP, não algo controlável pelo código |
| 74 | Recursos da SERP | R — monitorar após indexação |
| 75 | SEO para YouTube | N — não há estratégia de vídeo vinculada ao escopo atual |
| 76 | Google Discover | N — site comercial sem conteúdo editorial recorrente |
| 77 | GEO | P — clareza, estrutura, conteúdo útil e entidade identificada |
| 78 | AI Overview | E — não existe inclusão garantida nem marcação especial obrigatória |
| 79 | Modo IA | E — depende de busca e critérios dos mecanismos |
| 80 | Citação | E — não se pode forçar citações de IAs |
| 81 | Query fan-out | P — subtemas de serviços respondidos de forma contextual; sem páginas artificiais |
| 82 | Grounding | P — fatos rastreáveis da própria oferta, sem métricas falsas |
| 83 | Entidade | C — Brandify representada por Organization + URLs oficiais |
| 84 | Knowledge Graph | E — presença depende de fontes e reconhecimento externo |

## Pendências de maior prioridade antes de publicar

1. **Domínio:** confirmar se `https://brandifycoo.br/` é realmente o endereço público canônico e se `www` redireciona corretamente. Se estiver em outro domínio, trocar origem no HTML, JSON-LD, sitemap e configuração de SEO.
2. **Hospedagem:** abrir as sete URLs diretamente e confirmar que cada uma serve HTML com título, descrição e canonical corretos. Conferir se o host disponibiliza `/sitemap.xml` e `/robots.txt`.
3. **HTTP status e segurança:** garantir que URLs inexistentes devolvam **404 real**, e rotas administrativas/privadas tenham política de noindex em nível de servidor sem expor dados. Configuração exata depende do host.
4. **Google Search Console:** verificar propriedade, enviar sitemap e acompanhar inspeção, indexação, impressões e consultas. Sem isso, não é possível aferir volume, posições e erros reais.
5. **Performance:** executar PageSpeed/Lighthouse e medir LCP, INP, CLS e payload em celular. Código foi dividido por rotas, mas não há medição real de Core Web Vitals.
6. **Dados da empresa:** confirmar NAP, identidade jurídica, serviços e eventual Perfil da Empresa no Google. Não adicionar endereço, avaliações ou horários inventados.
7. **Confiança:** acrescentar apenas cases autorizados, processo real e depoimentos documentados, quando disponíveis.
8. **Compartilhamento:** verificar se a imagem atual de Open Graph realmente responde e representa a identidade da Brandify.
9. **Renderização:** inspecionar o HTML renderizado no Search Console. O projeto ainda é uma SPA React, não uma aplicação totalmente pré-renderizada.

## Referências oficiais

- [Google: SEO em JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: criar e enviar sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: conteúdo útil e centrado nas pessoas](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: dados estruturados da Organização](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google: otimização para experiências de IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

A implementação é uma **melhoria técnica de SEO**, não uma promessa de primeira página, snippet, avaliações, tráfego ou citação por IA.

## Validação externa e revisão adicional — 20/11/2026

- **Site publicado não confirmado:** tentativas de abrir `https://brandifycoo.br/`, `/robots.txt` e `/sitemap.xml` por ferramenta externa não tiveram resposta acessível. Isso **não comprova** que o domínio esteja offline, apenas impede validar a publicação por esse método.
- **Indexação pública não comprovada:** a busca `site:brandifycoo.br` não retornou páginas atribuíveis à BrandifyCoo nesta verificação. A situação oficial deve ser confirmada por Google Search Console.
- **Endereço do site ainda pendente:** o repositório Lovable contém URL de projeto placeholder no README e não identifica uma URL publicada verificável. A auditoria não deve presumir que `brandifycoo.br` é o domínio ativo.
- **Dados estruturados renderizados no HTML estático:** após revisão, as páginas de serviços agora incluem `Organization`, `Service` e `BreadcrumbList` também no HTML gerado, sem depender somente de JavaScript.
- **Teste automático de SEO:** `npm run build` executa `scripts/verify-seo.mjs` depois de gerar os arquivos e verifica as sete URLs, canônicos, metadados, sitemap, robots e JSON-LD. Isso valida os artefatos locais, **não a configuração do servidor público**.
- **Próximo bloqueio real:** fornecer o link público de produção ou conectar o Search Console. Não configurar verificação de propriedade ou publicar mudanças sem saber o domínio correto.
