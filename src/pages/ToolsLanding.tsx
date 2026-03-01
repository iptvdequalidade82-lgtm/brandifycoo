import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Layout, Sparkles, Loader2, Copy, Check,
  Building2, Users, Gift, Palette, Eye, RotateCcw, Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";

const STYLES = [
  { key: "profissional", label: "Profissional", desc: "Clean e corporativo" },
  { key: "energetico", label: "Energético", desc: "Vibrante e urgente" },
  { key: "minimalista", label: "Minimalista", desc: "Elegante e simples" },
];

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-landing`;

interface LandingData {
  headline: string;
  subheadline: string;
  cta: string;
  benefits: { title: string; description: string }[];
  socialProof: string;
  aboutSection: string;
  urgency: string;
  finalCta: string;
}

export function LandingContent() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [segment, setSegment] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [landing, setLanding] = useState<LandingData | null>(null);
  const [copied, setCopied] = useState(false);

  const steps = [
    { label: "Negócio", icon: Building2 },
    { label: "Oferta", icon: Gift },
    { label: "Público", icon: Users },
    { label: "Estilo", icon: Palette },
    { label: "Preview", icon: Eye },
  ];

  const canAdvance = () => {
    if (step === 0) return !!businessName.trim() && !!segment.trim();
    if (step === 1) return !!offer.trim();
    if (step === 2) return !!audience.trim();
    if (step === 3) return !!style;
    return false;
  };

  const generate = async () => {
    setLoading(true);
    setStep(4);
    try {
      const res = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ businessName, segment, offer, audience, style }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao gerar landing");
      }
      const data = await res.json();
      setLanding(data.landing);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!landing) return;
    const text = `HEADLINE: ${landing.headline}\nSUB: ${landing.subheadline}\nCTA: ${landing.cta}\n\nBENEFÍCIOS:\n${landing.benefits.map((b, i) => `${i + 1}. ${b.title} — ${b.description}`).join("\n")}\n\nPROVA SOCIAL: ${landing.socialProof}\n\nSOBRE: ${landing.aboutSection}\n\nURGÊNCIA: ${landing.urgency}\nCTA FINAL: ${landing.finalCta}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copiado!", description: "Todos os textos copiados." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" />
            <span className="font-['Playfair_Display'] font-bold text-sm">Landing Automática</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={s.label} className="flex-1 h-1 rounded-full transition-all" style={{
              background: i < step ? "#34d399" : i === step ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.06)"
            }} />
          ))}
        </div>
        <div className="flex justify-between mb-6">
          {steps.map((s, i) => (
            <span key={s.label} className={`text-[10px] uppercase tracking-wider font-medium ${i <= step ? "text-emerald-400/80" : "text-white/20"}`}>{s.label}</span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Sobre o negócio</h2>
              <p className="text-white/40 text-sm mb-6">Nome e segmento de atuação.</p>
              <div className="space-y-4">
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Nome da empresa ou profissional"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-emerald-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors"
                />
                <input
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder="Ex: Barbearia, Restaurante, Clínica de estética..."
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-emerald-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors"
                />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Qual é a oferta?</h2>
              <p className="text-white/40 text-sm mb-6">O que a landing page vai vender ou promover?</p>
              <textarea
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Ex: Plano mensal de manutenção de sites por R$97/mês com suporte ilimitado..."
                className="w-full h-28 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-emerald-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none outline-none transition-colors"
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Público-alvo</h2>
              <p className="text-white/40 text-sm mb-6">Para quem é essa landing page?</p>
              <textarea
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Ex: Empreendedores que precisam de presença digital profissional..."
                className="w-full h-28 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-emerald-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none outline-none transition-colors"
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Estilo visual</h2>
              <p className="text-white/40 text-sm mb-6">Qual a vibe da landing page?</p>
              <div className="space-y-3">
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStyle(s.key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      style === s.key ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="font-medium text-sm text-white/90">{s.label}</span>
                    <p className="text-[11px] text-white/30 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-white/40 text-sm">Gerando textos da landing page...</p>
                </div>
              ) : landing ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-['Playfair_Display'] font-bold text-xl">Sua Landing Page</h2>
                    <div className="flex gap-2">
                      <button onClick={() => { setLanding(null); generate(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-white/60 hover:text-white transition-all">
                        <RotateCcw className="w-3 h-3" /> Refazer
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-4">
                    {/* Hero */}
                    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent p-6">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400/60 font-semibold">HERO</span>
                      <h3 className="font-['Playfair_Display'] font-bold text-2xl mt-2 mb-2">{landing.headline}</h3>
                      <p className="text-white/50 text-sm mb-4">{landing.subheadline}</p>
                      <span className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-semibold">{landing.cta}</span>
                    </div>

                    {/* Benefits */}
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                      <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">BENEFÍCIOS</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        {landing.benefits?.map((b, i) => (
                          <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            <p className="text-sm font-semibold text-white/80 mb-1">{b.title}</p>
                            <p className="text-[11px] text-white/40">{b.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Social Proof */}
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
                      <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">PROVA SOCIAL</span>
                      <p className="text-white/60 text-sm mt-3 italic">"{landing.socialProof}"</p>
                    </div>

                    {/* About */}
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                      <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">SOBRE</span>
                      <p className="text-white/50 text-sm mt-3 leading-relaxed">{landing.aboutSection}</p>
                    </div>

                    {/* Final CTA */}
                    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent p-6 text-center">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400/60 font-semibold">CTA FINAL</span>
                      <p className="text-white/50 text-sm mt-3 mb-4">{landing.urgency}</p>
                      <span className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-semibold">{landing.finalCta}</span>
                    </div>
                  </div>

                  {/* Copy All */}
                  <button
                    onClick={copyAll}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-semibold hover:scale-[1.01] transition-all"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar todos os textos"}
                  </button>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button
              onClick={() => step === 3 ? generate() : setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-all"
            >
              {step === 3 ? (
                <><Sparkles className="w-3.5 h-3.5" /> Gerar Landing</>
              ) : (
                <>Próximo <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ToolsLanding() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>;
  }

  return (
    <PlanGate minPlan="pro" featureName="Landing Automática" featureDescription="Gere textos completos para landing pages de alta conversão em minutos.">
      <LandingContent />
    </PlanGate>
  );
}
