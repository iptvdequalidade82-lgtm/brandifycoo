import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Instagram, Search, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Target, Zap, BarChart3, Loader2
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

function DiagnosticoContent() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

  const [form, setForm] = useState({
    handle: "", followers: "", following: "", posts: "",
    avgLikes: "", avgComments: "", postsPerWeek: "3",
    bio: "", niche: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("diagnose-instagram", {
        body: {
          handle: form.handle,
          followers: Number(form.followers) || 0,
          following: Number(form.following) || 0,
          posts: Number(form.posts) || 0,
          avgLikes: Number(form.avgLikes) || 0,
          avgComments: Number(form.avgComments) || 0,
          postsPerWeek: Number(form.postsPerWeek) || 0,
          bio: form.bio,
          niche: form.niche,
        },
      });
      if (error) throw error;
      setDiagnosis(data);
      setStep(2);
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
        <AnimatePresence mode="wait">
          {/* Step 0: Handle + Niche */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div>
                <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Analise seu perfil</h2>
                <p className="text-white/40 text-sm">Informe o @ e os dados básicos do seu Instagram.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-sm">@</span>
                  <input value={form.handle} onChange={e => update("handle", e.target.value)} placeholder="seu_perfil" className={inputCls} />
                </div>
                <input value={form.niche} onChange={e => update("niche", e.target.value)} placeholder="Nicho (ex: Barbearia, Restaurante, Coach...)" className={inputCls} />
                <textarea value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="Cole sua bio aqui (opcional)" rows={2} className={inputCls + " resize-none"} />
              </div>

              <button onClick={() => setStep(1)} disabled={!form.handle.trim()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 text-white text-sm font-semibold disabled:opacity-40 hover:scale-[1.01] transition-all">
                Próximo <Search className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 1: Metrics */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div>
                <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Métricas do perfil</h2>
                <p className="text-white/40 text-sm">Informe os números — você encontra no Instagram Insights.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-white/30 uppercase mb-1 block">Seguidores</label><input type="number" value={form.followers} onChange={e => update("followers", e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className="text-[10px] text-white/30 uppercase mb-1 block">Seguindo</label><input type="number" value={form.following} onChange={e => update("following", e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className="text-[10px] text-white/30 uppercase mb-1 block">Total de posts</label><input type="number" value={form.posts} onChange={e => update("posts", e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className="text-[10px] text-white/30 uppercase mb-1 block">Posts/semana</label><input type="number" value={form.postsPerWeek} onChange={e => update("postsPerWeek", e.target.value)} placeholder="3" className={inputCls} /></div>
                <div><label className="text-[10px] text-white/30 uppercase mb-1 block">Média de curtidas</label><input type="number" value={form.avgLikes} onChange={e => update("avgLikes", e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className="text-[10px] text-white/30 uppercase mb-1 block">Média de comentários</label><input type="number" value={form.avgComments} onChange={e => update("avgComments", e.target.value)} placeholder="0" className={inputCls} /></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm hover:text-white transition-colors">← Voltar</button>
                <button onClick={analyze} disabled={loading || !form.followers} className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 text-white text-sm font-semibold disabled:opacity-40 hover:scale-[1.01] transition-all">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</> : <><BarChart3 className="w-4 h-4" /> Gerar Diagnóstico</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === 2 && diagnosis && (
            <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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

              <button onClick={() => { setStep(0); setDiagnosis(null); }} className="w-full py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm hover:text-white transition-colors">
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
