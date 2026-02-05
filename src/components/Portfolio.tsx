import { Store, Stethoscope, Scale, Building2 } from "lucide-react";

const segments = [
  { icon: Store, label: "Lojas & Comércios" },
  { icon: Stethoscope, label: "Clínicas & Consultórios" },
  { icon: Scale, label: "Advocacias" },
  { icon: Building2, label: "Empresas em Geral" },
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {segments.map((s) => (
            <div
              key={s.label}
              className="glass rounded-xl p-8 text-center hover:glow-border transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition">
                <s.icon className="text-primary" size={28} />
              </div>
              <h3 className="font-display font-semibold">{s.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
