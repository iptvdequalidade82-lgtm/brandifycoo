import { ShoppingBag, HeartPulse, Gavel, Building2, Utensils, GraduationCap, Dumbbell, Scissors, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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
    <section id="portfolio" className="section-padding relative overflow-hidden text-white">
      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
            Sites para o seu{" "}
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">segmento</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Cada nicho tem um público diferente. Criamos o seu site pensando em quem você quer atrair.
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
                className="group relative p-5 rounded-2xl bg-white/[0.05] border border-white/10 gentle-animation hover:bg-white/[0.08] hover:border-white/20"
              >
                <Icon className="text-brand-accent mb-3 group-hover:scale-110 gentle-animation" size={20} strokeWidth={1.8} />
                <h3 className="text-sm font-bold text-white mb-1">{s.label}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 gentle-animation"
          >
            Ver projetos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
