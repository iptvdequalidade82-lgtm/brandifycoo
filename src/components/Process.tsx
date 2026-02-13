import { MessageSquare, Palette, Code2, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: MessageSquare, title: "Briefing", desc: "Entendemos sua marca, objetivos e público para criar a estratégia ideal." },
  { icon: Palette, title: "Design", desc: "Criamos layouts exclusivos alinhados à identidade visual do seu negócio." },
  { icon: Code2, title: "Desenvolvimento", desc: "Transformamos o design em código otimizado, responsivo e rápido." },
  { icon: Rocket, title: "Entrega", desc: "Publicamos o site e garantimos que tudo funcione perfeitamente." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Process() {
  return (
    <section id="processo" className="section-padding relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.03),transparent_70%)] pointer-events-none" />
      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            Como trabalhamos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-xl mx-auto"
          >
            Um processo simples e transparente do início ao fim.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="hidden lg:block absolute top-[52px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={item}
                className="relative p-6 rounded-2xl border border-border/50 bg-card/30 text-center transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(210_100%_60%/0.08)]"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                  <Icon className="text-primary" size={22} />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
