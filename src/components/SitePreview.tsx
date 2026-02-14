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
    <section id="preview" className="section-padding relative overflow-hidden bg-background">
      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-foreground"
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
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden border border-border bg-background gentle-animation hover:shadow-xl"
            >
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(0_70%_55%)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(45_70%_55%)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(120_50%_45%)]" />
                </div>
                <div className="flex-1 mx-2">
                  <div className="bg-background rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center truncate border border-border">
                    {site.label}
                  </div>
                </div>
                <ExternalLink size={13} className="text-muted-foreground group-hover:text-foreground gentle-animation" />
              </div>

              <div className="relative w-full aspect-[16/10] bg-secondary overflow-hidden">
                <img
                  src={`https://image.thum.io/get/width/800/crop/500/${site.url}`}
                  alt={`Preview - ${site.title}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="px-5 py-4 border-t border-border bg-secondary flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{site.title}</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground gentle-animation flex items-center gap-1">
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
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-xl bg-[hsl(200,20%,18%)] text-white font-bold gentle-animation"
          >
            Quero um site assim
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
