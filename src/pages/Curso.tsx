import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import cursoBanner from "@/assets/curso-banner.jpg";
import cursoLogo from "@/assets/curso-logo.png";
import dropMilionarioCover from "@/assets/drop-milionario-cover.webp";
import novaProfissaoCover from "@/assets/nova-profissao-cover.webp";
import novaProfissaoLogo from "@/assets/nova-profissao-logo.webp";
import { motion } from "framer-motion";
import { ExternalLink, Star, Users, Clock, CheckCircle } from "lucide-react";

const courses = [
  {
    title: "Drop Milionário",
    description:
      "Aprenda do zero a construir um negócio lucrativo com dropshipping. Estratégias validadas para faturar alto sem estoque próprio.",
    cover: dropMilionarioCover,
    features: [
      "Aulas práticas passo a passo",
      "Fornecedores validados",
      "Estratégias de tráfego pago",
      "Suporte exclusivo",
    ],
    link: "https://pay.cakto.com.br/j3nfmrj_323782?affiliate=QfzSc7Xx",
    tag: "Mais vendido",
  },
  {
    title: "Nova Profissão Digital",
    description:
      "Descubra como transformar suas habilidades em uma carreira digital de sucesso. Ideal para quem quer começar no mercado online.",
    cover: novaProfissaoCover,
    logo: novaProfissaoLogo,
    features: [
      "Criação de sites profissionais",
      "Marketing digital na prática",
      "Gestão de clientes",
      "Certificado de conclusão",
    ],
    link: "https://pay.kirvano.com/9ee0e4df-b093-4975-b0a8-48d863543762?aff=681f54e8-2253-45ed-a04a-523963130dea",
    tag: "Novo",
  },
];

const Curso = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${cursoBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            src={cursoLogo}
            alt="Brandify Cursos"
            className="h-16 w-16 rounded-full mx-auto mb-6 ring-2 ring-border"
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl md:text-5xl font-black mb-4"
          >
            Nossos Cursos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Aprenda com quem faz. Cursos práticos para transformar sua carreira
            digital.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Users size={16} /> +500 alunos
            </span>
            <span className="flex items-center gap-2">
              <Star size={16} /> 4.9/5 avaliação
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> Acesso vitalício
            </span>
          </motion.div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/20 gentle-animation"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.cover}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 gentle-animation"
                />
                <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-foreground text-background">
                  {course.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {course.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {course.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle size={14} className="text-foreground" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg bg-foreground text-background hover:opacity-90 gentle-animation"
                >
                  Saiba mais <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Curso;
