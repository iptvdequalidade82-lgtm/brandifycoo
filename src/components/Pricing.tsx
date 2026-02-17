import { Check, Star, Info, Sparkles, ChevronDown, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import TiltCard from "@/components/TiltCard";
import earthMoonBg from "@/assets/earth-moon-bg.jpg";

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

const nuvemshopPlans = [
  {
    name: "Essencial", price: "R$ 69/mês", desc: "Para quem está começando a vender online",
    included: [
      "Atendimento por e-mail e messenger",
      "+30 meios de envio integrados",
      "+20 meios de pagamento integrados",
      "Apontamento de domínio próprio",
      "Acompanhamento via gráficos de desempenho da loja",
    ],
    notIncluded: [
      "Atendimento via WhatsApp",
      "Acesso ao código fonte (HTML/CSS)",
    ],
  },
  {
    name: "Impulso", price: "R$ 164/mês", desc: "Mais recursos e edição avançada do site",
    included: [
      "Todos os recursos do plano anterior",
      "Atendimento via WhatsApp",
      "Acesso ao código fonte (HTML/CSS)",
    ],
    notIncluded: [
      "Relatórios ilimitados",
      "Gestão e controle de usuários",
      "Edição de vendas",
      "Filtro de produtos na lista de vendas",
      "Campos personalizados de gestão",
      "Custos e comissões diferenciados",
    ],
  },
  {
    name: "Escala", price: "R$ 449/mês", desc: "Máxima personalização e ferramentas de gestão",
    included: [
      "Todos os recursos do plano anterior",
      "Relatórios ilimitados",
      "Edição de vendas",
      "Filtro de produtos na lista de vendas",
      "Campos personalizados de gestão",
      "Custos e comissões diferenciados",
    ],
    notIncluded: [],
  },
];

function NuvemshopPlans() {
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-white/40 font-medium mb-4">Planos Nuvemshop (mensais)</p>
      <div className="space-y-3">
        {nuvemshopPlans.map((p) => (
          <div key={p.name} className="rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden">
            <button
              onClick={() => setOpenPlan(openPlan === p.name ? null : p.name)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.03] gentle-animation"
            >
              <div>
                <span className="text-sm font-bold text-white">{p.name}</span>
                <p className="text-xs text-white/40 mt-0.5">{p.desc}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className="text-sm font-bold text-brand-accent">{p.price}</span>
                <ChevronDown
                  size={16}
                  className={`text-white/40 gentle-animation ${openPlan === p.name ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            <AnimatePresence>
              {openPlan === p.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-white/10">
                    <ul className="space-y-2 mt-2">
                      {p.included.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 flex-shrink-0 text-brand-accent" size={14} strokeWidth={2.5} />
                          <span className="text-xs text-white/70">{f}</span>
                        </li>
                      ))}
                      {p.notIncluded.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <X className="mt-0.5 flex-shrink-0 text-white/25" size={14} strokeWidth={2.5} />
                          <span className="text-xs text-white/35">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-4 leading-relaxed">
        O plano Nuvemshop é contratado na conta do próprio cliente (e-mail do cliente). Toda a configuração é feita por nós, mas a titularidade e renovação ficam sob responsabilidade do cliente.
      </p>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="investimento" className="relative py-28 md:py-36 px-6 overflow-visible bg-black text-white">
      {/* Moon background - larger and more visible on mobile */}
      <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden' }}>
        <div
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `url(${earthMoonBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.35,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage: `url(${earthMoonBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.22,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        />
      </div>
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-accent/10 blur-[150px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-accent-deep/7 blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
          >
            Invista no seu{" "}
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">negócio</span>
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
            >
              <TiltCard
                tiltAmount={plan.featured ? 8 : 12}
                className={`relative rounded-2xl overflow-hidden gentle-animation flex flex-col h-full ${
                  plan.featured
                    ? "bg-gradient-to-b from-[hsl(var(--brand-gradient-from))] to-[hsl(var(--brand-gradient-to))] shadow-[0_20px_60px_-15px_hsl(var(--brand-gradient-from)/0.4)] md:scale-[1.06] z-10"
                    : "bg-white/[0.06] border border-white/10 backdrop-blur-sm hover:bg-white/[0.1]"
                }`}
              >
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent" />
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
                <p className={`text-xs mt-1 ${plan.featured ? "text-white/50" : "text-white/30"}`}>Pagamento único · Consulte parcelamento</p>
              </div>

              <div className="p-7 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`mt-0.5 flex-shrink-0 ${plan.featured ? "text-brand-accent" : "text-white/40"}`} size={16} strokeWidth={2.5} />
                      <span className={`text-sm ${plan.featured ? "text-white/90" : "text-white/70"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={`https://wa.me/5543991065129?text=${encodeURIComponent(`Olá! Tenho interesse no plano ${plan.name} para criação de site.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center px-6 py-3.5 rounded-xl font-bold gentle-animation ${
                    plan.featured
                      ? "bg-white text-brand shadow-lg"
                      : "border border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  Solicitar Orçamento
                </motion.a>
                
                <Link
                  to={`/preview-site?plano=${plan.name.toLowerCase()}`}
                  className={`mt-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all p-4 rounded-xl border-2 group relative overflow-hidden shadow-sm ${
                    plan.featured 
                      ? "border-white/40 text-white bg-white/5 hover:bg-white/15 hover:shadow-lg hover:shadow-white/5" 
                      : "border-brand-accent/50 text-brand-accent bg-brand-accent/5 hover:bg-brand-accent/10 hover:shadow-xl hover:shadow-brand-accent/10"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                  <Sparkles size={14} className={`animate-pulse ${plan.featured ? "text-white/60" : "text-brand-accent/70"}`} />
                  <span>faça sua prévia grátis</span>
                </Link>
              </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Hosting note - above Nuvemshop, below cards */}
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

        {/* Nuvemshop Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 rounded-2xl overflow-hidden border border-brand-accent/20 bg-gradient-to-b from-brand-accent/[0.08] to-white/[0.04] backdrop-blur-sm"
        >
          <div className="p-7 md:p-10 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-black">Loja Virtual — Nuvemshop</h3>
                <p className="text-white/50 mt-2 max-w-lg">Loja online completa, configurada e pronta para vender. Ideal para quem quer entrar no e-commerce com estrutura profissional.</p>
              </div>
              <div className="text-left md:text-right flex-shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">a partir de</p>
                <span className="font-display text-4xl font-black">R$ 2.500</span>
                <p className="text-xs text-white/30 mt-1">Pagamento facilitado · Consulte parcelamento</p>
              </div>
            </div>
          </div>

          <div className="p-7 md:p-10 grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40 font-medium mb-4">O que está incluso</p>
              <ul className="space-y-3">
                {[
                  "Configuração de layout completa",
                  "Categorias organizadas",
                  "Banners inseridos (enviados pelo cliente)",
                  "20 produtos cadastrados inclusos",
                  "A cada 20 produtos adicionais: + R$ 200",
                  "Integração de estoque (se aplicável)",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 flex-shrink-0 text-brand-accent" size={16} strokeWidth={2.5} />
                    <span className="text-sm text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <NuvemshopPlans />
          </div>

          <div className="px-7 md:px-10 pb-7 md:pb-10 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`https://wa.me/5543991065129?text=${encodeURIComponent('Olá! Tenho interesse na Loja Virtual Nuvemshop.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[hsl(224,76%,33%)] to-[hsl(217,91%,53%)] text-white hover:opacity-90 gentle-animation shadow-lg shadow-brand-accent/20"
              >
                Solicitar Orçamento
              </motion.a>
            </div>
            
            <Link
              to="/preview-loja"
              className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all p-4 rounded-xl border-2 border-brand-accent/50 text-brand-accent bg-brand-accent/5 hover:bg-brand-accent/10 hover:shadow-xl hover:shadow-brand-accent/10 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
              <Eye size={14} className="text-brand-accent/70" />
              <span>prévia grátis da loja</span>
            </Link>

            <p className="text-xs text-white/30 leading-relaxed">
              <span className="text-white/50 font-medium">Domínio é cobrado à parte:</span> a partir de R$ 40,00/ano. O registro fica na conta do próprio cliente.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}