import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contato" className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="glass rounded-2xl p-8 md:p-12 glow-border">
          <div className="text-center mb-10">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
              Contato
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Vamos criar o seu site?
            </h2>
            <p className="text-muted-foreground mt-4">
              Entre em contato e solicite um orçamento sem compromisso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition text-center"
            >
              <Phone className="text-primary" size={24} />
              <span className="text-sm font-medium">WhatsApp</span>
              <span className="text-muted-foreground text-xs">(00) 00000-0000</span>
            </a>
            <a
              href="mailto:contato@empresa.com"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition text-center"
            >
              <Mail className="text-primary" size={24} />
              <span className="text-sm font-medium">E-mail</span>
              <span className="text-muted-foreground text-xs">contato@empresa.com</span>
            </a>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 text-center">
              <MapPin className="text-primary" size={24} />
              <span className="text-sm font-medium">Localização</span>
              <span className="text-muted-foreground text-xs">Atendimento Online</span>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
