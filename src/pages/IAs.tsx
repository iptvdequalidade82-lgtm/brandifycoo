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
  Sparkles, MessageSquare, ImagePlus, ArrowLeft, Zap, Send, Download, Loader2,
  Plus, Trash2, X, PenTool, Crown, Lock, Check, RotateCcw,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import logo from "@/assets/logo.jpg";
import UserMenu from "@/components/UserMenu";
import SupportWidget from "@/components/SupportWidget";

// ── Types ──
type Msg = { role: "user" | "assistant"; content: string; image_urls?: string[]; model_used?: string };
type Conversation = { id: string; title: string; model: string; created_at: string; updated_at: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-instagram-image`;

// ── Device ID for anonymous usage tracking ──
function getDeviceId(): string {
  const key = "brandify_device_id";
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

function getUsageKey(userId?: string): string {
  return `post_gen_${userId || getDeviceId()}`;
}

function getDailyUsage(userId?: string): number {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(getUsageKey(userId));
  if (!stored) return 0;
  try {
    return JSON.parse(stored).filter((d: string) => new Date(d).toDateString() === today).length;
  } catch { return 0; }
}

function trackUsageLocal(userId?: string): number {
  const key = getUsageKey(userId);
  const stored = localStorage.getItem(key);
  const data = stored ? JSON.parse(stored) : [];
  data.push(new Date().toISOString());
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const filtered = data.filter((d: string) => new Date(d) > weekAgo);
  localStorage.setItem(key, JSON.stringify(filtered));
  const today = new Date().toDateString();
  return filtered.filter((d: string) => new Date(d).toDateString() === today).length;
}

const MAX_FREE_DAILY = 3;
const PLAN_LABELS: Record<string, string> = { basico: "Básico", pro: "Pro", premium: "Premium" };
const PLAN_MONTHLY_CREDITS: Record<string, number> = { basico: 15, pro: 20, premium: Infinity };

function getMonthlyUsageKey(userId?: string): string {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  return `post_gen_monthly_${userId || getDeviceId()}_${month}`;
}

function getMonthlyUsage(userId?: string): number {
  const stored = localStorage.getItem(getMonthlyUsageKey(userId));
  return stored ? parseInt(stored, 10) || 0 : 0;
}

function trackMonthlyUsage(userId?: string): number {
  const key = getMonthlyUsageKey(userId);
  const current = getMonthlyUsage(userId) + 1;
  localStorage.setItem(key, String(current));
  return current;
}

const SUGGESTIONS = [
  { icon: "🍕", label: "Restaurante delivery", prompt: "Anúncio de restaurante delivery com entrega grátis na cidade inteira" },
  { icon: "💇", label: "Salão de beleza", prompt: "Promoção de salão de beleza para corte e coloração no fim de semana" },
  { icon: "🏋️", label: "Academia", prompt: "Post motivacional de academia promovendo plano trimestral com desconto" },
  { icon: "⚖️", label: "Advocacia", prompt: "Post editorial para escritório de advocacia sobre direitos trabalhistas" },
  { icon: "🦷", label: "Odontologia", prompt: "Post para clínica odontológica promovendo clareamento dental" },
  { icon: "🏠", label: "Imobiliária", prompt: "Post elegante para imobiliária divulgando apartamento de luxo" },
];

const CHAT_SUGGESTIONS = [
  { icon: "📝", label: "Criar legenda", prompt: "Crie uma legenda profissional para um post de Instagram de uma loja de roupas femininas" },
  { icon: "📊", label: "Estratégia de marketing", prompt: "Monte uma estratégia de marketing digital para uma clínica médica que quer mais pacientes" },
  { icon: "💡", label: "Ideias de conteúdo", prompt: "Me dê 10 ideias de posts para Instagram de um restaurante japonês" },
  { icon: "📧", label: "Email marketing", prompt: "Escreva um email de boas-vindas para novos clientes de uma loja online de cosméticos" },
];

// Image intent detection for chat
const IMAGE_KEYWORDS_CHAT = [
  "gerar imagem", "gere uma imagem", "crie uma imagem", "criar imagem",
  "gerar foto", "crie uma foto", "gerar logo", "crie um logo", "criar logo",
  "gerar arte", "crie uma arte", "gerar banner", "crie um banner",
  "gerar post", "editar imagem", "edite essa imagem",
  "generate image", "create image", "desenhe", "desenhar", "ilustre",
];

function detectImageIntentChat(text: string): boolean {
  const lower = text.toLowerCase();
  return IMAGE_KEYWORDS_CHAT.some((kw) => lower.includes(kw));
}

// ══════════════════════════════════════════════════
// ██  PRO CTA BANNER
// ══════════════════════════════════════════════════
function ProBanner({ user, remaining, userPlan }: { user: User | null; remaining: number; userPlan: string | null }) {
  const navigate = useNavigate();
  const handleUpgrade = () => {
    if (!user) { navigate("/login?redirect=/ias&upgrade=pro"); return; }
    navigate("/planos-pro");
  };

  if (userPlan) {
    const monthlyCredits = PLAN_MONTHLY_CREDITS[userPlan] ?? Infinity;
    const isUnlimited = monthlyCredits === Infinity;
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-3 md:mx-6 mt-2 mb-0">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-white/80 text-xs font-medium">
              Plano {PLAN_LABELS[userPlan] || userPlan} ativo • {isUnlimited ? "Uso ilimitado" : `${remaining > 999 ? "∞" : remaining} crédito${remaining !== 1 ? "s" : ""} disponíve${remaining !== 1 ? "is" : "l"}`}
            </p>
          </div>
          {userPlan !== "premium" && (
            <button onClick={handleUpgrade} className="text-amber-400/70 hover:text-amber-300 text-xs font-medium transition-colors">Fazer upgrade →</button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-3 md:mx-6 mt-2 mb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium">
              {remaining > 0 ? `${remaining} crédito${remaining === 1 ? "" : "s"} grátis restante${remaining === 1 ? "" : "s"} hoje` : "Créditos grátis esgotados hoje"}
            </p>
            <p className="text-white/30 text-[10px] hidden sm:block">Assine um plano para mais créditos mensais</p>
          </div>
        </div>
        <button onClick={handleUpgrade} className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 w-full sm:w-auto">
          <Crown className="w-3.5 h-3.5" /><span>Ver planos</span>
        </button>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// ██  POST GENERATOR TAB (unified flow)
// ══════════════════════════════════════════════════
function PostGenerator({ user, userPlan }: { user: User | null; userPlan: string | null }) {
  const { toast } = useToast();
  const [step, setStep] = useState<"describe" | "copy" | "generating" | "done">("describe");
  const [prompt, setPrompt] = useState("");
  const [postType, setPostType] = useState<"feed" | "story">("feed");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string; type: string; copy?: string }[]>([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImage, setEditingImage] = useState<{ url: string; prompt: string; type: string; copy?: string } | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const hasActivePlan = !!userPlan;
  const [monthlyCount, setMonthlyCount] = useState(0);

  useEffect(() => { setDailyCount(getDailyUsage(user?.id)); setMonthlyCount(getMonthlyUsage(user?.id)); }, [user?.id]);

  const monthlyCredits = userPlan ? (PLAN_MONTHLY_CREDITS[userPlan] ?? Infinity) : 0;
  const monthlyRemaining = monthlyCredits === Infinity ? Infinity : Math.max(0, monthlyCredits - monthlyCount);
  const dailyRemaining = Math.max(0, MAX_FREE_DAILY - dailyCount);
  // Total available = daily free + monthly plan credits remaining
  const remaining = hasActivePlan
    ? (monthlyCredits === Infinity ? Infinity : dailyRemaining + monthlyRemaining)
    : dailyRemaining;
  const MAX_LIMIT = remaining;

  const trackUsage = () => {
    // Always consume daily free first, then monthly
    if (dailyCount < MAX_FREE_DAILY) {
      setDailyCount(trackUsageLocal(user?.id));
    } else if (hasActivePlan && monthlyCredits !== Infinity) {
      setMonthlyCount(trackMonthlyUsage(user?.id));
    } else if (hasActivePlan && monthlyCredits === Infinity) {
      // Premium: just track daily for stats
      setDailyCount(trackUsageLocal(user?.id));
    } else {
      setDailyCount(trackUsageLocal(user?.id));
    }
  };

  const getAuthHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast({ title: "Arquivo muito grande", description: "Máximo 4MB", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result as string; setReferenceImage(r); setReferencePreview(r); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeReference = () => { setReferenceImage(null); setReferencePreview(null); };

  const handleGenerateCopy = async (customPrompt?: string) => {
    const text = (customPrompt || prompt).trim();
    if (!text) return;
    if (remaining <= 0) { toast({ title: hasActivePlan ? "Créditos do mês esgotados" : "Limite diário atingido", description: hasActivePlan ? "Aguarde o próximo mês ou faça upgrade." : "Assine um plano para mais créditos.", variant: "destructive" }); return; }
    if (customPrompt) setPrompt(customPrompt);
    const previousCopy = generatedCopy;
    setIsGeneratingCopy(true);
    setStep("copy");
    try {
      const headers = await getAuthHeaders();

      // Build anti-repetition instruction when regenerating
      const antiRepetition = previousCopy
        ? `\n\nIMPORTANTE: O cliente pediu para REFAZER. A versão anterior foi:\n"""${previousCopy}"""\n\nCrie uma versão COMPLETAMENTE DIFERENTE. Use outro tom de voz, outro ângulo criativo, outras palavras-chave e outra estrutura. NÃO repita frases ou ideias da versão anterior.`
        : "";

      const res = await fetch(CHAT_URL, {
        method: "POST", headers,
        body: JSON.stringify({
          messages: [
            { role: "system", content: `Você é um copywriter especialista em redes sociais da agência Brandify. Receba a ideia bruta do cliente e aprimore em um prompt detalhado e profissional para gerar um post de Instagram. Mantenha a essência da ideia original mas adicione detalhes visuais e de copywriting. Responda APENAS com a copy (legenda) aprimorada, sem explicações. Use emojis estrategicamente. Máximo 3 parágrafos curtos.${antiRepetition}` },
            { role: "user", content: text }
          ],
          model: "google/gemini-2.5-flash",
        }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento e tente novamente.");
        if (res.status === 402) throw new Error("Créditos de IA insuficientes. Verifique seu plano.");
        throw new Error("Erro ao gerar copy");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Sem resposta");
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try { const d = JSON.parse(jsonStr).choices?.[0]?.delta?.content; if (d) fullText += d; } catch {}
          }
        }
      }
      setGeneratedCopy(fullText || "");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
      setStep("describe");
    } finally { setIsGeneratingCopy(false); }
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setStep("generating");
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const imgTimeout = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(IMAGE_URL, {
        method: "POST", headers,
        body: JSON.stringify({ prompt: `Post profissional para Instagram: ${prompt}. Copy: ${generatedCopy}`, type: postType, referenceImage }),
        signal: controller.signal,
      });
      clearTimeout(imgTimeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro" }));
        if (res.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento.");
        if (res.status === 402) throw new Error("Créditos de IA insuficientes.");
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      if (!data.imageUrl) throw new Error("Nenhuma imagem gerada");
      setGeneratedImages((prev) => [{ url: data.imageUrl, prompt, type: postType, copy: generatedCopy }, ...prev]);
      trackUsage(); removeReference();
      toast({ title: "Post criado! 🎨" });
      setStep("done");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
      setStep("copy");
    } finally { setIsGenerating(false); }
  };

  const handleNewPost = () => { setStep("describe"); setPrompt(""); setGeneratedCopy(""); removeReference(); };

  const handleEditImage = async (img: { url: string; prompt: string; type: string; copy?: string }, instruction: string) => {
    if (!instruction.trim()) return;
    if (remaining <= 0) { toast({ title: hasActivePlan ? "Créditos do mês esgotados" : "Limite diário atingido", variant: "destructive" }); return; }
    setIsEditing(true);
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const editTimeout = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(IMAGE_URL, { method: "POST", headers, body: JSON.stringify({ prompt: `${img.prompt}. INSTRUÇÃO DE EDIÇÃO: ${instruction}`, type: img.type, referenceImage: img.url }), signal: controller.signal });
      clearTimeout(editTimeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro" }));
        if (res.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento.");
        if (res.status === 402) throw new Error("Créditos de IA insuficientes.");
        throw new Error(err.error || "Erro ao editar");
      }
      const data = await res.json();
      if (!data.imageUrl) throw new Error("Nenhuma imagem gerada");
      setGeneratedImages((prev) => [{ url: data.imageUrl, prompt: `${img.prompt} (editado: ${instruction})`, type: img.type, copy: img.copy }, ...prev]);
      trackUsage();
      toast({ title: "Post editado! ✏️" });
      setEditingImage(null); setEditInstruction("");
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsEditing(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {/* WELCOME */}
          {step === "describe" && generatedImages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-6 md:pt-12">
              {/* Hero Card — Gerador de Posts */}
              <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.06] via-transparent to-pink-500/[0.04] p-8 md:p-12 text-center mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-5">
                    <ImagePlus className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-violet-300/80 text-xs font-medium">Gerador de Posts</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Crie posts<br />
                    <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">profissionais com IA</span>
                  </h2>
                  <p className="text-white/35 text-sm md:text-base max-w-md mx-auto mb-8">Descreva → IA aprimora → Post pronto</p>
                  <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
                    {[{ num: "1", label: "Descreva", icon: "✍️" }, { num: "2", label: "IA aprimora", icon: "✨" }, { num: "3", label: "Post pronto", icon: "🎨" }].map((s, i) => (
                      <div key={s.num} className="flex items-center gap-3">
                        {i > 0 && <div className="w-6 md:w-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl md:text-2xl">{s.icon}</span>
                          <span className="text-white/30 text-[10px] md:text-xs">{s.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exemplos rápidos */}
              <div className="mb-6">
                <p className="text-white/20 text-xs font-medium uppercase tracking-wider mb-3 text-center">Exemplos rápidos</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s.label} onClick={() => { setPrompt(s.prompt); handleGenerateCopy(s.prompt); }} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.15] text-white/60 hover:text-white text-sm transition-all duration-200">
                      <span className="text-base">{s.icon}</span><span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-white/15 text-xs text-center">{remaining === Infinity ? "∞ criações ilimitadas" : `${remaining} crédito${remaining !== 1 ? "s" : ""} disponíve${remaining !== 1 ? "is" : "l"}`}{hasActivePlan && monthlyCredits !== Infinity ? ` (${dailyRemaining} grátis hoje + ${monthlyRemaining} do plano)` : hasActivePlan ? "" : ` hoje`}</p>
            </motion.div>
          )}

          {/* Posts grid */}
          {step === "describe" && generatedImages.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>Seus posts</h3>
                  <p className="text-white/30 text-sm">{remaining === Infinity ? "Ilimitado" : `${remaining} crédito${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence>
                  {generatedImages.map((img, i) => (
                    <motion.div key={`${img.prompt}-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] transition-all duration-300">
                      <img src={img.url} alt={img.prompt} className="w-full object-cover" loading="lazy" />
                      <div className="absolute bottom-2 right-2 z-10 pointer-events-none"><img src={logo} alt="" className="w-5 h-5 rounded-[4px] object-cover opacity-60 shadow-sm shadow-black/40" /></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium px-2 py-0.5 rounded-md bg-white/10">{img.type === "feed" ? "Feed 1:1" : "Story 9:16"}</span>
                          <p className="text-white/70 text-xs line-clamp-2">{img.prompt}</p>
                          {img.copy && <button onClick={() => { navigator.clipboard.writeText(img.copy!); toast({ title: "Copy copiada! 📋" }); }} className="text-violet-300/80 text-xs hover:text-violet-200 transition-colors text-left">📋 Copiar legenda</button>}
                          <div className="flex gap-2">
                            <Button onClick={() => { const a = document.createElement("a"); a.href = img.url; a.download = `brandify-post-${i + 1}.png`; a.click(); }} size="sm" className="bg-white text-black hover:bg-white/90 border-0 text-xs font-medium h-8 px-4"><Download className="w-3.5 h-3.5 mr-1.5" />Baixar</Button>
                            <Button onClick={() => { setEditingImage(img); setEditInstruction(""); }} size="sm" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200 text-xs font-medium h-8 px-4"><PenTool className="w-3.5 h-3.5 mr-1.5" />Editar</Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* STEP 2: Copy review */}
          {step === "copy" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pt-8">
              <StepIndicator current={2} />
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setStep("describe"); setGeneratedCopy(""); }} className="text-white/30 hover:text-white/60 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                <div>
                  <h3 className="text-white font-semibold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>A IA aprimorou sua ideia ✨</h3>
                  <p className="text-white/30 text-sm">Confirme se é isso que você quer</p>
                </div>
              </div>
              <div className="mb-4 px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/15">
                <p className="text-blue-300/60 text-xs font-medium uppercase tracking-wider mb-1">Sua ideia original</p>
                <p className="text-white/70 text-sm">{prompt}</p>
              </div>
              <div className="mb-6 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md overflow-hidden"><img src={logo} alt="" className="w-full h-full object-cover" /></div>
                  <span className="text-white/40 text-xs font-medium">Brandify IA</span>
                  {isGeneratingCopy && <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />}
                </div>
                {isGeneratingCopy ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-white/[0.06] rounded animate-pulse w-full" />
                    <div className="h-4 bg-white/[0.06] rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-white/[0.06] rounded animate-pulse w-1/2" />
                  </div>
                ) : (
                  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{generatedCopy}</div>
                )}
              </div>
              {!isGeneratingCopy && generatedCopy && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleGenerateImage} className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 text-white font-medium h-12">
                    <Check className="w-4 h-4 mr-2" />Confirmar e gerar post
                  </Button>
                  <Button onClick={() => handleGenerateCopy()} variant="ghost" className="border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] bg-white/[0.04] h-12">
                    <RotateCcw className="w-4 h-4 mr-2" />Refazer
                  </Button>
                  <Button onClick={() => { navigator.clipboard.writeText(generatedCopy); toast({ title: "Copiado! 📋" }); }} variant="ghost" className="border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] bg-white/[0.04] h-12">📋</Button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Generating */}
          {step === "generating" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-16">
              <StepIndicator current={3} />
              <div className="relative mb-6 mt-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-violet-500/20 flex items-center justify-center">
                  <img src={logo} alt="Brandify" className="w-full h-full object-cover opacity-30" />
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin absolute" />
                </div>
              </div>
              <h3 className="text-white font-medium text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Criando seu post...</h3>
              <p className="text-white/30 text-sm">Nossa IA está trabalhando na arte</p>
              <div className="mt-4 w-48 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" initial={{ width: "0%" }} animate={{ width: "90%" }} transition={{ duration: 25, ease: "easeOut" }} />
              </div>
            </motion.div>
          )}

          {/* STEP 4: Done */}
          {step === "done" && generatedImages.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pt-8">
              <StepIndicator current={4} />
              <h3 className="text-white font-semibold text-xl mb-4 mt-4" style={{ fontFamily: "'Sora', sans-serif" }}>Post pronto! 🎨</h3>
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] mb-4">
                <img src={generatedImages[0].url} alt="Post gerado" className="w-full object-cover" />
                <div className="absolute bottom-2 right-2 z-10 pointer-events-none"><img src={logo} alt="" className="w-5 h-5 rounded-[4px] object-cover opacity-60 shadow-sm shadow-black/40" /></div>
              </div>
              {generatedImages[0].copy && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-white/30 text-xs font-medium mb-1">Legenda</p>
                  <p className="text-white/70 text-sm whitespace-pre-wrap">{generatedImages[0].copy}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button onClick={() => { const a = document.createElement("a"); a.href = generatedImages[0].url; a.download = "brandify-post.png"; a.click(); }} className="flex-1 bg-white text-black hover:bg-white/90 border-0 font-medium h-11"><Download className="w-4 h-4 mr-2" />Baixar post</Button>
                <Button onClick={() => { if (generatedImages[0].copy) navigator.clipboard.writeText(generatedImages[0].copy); toast({ title: "Legenda copiada! 📋" }); }} variant="ghost" className="border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] bg-white/[0.04] h-11">📋 Copiar legenda</Button>
                <Button onClick={() => { setEditingImage(generatedImages[0]); setEditInstruction(""); }} variant="ghost" className="border border-violet-500/20 text-violet-300/70 hover:text-violet-200 hover:bg-violet-500/10 bg-white/[0.02] h-11"><PenTool className="w-4 h-4 mr-2" />Editar</Button>
              </div>
              <Button onClick={handleNewPost} variant="ghost" className="w-full border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.06] h-11"><Sparkles className="w-4 h-4 mr-2" />Criar outro post</Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom input */}
      {step === "describe" && (
        <div className="shrink-0 border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-4">
            {referencePreview && (
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group">
                  <img src={referencePreview} alt="Referência" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                  <button onClick={removeReference} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-medium">Imagem de referência</p>
                  <p className="text-white/25 text-[11px]">A IA vai usar como base</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/30 text-xs font-medium mr-1">Formato:</span>
              {[{ value: "feed" as const, label: "Feed (1:1)", icon: "📐" }, { value: "story" as const, label: "Story (9:16)", icon: "📱" }].map((opt) => (
                <button key={opt.value} onClick={() => setPostType(opt.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${postType === opt.value ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-white/30 hover:text-white/50 border border-transparent hover:bg-white/[0.04]"}`}>{opt.icon} {opt.label}</button>
              ))}
            </div>
            <div className="relative">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Restaurante delivery com entrega grátis na cidade inteira..." className="min-h-[56px] max-h-[120px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none rounded-xl pl-12 pr-14 text-sm focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerateCopy(); } }} />
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2.5 left-2.5 h-9 w-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all" title="Enviar logo ou referência"><ImagePlus className="w-4 h-4" /></button>
              <Button onClick={() => handleGenerateCopy()} disabled={isGeneratingCopy || !prompt.trim() || remaining <= 0} className="absolute bottom-2.5 right-2.5 h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 shadow-lg shadow-violet-500/20 disabled:shadow-none">
                {isGeneratingCopy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-white/15 text-[11px] mt-2 text-center">📎 Envie uma logo ou referência • Descreva sua ideia e a IA faz tudo</p>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editingImage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111115] border border-white/[0.08] rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>Editar post ✏️</h3>
              <button onClick={() => { setEditingImage(null); setEditInstruction(""); }} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-3">
              <img src={editingImage.url} alt="" className={`rounded-xl object-cover border border-white/10 shrink-0 ${editingImage.type === "story" ? "w-16 h-28" : "w-24 h-24"}`} />
              <div className="flex-1 space-y-1">
                <p className="text-white/40 text-xs">Post original — <span className="text-violet-300/60">{editingImage.type === "story" ? "Story 9:16" : "Feed 1:1"}</span></p>
                <p className="text-white/60 text-xs line-clamp-3">{editingImage.prompt}</p>
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">O que você quer mudar?</label>
              <Textarea value={editInstruction} onChange={(e) => setEditInstruction(e.target.value)} placeholder="Ex: Troque o fundo pra azul escuro..." className="min-h-[80px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none rounded-xl text-sm" />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setEditingImage(null); setEditInstruction(""); }} variant="ghost" className="flex-1 text-white/40 hover:text-white">Cancelar</Button>
              <Button onClick={() => handleEditImage(editingImage, editInstruction)} disabled={isEditing || !editInstruction.trim()} className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 text-white font-medium">
                {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PenTool className="w-4 h-4 mr-2" />}
                {isEditing ? "Editando..." : "Refazer post"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Step indicator component ──
function StepIndicator({ current }: { current: number }) {
  const steps = [{ label: "Ideia" }, { label: "Copy" }, { label: "Post" }];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current && current < 4;
        return (
          <div key={s.label} className="flex items-center gap-2">
            {i > 0 && <div className={`w-4 h-px ${done || (current === 4) ? "bg-green-500/20" : "bg-white/10"}`} />}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${done || current === 4 ? "bg-green-500/10 border-green-500/20" : active ? "bg-violet-500/10 border-violet-500/20" : "bg-white/[0.02] border-white/[0.06]"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done || current === 4 ? "bg-green-500/30 text-green-300" : active ? "bg-violet-500/30 text-violet-300" : "bg-white/10 text-white/30"}`}>
                {done || current === 4 ? <Check className="w-3 h-3" /> : `${num}`}
              </span>
              <span className={`text-xs ${done || current === 4 ? "text-green-300/60" : active ? "text-violet-300/60" : "text-white/30"}`}>{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ██  CHAT TAB
// ══════════════════════════════════════════════════
const ChatBubble = memo(({ msg }: { msg: Msg }) => (
  <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} mb-5`}>
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 ring-1 ring-white/10">
        <img src={logo} alt="Brandify" className="w-full h-full object-cover" />
      </div>
    )}
    <div className={`max-w-[80%] md:max-w-[70%] ${msg.role === "user" ? "bg-blue-600/15 border border-blue-500/15 rounded-2xl rounded-tr-sm px-4 py-3" : "bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3"}`}>
      {msg.role === "assistant" ? (
        <div className="text-[13px] text-white/85 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:text-white prose-strong:text-white prose-li:text-white/80">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-white/90 text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
      )}
      {msg.image_urls && msg.image_urls.length > 0 && msg.image_urls.map((url, i) => (
        <div key={i} className="mt-3 rounded-xl overflow-hidden border border-white/10">
          <img src={url} alt="Generated" className="w-full max-h-96 object-contain bg-black/20" loading="lazy" />
          <div className="flex gap-2 p-2 bg-black/20">
            <Button onClick={() => { const a = document.createElement("a"); a.href = url; a.download = `brandify-img-${i}.png`; a.click(); }} size="sm" variant="ghost" className="text-white/50 hover:text-white text-xs h-7"><Download className="w-3 h-3 mr-1" />Baixar</Button>
          </div>
        </div>
      ))}
    </div>
  </div>
));
ChatBubble.displayName = "ChatBubble";

function ChatTab({ user }: { user: User | null }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatAttachment, setChatAttachment] = useState<string | null>(null);
  const [chatAttachmentPreview, setChatAttachmentPreview] = useState<string | null>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { tokenRef.current = session?.access_token || null; });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { tokenRef.current = session?.access_token || null; });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setConversations([]); return; }
    supabase.from("ai_conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(30).then(({ data }) => { if (data) setConversations(data as Conversation[]); });
  }, [user]);

  useEffect(() => {
    if (!activeConvId || !user) return;
    supabase.from("ai_messages").select("*").eq("conversation_id", activeConvId).order("created_at", { ascending: true }).then(({ data }) => {
      if (data) setMessages(data.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content, image_urls: m.image_urls as string[] | undefined, model_used: m.model_used })));
    });
  }, [activeConvId, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingContent]);

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result as string; setChatAttachment(r); setChatAttachmentPreview(r); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeChatAttachment = () => { setChatAttachment(null); setChatAttachmentPreview(null); };

  const handleSend = useCallback(async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if ((!text && !chatAttachment) || isLoading) return;
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    const currentAttachment = chatAttachment;
    setChatAttachment(null);
    setChatAttachmentPreview(null);

    try {
      let convId = activeConvId;
      if (!convId && user) {
        const { data, error } = await supabase.from("ai_conversations").insert({ user_id: user.id, title: text.slice(0, 60) || "Imagem", model: "auto" }).select().single();
        if (error) throw error;
        convId = data.id;
        setConversations((prev) => [data as Conversation, ...prev]);
        setActiveConvId(convId);
      }

      const userMsg: Msg = { role: "user", content: text, image_urls: currentAttachment ? [currentAttachment] : [] };
      setMessages((prev) => [...prev, userMsg]);
      if (convId && user) {
        supabase.from("ai_messages").insert({ conversation_id: convId, role: "user", content: text, image_urls: currentAttachment ? [currentAttachment.slice(0, 100) + "...(base64)"] : null });
      }

      const wantsImage = detectImageIntentChat(text);
      const buildContent = (msgText: string, imgData?: string | null) => {
        if (!imgData) return msgText;
        return [{ type: "text", text: msgText }, { type: "image_url", image_url: { url: imgData } }];
      };

      const apiMessages = [...messages, { role: "user", content: text }].slice(-20).map((m, i, arr) => ({
        role: m.role, content: i === arr.length - 1 ? buildContent(text, currentAttachment) : m.content,
      }));

      const token = tokenRef.current;
      const headers: Record<string, string> = { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY };
      if (token) headers.Authorization = `Bearer ${token}`;
      else headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

      if (wantsImage) {
        setIsGeneratingImage(true);
        setMessages((prev) => [...prev, { role: "assistant", content: "🎨 Gerando imagem...", image_urls: [] }]);
        try {
          const imgController = new AbortController();
          const imgTimeout = setTimeout(() => imgController.abort(), 120000);
          const resp = await fetch(CHAT_URL, { method: "POST", headers, body: JSON.stringify({ messages: apiMessages, model: "auto", conversationId: convId, generateImage: true }), signal: imgController.signal });
          clearTimeout(imgTimeout);
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({ error: "Erro" }));
            if (resp.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento.");
            if (resp.status === 402) throw new Error("Créditos de IA insuficientes.");
            throw new Error(err.error || `Erro ${resp.status}`);
          }
          const data = await resp.json();
          const assistantMsg: Msg = { role: "assistant", content: data.content || "Aqui está! 🎨", image_urls: data.imageUrl ? [data.imageUrl] : [], model_used: data.model };
          setMessages((prev) => [...prev.slice(0, -1), assistantMsg]);
          if (convId && user) { supabase.from("ai_messages").insert({ conversation_id: convId, role: "assistant", content: assistantMsg.content, image_urls: data.imageUrl ? [data.imageUrl.slice(0, 100) + "...(base64)"] : null, model_used: data.model }); }
        } finally { setIsGeneratingImage(false); }
      } else {
        const resp = await fetch(CHAT_URL, { method: "POST", headers, body: JSON.stringify({ messages: apiMessages, model: "auto", conversationId: convId }) });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erro" }));
          if (resp.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento.");
          if (resp.status === 402) throw new Error("Créditos de IA insuficientes.");
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
            try { const c = JSON.parse(json).choices?.[0]?.delta?.content; if (c) { full += c; setStreamingContent(full); } } catch {}
          }
        }
        const finalMsg: Msg = { role: "assistant", content: full };
        setStreamingContent("");
        setMessages((prev) => [...prev, finalMsg]);
        if (convId && user) { supabase.from("ai_messages").insert({ conversation_id: convId, role: "assistant", content: full }); }
      }

      if (convId && user) { supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId); }
    } catch (e: any) {
      setStreamingContent("");
      const msg = e?.name === "AbortError" ? "A geração demorou demais. Tente novamente." : (e?.message || "Erro desconhecido");
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally { setIsLoading(false); }
  }, [input, isLoading, activeConvId, messages, user, toast, chatAttachment]);

  const startNew = () => { setActiveConvId(null); setMessages([]); setInput(""); setStreamingContent(""); setShowSidebar(false); };
  const deleteConv = async (id: string) => { await supabase.from("ai_conversations").delete().eq("id", id); setConversations((prev) => prev.filter((c) => c.id !== id)); if (activeConvId === id) startNew(); };

  return (
    <div className="flex h-full relative">
      {user && conversations.length > 0 && (
        <button onClick={() => setShowSidebar(!showSidebar)} className="absolute top-3 left-3 z-20 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-all" title="Histórico">
          <MessageSquare className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {showSidebar && (
          <>
            <div className="fixed inset-0 bg-black/60 z-30" onClick={() => setShowSidebar(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute left-0 top-0 bottom-0 w-72 z-40 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col">
              <div className="p-3 border-b border-white/[0.06] flex items-center gap-2">
                <Button onClick={startNew} size="sm" variant="outline" className="flex-1 gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border-white/[0.08]"><Plus className="w-4 h-4" /> Nova conversa</Button>
                <button onClick={() => setShowSidebar(false)} className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06]"><X className="w-4 h-4" /></button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                  {conversations.map((c) => (
                    <div key={c.id} className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all ${activeConvId === c.id ? "bg-white/[0.08] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/60"}`} onClick={() => { setActiveConvId(c.id); setShowSidebar(false); }}>
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                      <span className="truncate flex-1">{c.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteConv(c.id); }} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 p-0.5"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
            {messages.length === 0 && !streamingContent ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-12 md:pt-20">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-2xl"><img src={logo} alt="Brandify" className="w-full h-full object-cover" /></div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center ring-2 ring-[#050508]"><Sparkles className="w-3.5 h-3.5 text-white" /></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>Como posso ajudar?</h2>
                <p className="text-white/35 text-sm text-center max-w-md mb-10">Sou o assistente da Brandify. Posso criar textos, legendas, estratégias de marketing e responder qualquer dúvida.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {CHAT_SUGGESTIONS.map((s) => (
                    <button key={s.label} onClick={() => handleSend(s.prompt)} className="group flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.15] text-left transition-all duration-200">
                      <span className="text-xl mt-0.5">{s.icon}</span>
                      <div>
                        <span className="text-white/70 group-hover:text-white text-sm font-medium block">{s.label}</span>
                        <span className="text-white/25 text-xs line-clamp-1 mt-0.5">{s.prompt.slice(0, 50)}...</span>
                      </div>
                    </button>
                  ))}
                </div>
                {!user && <p className="text-white/20 text-xs mt-6"><Lock className="w-3 h-3 inline mr-1" />Faça login para salvar seu histórico</p>}
              </motion.div>
            ) : (
              <>
                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {streamingContent && (
                  <div className="flex gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 ring-1 ring-white/10"><img src={logo} alt="Brandify" className="w-full h-full object-cover" /></div>
                    <div className="max-w-[80%] md:max-w-[70%] bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="text-[13px] text-white/85 leading-relaxed prose prose-invert prose-sm max-w-none"><ReactMarkdown>{streamingContent}</ReactMarkdown></div>
                    </div>
                  </div>
                )}
                {isLoading && !streamingContent && !isGeneratingImage && (
                  <div className="flex gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 ring-1 ring-white/10"><img src={logo} alt="Brandify" className="w-full h-full object-cover" /></div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-4">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                {isGeneratingImage && (
                  <div className="flex gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 ring-1 ring-white/10"><img src={logo} alt="Brandify" className="w-full h-full object-cover" /></div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center"><Loader2 className="w-5 h-5 text-violet-400 animate-spin" /></div>
                        <div><p className="text-white/70 text-sm font-medium">Gerando imagem...</p><p className="text-white/30 text-xs">Alguns segundos</p></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-4">
            {chatAttachmentPreview && (
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group">
                  <img src={chatAttachmentPreview} alt="Anexo" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                  <button onClick={removeChatAttachment} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                </div>
                <div><p className="text-white/50 text-xs font-medium">Imagem anexada</p><p className="text-white/25 text-[11px]">A IA pode analisar ou editar</p></div>
              </div>
            )}
            <input ref={chatFileRef} type="file" accept="image/*" onChange={handleChatFileUpload} className="hidden" />
            <div className="relative">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={chatAttachment ? "O que quer fazer com a imagem..." : "Digite sua mensagem..."} className="min-h-[52px] max-h-[150px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none rounded-xl pl-12 pr-14 text-sm focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
              <button onClick={() => chatFileRef.current?.click()} className="absolute bottom-2.5 left-2.5 h-9 w-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all" title="Anexar imagem"><ImagePlus className="w-4 h-4" /></button>
              <Button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !chatAttachment)} className="absolute bottom-2.5 right-2.5 h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-0 shadow-lg shadow-blue-500/20 disabled:shadow-none">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ██  MAIN PAGE
// ══════════════════════════════════════════════════
export default function IAs() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setUserPlan(null); return; }
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => setUserPlan(data?.plan || null));
  }, [user]);

  useEffect(() => { setDailyCount(getDailyUsage(user?.id)); }, [user?.id]);

  const monthlyCredits = userPlan ? (PLAN_MONTHLY_CREDITS[userPlan] ?? Infinity) : 0;
  const monthlyRemaining = monthlyCredits === Infinity ? Infinity : Math.max(0, monthlyCredits - getMonthlyUsage(user?.id));
  const dailyRemaining = Math.max(0, MAX_FREE_DAILY - dailyCount);
  const remaining = userPlan
    ? (monthlyCredits === Infinity ? Infinity : dailyRemaining + monthlyRemaining)
    : dailyRemaining;

  if (loading) {
    return <div className="min-h-screen bg-[#050508] flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="h-screen bg-[#050508] flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/[0.06] bg-[#050508]/90 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/"><div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/15"><img src={logo} alt="Brandify" className="w-full h-full object-cover" /></div></Link>
            <div className="h-5 w-px bg-white/[0.08]" />
            <span className="text-white font-semibold text-sm flex items-center gap-1.5" style={{ fontFamily: "'Sora', sans-serif" }}><Sparkles className="w-3.5 h-3.5 text-violet-400" />IA Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="ghost" size="sm" className="text-white/30 hover:text-white hover:bg-white/[0.05] text-xs h-8"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar</Button></Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <ProBanner user={user} remaining={remaining === Infinity ? 999 : remaining} userPlan={userPlan} />

      <Tabs defaultValue="posts" className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 border-b border-white/[0.06] px-4 md:px-6">
          <TabsList className="bg-transparent h-10 p-0 gap-6">
            <TabsTrigger value="posts" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-white/30 hover:text-white/50 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 px-0 pb-2.5 pt-2 text-sm font-medium transition-all">
              <ImagePlus className="w-4 h-4 mr-2" />Gerador de Posts
            </TabsTrigger>
            <TabsTrigger value="chat" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-white/30 hover:text-white/50 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-0 pb-2.5 pt-2 text-sm font-medium transition-all">
              <MessageSquare className="w-4 h-4 mr-2" />Chat com IA
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="posts" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
          <PostGenerator user={user} userPlan={userPlan} />
        </TabsContent>
        <TabsContent value="chat" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
          <ChatTab user={user} />
        </TabsContent>
      </Tabs>

      <SupportWidget user={user} />
    </div>
  );
}
