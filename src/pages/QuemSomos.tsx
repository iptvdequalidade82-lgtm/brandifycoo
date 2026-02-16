import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { motion } from "framer-motion";
import { Users, Target, Lightbulb } from "lucide-react";

export default function QuemSomos() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-white">
              Quem <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-deep">Somos</span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              A Brandify é uma agência digital especializada em criação de sites profissionais, 
              identidade visual e soluções web que geram resultados reais para o seu negócio.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Target,
                title: "Nossa Missão",
                desc: "Transformar ideias em experiências digitais que conectam marcas ao seu público e impulsionam vendas.",
              },
              {
                icon: Lightbulb,
                title: "Nossa Visão",
                desc: "Ser referência em desenvolvimento web, entregando projetos que combinam design moderno com alta performance.",
              },
              {
                icon: Users,
                title: "Nossos Valores",
                desc: "Transparência, qualidade, compromisso com prazos e foco total na satisfação do cliente.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="p-6 rounded-2xl bg-white/[0.05] border border-white/10"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-accent/15 flex items-center justify-center mb-5">
                    <Icon className="text-brand-accent" size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <p className="text-white/50 max-w-2xl mx-auto leading-relaxed mb-8">
              Com foco em tecnologia de ponta, a Brandify oferece desde sites institucionais 
              até sistemas completos, sempre priorizando design responsivo, SEO otimizado e 
              segurança. Nosso compromisso é entregar mais do que um site — entregamos uma 
              presença digital que gera confiança e resultados.
            </p>
            <a
              href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20a%20Brandify."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-[hsl(224,76%,33%)] to-[hsl(217,91%,53%)] text-white font-semibold hover:opacity-90 transition-all"
            >
              Fale com a gente
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
