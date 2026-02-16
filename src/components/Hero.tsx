import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useState } from "react";

export default function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`}
        poster=""
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      {/* Radial glow accents */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 pt-28 md:pt-0">
        <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
          {/* Left — Text */}
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-[-0.03em] text-foreground"
            >
              Criamos sites do{" "}
              <span className="text-gradient">futuro</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-muted-foreground text-base md:text-lg mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Modernos, rápidos e com design que impressiona. Tecnologia de ponta
              aplicada ao seu negócio digital.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base btn-glow gentle-animation shadow-[0_0_30px_hsl(var(--primary)/0.25)]"
              >
                Solicitar Orçamento
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                href="#servicos"
                className="px-8 py-4 rounded-xl border border-border text-foreground font-semibold hover:bg-accent hover:border-primary/30 gentle-animation text-center"
              >
                Nossos Serviços
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-8 md:gap-12"
            >
              {[
                { value: 50, suffix: "+", label: "Projetos entregues" },
                { value: 98, suffix: "%", label: "Clientes satisfeitos" },
                { value: 24, suffix: "h", label: "Tempo de resposta" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="font-display text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1.5 tracking-wide">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D floating mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative animate-float" style={{ perspective: '1000px' }}>
              {/* Phone mockup with 3D perspective */}
              <div
                className="relative w-[280px] h-[560px] rounded-[3rem] border-2 border-primary/20 bg-gradient-to-br from-card via-secondary to-card shadow-[0_0_80px_hsl(var(--primary)/0.15),0_30px_60px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
                style={{ transform: 'rotateY(-8deg) rotateX(5deg)' }}
              >
                {/* Screen content */}
                <div className="absolute inset-3 rounded-[2.2rem] bg-gradient-to-br from-background to-secondary overflow-hidden">
                  {/* Mini UI mockup inside phone */}
                  <div className="p-5 pt-10 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-md bg-primary/60" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 rounded bg-foreground/15" />
                      <div className="h-3 w-1/2 rounded bg-foreground/10" />
                    </div>
                    <div className="h-32 rounded-xl bg-gradient-to-br from-primary/10 to-brand-accent/10 border border-primary/10" />
                    <div className="space-y-2">
                      <div className="h-2.5 w-full rounded bg-foreground/8" />
                      <div className="h-2.5 w-5/6 rounded bg-foreground/6" />
                      <div className="h-2.5 w-2/3 rounded bg-foreground/4" />
                    </div>
                    <div className="h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <div className="h-2.5 w-20 rounded bg-primary/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-20 rounded-lg bg-foreground/5 border border-foreground/5" />
                      <div className="h-20 rounded-lg bg-foreground/5 border border-foreground/5" />
                    </div>
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-background" />
              </div>

              {/* Glow ring behind phone */}
              <div className="absolute -inset-8 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse-glow" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
