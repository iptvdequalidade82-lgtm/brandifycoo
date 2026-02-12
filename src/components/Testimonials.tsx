import { Star, Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Dono de Barbearia",
    text: "A Brandify transformou minha presença online. Depois do site novo, meus agendamentos triplicaram em dois meses!",
  },
  {
    name: "Dra. Amanda R.",
    role: "Dentista",
    text: "Profissionalismo do início ao fim. O site ficou exatamente como eu imaginava e meus pacientes elogiam muito.",
  },
  {
    name: "Rafael S.",
    role: "Empresário",
    text: "Rápidos, criativos e atenciosos. Meu site ficou incrível e já está me gerando novos leads todos os dias.",
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-14 md:py-20 px-6">
      <div ref={ref} className="container mx-auto max-w-5xl">
        <h2
          className={`font-display text-3xl md:text-4xl font-bold text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          O que nossos clientes dizem
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`relative p-6 rounded-2xl border border-border/60 bg-card/40 hover:border-primary/30 hover:bg-card/60 hover:-translate-y-1 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: isVisible ? `${i * 150}ms` : "0ms" }}
            >
              <Quote className="text-primary/20 absolute top-4 right-4" size={32} />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
