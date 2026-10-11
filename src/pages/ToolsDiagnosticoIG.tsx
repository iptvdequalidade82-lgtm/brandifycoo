import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft, Instagram, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Target, Zap, BarChart3, Loader2, Download, Share2, Sparkles,
  GripVertical, Plus, Trash2, Edit3, Users, Eye, Heart, MessageCircle,
  ShoppingCart, MousePointer, Percent, ArrowUpRight, Shield, Flame, Award,
  ChevronRight, Star, Lightbulb
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Metric {
  name: string;
  value: string;
  status: "good" | "warning" | "critical";
  tip: string;
}

interface ActionItem {
  priority: string;
  action: string;
  expectedImpact: string;
}

interface Diagnosis {
  score: number;
  scoreLabel: string;
  summary: string;
  metrics: Metric[];
  strengths: string[];
  weaknesses: string[];
  actionPlan: ActionItem[];
  _dataSource?: string;
}

interface CustomMetric {
  id: string;
  label: string;
  value: string;
  icon: string;
}

const METRIC_ICONS: Record<string, React.ReactNode> = {
  users: <Users className="w-4 h-4" />,
  eye: <Eye className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  message: <MessageCircle className="w-4 h-4" />,
  cart: <ShoppingCart className="w-4 h-4" />,
  click: <MousePointer className="w-4 h-4" />,
  percent: <Percent className="w-4 h-4" />,
  chart: <BarChart3 className="w-4 h-4" />,
  trending: <TrendingUp className="w-4 h-4" />,
};

const PRESET_METRICS = [
  { label: "Seguidores", icon: "users", placeholder: "Ex: 5.200" },
  { label: "Alcance médio", icon: "eye", placeholder: "Ex: 1.500" },
  { label: "Curtidas por post", icon: "heart", placeholder: "Ex: 120" },
  { label: "Comentários por post", icon: "message", placeholder: "Ex: 15" },
  { label: "Taxa de conversão", icon: "percent", placeholder: "Ex: 3.5%" },
  { label: "Leads gerados/mês", icon: "users", placeholder: "Ex: 45" },
  { label: "Cliques no link da bio", icon: "click", placeholder: "Ex: 200" },
  { label: "Vendas via Instagram", icon: "cart", placeholder: "Ex: 12" },
  { label: "Engajamento (%)", icon: "trending", placeholder: "Ex: 4.2%" },
  { label: "Visualizações de Reels", icon: "eye", placeholder: "Ex: 8.000" },
];

const DIAGNOSIS_METRIC_NAMES = [
  "Bio e Apresentação",
  "Identidade Visual",
  "Estratégia de Conteúdo",
  "Uso de Reels",
  "Engajamento",
  "Frequência de Posts",
];

const toText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const normalizeStatus = (value: unknown): Metric["status"] => {
  if (value === "good" || value === "warning" || value === "critical") return value;
  return "warning";
};

const normalizeDiagnosis = (raw: any): Diagnosis => {
  const scoreValue = Number(raw?.score);
  const score = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, Math.round(scoreValue))) : 50;
  const rawMetrics = Array.isArray(raw?.metrics) ? raw.metrics : [];

  const metrics = DIAGNOSIS_METRIC_NAMES.map((name, index) => {
    const source = rawMetrics[index] ?? {};
    return {
      name,
      value: toText(source?.value, "Não foi possível avaliar com os dados disponíveis."),
      status: normalizeStatus(source?.status),
      tip: toText(source?.tip, "Adicione métricas do cliente para personalizar esta recomendação."),
    };
  });

  const strengths = Array.isArray(raw?.strengths)
    ? raw.strengths.filter((item: unknown) => typeof item === "string" && item.trim().length > 0).slice(0, 3)
    : [];

  const weaknesses = Array.isArray(raw?.weaknesses)
    ? raw.weaknesses.filter((item: unknown) => typeof item === "string" && item.trim().length > 0).slice(0, 3)
    : [];

  const actionPlanInput = Array.isArray(raw?.actionPlan) ? raw.actionPlan : [];
  const actionPlan = Array.from({ length: 5 }, (_, index) => {
    const source = actionPlanInput[index] ?? {};
    return {
      priority: toText(source?.priority, index < 2 ? "alta" : index < 4 ? "media" : "baixa"),
      action: toText(source?.action, `Executar ação estratégica #${index + 1} para melhorar performance do perfil.`),
      expectedImpact: toText(source?.expectedImpact, "Aumentar clareza de posicionamento, engajamento e conversão."),
    };
  });

  return {
    score,
    scoreLabel: toText(raw?.scoreLabel, score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : score >= 20 ? "Fraco" : "Crítico"),
    summary: toText(raw?.summary, "Diagnóstico gerado com dados limitados. Adicione métricas para maior precisão."),
    metrics,
    strengths: [
      strengths[0] ?? "Há oportunidade clara de melhorar consistência e clareza do conteúdo.",
      strengths[1] ?? "Existe potencial para fortalecer autoridade do perfil com posicionamento mais direto.",
      strengths[2] ?? "Com ajustes de comunicação e formato, o perfil pode gerar mais resultado.",
    ],
    weaknesses: [
      weaknesses[0] ?? "A proposta de valor ainda pode estar pouco explícita para novos visitantes.",
      weaknesses[1] ?? "A estratégia de conteúdo pode estar inconsistente para o objetivo de negócio.",
      weaknesses[2] ?? "Faltam sinais claros de otimização contínua para engajamento e conversão.",
    ],
    actionPlan,
    _dataSource: raw?._dataSource === "real" ? "real" : raw?._dataSource === "partial" ? "partial" : "general",
  };
};

export function DiagnosticoContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [handle, setHandle] = useState("");
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Editable states for diagnosis results
  const [editableMetrics, setEditableMetrics] = useState<Metric[]>([]);
  const [editableStrengths, setEditableStrengths] = useState<string[]>([]);
  const [editableWeaknesses, setEditableWeaknesses] = useState<string[]>([]);
  const [editableActions, setEditableActions] = useState<ActionItem[]>([]);
  const [editableScore, setEditableScore] = useState(0);

  useEffect(() => {
    if (diagnosis) {
      setEditableMetrics(diagnosis.metrics || []);
      setEditableStrengths(diagnosis.strengths || []);
      setEditableWeaknesses(diagnosis.weaknesses || []);
      setEditableActions(diagnosis.actionPlan || []);
      setEditableScore(diagnosis.score);
      setEditedSummary(diagnosis.summary);
    }
  }, [diagnosis]);

  const addCustomMetric = (preset?: typeof PRESET_METRICS[0]) => {
    const newMetric: CustomMetric = {
      id: crypto.randomUUID(),
      label: preset?.label || "Nova métrica",
      value: "",
      icon: preset?.icon || "chart",
    };
    setCustomMetrics(prev => [...prev, newMetric]);
    setShowPresets(false);
    setEditingMetric(newMetric.id);
  };

  const updateCustomMetric = (id: string, field: keyof CustomMetric, value: string) => {
    setCustomMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeCustomMetric = (id: string) => {
    setCustomMetrics(prev => prev.filter(m => m.id !== id));
  };

  const updateEditableMetricValue = (index: number, value: string) => {
    setEditableMetrics(prev => prev.map((m, i) => i === index ? { ...m, value } : m));
  };

  const updateEditableStrength = (index: number, value: string) => {
    setEditableStrengths(prev => prev.map((s, i) => i === index ? value : s));
  };

  const updateEditableWeakness = (index: number, value: string) => {
    setEditableWeaknesses(prev => prev.map((w, i) => i === index ? value : w));
  };

  const updateEditableAction = (index: number, field: keyof ActionItem, value: string) => {
    setEditableActions(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  const captureImage = useCallback(async (): Promise<Blob | null> => {
    if (!resultsRef.current) return null;
    const canvas = await html2canvas(resultsRef.current, { backgroundColor: "#000", scale: 2, useCORS: true });
    return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  }, []);

  const handleDownload = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await captureImage();
      if (!blob) throw new Error("Erro ao gerar imagem");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diagnostico-instagram-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Imagem salva!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setExporting(false); }
  }, [captureImage, toast]);

  const handleShare = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await captureImage();
      if (!blob) throw new Error("Erro ao gerar imagem");
      const file = new File([blob], "diagnostico.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Diagnóstico Instagram", text: `Nota: ${editableScore}/100`, files: [file] });
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast({ title: "Imagem copiada!" });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setExporting(false); }
  }, [captureImage, toast, editableScore]);

  const analyze = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setDiagnosis(null);
    try {
      const cleanHandle = handle
        .trim()
        .replace(/^@/, "")
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .split(/[/?#]/)[0]
        .trim();

      if (!cleanHandle) {
        throw new Error("Informe um @ válido do Instagram");
      }

      // Include custom metrics in the analysis
      const extraContext = customMetrics.filter(m => m.value.trim()).length > 0
        ? customMetrics.filter(m => m.value.trim()).map(m => `${m.label}: ${m.value}`).join(", ")
        : undefined;

      const { data, error } = await supabase.functions.invoke("diagnose-instagram", {
        body: { handle: cleanHandle, extraMetrics: extraContext },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const normalized = normalizeDiagnosis(data);
      setDiagnosis(normalized);
    } catch (e: any) {
      toast({ title: "Erro na análise", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (s: string) => {
    if (s === "good") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === "warning") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const cycleStatus = (index: number) => {
    const order: Metric["status"][] = ["good", "warning", "critical"];
    setEditableMetrics(prev => prev.map((m, i) => {
      if (i !== index) return m;
      const next = order[(order.indexOf(m.status) + 1) % 3];
      return { ...m, status: next };
    }));
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const scoreRingColor = (score: number) => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#fbbf24";
    if (score >= 40) return "#fb923c";
    return "#f87171";
  };

  const scoreRingBg = (score: number) => {
    if (score >= 80) return "rgba(52,211,153,0.1)";
    if (score >= 60) return "rgba(251,191,36,0.1)";
    if (score >= 40) return "rgba(251,146,60,0.1)";
    return "rgba(248,113,113,0.1)";
  };

  const statusBarWidth = (s: string) => {
    if (s === "good") return "100%";
    if (s === "warning") return "60%";
    return "30%";
  };

  const statusBarColor = (s: string) => {
    if (s === "good") return "bg-emerald-400";
    if (s === "warning") return "bg-amber-400";
    return "bg-red-400";
  };

  const inputCls = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors";
  const editInputCls = "bg-transparent border-b border-white/10 focus:border-pink-400/50 outline-none text-white w-full transition-colors";

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Input area */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span className="text-[11px] text-pink-300 font-medium">Análise automática com IA</span>
            </div>
            <h2 className="font-['Playfair_Display'] font-bold text-2xl mb-2">Diagnóstico Completo</h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">Cole o @ ou o link do Instagram e a IA vai analisar bio, perfil, conteúdo, frequência e dar recomendações personalizadas.</p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && analyze()}
                placeholder="@perfil ou instagram.com/perfil"
                className={inputCls + " pl-10"}
                disabled={loading}
              />
            </div>
            <button
              onClick={analyze}
              disabled={loading || !handle.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 text-white text-sm font-semibold disabled:opacity-40 hover:scale-[1.02] transition-all whitespace-nowrap"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</> : <><BarChart3 className="w-4 h-4" /> Analisar</>}
            </button>
          </div>

          {/* Custom metrics section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase font-semibold tracking-wider">Suas métricas (opcional)</span>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar métrica
              </button>
            </div>

            {/* Preset picker */}
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    {PRESET_METRICS.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => addCustomMetric(preset)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 hover:text-white hover:bg-white/[0.06] transition-all text-left"
                      >
                        <span className="text-pink-400">{METRIC_ICONS[preset.icon]}</span>
                        {preset.label}
                      </button>
                    ))}
                    <button
                      onClick={() => addCustomMetric()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 text-xs text-white/30 hover:text-white/60 hover:border-white/20 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Personalizada
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom metrics list - draggable */}
            {customMetrics.length > 0 && (
              <Reorder.Group
                axis="y"
                values={customMetrics}
                onReorder={setCustomMetrics}
                className="space-y-2"
              >
                {customMetrics.map(metric => (
                  <Reorder.Item
                    key={metric.id}
                    value={metric}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-grab active:cursor-grabbing group"
                  >
                    <GripVertical className="w-4 h-4 text-white/15 group-hover:text-white/30 flex-shrink-0" />
                    <span className="text-pink-400/60 flex-shrink-0">{METRIC_ICONS[metric.icon] || METRIC_ICONS.chart}</span>
                    
                    {editingMetric === metric.id ? (
                      <input
                        autoFocus
                        value={metric.label}
                        onChange={e => updateCustomMetric(metric.id, "label", e.target.value)}
                        onBlur={() => setEditingMetric(null)}
                        onKeyDown={e => e.key === "Enter" && setEditingMetric(null)}
                        className="bg-transparent border-b border-pink-400/30 outline-none text-xs text-white w-24 flex-shrink-0"
                      />
                    ) : (
                      <span
                        onClick={() => setEditingMetric(metric.id)}
                        className="text-xs text-white/50 cursor-text hover:text-white/70 flex-shrink-0 min-w-[80px]"
                      >
                        {metric.label}
                      </span>
                    )}

                    <input
                      value={metric.value}
                      onChange={e => updateCustomMetric(metric.id, "value", e.target.value)}
                      placeholder={PRESET_METRICS.find(p => p.label === metric.label)?.placeholder || "Digite o valor"}
                      className="flex-1 bg-transparent border-b border-white/[0.06] focus:border-pink-400/30 outline-none text-sm text-white placeholder:text-white/15 transition-colors"
                    />

                    <button
                      onClick={() => removeCustomMetric(metric.id)}
                      className="text-white/15 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
        </motion.div>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-pink-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
                <Instagram className="absolute inset-0 m-auto w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">Analisando @{handle.replace(/^@/, "")}...</p>
                <p className="text-white/30 text-xs mt-1">A IA está coletando dados reais e avaliando o perfil</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results - Premium Dashboard */}
        <AnimatePresence>
          {diagnosis && !loading && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
              {diagnosis._dataSource !== "real" && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 backdrop-blur-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-300/80">Dados públicos insuficientes ou não verificados. A pontuação não foi validada; adicione suas métricas para uma análise mais precisa.</span>
                </motion.div>
              )}

              <div ref={resultsRef} className="space-y-6 bg-black p-1">

                {/* ═══ TOP ROW: Score + Radar Chart ═══ */}
                {diagnosis._dataSource === "real" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {/* Score Card */}
                  <div
                    className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 flex flex-col items-center justify-center"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${scoreRingBg(editableScore)}, transparent 70%), rgba(255,255,255,0.02)` }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-15 blur-[60px] pointer-events-none" style={{ background: scoreRingColor(editableScore) }} />
                    <div className="relative w-32 h-32 mb-3">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
                        <motion.circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke={scoreRingColor(editableScore)}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 52}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - editableScore / 100) }}
                          transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <input
                          type="number" min={0} max={100}
                          value={editableScore}
                          onChange={e => setEditableScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className={`text-4xl font-bold font-['Sora'] ${scoreColor(editableScore)} bg-transparent text-center w-16 outline-none`}
                        />
                        <span className="text-[10px] text-white/25 tracking-[0.2em]">/ 100</span>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      editableScore >= 80 ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.06]" :
                      editableScore >= 60 ? "text-amber-400 border-amber-400/20 bg-amber-400/[0.06]" :
                      editableScore >= 40 ? "text-orange-400 border-orange-400/20 bg-orange-400/[0.06]" :
                      "text-red-400 border-red-400/20 bg-red-400/[0.06]"
                    }`}>
                      {editableScore >= 80 ? <Award className="w-3 h-3" /> : editableScore >= 40 ? <TrendingUp className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                      {editableScore >= 80 ? "Excelente" : editableScore >= 60 ? "Bom" : editableScore >= 40 ? "Regular" : editableScore >= 20 ? "Fraco" : "Crítico"}
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div className="relative rounded-2xl border border-white/[0.06] p-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-[10px] text-white/25 uppercase tracking-widest font-semibold block mb-1">Visão Geral</span>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={editableMetrics.map(m => ({
                        metric: m.name.replace("Bio e Apresentação", "Bio").replace("Identidade Visual", "Visual").replace("Estratégia de Conteúdo", "Conteúdo").replace("Frequência de Posts", "Frequência"),
                        score: m.status === "good" ? 90 : m.status === "warning" ? 55 : 25,
                        fullMark: 100
                      }))}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                        <Radar name="Performance" dataKey="score" stroke={scoreRingColor(editableScore)} fill={scoreRingColor(editableScore)} fillOpacity={0.15} strokeWidth={2} />
                        <Tooltip
                          contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11, color: "#fff" }}
                          formatter={(value: number) => [`${value}/100`, "Nota"]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                )}

                {/* ═══ SUMMARY ═══ */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  {editingSummary ? (
                    <textarea
                      autoFocus value={editedSummary} onChange={e => setEditedSummary(e.target.value)} onBlur={() => setEditingSummary(false)} rows={3}
                      className="w-full text-white/60 text-sm leading-relaxed bg-white/[0.03] border border-white/10 rounded-xl p-4 outline-none focus:border-white/20 resize-none"
                    />
                  ) : (
                    <p onClick={() => setEditingSummary(true)} className="text-white/45 text-[13px] leading-relaxed cursor-text hover:text-white/65 transition-colors border border-transparent hover:border-white/[0.06] rounded-xl p-4">
                      {editedSummary}
                    </p>
                  )}
                </motion.div>

                {/* ═══ METRICS TABLE ═══ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-3.5 h-3.5 text-white/25" />
                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Métricas Detalhadas</span>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.015)" }}>
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[180px_1fr_80px] gap-3 px-5 py-3 border-b border-white/[0.05]">
                      <span className="text-[10px] text-white/20 uppercase tracking-wider font-semibold">Métrica</span>
                      <span className="text-[10px] text-white/20 uppercase tracking-wider font-semibold hidden sm:block">Avaliação</span>
                      <span className="text-[10px] text-white/20 uppercase tracking-wider font-semibold text-right">Status</span>
                    </div>
                    {/* Table rows */}
                    <Reorder.Group axis="y" values={editableMetrics} onReorder={setEditableMetrics} as="div">
                      {editableMetrics.map((m, i) => (
                        <Reorder.Item key={m.name} value={m} as="div" className="group">
                          <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.06 }}
                            className="grid grid-cols-[1fr_auto] sm:grid-cols-[180px_1fr_80px] gap-3 items-center px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center gap-2.5">
                              <GripVertical className="w-3 h-3 text-white/[0.06] group-hover:text-white/20 flex-shrink-0" />
                              <span className="text-[12px] text-white/60 font-medium">{m.name}</span>
                            </div>
                            <div className="hidden sm:block">
                              <input
                                value={m.value}
                                onChange={e => updateEditableMetricValue(i, e.target.value)}
                                className="bg-transparent outline-none text-[12px] text-white/50 w-full focus:text-white/80 transition-colors"
                                placeholder="Editar avaliação..."
                              />
                              <p className="text-[10px] text-white/20 mt-0.5 line-clamp-1">{m.tip}</p>
                            </div>
                            <div className="flex justify-end">
                              <button onClick={() => cycleStatus(i)} className="flex items-center gap-1.5 hover:scale-105 transition-transform">
                                {statusIcon(m.status)}
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                                  m.status === "good" ? "text-emerald-400/70" : m.status === "warning" ? "text-amber-400/70" : "text-red-400/70"
                                }`}>
                                  {m.status === "good" ? "Bom" : m.status === "warning" ? "Alerta" : "Crítico"}
                                </span>
                              </button>
                            </div>
                            {/* Mobile value row */}
                            <div className="sm:hidden col-span-2">
                              <input
                                value={m.value}
                                onChange={e => updateEditableMetricValue(i, e.target.value)}
                                className="bg-transparent outline-none text-[11px] text-white/40 w-full focus:text-white/70 transition-colors"
                                placeholder="Editar avaliação..."
                              />
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                </motion.div>

                {/* Custom metrics display */}
                {customMetrics.filter(m => m.value.trim()).length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-3 block">Métricas do cliente</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {customMetrics.filter(m => m.value.trim()).map(m => (
                        <div key={m.id} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover:border-white/[0.1] transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white/15">{METRIC_ICONS[m.icon]}</span>
                            <span className="text-[9px] text-white/25 uppercase tracking-widest">{m.label}</span>
                          </div>
                          <div className="text-lg font-bold text-white font-['Sora']">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ═══ SWOT - Two Column Premium Cards ═══ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="rounded-2xl border border-emerald-500/10 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.04), rgba(52,211,153,0.01))" }}>
                    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-emerald-500/10">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Pontos Fortes</span>
                    </div>
                    <div className="p-5 space-y-3">
                      {editableStrengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Star className="w-3 h-3 text-emerald-400/40 mt-1 flex-shrink-0" />
                          <input
                            value={s} onChange={e => updateEditableStrength(i, e.target.value)}
                            className="bg-transparent border-none outline-none text-[12px] text-white/50 w-full focus:text-white/80 transition-colors leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="rounded-2xl border border-red-500/10 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.04), rgba(248,113,113,0.01))" }}>
                    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-red-500/10">
                      <div className="w-5 h-5 rounded-md bg-red-500/15 flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      </div>
                      <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest">Pontos Fracos</span>
                    </div>
                    <div className="p-5 space-y-3">
                      {editableWeaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Lightbulb className="w-3 h-3 text-red-400/40 mt-1 flex-shrink-0" />
                          <input
                            value={w} onChange={e => updateEditableWeakness(i, e.target.value)}
                            className="bg-transparent border-none outline-none text-[12px] text-white/50 w-full focus:text-white/80 transition-colors leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* ═══ ACTION PLAN - Numbered Cards ═══ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center">
                      <Target className="w-3 h-3 text-white/35" />
                    </div>
                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Plano de Ação</span>
                  </div>

                  <Reorder.Group axis="y" values={editableActions} onReorder={setEditableActions} className="space-y-3">
                    {editableActions.map((a, i) => (
                      <Reorder.Item key={`action-${i}`} value={a} className="group cursor-grab active:cursor-grabbing">
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.08 }}
                          className="rounded-xl border border-white/[0.05] hover:border-white/[0.08] transition-all overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.015)" }}
                        >
                          <div className="flex items-stretch">
                            {/* Number strip */}
                            <div className={`w-12 flex flex-col items-center justify-center flex-shrink-0 border-r border-white/[0.04] ${
                              a.priority === "alta" ? "bg-red-500/[0.06]" :
                              a.priority === "media" ? "bg-amber-500/[0.06]" :
                              "bg-blue-500/[0.06]"
                            }`}>
                              <span className={`text-lg font-bold font-['Sora'] ${
                                a.priority === "alta" ? "text-red-400/60" :
                                a.priority === "media" ? "text-amber-400/60" :
                                "text-blue-400/60"
                              }`}>{i + 1}</span>
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <GripVertical className="w-3 h-3 text-white/[0.06] group-hover:text-white/20 transition-colors" />
                                <select
                                  value={a.priority}
                                  onChange={e => updateEditableAction(i, "priority", e.target.value)}
                                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md cursor-pointer outline-none tracking-wider ${
                                    a.priority === "alta" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                    a.priority === "media" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                    "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  }`}
                                >
                                  <option value="alta">Alta</option>
                                  <option value="media">Média</option>
                                  <option value="baixa">Baixa</option>
                                </select>
                              </div>
                              <input
                                value={a.action}
                                onChange={e => updateEditableAction(i, "action", e.target.value)}
                                className="bg-transparent border-none outline-none text-[12px] font-medium text-white/65 w-full focus:text-white transition-colors mb-1"
                              />
                              <div className="flex items-center gap-1.5">
                                <ChevronRight className="w-3 h-3 text-white/10 flex-shrink-0" />
                                <input
                                  value={a.expectedImpact}
                                  onChange={e => updateEditableAction(i, "expectedImpact", e.target.value)}
                                  className="bg-transparent border-none outline-none text-[10px] text-white/20 w-full focus:text-white/40 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </motion.div>
              </div>

              {/* Export buttons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex gap-3">
                <button onClick={handleDownload} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] text-sm transition-all disabled:opacity-40 hover:border-white/[0.1]">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Salvar imagem
                </button>
                <button onClick={handleShare} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] text-sm transition-all disabled:opacity-40 hover:border-white/[0.1]">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Compartilhar
                </button>
              </motion.div>

              <button onClick={() => { setDiagnosis(null); setHandle(""); setCustomMetrics([]); }} className="w-full py-3 rounded-xl border border-white/[0.06] text-white/25 text-sm hover:text-white/50 hover:border-white/[0.1] transition-all">
                Nova análise
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ToolsDiagnosticoIG() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>;

  return (
    <PlanGate minPlan="premium" featureName="Diagnóstico Instagram" featureDescription="Análise completa do seu perfil com IA — nota, métricas e plano de ação.">
      <DiagnosticoContent />
    </PlanGate>
  );
}
