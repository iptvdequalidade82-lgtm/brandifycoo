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
    <section id="portfolio" className="section-padding relative overflow-hidden bg-background">
      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-foreground">
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
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group relative p-5 rounded-2xl bg-background border border-border gentle-animation hover:shadow-lg"
              >
                <Icon className="text-muted-foreground mb-3 group-hover:text-foreground group-hover:scale-110 gentle-animation" size={20} strokeWidth={1.8} />
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
