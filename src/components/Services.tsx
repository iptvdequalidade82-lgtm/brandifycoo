import { Globe, Smartphone, Search, Palette, ShieldCheck, Zap, type LucideIcon } from "lucide-react";

const services: { icon: LucideIcon; title: string }[] = [
  { icon: Globe, title: "Sites Institucionais" },
  { icon: Smartphone, title: "Design Responsivo" },
  { icon: Search, title: "SEO Otimizado" },
  { icon: Palette, title: "Identidade Visual" },
  { icon: ShieldCheck, title: "Segurança & SSL" },
  { icon: Zap, title: "Alta Performance" },
];

export default function Services() {
  return (
    <section id="servicos" className="py-14 md:py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10">
          O que oferecemos
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-border hover:border-primary/40 bg-secondary/40 hover:bg-secondary/70 transition-all duration-300"
              >
                <Icon className="text-primary" size={16} strokeWidth={2.2} />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
