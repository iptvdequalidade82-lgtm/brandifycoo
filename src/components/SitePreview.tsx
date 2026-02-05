import { ExternalLink } from "lucide-react";

export default function SitePreview() {
  return (
    <section id="preview" className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
            Portfólio
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Veja um dos nossos projetos
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Navegue pelo site abaixo como se estivesse acessando de verdade.
          </p>
        </div>

        {/* Browser frame */}
        <div className="glass rounded-2xl overflow-hidden glow-border animate-fade-in">
          {/* Browser top bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 mx-3">
              <div className="bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground text-center truncate">
                ericpimentel.lovable.app
              </div>
            </div>
            <a
              href="https://ericpimentel.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Abrir site em nova aba"
            >
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Iframe container */}
          <div className="relative w-full" style={{ height: "70vh" }}>
            <iframe
              src="https://ericpimentel.lovable.app"
              title="Preview do site Eric Pimentel"
              className="w-full h-full border-0"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="https://wa.me/5543991065129"
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
