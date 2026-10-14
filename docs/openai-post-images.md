# Gerador de Posts: OpenAI

Somente a geração e edição de imagens do Gerador de Posts foi migrada. A copy inicial continua no ai-chat/Gemini, e as demais ferramentas não foram alteradas.

## Ativar

1. Configurar o segredo privado `OPENAI_API_KEY` no Supabase do projeto `oqkdeoxevxuizynifjjj`. Não colocar a chave no frontend, GitHub ou conversa.
2. Confirmar que a conta da API possui faturamento, saldo e acesso ao modelo de imagens. Assinatura ChatGPT não substitui faturamento da API.
3. Opcional: configurar `OPENAI_POST_IMAGE_MODEL`. O padrão é `gpt-image-2.5-sunburst`; usar um modelo compatível com os tamanhos personalizados utilizados.
4. Publicar a função e seu módulo compartilhado:

```sh
supabase functions deploy generate-instagram-image --project-ref oqkdeoxevxuizynifjjj
```

Manter as configurações de autenticação existentes. O deploy precisa incluir `_shared/openai-post-image.ts`.

## Comportamento

- Feed: 1024 × 1024. Story: 1152 × 2048 (9:16).
- Uma imagem JPEG, qualidade média por solicitação.
- Referências PNG/JPEG/WebP são enviadas via Images Edits. Sem referência, usa Images Generations.
- Sem tentativas automáticas nem fallback para Gemini, para evitar cobranças duplicadas.
- Falta de chave: 503; cota/saldo esgotado: 402; limite temporário: 429.
- Contrato existente preservado: `{ imageUrl: "data:image/jpeg;base64,..." }`.

## Validação

Os testes automatizados usam fetch simulado e não geram cobrança. A geração real depende de chave, deploy e teste no projeto. A migração não altera o contador de créditos local nem implementa controle central de gastos; acompanhar o uso e os limites na conta OpenAI.

Referência: https://developers.openai.com/api/docs/guides/image-generation
