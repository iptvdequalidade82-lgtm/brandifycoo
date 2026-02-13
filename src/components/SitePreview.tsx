import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const sites = [
  { url: "https://ericpimentel.lovable.app", label: "ericpimentel.lovable.app", title: "Site Institucional" },
  { url: "https://barber043.lovable.app/", label: "barber043.lovable.app", title: "Site para Barbearia" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function SitePreview() {
  return (
    <section id="preview" className="section-padding relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.04),transparent_70%)] pointer-events-none" />
      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            Veja nossos projetos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-xl mx-auto"
          >
            Clique para acessar os sites que já criamos para nossos clientes.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 gap-6"
        >
          {sites.map((site) => (
            <motion.a
              key={site.url}
              variants={item}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-2xl overflow-hidden glow-border transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(210_100%_60%/0.1)]"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(0_70%_55%)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(45_70%_55%)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(120_50%_45%)]" />
                </div>
                <div className="flex-1 mx-2">
                  <div className="bg-background/60 rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center truncate">
                    {site.label}
                  </div>
                </div>
                <ExternalLink size={13} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="relative w-full aspect-[16/10] bg-secondary/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30 z-10" />
                <img
                  src={`https://image.thum.io/get/width/800/crop/500/${site.url}`}
                  alt={`Preview - ${site.title}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="px-5 py-4 border-t border-border bg-secondary/40 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{site.title}</span>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  Visitar <ExternalLink size={12} />
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 hover:scale-[1.03] transition-all duration-300"
          >
            Quero um site assim
          </a>
        </motion.div>
      </div>
    </section>
  );
}
