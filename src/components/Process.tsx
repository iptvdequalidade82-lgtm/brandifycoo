import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import StaggeredReveal from "@/components/StaggeredReveal";
import lunarMountainBg from "@/assets/lunar-mountain-bg.jpg";
import { Lightbulb, Palette, Code2, Rocket } from "lucide-react";

const steps = [
  { num: "01", title: "Briefing", desc: "Entendemos sua marca, objetivos e público para criar a estratégia ideal.", icon: Lightbulb },
  { num: "02", title: "Design", desc: "Criamos layouts exclusivos alinhados à identidade visual do seu negócio.", icon: Palette },
  { num: "03", title: "Desenvolvimento", desc: "Transformamos o design em código otimizado, responsivo e rápido.", icon: Code2 },
  { num: "04", title: "Entrega", desc: "Publicamos o site e garantimos que tudo funcione perfeitamente.", icon: Rocket },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } } };

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={sectionRef} id="processo" className="relative overflow-visible py-28 md:py-36 bg-black">
      {/* Lunar mountain background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.35] md:opacity-[0.15] pointer-events-none blur-[1px] md:blur-0"
        style={{
          backgroundImage: `url(${lunarMountainBg})`,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      />
      {/* Parallax grid pattern */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 opacity-[0.04]"
      >
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </motion.div>

      <div className="container mx-auto max-w-6xl px-6 relative">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-brand-accent font-semibold tracking-widest uppercase text-sm mb-4"
          >
            Como trabalhamos
          </motion.p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white">
            <StaggeredReveal
              text="Do conceito à realidade"
              highlightWords={["realidade"]}
            />
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.title} variants={item}>
                <TiltCard className="h-full" tiltAmount={12}>
                  <motion.div
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative p-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm h-full flex flex-col transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06] active:bg-white/[0.08] active:border-brand-accent/30 group"
                  >
                    <span className="font-display text-6xl font-black text-white/[0.07] leading-none mb-6">
                      {step.num}
                    </span>

                    {/* Animated icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 + i * 0.15 }}
                      className="mb-4"
                    >
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        whileTap={{ rotate: -5, scale: 0.95 }}
                        className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center"
                      >
                        <Icon size={20} className="text-brand-accent" />
                      </motion.div>
                    </motion.div>

                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                        className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_12px_hsl(var(--brand-accent))]"
                      />
                      <h3 className="font-display text-xl font-bold text-white tracking-tight">{step.title}</h3>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                  </motion.div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
