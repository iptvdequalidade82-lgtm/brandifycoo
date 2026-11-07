# Brandify — revisão de privacidade e conformidade (pré-publicação)

Atualizado em 7 de novembro de 2026. Branch: `brandify-creative-rebuild-v3`.

Este documento não é um parecer jurídico. **Nenhuma implementação de front-end garante 100% de conformidade com a LGPD.**

## Alterações técnicas implementadas nesta branch

- [x] Removido Meta Pixel (script e noscript) de carregamento incondicional no `index.html`.
- [x] Meta Pixel carregado apenas no site público após consentimento expresso para publicidade.
- [x] Opções de aceite, recusa e personalização; categoria opcional desmarcada por padrão.
- [x] Registro local da escolha por até 180 dias e rota para alterar preferências.
- [x] Revogação interrompe disparos futuros nesta página: solicita revogação à biblioteca, limpa cookies acessíveis e recarrega a aba caso o Pixel tenha sido iniciado.
- [x] Páginas públicas de Privacidade, Cookies e Termos.
- [x] Contato acessível para solicitações sobre dados.
- [x] Horário comercial não confirmado removido do JSON-LD.
- [x] Componente de rodapé com links reais para políticas.

## Verificações obrigatórias fora do front-end

- [ ] **Identificação do controlador:** conferir nome empresarial/razão social, CNPJ (se existir), endereço e canal oficial, e publicar dados corretos em política/contratos.
- [ ] **Inventário de dados e bases legais:** identificar dados efetivamente tratados por Lovable, hospedagem, banco de dados, formulários, pagamentos, clientes e fornecedores; documentar finalidades, base legal e compartilhamentos.
- [ ] **Retenção e exclusão:** definir prazos por categoria (mensagens, contatos, contratos, leads, logs, pagamentos, contas) e fluxos internos para eliminação adequada.
- [ ] **Canal de direitos dos titulares:** estabelecer processo de resposta com autenticação proporcional, registro de solicitações e responsável; não basta o link de e-mail.
- [ ] **Fornecedores e transferências internacionais:** validar políticas, contratos, instruções de tratamento, segurança e transferências de Meta, WhatsApp, hospedagem, banco de dados e serviços comerciais.
- [ ] **Rastreamento completo em produção:** verificar todas as tags, ferramentas e cookies de terceiros em rede e navegador limpo antes e depois do consentimento; assegurar que nenhuma outra tag de marketing esteja disparando sem autorização.
- [ ] **Segurança do backend:** revisar RLS do banco, permissões dos perfis administrativos, autenticação, segregação, backups, acesso aos leads, logs de auditoria e chaves/secrets.
- [ ] **Incidentes de segurança:** implementar fluxo de avaliação, registro e comunicação, observando a Resolução CD/ANPD nº 15/2024 quando cabível.
- [ ] **Crianças e adolescentes:** conferir eventual tratamento específico e riscos se houver usuários menores.
- [ ] **Contratos comerciais e CDC:** precificar corretamente, indicar claramente escopo, direitos, cancelamento/garantias aplicáveis, revisões e custos adicionais.
- [ ] **Revisão jurídica profissional:** validar políticas e documentos contra as operações reais e exigências aplicáveis.

## Referências oficiais

- ANPD, *Guia Orientativo Cookies e Proteção de Dados Pessoais*: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais
- ANPD, *Resolução CD/ANPD nº 2/2022* (pequeno porte): https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022
- ANPD, *Comunicação de Incidente de Segurança*: https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis
