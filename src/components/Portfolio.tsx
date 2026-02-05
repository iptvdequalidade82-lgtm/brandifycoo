import { ShoppingBag, HeartPulse, Gavel, Building2, Utensils, GraduationCap, Dumbbell, Scissors, type LucideIcon } from "lucide-react";

const segments: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: ShoppingBag, label: "Lojas & Comércios", desc: "E-commerces e vitrines digitais" },
  { icon: HeartPulse, label: "Clínicas & Saúde", desc: "Médicos, dentistas e terapeutas" },
  { icon: Gavel, label: "Advocacias", desc: "Escritórios de advocacia" },
  { icon: Building2, label: "Empresas", desc: "Corporativo e institucional" },
  { icon: Utensils, label: "Restaurantes", desc: "Cardápios e delivery online" },
  { icon: GraduationCap, label: "Educação", desc: "Escolas e cursos" },
  { icon: Dumbbell, label: "Academias", desc: "Fitness e personal trainers" },
  { icon: Scissors, label: "Beleza & Estética", desc: "Salões e clínicas estéticas" },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
            Segmentos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Atendemos diversos ramos
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Temos experiência criando sites para os mais variados segmentos de mercado.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {segments.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="glass rounded-xl p-6 text-center hover:glow-border transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:from-primary/30 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10">
                  <Icon className="text-primary" size={30} strokeWidth={1.6} />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">{s.label}</h3>
                <p className="text-muted-foreground text-xs">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
