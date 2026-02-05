import { Globe, Smartphone, Search, Palette, ShieldCheck, Zap, type LucideIcon } from "lucide-react";

const services: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Globe,
    title: "Sites Institucionais",
    description: "Sites profissionais para apresentar sua empresa, serviços e diferenciais de forma clara e atrativa.",
  },
  {
    icon: Smartphone,
    title: "Design Responsivo",
    description: "Seu site funcionando perfeitamente em celulares, tablets e computadores.",
  },
  {
    icon: Search,
    title: "SEO Otimizado",
    description: "Estratégias para que seu site apareça nos primeiros resultados do Google.",
  },
  {
    icon: Palette,
    title: "Identidade Visual",
    description: "Design personalizado que reflete a identidade e os valores da sua marca.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança & SSL",
    description: "Certificado de segurança e proteção de dados para seus visitantes.",
  },
  {
    icon: Zap,
    title: "Alta Performance",
    description: "Sites rápidos e otimizados para oferecer a melhor experiência ao usuário.",
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="glass rounded-xl p-7 hover:glow-border transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:from-primary/30 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10">
                  <Icon className="text-primary" size={26} strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
