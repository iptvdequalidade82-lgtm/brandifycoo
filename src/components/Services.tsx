import { Globe, Smartphone, Search, Palette, ShieldCheck, Zap } from "lucide-react";

const services = [
  { icon: Globe, title: "Sites Institucionais", desc: "Presença digital profissional que transmite credibilidade e fortalece sua marca no mercado." },
  { icon: Smartphone, title: "Design Responsivo", desc: "Layouts que se adaptam perfeitamente a qualquer tela — celular, tablet ou desktop." },
  { icon: Search, title: "SEO Otimizado", desc: "Estratégias para posicionar seu site nas primeiras páginas do Google organicamente." },
  { icon: Palette, title: "Identidade Visual", desc: "Design alinhado à personalidade da sua marca, do logotipo às cores e tipografia." },
  { icon: ShieldCheck, title: "Segurança & SSL", desc: "Certificados de segurança para proteger os dados dos seus visitantes." },
  { icon: Zap, title: "Alta Performance", desc: "Sites rápidos e leves, otimizados para carregar em segundos." },
];

export default function Services() {
  return (
    <section id="servicos" className="py-14 md:py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          O que oferecemos
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="p-6 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/70 transition-all duration-300"
              >
                <Icon className="text-primary mb-4" size={22} strokeWidth={1.8} />
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
