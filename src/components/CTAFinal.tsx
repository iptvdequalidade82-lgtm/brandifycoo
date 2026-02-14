import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function CTAFinal() {
  return (
    <section className="relative py-28 md:py-36 px-6 overflow-hidden bg-gradient-to-br from-[hsl(25,50%,40%)] via-[hsl(15,45%,35%)] to-[hsl(5,40%,28%)]">
      {/* Organic shapes */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full border border-white/10 animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-white/10 blur-sm animate-[pulse_5s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative container mx-auto max-w-3xl text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/10 text-white/80 text-xs font-medium tracking-widest uppercase mb-8">
            <Zap size={14} />
            Comece agora
          </div>

          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] mb-6">
            Pronto para ter um site que{" "}
            <span className="underline decoration-[hsl(35,70%,65%)]/50 underline-offset-8">impressiona</span>?
          </h2>

          <p className="text-white/70 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Seu próximo projeto começa aqui. Fale conosco e transforme sua presença digital.
          </p>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-white text-[hsl(20,45%,28%)] font-black text-lg gentle-animation shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)]"
          >
            Solicitar Orçamento
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
