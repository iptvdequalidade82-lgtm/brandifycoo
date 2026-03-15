import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft, Instagram, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Target, Zap, BarChart3, Loader2, Download, Share2, Sparkles,
  GripVertical, Plus, Trash2, Edit3, Users, Eye, Heart, MessageCircle,
  ShoppingCart, MousePointer, Percent
} from "lucide-react";
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
    _dataSource: raw?._dataSource === "real" ? "real" : "general",
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
      const cleanHandle = handle.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
      
      // Include custom metrics in the analysis
      const extraContext = customMetrics.filter(m => m.value.trim()).length > 0
        ? customMetrics.filter(m => m.value.trim()).map(m => `${m.label}: ${m.value}`).join(", ")
        : undefined;

      const { data, error } = await supabase.functions.invoke("diagnose-instagram", {
        body: { handle: cleanHandle, extraMetrics: extraContext },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDiagnosis(data);
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

        {/* Results - fully editable */}
        <AnimatePresence>
          {diagnosis && !loading && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {diagnosis._dataSource === "general" && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-300">Análise baseada em recomendações gerais. Adicione suas métricas acima para um diagnóstico mais preciso.</span>
                </div>
              )}

              <div ref={resultsRef} className="space-y-6 bg-black p-1">
                {/* Score - editable */}
                <div className="text-center py-6">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editableScore}
                      onChange={e => setEditableScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className={`text-6xl font-bold font-['Playfair_Display'] ${scoreColor(editableScore)} bg-transparent text-center w-28 outline-none border-b-2 border-transparent hover:border-white/10 focus:border-pink-400/30 transition-colors`}
                    />
                  </div>
                  <div className="text-white/40 text-sm mt-1">{
                    editableScore >= 80 ? "Excelente" :
                    editableScore >= 60 ? "Bom" :
                    editableScore >= 40 ? "Regular" :
                    editableScore >= 20 ? "Fraco" : "Crítico"
                  }</div>
                  
                  {editingSummary ? (
                    <textarea
                      autoFocus
                      value={editedSummary}
                      onChange={e => setEditedSummary(e.target.value)}
                      onBlur={() => setEditingSummary(false)}
                      rows={3}
                      className="text-white/60 text-sm mt-3 max-w-md mx-auto bg-transparent border border-white/10 rounded-lg p-2 w-full outline-none focus:border-pink-400/30 resize-none"
                    />
                  ) : (
                    <p
                      onClick={() => setEditingSummary(true)}
                      className="text-white/60 text-sm mt-3 max-w-md mx-auto cursor-text hover:text-white/80 transition-colors border-b border-transparent hover:border-white/10"
                    >
                      {editedSummary}
                    </p>
                  )}
                </div>

                {/* Metrics - editable values + clickable status */}
                <Reorder.Group
                  axis="y"
                  values={editableMetrics}
                  onReorder={setEditableMetrics}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  as="div"
                >
                  {editableMetrics.map((m, i) => (
                    <Reorder.Item
                      key={m.name}
                      value={m}
                      className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 cursor-grab active:cursor-grabbing group"
                      as="div"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-3 h-3 text-white/10 group-hover:text-white/25" />
                        <button onClick={() => cycleStatus(i)} className="hover:scale-110 transition-transform" title="Clique para mudar status">
                          {statusIcon(m.status)}
                        </button>
                        <span className="text-xs text-white/50">{m.name}</span>
                      </div>
                      <input
                        value={m.value}
                        onChange={e => updateEditableMetricValue(i, e.target.value)}
                        className={`${editInputCls} text-lg font-semibold mb-1`}
                        placeholder="Editar avaliação..."
                      />
                      <p className="text-[11px] text-white/30 mt-1">{m.tip}</p>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {/* Custom metrics display */}
                {customMetrics.filter(m => m.value.trim()).length > 0 && (
                  <div>
                    <span className="text-xs text-white/30 uppercase font-semibold tracking-wider mb-3 block">Métricas do cliente</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {customMetrics.filter(m => m.value.trim()).map(m => (
                        <div key={m.id} className="rounded-xl bg-pink-500/[0.04] border border-pink-500/10 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-pink-400/60">{METRIC_ICONS[m.icon]}</span>
                            <span className="text-xs text-white/40">{m.label}</span>
                          </div>
                          <div className="text-lg font-semibold text-white">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses - editable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase">Pontos fortes</span>
                    </div>
                    <ul className="space-y-2">
                      {editableStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-white/40 mt-0.5">•</span>
                          <input
                            value={s}
                            onChange={e => updateEditableStrength(i, e.target.value)}
                            className={`${editInputCls} text-sm text-white/60 focus:text-white`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-semibold text-red-400 uppercase">Pontos fracos</span>
                    </div>
                    <ul className="space-y-2">
                      {editableWeaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-white/40 mt-0.5">•</span>
                          <input
                            value={w}
                            onChange={e => updateEditableWeakness(i, e.target.value)}
                            className={`${editInputCls} text-sm text-white/60 focus:text-white`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Plan - editable */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-semibold text-white/40 uppercase">Plano de ação</span>
                  </div>
                  <Reorder.Group axis="y" values={editableActions} onReorder={setEditableActions} className="space-y-2">
                    {editableActions.map((a, i) => (
                      <Reorder.Item key={`action-${i}`} value={a} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 cursor-grab active:cursor-grabbing group">
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="w-3 h-3 text-white/10 group-hover:text-white/25" />
                          <select
                            value={a.priority}
                            onChange={e => updateEditableAction(i, "priority", e.target.value)}
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full cursor-pointer outline-none ${
                              a.priority === "alta" ? "bg-red-500/20 text-red-400" :
                              a.priority === "media" ? "bg-amber-500/20 text-amber-400" :
                              "bg-blue-500/20 text-blue-400"
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
                          className={`${editInputCls} text-sm font-medium text-white/80 focus:text-white mb-1`}
                        />
                        <div className="flex items-center gap-1 mt-1">
                          <Zap className="w-3 h-3 text-white/20 flex-shrink-0" />
                          <input
                            value={a.expectedImpact}
                            onChange={e => updateEditableAction(i, "expectedImpact", e.target.value)}
                            className={`${editInputCls} text-[11px] text-white/30 focus:text-white/50`}
                          />
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </div>

              {/* Export buttons */}
              <div className="flex gap-3">
                <button onClick={handleDownload} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] text-sm transition-all disabled:opacity-40">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Salvar imagem
                </button>
                <button onClick={handleShare} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] text-sm transition-all disabled:opacity-40">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Compartilhar
                </button>
              </div>

              <button onClick={() => { setDiagnosis(null); setHandle(""); setCustomMetrics([]); }} className="w-full py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm hover:text-white transition-colors">
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
