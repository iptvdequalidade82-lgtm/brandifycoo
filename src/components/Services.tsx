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
    <section id="servicos" className="section-padding relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4">
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
                className="group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/40 hover:border-primary/40 hover:shadow-[0_0_40px_hsl(250_100%_65%/0.12)] hover:-translate-y-1.5 transition-all duration-500 gradient-border"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-5 group-hover:from-primary/25 group-hover:to-accent/15 transition-all duration-500">
                  <Icon className="text-primary group-hover:text-accent transition-colors duration-500" size={20} strokeWidth={1.8} />
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
