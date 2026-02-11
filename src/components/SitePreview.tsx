import { ExternalLink } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const sites = [
  {
    url: "https://ericpimentel.lovable.app",
    label: "ericpimentel.lovable.app",
    title: "Site Institucional",
  },
  {
    url: "https://barber043.lovable.app/",
    label: "barber043.lovable.app",
    title: "Site para Barbearia",
  },
];

export default function SitePreview() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="preview" className="section-padding">
      <div ref={ref} className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2
            className={`font-display text-3xl md:text-4xl font-bold transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Veja nossos projetos
          </h2>
          <p
            className={`text-muted-foreground mt-4 max-w-xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Clique para acessar os sites que já criamos para nossos clientes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sites.map((site, i) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group glass rounded-2xl overflow-hidden glow-border transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(210_100%_60%/0.1)] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: isVisible ? `${i * 150}ms` : "0ms" }}
            >
              {/* Browser bar */}
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

              {/* Screenshot via API */}
              <div className="relative w-full aspect-[16/10] bg-secondary/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30 z-10" />
                <img
                  src={`https://image.thum.io/get/width/800/crop/500/${site.url}`}
                  alt={`Preview - ${site.title}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Label */}
              <div className="px-5 py-4 border-t border-border bg-secondary/40 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{site.title}</span>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  Visitar <ExternalLink size={12} />
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://wa.me/5543991065129?text=Ol%C3%A1!%20Fiquei%20interessado%20nos%20servi%C3%A7os%20da%20Brandify%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            Quero um site assim
          </a>
        </div>
      </div>
    </section>
  );
}
