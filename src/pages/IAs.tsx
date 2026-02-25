import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, MessageSquare, ImagePlus, LogOut, ArrowLeft, Zap, Send,
  Download, Loader2, Plus, Trash2, X, Image as ImageIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import logo from "@/assets/logo.jpg";

// ── Types ──
type Msg = { role: "user" | "assistant"; content: string; image_urls?: string[]; model_used?: string };
type Conversation = { id: string; title: string; model: string; created_at: string; updated_at: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-instagram-image`;

// ── Post Generator Tab ──
function PostGenerator({ user }: { user: User }) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [postType, setPostType] = useState<"feed" | "story">("feed");
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const MAX_WEEKLY = 5;

  // Check weekly usage
  useEffect(() => {
    const checkUsage = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const stored = localStorage.getItem(`post_gen_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        const validEntries = data.filter((d: string) => new Date(d) > weekAgo);
        setWeeklyCount(validEntries.length);
      }
    };
    checkUsage();
  }, [user.id]);

  const trackUsage = () => {
    const stored = localStorage.getItem(`post_gen_${user.id}`);
    const data = stored ? JSON.parse(stored) : [];
    data.push(new Date().toISOString());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const filtered = data.filter((d: string) => new Date(d) > weekAgo);
    localStorage.setItem(`post_gen_${user.id}`, JSON.stringify(filtered));
    setWeeklyCount(filtered.length);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Descreva o que deseja", description: "Ex: Post para clínica odontológica sobre clareamento dental", variant: "destructive" });
      return;
    }
    if (weeklyCount >= MAX_WEEKLY) {
      toast({ title: "Limite semanal atingido", description: `Você já usou ${MAX_WEEKLY} gerações esta semana. Tente novamente na próxima semana.`, variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: prompt.trim(), type: postType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImages((prev) => [{ url: data.imageUrl, prompt: prompt.trim() }, ...prev]);
        trackUsage();
        toast({ title: "Post gerado com sucesso! 🎨" });
      } else {
        throw new Error("Nenhuma imagem foi gerada");
      }
    } catch (e: any) {
      toast({ title: "Erro ao gerar", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `brandify-post-${index + 1}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Generator Input */}
      <div className="p-4 md:p-6 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
              <ImagePlus className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>
                Gerador de Posts
              </h2>
              <p className="text-white/40 text-xs">
                {weeklyCount}/{MAX_WEEKLY} gerações usadas esta semana
              </p>
            </div>
          </div>

          {/* Format selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPostType("feed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                postType === "feed"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/40 hover:text-white/60 border border-transparent"
              }`}
            >
              📐 Feed (1:1)
            </button>
            <button
              onClick={() => setPostType("story")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                postType === "story"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/40 hover:text-white/60 border border-transparent"
              }`}
            >
              📱 Story (9:16)
            </button>
          </div>

          {/* Prompt input */}
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o post que deseja... Ex: Post para restaurante japonês promovendo rodízio de sushi no fim de semana"
              className="min-h-[100px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 resize-none rounded-xl pr-14 focus:border-violet-500/50 focus:ring-violet-500/20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
              }}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || weeklyCount >= MAX_WEEKLY}
              className="absolute bottom-3 right-3 h-10 w-10 p-0 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </Button>
          </div>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/[0.08] border border-violet-500/20"
            >
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-violet-300 text-sm">Gerando seu post com IA... pode levar até 30 segundos</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Generated Images Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {generatedImages.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                  <ImagePlus className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-white/50 font-medium text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Nenhum post gerado ainda
                </h3>
                <p className="text-white/30 text-sm max-w-md">
                  Descreva o tipo de post que você quer e nossa IA vai criar uma imagem profissional para suas redes sociais.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {generatedImages.map((img, i) => (
                    <motion.div
                      key={`${img.prompt}-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]"
                    >
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-white/80 text-xs line-clamp-2 mb-3">{img.prompt}</p>
                        <Button
                          onClick={() => handleDownload(img.url, i)}
                          size="sm"
                          className="w-fit bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white text-xs"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Baixar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Chat Bubble ──
const ChatBubble = memo(({ msg }: { msg: Msg }) => (
  <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-1">
        <img src={logo} alt="Brandify" className="w-full h-full object-cover" />
      </div>
    )}
    <div className={`max-w-[85%] md:max-w-[75%] ${
      msg.role === "user"
        ? "bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-md px-4 py-3"
        : "bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3"
    }`}>
      {msg.image_urls && msg.image_urls.length > 0 && (
        <div className="mb-3 space-y-2">
          {msg.image_urls.map((url, j) => (
            <img key={j} src={url} alt="" className="rounded-xl max-w-full max-h-96 object-contain" />
          ))}
        </div>
      )}
      <div className="text-sm text-white/90 leading-relaxed prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
    </div>
  </div>
));
ChatBubble.displayName = "ChatBubble";

// ── Chat Tab ──
function ChatTab({ user }: { user: User }) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      tokenRef.current = session?.access_token || null;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      tokenRef.current = s?.access_token || null;
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setConversations(data as Conversation[]);
  };

  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data.map((m: any) => ({ role: m.role, content: m.content, image_urls: m.image_urls || [], model_used: m.model_used })));
    })();
  }, [activeConvId]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      let convId = activeConvId;
      if (!convId) {
        const { data, error } = await supabase
          .from("ai_conversations")
          .insert({ user_id: user.id, title: text.slice(0, 60), model: "auto" })
          .select()
          .single();
        if (error) throw error;
        convId = data.id;
        setConversations((prev) => [data as Conversation, ...prev]);
        setActiveConvId(convId);
      }

      const userMsg: Msg = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      supabase.from("ai_messages").insert({ conversation_id: convId, role: "user", content: text });

      const apiMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const token = tokenRef.current;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: apiMessages, model: "auto", conversationId: convId }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro" }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      const reader = resp.body!.getReader();
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
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) { full += c; setStreamingContent(full); }
          } catch {}
        }
      }

      const finalMsg: Msg = { role: "assistant", content: full };
      setStreamingContent("");
      setMessages((prev) => [...prev, finalMsg]);
      supabase.from("ai_messages").insert({ conversation_id: convId, role: "assistant", content: full });
      supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    } catch (e: any) {
      setStreamingContent("");
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeConvId, messages, user, toast]);

  const startNew = () => {
    setActiveConvId(null);
    setMessages([]);
    setInput("");
    setStreamingContent("");
    setShowSidebar(false);
  };

  const deleteConv = async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) startNew();
  };

  return (
    <div className="flex h-full relative">
      {/* Sidebar toggle */}
      {conversations.length > 0 && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-3 left-3 z-20 p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white transition-all"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      )}

      {/* Conversations sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setShowSidebar(false)} />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              className="absolute left-0 top-0 bottom-0 w-64 z-40 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col"
            >
              <div className="p-3 border-b border-white/[0.06] flex items-center gap-2">
                <Button onClick={startNew} size="sm" variant="outline" className="flex-1 gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/[0.1]">
                  <Plus className="w-4 h-4" /> Nova conversa
                </Button>
                <button onClick={() => setShowSidebar(false)} className="text-white/40 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                        activeConvId === c.id ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/[0.04]"
                      }`}
                      onClick={() => { setActiveConvId(c.id); setShowSidebar(false); }}
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1">{c.title}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConv(c.id); }}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 && !streamingContent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-white/50 font-medium text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Chat com IA
                </h3>
                <p className="text-white/30 text-sm max-w-md">
                  Tire dúvidas, gere textos, crie estratégias de marketing e muito mais. Uso ilimitado.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {streamingContent && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-1">
                      <img src={logo} alt="Brandify" className="w-full h-full object-cover" />
                    </div>
                    <div className="max-w-[85%] bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="text-sm text-white/90 leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="min-h-[52px] max-h-[150px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 resize-none rounded-xl pr-14 focus:border-blue-500/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute bottom-2 right-2 h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function IAs() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[150px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10 max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Sparkles className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Ferramentas de IA
          </h1>
          <p className="text-white/50 text-lg mb-8">
            Crie posts profissionais para suas redes sociais com inteligência artificial. Faça login para começar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button className="h-12 px-8 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white border-0 font-semibold text-base">
                <Zap className="w-5 h-5 mr-2" /> Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button variant="outline" className="h-12 px-8 bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1] font-semibold text-base">
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050508] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-white/[0.06] bg-[#050508]/90 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src={logo} alt="Brandify" className="h-8 w-8 rounded-full ring-1 ring-white/20" />
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <span className="text-white font-semibold text-sm flex items-center gap-1.5" style={{ fontFamily: "'Sora', sans-serif" }}>
              <Sparkles className="w-4 h-4 text-violet-400" />
              IA Studio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/[0.05] text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/40 hover:text-white hover:bg-white/[0.05] text-xs">
              <LogOut className="w-3.5 h-3.5 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content with Tabs */}
      <Tabs defaultValue="posts" className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 border-b border-white/[0.06] px-4 md:px-6">
          <TabsList className="bg-transparent h-11 p-0 gap-4">
            <TabsTrigger
              value="posts"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-white/40 hover:text-white/60 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 px-1 pb-3 pt-2 text-sm font-medium transition-all"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Gerador de Posts
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-white/40 hover:text-white/60 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-1 pb-3 pt-2 text-sm font-medium transition-all"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat com IA
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="posts" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
          <PostGenerator user={user} />
        </TabsContent>
        <TabsContent value="chat" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
          <ChatTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
