
-- Fix ai_conversations: drop RESTRICTIVE policies, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage ai_conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.ai_conversations;

CREATE POLICY "Admins can manage ai_conversations"
  ON public.ai_conversations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage own conversations"
  ON public.ai_conversations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix ai_messages: drop RESTRICTIVE policies, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage ai_messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can manage own messages" ON public.ai_messages;

CREATE POLICY "Admins can manage ai_messages"
  ON public.ai_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage own messages"
  ON public.ai_messages FOR ALL TO authenticated
  USING (conversation_id IN (SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()))
  WITH CHECK (conversation_id IN (SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()));
