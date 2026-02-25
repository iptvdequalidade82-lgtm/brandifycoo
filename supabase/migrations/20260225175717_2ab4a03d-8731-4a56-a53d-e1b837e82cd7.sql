-- Allow authenticated users to manage their OWN conversations
CREATE POLICY "Users can manage own conversations"
ON public.ai_conversations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to manage messages in their OWN conversations
CREATE POLICY "Users can manage own messages"
ON public.ai_messages
FOR ALL
USING (
  conversation_id IN (
    SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()
  )
);