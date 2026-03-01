import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Compass, ArrowRight, Loader2, Target, Calendar,
  AlertTriangle, Zap, CheckCircle2, Users, BarChart3, Download, Share2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Phase {
  name: string;
  duration: string;
  objective: string;
  actions: { task: string; responsible: string; deadline: string }[];
}

interface WeekDay {
  day: string;
  focus: string;
  tasks: string[];
}

interface Plan {
  vision: string;
  kpis: { name: string; current: string; target: string; unit: string }[];
  phases: Phase[];
  weeklyRoutine: WeekDay[];
  risks: { risk: string; mitigation: string }[];
  quickWins: string[];
}

const STEPS = ["Negócio", "Metas", "Contexto"];

function PlanejamentoContent() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activePhase, setActivePhase] = useState(0);
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
      a.download = `planejamento-estrategico-${Date.now()}.png`;
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
      const file = new File([blob], "planejamento.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Planejamento Estratégico", text: plan?.vision || "", files: [file] });
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast({ title: "Imagem copiada!" });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setExporting(false); }
  }, [captureImage, toast, plan]);

  const [form, setForm] = useState({
    businessName: "", segment: "", currentRevenue: "",
    goal: "", timeframe: "90 dias",
    challenges: "", channels: "", teamSize: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors";

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-strategic-plan", { body: form });
      if (error) throw error;
      setPlan(data);
      setStep(3);
    } catch (e: any) {
      toast({ title: "Erro ao gerar plano", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.businessName.trim() && form.segment.trim();
    if (step === 1) return form.goal.trim();
    return true;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span className="font-['Playfair_Display'] font-bold text-sm">Planejamento</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Wizard steps indicator */}
        {step < 3 && (
          <div className="flex gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-blue-400" : "bg-white/[0.06]"}`} />
                <span className={`text-[10px] mt-1 block ${i <= step ? "text-blue-400" : "text-white/20"}`}>{s}</span>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <div><h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Sobre o negócio</h2><p className="text-white/40 text-sm">Dados básicos da empresa.</p></div>
              <input value={form.businessName} onChange={e => update("businessName", e.target.value)} placeholder="Nome do negócio" className={inputCls} />
              <input value={form.segment} onChange={e => update("segment", e.target.value)} placeholder="Segmento (ex: Barbearia, SaaS, E-commerce...)" className={inputCls} />
              <input value={form.currentRevenue} onChange={e => update("currentRevenue", e.target.value)} placeholder="Faturamento mensal atual (R$) — opcional" className={inputCls} />
              <input value={form.teamSize} onChange={e => update("teamSize", e.target.value)} placeholder="Tamanho da equipe (ex: 3 pessoas)" className={inputCls} />
              <button onClick={() => setStep(1)} disabled={!canNext()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-semibold disabled:opacity-40 hover:scale-[1.01] transition-all">Próximo <ArrowRight className="w-4 h-4" /></button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <div><h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Suas metas</h2><p className="text-white/40 text-sm">O que deseja alcançar?</p></div>
              <textarea value={form.goal} onChange={e => update("goal", e.target.value)} placeholder="Descreva sua meta principal (ex: Dobrar o faturamento, Lançar produto digital...)" rows={3} className={inputCls + " resize-none"} />
              <div>
                <label className="text-[10px] text-white/30 uppercase mb-1 block">Prazo</label>
                <select value={form.timeframe} onChange={e => update("timeframe", e.target.value)} className={inputCls + " appearance-none"}>
                  <option value="30 dias" className="bg-black">30 dias</option>
                  <option value="60 dias" className="bg-black">60 dias</option>
                  <option value="90 dias" className="bg-black">90 dias</option>
                  <option value="6 meses" className="bg-black">6 meses</option>
                  <option value="1 ano" className="bg-black">1 ano</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm">← Voltar</button>
                <button onClick={() => setStep(2)} disabled={!canNext()} className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-semibold disabled:opacity-40">Próximo <ArrowRight className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <div><h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Contexto</h2><p className="text-white/40 text-sm">Informações complementares (opcionais).</p></div>
              <textarea value={form.challenges} onChange={e => update("challenges", e.target.value)} placeholder="Maiores desafios atuais" rows={2} className={inputCls + " resize-none"} />
              <input value={form.channels} onChange={e => update("channels", e.target.value)} placeholder="Canais de venda/marketing (ex: Instagram, WhatsApp, Loja física)" className={inputCls} />
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm">← Voltar</button>
                <button onClick={generate} disabled={loading} className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-semibold disabled:opacity-40">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando plano...</> : <><Compass className="w-4 h-4" /> Gerar Plano Estratégico</>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && plan && (
            <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div ref={resultsRef} className="space-y-6 bg-black p-1">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-5 text-center">
                <Compass className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white/80 text-sm italic">"{plan.vision}"</p>
              </div>

              {/* Quick Wins */}
              <div>
                <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-amber-400" /><span className="text-xs font-semibold text-white/40 uppercase">Vitórias rápidas</span></div>
                <div className="flex flex-wrap gap-2">
                  {plan.quickWins.map((w, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">{w}</span>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div>
                <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-blue-400" /><span className="text-xs font-semibold text-white/40 uppercase">KPIs</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {plan.kpis.map((k, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                      <div className="text-[10px] text-white/30 uppercase mb-1">{k.name}</div>
                      <div className="text-sm text-white/50">{k.current}</div>
                      <div className="text-xs text-white/20 my-0.5">→</div>
                      <div className="text-sm font-semibold text-blue-400">{k.target}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div>
                <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-pink-400" /><span className="text-xs font-semibold text-white/40 uppercase">Fases do plano</span></div>
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {plan.phases.map((p, i) => (
                    <button key={i} onClick={() => setActivePhase(i)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${activePhase === i ? "bg-blue-500/20 border-blue-500/40 text-blue-300 border" : "bg-white/[0.03] border border-white/[0.06] text-white/40"}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
                {plan.phases[activePhase] && (
                  <motion.div key={activePhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <div className="text-xs text-white/30 mb-1">{plan.phases[activePhase].duration}</div>
                    <div className="text-sm text-white/60 mb-3">{plan.phases[activePhase].objective}</div>
                    <div className="space-y-2">
                      {plan.phases[activePhase].actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-white/70">{a.task}</span>
                            <span className="text-white/20 text-xs ml-2">({a.responsible} • {a.deadline})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Weekly Routine */}
              <div>
                <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-white/40 uppercase">Rotina semanal</span></div>
                <div className="space-y-2">
                  {plan.weeklyRoutine.map((d, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white/60">{d.day}</span>
                        <span className="text-[10px] text-blue-400">{d.focus}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.tasks.map((t, j) => <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-xs font-semibold text-white/40 uppercase">Riscos e mitigações</span></div>
                <div className="space-y-2">
                  {plan.risks.map((r, i) => (
                    <div key={i} className="rounded-xl bg-red-500/[0.04] border border-red-500/10 p-3">
                      <p className="text-sm text-white/60 font-medium">{r.risk}</p>
                      <p className="text-[11px] text-white/30 mt-1">→ {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
              </div>{/* close resultsRef wrapper */}

              {/* Export buttons */}
              <div className="flex gap-3">
                <button onClick={handleDownload} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] text-sm transition-all disabled:opacity-40">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Salvar imagem
                </button>
                <button onClick={handleShare} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] text-sm transition-all disabled:opacity-40">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Compartilhar
                </button>
              </div>

              <button onClick={() => { setStep(0); setPlan(null); setActivePhase(0); }} className="w-full py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm hover:text-white transition-colors">
                Novo planejamento
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ToolsPlanejamento() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>;

  return (
    <PlanGate minPlan="premium" featureName="Planejamento Estratégico" featureDescription="Gere um plano de ação completo com metas, fases e rotina semanal usando IA.">
      <PlanejamentoContent />
    </PlanGate>
  );
}
