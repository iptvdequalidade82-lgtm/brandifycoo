import { Globe, Smartphone, Search, Palette, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { icon: Globe, title: "Sites Institucionais", desc: "Presença digital profissional que transmite credibilidade e fortalece sua marca no mercado." },
  { icon: Smartphone, title: "Design Responsivo", desc: "Layouts que se adaptam perfeitamente a qualquer tela — celular, tablet ou desktop." },
  { icon: Search, title: "SEO Otimizado", desc: "Estratégias para posicionar seu site nas primeiras páginas do Google organicamente." },
  { icon: Palette, title: "Identidade Visual", desc: "Design alinhado à personalidade da sua marca, do logotipo às cores e tipografia." },
  { icon: ShieldCheck, title: "Segurança & SSL", desc: "Certificados de segurança para proteger os dados dos seus visitantes." },
  { icon: Zap, title: "Alta Performance", desc: "Sites rápidos e leves, otimizados para carregar em segundos." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Services() {
  return (
    <section id="servicos" className="py-14 md:py-20 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_70%)] pointer-events-none" />
      <div className="container mx-auto max-w-5xl relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
        >
          O que oferecemos
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                variants={item}
                className="group p-6 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/70 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(210_100%_60%/0.12)] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={20} strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
