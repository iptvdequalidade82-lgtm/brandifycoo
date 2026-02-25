import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  ImagePlus,
  PenTool,
  Crown,
  LogOut,
  ArrowLeft,
  Zap,
  Lock,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import logo from "@/assets/logo.jpg";

const tools = [
  {
    id: "chat",
    name: "Chat com IA",
    description: "Assistente inteligente para tirar dúvidas, gerar textos, estratégias e muito mais. Uso ilimitado.",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/10",
    tier: "free",
    href: "/ias/chat",
  },
  {
    id: "posts",
    name: "Gerador de Posts",
    description: "Crie posts com imagens para Instagram e redes sociais usando IA. 5 posts grátis por semana.",
    icon: ImagePlus,
    color: "from-violet-500 to-pink-500",
    bgGlow: "bg-violet-500/10",
    tier: "free",
    href: "/ias/posts",
  },
];

const tierBadge: Record<string, { label: string; class: string }> = {
  free: { label: "Grátis", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  pro: { label: "Pro", class: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  premium: { label: "Premium", class: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
};

export default function IAs() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10 max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Sparkles className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Ferramentas de IA
          </h1>
          <p className="text-white/50 text-lg mb-8">
            Crie posts, imagens e conteúdo com inteligência artificial. Faça login para começar a usar gratuitamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button className="h-12 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 font-semibold text-base">
                <Zap className="w-5 h-5 mr-2" />
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button variant="outline" className="h-12 px-8 bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1] font-semibold text-base">
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-600/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-violet-600/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050508]/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={logo} alt="Brandify" className="h-9 w-9 rounded-full ring-1 ring-white/20" />
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <h1 className="text-white font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
              <Sparkles className="w-4 h-4 inline mr-1.5 text-blue-400" />
              Ferramentas de IA
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/[0.05]">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Voltar
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/50 hover:text-white hover:bg-white/[0.05]">
              <LogOut className="w-4 h-4 mr-1.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
            Olá, {user.user_metadata?.full_name?.split(" ")[0] || "Creator"} 👋
          </h2>
          <p className="text-white/50">Escolha uma ferramenta para começar a criar.</p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            const badge = tierBadge[tool.tier];
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => navigate(tool.href)}
                  className="w-full text-left group rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] p-6 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Glow */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 ${tool.bgGlow} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} p-[1px]`}>
                        <div className="w-full h-full rounded-[11px] bg-[#0a0a0f] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {tool.name}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">{tool.description}</p>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-blue-600/[0.08] to-violet-600/[0.08] p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                Desbloqueie todas as ferramentas
              </h3>
              <p className="text-white/50 text-sm">
                Atualize para o plano Pro ou Premium e tenha acesso ilimitado a todas as IAs, sem limites de uso.
              </p>
            </div>
            <Button className="h-11 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold border-0 shrink-0">
              <Crown className="w-4 h-4 mr-2" />
              Ver planos
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
