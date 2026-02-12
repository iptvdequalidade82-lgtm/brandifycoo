import { MessageSquare, Palette, Code2, Rocket } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  {
    icon: MessageSquare,
    title: "Briefing",
    desc: "Entendemos sua marca, objetivos e público para criar a estratégia ideal.",
  },
  {
    icon: Palette,
    title: "Design",
    desc: "Criamos layouts exclusivos alinhados à identidade visual do seu negócio.",
  },
  {
    icon: Code2,
    title: "Desenvolvimento",
    desc: "Transformamos o design em código otimizado, responsivo e rápido.",
  },
  {
    icon: Rocket,
    title: "Entrega",
    desc: "Publicamos o site e garantimos que tudo funcione perfeitamente.",
  },
];

export default function Process() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="processo" className="section-padding">
      <div ref={ref} className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <h2
            className={`font-display text-3xl md:text-4xl font-bold transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Como trabalhamos
          </h2>
          <p
            className={`text-muted-foreground mt-4 max-w-xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Um processo simples e transparente do início ao fim.
          </p>
        </div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`relative p-6 rounded-2xl border border-border/50 bg-card/30 text-center transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(210_100%_60%/0.08)] ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: isVisible ? `${i * 120}ms` : "0ms" }}
              >
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>

                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                  <Icon className="text-primary" size={22} />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
