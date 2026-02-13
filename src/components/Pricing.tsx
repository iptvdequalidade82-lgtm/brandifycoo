import { Check, Star, Info } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Essencial", price: "R$ 1.200", desc: "Ideal para quem está começando e precisa de presença online.",
    features: ["Site de até 3 páginas", "Design responsivo", "Certificado SSL", "Auxílio no registro de domínio", "1 ajuste mensal"],
    featured: false,
  },
  {
    name: "Profissional", price: "R$ 2.500", desc: "Para negócios que querem se destacar com mais recursos.",
    features: ["Site de até 6 páginas", "Design personalizado premium", "SEO avançado", "Certificado SSL", "Auxílio no registro de domínio", "1 ajuste mensal"],
    featured: true,
  },
  {
    name: "Premium", price: "R$ 4.500", desc: "Solução completa para empresas que exigem o melhor.",
    features: ["Site ilimitado de páginas", "Design exclusivo do zero", "SEO avançado + Blog", "Certificado SSL", "Auxílio no registro de domínio", "Painel administrativo", "Integrações personalizadas", "1 ajuste mensal"],
    featured: false,
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Pricing() {
  return (
    <section id="investimento" className="section-padding relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.04),transparent_70%)] pointer-events-none" />
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            Transparência desde o início
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-xl mx-auto"
          >
            Escolha o plano ideal para o seu negócio. Sem surpresas.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              className={`relative rounded-2xl border overflow-hidden transition-all duration-500 flex flex-col hover:-translate-y-1 ${
                plan.featured
                  ? "border-primary/60 bg-primary/[0.04] shadow-[0_0_40px_hsl(210_100%_60%/0.18)] md:scale-[1.06] ring-1 ring-primary/20"
                  : "border-border/60 bg-card/40 hover:border-primary/30"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              )}

              <div className="p-7 text-center border-b border-border/40">
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                    <Star size={12} />
                    Mais popular
                  </div>
                )}
                <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">{plan.desc}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-bold text-gradient">{plan.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">valor único</p>
              </div>

              <div className="p-7 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="text-primary mt-0.5 flex-shrink-0" size={16} strokeWidth={2.5} />
                      <span className="text-sm text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                <a
                  href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.03] ${
                    plan.featured
                      ? "bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(210_100%_60%/0.4)]"
                      : "border border-border/80 text-foreground hover:bg-secondary/60"
                  }`}
                >
                  Solicitar Orçamento
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-5 rounded-xl border border-border/50 bg-card/30"
        >
          <div className="flex items-start gap-3">
            <Info className="text-primary mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-semibold text-foreground">Hospedagem e domínio são cobrados à parte</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hospedagem: <span className="text-foreground font-medium">R$ 240,00/ano</span> &nbsp;·&nbsp; Domínio: <span className="text-foreground font-medium">a partir de R$ 49,90/ano</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
