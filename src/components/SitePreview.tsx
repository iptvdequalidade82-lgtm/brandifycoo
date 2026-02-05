import { ExternalLink } from "lucide-react";

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
  return (
    <section id="preview" className="section-padding">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
            Portfólio
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Veja nossos projetos
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Navegue pelos sites abaixo como se estivesse acessando de verdade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sites.map((site) => (
            <div key={site.url} className="glass rounded-2xl overflow-hidden glow-border animate-fade-in">
              {/* Browser top bar */}
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
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Abrir site em nova aba"
                >
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Content */}
              <div className="relative w-full" style={{ height: "55vh" }}>
                <iframe
                  src={site.url}
                  title={`Preview - ${site.title}`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>

              {/* Label */}
              <div className="px-4 py-3 border-t border-border bg-secondary/40 text-center">
                <span className="text-sm font-semibold text-foreground">{site.title}</span>
              </div>
            </div>
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
