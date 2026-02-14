import { Check, Star, Info, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Essencial", price: "R$ 1.200", pricePrefix: "a partir de", desc: "Ideal para quem está começando e precisa de presença online.",
    features: ["Site de até 6 páginas", "Design responsivo", "Certificado SSL", "Auxílio no registro de domínio", "1h de manutenção mensal gratuita"],
    featured: false,
  },
  {
    name: "Profissional", price: "R$ 2.500", pricePrefix: "a partir de", desc: "Para negócios que querem se destacar com mais recursos.",
    features: ["Site de até 10 páginas", "Design personalizado premium", "SEO avançado", "Certificado SSL", "Auxílio no registro de domínio", "1h de manutenção mensal gratuita"],
    featured: true,
  },
  {
    name: "Premium", price: "R$ 4.500", pricePrefix: "a partir de", desc: "Solução completa para empresas que exigem o melhor.",
    features: ["Páginas ilimitadas", "Design exclusivo do zero", "SEO avançado + Blog", "Certificado SSL", "Auxílio no registro de domínio", "Painel administrativo", "Integrações personalizadas", "1h de manutenção mensal gratuita"],
    featured: false,
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function Pricing() {
  return (
    <section id="investimento" className="relative py-28 md:py-36 px-6 overflow-hidden bg-[hsl(200,18%,12%)] text-white">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(195,30%,35%/0.1)] blur-[150px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(205,25%,30%/0.07)] blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.06] text-white/70 text-xs font-medium tracking-widest uppercase mb-6"
          >
            <Sparkles size={14} />
            Investimento
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
          >
            Escolha o plano{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(190,35%,60%)] to-[hsl(210,30%,55%)]">ideal</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/50 max-w-xl mx-auto"
          >
            Sem surpresas. Preços transparentes para o seu negócio crescer.
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
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl overflow-hidden gentle-animation flex flex-col ${
                plan.featured
                  ? "bg-gradient-to-b from-[hsl(195,28%,30%)] to-[hsl(205,25%,22%)] shadow-[0_20px_60px_-15px_hsl(200,30%,25%/0.4)] md:scale-[1.06] z-10"
                  : "bg-white/[0.06] border border-white/10 backdrop-blur-sm hover:bg-white/[0.1]"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(190,35%,60%)] to-transparent" />
              )}

              <div className={`p-7 text-center border-b ${plan.featured ? "border-white/20" : "border-white/10"}`}>
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
                    <Star size={12} className="fill-current" />
                    Mais popular
                  </div>
                )}
                <h3 className="font-display text-lg font-black">{plan.name}</h3>
                <p className={`text-xs mt-1 mb-4 ${plan.featured ? "text-white/70" : "text-white/40"}`}>{plan.desc}</p>
                <p className={`text-[10px] uppercase tracking-wider mb-2 ${plan.featured ? "text-white/50" : "text-white/30"}`}>{plan.pricePrefix}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-black">{plan.price}</span>
                </div>
                <p className={`text-xs mt-1 ${plan.featured ? "text-white/50" : "text-white/30"}`}>valor único · pagamento via PIX</p>
              </div>

              <div className="p-7 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`mt-0.5 flex-shrink-0 ${plan.featured ? "text-[hsl(190,40%,65%)]" : "text-white/40"}`} size={16} strokeWidth={2.5} />
                      <span className={`text-sm ${plan.featured ? "text-white/90" : "text-white/70"}`}>{f}</span>
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
                      ? "bg-white text-[hsl(200,20%,18%)] shadow-lg"
                      : "border border-white/20 text-white hover:bg-white/10"
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
          className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-5 rounded-xl bg-white/[0.05] border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <Info className="text-white/50 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-bold text-white">Hospedagem e domínio são cobrados à parte</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                Hospedagem no 1º ano: <span className="text-white/70 font-medium">R$ 240,00</span> (inclui R$ 120 de instalação) &nbsp;·&nbsp; A partir do 2º ano: <span className="text-white/70 font-medium">R$ 120,00/ano</span>
              </p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                Domínio: <span className="text-white/70 font-medium">a partir de R$ 40,00/ano</span> (valor pode variar conforme o domínio escolhido)
              </p>
              <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                Tudo é configurado na conta do próprio cliente. Na primeira vez, cuidamos de toda a instalação. Nas renovações seguintes, o cliente assume o pagamento diretamente.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
