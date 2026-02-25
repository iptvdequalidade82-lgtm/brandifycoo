import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import brandifyLogo from "@/assets/logo.jpg";
import {
  Plus, Send, Trash2, MessageSquare, Image as ImageIcon, Bot, Sparkles, Loader2, ChevronLeft, ChevronRight, Paperclip, X,
  Users, Crown, Mail, Clock, CreditCard, CheckCircle, XCircle,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; image_urls?: string[]; model_used?: string };
type Conversation = { id: string; title: string; model: string; created_at: string; updated_at: string };

const MODEL_OPTIONS = [
  { value: "auto", label: "Auto", desc: "Escolhe a melhor IA automaticamente" },
  { value: "gemini", label: "Gemini", desc: "Google Gemini — rápido e criativo" },
  { value: "gpt", label: "GPT", desc: "OpenAI GPT — preciso e analítico" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

// ── Memoized message bubble ──
const ChatBubble = memo(({ msg }: { msg: Msg }) => (
  <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-1">
        <img src={brandifyLogo} alt="Brandify" className="w-full h-full object-cover" />
      </div>
    )}
    <div className={`max-w-[85%] md:max-w-[80%] ${
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
));
ChatBubble.displayName = "ChatBubble";

// ── Streaming message (not memoized — updates frequently) ──
const StreamingBubble = ({ content, modelUsed }: { content: string; modelUsed: string }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-1">
      <img src={brandifyLogo} alt="Brandify" className="w-full h-full object-cover" />
    </div>
    <div className="max-w-[85%] md:max-w-[80%] bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
      <div className="text-sm text-white/90 leading-relaxed prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {modelUsed && (
        <span className="text-[10px] text-white/20 mt-2 block">
          {modelUsed.includes("gemini") ? "Gemini" : modelUsed.includes("gpt") ? "GPT" : modelUsed}
        </span>
      )}
    </div>
  </div>
);

// ══════════════════════════════════════════════════
// ██  SUBSCRIBERS PANEL
// ══════════════════════════════════════════════════
type UserWithSub = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  last_sign_in?: string | null;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    amount_cents: number;
    payment_method: string | null;
    paid_at: string | null;
    expires_at: string | null;
    created_at: string;
  } | null;
};

const PLAN_LABELS: Record<string, string> = { basico: "Básico", pro: "Pro", premium: "Premium" };
const PLAN_COLORS: Record<string, string> = {
  basico: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pro: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  premium: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function SubscribersPanel() {
  const [users, setUsers] = useState<UserWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "free">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error("Failed to load users:", e);
    }
    setLoading(false);
  };

  const filtered = users
    .filter((u) => {
      if (filter === "active") return u.subscription?.status === "active";
      if (filter === "pending") return u.subscription?.status === "pending";
      if (filter === "free") return !u.subscription || (u.subscription.status !== "active" && u.subscription.status !== "pending");
      return true;
    })
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return u.email.toLowerCase().includes(q) || (u.name?.toLowerCase().includes(q));
    });

  const activeCount = users.filter(u => u.subscription?.status === "active").length;
  const pendingCount = users.filter(u => u.subscription?.status === "pending").length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.subscription?.status === "active" ? (u.subscription.amount_cents || 0) : 0), 0);

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Users className="w-4 h-4 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-white/40">Usuários Total</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Crown className="w-4 h-4 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{activeCount}</p>
          <p className="text-xs text-white/40">Assinantes Ativos</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Clock className="w-4 h-4 text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">{pendingCount}</p>
          <p className="text-xs text-white/40">Pagamento Pendente</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <CreditCard className="w-4 h-4 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">R$ {(totalRevenue / 100).toFixed(2).replace(".", ",")}</p>
          <p className="text-xs text-white/40">Receita Mensal</p>
        </div>
      </div>

      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1">
          {[
            { key: "all" as const, label: "Todos", count: users.length },
            { key: "active" as const, label: "Ativos", count: activeCount },
            { key: "pending" as const, label: "Pendentes", count: pendingCount },
            { key: "free" as const, label: "Grátis", count: users.length - activeCount - pendingCount },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/50"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar email ou nome..."
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 w-[200px] focus:outline-none focus:border-white/20"
            />
          </div>
          <Button onClick={loadUsers} variant="ghost" size="sm" className="text-white/40 hover:text-white h-7 text-xs">
            <Loader2 className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-white/40 font-medium px-4 py-2.5 text-xs">Usuário</th>
                <th className="text-left text-white/40 font-medium px-4 py-2.5 text-xs">Plano</th>
                <th className="text-left text-white/40 font-medium px-4 py-2.5 text-xs">Status</th>
                <th className="text-left text-white/40 font-medium px-4 py-2.5 text-xs hidden md:table-cell">Valor</th>
                <th className="text-left text-white/40 font-medium px-4 py-2.5 text-xs hidden md:table-cell">Expira em</th>
                <th className="text-left text-white/40 font-medium px-4 py-2.5 text-xs hidden lg:table-cell">Último login</th>
                <th className="text-left text-white/40 font-medium px-4 py-2.5 text-xs">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{u.name || "Sem nome"}</p>
                      <p className="text-white/40 text-xs">{u.email || u.id.slice(0, 12) + "..."}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.subscription && u.subscription.status !== "cancelled" ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${PLAN_COLORS[u.subscription.plan] || PLAN_COLORS.basico}`}>
                        <Crown className="w-3 h-3" /> {PLAN_LABELS[u.subscription.plan] || u.subscription.plan}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">Grátis</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.subscription?.status === "active" ? (
                      isExpired(u.subscription.expires_at) ? (
                        <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                          <XCircle className="w-3 h-3" /> Expirado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3" /> Ativo
                        </span>
                      )
                    ) : u.subscription?.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 text-orange-400 text-xs">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs hidden md:table-cell">
                    {u.subscription ? `R$ ${(u.subscription.amount_cents / 100).toFixed(2).replace(".", ",")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">
                    {u.subscription?.expires_at ? (
                      <span className={isExpired(u.subscription.expires_at) ? "text-red-400" : "text-white/40"}>
                        {new Date(u.subscription.expires_at).toLocaleDateString("pt-BR")}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs hidden lg:table-cell">
                    {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/20 text-sm">
                    {search ? "Nenhum resultado para a busca" : "Nenhum usuário cadastrado ainda"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminChat() {
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
  // Streaming content kept in state for the live bubble only
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingModel, setStreamingModel] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Cache token to avoid repeated auth calls
  const tokenRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streamingContent, scrollToBottom]);

  // Pre-cache auth token
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      tokenRef.current = session?.access_token || null;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      tokenRef.current = session?.access_token || null;
    });
    return () => subscription.unsubscribe();
  }, []);

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

  // Fire-and-forget DB save (no await needed in the hot path)
  const saveMessage = (convId: string, msg: Msg) => {
    supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: msg.role,
      content: msg.content,
      image_urls: msg.image_urls || [],
      model_used: msg.model_used || null,
    }).then(({ error }) => { if (error) console.error("Save msg error:", error); });
  };

  const updateConversationTitle = (convId: string, firstMsg: string) => {
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? "…" : "");
    supabase.from("ai_conversations").update({ title }).eq("id", convId)
      .then(() => setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, title } : c))));
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
    const imageKeywords = /\b(gere|gerar|crie|criar|faça|fazer|desenh|imagem|image|foto|ilustra|banner|logo|arte|design|poster|thumbnail)\b/i;
    const isImageRequest = currentAttachments.length > 0 || (imageKeywords.test(text) && /\b(imagem|image|foto|ilustra|banner|logo|arte|design|poster|thumbnail)\b/i.test(text));
    const shouldUseImageMode = imageMode || isImageRequest;
    setInput("");
    setAttachedImages([]);
    setIsLoading(true);
    setStreamingContent("");
    setStreamingModel("");
    if (shouldUseImageMode) setIsGeneratingImage(true);

    try {
      let convId = activeConvId;
      if (!convId) convId = await createConversation();

      const userMsg: Msg = { role: "user", content: text || "(imagem anexada)", image_urls: currentAttachments.length > 0 ? currentAttachments : undefined };
      setMessages((prev) => [...prev, userMsg]);

      // Fire-and-forget saves — don't block the AI call
      saveMessage(convId, userMsg);
      if (messages.length === 0) updateConversationTitle(convId, text || "Imagem anexada");

      // Build API messages — skip image data URLs from history to reduce payload size
      const apiMessages = [...messages, userMsg].map((m) => {
        if (m.image_urls && m.image_urls.length > 0) {
          // Only send image data for the LAST user message (current one)
          const isCurrentMsg = m === userMsg;
          const content: any[] = [];
          if (m.content && m.content !== "(imagem anexada)") {
            content.push({ type: "text", text: m.content });
          }
          if (isCurrentMsg) {
            m.image_urls.forEach((url) => {
              content.push({ type: "image_url", image_url: { url } });
            });
          }
          if (content.length === 0) content.push({ type: "text", text: "(imagem anexada anteriormente)" });
          return { role: m.role, content };
        }
        return { role: m.role, content: m.content };
      });

      const token = tokenRef.current;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      if (shouldUseImageMode) {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers,
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
        saveMessage(convId, assistantMsg);
      } else {
        // Streaming text with batched UI updates
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({ messages: apiMessages, model, conversationId: convId }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(err.error || `Erro ${resp.status}`);
        }

        const modelUsed = resp.headers.get("X-Model-Used") || model;
        setStreamingModel(modelUsed);
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantSoFar = "";

        // Batch streaming updates with requestAnimationFrame
        let pendingChunks = "";
        let rafId: number | null = null;

        const flushChunks = () => {
          if (pendingChunks) {
            assistantSoFar += pendingChunks;
            pendingChunks = "";
            setStreamingContent(assistantSoFar);
          }
          rafId = null;
        };

        const enqueueChunk = (chunk: string) => {
          pendingChunks += chunk;
          if (!rafId) {
            rafId = requestAnimationFrame(flushChunks);
          }
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
              if (content) enqueueChunk(content);
            } catch { buffer = line + "\n" + buffer; break; }
          }
        }

        // Flush any remaining chunks
        if (rafId) cancelAnimationFrame(rafId);
        if (pendingChunks) {
          assistantSoFar += pendingChunks;
        }

        // Move streaming content into messages array
        const finalMsg: Msg = { role: "assistant", content: assistantSoFar, model_used: modelUsed };
        setStreamingContent("");
        setStreamingModel("");
        setMessages((prev) => [...prev, finalMsg]);
        saveMessage(convId, finalMsg);
      }

      // Update conversation timestamp (fire-and-forget)
      supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    } catch (e: any) {
      console.error(e);
      setStreamingContent("");
      setStreamingModel("");
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
    setStreamingContent("");
    textareaRef.current?.focus();
  };

  // Memoized finalized messages list
  const renderedMessages = useMemo(() => (
    messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)
  ), [messages]);

  return (
    <>
      <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-13rem)] -mx-3 md:-mx-6 overflow-hidden relative">
        {/* Sidebar - overlay on mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`${sidebarOpen ? "w-64 md:w-72" : "w-0"} transition-all duration-300 border-r border-white/[0.06] flex flex-col bg-[#0c0c0c] overflow-hidden ${sidebarOpen ? "fixed inset-y-0 left-0 z-50 md:relative md:inset-auto" : ""}`}>
          <div className="p-3 border-b border-white/[0.06] flex items-center gap-2">
            <Button onClick={startNew} className="flex-1 gap-2 bg-white/[0.06] hover:bg-white/[0.10] text-white border-0" variant="outline" size="sm">
              <Plus className="w-4 h-4" /> Nova conversa
            </Button>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all ${
                    activeConvId === c.id ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                  onClick={() => { setActiveConvId(c.id); setSidebarOpen(false); }}
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
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border-b border-white/[0.06] bg-[#0a0a0a]">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/40 hover:text-white transition-colors shrink-0">
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5 md:p-1">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setModel(opt.value)}
                  className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[11px] md:text-xs font-medium transition-all ${
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

            <span className="ml-auto text-[11px] text-white/20 hidden md:inline">
              {model === "auto" ? "Auto" : model === "gpt" ? "GPT" : "Gemini"}
            </span>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-3 md:px-4 py-4">
            {messages.length === 0 && !streamingContent ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <img src={brandifyLogo} alt="Brandify" className="w-14 h-14 md:w-16 md:h-16 rounded-2xl mb-4 opacity-60" />
                <h2 className="text-lg md:text-xl font-semibold text-white/60 mb-2">Brandify IA</h2>
                <p className="text-xs md:text-sm text-white/30 max-w-md">
                  Converse com GPT ou Gemini. Gere textos, imagens, estratégias de marketing e muito mais.
                </p>
                <div className="flex gap-2 mt-6 flex-wrap justify-center">
                  {["Crie um copy para Instagram", "Gere ideias de conteúdo", "Analise minha estratégia"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                      className="px-3 md:px-4 py-2 rounded-xl text-[11px] md:text-xs text-white/50 bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/[0.06]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {renderedMessages}

                {/* Streaming response (separate from memoized messages) */}
                {streamingContent && (
                  <StreamingBubble content={streamingContent} modelUsed={streamingModel} />
                )}

                {/* Loading indicator (waiting for first chunk or image) */}
                {isLoading && !streamingContent && messages[messages.length - 1]?.role === "user" && (
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
          <div className="p-3 md:p-4 border-t border-white/[0.06] bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto">
              {attachedImages.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {attachedImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="Anexo" className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg border border-white/[0.1]" />
                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
                  className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
                  title="Anexar imagem"
                >
                  <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={attachedImages.length > 0 ? "Descreva o que fazer com a imagem..." : imageMode ? "Descreva a imagem que deseja gerar..." : "Digite sua mensagem..."}
                  className="min-h-[40px] md:min-h-[48px] max-h-[120px] md:max-h-[200px] resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 rounded-xl focus:border-blue-500/50 text-sm"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
                  className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30"
                  size="icon"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminIAs() {
  return (
    <AdminLayout>
      <Tabs defaultValue="subscribers" className="space-y-4 -mt-2">
        <TabsList className="bg-white/[0.04] border border-white/[0.06]">
          <TabsTrigger value="subscribers" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" /> Assinantes
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 gap-1.5 text-xs">
            <Bot className="w-3.5 h-3.5" /> Chat IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="m-0">
          <SubscribersPanel />
        </TabsContent>

        <TabsContent value="chat" className="m-0">
          <AdminChat />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
