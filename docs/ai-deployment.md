# Publicação das correções de IA

As alterações no React entram após o deploy do site. As Edge Functions precisam de deploy separado no projeto Supabase `oqkdeoxevxuizynifjjj`; um commit no GitHub não confirma esse deploy.

Com a CLI Supabase autenticada e permissão nesse projeto, publicar:

```sh
supabase functions deploy generate-copy --project-ref oqkdeoxevxuizynifjjj
supabase functions deploy generate-landing --project-ref oqkdeoxevxuizynifjjj
supabase functions deploy atendedor-chat --project-ref oqkdeoxevxuizynifjjj
supabase functions deploy generate-strategic-plan --project-ref oqkdeoxevxuizynifjjj
supabase functions deploy diagnose-instagram --project-ref oqkdeoxevxuizynifjjj
supabase functions deploy generate-instagram-image --project-ref oqkdeoxevxuizynifjjj
```

O diretório `_shared` é importado pelas funções e precisa acompanhar o deploy. Preservar a configuração JWT existente para cada função; não desativar autenticação para resolver problemas de deploy.

## Cota das imagens

Revisar a chave `GEMINI_API_KEY`, a cota e o faturamento na conta Google que emitiu a chave. Um erro 429 não pode ser eliminado por alterações no frontend. Os modelos podem ser configurados pelo segredo opcional `GEMINI_IMAGE_MODELS` (lista separada por vírgulas de modelos disponíveis para essa chave).

Não colocar chaves privadas em variáveis `VITE_*`, no frontend ou no GitHub. A chave pública Supabase não substitui uma chave privada de provedor.

## OpenAI e ChatGPT

O site atualmente usa Gemini para a maioria das funções. O serviço `ai-chat` já contém suporte a OpenAI, porém a interface seleciona Gemini. Usar a API OpenAI exige chave privada no servidor e faturamento separado da assinatura ChatGPT. Não foi ativada cobrança ou migração para OpenAI neste ajuste.

Existe também Sign in with ChatGPT para uso elegível do plano, mas a modalidade comercial/remotamente hospedada depende de admissão pela OpenAI e de registro OAuth. Não equivale a uso ilimitado nem autoriza oferecer a assinatura do proprietário para todos os visitantes.

Referências oficiais:
- https://developers.openai.com/siwc/token-sharing-open-source
- https://developers.openai.com/siwc/request-client-id
- https://developers.openai.com/api/docs/guides/rate-limits

## Validação após publicar

1. Gerar uma copy e um texto de venda sem fornecer prova social; confirmar que não há clientes, depoimentos ou escassez inventados.
2. No atendedor, informar apenas horas, sem dias; conferir que os dias não são deduzidos.
3. Gerar um plano e verificar a estrutura completa e valores não informados.
4. Diagnosticar um perfil com dados incertos; não mostrar nota como comprovada.
5. Gerar uma imagem; se houver 429, revisar a cota da conta provedora antes de insistir.
6. No agendador, testar telefone com +55 e faixa 09:30–10:30.
7. No simulador, comparar o total anual com a soma do gráfico.
