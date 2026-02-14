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
    <section id="processo" className="section-padding relative overflow-hidden bg-secondary">
      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-foreground"
          >
            Do conceito à{" "}
            <span className="text-gradient">realidade</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Um processo transparente e eficiente em 4 etapas.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[56px] left-[12%] right-[12%] h-px bg-gradient-to-r from-border via-muted-foreground/30 to-border" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="relative p-6 rounded-2xl bg-background border border-border text-center gentle-animation hover:shadow-lg"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[hsl(205,12%,25%)] text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="w-12 h-12 mx-auto rounded-xl bg-[hsl(205,8%,93%)] flex items-center justify-center mb-4 mt-2">
                  <Icon className="text-[hsl(205,10%,45%)]" size={22} />
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
