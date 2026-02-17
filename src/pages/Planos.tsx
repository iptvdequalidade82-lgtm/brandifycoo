import { useEffect } from "react";
import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Planos() {
  useEffect(() => {
    // Scroll to pricing section after mount
    const el = document.getElementById("investimento");
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Header />

      {/* Hero banner CTA */}
      <section className="relative pt-32 pb-16 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/15 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/15 border border-brand-accent/30 text-brand-accent text-sm font-bold mb-6">
            <Sparkles size={16} className="animate-pulse" />
            100% Grátis — Sem compromisso
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-4">
            Veja como seu site vai ficar{" "}
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">
              antes de contratar
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto mb-8">
            Escolha um plano abaixo e gere uma prévia gratuita do seu site ou loja virtual em segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/preview-site">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white shadow-lg shadow-brand-accent/30 hover:shadow-xl hover:shadow-brand-accent/40 transition-all"
              >
                <Sparkles size={16} />
                🎨 Prévia de Site Grátis
              </motion.div>
            </Link>
            <Link to="/preview-loja">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-black shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transition-all"
              >
                <Sparkles size={16} />
                🛒 Prévia de Loja Grátis
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      <Pricing />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
