import { useState, useRef, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import brandifyLogo from "@/assets/logo.jpg";
import {
  Plus, Send, Trash2, MessageSquare, Image as ImageIcon, Bot, Sparkles, Loader2, ChevronLeft, ChevronRight, Paperclip, X,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; image_urls?: string[]; model_used?: string };
type Conversation = { id: string; title: string; model: string; created_at: string; updated_at: string };

const MODEL_OPTIONS = [
  { value: "auto", label: "Auto", desc: "Escolhe a melhor IA automaticamente" },
  { value: "gemini", label: "Gemini", desc: "Google Gemini — rápido e criativo" },
  { value: "gpt", label: "GPT", desc: "OpenAI GPT — preciso e analítico" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export default function AdminIAs() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [imageMode, setImageMode] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("ai_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setConversations(data as Conversation[]);
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    loadMessages(activeConvId);
  }, [activeConvId]);

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map((m: any) => ({
        role: m.role,
        content: m.content,
        image_urls: m.image_urls || [],
        model_used: m.model_used,
      })));
    }
  };

  const createConversation = async (): Promise<string> => {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: user!.id, title: "Nova conversa", model })
      .select()
      .single();
    if (error) throw error;
    const conv = data as Conversation;
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
    return conv.id;
  };

  const saveMessage = async (convId: string, msg: Msg) => {
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: msg.role,
      content: msg.content,
      image_urls: msg.image_urls || [],
      model_used: msg.model_used || null,
    });
  };

  const updateConversationTitle = async (convId: string, firstMsg: string) => {
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? "…" : "");
    await supabase.from("ai_conversations").update({ title }).eq("id", convId);
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, title } : c)));
  };

  const deleteConversation = async (convId: string) => {
    await supabase.from("ai_conversations").delete().eq("id", convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
      setMessages([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Formato inválido", description: "Selecione apenas imagens.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "Máximo 10MB por imagem.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setAttachedImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if ((!text && attachedImages.length === 0) || isLoading) return;

    const currentAttachments = [...attachedImages];
    // Auto-detect: if images are attached, automatically use image mode
    const shouldUseImageMode = imageMode || currentAttachments.length > 0;
    setInput("");
    setAttachedImages([]);
    setIsLoading(true);
    if (shouldUseImageMode) setIsGeneratingImage(true);

    try {
      let convId = activeConvId;
      if (!convId) convId = await createConversation();

      const userMsg: Msg = { role: "user", content: text || "(imagem anexada)", image_urls: currentAttachments.length > 0 ? currentAttachments : undefined };
      setMessages((prev) => [...prev, userMsg]);
      await saveMessage(convId, userMsg);

      // Update title on first message
      if (messages.length === 0) await updateConversationTitle(convId, text || "Imagem anexada");

      // Build API messages - for multimodal, use content array format
      const apiMessages = [...messages, userMsg].map((m) => {
        if (m.image_urls && m.image_urls.length > 0) {
          const content: any[] = [];
          if (m.content && m.content !== "(imagem anexada)") {
            content.push({ type: "text", text: m.content });
          }
          m.image_urls.forEach((url) => {
            content.push({ type: "image_url", image_url: { url } });
          });
          if (content.length === 0) content.push({ type: "text", text: "Analise esta imagem." });
          return { role: m.role, content };
        }
        return { role: m.role, content: m.content };
      });

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (shouldUseImageMode) {
        // Non-streaming image generation
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ messages: apiMessages, model, generateImage: true }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(err.error || `Erro ${resp.status}`);
        }

        const data = await resp.json();
        const assistantMsg: Msg = {
          role: "assistant",
          content: data.content || "Imagem gerada com sucesso!",
          image_urls: data.imageUrl ? [data.imageUrl] : [],
          model_used: data.model,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        await saveMessage(convId, assistantMsg);
      } else {
        // Streaming text
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ messages: apiMessages, model, conversationId: convId }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(err.error || `Erro ${resp.status}`);
        }

        const modelUsed = resp.headers.get("X-Model-Used") || model;
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantSoFar = "";

        const upsert = (chunk: string) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
            return [...prev, { role: "assistant", content: assistantSoFar, model_used: modelUsed }];
          });
        };

        let streamDone = false;
        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") { streamDone = true; break; }
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsert(content);
            } catch { buffer = line + "\n" + buffer; break; }
          }
        }

        // Save final assistant message
        const finalMsg: Msg = { role: "assistant", content: assistantSoFar, model_used: modelUsed };
        await saveMessage(convId, finalMsg);
      }

      // Update conversation timestamp
      await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  }, [input, isLoading, activeConvId, messages, model, imageMode, attachedImages, user, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNew = () => {
    setActiveConvId(null);
    setMessages([]);
    setInput("");
    setAttachedImages([]);
    textareaRef.current?.focus();
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-8rem)] -mx-6 -mt-6 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 border-r border-white/[0.06] flex flex-col bg-[#0c0c0c] overflow-hidden`}>
          <div className="p-3 border-b border-white/[0.06]">
            <Button onClick={startNew} className="w-full gap-2 bg-white/[0.06] hover:bg-white/[0.10] text-white border-0" variant="outline" size="sm">
              <Plus className="w-4 h-4" /> Nova conversa
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all ${
                    activeConvId === c.id ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                  onClick={() => setActiveConvId(c.id)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">{c.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0a]">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/40 hover:text-white transition-colors">
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg p-1">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setModel(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    model === opt.value
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/40 hover:text-white/60"
                  }`}
                  title={opt.desc}
                >
                  {opt.value === "auto" && <Sparkles className="w-3 h-3 inline mr-1" />}
                  {opt.label}
                </button>
              ))}
            </div>



            <span className="ml-auto text-[11px] text-white/20">
              {model === "auto" ? "Auto" : model === "gpt" ? "GPT" : "Gemini"}
            </span>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <img src={brandifyLogo} alt="Brandify" className="w-16 h-16 rounded-2xl mb-4 opacity-60" />
                <h2 className="text-xl font-semibold text-white/60 mb-2">Brandify IA</h2>
                <p className="text-sm text-white/30 max-w-md">
                  Converse com GPT ou Gemini. Gere textos, imagens, estratégias de marketing e muito mais.
                </p>
                <div className="flex gap-2 mt-6 flex-wrap justify-center">
                  {["Crie um copy para Instagram", "Gere ideias de conteúdo", "Analise minha estratégia"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                      className="px-4 py-2 rounded-xl text-xs text-white/50 bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/[0.06]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-1">
                        <img src={brandifyLogo} alt="Brandify" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-md px-4 py-3"
                        : "bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3"
                    }`}>
                      {msg.image_urls && msg.image_urls.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {msg.image_urls.map((url, j) => (
                            <img key={j} src={url} alt="Generated" className="rounded-xl max-w-full max-h-96 object-contain" />
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-white/90 leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.model_used && (
                        <span className="text-[10px] text-white/20 mt-2 block">
                          {msg.model_used.includes("gemini") ? "Gemini" : msg.model_used.includes("gpt") ? "GPT" : msg.model_used}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <img src={brandifyLogo} alt="Brandify" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
                      {isGeneratingImage ? (
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center overflow-hidden">
                            <ImageIcon className="w-5 h-5 text-blue-400 animate-pulse" />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent animate-pulse" />
                          </div>
                          <div>
                            <p className="text-sm text-white/70 font-medium">Gerando imagem…</p>
                            <p className="text-[11px] text-white/30">Isso pode levar alguns segundos</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-white/[0.06] bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto">
              {/* Attached images preview */}
              {attachedImages.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {attachedImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="Anexo" className="w-16 h-16 object-cover rounded-lg border border-white/[0.1]" />
                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 w-12 shrink-0 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
                  title="Anexar imagem"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={attachedImages.length > 0 ? "Descreva o que fazer com a imagem..." : imageMode ? "Descreva a imagem que deseja gerar..." : "Digite sua mensagem..."}
                  className="min-h-[48px] max-h-[200px] resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 rounded-xl focus:border-blue-500/50"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
                  className="h-12 w-12 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30"
                  size="icon"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
