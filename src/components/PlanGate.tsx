import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles, MessageCircle } from "lucide-react";
import { useGating, type PlanTier } from "@/hooks/useGating";

const WHATSAPP_NUMBER = "5543991065129";

const PLAN_COLORS: Record<string, { gradient: string; icon: string }> = {
  basico: { gradient: "from-blue-400 to-cyan-500", icon: "#60a5fa" },
  pro: { gradient: "from-amber-400 to-orange-500", icon: "#fbbf24" },
  premium: { gradient: "from-violet-400 to-purple-500", icon: "#a78bfa" },
};

interface PlanGateProps {
  /** Minimum plan required to access this feature */
  minPlan: PlanTier;
  /** Feature name shown in the lock screen */
  featureName: string;
  /** Short description of what the feature does */
  featureDescription?: string;
  /** Children rendered when user HAS access */
  children: React.ReactNode;
}

export default function PlanGate({ minPlan, featureName, featureDescription, children }: PlanGateProps) {
  const { hasAccess, requiredLabel, loading } = useGating();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAccess(minPlan)) {
    return <>{children}</>;
  }

  const colors = PLAN_COLORS[minPlan] || PLAN_COLORS.pro;
  const planLabel = requiredLabel(minPlan);
  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no plano ${planLabel} da Brandify para acessar: ${featureName}. Pode me ajudar?`
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[60vh] flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md text-center">
        {/* Lock icon */}
        <motion.div
          initial={{ y: -8 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center relative"
        >
          <Lock className="w-8 h-8 text-white/20" />
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.icon}, ${colors.icon}cc)` }}
          >
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="font-['Playfair_Display'] font-bold text-xl sm:text-2xl mb-2 text-white">
          {featureName}
        </h2>

        {featureDescription && (
          <p className="text-white/40 text-sm mb-2 max-w-sm mx-auto">{featureDescription}</p>
        )}

        {/* Required plan badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
          <Sparkles className="w-3 h-3" style={{ color: colors.icon }} />
          <span className="text-xs text-white/50">
            Disponível no plano <span className="text-white/80 font-semibold">{planLabel}</span> ou superior
          </span>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/planos-pro"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${colors.gradient} text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all`}
          >
            <Crown className="w-4 h-4" />
            Fazer Upgrade
          </Link>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/60 hover:text-white text-sm font-medium transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Falar no WhatsApp
          </a>
        </div>

        {/* Subtle preview hint */}
        <p className="text-white/20 text-[11px] mt-6">
          Faça upgrade para desbloquear esta e outras ferramentas exclusivas.
        </p>
      </div>
    </motion.div>
  );
}
