import heroBg from "@/assets/hero-bg.jpg";

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
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <div className="relative z-10 container mx-auto text-center max-w-3xl">
        <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4 animate-fade-up">
          Agência de Sites Profissionais
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Criamos o site ideal para o{" "}
          <span className="text-gradient">seu negócio</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Sites institucionais para lojas, clínicas, advocacias e muito mais.
          Design moderno, responsivo e pronto para converter visitantes em clientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <a
            href="#contato"
            className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition text-center"
          >
            Solicitar Orçamento
          </a>
          <a
            href="#servicos"
            className="px-8 py-3.5 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition text-center"
          >
            Nossos Serviços
          </a>
        </div>
      </div>
    </section>
  );
}
