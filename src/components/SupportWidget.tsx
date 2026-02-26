import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Ticket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import type { User } from "@supabase/supabase-js";

const SUPPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_QUESTIONS = [
  { icon: "❓", label: "Limite gratuito", prompt: "Eu só tenho 5 chances grátis por dia?" },
  { icon: "💰", label: "Preços e descontos", prompt: "O preço é esse mesmo, não tem como diminuir?" },
  { icon: "🖼️", label: "Como funciona", prompt: "Como funciona a geração de imagem do IA Studio?" },
  { icon: "🌐", label: "Prazo de site", prompt: "Quanto tempo leva pra fazer um site?" },
  { icon: "💳", label: "Formas de pagamento", prompt: "Quais formas de pagamento vocês aceitam?" },
  { icon: "🚀", label: "Plano Pro", prompt: "O que vem no Plano Pro do IA Studio?" },
];

export default function SupportWidget({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "ticket">("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Ticket form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSending, setTicketSending] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streamContent, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamContent("");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const resp = await fetch(SUPPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro no suporte" }));
        throw new Error(err.error || "Erro no suporte");
      }

      if (!resp.body) throw new Error("Sem resposta");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { full += c; setStreamContent(full); }
          } catch { /* partial */ }
        }
      }

      if (full) {
        setMessages(prev => [...prev, { role: "assistant", content: full }]);
      }
      setStreamContent("");
    } catch (e: any) {
      if (e.name === "AbortError") {
        toast({ title: "Timeout", description: "A resposta demorou muito. Tente novamente.", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: e.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Faça login para enviar um ticket", variant: "destructive" });
      return;
    }
    setTicketSending(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        user_email: user.email || "",
        user_name: user.user_metadata?.full_name || user.email || "",
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
      });
      if (error) throw error;
      toast({ title: "Ticket enviado! ✅", description: "Nossa equipe vai responder em breve." });
      setTicketSubject("");
      setTicketMessage("");
      setView("chat");
    } catch (e: any) {
      toast({ title: "Erro ao enviar ticket", description: e.message, variant: "destructive" });
    } finally {
      setTicketSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Suporte"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                {view === "ticket" && (
                  <button onClick={() => setView("chat")} className="hover:opacity-80">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">{view === "chat" ? "Suporte Brandify" : "Abrir Ticket"}</span>
              </div>
              <div className="flex items-center gap-1">
                {view === "chat" && user && (
                  <button
                    onClick={() => setView("ticket")}
                    className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                    title="Abrir ticket de suporte"
                  >
                    <Ticket className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {view === "chat" ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 px-3 py-2" ref={scrollRef as any}>
                  <div ref={scrollRef} className="space-y-3">
                    {messages.length === 0 && !streamContent && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-muted-foreground text-center">
                          👋 Olá! Como posso ajudar?
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {QUICK_QUESTIONS.map((q) => (
                            <button
                              key={q.label}
                              onClick={() => sendMessage(q.prompt)}
                              className="text-left text-xs p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                            >
                              <span className="mr-1">{q.icon}</span>
                              {q.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                            m.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {m.role === "assistant" ? (
                            <div className="prose prose-xs prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0">
                              <ReactMarkdown>{m.content}</ReactMarkdown>
                            </div>
                          ) : (
                            m.content
                          )}
                        </div>
                      </div>
                    ))}

                    {streamContent && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-xl px-3 py-2 text-xs bg-muted text-foreground">
                          <div className="prose prose-xs prose-invert max-w-none [&>p]:m-0">
                            <ReactMarkdown>{streamContent}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {loading && !streamContent && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-xl px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-border">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                    className="flex gap-2"
                  >
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                      placeholder="Digite sua dúvida..."
                      className="flex-1 resize-none text-xs min-h-[36px] max-h-[80px]"
                      rows={1}
                    />
                    <Button type="submit" size="icon" className="shrink-0 h-9 w-9" disabled={loading || !input.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                  {!user && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                      <a href="/login" className="underline hover:text-foreground">Faça login</a> para abrir tickets de suporte
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Ticket Form */
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <p className="text-xs text-muted-foreground">
                  Descreva seu problema e nossa equipe responderá em breve.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground">Assunto</label>
                    <Input
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Ex: Erro ao gerar imagem"
                      className="mt-1 text-xs"
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Mensagem</label>
                    <Textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Descreva o problema em detalhes..."
                      className="mt-1 text-xs min-h-[120px]"
                      maxLength={2000}
                    />
                  </div>
                  <Button onClick={submitTicket} disabled={ticketSending} className="w-full">
                    {ticketSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ticket className="w-4 h-4 mr-2" />}
                    Enviar Ticket
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
