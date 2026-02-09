import { ShoppingBag, HeartPulse, Gavel, Building2, Utensils, GraduationCap, Dumbbell, Scissors } from "lucide-react";

const segments = [
  { icon: ShoppingBag, label: "Lojas & Comércios", desc: "E-commerces e vitrines digitais para vender mais." },
  { icon: HeartPulse, label: "Clínicas & Saúde", desc: "Sites para clínicas, consultórios e profissionais da saúde." },
  { icon: Gavel, label: "Advocacias", desc: "Presença digital sólida para escritórios de advocacia." },
  { icon: Building2, label: "Empresas", desc: "Sites corporativos que transmitem confiança." },
  { icon: Utensils, label: "Restaurantes", desc: "Cardápios digitais e páginas para delivery." },
  { icon: GraduationCap, label: "Educação", desc: "Plataformas para escolas, cursos e treinamentos." },
  { icon: Dumbbell, label: "Academias", desc: "Sites modernos para academias e personal trainers." },
  { icon: Scissors, label: "Beleza & Estética", desc: "Páginas para salões, barbearias e clínicas estéticas." },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-14 md:py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          Atendemos diversos ramos
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {segments.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="p-5 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/70 transition-all duration-300 group"
              >
                <Icon className="text-primary mb-3 group-hover:scale-110 transition-transform duration-300" size={20} strokeWidth={1.8} />
                <h3 className="text-sm font-semibold text-foreground mb-1">{s.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
