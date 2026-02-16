import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";

export default function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted via property (not just attribute) - critical for iOS
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x5-playsinline', '');
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', 'true');

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently fail, interval will retry
        });
      }
    };

    // Try immediately
    attemptPlay();

    // Keep retrying every 500ms until playing
    const interval = setInterval(() => {
      if (video.paused) {
        attemptPlay();
      } else {
        clearInterval(interval);
      }
    }, 500);

    // Also try on any user interaction
    const events = ['touchstart', 'touchend', 'click', 'scroll'];
    const handleInteraction = () => {
      if (video.paused) {
        attemptPlay();
      }
      if (!video.paused) {
        events.forEach(e => document.removeEventListener(e, handleInteraction));
      }
    };
    events.forEach(e => document.addEventListener(e, handleInteraction, { once: true, passive: true }));

    return () => {
      clearInterval(interval);
      events.forEach(e => document.removeEventListener(e, handleInteraction));
    };
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-28 md:pt-0"
    >
      {/* Background Video */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: videoLoaded ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          // @ts-ignore - webkit attribute for iOS
          webkit-playsinline="true"
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero-bg-video.mp4"
        />
      </motion.div>

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
          <span className="text-white/70">futuro</span>
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
