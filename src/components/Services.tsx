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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Services() {
  return (
    <section id="servicos" className="section-padding relative overflow-hidden bg-secondary">
      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-foreground">
            Tecnologia que{" "}
            <span className="text-gradient">transforma</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Soluções completas de desenvolvimento web com o que há de mais moderno no mercado.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative p-6 rounded-2xl bg-background border border-border gentle-animation hover:shadow-lg"
              >
                <div className="w-11 h-11 rounded-xl bg-[hsl(205,8%,93%)] flex items-center justify-center mb-5 group-hover:bg-[hsl(205,12%,25%)] gentle-animation">
                  <Icon className="text-[hsl(205,10%,45%)] group-hover:text-white gentle-animation" size={20} strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
