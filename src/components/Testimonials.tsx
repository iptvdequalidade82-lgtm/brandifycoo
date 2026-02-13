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
    <section className="py-14 md:py-20 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.03),transparent_60%)] pointer-events-none" />
      <div className="container mx-auto max-w-5xl relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
        >
          O que nossos clientes dizem
        </motion.h2>

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
              className="relative p-6 rounded-2xl border border-border/60 bg-card/40 hover:border-primary/30 hover:bg-card/60 hover:-translate-y-1 transition-all duration-500"
            >
              <Quote className="text-primary/20 absolute top-4 right-4" size={32} />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
