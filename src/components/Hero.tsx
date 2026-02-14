import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Subtle animated grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Ambient light orbs */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-[150px] pointer-events-none" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />

      <div className="relative z-10 container mx-auto text-center max-w-5xl px-6">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.95] mb-8 tracking-[-0.04em] text-white"
        >
          Criamos sites do{" "}
          <span className="text-gradient">futuro</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-white/50 text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed"
        >
          Modernos, rápidos e com design que impressiona. Tecnologia de ponta
          aplicada ao seu negócio digital.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-bold text-base gentle-animation"
          >
            Solicitar Orçamento
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.03 }}
            href="#servicos"
            className="px-8 py-4 rounded-xl border border-white/15 text-white font-semibold hover:bg-white/5 gentle-animation text-center glass"
          >
            Nossos Serviços
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-24 flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {[
            { value: 50, suffix: "+", label: "Projetos entregues" },
            { value: 98, suffix: "%", label: "Clientes satisfeitos" },
            { value: 24, suffix: "h", label: "Tempo de resposta" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-black text-white tracking-tight">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs md:text-sm text-white/40 mt-1.5 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
