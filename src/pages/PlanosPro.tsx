import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, ArrowLeft, Zap, Loader2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpg";

const PLANS = [
  {
    key: "basico",
    name: "Básico",
    price: 49.9,
    priceInt: "49",
    priceDec: ",90",
    color: "blue",
    gradient: "from-blue-400 to-cyan-500",
    gradientBg: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/20",
    badge: "Mais popular",
    features: [
      "Criações ilimitadas de posts",
      "Chat com IA ilimitado",
      "Acesso a todos os modelos visuais",
      "Geração de imagens em alta resolução",
      "Suporte via chat",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 69.9,
    priceInt: "69",
    priceDec: ",90",
    color: "amber",
    gradient: "from-amber-400 to-orange-500",
    gradientBg: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-500/20",
    badge: "Melhor custo-benefício",
    features: [
      "Tudo do Básico +",
      "Histórico de conversas salvo",
      "Acesso a IAs exclusivas Pro",
      "Novos modelos visuais todo mês",
      "Suporte prioritário",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: 129.9,
    priceInt: "129",
    priceDec: ",90",
    color: "violet",
    gradient: "from-violet-400 to-purple-500",
    gradientBg: "from-violet-500/10 to-purple-500/10",
    borderColor: "border-violet-500/20",
    badge: "Completo",
    features: [
      "Tudo do Pro +",
      "Acesso a TODAS as IAs",
      "Prioridade máxima em geração",
      "Suporte VIP dedicado",
      "Acesso antecipado a novidades",
    ],
  },
];

const CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-pro-checkout`;

export default function PlanosPro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCurrentPlan(data.plan);
      });
  }, [user]);

  const handleBuy = async (planKey: string) => {
    if (!user) {
      navigate(`/login?redirect=/planos-pro&upgrade=${planKey}`);
      return;
    }

    if (currentPlan === planKey) {
      toast({ title: "Plano ativo! 🎉", description: `Você já possui o plano ${planKey}.` });
      return;
    }

    setLoading(planKey);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        navigate("/login?redirect=/planos-pro");
        return;
      }

      const res = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.already_subscribed) {
          toast({ title: "Plano ativo! 🎉", description: `Você já possui o plano ${data.current_plan}.` });
          navigate("/ias");
          return;
        }
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      if (data.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Checkout aberto! 💳",
          description: "Complete o pagamento na nova aba. Seu plano será ativado automaticamente.",
        });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (key: string) => {
    if (key === "basico") return <Zap className="w-4 h-4 text-white" />;
    if (key === "pro") return <Crown className="w-4 h-4 text-white" />;
    return <Star className="w-4 h-4 text-white" />;
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between h-14 px-4 md:px-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link to="/ias">
            <Button variant="ghost" size="sm" className="text-white/30 hover:text-white hover:bg-white/[0.05] text-xs h-8">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/20 mx-auto shadow-2xl shadow-amber-500/10">
              <img src={logo} alt="Brandify" className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
            Escolha seu plano{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              ideal
            </span>
          </h1>
          <p className="text-white/40 text-lg">
            Desbloqueie o poder da IA para o seu negócio
          </p>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12">
          {PLANS.map((plan, i) => {
            const isActive = currentPlan === plan.key;
            const isHighlighted = plan.key === "basico" || plan.key === "premium";

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl bg-gradient-to-b ${plan.gradientBg} to-transparent border ${plan.borderColor} p-6 flex flex-col ${isHighlighted ? "md:-mt-4 md:pb-8 ring-1 ring-amber-500/30" : ""}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${plan.gradient} text-xs font-bold text-black`}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4 mt-1">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                    {getPlanIcon(plan.key)}
                  </div>
                  <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {plan.name}
                  </h3>
                </div>

                <div className="flex items-baseline gap-0.5 mb-6">
                  <span className="text-white/40 text-sm">R$</span>
                  <span className="text-4xl font-black text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {plan.priceInt}
                  </span>
                  <span className="text-xl font-bold text-white">{plan.priceDec}</span>
                  <span className="text-white/30 text-xs ml-1">/mês</span>
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center shrink-0 opacity-70`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-white/60 text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleBuy(plan.key)}
                  disabled={!!loading || isActive}
                  className={`w-full h-11 font-bold text-sm border-0 rounded-xl disabled:opacity-70 ${
                    isActive
                      ? "bg-green-500/20 text-green-400 cursor-default"
                      : `bg-gradient-to-r ${plan.gradient} text-black hover:opacity-90 shadow-lg`
                  }`}
                >
                  {loading === plan.key ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isActive ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {loading === plan.key
                    ? "Processando..."
                    : isActive
                    ? "Plano ativo"
                    : user
                    ? `Assinar ${plan.name}`
                    : "Login e assinar"}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/20 text-xs text-center"
        >
          Pagamento seguro via PIX • Ativação instantânea • Cancele quando quiser
        </motion.p>
      </div>
    </div>
  );
}
