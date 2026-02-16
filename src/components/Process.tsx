import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Briefing", desc: "Entendemos sua marca, objetivos e público para criar a estratégia ideal." },
  { num: "02", title: "Design", desc: "Criamos layouts exclusivos alinhados à identidade visual do seu negócio." },
  { num: "03", title: "Desenvolvimento", desc: "Transformamos o design em código otimizado, responsivo e rápido." },
  { num: "04", title: "Entrega", desc: "Publicamos o site e garantimos que tudo funcione perfeitamente." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } } };

export default function Process() {
  return (
    <section id="processo" className="relative overflow-hidden py-28 md:py-36 bg-background">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto max-w-6xl px-6 relative">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-brand font-semibold tracking-widest uppercase text-sm mb-4"
          >
            Como trabalhamos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white"
          >
            Do conceito à{" "}
            <span className="text-white/40">realidade</span>
          </motion.h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step) => (
            <motion.div
              key={step.title}
              variants={item}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm h-full flex flex-col transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]">
                {/* Large number */}
                <span className="font-display text-6xl font-black text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500 leading-none mb-6">
                  {step.num}
                </span>

                {/* Glowing dot */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-brand shadow-[0_0_12px_hsl(var(--brand))] group-hover:shadow-[0_0_20px_hsl(var(--brand))] transition-shadow duration-500" />
                  <h3 className="font-display text-xl font-bold text-white tracking-tight">{step.title}</h3>
                </div>

                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/55 transition-colors duration-500">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
