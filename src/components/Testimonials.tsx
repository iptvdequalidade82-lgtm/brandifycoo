import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Carlos M.", role: "Dono de Barbearia", text: "A Brandify transformou minha presença online. Depois do site novo, meus agendamentos triplicaram em dois meses!" },
  { name: "Dra. Amanda R.", role: "Dentista", text: "Profissionalismo do início ao fim. O site ficou exatamente como eu imaginava e meus pacientes elogiam muito." },
  { name: "Rafael S.", role: "Empresário", text: "Rápidos, criativos e atenciosos. Meu site ficou incrível e já está me gerando novos leads todos os dias." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Testimonials() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            Resultados{" "}
            <span className="text-gradient">reais</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            O que nossos clientes dizem sobre o trabalho da Brandify.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="relative p-6 rounded-2xl glass gentle-animation"
            >
              <Quote className="text-white/5 absolute top-4 right-4" size={36} />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-white/50 text-white/50" />
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-6">"{t.text}"</p>
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-white/40">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
