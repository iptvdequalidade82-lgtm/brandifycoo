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
    <section id="investimento" className="section-padding relative overflow-hidden bg-background">
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-foreground"
          >
            Investimento{" "}
            <span className="text-gradient">transparente</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
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
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl overflow-hidden gentle-animation flex flex-col ${
                plan.featured
                  ? "bg-foreground text-background shadow-2xl md:scale-[1.06]"
                  : "bg-background border border-border hover:shadow-lg"
              }`}
            >
              <div className={`p-7 text-center border-b ${plan.featured ? "border-background/10" : "border-border"}`}>
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/15 text-background text-xs font-medium mb-3">
                    <Star size={12} />
                    Mais popular
                  </div>
                )}
                <h3 className={`font-display text-lg font-black ${plan.featured ? "" : "text-foreground"}`}>{plan.name}</h3>
                <p className={`text-xs mt-1 mb-4 ${plan.featured ? "opacity-60" : "text-muted-foreground"}`}>{plan.desc}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`font-display text-4xl font-black ${plan.featured ? "" : "text-foreground"}`}>{plan.price}</span>
                </div>
                <p className={`text-xs mt-1 ${plan.featured ? "opacity-40" : "text-muted-foreground"}`}>valor único · pagamento via PIX</p>
              </div>

              <div className="p-7 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`mt-0.5 flex-shrink-0 ${plan.featured ? "opacity-60" : "text-muted-foreground"}`} size={16} strokeWidth={2.5} />
                      <span className={`text-sm ${plan.featured ? "opacity-90" : "text-secondary-foreground"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center px-6 py-3.5 rounded-xl font-bold gentle-animation ${
                    plan.featured
                      ? "bg-background text-foreground"
                      : "bg-foreground text-background"
                  }`}
                >
                  Solicitar Orçamento
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-5 rounded-xl bg-secondary border border-border"
        >
          <div className="flex items-start gap-3">
            <Info className="text-muted-foreground mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-bold text-foreground">Hospedagem e domínio são cobrados à parte</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Hospedagem no 1º ano: <span className="text-foreground font-medium">R$ 240,00</span> (inclui R$ 120 de instalação) &nbsp;·&nbsp; A partir do 2º ano: <span className="text-foreground font-medium">R$ 120,00/ano</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Domínio: <span className="text-foreground font-medium">a partir de R$ 50,00/ano</span> (valor pode variar conforme o domínio escolhido)
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Tudo é configurado na conta do próprio cliente. Na primeira vez, cuidamos de toda a instalação. Nas renovações seguintes, o cliente assume o pagamento diretamente.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
