import { ShoppingBag, HeartPulse, Gavel, Building2, Utensils, GraduationCap, Dumbbell, Scissors, type LucideIcon } from "lucide-react";

const segments: { icon: LucideIcon; label: string; accent: string }[] = [
  { icon: ShoppingBag, label: "Lojas & Comércios", accent: "from-emerald-500 to-teal-600" },
  { icon: HeartPulse, label: "Clínicas & Saúde", accent: "from-rose-500 to-pink-600" },
  { icon: Gavel, label: "Advocacias", accent: "from-amber-500 to-orange-600" },
  { icon: Building2, label: "Empresas", accent: "from-blue-500 to-indigo-600" },
  { icon: Utensils, label: "Restaurantes", accent: "from-red-500 to-rose-600" },
  { icon: GraduationCap, label: "Educação", accent: "from-violet-500 to-purple-600" },
  { icon: Dumbbell, label: "Academias", accent: "from-cyan-500 to-sky-600" },
  { icon: Scissors, label: "Beleza & Estética", accent: "from-fuchsia-500 to-pink-600" },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
            Segmentos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Atendemos diversos ramos
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Experiência criando sites para os mais variados segmentos.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {segments.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full border border-border hover:border-primary/40 bg-secondary/40 hover:bg-secondary/70 transition-all duration-300 group cursor-default"
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${s.accent} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="text-white" size={16} strokeWidth={2.2} />
                </div>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
