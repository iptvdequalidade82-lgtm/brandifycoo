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
    <section id="preview" className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4"
          >
            Projetos{" "}
            <span className="text-gradient">em destaque</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
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
              className="group rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm border border-border/40 hover:border-primary/40 hover:shadow-[0_0_40px_hsl(250_100%_65%/0.12)] transition-all duration-500 gradient-border"
            >
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/60 border-b border-border/30">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(0_70%_55%)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(45_70%_55%)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(120_50%_45%)]" />
                </div>
                <div className="flex-1 mx-2">
                  <div className="bg-background/50 rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center truncate">
                    {site.label}
                  </div>
                </div>
                <ExternalLink size={13} className="text-muted-foreground group-hover:text-accent transition-colors duration-300" />
              </div>

              <div className="relative w-full aspect-[16/10] bg-secondary/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/40 z-10" />
                <img
                  src={`https://image.thum.io/get/width/800/crop/500/${site.url}`}
                  alt={`Preview - ${site.title}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="px-5 py-4 border-t border-border/30 bg-secondary/30 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{site.title}</span>
                <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors duration-300 flex items-center gap-1">
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
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold hover:scale-[1.04] neon-glow-sm transition-all duration-300"
          >
            Quero um site assim
          </a>
        </motion.div>
      </div>
    </section>
  );
}
