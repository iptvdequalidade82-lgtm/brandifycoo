import { Globe, Smartphone, Search, Palette, ShieldCheck, Zap, type LucideIcon } from "lucide-react";

const services: { icon: LucideIcon; title: string; description: string; accent: string }[] = [
  {
    icon: Globe,
    title: "Sites Institucionais",
    description: "Apresente sua empresa com um site que transmite credibilidade e profissionalismo.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: Smartphone,
    title: "Design Responsivo",
    description: "Perfeito em qualquer tela — celular, tablet ou desktop.",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    icon: Search,
    title: "SEO Otimizado",
    description: "Seu site no topo do Google, atraindo clientes todos os dias.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: Palette,
    title: "Identidade Visual",
    description: "Design exclusivo que reflete a personalidade da sua marca.",
    accent: "from-pink-500 to-rose-600",
  },
  {
    icon: ShieldCheck,
    title: "Segurança & SSL",
    description: "Proteção total para você e seus visitantes navegarem tranquilos.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Alta Performance",
    description: "Velocidade extrema para não perder nenhum visitante.",
    accent: "from-cyan-500 to-sky-600",
  },
];

export default function Services() {
  return (
    <section id="servicos" className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
            Serviços
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            O que oferecemos
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="relative bg-background p-8 group hover:bg-secondary/30 transition-colors duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="text-white" size={20} strokeWidth={2} />
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                <span className="absolute top-6 right-6 font-display text-6xl font-bold text-foreground/[0.03] select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
