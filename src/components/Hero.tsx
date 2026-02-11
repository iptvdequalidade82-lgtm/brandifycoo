import heroBg from "@/assets/hero-bg.jpg";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center section-padding overflow-hidden"
    >
      {/* Background */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto text-center max-w-4xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide mb-8 animate-fade-up">
          <Sparkles size={14} />
          Agência de Sites Profissionais
        </div>

        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Transformamos ideias em{" "}
          <span className="text-gradient">sites que vendem</span>
        </h1>

        <p
          className="text-muted-foreground text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Design moderno, responsivo e estratégico para lojas, clínicas, advocacias e muito mais.
          Seu próximo cliente está a um clique de distância.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:shadow-[0_0_30px_hsl(210_100%_60%/0.4)] transition-all duration-300"
          >
            Solicitar Orçamento
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#servicos"
            className="px-8 py-4 rounded-xl border border-border/80 text-foreground font-semibold hover:bg-secondary/60 transition-all duration-300 text-center"
          >
            Nossos Serviços
          </a>
        </div>

        {/* Stats */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-16 animate-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            { value: "50+", label: "Projetos entregues" },
            { value: "98%", label: "Clientes satisfeitos" },
            { value: "24h", label: "Tempo de resposta" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-gradient">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
