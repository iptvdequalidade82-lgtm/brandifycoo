import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function CTAFinal() {
  return (
    <section className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[180px] pointer-events-none" />

      <div className="relative container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.05] text-white/60 text-xs font-medium tracking-widest uppercase mb-8">
            <Zap size={14} />
            Comece agora
          </div>

          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] mb-6 text-white">
            Pronto para ter um site que{" "}
            <span className="text-gradient">impressiona</span>?
          </h2>

          <p className="text-white/50 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Seu próximo projeto começa aqui. Fale conosco e transforme sua presença digital.
          </p>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-white text-black font-black text-lg gentle-animation"
          >
            Solicitar Orçamento
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
