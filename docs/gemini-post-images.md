# Imagens dos posts: Gemini

O Gerador de Posts chama somente a API Gemini. Não usa OpenAI nem alterna automaticamente entre provedores. As demais ferramentas permanecem como estavam.

## Configuração
1. Crie ou consulte a chave em https://aistudio.google.com/apikey .
2. No projeto Supabase oqkdeoxevxuizynifjjj, configure GEMINI_API_KEY em Edge Functions > Secrets. Não inclua a chave no frontend ou no GitHub.
3. Modelo padrão: gemini-3.1-flash-image. Opcional: GEMINI_POST_IMAGE_MODEL para escolher outro modelo compatível com GenerateContent e resposta de imagem em 1K.
4. Publique a função incluindo o módulo compartilhado:
```sh
supabase functions deploy generate-instagram-image --project-ref oqkdeoxevxuizynifjjj
```
Preserve a configuração de autenticação do projeto.

A geração de imagens desse modelo não tem camada gratuita na tabela de preços consultada. Verifique faturamento e cota no projeto Google antes de usar; uma chave válida não garante saldo nem acesso ao modelo.
Fontes: https://ai.google.dev/gemini-api/docs/pricing e https://ai.google.dev/gemini-api/docs/generate-content/image-generation .

Feed usa 1:1; story usa 9:16; ambos em 1K. Referências PNG/JPEG/WebP são enviadas ao Gemini. Cada solicitação faz uma chamada, sem repetição automática. Erros 429 indicam cota; 503 indica configuração/acesso/modelo; 422 indica ausência de imagem; 504 indica tempo esgotado e a solicitação pode ter sido processada.

Os testes usam chamadas simuladas. Esta alteração no repositório não confirma publicação da função, configuração dos segredos ou geração real no site.
