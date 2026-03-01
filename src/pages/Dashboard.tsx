import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown, Sparkles, Image, Globe, MessageSquare, FileText,
  ArrowRight, Clock, Zap, User as UserIcon, Building2, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import logo from "@/assets/logo.jpg";

const PLAN_COLORS: Record<string, { gradient: string; border: string; bg: string }> = {
  free: { gradient: "from-gray-400 to-gray-500", border: "border-white/[0.06]", bg: "from-gray-500/5 to-gray-600/5" },
  basico: { gradient: "from-blue-400 to-cyan-500", border: "border-blue-500/20", bg: "from-blue-500/5 to-cyan-500/5" },
  pro: { gradient: "from-amber-400 to-orange-500", border: "border-amber-500/20", bg: "from-amber-500/5 to-orange-500/5" },
  premium: { gradient: "from-violet-400 to-purple-500", border: "border-violet-500/20", bg: "from-violet-500/5 to-purple-500/5" },
};

const QUICK_ACTIONS = [
  { label: "Criar Post", icon: Image, href: "/ias", color: "text-violet-400" },
  { label: "Chat IA", icon: MessageSquare, href: "/ias", color: "text-blue-400" },
  { label: "Prévia de Site", icon: Globe, href: "/preview-site", color: "text-emerald-400" },
  { label: "Prévia de Loja", icon: FileText, href: "/preview-loja", color: "text-amber-400" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { userPlan, loading: planLoading } = useUserPlan();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [isLoading, user, navigate]);

  if (isLoading || planLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  const planKey = userPlan?.plan || "free";
  const colors = PLAN_COLORS[planKey] || PLAN_COLORS.free;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Brandify" className="w-8 h-8 rounded-lg" />
            <span className="font-['Playfair_Display'] font-bold text-lg">Brandify</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/planos-pro" className="text-xs text-white/40 hover:text-white/70 transition-colors hidden sm:block">
              Planos
            </Link>
            <Link to="/ias" className="text-xs text-white/40 hover:text-white/70 transition-colors hidden sm:block">
              IA Studio
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/60 to-blue-600/60 flex items-center justify-center text-[11px] font-bold">
              {displayName[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-white/40 text-sm mb-1">Olá,</p>
          <h1 className="font-['Playfair_Display'] font-bold text-2xl sm:text-3xl mb-8">
            {displayName} <span className="text-white/30">👋</span>
          </h1>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1 — Seu Plano */}
          <motion.div variants={item} className={`rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-6 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.06] transition-opacity" />
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Seu Plano</p>
                <div className="flex items-center gap-2.5">
                  <Crown className={`w-5 h-5 bg-gradient-to-r ${colors.gradient} bg-clip-text`} style={{ color: planKey === "premium" ? "#a78bfa" : planKey === "pro" ? "#fbbf24" : planKey === "basico" ? "#60a5fa" : "#9ca3af" }} />
                  <span className="font-['Playfair_Display'] font-bold text-xl">{userPlan?.label}</span>
                </div>
              </div>
              {planKey !== "premium" && (
                <Link
                  to="/planos-pro"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white/60 hover:text-white transition-all"
                >
                  <Zap className="w-3 h-3" />
                  Upgrade
                </Link>
              )}
            </div>
            {userPlan?.expiresAt && (
              <p className="text-white/30 text-xs flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Expira em {new Date(userPlan.expiresAt).toLocaleDateString("pt-BR")}
              </p>
            )}
            {planKey === "free" && (
              <p className="text-white/40 text-xs mt-2">3 créditos diários gratuitos • Faça upgrade para mais recursos</p>
            )}
          </motion.div>

          {/* Card 2 — Perfil do Negócio */}
          <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Perfil</p>
                <p className="font-['Playfair_Display'] font-bold text-lg">{displayName}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white/30" />
              </div>
            </div>
            <p className="text-white/30 text-xs">{user?.email}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gradient-to-r ${colors.gradient} text-white`}>
                <Sparkles className="w-2.5 h-2.5" />
                {userPlan?.label}
              </span>
            </div>
          </motion.div>

          {/* Card 3 — Ações Rápidas */}
          <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">Ações Rápidas</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] transition-all group"
                >
                  <action.icon className={`w-4.5 h-4.5 ${action.color} shrink-0`} />
                  <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Card 4 — Resultados Recentes */}
          <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Resultados Recentes</p>
              <Link to="/ias" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
                Ver tudo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Image className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/70 truncate">IA Studio</p>
                  <p className="text-[11px] text-white/30">Crie posts e converse com a IA</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/70 truncate">Prévias de Site</p>
                  <p className="text-[11px] text-white/30">Gere prévias para seus clientes</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tools CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-violet-500/[0.04] to-blue-500/[0.04] p-6 sm:p-8 text-center"
        >
          <h2 className="font-['Playfair_Display'] font-bold text-lg sm:text-xl mb-2">
            Novas ferramentas em <span className="font-['Playfair_Display'] font-bold italic bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">breve</span>
          </h2>
          <p className="text-white/40 text-sm mb-5 max-w-md mx-auto">
            Copy, Landing Pages, Atendedor e mais — tudo integrado ao seu plano.
          </p>
          <Link
            to="/planos-pro"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm font-medium text-white/70 hover:text-white transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Ver planos
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
