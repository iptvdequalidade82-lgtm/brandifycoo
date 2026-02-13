import post1 from "@/assets/post-1.jpg";
import post2 from "@/assets/post-2.jpg";
import post3 from "@/assets/post-3.jpg";
import post4 from "@/assets/post-4.jpg";
import post5 from "@/assets/post-5.jpg";
import post6 from "@/assets/post-6.jpg";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";

const posts = [
  { src: post1, alt: "Vale a pena investir em um site institucional?" },
  { src: post2, alt: "Atrair clientes sem site profissional é sabor faturamento" },
  { src: post3, alt: "Seu negócio precisa de um site" },
  { src: post4, alt: "Pronto para decolar? Toda grande empresa possui um site" },
  { src: post5, alt: "Marketing digital não é sorte, é estratégia" },
  { src: post6, alt: "Como parar de atrair curiosos corretamente" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

export default function Gallery() {
  return (
    <section id="galeria" className="section-padding relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,hsl(var(--primary)/0.03),transparent_60%)] pointer-events-none" />
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            Nosso conteúdo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-xl mx-auto"
          >
            Acompanhe nossas dicas e insights sobre presença digital no Instagram.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {posts.map((post, i) => (
            <motion.a
              key={i}
              variants={item}
              href="https://www.instagram.com/brandifycoo"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[4/5] rounded-xl overflow-hidden glass border border-border/50 hover:border-primary/30 transition-all duration-500"
            >
              <img
                src={post.src}
                alt={post.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4">
                <Instagram className="text-primary mb-2" size={24} />
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary hover:scale-[1.03] transition-all duration-300"
          >
            <Instagram size={20} />
            Siga no Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
