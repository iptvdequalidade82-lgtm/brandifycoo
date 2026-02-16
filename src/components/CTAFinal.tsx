import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollRevealText from "@/components/ScrollRevealText";
import constellationBg from "@/assets/constellation-bg.jpg";

const whatsappBase = "https://wa.me/5543991065129?text=";

const quickMessages = [
  { label: "Quero fazer um orçamento", message: "Olá! Gostaria de fazer um orçamento para criação de site." },
  { label: "Como funciona?", message: "Olá! Gostaria de saber como funciona o processo de criação de site com vocês." },
  { label: "O que preciso enviar?", message: "Olá! Gostaria de saber o que preciso enviar para vocês começarem a fazer meu site." },
  { label: "Como é o contrato?", message: "Olá! Gostaria de entender como funciona o contrato de vocês." },
];

export default function CTAFinal() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.97, 1]);

  return (
    <section ref={sectionRef} className="relative py-28 md:py-36 px-6 overflow-visible bg-black">
      {/* Galaxy background with gradient fade */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.20] pointer-events-none"
        style={{
          backgroundImage: `url(${constellationBg})`,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />
      {/* Organic shapes */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full border border-white/10 animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-white/10 blur-sm animate-[pulse_5s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

      <motion.div
        style={{ scale }}
        className="relative container mx-auto max-w-3xl text-center text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] mb-6">
            Pronto para ter um site que{" "}
            <span className="underline decoration-brand-accent/40 underline-offset-8">impressiona</span>?
          </h2>

          <ScrollRevealText
            text="Seu próximo projeto começa aqui. Fale conosco e transforme sua presença digital."
            className="text-white/70 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
            highlightWords={["transforme"]}
          />

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Quero%20come%C3%A7ar%20meu%20projeto%20de%20site%20com%20a%20Brandify!"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-[hsl(var(--brand-gradient-from))] to-[hsl(var(--brand-gradient-to))] text-white font-black text-lg gentle-animation shadow-lg shadow-brand-accent/20"
          >
            Solicitar Orçamento
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Quick messages */}
          <div className="mt-10">
            <p className="text-xs text-white/40 mb-3">Ou envie uma mensagem rápida:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {quickMessages.map((qm, i) => (
                <motion.a
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9, backgroundColor: "rgba(255,255,255,0.15)" }}
                  href={`${whatsappBase}${encodeURIComponent(qm.message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/25 hover:bg-white/[0.1] active:border-brand-accent/40 text-white/70 hover:text-white active:text-white text-xs font-medium gentle-animation"
                >
                  {qm.label}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
