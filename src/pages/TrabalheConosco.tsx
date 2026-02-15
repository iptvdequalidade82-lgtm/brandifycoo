import { MessageCircle, Code2, Palette, Megaphone, PenTool, Rocket, Users, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const roles = [
  { icon: Code2, title: "Desenvolvedor Web", desc: "HTML, CSS, React, e ferramentas no-code/low-code." },
  { icon: Palette, title: "Designer", desc: "UI/UX, identidade visual e criação de layouts." },
  { icon: Megaphone, title: "Social Media", desc: "Gestão de redes, criação de conteúdo e estratégia." },
  { icon: PenTool, title: "Copywriter", desc: "Textos persuasivos para sites, anúncios e landing pages." },
];

const benefits = [
  { icon: Rocket, label: "Trabalho 100% remoto" },
  { icon: Clock, label: "Horários flexíveis" },
  { icon: TrendingUp, label: "Crescimento profissional" },
  { icon: Users, label: "Equipe colaborativa" },
];

const steps = [
  { num: "01", title: "Mande mensagem", desc: "Entre em contato pelo WhatsApp e se apresente." },
  { num: "02", title: "Bate-papo", desc: "Conversamos para conhecer suas habilidades e objetivos." },
  { num: "03", title: "Teste prático", desc: "Um desafio rápido para ver você em ação." },
  { num: "04", title: "Bem-vindo ao time", desc: "Aprovado? Você já faz parte da Brandify!" },
];

export default function TrabalheConosco() {
  const rolesReveal = useScrollReveal();
  const benefitsReveal = useScrollReveal();
  const stepsReveal = useScrollReveal();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-6 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide mb-6 animate-fade-up">
            <Sparkles size={14} />
            Faça parte do time
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Trabalhe <span className="text-gradient">conosco</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Estamos sempre em busca de pessoas criativas e comprometidas para somar ao nosso time.
            Se você quer crescer no mercado digital, esse é o lugar certo.
          </p>

          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Gostaria%20de%20saber%20como%20fa%C3%A7o%20para%20trabalhar%20com%20voc%C3%AAs%20e%20agregar%20na%20empresa."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-300 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <MessageCircle size={18} />
            Quero me candidatar
          </a>
        </div>
      </section>

      {/* Perfis buscados */}
      <section className="py-14 md:py-20 px-6">
        <div ref={rolesReveal.ref} className="container mx-auto max-w-4xl">
          <h2
            className={`font-display text-2xl md:text-3xl font-bold text-center mb-10 transition-all duration-700 ${
              rolesReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Perfis que buscamos
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.title}
                  className={`group p-6 rounded-2xl border border-border bg-card hover:bg-card/70 hover:border-brand/20 transition-all duration-500 ${
                    rolesReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: rolesReveal.isVisible ? `${i * 120}ms` : "0ms" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center mb-4 group-hover:bg-brand/15 transition-colors">
                    <Icon className="text-brand-muted" size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-14 md:py-20 px-6">
        <div ref={benefitsReveal.ref} className="container mx-auto max-w-3xl">
          <h2
            className={`font-display text-2xl md:text-3xl font-bold text-center mb-10 transition-all duration-700 ${
              benefitsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Por que trabalhar na Brandify?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className={`flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-card transition-all duration-500 ${
                    benefitsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: benefitsReveal.isVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <Icon className="text-brand-muted mb-3" size={24} strokeWidth={1.6} />
                  <span className="text-sm font-medium text-foreground">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Processo */}
      <section className="py-14 md:py-20 px-6">
        <div ref={stepsReveal.ref} className="container mx-auto max-w-3xl">
          <h2
            className={`font-display text-2xl md:text-3xl font-bold text-center mb-10 transition-all duration-700 ${
              stepsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Como funciona o processo
          </h2>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`flex items-start gap-5 p-5 rounded-2xl border border-border bg-card transition-all duration-500 ${
                  stepsReveal.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: stepsReveal.isVisible ? `${i * 120}ms` : "0ms" }}
              >
                <span className="font-display text-2xl font-bold text-muted-foreground/40 shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA final */}
          <div className="text-center mt-14">
            <a
              href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Gostaria%20de%20saber%20como%20fa%C3%A7o%20para%20trabalhar%20com%20voc%C3%AAs%20e%20agregar%20na%20empresa."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-300"
            >
              <MessageCircle size={18} />
              Quero me candidatar
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
