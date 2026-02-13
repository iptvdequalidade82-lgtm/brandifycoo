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
    <section id="processo" className="section-padding relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4"
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
          <div className="hidden lg:block absolute top-[56px] left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={item}
                className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/40 text-center transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(250_100%_65%/0.1)] gradient-border"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold flex items-center justify-center shadow-[0_0_15px_hsl(250_100%_65%/0.3)]">
                  {i + 1}
                </div>
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-4 mt-2">
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
