import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTAFinal() {
  return (
    <section className="relative py-28 md:py-36 px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full border border-primary/10 animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-primary/10 blur-sm animate-[pulse_5s_ease-in-out_infinite]" />

      <div className="relative container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] mb-6 text-foreground">
            Pronto para ter um site que{" "}
            <span className="text-gradient underline decoration-primary/30 underline-offset-8">impressiona</span>?
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Seu próximo projeto começa aqui. Fale conosco e transforme sua presença digital.
          </p>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Quero%20come%C3%A7ar%20meu%20projeto%20de%20site%20com%20a%20Brandify!"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-primary text-primary-foreground font-extrabold text-lg gentle-animation btn-glow shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
          >
            Solicitar Orçamento
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
