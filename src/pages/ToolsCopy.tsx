import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, PenTool, MessageCircle, Megaphone, Layout, Film,
  Copy, RotateCcw, Save, Check, Sparkles, ChevronRight, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import logo from "@/assets/logo.jpg";
import { useToast } from "@/hooks/use-toast";

const COPY_TYPES = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, desc: "Primeira msg, follow-up, fechamento", color: "text-emerald-400" },
  { key: "anuncio", label: "Anúncio (Ads)", icon: Megaphone, desc: "Facebook e Instagram Ads", color: "text-blue-400" },
  { key: "landing", label: "Landing Page", icon: Layout, desc: "Headline, benefícios e CTA", color: "text-violet-400" },
  { key: "reels", label: "Script Reels", icon: Film, desc: "Gancho + desenvolvimento + CTA", color: "text-pink-400" },
];

const TONES = [
  { key: "profissional", label: "Profissional", desc: "Autoritário e confiável" },
  { key: "direto", label: "Direto", desc: "Objetivo e sem rodeios" },
  { key: "amigavel", label: "Amigável", desc: "Acessível e próximo" },
];

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-copy`;

function CopyGeneratorContent() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const steps = [
    { label: "Tipo", done: !!type },
    { label: "Oferta", done: !!offer.trim() },
    { label: "Público", done: !!audience.trim() },
    { label: "Tom", done: !!tone },
    { label: "Resultado", done: variations.length > 0 },
  ];

  const canAdvance = () => {
    if (step === 0) return !!type;
    if (step === 1) return !!offer.trim();
    if (step === 2) return !!audience.trim();
    if (step === 3) return !!tone;
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
        body: JSON.stringify({ type, offer, audience, tone }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao gerar copy");
      }
      const data = await res.json();
      setVariations(data.variations || []);
      setActiveTab(0);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copiado!", description: "Copy copiada para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedo = () => {
    setVariations([]);
    generate();
  };

  const handleReset = () => {
    setStep(0);
    setType("");
    setOffer("");
    setAudience("");
    setTone("");
    setVariations([]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-amber-400" />
            <span className="font-['Playfair_Display'] font-bold text-sm">Gerador de Copy</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1 flex-1">
              <div className={`h-1 flex-1 rounded-full transition-all ${
                i < step ? "bg-amber-400" : i === step ? "bg-amber-400/50" : "bg-white/[0.06]"
              }`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mb-6">
          {steps.map((s, i) => (
            <span key={s.label} className={`text-[10px] uppercase tracking-wider font-medium ${
              i <= step ? "text-amber-400/80" : "text-white/20"
            }`}>{s.label}</span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Type */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Que tipo de copy?</h2>
              <p className="text-white/40 text-sm mb-6">Escolha o formato do texto que deseja gerar.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COPY_TYPES.map((ct) => (
                  <button
                    key={ct.key}
                    onClick={() => setType(ct.key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      type === ct.key
                        ? "border-amber-500/40 bg-amber-500/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <ct.icon className={`w-4.5 h-4.5 ${ct.color}`} />
                      <span className="font-medium text-sm text-white/90">{ct.label}</span>
                    </div>
                    <p className="text-[11px] text-white/30 pl-7.5">{ct.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Offer */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Qual é a oferta?</h2>
              <p className="text-white/40 text-sm mb-6">Descreva o produto, serviço ou promoção.</p>
              <textarea
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Ex: Curso de marketing digital com 50% de desconto, acesso vitalício..."
                className="w-full h-28 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-amber-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none outline-none transition-colors"
              />
            </motion.div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Público-alvo</h2>
              <p className="text-white/40 text-sm mb-6">Para quem é esse conteúdo?</p>
              <textarea
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Ex: Empreendedores iniciantes, donos de pequenos negócios, mulheres 25-40 anos..."
                className="w-full h-28 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-amber-500/30 px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none outline-none transition-colors"
              />
            </motion.div>
          )}

          {/* Step 3: Tone */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="font-['Playfair_Display'] font-bold text-xl mb-1">Tom de voz</h2>
              <p className="text-white/40 text-sm mb-6">Como você quer que a copy soe?</p>
              <div className="space-y-3">
                {TONES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTone(t.key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      tone === t.key
                        ? "border-amber-500/40 bg-amber-500/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="font-medium text-sm text-white/90">{t.label}</span>
                    <p className="text-[11px] text-white/30 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="text-white/40 text-sm">Gerando 3 variações...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-['Playfair_Display'] font-bold text-xl">Resultado</h2>
                    <div className="flex items-center gap-2">
                      <button onClick={handleRedo} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-white/60 hover:text-white transition-all">
                        <RotateCcw className="w-3 h-3" />
                        Refazer
                      </button>
                      <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-white/60 hover:text-white transition-all">
                        <Sparkles className="w-3 h-3" />
                        Nova copy
                      </button>
                    </div>
                  </div>

                  {/* A/B/C Tabs */}
                  <div className="flex gap-2 mb-5">
                    {["A", "B", "C"].map((letter, i) => (
                      <button
                        key={letter}
                        onClick={() => setActiveTab(i)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          activeTab === i
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            : "bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60"
                        }`}
                      >
                        Variação {letter}
                      </button>
                    ))}
                  </div>

                  {/* Copy content */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 mb-4 min-h-[200px]">
                    <pre className="text-sm text-white/80 whitespace-pre-wrap font-['Inter'] leading-relaxed">
                      {variations[activeTab] || "Nenhum conteúdo gerado."}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopy(variations[activeTab] || "")}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold hover:scale-[1.01] transition-all"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </>
              )}
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
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
            <button
              onClick={() => step === 3 ? generate() : setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-all"
            >
              {step === 3 ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar Copy
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ToolsCopy() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" /></div>;
  }

  return (
    <PlanGate minPlan="pro" featureName="Gerador de Copy" featureDescription="Crie copys persuasivas para WhatsApp, Ads, Landing Pages e Reels em segundos.">
      <CopyGeneratorContent />
    </PlanGate>
  );
}
