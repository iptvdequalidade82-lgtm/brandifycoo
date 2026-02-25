import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, ArrowLeft, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpg";

const features = [
  "Criações ilimitadas de posts",
  "Chat com IA ilimitado",
  "Histórico de conversas salvo",
  "Acesso a todos os modelos visuais (18+)",
  "Geração de imagens em alta resolução",
  "Suporte prioritário",
  "Novos modelos visuais todo mês",
];

export default function PlanosPro() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBuy = () => {
    if (!user) {
      navigate("/login?redirect=/planos-pro&upgrade=pro");
      return;
    }
    // TODO: integrate payment (Cakto/Pix)
    // For now, just show coming soon via toast or navigate
    navigate("/planos-pro");
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[200px]" />
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
      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo */}
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-500/20 mx-auto shadow-2xl shadow-amber-500/10">
              <img src={logo} alt="Brandify" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
            IA Studio{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Pro
            </span>
          </h1>
          <p className="text-white/40 text-lg mb-8">
            Desbloqueie todo o poder da IA para o seu negócio
          </p>
        </motion.div>

        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 p-6 md:p-8 mb-8"
        >
          <div className="flex items-baseline gap-1 mb-6 justify-center">
            <span className="text-white/40 text-lg">R$</span>
            <span className="text-5xl font-black text-white" style={{ fontFamily: "'Sora', sans-serif" }}>39</span>
            <span className="text-2xl font-bold text-white">,90</span>
            <span className="text-white/30 text-sm ml-1">/mês</span>
          </div>

          <div className="space-y-3 mb-8">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleBuy}
            className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-base border-0 shadow-xl shadow-amber-500/20 rounded-xl"
          >
            <Zap className="w-5 h-5 mr-2" />
            {user ? "Assinar Pro" : "Fazer login e assinar"}
          </Button>

          <p className="text-white/20 text-xs text-center mt-3">
            Cancele a qualquer momento • Sem fidelidade
          </p>
        </motion.div>

        {/* Comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-white/20 text-xs mb-4 uppercase tracking-wider font-medium">Plano gratuito vs Pro</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <p className="text-white/30 text-xs font-medium mb-2 uppercase tracking-wider">Grátis</p>
              <p className="text-white/60 text-sm">5 criações/semana</p>
              <p className="text-white/30 text-xs mt-1">Histórico temporário</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="flex items-center gap-1 justify-center mb-2">
                <Crown className="w-3 h-3 text-amber-400" />
                <p className="text-amber-400 text-xs font-medium uppercase tracking-wider">Pro</p>
              </div>
              <p className="text-white/80 text-sm font-medium">Ilimitado</p>
              <p className="text-white/40 text-xs mt-1">Histórico permanente</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
