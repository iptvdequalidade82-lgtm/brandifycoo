import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";

export default function Hero() {
  useEffect(() => {
    const video = document.getElementById('hero-video') as HTMLVideoElement | null;
    if (!video) return;

    const container = document.getElementById('hero-video-container');
    if (container && !container.contains(video)) {
      video.style.position = 'absolute';
      video.style.opacity = '1';
      video.style.zIndex = '0';
      video.style.pointerEvents = 'none';
      container.appendChild(video);
    }

    const attemptPlay = () => {
      if (!video.paused) return;
      video.play().catch(() => {});
    };

    attemptPlay();

    const interval = setInterval(() => {
      if (!video.paused) { clearInterval(interval); return; }
      attemptPlay();
    }, 300);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    const handleInteraction = () => {
      attemptPlay();
      if (!video.paused) {
        events.forEach(e => document.removeEventListener(e, handleInteraction));
      }
    };
    const events = ['touchstart', 'touchend', 'click', 'scroll'];
    events.forEach(e => document.addEventListener(e, handleInteraction, { passive: true }));

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      events.forEach(e => document.removeEventListener(e, handleInteraction));

      // Return video to body so it survives React unmount
      if (video && video.parentElement !== document.body) {
        video.style.opacity = '0';
        video.style.position = 'fixed';
        video.style.zIndex = '-1';
        document.body.prepend(video);
      }
    };
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-28 md:pt-0"
    >
      {/* Container for the video element moved from index.html */}
      <div id="hero-video-container" className="absolute inset-0 z-0" />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 z-[1] bg-black/50 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 container mx-auto text-center max-w-5xl px-6 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold leading-[0.95] mb-8 tracking-[-0.04em] text-white"
        >
          Criamos sites do{" "}
          <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">futuro</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-white/70 text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed font-light"
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
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand text-white font-bold text-base gentle-animation"
          >
            Solicitar Orçamento
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.03 }}
            href="#servicos"
            className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 gentle-animation text-center"
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
              <p className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs md:text-sm text-white/60 mt-1.5 tracking-wide font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
