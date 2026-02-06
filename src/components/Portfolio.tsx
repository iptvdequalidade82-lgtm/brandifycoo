import { ShoppingBag, HeartPulse, Gavel, Building2, Utensils, GraduationCap, Dumbbell, Scissors, type LucideIcon } from "lucide-react";

const segments: { icon: LucideIcon; label: string }[] = [
  { icon: ShoppingBag, label: "Lojas & Comércios" },
  { icon: HeartPulse, label: "Clínicas & Saúde" },
  { icon: Gavel, label: "Advocacias" },
  { icon: Building2, label: "Empresas" },
  { icon: Utensils, label: "Restaurantes" },
  { icon: GraduationCap, label: "Educação" },
  { icon: Dumbbell, label: "Academias" },
  { icon: Scissors, label: "Beleza & Estética" },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-14 md:py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10">
          Atendemos diversos ramos
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {segments.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-border hover:border-primary/40 bg-secondary/30 hover:bg-secondary/60 transition-all duration-300 group"
              >
                <Icon className="text-primary group-hover:scale-110 transition-transform duration-300" size={20} strokeWidth={1.8} />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
