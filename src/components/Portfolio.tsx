import { ShoppingBag, HeartPulse, Gavel, Building2, Utensils, GraduationCap, Dumbbell, Scissors } from "lucide-react";
import { motion } from "framer-motion";

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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 25 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function Portfolio() {
  return (
    <section id="portfolio" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4">
            Diversos{" "}
            <span className="text-gradient">segmentos</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Experiência comprovada nos mais variados nichos de mercado.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {segments.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                variants={item}
                className="group relative p-5 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/40 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(250_100%_65%/0.1)] transition-all duration-500 gradient-border"
              >
                <Icon className="text-primary mb-3 group-hover:text-accent group-hover:scale-110 transition-all duration-300" size={20} strokeWidth={1.8} />
                <h3 className="text-sm font-bold text-foreground mb-1">{s.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
