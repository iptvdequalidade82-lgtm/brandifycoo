import post1 from "@/assets/post-1.jpg";
import post2 from "@/assets/post-2.jpg";
import post3 from "@/assets/post-3.jpg";
import post4 from "@/assets/post-4.jpg";
import { Instagram } from "lucide-react";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import StaggeredReveal from "@/components/StaggeredReveal";
import { useIsMobile } from "@/hooks/use-mobile";

const posts = [
  { src: post1, alt: "Sua loja vendendo mesmo quando você está dormindo" },
  { src: post2, alt: "Atrair clientes sem ter um site profissional é sabor faturamento" },
  { src: post3, alt: "Se o Instagram cair hoje, sua loja sobrevive?" },
  { src: post4, alt: "Site online - Criamos sites do futuro" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const blobY = useTransform(scrollYProgress, [0, 1], ["-20%", "40%"]);
  const isMobile = useIsMobile();

  return (
    <section ref={sectionRef} id="galeria" className="section-padding relative overflow-hidden bg-black text-white">
      <motion.div style={{ y: blobY }} className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">
            <StaggeredReveal
              text="Nosso conteúdo"
              highlightWords={["conteúdo"]}
            />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/50 max-w-xl mx-auto"
          >
            Acompanhe nossas dicas e insights sobre presença digital no Instagram.
          </motion.p>
        </div>

        {/* Mobile: horizontal swipe scroll */}
        {isMobile ? (
          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 pb-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {posts.map((post, i) => (
                <motion.a
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.instagram.com/brandifycoo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 flex-shrink-0"
                  style={{ width: "65vw", aspectRatio: "4/5" }}
                >
                  <img
                    src={post.src}
                    alt={post.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 flex flex-col items-center justify-end pb-4">
                    <Instagram className="text-white mb-2" size={24} />
                    <span className="text-xs text-white/80 font-medium">Ver no Instagram</span>
                  </div>
                </motion.a>
              ))}
            </div>
            <p className="text-center text-white/30 text-xs mt-3">← Deslize para ver mais →</p>
          </div>
        ) : (
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
                whileTap={{ scale: 0.95 }}
                href="https://www.instagram.com/brandifycoo"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-white/20 active:border-brand-accent/30 transition-all duration-500"
              >
                <img
                  src={post.src}
                  alt={post.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-active:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4">
                  <Instagram className="text-white mb-2" size={24} />
                  <span className="text-xs text-white/80 font-medium">Ver no Instagram</span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}

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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 hover:scale-[1.03] transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
          >
            <Instagram size={20} />
            Siga no Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
