import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ImagePlus, ArrowLeft, Zap, Download, Loader2, X, PenTool,
  Crown, Lock, Check, RotateCcw,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import logo from "@/assets/logo.jpg";
import UserMenu from "@/components/UserMenu";

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

const MAX_FREE_DAILY = 5;
const PLAN_LABELS: Record<string, string> = { basico: "Básico", pro: "Pro", premium: "Premium" };

const SUGGESTIONS = [
  { icon: "🍕", label: "Restaurante delivery", prompt: "Anúncio de restaurante delivery com entrega grátis na cidade inteira" },
  { icon: "💇", label: "Salão de beleza", prompt: "Promoção de salão de beleza para corte e coloração no fim de semana" },
  { icon: "🏋️", label: "Academia", prompt: "Post motivacional de academia promovendo plano trimestral com desconto" },
  { icon: "⚖️", label: "Advocacia", prompt: "Post editorial para escritório de advocacia sobre direitos trabalhistas" },
  { icon: "🦷", label: "Odontologia", prompt: "Post para clínica odontológica promovendo clareamento dental" },
  { icon: "🏠", label: "Imobiliária", prompt: "Post elegante para imobiliária divulgando apartamento de luxo" },
];

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
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-3 md:mx-6 mt-2 mb-0">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-white/80 text-xs font-medium">Plano {PLAN_LABELS[userPlan] || userPlan} ativo • Uso ilimitado</p>
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
              {remaining > 0 ? `${remaining} ${remaining === 1 ? "criação restante" : "criações restantes"} hoje` : "Limite diário atingido"}
            </p>
            <p className="text-white/30 text-[10px] hidden sm:block">Assine um plano para uso ilimitado</p>
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
// ██  MAIN PAGE — UNIFIED FLOW
// ══════════════════════════════════════════════════
export default function IAs() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Flow state
  const [step, setStep] = useState<"describe" | "copy" | "generating" | "done">("describe");
  const [prompt, setPrompt] = useState("");
  const [postType, setPostType] = useState<"feed" | "story">("feed");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string; type: string; copy?: string }[]>([]);

  // Reference image
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit mode
  const [editingImage, setEditingImage] = useState<{ url: string; prompt: string; type: string; copy?: string } | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const hasActivePlan = !!userPlan;
  const MAX_LIMIT = hasActivePlan ? Infinity : MAX_FREE_DAILY;
  const remaining = userPlan ? Infinity : Math.max(0, MAX_FREE_DAILY - dailyCount);

  // Auth
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

  const trackUsage = () => { const c = trackUsageLocal(user?.id); setDailyCount(c); };

  const getAuthHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    };
  };

  // File upload
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

  // STEP 1 → 2: Generate enhanced copy from user idea
  const handleGenerateCopy = async (customPrompt?: string) => {
    const text = (customPrompt || prompt).trim();
    if (!text) return;
    if (dailyCount >= MAX_LIMIT) {
      toast({ title: "Limite diário atingido", description: `Você usou ${MAX_FREE_DAILY}/${MAX_FREE_DAILY} criações hoje.`, variant: "destructive" });
      return;
    }
    if (customPrompt) setPrompt(customPrompt);
    setIsGeneratingCopy(true);
    setStep("copy");
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Você é um copywriter especialista em redes sociais da agência Brandify. Receba a ideia bruta do cliente e aprimore em um prompt detalhado e profissional para gerar um post de Instagram. Mantenha a essência da ideia original mas adicione detalhes visuais e de copywriting. Responda APENAS com a copy (legenda) aprimorada, sem explicações. Use emojis estrategicamente. Máximo 3 parágrafos curtos." },
            { role: "user", content: text }
          ],
          model: "google/gemini-2.5-flash",
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar copy");
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
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // STEP 2 → 3: User confirmed copy, generate the image
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setStep("generating");
    try {
      const headers = await getAuthHeaders();
      const imagePrompt = `Post profissional para Instagram: ${prompt}. Copy: ${generatedCopy}`;
      const res = await fetch(IMAGE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: imagePrompt, type: postType, referenceImage }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      if (!data.imageUrl) throw new Error("Nenhuma imagem gerada");
      setGeneratedImages((prev) => [{ url: data.imageUrl, prompt, type: postType, copy: generatedCopy }, ...prev]);
      trackUsage();
      removeReference();
      toast({ title: "Post criado com sucesso! 🎨" });
      setStep("done");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
      setStep("copy");
    } finally {
      setIsGenerating(false);
    }
  };

  // Create new post (reset flow)
  const handleNewPost = () => {
    setStep("describe");
    setPrompt("");
    setGeneratedCopy("");
    removeReference();
  };

  // Edit existing image
  const handleEditImage = async (img: { url: string; prompt: string; type: string; copy?: string }, instruction: string) => {
    if (!instruction.trim()) return;
    if (dailyCount >= MAX_LIMIT) { toast({ title: "Limite diário atingido", variant: "destructive" }); return; }
    setIsEditing(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(IMAGE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: `${img.prompt}. INSTRUÇÃO DE EDIÇÃO: ${instruction}`, type: img.type, referenceImage: img.url }),
      });
      if (!res.ok) throw new Error("Erro ao editar");
      const data = await res.json();
      if (!data.imageUrl) throw new Error("Nenhuma imagem gerada");
      setGeneratedImages((prev) => [{ url: data.imageUrl, prompt: `${img.prompt} (editado: ${instruction})`, type: img.type, copy: img.copy }, ...prev]);
      trackUsage();
      toast({ title: "Post editado! ✏️" });
      setEditingImage(null);
      setEditInstruction("");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
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
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/15">
                <img src={logo} alt="Brandify" className="w-full h-full object-cover" />
              </div>
            </Link>
            <div className="h-5 w-px bg-white/[0.08]" />
            <span className="text-white font-semibold text-sm flex items-center gap-1.5" style={{ fontFamily: "'Sora', sans-serif" }}>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              IA Studio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/30 hover:text-white hover:bg-white/[0.05] text-xs h-8">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <ProBanner user={user} remaining={remaining === Infinity ? 999 : remaining} userPlan={userPlan} />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">

            {/* ═══ WELCOME / STEP 1: Describe ═══ */}
            {step === "describe" && generatedImages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-8 md:pt-16">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 mx-auto shadow-lg shadow-violet-500/10">
                    <img src={logo} alt="Brandify" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Descreva sua ideia. <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">A IA faz o resto.</span>
                </h2>
                <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
                  Conte o que precisa — a IA aprimora, você confirma e o post fica pronto.
                </p>

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-8 flex-wrap">
                  {[
                    { num: "1", label: "Descreva" },
                    { num: "2", label: "IA aprimora" },
                    { num: "3", label: "Gera o post" },
                  ].map((s, i) => (
                    <div key={s.num} className="flex items-center gap-2">
                      {i > 0 && <div className="w-4 md:w-6 h-px bg-white/10" />}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-500/30 to-pink-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300">{s.num}</span>
                        <span className="text-white/40 text-xs">{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestion chips */}
                <div className="mb-8">
                  <p className="text-white/25 text-xs font-medium uppercase tracking-wider mb-3">Exemplos rápidos</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.label} onClick={() => { setPrompt(s.prompt); handleGenerateCopy(s.prompt); }} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.15] text-white/60 hover:text-white text-sm transition-all duration-200">
                        <span className="text-base">{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-white/15 text-sm">{remaining === Infinity ? "∞" : remaining} de {MAX_FREE_DAILY} criações disponíveis hoje</p>
              </motion.div>
            )}

            {/* Posts grid when on describe step with existing images */}
            {step === "describe" && generatedImages.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>Seus posts</h3>
                    <p className="text-white/30 text-sm">{remaining === Infinity ? "Ilimitado" : `${remaining} ${remaining === 1 ? "criação restante" : "criações restantes"} hoje`}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <AnimatePresence>
                    {generatedImages.map((img, i) => (
                      <motion.div key={`${img.prompt}-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] transition-all duration-300">
                        <img src={img.url} alt={img.prompt} className="w-full object-cover" loading="lazy" />
                        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
                          <img src={logo} alt="" className="w-5 h-5 rounded-[4px] object-cover opacity-60 shadow-sm shadow-black/40" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium px-2 py-0.5 rounded-md bg-white/10">
                              {img.type === "feed" ? "Feed 1:1" : "Story 9:16"}
                            </span>
                            <p className="text-white/70 text-xs line-clamp-2">{img.prompt}</p>
                            {img.copy && (
                              <button onClick={() => { navigator.clipboard.writeText(img.copy!); toast({ title: "Copy copiada! 📋" }); }} className="text-violet-300/80 text-xs hover:text-violet-200 transition-colors text-left">
                                📋 Copiar legenda
                              </button>
                            )}
                            <div className="flex gap-2">
                              <Button onClick={() => { const a = document.createElement("a"); a.href = img.url; a.download = `brandify-post-${i + 1}.png`; a.click(); }} size="sm" className="bg-white text-black hover:bg-white/90 border-0 text-xs font-medium h-8 px-4">
                                <Download className="w-3.5 h-3.5 mr-1.5" />Baixar
                              </Button>
                              <Button onClick={() => { setEditingImage(img); setEditInstruction(""); }} size="sm" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200 text-xs font-medium h-8 px-4">
                                <PenTool className="w-3.5 h-3.5 mr-1.5" />Editar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* ═══ STEP 2: Copy review ═══ */}
            {step === "copy" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pt-8">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {[
                    { num: "1", label: "Ideia", done: true },
                    { num: "2", label: "Copy", active: true },
                    { num: "3", label: "Post" },
                  ].map((s, i) => (
                    <div key={s.num} className="flex items-center gap-2">
                      {i > 0 && <div className="w-4 h-px bg-white/10" />}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${s.done ? "bg-green-500/10 border-green-500/20" : s.active ? "bg-violet-500/10 border-violet-500/20" : "bg-white/[0.02] border-white/[0.06]"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${s.done ? "bg-green-500/30 text-green-300" : s.active ? "bg-violet-500/30 text-violet-300" : "bg-white/10 text-white/30"}`}>
                          {s.done ? <Check className="w-3 h-3" /> : s.num}
                        </span>
                        <span className={`text-xs ${s.done ? "text-green-300/60" : s.active ? "text-violet-300/60" : "text-white/30"}`}>{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => { setStep("describe"); setGeneratedCopy(""); }} className="text-white/30 hover:text-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
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
                    <div className="w-6 h-6 rounded-md overflow-hidden">
                      <img src={logo} alt="" className="w-full h-full object-cover" />
                    </div>
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
                    <Button onClick={() => { navigator.clipboard.writeText(generatedCopy); toast({ title: "Copiado! 📋" }); }} variant="ghost" className="border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] bg-white/[0.04] h-12">
                      📋
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══ STEP 3: Generating ═══ */}
            {step === "generating" && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-16">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-10">
                  {[
                    { num: "1", label: "Ideia", done: true },
                    { num: "2", label: "Copy", done: true },
                    { num: "3", label: "Post", active: true },
                  ].map((s, i) => (
                    <div key={s.num} className="flex items-center gap-2">
                      {i > 0 && <div className="w-4 h-px bg-white/10" />}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${s.done ? "bg-green-500/10 border-green-500/20" : s.active ? "bg-violet-500/10 border-violet-500/20" : "bg-white/[0.02] border-white/[0.06]"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${s.done ? "bg-green-500/30 text-green-300" : s.active ? "bg-violet-500/30 text-violet-300" : "bg-white/10 text-white/30"}`}>
                          {s.done ? <Check className="w-3 h-3" /> : s.num}
                        </span>
                        <span className={`text-xs ${s.done ? "text-green-300/60" : s.active ? "text-violet-300/60" : "text-white/30"}`}>{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative mb-6">
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

            {/* ═══ STEP 4: Done — show result ═══ */}
            {step === "done" && generatedImages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pt-8">
                {/* Step indicator — all done */}
                <div className="flex items-center gap-2 mb-6">
                  {["Ideia", "Copy", "Post"].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      {i > 0 && <div className="w-4 h-px bg-green-500/20" />}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center"><Check className="w-3 h-3 text-green-300" /></span>
                        <span className="text-green-300/60 text-xs">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-white font-semibold text-xl mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Post pronto! 🎨</h3>

                <div className="rounded-2xl overflow-hidden border border-white/[0.08] mb-4">
                  <img src={generatedImages[0].url} alt="Post gerado" className="w-full object-cover" />
                  <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
                    <img src={logo} alt="" className="w-5 h-5 rounded-[4px] object-cover opacity-60 shadow-sm shadow-black/40" />
                  </div>
                </div>

                {generatedImages[0].copy && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-white/30 text-xs font-medium mb-1">Legenda</p>
                    <p className="text-white/70 text-sm whitespace-pre-wrap">{generatedImages[0].copy}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button onClick={() => { const a = document.createElement("a"); a.href = generatedImages[0].url; a.download = "brandify-post.png"; a.click(); }} className="flex-1 bg-white text-black hover:bg-white/90 border-0 font-medium h-11">
                    <Download className="w-4 h-4 mr-2" />Baixar post
                  </Button>
                  <Button onClick={() => { if (generatedImages[0].copy) navigator.clipboard.writeText(generatedImages[0].copy); toast({ title: "Legenda copiada! 📋" }); }} variant="ghost" className="border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] bg-white/[0.04] h-11">
                    📋 Copiar legenda
                  </Button>
                  <Button onClick={() => { setEditingImage(generatedImages[0]); setEditInstruction(""); }} variant="ghost" className="border border-violet-500/20 text-violet-300/70 hover:text-violet-200 hover:bg-violet-500/10 bg-white/[0.02] h-11">
                    <PenTool className="w-4 h-4 mr-2" />Editar
                  </Button>
                </div>

                <Button onClick={handleNewPost} variant="ghost" className="w-full border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.06] h-11">
                  <Sparkles className="w-4 h-4 mr-2" />Criar outro post
                </Button>
              </motion.div>
            )}

          </div>
        </ScrollArea>

        {/* Bottom input — only on describe step */}
        {step === "describe" && (
          <div className="shrink-0 border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-4">
              {referencePreview && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative group">
                    <img src={referencePreview} alt="Referência" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                    <button onClick={removeReference} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-medium">Imagem de referência</p>
                    <p className="text-white/25 text-[11px]">A IA vai usar como base</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/30 text-xs font-medium mr-1">Formato:</span>
                {[
                  { value: "feed" as const, label: "Feed (1:1)", icon: "📐" },
                  { value: "story" as const, label: "Story (9:16)", icon: "📱" },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setPostType(opt.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${postType === opt.value ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-white/30 hover:text-white/50 border border-transparent hover:bg-white/[0.04]"}`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Restaurante delivery com entrega grátis na cidade inteira..."
                  className="min-h-[56px] max-h-[120px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none rounded-xl pl-12 pr-14 text-sm focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerateCopy(); } }}
                />
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2.5 left-2.5 h-9 w-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all" title="Enviar logo ou referência">
                  <ImagePlus className="w-4 h-4" />
                </button>
                <Button onClick={() => handleGenerateCopy()} disabled={isGeneratingCopy || !prompt.trim() || dailyCount >= MAX_LIMIT} className="absolute bottom-2.5 right-2.5 h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 shadow-lg shadow-violet-500/20 disabled:shadow-none">
                  {isGeneratingCopy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-white/15 text-[11px] mt-2 text-center">📎 Envie uma logo ou referência • Descreva sua ideia e a IA faz tudo</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      {editingImage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111115] border border-white/[0.08] rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>Editar post ✏️</h3>
              <button onClick={() => { setEditingImage(null); setEditInstruction(""); }} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-3">
              <img src={editingImage.url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/10 shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-white/40 text-xs">Post original</p>
                <p className="text-white/60 text-xs line-clamp-3">{editingImage.prompt}</p>
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">O que você quer mudar?</label>
              <Textarea value={editInstruction} onChange={(e) => setEditInstruction(e.target.value)} placeholder="Ex: Troque o fundo pra azul escuro, mude a frase..." className="min-h-[80px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none rounded-xl text-sm" />
            </div>
            <p className="text-white/20 text-[11px]">⚠️ Cada edição conta como 1 criação</p>
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
