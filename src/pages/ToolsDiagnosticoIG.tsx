import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Instagram, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Target, Zap, BarChart3, Loader2, Download, Share2, Sparkles
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
}

export function DiagnosticoContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [handle, setHandle] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

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
        await navigator.share({ title: "Diagnóstico Instagram", text: `Nota: ${diagnosis?.score}/100 — ${diagnosis?.scoreLabel}`, files: [file] });
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast({ title: "Imagem copiada!" });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setExporting(false); }
  }, [captureImage, toast, diagnosis]);

  const analyze = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setDiagnosis(null);
    try {
      const cleanHandle = handle.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
      const { data, error } = await supabase.functions.invoke("diagnose-instagram", {
        body: { handle: cleanHandle },
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

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const inputCls = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span className="font-['Playfair_Display'] font-bold text-sm">Diagnóstico Instagram</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Input area - always visible */}
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
                <p className="text-white/30 text-xs mt-1">A IA está avaliando bio, conteúdo, engajamento e estratégia</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {diagnosis && !loading && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div ref={resultsRef} className="space-y-6 bg-black p-1">
                {/* Score */}
                <div className="text-center py-6">
                  <div className={`text-6xl font-bold font-['Playfair_Display'] ${scoreColor(diagnosis.score)}`}>{diagnosis.score}</div>
                  <div className="text-white/40 text-sm mt-1">{diagnosis.scoreLabel}</div>
                  <p className="text-white/60 text-sm mt-3 max-w-md mx-auto">{diagnosis.summary}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {diagnosis.metrics.map((m, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {statusIcon(m.status)}
                        <span className="text-xs text-white/50">{m.name}</span>
                      </div>
                      <div className="text-lg font-semibold text-white mb-1">{m.value}</div>
                      <p className="text-[11px] text-white/30">{m.tip}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-4">
                    <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400 uppercase">Pontos fortes</span></div>
                    <ul className="space-y-2">{diagnosis.strengths.map((s, i) => <li key={i} className="text-sm text-white/60">• {s}</li>)}</ul>
                  </div>
                  <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 p-4">
                    <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-xs font-semibold text-red-400 uppercase">Pontos fracos</span></div>
                    <ul className="space-y-2">{diagnosis.weaknesses.map((w, i) => <li key={i} className="text-sm text-white/60">• {w}</li>)}</ul>
                  </div>
                </div>

                {/* Action Plan */}
                <div>
                  <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-pink-400" /><span className="text-xs font-semibold text-white/40 uppercase">Plano de ação</span></div>
                  <div className="space-y-2">
                    {diagnosis.actionPlan.map((a, i) => (
                      <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${a.priority === "alta" ? "bg-red-500/20 text-red-400" : a.priority === "media" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>{a.priority}</span>
                        </div>
                        <p className="text-sm text-white/80 font-medium">{a.action}</p>
                        <p className="text-[11px] text-white/30 mt-1"><Zap className="w-3 h-3 inline mr-1" />{a.expectedImpact}</p>
                      </div>
                    ))}
                  </div>
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

              <button onClick={() => { setDiagnosis(null); setHandle(""); }} className="w-full py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm hover:text-white transition-colors">
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