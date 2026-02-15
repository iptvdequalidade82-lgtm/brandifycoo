import post1 from "@/assets/post-1.jpg";
import post2 from "@/assets/post-2.jpg";
import post3 from "@/assets/post-3.jpg";
import post4 from "@/assets/post-4.jpg";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";

const posts = [
  { src: post1, alt: "Sua loja vendendo mesmo quando você está dormindo" },
  { src: post2, alt: "Atrair clientes sem ter um site profissional é sabor faturamento" },
  { src: post3, alt: "Se o Instagram cair hoje, sua loja sobrevive?" },
  { src: post4, alt: "Site online - Criamos sites do futuro" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

export default function Gallery() {
  return (
    <section id="galeria" className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4"
          >
            Nosso{" "}
            <span className="text-gradient">conteúdo</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Acompanhe nossas dicas e insights sobre presença digital no Instagram.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {posts.map((post, i) => (
            <motion.a
              key={i}
              variants={item}
              href="https://www.instagram.com/brandifycoo"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-card/40 border border-border/40 hover:border-primary/40 transition-all duration-500"
            >
              <img
                src={post.src}
                alt={post.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4">
                <Instagram className="text-accent mb-2" size={24} />
                <span className="text-xs text-foreground/80 font-medium">Ver no Instagram</span>
              </div>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-10"
        >
          <a
            href="https://www.instagram.com/brandifycoo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/50 text-foreground font-semibold hover:bg-secondary/60 hover:border-primary/30 hover:scale-[1.03] transition-all duration-300 gradient-border"
          >
            <Instagram size={20} />
            Siga no Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
